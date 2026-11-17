# Sabarivasan G — AI & Data Science Portfolio

Personal portfolio web application for **Sabarivasan G**, 2nd-year B.Tech Artificial Intelligence & Data Science student at Sri Ramakrishna Institute of Technology, Coimbatore.

Built as a static client-side single-page application using **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Motion**, **Three.js**, and **PDF.js**. No backend server, external API keys, or OAuth credentials are required.

## Features

- **3D Interactive Intro Loader** (`IntroLoader` + `three`)
- **Overview & Profile**: Academic summary, career objective, and key metrics with neural lattice canvas backdrop
- **Achievements**: NPTEL Elite certificate, Smart India Hackathon (SIH), IIT Bombay Illuminate Bootcamp, and TEDxSRIT records with interactive detail viewer
- **Technical Skills**: Categorized programming, database, tool, and personal strength cards
- **Certifications**: Filterable explorer across 7 verified learning tracks and 25+ completed modules
- **Education**: Degree progress, Higher Secondary / SSLC scores, areas of interest, and core subjects
- **Projects**: In-progress work roadmap status
- **Resume PDF Viewer**: Single-page resume preview and download (`public/assets/aistudio/Sabarivasan_G_Resume_Creative__1_-1_e4404cec.pdf`)
- **Portfolio PDF Viewer**: Client-side 13-page PDF.js canvas rendering with page navigation, zoom controls, raw view, and direct PDF download (`public/assets/aistudio/my_resume_86a39148.pdf`)
- **Contact Details**: Read-only direct channels (email, mobile number, and location)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   The app runs locally on `http://localhost:3000`.

3. **Type-check**

   ```bash
   npx tsc --noEmit
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

   Production assets are output to `dist/`. You can preview the production bundle locally with:

   ```bash
   npm run preview
   ```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server on port `3000` |
| `npm run build` | Build optimized production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checks (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` build artifacts cleanly |
