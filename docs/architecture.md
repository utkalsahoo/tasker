# Tasker Architecture

Tasker is delivered as a mono-repo containing a React Native mobile client and a Spring Boot backend. The system is designed for reliable task reminders with both push and local notification redundancy.

## Mobile

- **State**: Redux Toolkit + RTK Query with persistence to AsyncStorage for auth/offline queues.
- **Offline DB**: SQLite for caching tasks locally. Listener middleware mirrors server mutations to SQLite.
- **Scheduling**: Notifee schedules local reminders; background sync flushes queued mutations when network is restored.
- **Navigation**: React Navigation stack + tab pattern with Today, Scheduled, All Tasks, Alarm Sets, Settings screens.
- **Notifications**: FCM for push, Notifee for local alarms, deep links route to Task detail screens.

## Backend

- **Framework**: Spring Boot 3 with JWT Security.
- **Persistence**: PostgreSQL via Spring Data JPA; Flyway manages schema migrations.
- **Scheduling**: Quartz schedules reminders (`TaskReminderJob`) and alarm bundles (`AlarmSetJob`). Jobs fan out to NotificationService, which sends FCM pushes.
- **Auth**: JWT access tokens + rotating refresh tokens stored server-side.
- **API**: REST endpoints documented by SpringDoc OpenAPI.

## DevOps

- **CI**: GitHub Actions builds/test mobile + backend, runs Detox on macOS.
- **Docker**: Backend Dockerfile plus docker-compose stack with PostgreSQL.
- **Testing**: Jest + React Native Testing Library for mobile, Detox for E2E; JUnit/Mockito for backend.

## Data Flow

1. Mobile user creates/updates a task.
2. App performs optimistic update, stores to SQLite, and attempts server mutation.
3. Backend persists task, schedules Quartz job, and returns canonical representation.
4. Mobile listener persists the server response, reschedules Notifee trigger, ensuring offline reliability.
5. At remind time, Quartz job sends push; Notifee local trigger fires even if offline.
6. Notification actions (Complete/Snooze) call dedicated endpoints; background headless handler mirrors to server.
