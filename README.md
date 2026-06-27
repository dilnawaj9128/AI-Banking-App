# 🏦 AI BankApp — DevOps Project

A full-stack AI-powered banking application with complete DevOps pipeline.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPER                               │
│                     git push → GitHub                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │  webhook trigger
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│             CI/CD Pipeline (Jenkins + GitHub Actions)           │
│                                                                 │
│   Checkout → Build (Parallel) → Trivy Scan → Push → Deploy     │
│               ┌──────────┐  ┌──────────┐                       │
│               │ Frontend │  │ Backend  │  ← parallel build      │
│               └──────────┘  └──────────┘                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DockerHub Registry                           │
│      dilnawaz9128/ai-banking-app-frontend:tag                   │
│      dilnawaz9128/ai-banking-app-backend:tag                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │  kubectl apply
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Kubernetes Cluster (KIND on AWS EC2)               │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐    │
│   │  Frontend   │  │   Backend   │  │  HPA (Auto Scale)  │    │
│   │  (Nginx)    │  │  (Node.js)  │  │  min:2  max:5      │    │
│   │  Port: 80   │  │  Port: 5000 │  └────────────────────┘    │
│   └─────────────┘  └──────┬──────┘                            │
│                            │                                    │
│                     ┌──────▼──────┐                            │
│                     │   MongoDB   │                            │
│                     │   Pod       │                            │
│                     └─────────────┘                            │
└────────────────────────────────────────────────────────────────┘
                            
                            

```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Nginx |
| Backend | Node.js, Express |
| Database | MongoDB |
| CI/CD | Jenkins + GitHub Actions |
| Containerization | Docker, DockerHub |
| Orchestration | Kubernetes (AWS EKS) |
| Security Scan | Trivy |
| Cloud | AWS (EC2) |

## ✨ App Features

- 🔐 User Register / Login (JWT Auth)
- 💰 Account Balance Check
- 💸 Money Transfer
- 📊 Transaction History
- 🤖 AI Banking Assistant (Chatbot)
- 🚨 Fraud Detection Alerts

## 🚀 Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-bankapp.git
cd ai-bankapp

# Run with Docker Compose
docker-compose up -d

# Access:
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
# Grafana  → http://localhost:3001 (admin/admin123)
```

## ☁️ Deploy to AWS

```bash
# 1. Provision Infrastructure
cd terraform
terraform init
terraform plan -var="db_password=YourPass123!"
terraform apply

# 2. Configure kubectl
aws eks update-kubeconfig --name bankapp-cluster --region ap-south-1

# 3. Deploy to Kubernetes
kubectl apply -f k8s/
kubectl get pods -n bankapp
```

## 🔧 Jenkins Setup

1. Install plugins: Git, Docker Pipeline, Kubernetes CLI
2. Add credentials: `dockerhub-username`, `dockerhub-password`, `kubeconfig`
3. Create Pipeline job → point to `jenkins/Jenkinsfile`
4. Add GitHub webhook → `http://jenkins-url/github-webhook/`

## 📁 Project Structure

```
ai-bankapp/
├── backend/
│   ├── server.js           # Express API
│   ├── Dockerfile          # Multi-stage build
│   └── package.json
├── frontend/
│   ├── src/                # React app
│   └── Dockerfile
├── k8s/
│   ├── namespace-ingress.yaml
│   └── backend-deployment.yaml   # + HPA
├── terraform/
│   ├── main.tf             # VPC, EKS, RDS
│   └── variables.tf
├── jenkins/
│   └── Jenkinsfile         # CI/CD pipeline
├── monitoring/
│   └── prometheus.yml
├── .github/workflows/
│   └── ci-cd.yml           # GitHub Actions
└── docker-compose.yml      # Local dev
```

## 👨‍💻 Author
Dilnawaz | DevOps Engineer | Delhi, India
GitHub: github.com/dilnawaj9128
# AI-Banking-App
