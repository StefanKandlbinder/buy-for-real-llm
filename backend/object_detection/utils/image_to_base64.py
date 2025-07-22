from PIL import Image
import base64
from io import BytesIO
from pydantic import BaseModel, Field, field_validator
from typing import Union, Literal


class ImageConversionRequest(BaseModel):
    """Request model for image to base64 conversion."""

    image_path: str = Field(..., description="The path to the image file")
    format: Literal["JPEG", "PNG", "GIF", "BMP", "TIFF"] = Field(
        default="JPEG", description="The image format to save as"
    )

    @field_validator("image_path")
    def validate_image_path(cls, v):
        """Validate that the image path is not empty."""
        if not v or not v.strip():
            raise ValueError("Image path cannot be empty")
        return v.strip()


class ImageConversionResponse(BaseModel):
    """Response model for image to base64 conversion."""

    success: bool = Field(..., description="Whether the conversion was successful")
    base64_string: Union[str, None] = Field(
        default=None, description="The base64 encoded string (if successful)"
    )
    error_message: Union[str, None] = Field(
        default=None, description="Error message (if conversion failed)"
    )


def image_to_base64(image_path: str, format: str = "JPEG") -> str:
    """
    Converts an image to a base64 encoded string.

    Args:
        image_path (str): The path to the image file.
        format (str, optional): The image format to save as (e.g., "JPEG", "PNG"). Defaults to "JPEG".

    Returns:
        str: The base64 encoded string.
    """
    try:
        with Image.open(image_path) as img:
            buffered = BytesIO()
            img.save(buffered, format=format)
            img_str = base64.b64encode(buffered.getvalue())
            return img_str.decode("utf-8")  # Decode bytes to string
    except FileNotFoundError:
        return f"Error: Image file not found at {image_path}"
    except Exception as e:
        return f"Error: Could not convert image to base64: {e}"


def image_to_base64_validated(
    request: ImageConversionRequest,
) -> ImageConversionResponse:
    """
    Converts an image to a base64 encoded string with Pydantic validation.

    Args:
        request (ImageConversionRequest): The validated request containing image path and format.

    Returns:
        ImageConversionResponse: The response with success status and result or error.
    """
    try:
        with Image.open(request.image_path) as img:
            buffered = BytesIO()
            img.save(buffered, format=request.format)
            img_str = base64.b64encode(buffered.getvalue())
            base64_string = img_str.decode("utf-8")

            return ImageConversionResponse(
                success=True, base64_string=base64_string, error_message=None
            )
    except FileNotFoundError:
        return ImageConversionResponse(
            success=False,
            base64_string=None,
            error_message=f"Image file not found at {request.image_path}",
        )
    except Exception as e:
        return ImageConversionResponse(
            success=False,
            base64_string=None,
            error_message=f"Could not convert image to base64: {e}",
        )


# Example usage:
# image_path = "image.jpg"  # Replace with your image path
# try:
#     base64_string = image_to_base64(image_path)
#     print(
#         base64_string[:50] + "..."
#     )  # Print first 50 characters of the base64 string to avoid printing the full string.
# except FileNotFoundError:
#     print(f"Error: Image file not found at {image_path}")
# except Exception as e:
#     print(f"An error occurred: {e}")

# Example usage with Pydantic validation:
# request = ImageConversionRequest(image_path="image.jpg", format="PNG")
# response = image_to_base64_validated(request)
# if response.success:
#     print(f"Base64 string: {response.base64_string[:50]}...")
# else:
#     print(f"Error: {response.error_message}")
