# Cloud Web Application Assessment

This repository contains the full handover package for CSE3CWA Assessment 1: Frontend Design and Usability.

## What is included

- Course materials and the assessment brief in the course-materials folder.
- A prototype reference file in the prototypes folder.
- A polished Next.js frontend in the app folder with:
  - a home page and about page
  - teacher-facing Word Search and Wordle activities
  - a settings page with persistent light/dark theme support
  - standalone HTML export for each activity

## Project structure

- course-materials/ — assessment brief, rubric, corpus, and reference materials
- prototypes/ — earlier standalone prototype work
- app/ — complete frontend implementation and local documentation

## Run locally

```bash
cd app
npm install
npm run dev
```

Then open http://localhost:3000.

## Build check

```bash
cd app
npm run build
```

This project is designed to be submission-ready, with the app code separated from the assessment evidence while remaining easy to review.
