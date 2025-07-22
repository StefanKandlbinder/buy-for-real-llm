# Object Detection API

FastAPI application for object detection using Qwen2.5-VL model.

## Features

- Object detection in images using Qwen2.5-VL model
- RESTful API with automatic OpenAPI documentation
- File upload support for images
- Configurable detection parameters
- CORS support for frontend integration

## Installation

1. Install dependencies:

```bash
poetry install
```

2. Run the API:

```bash
python run_api.py
```

Or directly with uvicorn:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### GET /

Health check endpoint.

### GET /health

Health check endpoint.

### POST /objectdetection

Detect objects in an uploaded image.

**Parameters:**

- `file`: Image file (multipart/form-data)
- `prompt` (optional): Custom detection prompt
- `max_tokens` (optional): Maximum tokens to generate (default: 1000)
- `temperature` (optional): Sampling temperature (default: 0.7)

**Response:**

```json
{
  "success": true,
  "objects": [
    {
      "object": "person",
      "bbox_2d": [100, 150, 300, 400]
    }
  ],
  "response_text": "Raw model response",
  "error_message": null
}
```

## Usage Examples

### Using curl:

```bash
curl -X POST "http://localhost:8000/objectdetection" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg" \
  -F "prompt=Detect all objects in this image"
```

### Using Python requests:

```python
import requests

url = "http://localhost:8000/objectdetection"
files = {"file": open("image.jpg", "rb")}
data = {"prompt": "Detect all objects in this image"}

response = requests.post(url, files=files, data=data)
result = response.json()
print(result)
```

## API Documentation

Once the server is running, visit:

- http://localhost:8000/docs - Interactive API documentation (Swagger UI)
- http://localhost:8000/redoc - Alternative API documentation (ReDoc)

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "objects": null,
  "response_text": null,
  "error_message": "Error description"
}
```

Common error codes:

- `400`: Invalid image file or parameters
- `500`: Internal server error during processing
