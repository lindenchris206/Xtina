# Installation Guide

This document provides detailed instructions for installing and running AI Crew Commander. For a faster version, see `QUICK_START.md`.

## System Requirements

- **Operating System:** Windows, macOS, or Linux.
- **Node.js:** Version 18.x or higher is recommended.
- **Package Manager:** `npm` (v8+) or `pnpm`.

## Installation Steps

1.  **Clone the Repository (if applicable)**
    If you have access to the Git repository, clone it to your local machine. Otherwise, extract the provided `.zip` file.

2.  **Install Dependencies**
    Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
    This command installs dependencies for both the frontend (React) and backend (Node.js) simultaneously.

3.  **Configure Environment**
    Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and add your Google Gemini API key.
    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

4.  **Run the Development Server**
    Start the application with:
    ```bash
    npm run dev
    ```
    This will start the Vite frontend server on port 5173 and the Node.js backend server on port 3001.

## Platform-Specific Installers

For convenience, installer scripts are provided in the `installers/` directory:

- `install-windows.bat`: For Windows users.
- `install-mac.sh`: For macOS users.
- `install-linux.sh`: For Linux users.

These scripts automate the dependency installation process.

## Troubleshooting

- **API Errors:** If the AI assistant shows errors, double-check that your Gemini API key is correct in the `.env` file and that you have enabled the necessary APIs in your Google Cloud project.
- **Port Conflicts:** If port 5173 or 3001 is in use, you can change them in `vite.config.js` (for the frontend) and `backend/server.js` (for the backend).
