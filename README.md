# NEPTUNE-CXR

## Trustworthy Multi-Label Thoracic Disease Screening System

An end-to-end AI-powered chest X-ray screening platform demonstrating modern full-stack engineering, modular AI integration, explainable medical AI, and structured clinical reporting.

> **⚠️ Disclaimer:** This system is for research and educational purposes only. It does not constitute a medical device and should not be used for clinical decision-making.

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend   │────▶│  Node.js Backend │────▶│  Python AI (FastAPI) │
│  React/Vite  │◀────│  Express + Mongo │◀────│  PyTorch + GradCAM   │
└──────────────┘     └──────────────────┘     └──────────────────┘
     :5173                :5000                    :8000
```

### Services

| Service | Technology | Port | Role |
|---------|-----------|------|------|
| Frontend | React + Vite + TailwindCSS | 5173 | UI / Dashboard |
| Backend | Node.js + Express + MongoDB | 5000 | API Gateway / Orchestration |
| AI Service | FastAPI + PyTorch + GradCAM | 8000 | Inference / Explainability |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Edit MONGODB_URI if needed

# Frontend
cd frontend
npm install

# Python AI
cd python-ai
pip install -r requirements.txt
```

### 2. Start Services

```bash
# Terminal 1: Python AI Service
cd python-ai
python main.py

# Terminal 2: Node.js Backend
cd backend
npm run dev

# Terminal 3: React Frontend
cd frontend
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

---

## Features

- **Multi-Label Disease Detection**: 14-class thoracic disease classification using DenseNet121
- **GradCAM Explainability**: Visual heatmap overlays showing AI focus areas
- **Confidence Estimation**: Clinical risk levels beyond raw probabilities
- **Clinical Reporting**: Structured screening reports with follow-up suggestions
- **Report Management**: Search, filter, sort, and archive screening history
- **Analytics Dashboard**: Charts for disease distribution, trends, and system metrics
- **Modular AI**: Plugin registry for swapping models without API changes

## Supported Diseases

Atelectasis, Cardiomegaly, Consolidation, Edema, Effusion, Emphysema, Fibrosis, Hernia, Infiltration, Mass, Nodule, Pleural Thickening, Pneumonia, Pneumothorax

---

## API Endpoints

### Backend (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Upload + AI analysis |
| POST | `/api/upload` | Upload only |
| GET | `/api/reports` | List reports (paginated) |
| GET | `/api/report/:id` | Single report |
| DELETE | `/api/report/:id` | Archive report |
| GET | `/api/dashboard` | Statistics |
| GET | `/api/health` | Health check |

### Python AI (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run inference |
| GET | `/health` | Service health |

---

## Tech Stack

**Frontend**: React, Vite, TailwindCSS v4, React Router, Axios, React Dropzone, Recharts, Lucide Icons

**Backend**: Node.js, Express, Mongoose, Multer, Axios, Morgan

**AI Service**: FastAPI, PyTorch, torchvision, pytorch-grad-cam, OpenCV, Pillow, NumPy

**Database**: MongoDB

---

## Future Scope

The architecture supports future integration of:
- Vision Transformers (ViT)
- Graph Neural Networks
- Concept Bottleneck Models
- Counterfactual Explanations
- Neuro-Symbolic Reasoning
- Uncertainty-Aware Prediction (Evidential Learning)
- Fairness Evaluation
- Domain-Shift Testing

---

## License

Academic research project. Not for clinical use.
