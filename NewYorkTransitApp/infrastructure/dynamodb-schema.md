# DynamoDB Table: nyc-transit-alerts

Single-table design. One table handles both Alerts and Favorites.

## Key Schema

| Attribute | Type   | Description                        |
|-----------|--------|------------------------------------|
| PK        | String | Partition key                      |
| SK        | String | Sort key                           |

## Access Patterns → Key Patterns

| Access Pattern                    | PK                  | SK                        | Index  |
|-----------------------------------|---------------------|---------------------------|--------|
| Get single alert by ID            | `ALERT#<id>`        | `ALERT#<id>`              | Main   |
| List alerts by status (newest)    | `STATUS#<status>`   | `UPDATED#<ISO>`           | GSI1   |
| Get all favorites for a user      | `USER#<userId>`     | `FAVORITE#<lineId>`       | Main   |
| Get single favorite               | `USER#<userId>`     | `FAVORITE#<lineId>`       | Main   |

## GSI1 — StatusIndex

Enables efficient listing of alerts by status, sorted by last update time.

| Attribute | Maps to         |
|-----------|-----------------|
| GSI1PK    | `STATUS#ACTIVE` / `STATUS#UPCOMING` / `STATUS#PAST` |
| GSI1SK    | `UPDATED#<ISO>` (sort newest-first with ScanIndexForward: false) |

## Item Examples

### Alert Item
```json
{
  "PK":        "ALERT#alert-001",
  "SK":        "ALERT#alert-001",
  "GSI1PK":   "STATUS#ACTIVE",
  "GSI1SK":   "UPDATED#2026-10-01T14:30:00.000Z",
  "id":        "alert-001",
  "title":     "A/C/E suspended...",
  "severity":  "NO_SERVICE",
  "status":    "ACTIVE",
  "affectedLines": [...],
  "activePeriods": [...],
  "updatedAt": "2026-10-01T14:30:00.000Z",
  "createdAt": "2026-10-01T13:00:00.000Z",
  "ttl":       1728086400
}
```

### Favorite Item
```json
{
  "PK":      "USER#guest",
  "SK":      "FAVORITE#A",
  "userId":  "guest",
  "lineId":  "A",
  "savedAt": "2026-10-01T10:00:00.000Z",
  "line": {
    "id":        "A",
    "name":      "A",
    "type":      "SUBWAY",
    "color":     "#0039A6",
    "textColor": "#FFFFFF",
    "group":     "8th Ave / Fulton"
  }
}
```

## TTL

Past alerts have a `ttl` attribute (Unix epoch seconds).
DynamoDB TTL is enabled on the `ttl` attribute.
Items older than 7 days are automatically deleted.

## Capacity

Provisioned via PAY_PER_REQUEST (on-demand) — no capacity planning needed
for unpredictable MTA alert volumes.
