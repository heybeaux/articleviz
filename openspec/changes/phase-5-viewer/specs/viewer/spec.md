# Delta for Viewer

## ADDED Requirements

### Requirement: Scroll-Triggered Section Reveals
The system SHALL reveal article sections progressively as the user scrolls.

#### Scenario: Progressive content display
- GIVEN a user is viewing an article page
- WHEN the user scrolls down the page
- THEN each section card animates into view (fade-in + slide-up) as it enters the viewport
- AND previously revealed sections remain visible

#### Scenario: Staggered animation timing
- GIVEN multiple section cards in the viewport
- WHEN they come into view
- THEN each card animates with a slight delay relative to its position (cascading effect)

### Requirement: Interactive Concept Diagram
The system SHALL render the article's concept map as an interactive diagram.

#### Scenario: Diagram rendering
- GIVEN an article has been analyzed and a concept map exists
- WHEN the user views the article page
- THEN a React Flow diagram is displayed showing concepts as nodes and relationships as edges

#### Scenario: Diagram interaction
- GIVEN the concept diagram is displayed
- WHEN the user interacts with it
- THEN they can zoom in/out, pan across the diagram, and click nodes for details

#### Scenario: Mind map layout
- GIVEN the concept diagram is rendered
- WHEN it initializes
- THEN nodes are arranged in a mind map layout with the article topic as the central root

### Requirement: Inline Glossary Terms
The system SHALL make key terms interactive with tap/click to reveal definitions.

#### Scenario: Glossary term display
- GIVEN an article with glossary terms from the analysis pipeline
- WHEN the user views the article page
- THEN key terms are styled with a subtle underline indicating they are interactive

#### Scenario: Definition reveal
- GIVEN the user taps or clicks a glossary term
- WHEN the interaction occurs
- THEN the definition expands inline below the term with a smooth animation

#### Scenario: Definition dismissal
- GIVEN a glossary definition is expanded
- WHEN the user taps the term again or presses Escape
- THEN the definition collapses back to its hidden state

#### Scenario: Touch device compatibility
- GIVEN the user is on a mobile or touch device
- WHEN they interact with glossary terms
- THEN tap (not hover) triggers the definition reveal

### Requirement: Article Page Layout
The system SHALL present all visual features in a cohesive, readable layout.

#### Scenario: Complete article view
- GIVEN an article with sections, concept map, glossary terms, and summary
- WHEN the user loads the article page
- THEN all elements are rendered in a single scrollable view with consistent spacing

#### Scenario: Summary placement
- GIVEN an article has been analyzed with a TL;DR summary
- WHEN the user loads the article page
- THEN the summary is displayed at the top of the article before any sections
