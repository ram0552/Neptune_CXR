# NEPTUNE-CXR: Architecture Documentation

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        LP[Landing Page]
        UP[Upload Page]
        AP[Analysis Page]
        RP[Reports Page]
        DP[Dashboard Page]
    end

    subgraph Backend["Backend (Node.js + Express)"]
        MW[Middleware Layer]
        CT[Controllers]
        SV[Services]
        MD[Mongoose Models]
    end

    subgraph AI["Python AI Service (FastAPI)"]
        PP[Preprocessor]
        INF[Inference Service]
        GC[GradCAM Service]
        CF[Confidence Service]
        EX[Explanation Service]
        MR[Model Registry]
        DN[DenseNet121]
    end

    DB[(MongoDB)]

    Frontend -->|HTTP/REST| Backend
    Backend -->|HTTP/Multipart| AI
    Backend -->|Mongoose| DB

    MR --> DN
    INF --> PP
    INF --> GC
    INF --> CF
    INF --> EX
```

## Data Flow: Screening Workflow

```mermaid
sequenceDiagram
    actor Doctor
    participant FE as Frontend
    participant BE as Backend (Node.js)
    participant AI as Python AI
    participant DB as MongoDB

    Doctor->>FE: Upload chest X-ray
    FE->>BE: POST /api/analyze (multipart)
    BE->>BE: Validate & store image (Multer)
    BE->>AI: POST /predict (forward image)
    AI->>AI: Preprocess (resize, normalize)
    AI->>AI: DenseNet121 inference
    AI->>AI: Generate GradCAM heatmap
    AI->>AI: Classify confidence & risk
    AI->>AI: Generate clinical explanation
    AI-->>BE: PredictionResponse JSON
    BE->>BE: Generate clinical summary
    BE->>BE: Generate follow-up suggestions
    BE->>DB: Save Report document
    BE-->>FE: Complete report response
    FE-->>Doctor: Display results + heatmap
```

## Database Schema (ER Diagram)

```mermaid
erDiagram
    REPORT {
        ObjectId _id PK
        string imageFilename
        string originalFilename
        string imagePath
        array predictions
        array positiveFindings
        string topFinding
        string heatmapFilename
        string clinicalSummary
        string suggestedFollowUp
        string aiDisclaimer
        number inferenceTimeMs
        string modelVersion
        string modelName
        object imageMetadata
        string reportStatus
        datetime createdAt
        datetime updatedAt
    }

    MODEL_METADATA {
        ObjectId _id PK
        string name
        string version
        string architecture
        number numClasses
        boolean isActive
        datetime deployedAt
    }

    REPORT ||--o{ PREDICTION : contains
    PREDICTION {
        string disease
        number probability
        string confidence_level
        string risk_level
        boolean is_positive
        string affected_region
        string explanation
    }
```

## AI Model Architecture

```mermaid
graph LR
    subgraph Input
        IMG[224x224x3 Image]
    end

    subgraph DenseNet121
        F[Feature Extraction<br/>DenseBlock 1-4]
        GAP[Global Avg Pool]
        CLS[Custom Classifier<br/>1024→512→14]
    end

    subgraph Output
        SIG[Sigmoid Activation]
        PRED[14 Disease Probabilities]
    end

    subgraph Explainability
        GCAM[GradCAM on<br/>DenseBlock4]
        HEAT[Heatmap Overlay]
    end

    IMG --> F --> GAP --> CLS --> SIG --> PRED
    F --> GCAM --> HEAT
```

## Folder Structure

```
NEPTUNE-CXR/
├── frontend/           # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level pages
│   │   ├── services/   # API service layer
│   │   └── utils/      # Helpers & constants
│   └── index.html
│
├── backend/            # Node.js + Express
│   ├── src/
│   │   ├── config/     # DB & env configuration
│   │   ├── controllers/# Route handlers
│   │   ├── middleware/  # Upload, error handling
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # Express routes
│   │   └── services/   # Business logic
│   └── server.js
│
├── python-ai/          # FastAPI + PyTorch
│   ├── app/
│   │   ├── api/        # FastAPI routes
│   │   ├── core/       # Configuration
│   │   ├── models/     # AI model definitions
│   │   ├── schemas/    # Pydantic schemas
│   │   └── services/   # AI pipeline services
│   └── main.py
│
├── shared/             # Shared constants
├── docs/               # Documentation
├── uploads/            # Uploaded images
├── heatmaps/           # GradCAM outputs
├── models/             # Model weight cache
└── README.md
```
