# Vehicle Service Management System

A modern, AI-powered vehicle service management platform built with [Convex](https://convex.dev), React, TypeScript, and Google Gemini AI.

## ✨ Features

- 🚗 **Vehicle Service Booking** - Easy-to-use appointment booking system for cars and motorbikes
- 📅 **Appointment Management** - Track upcoming and past appointments with expandable details
- 🤖 **AI-Powered Service Reports** - Generate comprehensive service reports using Google Gemini AI
- 📊 **Service History** - View detailed service reports with cost breakdowns and recommendations
- 🎨 **Modern UI** - Beautiful, responsive design with shadcn/ui components and dark mode support
- 🔔 **Smart Reminders** - Automated reminders for upcoming appointments and next service due dates

This project is built with [Chef](https://chef.convex.dev) and connected to the Convex deployment named [`keen-camel-802`](https://dashboard.convex.dev/d/keen-camel-802).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Convex account ([Sign up free](https://convex.dev))
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Add your Google Gemini API key to the Convex dashboard:
   - Go to [Convex Dashboard](https://dashboard.convex.dev)
   - Navigate to Settings > Environment Variables
   - Add variable: `GOOGLE_GEMINI_API_KEY` with your API key

4. Start the development server:
```bash
npm run dev
```

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## 🔑 Environment Variables

Add the following environment variable in your Convex dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GEMINI_API_KEY` | Your Google Gemini API key for AI report generation | Yes |

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Convex (real-time database & serverless functions)
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: Google Gemini (gemini-1.5-flash model)
- **Authentication**: Convex Auth

## 📱 Features in Detail

### Expandable Appointments
- Click on any past appointment to view complete details
- See all booking information including vehicle details, service type, and notes
- Visual status indicators with color-coded badges

### AI Service Reports
- Generate detailed service reports with one click
- Reports include:
  - Services performed
  - Parts replaced with costs
  - Labor costs breakdown
  - Vehicle condition assessment
  - Future maintenance recommendations
  - Next service due date
- Reports are saved permanently and can be accessed anytime

### Modern UI
- Beautiful gradients and smooth animations
- Fully responsive design
- Dark mode support
- Icon-based navigation with Lucide icons
- Accessible components from shadcn/ui

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## 📚 Additional Documentation

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed implementation information and technical documentation.
