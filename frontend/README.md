# Buy For Real - Frontend

This is the frontend for the "Buy For Real" application. It's a [Next.js](https://nextjs.org/) project using a [tRPC](https://trpc.io/) backend, a [PostgreSQL](https://www.postgresql.org/) database with [Drizzle ORM](https://orm.drizzle.team/), and [Clerk](https://clerk.com/) for authentication.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with Turbopack)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **API:** [tRPC](https://trpc.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **State Management:** [React Query](https://tanstack.com/query/v4)

## Project Structure

- `src/app`: Contains the main application pages and layouts.
- `src/components`: Contains reusable React components.
- `src/db`: Contains the Drizzle ORM schema and database connection.
- `src/trpc`: Contains the tRPC server and client implementation.
- `drizzle`: Contains the database migration files.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- A PostgreSQL database

### Installation & Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables, including your `DATABASE_URL` and Clerk credentials.

3.  **Run database migrations:**
    ```bash
    pnpm drizzle-kit generate:pg
    pnpm drizzle-kit push:pg
    ```

### Running the Development Server

To start the development server, run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev`: Starts the development server with Turbopack.
- `pnpm build`: Creates a production build of the application.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase using Next.js's ESLint configuration.