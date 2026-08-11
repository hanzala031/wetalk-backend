from pydantic import BaseModel

class CompleteStepRequest(BaseModel):
    lessonNumber: int
    stepName: str

class CompleteLessonRequest(BaseModel):
    lessonId: str
