import os
import sys
import io

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.app.main import app

def run_demonstration_test():
    client = TestClient(app)
    print("\n" + "="*70)
    print("RUNNING COMPLETE LAWBOT AI DEMONSTRATION FLOW (SECTION 52)")
    print("="*70)

    # 1. USER OPENS APP / DEMO AUTH
    login_res = client.post("/api/auth/demo-login")
    assert login_res.status_code == 200, f"Auth failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] STEP 1: Citizen logged in as demo user:", login_res.json()["user"]["full_name"])

    # 2. START NEW CASE
    user_narrative = "My phone was stolen from my room yesterday."
    print(f"[OK] STEP 2: Citizen inputs description: '{user_narrative}'")
    case_res = client.post(
        "/api/cases",
        json={
            "category": "I don't know",
            "initial_description": user_narrative,
            "complainant_name": "Rajesh Kumar"
        },
        headers=headers
    )
    assert case_res.status_code == 200, f"Create case failed: {case_res.text}"
    case_data = case_res.json()
    case_id = case_data["id"]
    print(f"[OK] STEP 3: Case created with ID #{case_id}, classified Category: '{case_data['category']}'")

    # Verify extracted facts from initial description
    facts = {f["fact_key"]: f["fact_value"] for f in case_data["facts"]}
    print(f"   -> Extracted Object: {facts.get('object_item')}")
    print(f"   -> Extracted Location: {facts.get('location')}")
    print(f"   -> Extracted Date/Time: {facts.get('date_time')}")
    assert "mobile phone" in facts.get("object_item", "").lower(), "Failed to extract mobile phone"
    assert "room" in facts.get("location", "").lower(), "Failed to extract room"
    assert "yesterday" in facts.get("date_time", "").lower(), "Failed to extract yesterday"

    # 3. START CHAT INTAKE
    chat_start = client.post("/api/chat/start", json={"case_id": case_id}, headers=headers)
    assert chat_start.status_code == 200, f"Chat start failed: {chat_start.text}"
    chat_data = chat_start.json()
    last_bot_msg = [m for m in chat_data["messages"] if m["role"] == "assistant" and m.get("question_id")][-1]
    print(f"[OK] STEP 4: AI Assistant asks first adaptive question: '{last_bot_msg['content']}'")
    assert "suspect" in last_bot_msg["content"].lower() or "who took it" in last_bot_msg["content"].lower(), "Adaptive question mismatch"

    # 4. USER ANSWERS: "No, I did not see anyone"
    answer1_res = client.post(
        "/api/chat/message",
        json={"case_id": case_id, "content": "No, I did not see anyone", "question_code": last_bot_msg["question_id"]},
        headers=headers
    )
    assert answer1_res.status_code == 200
    answer1_data = answer1_res.json()
    next_bot_msg = [m for m in answer1_data["messages"] if m["role"] == "assistant" and m.get("question_id")][-1]
    print(f"[OK] STEP 5: Citizen answered 'No'. Next question: '{next_bot_msg['content']}'")
    assert "cctv" in next_bot_msg["content"].lower(), "Expected CCTV question"

    # 5. USER ANSWERS: "Yes, CCTV is available"
    answer2_res = client.post(
        "/api/chat/message",
        json={"case_id": case_id, "content": "Yes, CCTV is available", "question_code": next_bot_msg["question_id"]},
        headers=headers
    )
    assert answer2_res.status_code == 200
    answer2_data = answer2_res.json()
    next_bot_msg2 = [m for m in answer2_data["messages"] if m["role"] == "assistant" and m.get("question_id")][-1]
    print(f"[OK] STEP 6: Citizen answered 'Yes'. Next question: '{next_bot_msg2['content']}'")
    assert "proof" in next_bot_msg2["content"].lower() or "belongs" in next_bot_msg2["content"].lower(), "Expected proof of ownership question"

    # 6. USER ANSWERS: "Yes, purchase receipt / invoice"
    answer3_res = client.post(
        "/api/chat/message",
        json={"case_id": case_id, "content": "Yes, purchase receipt / invoice", "question_code": next_bot_msg2["question_id"]},
        headers=headers
    )
    assert answer3_res.status_code == 200
    print("[OK] STEP 7: Citizen answered 'Yes, purchase receipt / invoice'. Updated completeness score:", answer3_res.json().get("current_step"))

    # 7. EVIDENCE UPLOAD (Simulate receipt and CCTV note)
    dummy_receipt = io.BytesIO(b"Amazon Tax Invoice for OnePlus Phone IMEI 864920192819281")
    upload_res = client.post(
        "/api/evidence/upload",
        data={"case_id": str(case_id), "file_type": "document", "description": "Amazon purchase invoice & IMEI box photo"},
        files={"file": ("amazon_phone_invoice.pdf", dummy_receipt, "application/pdf")},
        headers=headers
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    print("[OK] STEP 8: Evidence uploaded successfully:", upload_res.json()["original_filename"])

    # 8. CASE REVIEW
    review_res = client.get(f"/api/cases/{case_id}", headers=headers)
    assert review_res.status_code == 200
    review_data = review_res.json()
    print(f"[OK] STEP 9: Case Review verified. Information completeness score: {review_data['completeness_score']}%")

    # 9. LEGAL ANALYSIS
    analysis_res = client.post("/api/legal/analyze", json={"case_id": case_id}, headers=headers)
    assert analysis_res.status_code == 200, f"Analysis failed: {analysis_res.text}"
    analysis_data = analysis_res.json()
    print(f"[OK] STEP 10: Legal Analysis completed:")
    print(f"   Status: {analysis_data['status']}")
    print(f"   Provisions identified: {len(analysis_data['possible_provisions'])}")
    for p in analysis_data["possible_provisions"]:
        print(f"   * {p['section']['act_short_code']} Section {p['section']['section_number']} ({p['section']['title']})")
    assert any("303" in p["section"]["section_number"] for p in analysis_data["possible_provisions"]), "Missing BNS 303 Theft"
    assert any("305" in p["section"]["section_number"] for p in analysis_data["possible_provisions"]), "Missing BNS 305 Theft in Dwelling"

    # 10. PREPARE DRAFT (Police Complaint / FIR draft)
    draft_res = client.post(
        "/api/documents/generate",
        json={"case_id": case_id, "doc_type": "police_complaint"},
        headers=headers
    )
    assert draft_res.status_code == 200, f"Draft generation failed: {draft_res.text}"
    draft_data = draft_res.json()
    print("[OK] STEP 11: Police Complaint Draft successfully generated:")
    print(f"   Title: '{draft_data['title']}'")
    assert "Bharatiya Nagarik Suraksha Sanhita" in draft_data["content_markdown"]
    assert "Section 303" in draft_data["content_markdown"]

    # 11. SAVE CASE / LIST IN MY CASES
    cases_list_res = client.get("/api/cases", headers=headers)
    assert cases_list_res.status_code == 200
    all_cases = cases_list_res.json()
    saved_case = next((c for c in all_cases if c["id"] == case_id), None)
    assert saved_case is not None, "Case not listed in My Cases"
    print(f"[OK] STEP 12: Case #{case_id} verified in My Cases repository with status: '{saved_case['status']}'")

    print("\n" + "="*70)
    print("ALL 12 STEPS OF THE DEMONSTRATION WORK FLAWLESSLY AND PERSIST TO DB!")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_demonstration_test()
