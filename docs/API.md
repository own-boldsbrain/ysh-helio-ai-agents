# API Documentation

## Overview

The Coding Agent Template provides a RESTful API for managing coding agents, tasks, sandboxes, and user sessions. All API endpoints follow REST principles and return JSON responses.

## Authentication

Most API endpoints require authentication using session cookies. The authentication system uses encrypted session tokens stored in cookies.

### Session Token

- Sessions are stored in cookies named `session`
- Session tokens are encrypted using JWE
- Sessions expire after a configurable time period
- API requests must include the session cookie for authentication

## Base URL

All API endpoints are relative to the base URL of your deployment.

Production: `https://yourdomain.com/api`
Development: `http://localhost:3000/api`

## Common Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the application.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T12:34:56.789Z",
  "uptime": 3600.12,
  "environment": "production",
  "version": "2.0.0",
  "dependencies": {
    "database": "connected"
  }
}
```

### Metrics

#### GET /metrics

Get application metrics in Prometheus format.

**Response:**

```
# HELP app_requests_total Total number of requests
# TYPE app_requests_total counter
app_requests_total 1234

# HELP app_errors_total Total number of errors
# TYPE app_errors_total counter
app_errors_total 5

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds 3600.12
```

### Authentication

#### POST /auth/login

Authenticate a user and create a session.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### GET /auth/session

Get current user session information.

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "User Name"
    },
    "expiresAt": "2025-01-18T12:34:56.789Z"
  }
}
```

#### POST /auth/logout

Log out the current user.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Tasks

#### GET /tasks

Get a list of tasks for the current user.

**Query Parameters:**

- `limit` (optional): Number of tasks to return (default: 20, max: 100)
- `offset` (optional): Number of tasks to skip (default: 0)
- `status` (optional): Filter by task status (pending, running, completed, failed)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "task-123",
        "userId": "user-123",
        "title": "Create new feature",
        "description": "Implement the new feature",
        "status": "completed",
        "sandboxId": "sandbox-456",
        "createdAt": "2025-01-17T10:00:00.000Z",
        "updatedAt": "2025-01-17T10:05:00.000Z"
      }
    ],
    "total": 1,
    "page": 0,
    "pageSize": 20,
    "hasMore": false
  }
}
```

#### POST /tasks

Create a new task.

**Request:**

```json
{
  "title": "Create new feature",
  "description": "Implement the new feature",
  "repoUrl": "https://github.com/user/repo",
  "selectedAgent": "claude",
  "selectedModel": "claude-sonnet-4-5-20250929",
  "installDependencies": true,
  "maxDuration": 300,
  "keepAlive": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "task-789",
    "userId": "user-123",
    "title": "Create new feature",
    "description": "Implement the new feature",
    "status": "pending",
    "sandboxId": "sandbox-101",
    "createdAt": "2025-01-17T10:00:00.000Z",
    "updatedAt": "2025-01-17T10:00:00.000Z"
  }
}
```

#### GET /tasks/{id}

Get details of a specific task.

**Path Parameters:**

- `id`: Task ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "task-123",
    "userId": "user-123",
    "title": "Create new feature",
    "description": "Implement the new feature",
    "status": "completed",
    "sandboxId": "sandbox-456",
    "logs": [
      {
        "timestamp": "2025-01-17T10:00:05.000Z",
        "level": "info",
        "message": "Task started"
      }
    ],
    "error": null,
    "branchName": "feature/new-feature",
    "sandboxUrl": "https://sandbox-url.vercel.app",
    "previewUrl": "https://preview-url.vercel.app",
    "prUrl": "https://github.com/user/repo/pull/123",
    "prNumber": 123,
    "createdAt": "2025-01-17T10:00:00.000Z",
    "updatedAt": "2025-01-17T10:05:00.000Z",
    "completedAt": "2025-01-17T10:05:00.000Z"
  }
}
```

#### PUT /tasks/{id}

Update a specific task.

**Path Parameters:**

- `id`: Task ID

**Request:**

```json
{
  "keepAlive": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "task-123",
    "keepAlive": true
  }
}
```

### Sandboxes

#### GET /sandboxes

Get a list of sandboxes for the current user.

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sandbox-456",
        "userId": "user-123",
        "name": "My Sandbox",
        "status": "active",
        "environment": "nodejs",
        "createdAt": "2025-01-17T10:00:00.000Z",
        "expiresAt": "2025-01-17T15:00:00.000Z"
      }
    ]
  }
}
```

#### POST /sandboxes

Create a new sandbox.

**Request:**

```json
{
  "name": "My New Sandbox",
  "environment": "nodejs",
  "diskSize": 1024,
  "memorySize": 512
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sandbox-789",
    "userId": "user-123",
    "name": "My New Sandbox",
    "status": "creating",
    "environment": "nodejs",
    "createdAt": "2025-01-17T10:00:00.000Z",
    "expiresAt": "2025-01-17T15:00:00.000Z"
  }
}
```

#### GET /sandboxes/{id}

Get details of a specific sandbox.

**Path Parameters:**

- `id`: Sandbox ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sandbox-456",
    "userId": "user-123",
    "name": "My Sandbox",
    "status": "active",
    "environment": "nodejs",
    "createdAt": "2025-01-17T10:00:00.000Z",
    "expiresAt": "2025-01-17T15:00:00.000Z"
  }
}
```

#### POST /sandboxes/{id}/execute

Execute a command in the sandbox.

**Path Parameters:**

- `id`: Sandbox ID

**Request:**

```json
{
  "command": "npm run build",
  "timeout": 300,
  "cwd": "/app"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "output": "Build completed successfully",
    "exitCode": 0,
    "duration": 12.34
  }
}
```

### GitHub Integration

#### GET /github/repos

Get repositories for the authenticated user.

**Query Parameters:**

- `owner` (optional): GitHub username/organization to filter by

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "my-repo",
      "full_name": "username/my-repo",
      "description": "My repository",
      "private": false,
      "clone_url": "https://github.com/username/my-repo.git",
      "language": "TypeScript"
    }
  ]
}
```

#### GET /github/user

Get GitHub user information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "github-user-123",
    "login": "username",
    "name": "GitHub User",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
    "email": "user@example.com"
  }
}
```

## Error Codes

The API uses the following error codes:

| Code               | Description                         |
| ------------------ | ----------------------------------- |
| UNAUTHORIZED       | Authentication required or invalid  |
| FORBIDDEN          | Access to resource is forbidden     |
| VALIDATION_ERROR   | Request validation failed           |
| RESOURCE_NOT_FOUND | Requested resource does not exist   |
| INTERNAL_ERROR     | Internal server error occurred      |
| TIMEOUT_ERROR      | Request timed out                   |
| GITHUB_API_ERROR   | Error communicating with GitHub API |

## Rate Limiting

All API endpoints are subject to rate limiting:

- Authenticated users: 100 requests per minute
- Unauthenticated users: 10 requests per minute

Rate-limited responses include the following headers:

- `X-RateLimit-Limit`: The maximum number of requests allowed
- `X-RateLimit-Remaining`: The number of requests remaining
- `X-RateLimit-Reset`: The time when the rate limit resets

## API Clients

### TypeScript Client

The `@repo/api-types` package provides TypeScript interfaces for all API requests and responses:

```typescript
import { ApiResponse, Task } from '@repo/api-types'

interface CreateTaskRequest {
  title: string
  description: string
  repoUrl: string
  selectedAgent: string
  selectedModel: string
  installDependencies: boolean
  maxDuration: number
  keepAlive: boolean
}
```

## Versioning

The API is versioned as part of the application version. Breaking changes will be accompanied by a major version increment.

## Security

### Data Validation

All input data is validated before processing. Invalid data will result in a `VALIDATION_ERROR`.

### Sanitization

All output data is properly sanitized to prevent injection attacks.

### HTTPS

All API requests should use HTTPS in production environments.
