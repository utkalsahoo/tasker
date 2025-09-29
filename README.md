# Tasker Monorepo

This repository contains a production-ready implementation of **Tasker**, a daily tasks platform consisting of a React Native mobile application and a Spring Boot backend service.

## Structure

```
/README.md              – high-level overview
/mobile                 – React Native application (Android & iOS)
/backend                – Spring Boot service
/docs                   – supplementary documentation (Postman, architecture)
```

Each subproject ships with its own README that documents prerequisites, setup, and workflows.

## Quick Start

### Backend

```bash
cd backend
./mvnw clean verify
./mvnw spring-boot:run
```

Alternatively, use Docker Compose for a full stack that includes PostgreSQL:

```bash
docker-compose up --build
```

### Mobile

Install dependencies and run the app on your preferred platform:

```bash
cd mobile
yarn install
yarn android # or yarn ios
```

Refer to the mobile README for end-to-end notification setup, Firebase configuration, and Detox testing.

## Continuous Integration

GitHub Actions workflows under `.github/workflows` provide linting, testing, and build pipelines for both projects. See each workflow file for details.

## Licensing

All code in this repository is provided as-is for demonstration purposes. Configure environment secrets and production Firebase credentials before shipping to end users.
