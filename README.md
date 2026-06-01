# Res_AI — AI Resume Builder & ATS Optimizer

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
  <img src="https://img.shields.io/badge/SonarQube_Cloud-Passed-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white" alt="SonarQube Cloud" />
</p>


Res_AI is a split-screen **AI Resume Builder & ATS Optimizer**. It leverages the **Groq API (Llama-3)** to analyze job descriptions, optimize resume content, score ATS compatibility, and export print-ready PDFs, backed by a robust and seamless **Clerk Authentication** system.

---

## 🌟 Key Features

*   **Split-Screen Interface**: Real-time side-by-side editing and live Calibri PDF preview.
*   **Click-to-Edit Syncing**: Clicking a section on the PDF preview instantly highlights the correct input field.
*   **ATS Audit Meter**: Real-time score calculator checking matched vs. missing keywords and formatting.
*   **Groq AI Optimization**: Automatically tailors summaries, bullet points, and skills to specific job descriptions.
*   **Version History**: Keep track of multiple saved resume drafts and AI optimization versions.
*   **Privacy Control**: Quickly toggle resumes between Public and Private with shareable link slugs.
*   **Seamless Authentication**: Instant authorization using Clerk Auth, coupled with MongoDB sync for credits and resume profile mappings.

---

## 💻 Tech Stack

*   **Frontend**: React 19 (Vite), TailwindCSS, TanStack Query (v5), Zustand.
*   **Backend**: Node.js, Express, MongoDB (Mongoose), Clerk Backend integration with JWT Auth fallback.
*   **AI Engine**: **Groq AI Cloud** & **Meta Llama-3** (structured prompt analysis).
*   **Environment**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start

### Running with Docker (Recommended)

1.  Create a `.env.docker` file in the root directory:
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

2.  Run the build command:
    ```bash
    docker compose up --build -d
    ```

3.  Access the app:
    *   Frontend: [http://localhost](http://localhost)
    *   Backend: [http://localhost/api](http://localhost/api)

---

### Running Locally

#### 1. Server Setup
> [!NOTE]
> Ensure you have MongoDB running locally (usually `mongodb://localhost:27017/ai-resume-builder`) or use a cloud MongoDB Atlas URI. Get your Groq API key at the [Groq Console](https://console.groq.com/) and your keys from the [Clerk Dashboard](https://dashboard.clerk.com/).

```bash
cd server
pnpm install --ignore-scripts
# Add .env with MONGO_URI, JWT_SECRET, GROQ_API_KEY, PORT=5000, and CLERK keys
pnpm run dev
```

#### 2. Client Setup
```bash
cd client
pnpm install --ignore-scripts
# Add .env with VITE_API_URL=http://localhost:5000/api and VITE_CLERK_PUBLISHABLE_KEY
pnpm run dev
```
Access the client UI at [http://localhost:5173](http://localhost:5173) (or the port outputted in your console).

---

## 🔑 Environment Variables

Create a `.env` file (for local development) or a `.env.docker` file (for Docker Compose) in the root directory with the following variables:

### Core Configurations
*   **`MONGO_URI`**: MongoDB connection string (e.g., `mongodb://localhost:27017/ai-resume-builder` or `mongodb://mongo:27017/ai-resume-builder` for Docker).
*   **`JWT_SECRET`**: A private secure string used as a fallback signature for user authentication JWTs.
*   **`JWT_EXPIRES_IN`**: Token expiration configuration (e.g., `7d`).
*   **`GROQ_API_KEY`**: Your API Key from the [Groq Console](https://console.groq.com/).
*   **`PORT`**: Backend server port (defaults to `5000`).
*   **`CLIENT_URL`**: Frontend domain for CORS verification (e.g., `http://localhost:5173` or `http://localhost`).

### Clerk Authentication
*   **`CLERK_PUBLISHABLE_KEY`** / **`VITE_CLERK_PUBLISHABLE_KEY`**: Clerk Frontend Publishable Key.
*   **`CLERK_SECRET_KEY`**: Clerk Private Backend Secret Key.

### SMTP Mailer (Optional)
Required only if enabling password recovery and verification emails:
*   **`SMTP_HOST`** / **`SMTP_PORT`**: Your SMTP server address and port.
*   **`SMTP_USER`** / **`SMTP_PASS`**: SMTP mail account credentials.
*   **`SMTP_SECURE`**: Toggle secure connection (`true` or `false`).
*   **`EMAIL_FROM`**: The sender email address (e.g., `ResuAI <noreply@resuai.com>`).

---

## 🗺️ Roadmap

### Completed
*   [x] Split-screen interface showing the editor form and live PDF preview side-by-side.
*   [x] Click-to-edit linking to instantly highlight and scroll to input fields from the PDF preview.
*   [x] Groq API & Llama-3 integration to auto-generate resume summaries, bullet points, and skills.
*   [x] Deep ATS Auditor scoring matched vs. missing job description keywords in real-time.
*   [x] Version history manager to save, restore, and delete historical resume drafts.
*   [x] Public/Private visibility controls with secure, shareable public slug URLs.
*   [x] Standardised multi-container setup running under Docker and Nginx reverse proxy.
*   [x] Solid Clerk Auth user-identity mapping synced automatically with local MongoDB user profiles.
*   [x] Robust production Docker builds avoiding non-interactive package manager blocks.
*   [x] Passed SonarQube Cloud Quality Gate with strict secure coding practices (fully mitigated NoSQL, ReDoS, and Host Header Injection vulnerabilities).


### Future Updates
*   [ ] Add multiple selectable PDF templates (e.g., Classic, Creative, Minimalist).
*   [ ] Implement one-click LinkedIn profile import and sync.
*   [ ] Integrate a secure payment gateway for purchasing premium AI tokens and credits.
*   [ ] Live website deployment.
