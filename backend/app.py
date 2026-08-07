from fastapi import FastAPI

from database import Base
from database import engine

app = FastAPI(
    title="TaskFlow",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "TaskFlow Backend Running"
    }