# Delta for LLM Integration

## ADDED Requirements

### Requirement: Multi-Provider LLM Support
The system SHALL support five LLM providers: OpenAI, Anthropic, OpenRouter, Ollama, and OMXL.

#### Scenario: OpenAI provider
- GIVEN a user selects OpenAI and provides an API key
- WHEN the system calls the LLM
- THEN the request is routed through the OpenAI SDK and a response is returned

#### Scenario: Anthropic provider
- GIVEN a user selects Anthropic and provides an API key
- WHEN the system calls the LLM
- THEN the request is routed through the Anthropic SDK and a response is returned

#### Scenario: OpenRouter provider
- GIVEN a user selects OpenRouter and provides an API key
- WHEN the system calls the LLM
- THEN the request is routed through OpenRouter's API with a standardized response

#### Scenario: Ollama provider
- GIVEN the user selects Ollama (no API key required)
- WHEN the system calls the LLM
- THEN the request is sent to a local Ollama instance at localhost:11434

#### Scenario: OMXL provider
- GIVEN a user selects OMXL, provides an API key and base URL
- WHEN the system calls the LLM
- THEN the request is sent to the configured OMXL endpoint via OpenAI-compatible API

### Requirement: Provider Selection
The system SHALL allow users to select their preferred LLM provider and configure credentials.

#### Scenario: Provider selection
- GIVEN a user is on the settings page
- WHEN they select a provider from the dropdown
- THEN the appropriate configuration fields are shown (API key, base URL if applicable)

#### Scenario: Ollama auto-detection
- GIVEN the user selects Ollama as their provider
- WHEN the settings page loads
- THEN the system checks if Ollama is reachable at localhost:11434 and displays status

### Requirement: API Key Security
The system SHALL never persist user API keys to the server.

#### Scenario: Keys stored client-side only
- GIVEN a user enters their API key in the settings form
- WHEN they submit the form
- THEN the key is stored only in browser localStorage and sent per-request via headers

#### Scenario: Keys not in server storage
- GIVEN a user has configured their API key
- WHEN the backend processes requests
- THEN no API keys are written to database, files, or server-side caches

### Requirement: Structured LLM Responses
The system SHALL normalize all provider responses into a consistent format.

#### Scenario: Standardized response shape
- GIVEN any supported provider returns a response
- WHEN the response is processed by LLMClient
- THEN it conforms to the LLMResponse Pydantic model with content and usage fields
