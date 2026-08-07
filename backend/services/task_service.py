from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.task_repository import TaskRepository

from repositories.project_repository import ProjectRepository

from schemas.task_schema import TaskCreate
from schemas.task_schema import TaskUpdate

from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search

from algorithms.comparison_counter import ComparisonCounter


class TaskService:

    @staticmethod
    def create_task(db: Session, task: TaskCreate):

        project = ProjectRepository.get_by_id(
            db,
            task.project_id
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return TaskRepository.create(db, task)

    # --------------------------------------------------
    # GET ALL TASKS
    # --------------------------------------------------

    @staticmethod
    def get_all_tasks(db: Session):

        return TaskRepository.get_all(db)

    # --------------------------------------------------
    # GET TASK BY ID
    # --------------------------------------------------

    @staticmethod
    def get_task(db: Session, task_id: int):

        task = TaskRepository.get_by_id(
            db,
            task_id
        )

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return task

    # --------------------------------------------------
    # UPDATE TASK
    # --------------------------------------------------

    @staticmethod
    def update_task(
        db: Session,
        task_id: int,
        task: TaskUpdate
    ):

        updated_task = TaskRepository.update(
            db,
            task_id,
            task
        )

        if not updated_task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return updated_task

    # --------------------------------------------------
    # DELETE TASK
    # --------------------------------------------------

    @staticmethod
    def delete_task(
        db: Session,
        task_id: int
    ):

        deleted_task = TaskRepository.delete(
            db,
            task_id
        )

        if not deleted_task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return {
            "message": "Task deleted successfully"
        }

    # ==================================================
    # ALGORITHM SECTION
    # ==================================================

    # --------------------------------------------------
    # INSERTION SORT
    # --------------------------------------------------

    @staticmethod
    def sort_tasks(
        db: Session,
        sort_by: str
    ):

        allowed_sort_fields = {
            "id",
            "title",
            "priority"
        }

        if sort_by not in allowed_sort_fields:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid sort field. "
                    "Allowed values: id, title, priority"
                )
            )

        tasks = TaskRepository.get_all(db)

        counter = ComparisonCounter()

        sorted_tasks = insertion_sort(
            tasks,
            sort_by,
            counter
        )

        return sorted_tasks

    # --------------------------------------------------
    # LINEAR SEARCH - TITLE
    # --------------------------------------------------

    @staticmethod
    def search_by_title(
        db: Session,
        title: str
    ):

        if not title.strip():

            raise HTTPException(
                status_code=400,
                detail="Search title cannot be blank."
            )

        tasks = TaskRepository.get_all(db)

        counter = ComparisonCounter()

        results = linear_search(
            tasks,
            "title",
            title,
            counter
        )

        return results

    # --------------------------------------------------
    # BINARY SEARCH - ID
    # --------------------------------------------------

    @staticmethod
    def search_by_id(
        db: Session,
        task_id: int
    ):

        tasks = TaskRepository.get_all(db)

        counter = ComparisonCounter()

        # Binary Search requires sorted input.
        sorted_tasks = insertion_sort(
            tasks,
            "id",
            counter
        )

        result = binary_search(
            sorted_tasks,
            "id",
            task_id,
            counter
        )

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return result