# NYC Transit Alerts

Real-time MTA subway and bus service alerts for New York City.
Built with React + AWS serverless (API Gateway → Lambda → DynamoDB → S3/CloudFront).

## Features

- **Live alerts** — MTA GTFS-RT feed refreshed every 5 minutes via scheduled Lambda
- **Filter** — by severity, status (active/upcoming/past), and transit type
- **Search** — full-text across titles, descriptions, and line IDs
- **Filter by line** — click any line badge to scope alerts to that line
- **Favorites** — star lines to pin them for quick access; synced to DynamoDB, backed by localStorage
- **Alert detail** — full description, active periods, and MTA link
- **Auto-refresh** — browser polls for new alerts every 60 seconds

## Architecture

```
Browser (React SPA)
    │
    │  served via HTTPS
    ▼
CloudFront ─── S3 (static assets)
    │
    │  VITE_API_BASE_URL
    ▼
API Gateway (REST)
    ├── GET    /alerts            → getAlerts Lambda
    ├── GET    /alerts/{id}       → getAlerts Lambda
    ├── GET    /favorites/{userId}       → getFavorites Lambda
    ├── POST   /favorites/{userId}       → saveFavorite Lambda
    └── DELETE /favorites/{userId}/{lineId} → deleteFavorite Lambda

EventBridge (rate 5 min) → refreshAlerts Lambda → MTA GTFS-RT feed
                                                        │
                                                        ▼
                                               DynamoDB (single table)
                                                 ├── ALERT#<id>  items
                                                 └── USER#<id>   favorites
```

## DynamoDB Table Design

Single-table design. See [`infrastructure/dynamodb-schema.md`](infrastructure/dynamodb-schema.md) for full details.

| Pattern                     | Key                              |
|-----------------------------|----------------------------------|
| Get alert by ID             | PK=`ALERT#<id>`, SK=`ALERT#<id>` |
| List alerts by status       | GSI1: `STATUS#ACTIVE` (sorted)   |
| List user favorites         | PK=`USER#<userId>`, SK begins_with `FAVORITE#` |

## Project Structure

```
NewYorkTransitApp/
├── frontend/                   # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/              # useAlerts, useFavorites, useFilters
│   │   ├── pages/              # AlertsPage, AlertDetailPage, FavoritesPage
│   │   ├── services/           # API client + mock data
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Line metadata, formatting helpers
│   └── .env.example
│
├── backend/
│   ├── functions/
│   │   ├── getAlerts/          # GET /alerts, GET /alerts/{id}
│   │   ├── getFavorites/       # GET /favorites/{userId}
│   │   ├── saveFavorite/       # POST /favorites/{userId}
│   │   ├── deleteFavorite/     # DELETE /favorites/{userId}/{lineId}
│   │   └── refreshAlerts/      # EventBridge scheduled → MTA feed
│   └── layers/shared/nodejs/   # Shared: DynamoDB client, response helpers, MTA client
│
├── infrastructure/
│   ├── template.yaml           # SAM template (API GW + Lambda + DynamoDB)
│   ├── frontend.yaml           # CloudFormation (S3 + CloudFront)
│   ├── samconfig.toml          # SAM deploy config (dev/staging/prod)
│   └── dynamodb-schema.md      # Table design doc
│
└── scripts/
    ├── setup-local.sh          # Install all deps
    ├── deploy-backend.sh       # sam build + sam deploy
    ├── deploy-frontend-infra.sh # Deploy S3 + CloudFront stack
    └── deploy-frontend.sh      # Build React + sync to S3 + invalidate CF
```

## Local Development

### 1. Install dependencies

```bash
./scripts/setup-local.sh
```

### 2. Start the dev server

```bash
cd frontend
npm run dev
```

The app runs at http://localhost:3000 with **mock data** by default — no AWS account needed.

### 3. Use a live backend (optional)

After deploying the backend (see below), add the API URL to `frontend/.env.local`:

```bash
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
VITE_USE_MOCK=false
```

Then restart `npm run dev`.

## Deployment

### Prerequisites

```bash
# AWS CLI
brew install awscli
aws configure

# SAM CLI
brew install aws-sam-cli

# MTA API key (free)
# Register at: https://api.mta.info/
```

### 1. Deploy the backend

```bash
./scripts/deploy-backend.sh prod YOUR_MTA_API_KEY
```

This runs `sam build` + `sam deploy` and prints the API Gateway URL.

### 2. Deploy frontend infrastructure (first time only)

```bash
./scripts/deploy-frontend-infra.sh prod https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Deploy the frontend

```bash
./scripts/deploy-frontend.sh prod https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

This builds the React app, syncs it to S3, and invalidates the CloudFront cache.

### Updating after code changes

```bash
# Backend changes
./scripts/deploy-backend.sh prod

# Frontend changes
./scripts/deploy-frontend.sh prod
```

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable            | Description                                     | Default |
|---------------------|-------------------------------------------------|---------|
| `VITE_API_BASE_URL` | API Gateway base URL (no trailing slash)        | `''`    |
| `VITE_USE_MOCK`     | Force mock data (`true`/`false`)                | `true`  |

### Lambda (set via SAM parameter overrides)

| Variable          | Description                  |
|-------------------|------------------------------|
| `MTA_API_KEY`     | MTA Bus Time API key         |
| `DYNAMODB_TABLE`  | DynamoDB table name          |
| `ALLOWED_ORIGIN`  | CORS allowed origin          |

## MTA API Key

1. Go to https://api.mta.info/
2. Register for a free account
3. Create an API key
4. Pass it as the second argument to `deploy-backend.sh`

Without an MTA API key, `refreshAlerts` logs a warning and skips the write.
The `getAlerts` Lambda will fall back to whatever is already in DynamoDB (empty on first run).

## Notes on userId

The current implementation uses a path-level `userId` parameter (`guest` by default in the frontend).
In production, replace this with a value extracted from an **Amazon Cognito authorizer**:

```typescript
// In getFavorites/saveFavorite/deleteFavorite handlers:
const userId = event.requestContext.authorizer?.claims?.sub ?? 'guest'
```

Add a `CognitoUserPoolAuthorizer` to the SAM template's `TransitApi` to enforce authentication.

## License

MIT
