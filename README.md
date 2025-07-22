# Buy For Real

Buy For Real is a full-stack application that leverages object detection to identify products from user-uploaded images. Users can organize these images into groups, and the backend is powered by a Python-based object detection model.

## Features

- **Image Upload and Object Detection:** Upload images and have the system automatically detect and identify products within them.
- **Hierarchical Organization:** Organize your uploaded media into nested groups or folders for better management.
- **User Authentication:** Secure user authentication handled by Clerk.
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

### Backend

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (assumed)
- **Object Detection:** [Qwen model](https://huggingface.co/Qwen) (assumed from file names)
- **Dependency Management:** [Poetry](https://python-poetry.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm (or yarn/pnpm/bun)
- Python 3.8+ and Poetry
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
    npm install
    ```
    - Create a `.env.local` file in the `frontend` directory and add your environment variables (e.g., for Clerk, database connection).

3.  **Set up the Backend**
    ```sh
    cd ../backend
    poetry install
    ```
    - Create a `.env` file in the `backend` directory and add any necessary environment variables.

### Running the Application

1.  **Run the Frontend**
    ```sh
    cd frontend
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

2.  **Run the Backend**
    ```sh
    cd ../backend
    poetry run python run_api.py
    ```
    The backend API will be running on `http://localhost:8000` (or as configured).

## Project Structure

The project is organized into two main parts:

-   `frontend/`: Contains the Next.js application, including all UI components, pages, and tRPC client code.
-   `backend/`: Contains the Python-based backend, including the FastAPI application and the object detection model.

```
buy-for-real-qwen/
├── backend/            # Python backend
│   ├── api/            # FastAPI application
│   └── object_detection/ # Qwen object detection model
└── frontend/           # Next.js frontend
    ├── src/
    │   ├── app/        # Next.js pages
    │   ├── components/ # React components
    │   ├── db/         # Drizzle ORM schema
    │   └── trpc/       # tRPC server and client
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
