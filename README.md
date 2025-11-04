<div align="center">

	<h1>SkillSwap — Exchange Skills, Learn Together</h1>
  
	<p><strong>One‑liner:</strong> A peer‑to‑peer skill exchange platform that matches learners and mentors and lets them chat, learn, and grow.</p>
	<p><em>Tagline:</em> Trade knowledge, not money. 🚀</p>

	<!-- Badges -->
	<p>
		<a href="https://react.dev"><img alt="React" src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" /></a>
		<a href="https://vitejs.dev"><img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" /></a>
		<a href="https://tailwindcss.com/"><img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" /></a>
		<a href="https://firebase.google.com/"><img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20RTDB%20%7C%20Storage-FFCA28?logo=firebase&logoColor=black" /></a>
		<img alt="Platform" src="https://img.shields.io/badge/Platform-Web-0A0A0A?logo=google-chrome&logoColor=white" />
		<a href="#license"><img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg" /></a>
	</p>

	<p>
		<a href="#-table-of-contents">Jump to docs ↓</a>
	</p>
</div>

---

## 🧭 Overview

SkillSwap is a web platform built with React, Vite, TailwindCSS and Firebase that helps people exchange skills. Users can create profiles, list skills they can teach and want to learn, discover matches, and chat in real time.

- Type: Web app (React + Vite + TailwindCSS)
- Backend/Infra: Firebase (Auth, Firestore, Realtime Database, Storage)

> Problem: Learning is expensive and 1:1 mentorship is hard to access. Many people have skills to teach but no channel to exchange them.
>
> Solution: A peer‑to‑peer marketplace that matches complementary skill needs and enables secure messaging and progress tracking.

---

## 🗂️ Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Live Demo](#-live-demo)
4. [Quickstart (Local Setup)](#-quickstart-local-setup)
5. [Environment Variables](#-environment-variables)
6. [APIs / Backend](#-apis--backend)
7. [Folder Structure](#-folder-structure)
8. [Usage Guide](#-usage-guide)
9. [Screenshots](#-screenshots)
10. [Future Scope / Roadmap](#-future-scope--roadmap)
11. [Hackathon Theme](#-hackathon-theme)
12. [Contributors](#-contributors)
13. [License](#license)

---

## ✨ Features

- Account auth with Firebase (email/password)
- Rich profiles with bio, avatar, teach/learn skills
- Explore page with search and category filters
- Smart mutual matching helper (see `src/utils/matching.js`)
- Real‑time chat (Firebase Realtime Database)
- Ratings/XP foundations (docs in `XP_SYSTEM.md` and `RATING_SYSTEM.md`)
- Dark mode with persistent theme
- Accessibility (skip links, focus styles) and SEO meta

---

## 🧰 Tech Stack

- Frontend: React 18, Vite 7, TailwindCSS 4
- State/Context: React Context (Auth / Dark Mode)
- Backend: Firebase (Auth, Firestore, Realtime Database, Storage)
- Deployment: Any static host (Firebase Hosting, Vercel, Netlify)

---

## 🌐 Live Demo

- URL: <YOUR_DEPLOYED_URL_HERE>

### Demo Credentials (optional)
- Username: demo@example.com
- Password: demo123

---

## 🧑‍💻 Quickstart (Local Setup)

> Requires Node.js 18+ and npm.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>/skill-exchange-platform
npm install

# Copy env template and fill values from Firebase Console
cp .env.example .env

# Start dev server
npm run dev
```

Open the printed URL (e.g. http://localhost:5173 or the next free port).

---

## 🔐 Environment Variables

Create `.env` in `skill-exchange-platform/` (see `.env.example`).

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=https://<project-id>-default-rtdb.firebaseio.com
```

Notes:
- Storage bucket must be the bucket name (e.g., `my-project.appspot.com`), not the public download domain.

---

## 🔌 APIs / Backend

This project uses Firebase for most backend features:

- Auth: Email/Password login (see `src/services/authService.js`)
- Firestore: User profiles, posts, matches (see `src/services/firebaseService.js`)
- Realtime Database: Chats (`/messages/{chatId}`) and user chat index (`/userChats/{uid}`)
- Storage: Profile photos under `profile-photos/{uid}/...`

High‑level flows:
- Creating a chat: `createChat(user1Id, user2Id)` creates/links chat in RTDB + user index
- Messaging: `sendMessage(chatId, senderId, text)` pushes to RTDB and updates lastMessage
- Profiles: `getUserProfile(uid)` / `saveUserProfile(uid, data)` in Firestore

---

## 🧱 Folder Structure

```
skill-exchange-platforn/
├─ README.md                     # This file
└─ skill-exchange-platform/
	 ├─ README.md                  # Vite template (can be replaced)
	 ├─ index.html
	 ├─ package.json
	 ├─ src/
	 │  ├─ App.jsx, main.jsx, index.css, App.css
	 │  ├─ assets/
	 │  ├─ components/
	 │  │  ├─ common/ (Button, Card, Input, ErrorBoundary, ...)
	 │  │  ├─ layout/ (Navbar, Footer, MainLayout)
	 │  │  └─ animations/, 3d/
	 │  ├─ contexts/ (AuthContext, DarkModeContext)
	 │  ├─ pages/ (Landing, Login, Profile, Explore, Chat, Dashboard)
	 │  ├─ routes/
	 │  ├─ services/ (firebaseService.js, authService.js, ...)
	 │  ├─ firebase/ (config.js)
	 │  └─ utils/ (matching.js, validation.js, ...)
	 ├─ public/
	 ├─ tailwind.config.js
	 └─ postcss.config.js
```

---

## 🎯 Usage Guide

1. Sign up or log in
2. Edit your profile — add bio, upload avatar, list teach/learn skills
3. Explore & filter posts; check mutual matches
4. Start a chat and schedule a session

---

## 🖼️ Screenshots

> Place screenshots in `skill-exchange-platform/src/assets/` and reference them here.

![Landing](skill-exchange-platform/src/assets/screenshot-landing.png)
![Explore](skill-exchange-platform/src/assets/screenshot-explore.png)
![Chat](skill-exchange-platform/src/assets/screenshot-chat.png)

---

## 🗺️ Future Scope / Roadmap

- Calendar integration for session scheduling
- Skill verification and endorsements
- Group learning rooms and live sessions
- Better ranking/matching with ML

---

## 🧩 Hackathon Theme

SkillSwap advances accessible education by enabling peer‑to‑peer knowledge exchange. It aligns with themes like EdTech, Community, Productivity, and Financial Inclusion (learning without cost).

---

## 👥 Contributors

- Your Name (@yourhandle)

> Want to contribute? Open an issue or a PR — we welcome improvements.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

If this project helps you, consider giving it a ⭐

</div>
