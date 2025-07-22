"""
FastAPI application for object detection using Qwen2.5-VL model.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import tempfile
import os
from PIL import Image
import io

from object_detection.qwen import run_object_detection
from object_detection.utils.image_to_base64 import (
    ImageConversionRequest,
    ImageConversionResponse,
)


class ObjectDetectionRequest(BaseModel):
    """Request model for object detection."""

    prompt: str = "detect all the objects like sunglasses, shirts, trousers or watches in the image"
    max_tokens: int = 1000
    temperature: float = 0.7


class ObjectDetectionResponse(BaseModel):
    """Response model for object detection."""

    success: bool
    objects: Optional[List[Dict[str, Any]]] = None
    response_text: Optional[str] = None
    error_message: Optional[str] = None


app = FastAPI(
    title="Object Detection API",
    description="API for object detection using Qwen2.5-VL model",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Object Detection API is running"}


@app.post("/objectdetection", response_model=ObjectDetectionResponse)
async def detect_objects(
    file: UploadFile = File(...),
    request: ObjectDetectionRequest = ObjectDetectionRequest(),
):
    """
    Detect objects in an uploaded image.

    Args:
        file: The image file to analyze
        request: Object detection parameters

    Returns:
        ObjectDetectionResponse: Detection results
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and validate image
        image_data = await file.read()
        try:
            image = Image.open(io.BytesIO(image_data))
            image.verify()  # Verify it's a valid image
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

        # Save image to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(image_data)
            temp_image_path = tmp_file.name

        try:
            # Run object detection
            result = run_object_detection(
                image=image,
                prompt=request.prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )

            if result.success:
                return ObjectDetectionResponse(
                    success=True,
                    objects=result.objects,
                    response_text=result.response_text,
                )
            else:
                return ObjectDetectionResponse(
                    success=False, error_message=result.error_message
                )

        finally:
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)

    except HTTPException:
        raise
    except Exception as e:
        return ObjectDetectionResponse(
            success=False, error_message=f"Internal server error: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
