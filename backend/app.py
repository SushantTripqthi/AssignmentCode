from fastapi import FastAPI

from database import Base, engine

from models import User, Project, Task

from routers.user_router import router as user_router
from routers.project_router import router as project_router
from routers.task_router import router as task_router

app = FastAPI(
    title="TaskFlow API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(project_router)
app.include_router(task_router)


@app.get("/")
def home():
    return {
        "message": "TaskFlow Backend Running"
    }