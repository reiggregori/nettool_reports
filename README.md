# NetTool Pro Reports

Aplicativo web para geração de relatórios de ambientes e usuários
filtráveis por cliente, ambiente, aplicação e status.

## Tecnologias

- Python 3.9+
- FastAPI
- SQLAlchemy (asyncio)
- asyncpg
- Jinja2
- Uvicorn
- HTML, CSS e JavaScript (vanilla)

## Estrutura do Projeto

```
nettool_reports/
├── app/
│   ├── main.py            # ponto de entrada da aplicação
│   ├── routers/
│   │   ├── ambientes.py   # endpoints de ambientes
│   │   └── usuarios.py    # endpoints de usuários
│   ├── static/            # arquivos estáticos (CSS, JS)
│   └── templates/         # templates HTML
├── test_api.py            # script de teste automatizado dos endpoints
├── requirements.txt       # dependências do projeto
├── README.md              # este arquivo
└── .gitignore             # arquivos e pastas ignorados pelo Git
```

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/nettool_reports.git
   cd nettool_reports
   ```
2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Linux/macOS
   .venv\Scripts\activate      # Windows
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

## Execução

- Para iniciar a API:
  ```bash
  uvicorn app.main:app --reload
  ```
- Acesse a interface web em: `http://127.0.0.1:8000`

## Uso

- Os endpoints disponíveis estão sob `/reports/ambientes` e `/reports/usuarios`.
- A interface HTML em `templates/index.html` consome esses endpoints e
  permite filtrar e visualizar relatórios de forma interativa.

## Testes

- Para validar manualmente a API:
  ```bash
  python test_api.py
  ```
- Para rodar testes futuros, adicione scripts em `tests/` e execute com pytest.

## Contribuição

1. Abra uma _issue_ para descrever a melhoria ou bug.
2. Crie um _branch_ remoto para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. Faça _commit_ das alterações e envie:
   ```bash
   git commit -m "descrição da feature"
   git push origin feature/nome-da-feature
   ```
4. Abra um _pull request_ para revisão.

## Compartilhando no GitHub

Para compartilhar o projeto com a equipe de tecnologia e facilitar o deploy:

1. Crie um repositório vazio no GitHub (sem README, LICENSE ou .gitignore).
2. No diretório do projeto local, conecte-o ao repositório remoto:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/nettool_reports.git
   ```
3. Adicione e faça commit de todo o código:
   ```bash
   git add .
   git commit -m "Inicial: NetTool Pro Reports"
   ```
4. Envie para o GitHub:
   ```bash
   git push -u origin main
   ```
5. Compartilhe o link do repositório com a equipe.
