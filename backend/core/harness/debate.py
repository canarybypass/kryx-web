"""
Kryx Adversarial Debate - visible attacker-vs-defender verification.

Replaces the single-pass validator with a live multi-turn debate: an attacker
argues the finding is real, a defender argues it's a false positive, a judge
rules. Each turn is emitted via the progress callback so the UI shows the
verification happening in real time.

Tool-confirmed findings (sweep/logic) skip the debate - they're already proven;
only LLM-reasoned findings are debated. Cheap and principled: proven by tool OR
proven in debate.
"""
import json
import asyncio
import logging

from utils.llm import get_llm
from core.agents.prompts import (
    DEBATE_ATTACKER_PROMPT, DEBATE_DEFENDER_PROMPT, DEBATE_JUDGE_PROMPT,
)

log = logging.getLogger(__name__)


class DebateStage:
    def __init__(self, target: str, findings: list, emit_cb=None, max_concurrent: int = 3):
        self.target = target
        self.findings = findings
        self.emit = emit_cb
        self.sem = asyncio.Semaphore(max_concurrent)

    async def run(self) -> list:
        results = await asyncio.gather(
            *[self._handle(f) for f in self.findings], return_exceptions=True)
        validated = []
        for i, r in enumerate(results):
            if isinstance(r, Exception):
                name = self.findings[i].get("name", "?") if i < len(self.findings) else "?"
                log.warning("[debate] exception for '%s': %s: %s", name, type(r).__name__, r)
            elif isinstance(r, dict):
                validated.append(r)
        return validated

    async def _handle(self, f: dict):
        # Tool-confirmed → no debate needed.
        if f.get("source") in ("sweep", "logic"):
            await self._turn(f, "system", "✓ Подтверждено инструментом - дебаты не требуются.")
            f["verified_by"] = "tool"
            return f
        async with self.sem:
            return await self._debate(f)

    async def _debate(self, f: dict):
        llm = get_llm()
        ctx = (f"Находка: {f.get('name')}\nseverity: {f.get('severity')}\n"
               f"evidence: {str(f.get('evidence', ''))[:500]}\n"
               f"описание: {str(f.get('description', ''))[:300]}")

        attack = await llm.ask(DEBATE_ATTACKER_PROMPT, ctx + "\n\nДокажи, что уязвимость реальна.", json_mode=False)
        await self._turn(f, "attacker", attack)

        defend = await llm.ask(DEBATE_DEFENDER_PROMPT, ctx + f"\n\nАтакующий заявил:\n{attack}\n\nОпровергни.", json_mode=False)
        await self._turn(f, "defender", defend)

        rebut = await llm.ask(DEBATE_ATTACKER_PROMPT, ctx + f"\n\nЗащитник возразил:\n{defend}\n\nКонтраргумент.", json_mode=False)
        await self._turn(f, "attacker", rebut)

        raw_ruling = await llm.ask(
            DEBATE_JUDGE_PROMPT,
            f"{ctx}\n\nАТАКУЮЩИЙ: {attack}\nЗАЩИТНИК: {defend}\nАТАКУЮЩИЙ (контр): {rebut}\n\nВердикт?")
        ruling = _parse_json(raw_ruling)

        if ruling is None:
            # Judge returned unparseable JSON - log and keep finding rather than
            # silently dropping a potentially real vulnerability.
            log.warning("[debate] judge returned unparseable JSON for '%s': %s",
                        f.get("name"), raw_ruling[:300])
            await self._turn(f, "judge", "PARSE_ERROR - сохраняем находку с низкой уверенностью")
            f["verified_by"] = "debate_parse_error"
            f["confidence"] = "low"
            return f

        verdict = ruling.get("verdict", "rejected")
        confidence = ruling.get("confidence", "")
        conf_label = f" [{confidence}]" if confidence else ""
        await self._turn(f, "judge", f"{verdict.upper()}{conf_label} - {ruling.get('reason', '')}")

        if verdict == "confirmed":
            f["verified_by"] = "debate"
            if confidence:
                f["confidence"] = confidence
            return f
        return None

    async def _turn(self, f: dict, role: str, text: str):
        if self.emit:
            await self.emit("debate", {"finding": f.get("name", "?"), "role": role, "text": text})


def _parse_json(text: str) -> dict | None:
    import re
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
    return None
