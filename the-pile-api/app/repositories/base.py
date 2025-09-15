"""
Base repository with common CRUD operations and query patterns.
"""
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Dict, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy.ext.declarative import DeclarativeMeta

# Type variable for model classes
ModelType = TypeVar("ModelType", bound=DeclarativeMeta)


class BaseRepository(Generic[ModelType], ABC):
    """
    Abstract base repository providing common CRUD operations.
    
    This follows the Repository pattern to:
    - Abstract database access logic
    - Provide consistent query interfaces
    - Enable easier testing with mocks
    - Centralize common database operations
    """
    
    def __init__(self, model: ModelType, db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records with pagination"""
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, obj_data: Dict[str, Any]) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def update(self, id: int, obj_data: Dict[str, Any]) -> Optional[ModelType]:
        """Update an existing record"""
        db_obj = self.get_by_id(id)
        if db_obj:
            for field, value in obj_data.items():
                setattr(db_obj, field, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: int) -> bool:
        """Delete a record by ID"""
        db_obj = self.get_by_id(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False
    
    def count(self) -> int:
        """Get total count of records"""
        return self.db.query(self.model).count()
    
    def exists(self, id: int) -> bool:
        """Check if record exists"""
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
    
    def get_query(self) -> Query:
        """Get base query for this model - useful for complex queries"""
        return self.db.query(self.model)
    
    @abstractmethod
    def get_by_user_id(self, user_id: int) -> List[ModelType]:
        """Get records by user ID - to be implemented by subclasses"""
        pass