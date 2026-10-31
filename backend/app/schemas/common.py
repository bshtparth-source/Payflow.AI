from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    version: str
    mode: str
    business: str


class MessageResponse(BaseModel):
    message: str
    success: bool = True
