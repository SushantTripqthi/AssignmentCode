from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.task_repository import TaskRepository
from repositories.project_repository import ProjectRepository
from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search
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
    
    @staticmethod
    def sort_tasks(db: Session, key: str):

       tasks = TaskRepository.get_all_tasks(db)

       return insertion_sort(tasks, key)
    
    @staticmethod
    def search_task_title(db: Session, title: str):

        tasks = TaskRepository.get_all_tasks(db)

        return linear_search(tasks, "title", title)
    
    @staticmethod
    def search_task_id(db: Session, task_id: int):

      tasks = TaskRepository.get_all_tasks(db)

      tasks = insertion_sort(tasks, "id")

      return binary_search(tasks, "id", task_id)