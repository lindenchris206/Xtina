# Quick Start Guide

Follow these steps to get AI Crew Commander running on your local machine.

## Prerequisites

- Node.js (v18 or newer)
- npm or pnpm

## 1. Install Dependencies

Navigate to the project's root directory and run the installation command:

```bash
npm install
```
or if you use pnpm:
```bash
pnpm install
```

This will install all necessary dependencies for both the frontend and the backend.

## 2. Set Up Environment Variables

The application requires a Google Gemini API key to function.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open the newly created `.env` file in a text editor.
3.  Add your Gemini API key. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```.env
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

## 3. Launch the Application

Run the development server, which starts both the frontend and backend concurrently:

```bash
npm run dev
```

The application will be available at:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3001](http://localhost:3001)

## 4. Login

Open your browser to the frontend URL. You will be greeted with a login screen. Use the following credentials:

- **Username:** `admin`
- **Password:** `admin`

You are now in the AI Crew Commander workspace!
