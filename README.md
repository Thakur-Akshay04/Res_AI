# 🚀 Res_AI — AI Resume Builder & ATS Optimizer

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Groq_AI-f55a42?style=for-the-badge&logo=probot&logoColor=white" alt="Groq AI" />
  <img src="https://img.shields.io/badge/Meta_Llama--3-0080FF?style=for-the-badge&logo=meta&logoColor=white" alt="Meta Llama" />
  <img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</p>

**Res_AI** is a modern **AI-powered Resume Builder & ATS (Applicant Tracking System) Optimizer**. 

Simply enter your career details, paste a target job description, and watch the built-in **AI (Meta Llama-3 via Groq)** instantly rewrite, optimize, and score your resume for the best chance of passing hiring filters!

---

## ✨ Cool Stuff It Does

*   **🖥️ Side-by-Side Editor**: Edit your details on the left and see the gorgeous PDF preview update in real-time on the right.
*   **🖱️ Click-to-Edit Syncing**: Click any section on the PDF preview, and the editor will instantly scroll to and highlight the exact field you need to change.
*   **📈 Live ATS Auditor**: A real-time scoring system that tells you which keywords are missing from your resume based on the job description.
*   **🤖 AI Spark Writer**: Auto-generates high-impact summaries, achievements, and tailored bullet points in seconds.
*   **🗃️ Version History**: Easily save different drafts and versions of your resume.
*   **🔗 Public/Private Sharing**: Toggle your resume's visibility to get a shareable public link slug to send to recruiters.
*   **🔐 Safe Sign-In**: Uses Clerk Auth for secure accounts and registers user credits automatically.

---

## 🛠️ Tech Stack Made Simple

*   **Frontend (The Looks)**: Built with **React** (super fast Vite setup) and styled with **TailwindCSS**.
*   **Backend (The Brains)**: Powered by **Node.js** & **Express** server, storing data in **MongoDB**.
*   **AI Power**: Handled by **Groq Cloud (Llama-3)** for lightning-fast text generations.
*   **Auth**: Managed by **Clerk** to keep your sign-ins secure and simple.

---

## 🏃 Setup Guide (Choose Your Path)

### Path A: Run with Docker 🐳 (Super Easy)

If you have Docker installed, you can boot up the entire project with just a couple of commands.

1.  **Configure environment:** Create a `.env.docker` file in the root folder and paste this:
    ```env
    MONGO_URI=mongodb://mongo:27017/ai-resume-builder
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=7d
    GROQ_API_KEY=your_groq_api_key
    CLIENT_URL=http://localhost
    PORT=5000
    NODE_ENV=production
    CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    ```

2.  **Start the app:** Run this single command in your terminal:
    ```bash
    docker compose up --build -d
    ```

3.  **Open the app:**
    *   **Frontend**: Open [http://localhost](http://localhost) in your browser.
    *   **Backend API**: Access [http://localhost/api](http://localhost/api).

---

### Path B: Run Locally 💻 (Step-by-Step)

Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

#### Step 1: Run the Backend Server
```bash
# 1. Enter the server directory
cd server

# 2. Install dependencies securely
pnpm install --ignore-scripts

# 3. Create a .env file with your database URI, Groq API key, and Clerk credentials
# 4. Start the server in development mode
pnpm run dev
```

#### Step 2: Run the Frontend Client
```bash
# 1. Open a new terminal and enter the client directory
cd client

# 2. Install dependencies securely
pnpm install --ignore-scripts

# 3. Create a .env file with VITE_API_URL and VITE_CLERK_PUBLISHABLE_KEY
# 4. Start the frontend developer preview
pnpm run dev
```
Open the browser link displayed in your terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## 🔑 Key Settings Explained

Here is what the environment settings actually mean:

*   **`GROQ_API_KEY`**: Connects the app to Groq AI so the AI suggestions can write.
*   **`CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`**: Power your login system so users can securely register and log in.
*   **`MONGO_URI`**: The database connection string where your resumes, users, and versions are saved.
*   **`JWT_SECRET`**: A private fallback key used to protect local data requests.

---

## 🗺️ What's Done & What's Next

### Done ✅
*   Real-time split-screen PDF preview.
*   Click-to-edit linking (sync between PDF and editor).
*   Groq AI Llama-3 integrations for quick optimizations.
*   ATS score auditor checking keywords.
*   Version history storage.
*   Public/Private link sharing controls.
*   Clerk Auth authentication.
*   Docker Compose production environment.

### Coming Soon 🔮
*   Multiple PDF layouts and templates (Minimalist, Corporate, Creative).
*   LinkedIn resume quick-import.
*   Premium token purchase gateway.
*   Hosting on a live web server!
