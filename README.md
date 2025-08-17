# IP Reverser Application

A full-stack TypeScript application that reverses IP addresses and stores them in a database.

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- kubectl
- helm

### Quick Start

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start with Docker Compose:
   \`\`\`bash
   npm run docker:up
   \`\`\`

4. Or run locally:
   \`\`\`bash
   # Terminal 1: Start database
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15-alpine
   
   # Terminal 2: Start backend
   cd backend && npm run dev
   
   # Terminal 3: Start frontend
   cd frontend && npm run dev
   \`\`\`

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **DevOps**: Docker, Kubernetes, Helm, ArgoCD, GitHub Actions
- **Monitoring**: Prometheus, Grafana

## Project Structure
See the folder structure in the repository for detailed organization.

