# Buy For Real

Buy For Real is a full-stack application designed to provide a foundation for building an object-detection-powered e-commerce platform. The frontend allows users to upload images and organize them into hierarchical groups. The backend provides a standalone object detection API using the Qwen-VL-Max model.

**Note:** The frontend and backend are not fully integrated. The image upload feature in the frontend does not currently trigger the object detection service in the backend.

## Features

- **Image Upload and Management:** Upload images and organize them into nested groups or folders.
- **Hierarchical Organization:** A flexible grouping system for managing media.
- **User Authentication:** Secure user authentication handled by Clerk.
- **Standalone Object Detection API:** A Python-based API that can identify products from an image.
- **Modern Tech Stack:** Built with Next.js for the frontend and a Python backend, ensuring a robust and scalable application.

## Tech Stack

### Frontend

- **Framework:** [Next.js](https://nextjs.org/)
- **API:** [tRPC](https://trpc.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/)
- **State Management:** [React Query](https://tanstack.com/query/v4)
- **File Storage:** [Pinata](https://www.pinata.cloud/)

### Backend

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Object Detection:** [Qwen-VL-Max](https://huggingface.co/Qwen/Qwen-VL-Max) via [MLX](https://github.com/ml-explore/mlx)
- **Dependency Management:** [Poetry](https://python-poetry.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and pnpm
- Python 3.10+ and Poetry
- PostgreSQL database

### Installation

1.  **Clone the repo**

    ```sh
    git clone https://github.com/your_username/buy-for-real-qwen.git
    cd buy-for-real-qwen
    ```

2.  **Set up the Frontend**

    ```sh
    cd frontend
    pnpm install
    ```

    - Create a `.env.local` file in the `frontend` directory and add your environment variables (e.g., for Clerk, database connection, Pinata). See `.env.example`.

3.  **Set up the Backend**
    ```sh
    cd ../backend
    poetry install
    ```
    - Create a `.env` file in the `backend` directory if you need to configure any environment variables for the backend.

### Running the Application

1.  **Run the Frontend**

    ```sh
    cd frontend
    pnpm run dev
    ```

    The frontend will be available at `http://localhost:3000`.

2.  **Run the Backend**
    ```sh
    cd ../backend
    poetry run python run_api.py
    ```
    The backend API will be running on `http://localhost:8000`.

## API Usage

The object detection API provides two endpoints for detecting objects in images:

### File Upload Endpoint: `/objectdetection`

Send a POST request with an image file:

```sh
curl -X POST -F "file=@/path/to/your/image.jpg" http://localhost:8000/objectdetection
```

Optional parameters:

- `prompt`: Custom detection prompt (default: "detect all the objects like sunglasses, shirts, trousers or watches in the image")
- `max_tokens`: Maximum tokens for response (default: 512)
- `temperature`: Sampling temperature (default: 0.1)

### Base64 Endpoint: `/objectdetection/base64`

Send a POST request with a JSON payload containing a base64 encoded image:

```sh
curl -X POST http://localhost:8000/objectdetection/base64 \
  -H "Content-Type: application/json" \
  -d "{
    \"image_base64\": \"$(cat jupyter/resized_image.b64)\",
    \"prompt\": \"detect all objects in the image\",
    \"max_tokens\": 1024,
    \"temperature\": 0.1
  }"

```

The `image_base64` field supports:

- Raw base64 strings: `iVBORw0KGgoAAAANSUhEUgAA...`
- Data URI format: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`

Both endpoints return a JSON response with detected objects and their bounding boxes:

```json
{
  "success": true,
  "objects": [
    {
      "object": "object_name",
      "bbox_2d": [xmin, ymin, xmax, ymax]
    }
  ],
  "response_text": "..."
}
```

## LM Studio API Usage

```sh
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"qwen/qwen3-vl-8b\",
    \"messages\": [
      {
        \"role\": \"system\",
        \"content\": \"You are a helpful assistant to detect objects in images. Follow the user's specific instructions for what objects to detect. Return a JSON array of objects, each with 'label' and 'bbox_2d' (normalized coordinates: [x_min, y_min, x_max, y_max], values from 0 to 1). Be as precise as possible. If you are not sure about the object or its position return nothing.\n\nResponse format:\n[{\n  \\\"object\\\": \\\"object_name\\\",\n  \\\"bbox_2d\\\": [xmin, ymin, xmax, ymax]\n}, ...]\"
      },
      {
        \"role\": \"user\",
        \"content\": [
          {
            \"type\": \"image_url\",
            \"image_url\": {
              \"url\": \"$(cat jupyter/resized_image.b64)\"
            }
          },
          {
            \"type\": \"text\",
            \"text\": \"detect all the objects in the image, return normalized bounding boxes in the range of 0 and 1.\"
          }
        ]
      }
    ],
    \"temperature\": 0.7,
    \"max_tokens\": -1,
    \"stream\": false
  }"
```

## Project Structure

The project is organized into two main parts:

- `frontend/`: Contains the Next.js application, including all UI components, pages, and tRPC client code.
- `backend/`: Contains the Python-based backend, including the FastAPI application and the object detection model.

```
buy-for-real-qwen/
├── backend/            # Python backend
│   ├── api/            # FastAPI application
│   └── object_detection/ # Qwen object detection model
└── frontend/           # Next.js frontend
    ├── src/
    │   ├── app/          # Next.js App Router (thin, delegates to features)
    │   ├── features/     # Domain modules (groups, products, advertisements, media)
    │   │   └── .../components, .../hooks
    │   ├── shared/       # Cross-feature components and hooks
    │   ├── components/ui # shadcn UI primitives
    │   ├── db/           # Drizzle ORM schema
    │   └── trpc/         # tRPC server and client
    └── public/
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
