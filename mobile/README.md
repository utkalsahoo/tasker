# Tasker Mobile

React Native application for Tasker daily task management with offline-first capabilities, advanced notifications, and background sync.

## Prerequisites

- Node.js 18+
- Yarn
- Xcode (macOS) for iOS builds
- Android Studio & SDK 33+
- Watchman (macOS)
- CocoaPods (`brew install cocoapods`)
- Firebase project configured for FCM (download `google-services.json` and `GoogleService-Info.plist` into native folders)

## Installation

```bash
yarn install
cd ios && pod install && cd ..
```

Create an `.env` file based on `.env.example` with the backend API URL.

## Running

```bash
yarn start
# In a separate terminal
yarn android
# or
yarn ios
```

## Notifications & Scheduling

- Push notifications are powered by Firebase Cloud Messaging via `@react-native-firebase/messaging`.
- Local reminders are scheduled using Notifee with exact alarms when available.
- Alarm sets use grouped notifications with action buttons for Complete/Snooze flows.

Headless JS handlers live under `src/services/notificationService.ts` and are wired to respond to notification actions.

## Offline-first

- Tasks are cached in SQLite (`src/db/tasksDb.ts`).
- Mutations performed while offline are queued in Redux and flushed via background sync hooks (`useProcessOfflineQueue`).

## Testing

```bash
yarn lint
yarn test
yarn typecheck
```

### Detox E2E

```bash
yarn detox build -c ios.sim.release
yarn detox test -c ios.sim.release
```

## Scripts

- `yarn sync-local-notifs`: reschedules reminders stored in local state (useful after reinstalling or clearing data).

## Folder Structure

- `src/screens` – screen components for each tab/stack
- `src/store` – Redux Toolkit slices, RTK Query API, persistence
- `src/services` – notification scheduling and integrations
- `src/db` – SQLite helpers
- `src/utils` – shared utilities (timezone handling)

## Environment Variables

- `API_URL` – Backend base URL

Store environment secrets securely in native projects before releasing to production.
