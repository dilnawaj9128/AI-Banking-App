# 🏦 AUREX — AI Banking App

A full-stack AI-powered banking application with complete DevOps pipeline

## 🏗️ Architecture
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/170e81b1d5a2cce38efc4ac534dec7d8a6a2a14f/screenshots/file_00000000833872098aa8eac51c95386d%20(1).png)
## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Nginx |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| CI/CD | Jenkins |
| Containerization | Docker, DockerHub |
| Orchestration | Kubernetes (KIND) |
| Security Scan | Trivy |
| Cloud | AWS EC2 |

## ✨ App Features

- 🔐 User Register / Login (JWT Auth)
- 💰 Account Balance Check
- 💸 Money Transfer
- 📊 Transaction History
- 🤖 AI Banking Assistant (Chatbot)

## 🖼️ Screenshots

### Login Page — Backend Connected
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/397c8d0f541baef141274dd3d59679e4b63e9085/screenshots/Screenshot%20from%202026-06-25%2015-04-48.png)

### Dashboard — Account Overview
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/ef21ab6d90c60e4d777f7645a3a2d63b0eaa058a/Screenshot%20from%202026-06-25%2015-03-49.png)
### CI/CD Pipeline
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/2dac572c39009c4c824a2517d7bffa971b0d756b/screenshots/Screenshot%20from%202026-06-28%2002-31-44.png)

### AI Assistant
![AI Assistant](screenshots/ai-assistant.png)

### Kubernetes — Pods, Nodes & Services
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/2a0fed8bb722f71a05065014c01ceec738602106/screenshots/Screenshot%20from%202026-06-28%2001-57-47.png)

### DockerHub — Images Pushed
![DockerHub](screenshots/dockerhub.png)

### Trivy Security Scan
![image](https://github.com/dilnawaj9128/AI-Banking-App/blob/cb455ea411c1cfd99ffb9fd32d612e9d4b5e2109/screenshots/Screenshot%20from%202026-06-28%2002-02-00.png)

## 🚀 Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/dilnawaj9128/AI-Banking-App.git
cd AI-Banking-App

# Run with Docker Compose
docker-compose up -d

# Access:
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

## ☸️ Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml

# Check status
kubectl get pods
kubectl get svc

# Access app
kubectl port-forward svc/ai-banking-service 9090:80 --address 0.0.0.0 &
```

## 🔧 Jenkins Setup

1. Install plugins: Git, Docker Pipeline
2. Add credentials: `dockerHubCred` (username + password)
3. Give kubectl access to Jenkins:
```bash
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```
4. Create Pipeline job → point to `Jenkinsfile`
5. Add GitHub webhook → `http://<jenkins-url>:8080/github-webhook/`

## ⚙️ CI/CD Pipeline Stages

```
1. 📥 Code Clone       — Pull latest code from GitHub
2. 🐳 Docker Build     — Build frontend & backend images (parallel)
3. 🔍 Security Scan    — Trivy scan for HIGH/CRITICAL vulnerabilities
4. 📤 Push to DockerHub — Tag and push images
5. ☸️  Deploy to K8s   — kubectl apply + rollout restart
6. ✅ Health Check     — Verify all pods are running
```

## 📁 Project Structure

```
AI-Banking-App/
├── backend/
│   ├── index.js            # Express API
│   └── Dockerfile
├── frontend/
│   ├── src/                # React app
│   ├── nginx.conf          # Reverse proxy config
│   └── Dockerfile
├── k8s/
│   ├── deployment.yml      # App + MongoDB deployments
│   └── service.yml         # NodePort + ClusterIP services
├── screenshots/            # Project screenshots
├── Jenkinsfile             # CI/CD pipeline
└── docker-compose.yml      # Local dev
```

## ☸️ Kubernetes Resources

| Resource | Name | Type |
|----------|------|------|
| Deployment | ai-banking-app | 2 replicas |
| Deployment | mongodb | 1 replica |
| Service | ai-banking-service | NodePort (80→30080) |
| Service | bankapp-backend | ClusterIP (5000) |
| Service | mongo | ClusterIP (27017) |

## 👨‍💻 Author

**Md Dilnawaj**
B.Tech CSE — MDU Rohtak | Fresher DevOps Engineer | Delhi, India

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/dilnawaj)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dilnawaj9128)
