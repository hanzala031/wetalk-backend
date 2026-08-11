import cloudinary
import cloudinary.uploader
from app.config import settings
from typing import Optional

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image_to_cloudinary(file_bytes: bytes, folder_path: str, public_id: Optional[str] = None) -> str:
    """
    Uploads file bytes directly to Cloudinary and returns the secure URL.
    Applies profile picture transformations: width=300, height=300, crop='fill',
    gravity='face', fetch_format='auto', quality='auto'.
    """
    options = {
        "folder": folder_path,
        "transformation": [
            {
                "width": 300,
                "height": 300,
                "crop": "fill",
                "gravity": "face",
                "fetch_format": "auto",
                "quality": "auto"
            }
        ]
    }
    if public_id:
        options["public_id"] = public_id

    # cloudinary.uploader.upload accepts bytes directly
    response = cloudinary.uploader.upload(file_bytes, **options)
    secure_url = response.get("secure_url")
    if not secure_url:
        raise ValueError("Failed to obtain secure_url from Cloudinary response")
    return secure_url
