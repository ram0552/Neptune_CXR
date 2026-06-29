# NEPTUNE-CXR: Deployment Guide

## Deployment Architecture

```
Frontend (Vercel) → Backend (Render) → Python AI (Render)
                         ↕
                    MongoDB Atlas
```

---

## 1. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist IP addresses (or allow all: `0.0.0.0/0` for Render)
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/neptune-cxr`

---

## 2. Python AI Service (Render)

### Setup

1. Create a **Web Service** on Render
2. Connect your repository
3. Configure:
   - **Root Directory:** `python-ai`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`
   - **Environment:** Python 3.10+

### Environment Variables
```
HOST=0.0.0.0
PORT=8000
MODEL_NAME=densenet121
LOG_LEVEL=info
```

> **Note:** First deployment will download DenseNet121 weights (~30MB). Subsequent deploys use cached weights.

---

## 3. Node.js Backend (Render)

### Setup

1. Create a **Web Service** on Render
2. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### Environment Variables
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/neptune-cxr
PYTHON_API_URL=https://your-python-service.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 4. Frontend (Vercel)

### Setup

1. Import project in Vercel
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Environment Variables
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Health Checks

After deployment, verify:

```bash
# Python AI
curl https://your-python-service.onrender.com/health

# Backend
curl https://your-backend.onrender.com/api/health

# Frontend
# Visit https://your-frontend.vercel.app
```

---

## Known Limitations

- **Cold starts:** Render free tier spins down after inactivity (~50s startup)
- **Model loading:** First request after cold start takes ~10-15s for model loading
- **File storage:** Uploaded images and heatmaps are stored on Render's ephemeral filesystem. For production, use cloud storage (S3/GCS).
- **GPU:** Free tier has no GPU; inference runs on CPU (~2-5s per image)

## Future Scope

- Add S3/GCS for persistent file storage
- Add Redis for caching dashboard statistics
- Add WebSocket for real-time inference progress
- Container-based deployment (Docker Compose)
- Kubernetes orchestration for scaling
