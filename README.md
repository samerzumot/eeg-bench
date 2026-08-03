# EEG-Bench

EEG benchmarking platform for researchers and clinicians with limited programming experience.

Built on [MOABB](https://github.com/NeuroTechX/moabb) · [MNE-Python](https://mne.tools) · [Braindecode](https://braindecode.org) · [pyRiemann](https://github.com/pyRiemann/pyRiemann) · [EEG-Dash](https://eegdash.org)

## Quick Start (Local Development)

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

## Deploy to GCP

### 1. Set up infrastructure
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your billing account
terraform init
terraform plan
terraform apply
```

### 2. Build and push containers
```bash
# Authenticate
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build
docker build -f infra/Dockerfile.frontend -t us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/frontend:latest .
docker build -f infra/Dockerfile.backend -t us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/backend:latest .

# Push
docker push us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/frontend:latest
docker push us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/backend:latest
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy eeg-bench-frontend \
  --image us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/frontend:latest \
  --region us-central1 --allow-unauthenticated

gcloud run deploy eeg-bench-backend \
  --image us-central1-docker.pkg.dev/PROJECT_ID/eeg-bench/backend:latest \
  --region us-central1 --allow-unauthenticated \
  --memory 4Gi --cpu 2 --timeout 300
```

### CI/CD (optional)
Connect your repo to Cloud Build and it will auto-deploy on push:
```bash
gcloud builds submit --config infra/cloudbuild.yaml
```

## Architecture

```
Frontend (Next.js)  →  Backend (FastAPI)  →  Cloud Run Jobs (CPU: CSP+LDA, MDM)
                                           →  Vertex AI (GPU: EEGNet)
                                           →  Firestore (metadata)
                                           →  GCS (uploads)
```

## GPU Setup (EEGNet)

EEGNet requires GPU quota on Vertex AI. Request `NVIDIA_TESLA_T4` quota in your region:
```bash
gcloud compute project-info describe --project PROJECT_ID
# Check quota, then request increase via Console
```

Until GPU quota is granted, the demo uses pre-computed EEGNet results.
