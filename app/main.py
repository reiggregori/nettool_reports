print("🔄 Carregando app/main.py")
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi.responses import HTMLResponse
from app.routers import ambientes, usuarios
from pathlib import Path
from app.routers import ambientes, usuarios, clients


BASE_DIR = Path(__file__).resolve().parent
# Mount static files from the top-level static directory
static_dir = BASE_DIR.parent / "static"

app = FastAPI(title="NetTool Pro Reports")

# Mount static files from the app/static directory
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Initialize Jinja2 templates
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Inclui os routers de Ambientes e Usuários
app.include_router(ambientes.router)
app.include_router(usuarios.router)
app.include_router(clients.router)

# Root route rendering index.html
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Permite rodar diretamente com: python app/main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        
        port=8000,
        reload=True
    )
