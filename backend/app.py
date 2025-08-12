from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Dict, Any, Optional
import email_analyzer
import models
from database import get_db
import time
import requests

# ---------
# ocr
from fastapi import UploadFile, File
import numpy as np
import cv2
import easyocr
import torch

# ----------
# chatbot
from chatbot import ask_bot

# ----------

app = FastAPI()

# Configure CORS for frontend access - make sure this is before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://3.107.236.104:3000",
        "http://3.106.248.34:3000",
        "http://localhost:3000",
        "http://3.27.131.94:3000",
        "https://scamdetek.live",
        "https://scam-detek.vercel.app",
        "https://scam-detek-git-main-tang-chii-kangs-projects.vercel.app",
    ],  # Specifically allow your React frontend
    # allow_origins=["http://localhost:3000"],  # Specifically allow your React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cache for global cyber attacks ---
GLOBAL_ATTACKS_CACHE = None
GLOBAL_ATTACKS_CACHE_TIMESTAMP = 0
CACHE_TIMEOUT_SECONDS = 15 * 60  # Cache for 15 minutes


# Define the schema directly in app.py
class AnalysisRequest(BaseModel):
    """Schema for the request to analyze content"""

    content: str
    content_type: str  # "email", "sms", "url"
    sender: Optional[str] = None


@app.post("/api/analyze")
async def analyze_content(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Analyze content for spam probability and store essential information"""

    if not request.content or not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    # Process based on content type
    try:
        if request.content_type == "email":
            result = email_analyzer.analyze_email(
                request.content, sender=request.sender
            )
        elif request.content_type == "sms":
            result = email_analyzer.analyze_sms(request.content, sender=request.sender)
        elif request.content_type == "url":
            result = email_analyzer.analyze_url(request.content)
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")
    except Exception as e:
        # Log the error for server-side debugging
        print(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Analysis failed. Please try again."
        )

    # Convert risk_percentage to spam_probability (0-1 scale)
    spam_probability = result["risk_percentage"] / 100.0

    # Determine if it's SPAM based on threshold (e.g., >0.5 is SPAM)
    label = "SPAM" if spam_probability > 0.5 else "HAM"

    # Add the spam classification data to the result before returning
    result["label"] = label
    result["spam_probability"] = spam_probability

    # Return the full analysis result to the frontend
    return result


# ------------------------------
# get image
@app.post("/api/extract-text")
async def extract_text(image: UploadFile = File(...)):
    try:
        contents = await image.read()

        nparr = np.frombuffer(contents, np.uint8)

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Unable to decode image")

        reader = easyocr.Reader(["en"], gpu=torch.cuda.is_available())
        result = reader.readtext(img, detail=0)
        print("result: ", result)
        extracted_text = " ".join(result)
        return {"extracted_text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")


# ------------------------------


@app.get("/api/test-db")
async def test_database(db: Session = Depends(get_db)):
    try:
        # Use text() to wrap the SQL query
        db.execute(text("SELECT 1"))
        return {"message": "Database connection successful!"}
    except Exception as e:
        print(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Database connection failed: {str(e)}"
        )


@app.get("/api/ping")
async def ping():
    return {"message": "Pong! The API is working "}


API_KEYS = [
    "ad569dde93b545a5ac61ea945b252868",
    "7379cf5cecba4baeb940f0a06e6afe30",
    "81038c2c2f20476bb1e25f55fb7ec0e8",
    "deea11c4f7d648b99756189b2f81aef2",
    "985ebde983474108be1000ee59cb7370",
]


@app.get("/api/news")
def proxy_news(country: str):
    url = "https://newsapi.org/v2/everything"
    params = {"q": country, "apiKey": None}
    for key in API_KEYS:
        params["apiKey"] = key
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code == 200:
            result = resp.json()
            result["articles"] = result.get("articles", [])[:8]
            return result
        if resp.status_code == 429:
            continue
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    raise HTTPException(status_code=502, detail="All NewsAPI keys are rate‐limited.")


@app.get("/api/global-cyber-attacks")
def get_global_cyber_attacks(db: Session = Depends(get_db)):
    """Fetch global cyber attack data"""
    global GLOBAL_ATTACKS_CACHE, GLOBAL_ATTACKS_CACHE_TIMESTAMP

    current_time = time.time()

    # Check if cache is still valid
    if GLOBAL_ATTACKS_CACHE and (
        current_time - GLOBAL_ATTACKS_CACHE_TIMESTAMP < CACHE_TIMEOUT_SECONDS
    ):
        print("Returning cached global cyber attack data.")  # Or use logger.info()
        return GLOBAL_ATTACKS_CACHE

    print("Fetching global cyber attack data from database.")  # Or use logger.info()
    query = """
    SELECT 
        gca.attack_date, 
        at.attack_name AS attack_type, 
        i.industry_name AS industry, 
        l.country_name AS location, 
        sl.severity_name AS severity, 
        gca.damage_estimate_usd, 
        gca.outcome, 
        gca.target_ip
    FROM GlobalCyberAttacks gca
    JOIN AttackTypes at ON gca.attack_type_id = at.attack_type_id
    JOIN Industries i ON gca.industry_id = i.industry_id
    JOIN Locations l ON gca.location_id = l.location_id
    JOIN SeverityLevels sl ON gca.severity_id = sl.severity_id
    """
    try:
        result_proxy = db.execute(text(query))
        rows = result_proxy.fetchall()  # Get all rows
        data = [dict(row._mapping) for row in rows]

        # Update cache
        GLOBAL_ATTACKS_CACHE = data
        GLOBAL_ATTACKS_CACHE_TIMESTAMP = current_time
        print("Global cyber attack data cached.")  # Or use logger.info()

        return data
    except Exception as e:
        print(f"Error in /api/global-cyber-attacks: {e}")  # Or use logger.error()
        import traceback

        traceback.print_exc()  # This will print the full traceback to your FastAPI console
        raise HTTPException(
            status_code=500,
            detail="Internal server error fetching global cyber attacks.",
        )


# ----------------
# chatbot
class AskRequest(BaseModel):
    query: str


@app.post("/api/ask-gemini")
async def ask_gemini(request: AskRequest):
    try:
        response = ask_bot(request.query)
        return {"answer": response}
    except Exception as e:
        print(f"❌ Gemini RAG answer wrong: {e}")
        raise HTTPException(status_code=500, detail="RAG answer failed")


@app.get("/api/online-crimes-by-state")
def get_online_crimes_by_state(db: Session = Depends(get_db)):
    """Fetch online crimes by state/year/crime type"""
    query = """
    SELECT 
        s.state_name AS state,
        ocs.year,
        oc.crime_name AS online_crime,
        ocs.number_of_cases,
        ocs.financial_losses_rm
    FROM OnlineCrimesByState ocs
    JOIN States s ON ocs.state_id = s.state_id
    JOIN OnlineCrimes oc ON ocs.crime_id = oc.crime_id
    """
    try:
        result_proxy = db.execute(text(query))
        rows = result_proxy.fetchall()
        return [dict(row._mapping) for row in rows]
    except Exception as e:
        print(f"Error in /api/online-crimes-by-state: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Internal server error fetching online crimes by state.",
        )


@app.get("/api/victims-by-age-group")
def get_victims_by_age_group(db: Session = Depends(get_db)):
    """Fetch victims by age group"""
    query = """
    SELECT 
        s.state_name AS state,
        vag.year,
        ag.age_range AS age_group,
        oc.crime_name AS online_crime,
        vag.number_of_victims
    FROM VictimsByAgeGroup vag
    JOIN States s ON vag.state_id = s.state_id
    JOIN AgeGroups ag ON vag.age_group_id = ag.age_group_id
    JOIN OnlineCrimes oc ON vag.crime_id = oc.crime_id
    """
    try:
        result_proxy = db.execute(text(query))
        rows = result_proxy.fetchall()
        return [dict(row._mapping) for row in rows]
    except Exception as e:
        print(f"Error in /api/victims-by-age-group: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Internal server error fetching victims by age group.",
        )


@app.get("/api/victims-by-gender-and-age")
def get_victims_by_gender_and_age(db: Session = Depends(get_db)):
    """Fetch victims by gender and age group"""
    query = """
    SELECT 
        s.state_name AS state,
        vga.year,
        ag.age_range AS age_group,
        oc.crime_name AS online_crime,
        vga.gender,
        vga.number_of_victims
    FROM VictimsByGenderAndAge vga
    JOIN States s ON vga.state_id = s.state_id
    JOIN AgeGroups ag ON vga.age_group_id = ag.age_group_id
    JOIN OnlineCrimes oc ON vga.crime_id = oc.crime_id
    """
    try:
        result_proxy = db.execute(text(query))
        rows = result_proxy.fetchall()
        return [dict(row._mapping) for row in rows]
    except Exception as e:
        print(f"Error in /api/victims-by-gender-and-age: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Internal server error fetching victims by gender and age group.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
