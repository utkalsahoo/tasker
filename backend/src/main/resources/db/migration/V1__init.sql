CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(120) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    priority VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    due_at TIMESTAMP,
    remind_at TIMESTAMP,
    repeat VARCHAR(16) NOT NULL,
    repeat_cron VARCHAR(120),
    alarm BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_due_at ON tasks(due_at);
CREATE INDEX idx_tasks_remind_at ON tasks(remind_at);
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority);

CREATE TABLE task_tags (
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY(task_id, tag)
);

CREATE TABLE alarm_sets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    time_utc TIMESTAMP NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE alarm_set_tasks (
    alarm_set_id BIGINT NOT NULL REFERENCES alarm_sets(id) ON DELETE CASCADE,
    task_id BIGINT NOT NULL,
    PRIMARY KEY(alarm_set_id, task_id)
);

CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    fcm_token VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    last_seen TIMESTAMP NOT NULL
);
