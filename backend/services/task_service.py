from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.task_repository import TaskRepository
from repositories.project_repository import ProjectRepository

from schemas.task_schema import TaskCreate, TaskUpdate

from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search


class TaskService:

    # ==================================================
    # CREATE TASK
    # ==================================================

    @staticmethod
    def create_task(
        db: Session,
        task: TaskCreate
    ):

        project = ProjectRepository.get_by_id(
            db,
            task.project_id
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return TaskRepository.create(
            db,
            task
        )

    # ==================================================
    # GET ALL TASKS
    # ==================================================

    @staticmethod
    def get_all_tasks(
        db: Session
    ):

        return TaskRepository.get_all(db)

    # ==================================================
    # GET TASK BY ID
    # ==================================================

    @staticmethod
    def get_task(
        db: Session,
        task_id: int
    ):

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

    # ==================================================
    # UPDATE TASK
    # ==================================================

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

    # ==================================================
    # DELETE TASK
    # ==================================================

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
    # CONVERT TASK TO DICTIONARY
    # ==================================================

    @staticmethod
    def _task_to_dict(task):

        priority = task.priority

        if hasattr(priority, "value"):
            priority = priority.value

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": priority,
            "due_date": task.due_date,
            "project_id": task.project_id
        }

    # ==================================================
    # GET TASKS WITH SORTING
    # ==================================================

    @staticmethod
    def get_tasks_with_sort(
        db: Session,
        sort: str | None = None
    ):

        tasks = TaskRepository.get_all(db)

        records = [
            TaskService._task_to_dict(task)
            for task in tasks
        ]

        # ----------------------------------------------
        # PDF requirement:
        # /tasks?sort=priority
        # ----------------------------------------------

        if sort is None:
            return records

        if sort != "priority":
            raise HTTPException(
                status_code=400,
                detail="Only sort=priority is supported."
            )

        # Custom Insertion Sort
        insertion_sort(
            records,
            "priority"
        )

        return records

    # ==================================================
    # SEARCH TASK
    # ==================================================

    @staticmethod
    def search_tasks(
        db: Session,
        title: str,
        algo: str
    ):

        # ----------------------------------------------
        # Validate title
        # ----------------------------------------------

        if not title or not title.strip():

            raise HTTPException(
                status_code=400,
                detail="Search title cannot be blank."
            )

        # ----------------------------------------------
        # Validate algorithm
        # ----------------------------------------------

        algo = algo.lower().strip()

        if algo not in {"linear", "binary"}:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid algorithm. "
                    "Use 'linear' or 'binary'."
                )
            )

        # ----------------------------------------------
        # Get tasks from database
        # ----------------------------------------------

        tasks = TaskRepository.get_all(db)

        # ----------------------------------------------
        # Convert ORM objects to dictionaries
        # ----------------------------------------------

        records = [
            TaskService._task_to_dict(task)
            for task in tasks
        ]

        # ==================================================
        # LINEAR SEARCH
        # ==================================================

        if algo == "linear":

            index = linear_search(
                records,
                title,
                "title"
            )

        # ==================================================
        # BINARY SEARCH
        # ==================================================

        else:

            # Binary Search requires sorted data.
            # First sort by title using our custom
            # Insertion Sort.

            insertion_sort(
                records,
                "title"
            )

            index = binary_search(
                records,
                title,
                "title"
            )

        # ----------------------------------------------
        # Task not found
        # ----------------------------------------------

        if index == -1:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        # ----------------------------------------------
        # Return matching task
        # ----------------------------------------------

        return records[index]