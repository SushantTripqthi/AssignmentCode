from sqlalchemy.orm import Session

from models.task_model import Task

from schemas.task_schema import TaskCreate
from schemas.task_schema import TaskUpdate


class TaskRepository:

    @staticmethod
    def create(db: Session, task: TaskCreate):

        db_task = Task(
            title=task.title,
            priority=task.priority,
            due_date=task.due_date,
            project_id=task.project_id
        )

        db.add(db_task)
        db.commit()
        db.refresh(db_task)

        return db_task

    @staticmethod
    def get_all(db: Session):
        return db.query(Task).all()

    @staticmethod
    def get_by_id(db: Session, task_id: int):
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def update(db: Session, task_id: int, task: TaskUpdate):

        db_task = db.query(Task).filter(Task.id == task_id).first()

        if not db_task:
            return None

        if task.title is not None:
            db_task.title = task.title

        if task.priority is not None:
            db_task.priority = task.priority

        if task.due_date is not None:
            db_task.due_date = task.due_date

        db.commit()
        db.refresh(db_task)

        return db_task

    @staticmethod
    def delete(db: Session, task_id: int):

        db_task = db.query(Task).filter(Task.id == task_id).first()

        if db_task:
            db.delete(db_task)
            db.commit()

        return db_task