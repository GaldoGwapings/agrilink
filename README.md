# AgriLink

AgriLink is a web-based agricultural marketplace platform designed to connect Filipino farmers and buyers in Mindanao. The system enables farmers to list upcoming harvests in advance, while buyers can browse, filter, and express interest in available crops. An AI-powered assistant named Ani helps buyers find products using natural conversation in Taglish (Tagalog-English).

## Live Demo

https://agrilink-gold.vercel.app

## Features

- Farmer dashboard for listing and managing upcoming harvests
- Buyer marketplace with search and filter by crop category and province
- Interactive harvest map powered by Leaflet showing harvest locations across Mindanao
- AI chat assistant (Ani) powered by Groq LLaMA 3.3 for crop recommendations
- Real-time notifications when buyers express interest in a listing
- User authentication and profile management via Supabase
- Account deletion for both farmer and buyer accounts

## Tech Stack

| React + TypeScript (Vite) | Frontend framework |
| Tailwind CSS | Styling and layout |
| Supabase | Database, authentication, and real-time backend |
| Groq API (LLaMA 3.3) | AI assistant (Ani) |
| React Leaflet | Interactive harvest map |
| Framer Motion | UI animations and transitions |
| Vercel | Deployment and hosting |

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A Supabase project
- A Groq API key

## Setup and Installation

1. Clone the repository

```bash
   git clone https://github.com/GaldoGwapings/agrilink
   cd agrilink
```

2. Install dependencies

```bash
   npm install
```

3. Create a `.env` file in the project root with the following variables

```env
   VITE_SUPABASE_URL=supabase_project_url
   VITE_SUPABASE_ANON_KEY=supabase_anon_key
   VITE_GROQ_API_KEY=groq_api_key
```

4. Start the development server

```bash
   npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

| Variable | Description |
|---|---|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous public key |
| VITE_GROQ_API_KEY | Groq API key for the AI assistant |


## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Push your repository to GitHub
2. Import the project in the Vercel dashboard
3. Add the environment variables under Project Settings → Environment Variables
4. Deploy

## License

This project was developed as an academic requirement. All rights reserved.