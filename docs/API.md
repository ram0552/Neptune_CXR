# NEPTUNE-CXR: API Documentation

## Backend API (Node.js Express — Port 5000)

Base URL: `http://localhost:5000/api`

---

### POST /api/analyze

Upload a chest X-ray image and run AI analysis.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | Yes | PNG/JPEG chest X-ray image (max 10MB) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "60f7...",
    "report": {
      "_id": "60f7...",
      "imageFilename": "cxr_abc123.jpg",
      "originalFilename": "patient_xray.jpg",
      "predictions": [
        {
          "disease": "Pneumonia",
          "probability": 0.94,
          "confidence_level": "Very High",
          "risk_level": "High",
          "is_positive": true,
          "affected_region": "Right lower lung",
          "explanation": "AI focused on right lower lung field..."
        }
      ],
      "positiveFindings": ["Pneumonia"],
      "topFinding": "Pneumonia",
      "heatmapFilename": "abc123_gradcam.png",
      "clinicalSummary": "AI screening identified...",
      "suggestedFollowUp": "Clinical correlation...",
      "aiDisclaimer": "This AI-generated...",
      "inferenceTimeMs": 245.3,
      "modelVersion": "densenet121-cxr-v1.0",
      "modelName": "DenseNet121",
      "reportStatus": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### GET /api/reports

List reports with pagination, search, filter, and sort.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | "" | Search by filename |
| disease | string | "" | Filter by disease |
| sortBy | string | "createdAt" | Sort field |
| sortOrder | string | "desc" | "asc" or "desc" |

---

### GET /api/report/:id

Get a single report by MongoDB ObjectId.

---

### DELETE /api/report/:id

Soft-delete (archive) a report.

---

### GET /api/dashboard

Get aggregated statistics for the analytics dashboard.

**Response includes:**
- `totalReports` — Count of non-archived reports
- `diseaseDistribution` — Array of `{ disease, count, avgProbability }`
- `avgConfidence` — Average confidence percentage
- `avgInferenceTime` — Average inference time in ms
- `dailyUploads` — Array of `{ date, count }` for last 30 days
- `recentReports` — Last 5 reports
- `riskDistribution` — Array of `{ level, count }`

---

## Python AI API (FastAPI — Port 8000)

### POST /predict

Run multi-label inference on a chest X-ray.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| file | File | Chest X-ray image |

**Response:** `200 OK` — `PredictionResponse` schema

---

### GET /health

Check service health and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "DenseNet121",
  "model_version": "densenet121-cxr-v1.0",
  "available_models": ["densenet121"]
}
```
