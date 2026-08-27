# Деплой

Приложение — один Docker-образ (`Dockerfile`), которому нужна CockroachDB
(строка подключения в `DATABASE_URL`). Миграции применяются автоматически при
старте контейнера, пустая база сама наполняется контентом визитки.

## Вариант A — Render + CockroachDB Cloud (бесплатно, рекомендую)

Полностью совпадает со стеком проекта: managed CockroachDB + деплой из Dockerfile.

1. **База.** [cockroachlabs.cloud](https://cockroachlabs.cloud) → Create Cluster →
   **Basic (Serverless), Free**. В разделе Connect выбери «Connection string»,
   создай SQL-пользователя и скопируй строку вида
   `postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full`.
   Замени `defaultdb` на `dev_card` — создавать базу руками не нужно,
   `prisma migrate deploy` создаст её при первом старте контейнера.
2. **Приложение.** [render.com](https://render.com) → New → **Blueprint** →
   указать этот Git-репозиторий. Render прочитает `render.yaml`.
3. В настройках сервиса заполни переменные:
   - `DATABASE_URL` — строка из шага 1;
   - `PUBLIC_URL` — выданный Render адрес, например `https://dev-card.onrender.com`.
4. Deploy. Проверка: `https://<домен>/health/ready` → `{"status":"ok",…}`.

> Free-инстанс Render засыпает после ~15 минут простоя; первый запрос будит его
> за ~30–50 секунд. Перед собеседованием открой ссылку заранее, чтобы прогреть.

## Вариант B — Railway

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo —
   Railway сам соберёт Dockerfile.
2. База: либо CockroachDB Cloud (как в варианте A), либо Railway-плагин
   PostgreSQL (Prisma-схема совместима: поменяй `provider = "cockroachdb"` на
   `postgresql` в `prisma/schema.prisma` и пересоздай миграцию — но тогда стек
   уже не «CockroachDB», для этого тестового лучше вариант A).
3. Переменные окружения — те же: `DATABASE_URL`, `PUBLIC_URL`, `IP_HASH_SALT`.

## Вариант C — свой VPS

```bash
git clone <repo> && cd dev-card
IP_HASH_SALT=$(openssl rand -hex 16) PUBLIC_URL=https://card.example.com \
  docker compose up -d --build
```

`docker-compose.yml` поднимает CockroachDB (single-node) и приложение с
health-чеками. Дальше — любой reverse proxy (Caddy/nginx) на порт 3000.

## Переменные окружения

| Переменная | Обязательна | Значение |
| --- | --- | --- |
| `DATABASE_URL` | да | CockroachDB connection string |
| `PUBLIC_URL` | нет | внешний адрес (для логов и ссылок) |
| `IP_HASH_SALT` | да (prod) | случайная строка ≥ 8 символов |
| `CORS_ORIGINS` | нет | `*` или список через запятую |
| `CONTACT_RATE_LIMIT` | нет | сообщений в час с одного IP (по умолчанию 3) |
| `TRUST_PROXY` | нет | сколько прокси-хопов доверять для `X-Forwarded-For`: `1` за Render/nginx (по умолчанию), `0` при прямом доступе |
| `LOG_LEVEL` | нет | `info` (по умолчанию) |
