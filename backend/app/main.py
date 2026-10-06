from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.api import health, auth, users, appointments, documents, mediator, principal, admin, notifications, dashboard, reports, verification

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Administrative Workflow & Digital Approval Engine for Educational Institutions",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation error",
            "errors": exc.errors()
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "A database operation error occurred.",
            "error_code": "DATABASE_ERROR"
        }
    )

# Routers Inclusion under /api prefix
api_router_prefix = settings.API_V1_STR

app.include_router(health.router, prefix=api_router_prefix)
app.include_router(auth.router, prefix=api_router_prefix)
app.include_router(users.router, prefix=api_router_prefix)
app.include_router(appointments.router, prefix=api_router_prefix)
app.include_router(documents.router, prefix=api_router_prefix)
app.include_router(mediator.router, prefix=api_router_prefix)
app.include_router(principal.router, prefix=api_router_prefix)
app.include_router(admin.router, prefix=api_router_prefix)
app.include_router(notifications.router, prefix=api_router_prefix)
app.include_router(dashboard.router, prefix=api_router_prefix)
app.include_router(reports.router, prefix=api_router_prefix)
app.include_router(verification.router, prefix=api_router_prefix)

@app.get("/")
def root():
    return {
        "message": "Niyojan Administrative API is online",
        "docs": "/docs",
        "health": f"{api_router_prefix}/health"
    }
