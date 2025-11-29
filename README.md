🌟 FinLume – AI-Powered Personal Financial Coaching System

FinLume is an intelligent financial coaching platform built to help individuals—especially gig workers, freelancers, and users with irregular income—manage their finances smarter.
It uses AI-driven analysis, personalized recommendations, automatic spending categorization, and goal tracking to guide users toward better financial habits.

🚀 Live AI Agent (Google AI Studio Deployment)

You can interact with the FinLume AI Coach here:

👉 FinLume AI Coach (Google AI Studio)
🔗 https://aistudio.google.com/apps/drive/1zr-F7wE7SSK47Cn-_Ue90KGD1GIqDnyY?showAssistant=true&showPreview=true&resourceKey=

📌 Table of Contents

About FinLume

Key Features

Tech Stack

Project Structure

Installation & Setup

Guest Login

How the AI Works

Screenshots

Future Improvements

Contributing

License

🧠 About FinLume

FinLume provides financial clarity by:

Tracking spending

Understanding income patterns

Detecting overspending

Identifying risks

Suggesting actionable saving strategies

Offering a conversational AI financial coach

Visualizing expenses with charts

It simplifies finance for users who want simple, smart, and personalized guidance.

🌟 Key Features
🔐 Login + Guest Mode

Secure login for users

Instant Guest Access to explore the app

Demo credentials included

🧩 AI Financial Coach (Google AI Studio Agent)

Personalized financial advice

Month summary insights

Overspending detection

Goal-based suggestions

“What-if” financial simulations

Simple, friendly conversation style

🏦 Mock Bank Account Integration

Sample accounts & transactions

Automatically categorized expenses

Multi-month data simulation

📊 Interactive Dashboard

Monthly income vs expenses graph

Category-wise spending breakdown

AI-generated insights

Savings pattern visualization

🎯 Goal Tracking

Create & monitor saving goals

AI advice to stay on track

🧠 AI Insights Engine

Detects spending patterns

Highlights unusual transactions

Gives actionable financial tips

🛠️ Tech Stack
Frontend

React + TypeScript

Tailwind CSS

Recharts (graphs)

AI Layer

Google AI Studio (Gemini)

Custom system prompts

JSON structured insight model

Mock Backend

Local mock data service

Client-side authentication

API-like abstraction for transactions & goals

📂 Project Structure
/src
 ├── components
 │    ├── Dashboard.tsx
 │    ├── CoachChat.tsx
 │    ├── Login.tsx
 │    ├── Goals.tsx
 │    └── TransactionForm.tsx
 │
 ├── services
 │    ├── geminiService.ts
 │    ├── mockDataService.ts
 │    └── authService.ts
 │
 ├── context
 │    └── AppContext.tsx
 │
 ├── utils
 │    └── helpers.ts
 │
 ├── assets
 │
 └── App.tsx

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/finlume.git
cd finlume

2️⃣ Install dependencies
npm install

3️⃣ Start the development server
npm run dev


The app runs on:

http://localhost:5173

👤 Guest Login

You can explore FinLume without creating an account.

Demo Credentials
Email: demo@finlume.ai
Password: FinLume@123


Or choose Guest Access on the login screen to load sample financial data instantly.

🤖 How the AI Works

FinLume uses a Google AI Studio agent built with:

A custom system prompt

Financial context summarization

Spending analysis

Savings strategy generation

Explainable AI reasoning

Insight generation in JSON format

The frontend sends:

Monthly transactions

Category totals

Goals

Account balances

The AI responds with:

Insights

Explanations

🖼️ Screenshots

<img width="1919" height="1039" alt="image" src="https://github.com/user-attachments/assets/726ccb1a-e2d8-4b81-8562-6c751b494136" />

/screenshots/coaching.png
/screenshots/insights.png

🚀 Future Improvements

Real bank API integration (Plaid / Salt / Yodlee)

Notifications for overspending

Multi-user financial profiles

Secure cloud database

Income forecasting

Subscription tracking automation

Mobile app version

🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss your ideas.
