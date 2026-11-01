import os
import pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.routes import router
from db import init_db

app = FastAPI(title="Kryx API", version="0.4.0")

_origins_env = os.getenv("CORS_ORIGINS") or os.getenv("FRONTEND_URL") or "*"
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup():
    await init_db()


# Serve React app (includes landing + auth + dashboard) — must be after API routes
_build = pathlib.Path(__file__).parent.parent / "frontend" / "build"
if _build.exists():
    app.mount("/static", StaticFiles(directory=str(_build / "static")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        return FileResponse(str(_build / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
