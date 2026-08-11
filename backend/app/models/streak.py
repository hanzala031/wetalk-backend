from pydantic import BaseModel

class AddXpRequest(BaseModel):
    xpAmount: int
