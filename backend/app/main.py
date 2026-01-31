from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tickets, riders
from app.database import init_db
from app.routers import webhooks_stripe
from app.routers import payment


app = FastAPI(
    title="RFF Backend",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

origins = [
    # vite dev
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "https://127.0.0.1:5173",

    "http://localhost:5174",
    "https://localhost:5174",
    "http://127.0.0.1:5174",
    "https://127.0.0.1:5174",

    # react dev
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
init_db()

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(payment.router)
app.include_router(webhooks_stripe.router)
app.include_router(riders.router)



@app.get("/")
async def root():
    return {"message": "Hello World"}
