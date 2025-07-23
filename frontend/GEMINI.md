This project is a Next.js application with a tRPC backend and a PostgreSQL database using Drizzle ORM.

**Key Technologies:**

- **Framework:** Next.js (with Turbopack)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **API:** tRPC
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Clerk
- **Schema Validation:** Zod
- **State Management:** React Query

**Project Structure:**

- `src/app`: Contains the main application pages and layouts.
- `src/components`: Contains reusable React components.
- `src/db`: Contains the Drizzle ORM schema and database connection.
- `src/trpc`: Contains the tRPC server and client implementation.
- `drizzle`: Contains the database migration files.

**Database Schema:**

- **groups:** Represents folders that can contain media and other groups, forming a hierarchical structure.
- **media:** Stores information about uploaded media (label, URL, description), with a relationship to a group.

**tRPC API:**

The tRPC API exposes the following routers:

- **groups:** Provides procedures for interacting with the `groups` table.
- **media:** Provides procedures for interacting with the `media` table.

**Scripts:**

- `dev`: Starts the development server with Turbopack.
- `build`: Creates a production build of the application.
- `start`: Starts the production server.
- `lint`: Lints the codebase using Next.js's ESLint configuration.
