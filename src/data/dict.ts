/* ============================================================
   Bilingual copy (EN / RU). All user-facing text lives here.
   Structural constants (tool names, hunter names, accents,
   hrefs) stay in their own data files — only text is localised.
   ============================================================ */

export type Lang = "en" | "ru";

export type StageText = {
  name: string;
  tagline: string;
  body: string;
  detail: string[];
};

export type Dict = {
  langLabel: string;
  comingSoon: string;

  nav: { items: { label: string; href: string }[]; launch: string };

  hero: {
    title1: string;
    title2: string;
    sub: string;
    cta1: string;
    cta2: string;
    scroll: string;
  };

  pipeline: {
    eyebrow: string;
    stages: StageText[];
    validateRows: { name: string; ok: boolean }[];
    confirmed: string;
    rejected: string;
    agent: string;
  };

  terminal: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    live: string;
    complete: string;
    pipeline: string;
  };

  why: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; desc: string; metric: string; metricLabel: string }[];
  };

  engine: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    roles: Record<string, string>;
  };

  comparison: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    cols: string[];
    capability: string;
    rows: { label: string; kryx: string; manual: string; scanner: string }[];
  };

  pricing: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    popular: string;
    cta: string;
    plans: {
      name: string;
      price: string;
      period: string;
      blurb: string;
      features: string[];
      featured?: boolean;
    }[];
  };

  finalCta: {
    title1: string;
    title2: string;
    sub: string;
  };

  waitlist: {
    placeholder: string;
    button: string;
    done: string;
    errorEmail: string;
    note: string;
    join: string;
  };

  footer: {
    tagline: string;
    cols: { platform: string; product: string; company: string };
    links: {
      launch: string;
      request: string;
      docs: string;
      github: string;
      status: string;
      security: string;
    };
    rights: string;
  };
};

const en: Dict = {
  langLabel: "EN",
  comingSoon: "coming soon",
  nav: {
    items: [
      { label: "Pipeline", href: "#pipeline" },
      { label: "Live Scan", href: "#terminal" },
      { label: "Why Kryx", href: "#why" },
      { label: "Engine", href: "#engine" },
      { label: "Pricing", href: "#pricing" },
    ],
    launch: "Launch App",
  },
  hero: {
    title1: "Think like the attacker.",
    title2: "Find it first.",
    sub: "Kryx is an autonomous swarm of penetration-testing agents. It drives real tools, adversarially validates every finding, and chains them into APT-grade attack paths — before a real adversary does.",
    cta1: "Request Access",
    cta2: "Watch Kryx Hunt",
    scroll: "scroll",
  },
  pipeline: {
    eyebrow: "The Pipeline",
    stages: [
      {
        name: "Recon",
        tagline: "Map the attack surface",
        body: "Kryx fingerprints everything reachable — DNS, WHOIS, live HTTP services and the full subdomain footprint — before a single probe is fired.",
        detail: ["DNS / WHOIS", "HTTP fingerprinting", "Subdomain discovery", "Surface graph"],
      },
      {
        name: "Hunt",
        tagline: "Eight hunters, in parallel",
        body: "A swarm of eight specialist agents attacks at once — each owning a class of weakness, each driving real tooling, not guessing.",
        detail: [],
      },
      {
        name: "Validate",
        tagline: "Adversarial proof, near-zero false positives",
        body: "An independent agent tries to disprove every finding. Anything it can't confirm is rejected — so what survives is real.",
        detail: [],
      },
      {
        name: "Chain Builder",
        tagline: "From findings to attack paths",
        body: "Isolated issues are assembled into APT-grade kill chains — the multi-step routes a real operator would actually take.",
        detail: ["Path synthesis", "Privilege escalation", "Lateral movement", "Impact modelling"],
      },
      {
        name: "Reporter",
        tagline: "A report your team can act on",
        body: "Everything resolves into a professional, evidence-backed pentest report in clean markdown — ready to ship to engineering.",
        detail: ["Executive summary", "Reproduction steps", "Severity & impact", "Markdown export"],
      },
    ],
    validateRows: [
      { name: "injection /v1/search", ok: true },
      { name: "cors wildcard + creds", ok: true },
      { name: "xss /profile", ok: false },
      { name: "config stack-trace leak", ok: true },
      { name: "cve outdated component", ok: false },
    ],
    confirmed: "confirmed",
    rejected: "rejected",
    agent: "agent",
  },
  terminal: {
    eyebrow: "Live Scan",
    title: "Watch the swarm",
    titleAccent: "hunt in real time.",
    intro: "A WebSocket stream from the engine — every tool invocation, every finding, every false positive culled. This is a demonstration capture; data is illustrative.",
    live: "live",
    complete: "complete",
    pipeline: "pipeline",
  },
  why: {
    eyebrow: "Why Kryx",
    title: "Not a scanner. Not a chatbot. An operator.",
    intro: "Four reasons security teams trust what Kryx surfaces — and act on it the same day.",
    items: [
      {
        title: "Adversarial validation",
        desc: "A second, independent agent attacks every finding and tries to disprove it. Only what survives the assault is reported — so triage stops being a tax.",
        metric: "≈ 0",
        metricLabel: "false positives",
      },
      {
        title: "Real tools, real exploitation",
        desc: "Kryx orchestrates nmap, nuclei, sqlmap, semgrep and more — driving them like an operator would. Not a model hallucinating a scanner it never ran.",
        metric: "10+",
        metricLabel: "integrated tools",
      },
      {
        title: "APT-grade attack chains",
        desc: "Individual weaknesses are stitched into the multi-step routes a real adversary would walk — privilege escalation, lateral movement, impact.",
        metric: "5",
        metricLabel: "stage pipeline",
      },
      {
        title: "An autonomous swarm",
        desc: "Eight specialist hunters work the target in parallel, coordinated by a central core. A fleet of operators — not a single prompt in a loop.",
        metric: "8",
        metricLabel: "parallel hunters",
      },
    ],
  },
  engine: {
    eyebrow: "The Engine",
    title: "Real tools.",
    titleAccent: "Under the hood.",
    intro: "Kryx is not an LLM wrapper. The swarm orchestrates the same battle-tested tooling a human operator reaches for — and reasons over the raw output.",
    roles: {
      nmap: "Port & service mapping",
      subfinder: "Passive subdomain discovery",
      "crt.sh": "Certificate transparency",
      whatweb: "Tech fingerprinting",
      Playwright: "JS-aware crawl & DOM",
      nuclei: "Templated CVE / exposure scanning",
      sqlmap: "Injection exploitation",
      "ssl audit": "TLS / cipher analysis",
      semgrep: "Source code SAST",
      gitleaks: "Secret scanning",
      "NVD API": "CVE intelligence",
    },
  },
  comparison: {
    eyebrow: "Comparison",
    title: "Where Kryx",
    titleAccent: "pulls ahead.",
    intro: "The speed of automation, the judgement of a human operator, and a false-positive rate that classic scanners can't touch.",
    cols: ["Kryx", "Manual pentest", "Classic scanners"],
    capability: "Capability",
    rows: [
      { label: "Time to first findings", kryx: "Minutes", manual: "Days–weeks", scanner: "Hours" },
      { label: "Coverage", kryx: "8 parallel hunters + chains", manual: "Limited by headcount", scanner: "Signature breadth only" },
      { label: "Autonomy", kryx: "Fully autonomous swarm", manual: "Fully manual", scanner: "Scheduled, no reasoning" },
      { label: "False positives", kryx: "Near-zero — adversarially validated", manual: "Low, but slow", scanner: "High — noise floods triage" },
      { label: "Attack chains", kryx: "APT-grade multi-step paths", manual: "Expert-dependent", scanner: "None — isolated CVEs" },
      { label: "Real exploitation", kryx: "Drives real tools", manual: "Yes", scanner: "Mostly passive checks" },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "From a single target to",
    titleAccent: "your whole estate.",
    intro: "Plans scale from one app to your full attack surface. Kryx is in private beta — request access and we'll match you to the right tier.",
    popular: "Most Popular",
    cta: "Request Access",
    plans: [
      {
        name: "Recon",
        price: "$99",
        period: "/mo",
        blurb: "Continuous surface mapping for a single target.",
        features: [
          "1 target · continuous recon",
          "Full attack-surface graph",
          "Weekly autonomous scans",
          "Markdown reports",
        ],
      },
      {
        name: "Operator",
        price: "$499",
        period: "/mo",
        blurb: "The full swarm against a growing estate.",
        featured: true,
        features: [
          "Up to 10 targets",
          "8-agent parallel hunt",
          "Adversarial validation",
          "APT-grade attack chains",
          "Real-time scan stream",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        blurb: "Unlimited scope, on your infrastructure.",
        features: [
          "Unlimited targets",
          "Self-hosted engine",
          "Custom hunter agents",
          "SSO, audit log, SLA",
          "Dedicated solutions team",
        ],
      },
    ],
  },
  finalCta: {
    title1: "Find it first.",
    title2: "Before they do.",
    sub: "Put an autonomous swarm of operators on your attack surface today. Request access to the Kryx private beta.",
  },
  waitlist: {
    placeholder: "you@company.com",
    button: "Request Access",
    done: "You're on the list. We'll reach out from kryx.io.",
    errorEmail: "Please enter a valid email address.",
    note: "Private beta · no spam · unsubscribe anytime",
    join: "Join the private beta",
  },
  footer: {
    tagline: "Think like the attacker. Find it first.",
    cols: { platform: "Platform", product: "Product", company: "Company" },
    links: {
      launch: "Launch App",
      request: "Request Access",
      docs: "Documentation",
      github: "GitHub",
      status: "Status",
      security: "Security",
    },
    rights: "Authorised security testing only.",
  },
};

const ru: Dict = {
  langLabel: "RU",
  comingSoon: "скоро",
  nav: {
    items: [
      { label: "Пайплайн", href: "#pipeline" },
      { label: "Живой скан", href: "#terminal" },
      { label: "Почему Kryx", href: "#why" },
      { label: "Движок", href: "#engine" },
      { label: "Тарифы", href: "#pricing" },
    ],
    launch: "Открыть App",
  },
  hero: {
    title1: "Думай как атакующий.",
    title2: "Найди первым.",
    sub: "Kryx — автономный рой пентест-агентов. Он управляет реальными инструментами, адверсариально проверяет каждую находку и собирает их в цепочки атак APT-уровня — раньше, чем это сделает настоящий противник.",
    cta1: "Запросить доступ",
    cta2: "Смотреть, как Kryx охотится",
    scroll: "листай",
  },
  pipeline: {
    eyebrow: "Пайплайн",
    stages: [
      {
        name: "Recon",
        tagline: "Картирование поверхности атаки",
        body: "Kryx снимает отпечатки со всего доступного — DNS, WHOIS, живые HTTP-сервисы и полную карту субдоменов — ещё до первого зонда.",
        detail: ["DNS / WHOIS", "Фингерпринт HTTP", "Поиск субдоменов", "Граф поверхности"],
      },
      {
        name: "Hunt",
        tagline: "Восемь хантеров параллельно",
        body: "Рой из восьми агентов-специалистов атакует одновременно — каждый отвечает за свой класс уязвимостей и работает реальными тулзами, а не догадками.",
        detail: [],
      },
      {
        name: "Validate",
        tagline: "Адверсариальная проверка, почти ноль ложных",
        body: "Независимый агент пытается опровергнуть каждую находку. Всё, что он не может подтвердить, отбраковывается — остаётся только реальное.",
        detail: [],
      },
      {
        name: "Chain Builder",
        tagline: "От находок к цепочкам атак",
        body: "Отдельные слабости собираются в kill-chain'ы APT-уровня — многошаговые маршруты, которыми реально пошёл бы оператор.",
        detail: ["Синтез маршрутов", "Эскалация привилегий", "Боковое перемещение", "Оценка ущерба"],
      },
      {
        name: "Reporter",
        tagline: "Отчёт, с которым команда может работать",
        body: "Всё сводится в профессиональный, подкреплённый доказательствами pentest-отчёт в чистом markdown — готовый для инженеров.",
        detail: ["Резюме для руководства", "Шаги воспроизведения", "Критичность и ущерб", "Экспорт в markdown"],
      },
    ],
    validateRows: [
      { name: "injection /v1/search", ok: true },
      { name: "cors wildcard + creds", ok: true },
      { name: "xss /profile", ok: false },
      { name: "config stack-trace leak", ok: true },
      { name: "cve outdated component", ok: false },
    ],
    confirmed: "подтверждено",
    rejected: "отбраковано",
    agent: "агент",
  },
  terminal: {
    eyebrow: "Живой скан",
    title: "Смотри, как рой",
    titleAccent: "охотится в реальном времени.",
    intro: "WebSocket-поток от движка — каждый вызов инструмента, каждая находка, каждый отсеянный ложный позитив. Это демонстрационная запись; данные иллюстративные.",
    live: "live",
    complete: "готово",
    pipeline: "пайплайн",
  },
  why: {
    eyebrow: "Почему Kryx",
    title: "Не сканер. Не чат-бот. Оператор.",
    intro: "Четыре причины, почему security-команды доверяют находкам Kryx — и действуют по ним в тот же день.",
    items: [
      {
        title: "Адверсариальная валидация",
        desc: "Второй, независимый агент атакует каждую находку и пытается её опровергнуть. В отчёт попадает только то, что выдержало атаку — триаж перестаёт быть налогом.",
        metric: "≈ 0",
        metricLabel: "ложных срабатываний",
      },
      {
        title: "Реальные тулзы, реальная эксплуатация",
        desc: "Kryx оркестрирует nmap, nuclei, sqlmap, semgrep и другие — управляя ими как оператор. Это не модель, галлюцинирующая сканер, который она не запускала.",
        metric: "10+",
        metricLabel: "интегрированных тулз",
      },
      {
        title: "Цепочки атак APT-уровня",
        desc: "Отдельные слабости сшиваются в многошаговые маршруты, которыми пошёл бы реальный противник — эскалация, боковое перемещение, ущерб.",
        metric: "5",
        metricLabel: "стадий пайплайна",
      },
      {
        title: "Автономный рой",
        desc: "Восемь хантеров-специалистов работают по цели параллельно, координируемые центральным ядром. Флот операторов — а не один промпт в цикле.",
        metric: "8",
        metricLabel: "параллельных хантеров",
      },
    ],
  },
  engine: {
    eyebrow: "Движок",
    title: "Реальные тулзы.",
    titleAccent: "Под капотом.",
    intro: "Kryx — не обёртка над LLM. Рой оркестрирует те же проверенные инструменты, к которым тянется живой оператор — и рассуждает над их сырым выводом.",
    roles: {
      nmap: "Карта портов и сервисов",
      subfinder: "Пассивный поиск субдоменов",
      "crt.sh": "Прозрачность сертификатов",
      whatweb: "Фингерпринт технологий",
      Playwright: "JS-краул и DOM",
      nuclei: "Сканер по шаблонам (CVE/экспозиции)",
      sqlmap: "Эксплуатация инъекций",
      "ssl audit": "Анализ TLS / шифров",
      semgrep: "SAST по исходному коду",
      gitleaks: "Поиск секретов",
      "NVD API": "Разведка по CVE",
    },
  },
  comparison: {
    eyebrow: "Сравнение",
    title: "Где Kryx",
    titleAccent: "вырывается вперёд.",
    intro: "Скорость автоматизации, суждение живого оператора и доля ложных срабатываний, недостижимая для классических сканеров.",
    cols: ["Kryx", "Ручной пентест", "Классические сканеры"],
    capability: "Возможность",
    rows: [
      { label: "Время до первых находок", kryx: "Минуты", manual: "Дни–недели", scanner: "Часы" },
      { label: "Охват", kryx: "8 параллельных хантеров + цепочки", manual: "Ограничен штатом", scanner: "Только ширина сигнатур" },
      { label: "Автономность", kryx: "Полностью автономный рой", manual: "Полностью вручную", scanner: "По расписанию, без рассуждений" },
      { label: "Ложные срабатывания", kryx: "Почти ноль — адверсариальная проверка", manual: "Мало, но медленно", scanner: "Много — шум топит триаж" },
      { label: "Цепочки атак", kryx: "Многошаговые маршруты APT-уровня", manual: "Зависит от эксперта", scanner: "Нет — разрозненные CVE" },
      { label: "Реальная эксплуатация", kryx: "Управляет реальными тулзами", manual: "Да", scanner: "В основном пассивные проверки" },
    ],
  },
  pricing: {
    eyebrow: "Тарифы",
    title: "От одной цели до",
    titleAccent: "всей инфраструктуры.",
    intro: "Тарифы масштабируются от одного приложения до всей поверхности атаки. Kryx в закрытой бете — запроси доступ, и мы подберём подходящий уровень.",
    popular: "Популярный",
    cta: "Запросить доступ",
    plans: [
      {
        name: "Recon",
        price: "$99",
        period: "/мес",
        blurb: "Непрерывное картирование одной цели.",
        features: [
          "1 цель · непрерывный recon",
          "Полный граф поверхности атаки",
          "Еженедельные автосканы",
          "Отчёты в markdown",
        ],
      },
      {
        name: "Operator",
        price: "$499",
        period: "/мес",
        blurb: "Полный рой против растущей инфраструктуры.",
        featured: true,
        features: [
          "До 10 целей",
          "8 агентов параллельно",
          "Адверсариальная валидация",
          "Цепочки атак APT-уровня",
          "Поток скана в реальном времени",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        blurb: "Безлимит, на твоей инфраструктуре.",
        features: [
          "Безлимит целей",
          "Self-hosted движок",
          "Кастомные агенты-хантеры",
          "SSO, аудит-лог, SLA",
          "Выделенная команда",
        ],
      },
    ],
  },
  finalCta: {
    title1: "Найди первым.",
    title2: "Раньше, чем они.",
    sub: "Поставь автономный рой операторов на свою поверхность атаки уже сегодня. Запроси доступ к закрытой бете Kryx.",
  },
  waitlist: {
    placeholder: "you@company.com",
    button: "Запросить доступ",
    done: "Ты в списке. Мы напишем с kryx.io.",
    errorEmail: "Введите корректный email.",
    note: "Закрытая бета · без спама · отписка в любой момент",
    join: "Вступить в закрытую бету",
  },
  footer: {
    tagline: "Думай как атакующий. Найди первым.",
    cols: { platform: "Платформа", product: "Продукт", company: "Компания" },
    links: {
      launch: "Открыть App",
      request: "Запросить доступ",
      docs: "Документация",
      github: "GitHub",
      status: "Статус",
      security: "Безопасность",
    },
    rights: "Только авторизованное тестирование на проникновение.",
  },
};

export const DICT: Record<Lang, Dict> = { en, ru };
