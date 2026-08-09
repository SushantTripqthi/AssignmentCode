from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator

from models.task_model import Priority
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    priority: Priority
    due_date: Optional[str] = None
    project_id: int

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):
        if not value.strip():
            raise ValueError("Title cannot be blank")
        return value


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[Priority] = None
    due_date: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    priority: Priority
    due_date: Optional[str]
    project_id: int

    model_config = ConfigDict(from_attributes=True)

class QuickAddRequest(BaseModel):
    """
    Request schema for AI Quick-Add.
    """

    description: str = Field(
        ...,
        min_length=1,
        description="Free-text task description"
    )

    project_id: int = Field(
        ...,
        description="Existing project ID"
    )