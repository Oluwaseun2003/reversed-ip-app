🛰️ Reverse IP App
A full-stack web application that allows users to perform reverse IP lookups, storing and retrieving IP data with a PostgreSQL database. The project follows modern DevOps practices — containerized with Docker, secured with Trivy scans, and deployed via GitHub Actions CI/CD pipeline to a Kubernetes cluster with ArgoCD.

📂 Folder Structure
reversed-ip-app/
├── .github/
│   └── workflows/        # CI/CD pipelines (build, test, deploy, security scans)
├── helm/                 # Helm chart for Kubernetes deployment
├── backend/              # Application source code (TypeScript/Node.js backend)
│   ├── src/
│   │   ├── controllers/  # Express controllers
│   │   ├── services/     # Business logic (IP lookup services)
│   │   ├── types/        # TypeScript type definitions
│   │   └── index.ts      # App entrypoint
│   ├── prisma/           # Prisma schema and migrations
│   ├── Dockerfile        # Container build definition
│   ├── package.json      # Dependencies and scripts
│   └── tsconfig.json     # TypeScript config
└── README.md             # Documentation


🛠️ Tech Stack

Backend: Node.js, TypeScript, Express, Prisma
Database: PostgreSQL (AWS RDS)
Containerization: Docker
Orchestration: Kubernetes (EKS) with Helm and ArgoCD
CI/CD: GitHub Actions (build, test, security scan, deploy)
Security: Trivy vulnerability scanning (SARIF results uploaded to GitHub Security tab)
Ingress: AWS ALB with custom domain (ip-reverse.cloudknight-api.com)


⚙️ Deployment Workflow
The deployment pipeline runs automatically on push to main:

Test:
Installs dependencies and runs backend tests with a test PostgreSQL database.


Build & Push:
Builds Docker image (docker.io/oluwaseun1511/ip-reverser-app).
Pushes to Docker Hub with tags (main, latest, main-<commit-sha>).


Security Scan:
Runs Trivy against the Docker image.
Uploads SARIF results to GitHub’s Security tab.


Update Manifests:
Updates Helm values.yaml with the new image tag and deployment timestamp.
Commits and pushes changes to trigger ArgoCD sync.


Deploy to Staging:
ArgoCD syncs the updated Helm chart to the apps-prod namespace on an AWS EKS cluster.


Promote to Production (commented out):
Placeholder for future production deployment.




🏗️ Architecture
graph TD
    A[User] -->|HTTP Request| B[Ingress: ip-reverse.cloudknight-api.com]
    B --> C[Reverse IP App API]
    C --> D[IP Lookup Service]
    C --> E[PostgreSQL on AWS RDS]
    C --> F[Response as JSON]

    subgraph DevOps
        G[GitHub Actions CI/CD]
        G -->|Build & Test| H[Docker Image]
        G -->|Trivy Scan| I[Security Alerts]
        G -->|Update Helm| J[ArgoCD]
        J -->|Deploy| K[Kubernetes EKS Cluster]
    end


🚀 Running Locally

Clone Repository:
git clone https://github.com/Oluwaseun2003/reversed-ip-app.git
cd reversed-ip-app/backend


Install Dependencies:
npm install


Set Up Environment:

Create a .env file with:DATABASE_URL=postgresql://postgres:password@localhost:5432/ipreverser?sslmode=disable


For local PostgreSQL, use Docker:docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ipreverser postgres:15




Apply Migrations:
npx prisma migrate dev --name init


Run Locally:
npm run dev


Build Docker Image:
docker build -t oluwaseun1511/ip-reverser-app:latest .


Run with Docker:
docker run -p 3001:3000 -e DATABASE_URL=postgresql://postgres:password@localhost:5432/ipreverser?sslmode=disable oluwaseun1511/ip-reverser-app:latest




☁️ Kubernetes Deployment

Apply Prisma Migrations:
kubectl apply -f prisma-migrate-job.yaml
kubectl get jobs -n apps-prod
kubectl logs -n apps-prod -l job-name=prisma-migrate


Deploy with ArgoCD:
argocd app sync ip-reverser-app -n argocd --force


Check Deployment:
kubectl get namespace
kubectl get pods -n apps-prod -l app=ip-reverser-app
kubectl get svc -n apps-prod




🧪 Testing the API with curl
After deploying to the Kubernetes cluster, test the endpoints using the Ingress URL (http://ip-reverse.cloudknight-api.com):

Reverse a Specific IP:
curl -X POST http://ip-reverse.cloudknight-api.com/api/ip/reverse \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.6.5"}'

Example Response:
{
  "success": true,
  "data": {
    "id": "3d875bbd-de3c-490c-9e47-eb8aa448e18c",
    "originalIP": "192.168.6.5",
    "reversedIP": "5.6.168.192",
    "requestIP": "10.0.20.21",
    "userAgent": "curl/8.8.0",
    "createdAt": "Wed Aug 20 2025 09:53:33 GMT+0000 (Coordinated Universal Time)",
    "timestamp": "2025-08-20T09:53:33.547Z"
  },
  "message": "IP address reversed and stored successfully"
}


Get Your Current IP Reversed:
curl http://ip-reverse.cloudknight-api.com/api/ip/my-ip


View History of Reversed IPs:
curl http://ip-reverse.cloudknight-api.com/api/ip/history


Search Reversed IPs:
curl "http://ip-reverse.cloudknight-api.com/api/ip/search?q=192"




🔒 Security

Database: PostgreSQL on AWS RDS with SSL (sslmode=require) and restricted security group (10.0.0.0/16 pending).
CI/CD: Trivy scans for vulnerabilities in dependencies and Docker images, with SARIF results uploaded to GitHub’s Security → Code Scanning Alerts tab.
Kubernetes: Non-root containers, dropped capabilities, and Seccomp profile enforced.


📌 Future Improvements

Add a frontend dashboard for reverse IP lookups.
Implement Redis for caching frequent lookups.
Add user authentication and rate-limiting for API usage.
Enable production deployment in cicd.yaml with RKE cluster setup.
Configure monitoring with Prometheus and Grafana.

