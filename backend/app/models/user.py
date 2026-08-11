from pydantic import BaseModel
from typing import Optional, Dict, Any

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    profileImage: Optional[str] = None
    learningGoal: Optional[str] = None
    targetLanguage: Optional[str] = None
    wtCoins: Optional[int] = None
    isProfileCompleted: Optional[bool] = None

class UploadImageRequest(BaseModel):
    base64Data: str

class SyncProgressRequest(BaseModel):
    progressData: Dict[str, Any]

class UpdateSettingsRequest(BaseModel):
    learningGoal: Optional[str] = None
    targetLanguage: Optional[str] = None
    notificationPrefs: Optional[Dict[str, Any]] = None
    privacySettings: Optional[Dict[str, Any]] = None
