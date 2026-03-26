# 🎵 AudioConvert — Free Audio Converter

A full-stack freemium audio conversion platform built with **React + Vite** (frontend) and **Flask + PostgreSQL** (backend).

---

## Features

- **8 input formats**: WAV, MP3, FLAC, AAC, OGG, M4A, AIFF, ALAC
- **5 output formats**: MP3, WAV, FLAC, AAC, OGG
- **Quality control**: MP3/AAC/OGG bitrate selector; WAV bit depth selector
- **Drag & drop** file upload with client-side validation
- **Freemium model**: Free (3 conv/hr, 50 MB) · Premium (unlimited, 500 MB)
- **JWT authentication** with bcrypt password hashing
- **Stripe** subscription billing for Premium
- **Google AdSense** placeholders for monetisation
- **SEO pages** for /wav-to-mp3, /flac-to-wav, /mp3-to-wav
- **Auto file cleanup** every 15 min (files expire after 1 hour)

---

## Project Structure

```
converter/
├── backend/
│   ├── app.py                  # Flask app factory + entry point
│   ├── config.py               # Environment config
│   ├── models.py               # SQLAlchemy models
│   ├── schema.sql              # Raw PostgreSQL DDL
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.py             # /api/auth/*
│   │   ├── convert.py          # /api/convert + /api/download
│   │   └── stripe_routes.py    # /api/stripe/*
│   ├── services/
│   │   ├── conversion_service.py  # FFmpeg subprocess wrapper
│   │   └── cleanup_service.py     # APScheduler file cleanup
│   └── middleware/
│       └── rate_limiter.py     # Hourly conversion limit check
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css           # Global design system
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx/.css
│   │   │   ├── DropZone.jsx/.css
│   │   │   ├── FormatSelector.jsx/.css
│   │   │   ├── ProgressBar.jsx/.css
│   │   │   ├── AdsBanner.jsx/.css
│   │   │   └── AuthModal.jsx/.css
│   │   └── pages/
│   │       ├── HomePage.jsx/.css
│   │       ├── WavToMp3Page.jsx
│   │       ├── FlacToWavPage.jsx
│   │       ├── Mp3ToWavPage.jsx
│   │       └── SeoPage.css
│   └── index.html
├── uploads/          # Temporary upload storage (auto-created)
└── converted/        # Temporary output storage (auto-created)
```

---

## Local Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.11 |
| PostgreSQL | ≥ 14 |
| FFmpeg | any recent |

**Install FFmpeg:**
```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html and add to PATH
```

---

### 1. Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE audioconverter;"

# (Optional) Apply schema manually
psql -U postgres -d audioconverter -f backend/schema.sql
# Tables are also auto-created by SQLAlchemy when you run the backend.
```

---

### 2. Backend

```bash
cd backend

# Copy and fill in environment vars
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET_KEY, STRIPE_* keys

# Create virtualenv
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
# → Flask running on http://localhost:5000
```

---

### 3. Frontend

```bash
cd frontend

# Copy and fill in env
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000

# Install dependencies
npm install

# Start dev server
npm run dev
# → Vite running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✓ | Flask secret key |
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET_KEY` | ✓ | JWT signing key |
| `STRIPE_SECRET_KEY` | ✓ | Stripe secret (sk_test_…) |
| `STRIPE_WEBHOOK_SECRET` | ✓ | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | ✓ | Stripe Price ID for Premium plan |
| `FRONTEND_URL` | — | Stripe redirect URL (default: localhost:5173) |
| `CORS_ORIGINS` | — | Allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✓ | Backend base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | — | Stripe publishable key (pk_test_…) |

---

## Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Create a **Product** → add a **Price** (recurring, monthly or annual)
3. Copy the **Price ID** → set as `STRIPE_PRICE_ID`
4. Set up a **Webhook** pointing to `https://yourdomain.com/api/stripe/webhook`
   - Events to enable: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the **Webhook signing secret** → set as `STRIPE_WEBHOOK_SECRET`

---

## Google AdSense Setup

1. Sign up at [Google AdSense](https://adsense.google.com)
2. Get your **Publisher ID** (ca-pub-XXXXXXXXXXXXXXXX)
3. Uncomment the AdSense `<script>` tag in `frontend/index.html` and replace the placeholder
4. Update `data-ad-client` in `AdsBanner.jsx`
5. Replace `data-ad-slot` with your ad slot ID

---

## Cloud Deployment

### Option A: Render.com (recommended for quick deploy)

**Backend (Web Service)**
- Runtime: Python 3
- Build: `pip install -r requirements.txt`
- Start: `gunicorn app:app --bind 0.0.0.0:$PORT`
- Add all environment variables in Render dashboard
- Add a **PostgreSQL** add-on

**Frontend (Static Site)**
- Build: `npm install && npm run build`
- Publish dir: `dist`
- Set `VITE_API_URL` to your backend Render URL

---

### Option B: VPS (Ubuntu) with Nginx

**1. Install dependencies**
```bash
sudo apt update && sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql ffmpeg
```

**2. Backend with Gunicorn + systemd**
```ini
# /etc/systemd/system/audioconverter.service
[Unit]
Description=AudioConvert Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/converter/backend
Environment="PATH=/var/www/converter/backend/.venv/bin"
ExecStart=/var/www/converter/backend/.venv/bin/gunicorn app:app --workers 4 --bind 127.0.0.1:5000
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable audioconverter
sudo systemctl start audioconverter
```

**3. Frontend build**
```bash
cd frontend && npm install && npm run build
# Output: frontend/dist/
```

**4. Nginx config**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    root /var/www/converter/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 500m;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/audioconverter /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT token |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/convert` | Optional JWT | Convert audio file |
| GET | `/api/download/<filename>` | — | Download converted file |
| POST | `/api/stripe/create-checkout` | JWT | Start Stripe checkout |
| POST | `/api/stripe/webhook` | — | Stripe webhook handler |
| POST | `/api/stripe/cancel` | JWT | Cancel subscription |
