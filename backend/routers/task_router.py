from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db

from services.task_service import TaskService

from schemas.task_schema import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# ==================================================
# CREATE TASK
# ==================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=201
)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):

    return TaskService.create_task(
        db,
        task
    )


# ==================================================
# GET TASKS
#
# Normal:
# GET /tasks/
#
# Sorted:
# GET /tasks/?sort=priority
# ==================================================

@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    sort: str | None = None,
    db: Session = Depends(get_db)
):

    return TaskService.get_tasks_with_sort(
        db,
        sort
    )


# ==================================================
# SEARCH TASK
#
# Linear:
# GET /tasks/search?title=Backend&algo=linear
#
# Binary:
# GET /tasks/search?title=Backend&algo=binary
# ==================================================

@router.get(
    "/search",
    response_model=TaskResponse
)
def search_task(
    title: str | None = None,
    algo: str | None = None,
    db: Session = Depends(get_db)
):

    if title is None:

        raise HTTPException(
            status_code=400,
            detail="Provide title for search."
        )

    if algo is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Provide search algorithm. "
                "Use 'linear' or 'binary'."
            )
        )

    return TaskService.search_tasks(
        db,
        title,
        algo
    )


# ==================================================
# GET TASK BY ID
# ==================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    return TaskService.get_task(
        db,
        task_id
    )


# ==================================================
# UPDATE TASK
# ==================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db)
):

    return TaskService.update_task(
        db,
        task_id,
        task
    )


# ==================================================
# DELETE TASK
# ==================================================

@router.delete(
    "/{task_id}"
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    return TaskService.delete_task(
        db,
        task_id
    )