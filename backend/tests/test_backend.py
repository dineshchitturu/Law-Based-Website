import os
import sys
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.main import app
from backend.app.services.fact_extractor import FactExtractor
from backend.app.services.ai_service import ai_service

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Bharatiya Nyaya Sanhita, 2023" in data["supported_acts"]

def test_nlp_fact_extraction():
    sample_text = "My phone was stolen yesterday from my room."
    facts = FactExtractor.extract_facts(sample_text)
    assert facts["category"] == "Theft"
    assert facts["object_item"] == "mobile phone"
    assert facts["location"] == "room/hostel"
    assert facts["date_time"] == "yesterday"
    assert facts["emergency_detected"] is False

def test_emergency_detection():
    danger_text = "Someone is threatening to kill me right now with weapons at my door"
    is_emergency = FactExtractor.check_emergency(danger_text)
    assert is_emergency is True

def test_demo_login():
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "citizen@lawbot.gov.in"

def test_case_list_and_detail():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    cases_res = client.get("/api/cases", headers=headers)
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) > 0

    first_case_id = cases[0]["id"]
    detail_res = client.get(f"/api/cases/{first_case_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == first_case_id
    assert "completeness_score" in detail

def test_legal_search():
    search_res = client.get("/api/legal/search?q=theft")
    assert search_res.status_code == 200
    results = search_res.json()["results"]
    assert len(results) > 0
    assert any("303" in r["section_number"] for r in results)

def test_official_resources():
    res = client.get("/api/resources")
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 4
    has_cyber = any("Cyber" in c["category"] for c in categories)
    assert has_cyber is True
