"""
Qwen2.5-VL object detection script using MLX and Hugging Face models.
https://pyimagesearch.com/2025/06/09/object-detection-and-visual-grounding-with-qwen-2-5/
"""

import argparse
from typing import Any, List, Dict, Optional
from mlx_vlm import load, generate, GenerationResult
from mlx_vlm.prompt_utils import apply_chat_template
from mlx_vlm.utils import load_config
from PIL import Image
from object_detection.utils.image_to_base64 import image_to_base64
from pydantic import BaseModel
import json
import re


class ObjectDetectionResult(BaseModel):
    """Result model for object detection."""

    success: bool
    objects: Optional[List[Dict[str, Any]]] = None
    response_text: Optional[str] = None
    error_message: Optional[str] = None


def run_object_detection(
    image: Image.Image,
    prompt: str = "detect all the objects like sunglasses, shirts, trousers or watches in the image",
    max_tokens: int = 1000,
    temperature: float = 0.1,
    model: str = "mlx-community/Qwen2.5-VL-7B-Instruct-4bit",
) -> ObjectDetectionResult:
    """
    Run object detection on an image using Qwen2.5-VL model.

    Args:
        image_path: Path to the input image file
        prompt: Text prompt for object detection
        max_tokens: Maximum number of tokens to generate
        temperature: Sampling temperature for generation
        model: Hugging Face model repository name

    Returns:
        ObjectDetectionResult: Detection results
    """

    print("Image", image.format, image.width, image.height)

    try:
        # Load model and processor
        print(f"[*] Loading model: {model}...")
        try:
            model_obj, processor = load(model)
            print("[+] Model loaded successfully.")
        except Exception as e:
            print(f"[!] Error loading model: {e}")
            return ObjectDetectionResult(
                success=False, error_message=f"Error loading model: {e}"
            )

        # Load and validate image
        # try:
        #     image = Image.open(image_path)
        # except FileNotFoundError:
        #     return ObjectDetectionResult(
        #         success=False, error_message=f"Image file not found: {image_path}"
        #     )
        # except Exception as e:
        #     return ObjectDetectionResult(
        #         success=False, error_message=f"Error opening image: {e}"
        #     )

        # Prepare messages
        messages: List[Dict[str, Any]] = [
            {
                "role": "system",
                "content": """
                    You are a helpful assistant to detect objects in images.
                    Detect all objects in the image and return their locations 
                    and labels in the form of coordinates.
                    Be as precise as possible.
                    If you are not sure about the object or its position return nothing.
                    Response format:
                    ```json
                    [{
                        "object": "object_name",
                        "bbox_2d": [xmin, ymin, xmax, ymax]
                    }, ...]
                    ```
                """,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image,
                    },
                    {"type": "text", "text": prompt},
                ],
            },
        ]

        # Generate prompt
        config = load_config(model)
        prompt_text: Any = apply_chat_template(processor, config, messages)

        # Generate response
        print("\n[*] Generating response...")
        try:
            response: GenerationResult = generate(
                model=model_obj,
                processor=processor,  # type: ignore
                prompt=prompt_text,
                max_tokens=max_tokens,
                temperature=temperature,
                verbose=True,
            )
        except Exception as e:
            print(f"[!] Error during generation: {e}")
            return ObjectDetectionResult(
                success=False, error_message=f"Error during generation: {e}"
            )

        print("\n\n--- Model Response ---")
        print(response)
        print("----------------------")

        # Parse response for JSON objects
        response_text = str(response)
        objects = parse_objects_from_response(response_text)

        return ObjectDetectionResult(
            success=True, objects=objects, response_text=response_text
        )

    except Exception as e:
        return ObjectDetectionResult(
            success=False, error_message=f"Error during object detection: {e}"
        )


def parse_objects_from_response(response_text: str) -> List[Dict[str, Any]]:
    """
    Parse objects from the model response.

    Args:
        response_text: Raw response text from the model

    Returns:
        List of detected objects with bounding boxes
    """
    try:
        # Try to find JSON in the response
        json_match = re.search(r"```json\s*(\[.*?\])\s*```", response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            return json.loads(json_str)

        # Try to find JSON without markdown
        json_match = re.search(r"\[.*?\]", response_text)
        if json_match:
            return json.loads(json_match.group(0))

        return []
    except (json.JSONDecodeError, AttributeError):
        return []


def main() -> None:
    # --- 1. Setup Argument Parser ---
    parser: argparse.ArgumentParser = argparse.ArgumentParser(
        description="Run Qwen2.5-VL model with MLX."
    )
    parser.add_argument(
        "--model",
        type=str,
        default="mlx-community/Qwen2.5-VL-7B-Instruct-4bit",
        help="The Hugging Face repository for the MLX model to use.",
    )
    parser.add_argument(
        "--image", type=str, required=True, help="Path to the input image file."
    )
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="The text prompt to ask the model about the image.",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=512,
        help="The maximum number of tokens to generate.",
    )
    parser.add_argument(
        "--temp",
        type=float,
        default=0.1,
        help="The sampling temperature for generation.",
    )

    args: argparse.Namespace = parser.parse_args()

    # --- 2. Load Model and Processor ---
    print(f"[*] Loading model: {args.model}...")
    try:
        model: Any
        processor: Any
        model, processor = load(args.model)
        print("[+] Model loaded successfully.")
    except Exception as e:
        print(f"[!] Error loading model: {e}")
        return

    try:
        image: Image.Image = Image.open(args.image)
    except FileNotFoundError:
        print(f"[!] Image file not found: {args.image}")
        return
    except Exception as e:
        print(f"[!] Error opening image: {e}")
        return

    messages: List[Dict[str, Any]] = [
        {
            "role": "system",
            "content": """
                You are a helpfull assistant to detect objects in images.
                Detect all objects in the image and return their locations 
                and labels in the form of coordinates.
                Be as precise as possible.
                If you are not sure about the object or its position return nothing.
                Response format:
                ```json
                [{
                    "object": "object_name",
                    "bbox_2d": [xmin, ymin, xmax, ymax]
                }, ...]
                ```
            """,
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "image": image,
                    # "image": f"data:image/png;base64,{image_to_base64(args.image, format='PNG')}",
                },
                {"type": "text", "text": args.prompt},
            ],
        },
    ]

    # print("#" * 100, messages)

    config: dict = load_config(args.model)
    prompt: Any = apply_chat_template(processor, config, messages)

    # print("#" * 100, image.format, image.width, image.height)

    # --- 4. Generate a Response ---
    print("\n[*] Generating response...")
    try:
        response: GenerationResult = generate(
            model=model,
            processor=processor,
            prompt=prompt,
            # image=image_to_base64(args.image, format="PNG"),
            max_tokens=1000,
            temperature=0.7,
            verbose=True,
        )
    except Exception as e:
        print(f"[!] Error during generation: {e}")
        return

    # --- 5. Print the Final Output ---
    print("\n\n--- Model Response ---")
    print(response)
    print("----------------------")


if __name__ == "__main__":
    main()
