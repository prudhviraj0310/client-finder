# Client Finder — Target · Analyze · Convert 🎯

**Client Finder** is an autonomous, AI-driven B2B client acquisition platform. It replaces the traditional manual outreach pipeline with an end-to-end autonomous engine: instantly targeting global businesses with digital gaps, automatically structuring tactical gap analyses, and drafting hyper-personalized outbound hooks via AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Next JS](https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=white)

---

## ⚡ The Pipeline

### 1. TARGET (Global Scanner)
The global scanner taps directly into the **OpenStreetMap (Nominatim & Overpass)** live index to find real businesses in any global city without requiring expensive Maps API keys.
- Maps real businesses on an interactive **Premium Dark Mode Leaflet Map**.
- Automatically evaluates the "Digital Score" of the business.
- Specifically highlights actionable **"Gaps"** (e.g., Missing Website, No Phone, No Email, Low Reviews) that act as natural hooks for your agency/SaaS.

### 2. ANALYZE (Intelligence Layer)
Once a target is acquired, the platform pipes the raw gap data into an Intelligence Engine.
- Powered by **Google Gemini API**, it generates dynamic competitor audits.
- Calculates estimated revenue gaps based on missing elements.
- Develops an automated "Pitch Angle" specifically attacking the identified vulnerabilities.

### 3. CONVERT (AI Composer)
Converts raw analysis into high-converting outbound copy in seconds.
- Multi-variable Prompting: Adjusts output based on **Channel** (Email, LinkedIn, WhatsApp) and **Tone** (Aggressive, Value-Driven, Professional).
- Instantly drafts cold email subject lines and body copy referencing the exact gaps found during the targeting phase.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.22+ recommended)
- Your `GEMINI_API_KEY` for the AI composing engine 

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables:
   Copy `.env.example` (or create `.env.local`) and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Vanilla CSS (Glassmorphic Premium UI System)
- **Map Visualizer:** Leaflet / React-Leaflet
- **Data Indexing:** Overpass API & Nominatim
- **AI Brain:** Google Generative AI (Gemini Pro)
- **Icons:** Lucide React

---

*Built for building high-converting pipelines at scale.*
