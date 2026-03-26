<div align="center">
  <img width="1200" height="475" alt="Orion AI Text RPG Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Orion AI Text RPG

Orion is a cinematic, AI-powered text adventure experience that leverages the power of Gemini to create dynamic, immersive narratives. Set across various themes from Cyberpunk to High Fantasy, Orion offers a unique journey where every choice matters and every story has a definitive conclusion.

## ✨ Key Features

- **Dynamic AI Narratives**: Powered by Google Gemini through a secure backend service.
- **Multiple Themes**: Explore Neo-Shanghai (Cyberpunk), Medieval Fantasy, Post-Apocalyptic wastelands, or create your own custom setting.
- **Stateless & Robust**: Advanced prompt engineering ensures consistent state management across turns.
- **Visual & Audio Cues**: Interactive UI with glitch effects, shake animations, and an adaptive audio engine.
- **Secure Authentication**: Integrated user login and registration to preserve your progress and manage access.
- **Responsive Design**: A premium, futuristic terminal-style interface built with React and Vanilla CSS.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- NPM or Yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yaohuangguan/orion-ai-text-rpg.git
   cd orion-ai-text-rpg
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   The application now uses a centralized backend API. No local Gemini API key is required for the client-side.
   (If you are running the backend locally, configure your `.env` accordingly).

4. **Launch the app**:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Lucide React (Icons)
- **Styling**: Vanilla CSS with futuristic design patterns
- **Backend API**: Node.js / Express (Hosted on Google Cloud Run)
- **AI Engine**: Google Gemini 1.5 Flash (via Backend)
- **State Management**: React Hooks & Local Storage Persistence

## 🔒 Security & Auth

Orion requires user authentication to access the AI Game Master. This protects our API resources and allows for future features like cloud-based save syncing and personalized mission logs.

---

Built with ❤️ by the Orion Team.
