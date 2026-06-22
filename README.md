<h1 align="center">📰 ArticleViz</h1>

<p align="center">
  <strong>Turn dense articles into structured, glossary-aware reading experiences with interactive concept maps.</strong>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="React Flow" src="https://img.shields.io/badge/React_Flow-12-FF0072?style=for-the-badge&logo=react&logoColor=white" />
</p>

---

ArticleViz breaks long-form articles into clean, navigable sections, links technical terms to an inline glossary, and renders the relationships between ideas as an interactive concept map. A Next.js frontend handles the reading experience; a Python backend handles ingestion, parsing, normalization, and LLM-assisted visualization.

## ✨ Features

- 📰 **Section-based article reader** — content is split into readable cards (`ArticleViewer.tsx`, `SectionCard.tsx`) instead of one undifferentiated block.
- 🔗 **Inline glossary linking** — technical terms are surfaced and linked in context via `GlossaryTerm.tsx`.
- 🗺️ **Interactive concept map** — explore how ideas connect with a React Flow–powered diagram (`DiagramView.tsx`, `ConceptFlowNode.tsx`).
- 📥 **Flexible input** — bring articles in through tabbed input and upload UI (`InputTabs.tsx`, `UploadArea.tsx`).
- 🎛️ **Reader preferences** — color mode, font, and motion toggles, persisted via `PreferencesContext`.
- ⚙️ **Settings surface** — manage API keys and configuration from a dedicated settings page (`ApiKeyForm.tsx`).
- 🐍 **Python processing backend** — parsing, normalization, LLM, and visualization services under `backend/app/`.
- 🐳 **Containerized** — `Dockerfile`s for both apps plus a `docker-compose.yml` for the full stack.

## 🧱 Tech Stack

**Frontend**

| Technology | Version |
|---|---|
| [Next.js](https://nextjs.org/) (App Router) | 15 |
| [React](https://react.dev/) | 19 |
| [TypeScript](https://www.typescriptlang.org/) (strict) | 5.7 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 |
| [React Flow](https://reactflow.dev/) (`@xyflow/react`) | 12 |
| [Motion](https://motion.dev/) | 12 |

**Backend**

- Python package under `backend/app/` (`pyproject.toml`)
- Routes: `articles`, `upload`, `process`, `settings`
- Services: `parsers`, `normalizer`, `llm`, `visualizer`

## 🚀 Getting Started

> The runnable frontend lives in `frontend/`, so run all npm commands from there.

### Prerequisites

- Node.js + npm compatible with Next.js 15 / React 19
- Python tooling for the backend (`backend/pyproject.toml`)
- Optional: Docker, to run the stack via `docker-compose.yml`

### Frontend

```bash
cd frontend
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint     # lint
```

### Full stack via Docker

```bash
docker compose up --build
```

## 📂 Project Structure

```text
articleviz/
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py
│       ├── models.py
│       ├── routes/        # articles, upload, process, settings
│       └── services/      # parsers, normalizer, llm, visualizer
├── frontend/
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── article/[id]/page.tsx   # dynamic article view
│       │   ├── settings/page.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx                # home
│       ├── components/
│       │   ├── settings/  # ApiKeyForm
│       │   ├── ui/        # ColorMode / Font / Motion toggles
│       │   ├── upload/    # InputTabs, UploadArea
│       │   └── viewer/    # ArticleViewer, SectionCard, GlossaryTerm,
│       │                  # DiagramView, ConceptFlowNode
│       ├── contexts/      # PreferencesContext
│       └── lib/           # api.ts
├── openspec/
├── docker-compose.yml
└── plan.md
```

## 🔍 How It Works

1. **Bring in an article** — paste or upload content through `InputTabs` / `UploadArea`. The backend's `upload` and `process` routes handle ingestion, with `parsers` and `normalizer` cleaning the content.
2. **Read it as sections** — `ArticleViewer` renders the article as a sequence of `SectionCard`s for focused, navigable reading.
3. **Follow the glossary** — technical terms are linked inline via `GlossaryTerm`, so definitions stay one tap away without leaving the flow.
4. **Explore the concept map** — `DiagramView` and `ConceptFlowNode` render the relationships between ideas as an interactive React Flow graph.
5. **Tune the experience** — adjust color mode, font, and motion from the UI toggles; manage keys and config on the settings page.

## 🤝 Contributing

Contributions are welcome.

1. Branch off `main`.
2. `cd frontend && npm install`.
3. Make focused changes:
   - App routes → `frontend/src/app/`
   - Viewer UI → `frontend/src/components/viewer/`
   - Upload UI → `frontend/src/components/upload/`
   - Settings / preferences → `frontend/src/components/settings/`, `ui/`, `contexts/`
   - Backend → `backend/app/routes/`, `backend/app/services/`
4. Verify: `npm run lint && npm run build`.
5. Open a PR with a concise description and screenshots/recordings for UI changes.

## 📄 License

No license file is present yet. Add a `LICENSE` before distributing.
