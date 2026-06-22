# Delta for Infrastructure

## ADDED Requirements

### Requirement: Docker Services
The system SHALL run two services (frontend and backend) via Docker Compose.

#### Scenario: Both services start
- GIVEN the user runs `docker compose up`
- WHEN both containers initialize
- THEN the frontend is accessible at `http://localhost:3000`
- AND the backend health endpoint responds at `http://localhost:8000/health`

#### Scenario: Health check passes
- GIVEN the backend is running
- WHEN a GET request is made to `/health`
- THEN the response returns HTTP 200 with `{"status": "ok"}`

### Requirement: API Client
The system SHALL provide a centralized API client in the frontend for all backend communication.

#### Scenario: API client makes request
- GIVEN the user is on a frontend page
- WHEN the API client calls a backend endpoint
- THEN the request routes through `http://localhost:3000/api/*` (rewritten to backend)
- AND the response is returned as structured JSON

#### Scenario: API client handles errors
- GIVEN the backend returns a non-2xx status
- WHEN the API client receives the response
- THEN an error is thrown with the status code and message

### Requirement: CORS Configuration
The system SHALL configure CORS on the backend to allow requests from the frontend.

#### Scenario: Cross-origin request succeeds
- GIVEN the frontend is running on `localhost:3000`
- WHEN it makes a request to the backend on `localhost:8000`
- THEN CORS headers are present and the request is allowed
