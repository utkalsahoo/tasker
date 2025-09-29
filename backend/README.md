# Tasker Backend

Spring Boot service powering Tasker mobile apps with JWT-secured APIs, PostgreSQL persistence, and Quartz-based scheduling.

## Requirements

- Java 17+
- Maven 3.9+
- PostgreSQL 15+

## Getting Started

```bash
./mvnw clean verify
./mvnw spring-boot:run
```

By default the service expects PostgreSQL running on `localhost:5432` with database `tasker`/`tasker`. Adjust `application.yml` or supply environment overrides.

### Docker Compose

```bash
docker-compose up --build
```

## API Overview

- `/api/auth/*` – register/login/refresh flows with JWT
- `/api/tasks` – CRUD, complete, snooze
- `/api/alarm-sets` – manage alarm bundles and trigger
- `/api/push/*` – device subscription + test push

OpenAPI docs available at `/swagger-ui/index.html` when running locally.

## Testing

```bash
./mvnw clean verify
```

Unit tests use Mockito; integration points for PostgreSQL and Quartz are covered by repository + service tests.

## Environment Variables

- `SPRING_DATASOURCE_URL` – JDBC connection string
- `JWT_SECRET` – HMAC secret for JWT signing
- `GOOGLE_APPLICATION_CREDENTIALS` – Service account JSON for Firebase Admin SDK

## Packaging

A production-ready Docker image can be built via `docker build -t tasker-backend .` or by using the provided Docker Compose stack.
