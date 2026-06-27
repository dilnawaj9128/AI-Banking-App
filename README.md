---

## ☸️ Kubernetes Setup

### Resources Deployed

| Resource | Name | Type |
|----------|------|------|
| Deployment | ai-banking-app | 2 replicas |
| Deployment | mongodb | 1 replica |
| Service | ai-banking-service | NodePort (80→30080) |
| Service | bankapp-backend | ClusterIP (5000) |
| Service | mongo | ClusterIP (27017) |

### Check Status

```bash
kubectl get pods
kubectl get svc
kubectl get nodes
```

---

## 🚀 Run Locally with Docker Compose

```bash
# Clone the repo
git clone https://github.com/dilnawaj9128/AI-Banking-App.git
cd AI-Banking-App

# Run all services
docker-compose up -d

# Access app
http://localhost:3000
```

---

## ☸️ Deploy on Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml

# Check pods
kubectl get pods

# Access app
kubectl port-forward svc/ai-banking-service 9090:80 --address 0.0.0.0 &
```

---

## 🔐 Jenkins Setup

### Credentials Required

| Credential ID | Type | Description |
|--------------|------|-------------|
| `dockerHubCred` | Username/Password | DockerHub login |

### Give kubectl access to Jenkins

```bash
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

---

## 🎯 Key DevOps Concepts Demonstrated

- ✅ Multi-container Docker setup (Frontend + Backend + MongoDB)
- ✅ Parallel pipeline stages in Jenkins
- ✅ Container security scanning with Trivy (HIGH/CRITICAL)
- ✅ Kubernetes Deployments, Services (NodePort + ClusterIP)
- ✅ Nginx reverse proxy for API routing
- ✅ Rolling updates with `kubectl rollout restart`
- ✅ MongoDB deployed inside Kubernetes cluster
- ✅ DockerHub as container registry

---

## 👨‍💻 Author

**Md Dilnawaj**  
B.Tech CSE — Maharshi Dayanand University (MDU), Rohtak  
Fresher DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/dilnawaj)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dilnawaj9128)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
