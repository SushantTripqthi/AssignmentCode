from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.task_repository import TaskRepository
from repositories.project_repository import ProjectRepository

from schemas.task_schema import TaskCreate
from schemas.task_schema import TaskUpdate


class TaskService:

    @staticmethod
    def create_task(db: Session, task: TaskCreate):

        project = ProjectRepository.get_by_id(db, task.project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return TaskRepository.create(db, task)

    @staticmethod
    def get_all_tasks(db: Session):
        return TaskRepository.get_all(db)

    @staticmethod
    def get_task(db: Session, task_id: int):

        task = TaskRepository.get_by_id(db, task_id)

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return task

    @staticmethod
    def update_task(
        db: Session,
        task_id: int,
        task: TaskUpdate
    ):

        updated = TaskRepository.update(
            db,
            task_id,
            task
        )

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return updated

    @staticmethod
    def delete_task(
        db: Session,
        task_id: int
    ):

        task = TaskRepository.delete(
            db,
            task_id
        )

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return {"message": "Task deleted successfully"}