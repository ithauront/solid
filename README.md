# 🧱 API Solid

A robust and test-driven RESTful API built with Fastify, Prisma, and PostgreSQL, following SOLID principles and applying clean architecture.

## 🏋️ About the Project

This application simulates a check-in system for gym users, inspired by business models like Gympass. A user with an active pass can check in to partner gyms under specific conditions. These rules and behaviors are shaped by well-defined functional requirements, business rules, and non-functional requirements.

Through this project, I learned to model real-world constraints such as:

   Checking the distance between user and gym (geolocation).

   Limiting users to a single check-in per day.

   Validating a check-in within a time window (e.g., 20 minutes).

   Using roles and permissions (RBAC) to allow only admins to register gyms or validate check-ins.

All logic is decoupled and organized in use cases, repositories, and controllers, following domain-driven thinking. The project is fully covered with unit and E2E tests using Vitest and Supertest.

## 🚀 Features

   ✅ User registration & authentication (JWT + cookies)

   🏋️ Gym and check-in management

   🧪 Unit and E2E tests (Vitest + Supertest)

   🧱 Clean architecture and SOLID principles

   🔒 Environment-based configuration

   🗃️ PostgreSQL + Prisma ORM

   🐳 Docker setup for local development

   ⛑️ Zod for validation and error formatting

## ⚙️ Technologies

   Runtime: Node.js with Fastify

   Database: PostgreSQL

   ORM: Prisma

   Testing: Vitest + Supertest

   Validation: Zod

   Authentication: JWT + Cookies

   Containerization: Docker (for database)

## 🔁 Continuous Integration (CI)

* This project uses GitHub Actions to automatically run tests on every code push or pull request. Two workflows are defined:

    Unit Tests: executed on every push to validate all business rules in isolation

    End-to-End Tests: executed on pull requests, spinning up a PostgreSQL container via Docker and running integration tests against a real database

* The CI pipeline ensures:

    ✅ Code correctness and test coverage remain high

    ✅ Environment variables are validated before test execution

    ✅ A real PostgreSQL container is provisioned automatically during E2E tests

    ✅ Separation between unit and integration test phases for better performance and debugging


## 🧪 Running Tests

Unit tests:
```bash
npm run test
```

End-to-end tests:
```bash
npm run test:e2e
```

Watch mode:
```bash
npm run test:watch
```

## 📦 Running Locally
   Note: You’ll need Docker installed to run the PostgreSQL container.

Clone the repo:

```bash
git clone https://github.com/ithauront/solid.git
cd solid-api
```

Create a .env file from the example:
```bash
cp .env.example .env
```

Start the PostgreSQL container:
```bash
docker-compose up -d
```

Apply migrations:
```bash
npx prisma migrate dev
```

Start the dev server:
```bash
npm run dev
```

📝 Notes

  This project is not deployed in production. To explore it, please run locally using the steps above. Some of my other backends project are deployed.

📚 What I Learned

   * Functional Design & Business Logic:

        Defined and implemented real-world functional requirements.

        Mapped each requirement to one or more rules of business logic.

        Distinguished between functional requirements (what the app does), business rules (how and when), and non-functional requirements (security, scalability, pagination, etc).

   * Clean Architecture & SOLID:

        Applied principles of inversion of control and single responsibility.

        Organized code into isolated layers: useCases, repositories, controllers.

        Used factories and in-memory patterns to simplify testing.

   * Testing:

        Wrote unit tests for every critical business rule using an in-memory database.

        Implemented a full E2E testing environment with schema isolation using vitest-environment-prisma.

        Practiced Test-Driven Development (TDD).

   * Authentication & Authorization:

        Used JWT for stateless auth and refresh tokens stored in cookies.

        Implemented role-based access control (RBAC) to restrict admin-only features.

   * Geolocation & Validation:

        Validated user proximity to gym using latitude/longitude and haversine formula.

        Restricted time for check-in validation (only within 20 minutes).

   * Tooling & Developer Experience:

        Created meaningful test coverage reports.

        Used aliases and vite-tsconfig-paths to improve DX.

        Set up local PostgreSQL with Docker for easy development.

   * Continuous Integration with GitHub Actions:

        Set up CI pipelines to automatically run unit and E2E tests on every push or pull request.

        Used separate workflows for unit and integration tests to isolate environments and improve feedback time.

        Integrated Docker containers (PostgreSQL) into CI workflows to replicate production-like test environments.

        Configured environment variables dynamically within workflows to ensure secure and consistent test behavior.

        Validated that new code doesn’t break existing features before merging via automated test reports.


