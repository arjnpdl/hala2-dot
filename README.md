# LaunchNepal - Startup Marketplace for Nepal

A three-sided platform connecting Founders, Talent, and Investors in Nepal's startup ecosystem.

## Architecture

- **Backend**: FastAPI (Python 3.11+) with async MySQL (`aiomysql`)
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MySQL 8.0+
- **AI**: Gemini API for embeddings, pitch feedback, and gap analysis
- **Deployment**: AWS Free Tier (EC2, RDS, S3, CloudFront)

## Quick Start

### Option 1: Mock Data Mode (No Database Required)

**Fastest way to get started!**

1. Install backend dependencies:
```bash
cd backend
pip install -r ../requirements.txt
python run.py
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
npm run dev
```

3. Login with demo accounts:
   - **Founder**: `founder@neplaunch.com` / `password123`
   - **Talent**: `talent@neplaunch.com` / `password123`
   - **Investor**: `investor@neplaunch.com` / `password123`

### Option 2: Real Database Setup

1. **Install dependencies**:
```bash
# In the root or backend directory
pip install -r requirements.txt
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
# Ensure USE_MOCK_DATA=False
```

3. **Initialize database**:
```bash
# Make sure MySQL is running and the database 'launchnepal' exists
python backend/migrate_all.py
```

4. **Run Application**:
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection (MySQL)
│   ├── models.py            # SQLAlchemy models
│   ├── auth.py              # Authentication utilities
│   ├── matching.py          # Hybrid matching engine (Keyword + Semantic)
│   ├── migrate_all.py       # Main migration script
│   ├── mock_data.py         # Mock data generator
│   ├── routers/             # API Route handlers
│   └── utility/debug scripts:
│       ├── check_schema.py      # Verify database schema
│       ├── check_embeddings.py  # Verify Gemini embeddings
│       ├── debug_matches.py     # Debug matching logic
│       └── wipe_db.py           # Clear all data
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth and UI contexts
│   │   ├── hooks/           # Custom React hooks
│   │   └── pages/           # Application views
│   └── vite.config.js
├── docker-compose.yml       # Docker configuration
├── requirements.txt         # Python dependencies
├── package.json             # Root package info
└── .env.example             # Template for environment variables
```

## Key Features

### Hybrid Matching Engine
- **60% Keyword Match**: Jaccard similarity on skills/industries.
- **40% Semantic Match**: Cosine similarity using Gemini `text-embedding-3-small` embeddings.

### AI Features
- **Pitch Co-Pilot**: Get feedback on your pitch from a Kathmandu-based investor perspective.
- **Team Gap Analysis**: Identify missing critical roles in your startup team.
- **Automated Embeddings**: Automatic vector representation of profiles for semantic search.

### Three-Sided Platform
- **Founders**: Post roles, find talent, connect with investors.
- **Talent**: Browse opportunities, see match scores, apply to roles.
- **Investors**: Define thesis, view deal flow, track portfolio.

## Utility Scripts

The project includes several scripts for maintenance and debugging:
- `python backend/migrate_all.py`: Initialize/update database tables.
- `python backend/mock_data.py`: Populate the database with sample data.
- `python backend/wipe_db.py`: Clear all tables (Use with caution).
- `python backend/check_users.py`: List all registered users.
- `python backend/debug_matches.py`: Test matching scores between specific users.

## Environment Variables

See `.env.example` for all required variables including:
- `DATABASE_URL`: MySQL connection string.
- `SECRET_KEY`: JWT signing key.
- `GEMINI_API_KEY`: Required for semantic matching and AI features.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

