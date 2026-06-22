# Delta for Ingestion

## ADDED Requirements

### Requirement: Multi-Format Article Input
The system SHALL accept articles in four formats: plain text, URL, PDF, and DOCX.

#### Scenario: Text paste upload
- GIVEN a user pastes article text into the input area
- WHEN the user submits the form
- THEN the backend returns cleaned paragraph blocks with a unique article ID

#### Scenario: URL upload
- GIVEN a user provides a valid article URL
- WHEN the user submits the form
- THEN the backend fetches the page, extracts body text, and returns cleaned paragraph blocks

#### Scenario: PDF upload
- GIVEN a user uploads a valid PDF file
- WHEN the user submits the form
- THEN the backend extracts text from all pages and returns cleaned paragraph blocks

#### Scenario: DOCX upload
- GIVEN a user uploads a valid .docx file
- WHEN the user submits the form
- THEN the backend extracts paragraph text and returns cleaned paragraph blocks

### Requirement: Content Normalization
The system SHALL normalize all article content into a consistent format.

#### Scenario: HTML stripping
- GIVEN an article contains HTML markup (from URL scraping or PDF extraction)
- WHEN the content is processed
- THEN all HTML tags are removed and only readable text remains

#### Scenario: Whitespace cleanup
- GIVEN an article has irregular whitespace (multiple spaces, excessive line breaks)
- WHEN the content is processed
- THEN whitespace is collapsed to single spaces and paragraphs are cleanly separated

### Requirement: Input Validation
The system SHALL validate all inputs before processing.

#### Scenario: File type validation
- GIVEN a user uploads a file with an unsupported extension
- WHEN the form is submitted
- THEN an error message indicates the supported file types

#### Scenario: File size validation
- GIVEN a user uploads a PDF larger than the maximum allowed size (10 MB)
- WHEN the form is submitted
- THEN an error message indicates the file size limit

#### Scenario: Empty input validation
- GIVEN a user submits text paste with empty or whitespace-only content
- WHEN the form is submitted
- THEN a validation error is displayed

### Requirement: Error Handling
The system SHALL provide specific, actionable error messages for all failure modes.

#### Scenario: Corrupt PDF
- GIVEN a user uploads a corrupt or password-protected PDF
- WHEN parsing fails
- THEN an error message explains the issue without technical details

#### Scenario: URL fetch failure
- GIVEN a user provides an unreachable or invalid URL
- WHEN the fetch times out or returns an error
- THEN an error message indicates the page could not be loaded
