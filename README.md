Here’s your project description formatted neatly in **Markdown** for use in your `README.md`:

```markdown
# IP Reverser App

Welcome to the **IP Reverser App**, a full-stack web application that allows users to perform reverse IP lookups, storing and retrieving IP data with a PostgreSQL database.  

This project follows modern **DevOps practices** — containerized with **Docker**, secured with **Trivy scans**, and deployed via a **GitHub Actions CI/CD pipeline** to a **Kubernetes cluster with ArgoCD**.

---

## 📖 Overview
This application:
- Reverses IP addresses (e.g., `192.168.1.1 → 1.1.168.192`).
- Stores the history in **PostgreSQL (AWS RDS)**.
- Provides **RESTful APIs** for IP management.
- Includes monitoring with **Prometheus** and **Grafana**, with alerts for downtime.

---

## ✨ Features

### API Endpoints
- `POST /api/ip/reverse` → Reverse a specific IP address.  
- `GET /api/ip/my-ip` → Get the client's current IP reversed.  
- `GET /api/ip/history` → Retrieve the history of reversed IPs.  
- `GET /api/ip/search?q=<ip>` → Search IP history by query.  

### Tech Features
- **Database:** PostgreSQL (AWS RDS) with Prisma ORM.  
- **Monitoring:** Prometheus for metrics, Grafana for dashboards, and `IpReverserAppDown` alert.  
- **Deployment:** Kubernetes (RKE2) with ArgoCD and Helm.  

---

## 📂 Folder Structure
```

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

````

---

## 🛠️ Tech Stack
- **Backend:** Node.js, TypeScript, Express, Prisma  
- **Database:** PostgreSQL (AWS RDS)  
- **Containerization:** Docker  
- **Orchestration:** Kubernetes (RKE2) with Helm and ArgoCD  
- **CI/CD:** GitHub Actions (build, test, security scan, deploy)  
- **Security:** Trivy vulnerability scanning (SARIF uploaded to GitHub Security tab)  
- **Ingress:** AWS ALB with custom domain (`ip-reverse.cloudknight-api.com`)  

---

## ⚙️ Deployment Workflow
The deployment pipeline runs automatically on push to `main`:

1. **Test**  
   - Installs dependencies and runs backend tests with a test PostgreSQL database.

2. **Build & Push**  
   - Builds Docker image: `docker.io/oluwaseun1511/ip-reverser-app`.  
   - Pushes to Docker Hub with tags (`main`, `latest`, `main-<commit-sha>`).

3. **Security Scan**  
   - Runs Trivy against the Docker image.  
   - Uploads SARIF results to GitHub Security → Code Scanning Alerts.

4. **Update Manifests**  
   - Updates `helm/values.yaml` with the new image tag and deployment timestamp.  
   - Commits and pushes changes to trigger ArgoCD sync.

5. **Deploy to Staging**  
   - ArgoCD syncs the updated Helm chart to the `apps-prod` namespace on the RKE2 cluster.

6. **Promote to Production (future)**  
   - Placeholder for production deployment.

---

## 🏗️ Architecture
```mermaid
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
        J -->|Deploy| K[Kubernetes RKE2 Cluster]
    end
````

---

## 🚀 Running Locally

### Clone Repository

```bash
git clone https://github.com/Oluwaseun2003/reversed-ip-app.git
cd reversed-ip-app/backend
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ipreverser?sslmode=disable
```

Run PostgreSQL with Docker:

```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ipreverser \
  postgres:15
```

### Apply Migrations

```bash
npx prisma migrate dev --name init
```

### Run Locally

```bash
npm run dev
```

### Build Docker Image

```bash
docker build -t oluwaseun1511/ip-reverser-app:latest .
```

### Run with Docker

```bash
docker run -p 3001:3000 \
  -e DATABASE_URL=postgresql://postgres:password@localhost:5432/ipreverser?sslmode=disable \
  oluwaseun1511/ip-reverser-app:latest
```

---

## ☁️ Kubernetes Deployment

### Apply Prisma Migrations

```bash
kubectl apply -f prisma-migrate-job.yaml
kubectl get jobs -n apps-prod
kubectl logs -n apps-prod -l job-name=prisma-migrate
```

### Deploy with ArgoCD

```bash
argocd app sync ip-reverser-app -n argocd --force
```

### Check Deployment

```bash
kubectl get namespace
kubectl get pods -n apps-prod -l app=ip-reverser-app
kubectl get svc -n apps-prod
```

---

## 🧪 Testing the API with curl

Base URL: `http://ip-reverse.cloudknight-api.com`

**Reverse a Specific IP**

```bash
curl -X POST http://ip-reverse.cloudknight-api.com/api/ip/reverse \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.6.5"}'
```

Example Response:

```json
{
  "success": true,
  "data": {
    "id": "3d875bbd-de3c-490c-9e47-eb8aa448e18c",
    "originalIP": "192.168.6.5",
    "reversedIP": "5.6.168.192",
    "requestIP": "10.0.20.21",
    "userAgent": "curl/8.8.0",
    "createdAt": "Wed Aug 20 2025 09:53:33 GMT+0000 (UTC)",
    "timestamp": "2025-08-20T09:53:33.547Z"
  },
  "message": "IP address reversed and stored successfully"
}
```

**Get Your Current IP Reversed**

```bash
curl http://ip-reverse.cloudknight-api.com/api/ip/my-ip
```

**View History of Reversed IPs**

```bash
curl http://ip-reverse.cloudknight-api.com/api/ip/history
```

**Search Reversed IPs**

```bash
curl "http://ip-reverse.cloudknight-api.com/api/ip/search?q=192"
```

---

## 🔒 Security

* **Database:** PostgreSQL on AWS RDS with SSL (`sslmode=require`) and restricted security group.
* **CI/CD:** Trivy scans dependencies and Docker images, uploads SARIF results to GitHub Security.
* **Kubernetes:** Non-root containers, dropped capabilities, Seccomp profile enforced.

---

## 📌 Future Improvements

* Add a frontend dashboard for reverse IP lookups.
* Implement Redis for caching frequent lookups.
* Add user authentication and rate-limiting.
* Enable production deployment in `cicd.yaml`.
* Configure monitoring with Prometheus and Grafana (pending Node Exporter fix).

---

## 🛠️ Troubleshooting

* **Node Exporter No Data:** Restricted PodSecurity policy blocking `hostNetwork` and `hostPath`.
* **Alert Not Firing:** Verify scrape targets in Prometheus UI (`http://localhost:9090/targets`).
* **Deployment Issues:** Check ArgoCD sync status:

  ```bash
  argocd app get ip-reverser-app -n argocd
  ```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature-name
   ```
3. Commit changes:

   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:

   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

* Built by **Oluwaseun2003**.

```


```
