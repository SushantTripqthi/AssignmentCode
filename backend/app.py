from fastapi import FastAPI

from database import Base, engine

# Import all models
from models import User, Project, Task

app = FastAPI(
    title="TaskFlow",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "TaskFlow Backend Running"}