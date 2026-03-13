# 🌱 GreenCare AI

> Personalized Plant Recommendation and Gardening Assistant  
> Design Project — 6CS1991

---

## Project Structure

```
greencare/
├── backend/
│   ├── app.py                      # Flask API (Groq-powered)
│   ├── model.py                    # Tabular Transformer definition + predict + XAI
│   ├── train.py                    # Train the model on extended dataset
│   ├── home_garden_extended.csv    # 4000-row, 40-plant dataset
│   ├── home_scaler.pkl             # StandardScaler (auto-generated)
│   ├── home_label_encoder.pkl      # LabelEncoder (auto-generated)
│   ├── home_garden_model.pth       # Trained weights (generated after train.py)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── index.tsx
    │   ├── types.ts
    │   ├── services/api.ts
    │   └── components/
    │       ├── Layout.tsx
    │       ├── Home.tsx
    │       ├── Garden.tsx
    │       ├── DiseaseDetector.tsx
    │       ├── RecommendationEngine.tsx
    │       ├── SoilPredictor.tsx
    │       └── Profile.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Modules Implemented

| Module | Description | Status |
|--------|-------------|--------|
| Module 1 | User Profiling (experience, goals, space) | ✅ |
| Module 2 | Smart Plant Recommendations (Groq LLM) | ✅ |
| Module 2 | Soil-based ML Predictions (Transformer) | ✅ |
| Module 2 | SHAP / XAI Explainability | ✅ |
| Module 3 | Garden CRUD + Watering Reminders | ✅ |
| Module 4 | Disease Detection (Groq Llama 4 Scout Vision) | ✅ |

---

## Setup Instructions

### Backend

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Groq API key from https://console.groq.com

# 3. Train the model (required for Soil AI feature)
python train.py
# This generates: home_garden_model.pth, home_scaler.pkl, home_label_encoder.pkl

# 4. Start the Flask server
python app.py
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plants` | Get all plants |
| POST | `/api/plants` | Add a plant |
| PUT | `/api/plants/:id` | Update a plant |
| DELETE | `/api/plants/:id` | Remove a plant |
| GET | `/api/reminders` | Get watering reminders |
| POST | `/api/diagnose` | Diagnose plant disease (image upload) |
| POST | `/api/recommend` | Get AI plant recommendations |
| POST | `/api/predict` | Soil-based Transformer prediction |
| POST | `/api/explain` | XAI explanation for prediction |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |

---

## Dataset

**Extended Home Garden Dataset** (`home_garden_extended.csv`)

- **4,000 rows** across **40 plant species**
- Features: N, P, K, temperature, humidity, pH, rainfall
- Plants include: vegetables, herbs, ornamentals, indoor plants, fruits
- Expanded from original 17-class, 1700-row dataset

### New Plant Classes Added
`lavender, jasmine, hibiscus, marigold, sunflower, mint, basil, coriander, spinach, lettuce, cucumber, brinjal, okra, lemon, curry_leaf, fenugreek, peace_lily, spider_plant, pothos, bamboo_palm, jade_plant, rubber_plant, ZZ_plant`

---

## AI Models Used

| Feature | Model | Why |
|---------|-------|-----|
| Disease Detection | `meta-llama/llama-4-scout-17b-16e-instruct` (Groq) | Best vision model on Groq, fast, free tier |
| Plant Recommendations | `llama-3.3-70b-versatile` (Groq) | High-quality text, generous free limits |
| Soil Prediction | Custom Tabular Transformer (PyTorch) | Trained on domain-specific garden data |

**Why Groq over Gemini:** Groq has significantly higher free-tier request limits, `json_object` response mode (no markdown parsing needed), and much faster inference (~607 tokens/sec).

---

## Team

1. Bathini Indra Sena Reddy – 2023BCSE07AED076
2. Dharshan G – 2023BCSE07AED071
3. Likhith S – 2023BCSE07AED061
4. Shaik Mohammad Adil – 2023BCSE07AED096

**Mentor:** Dr. Ancy Margin A
