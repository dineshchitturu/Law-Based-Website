import os
import sys
import json
import hashlib

# Ensure root workspace is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal, Base, engine
from backend.app.models.user import User
from backend.app.models.case import Case, CaseFact
from backend.app.models.legal import LegalAct, LegalSection, LegalMatch
from backend.app.models.evidence import Evidence
from backend.app.models.document import GeneratedDocument, CaseReport
from backend.app.models.history import History

LEGAL_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "legal_data")

def hash_pw(pwd: str) -> str:
    salt = "lawbot_salt_"
    return hashlib.sha256((salt + pwd).encode("utf-8")).hexdigest()

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Legal Acts
        acts_file = os.path.join(LEGAL_DATA_DIR, "acts", "acts.json")
        if os.path.exists(acts_file):
            with open(acts_file, "r", encoding="utf-8") as f:
                acts_data = json.load(f)
            for a in acts_data:
                existing = db.query(LegalAct).filter(LegalAct.id == a["id"]).first()
                if not existing:
                    act_obj = LegalAct(
                        id=a["id"],
                        short_code=a["shortCode"],
                        title=a["title"],
                        enacted_year=a.get("enactedYear"),
                        jurisdiction=a.get("jurisdiction", "India"),
                        category=a.get("category"),
                        description=a.get("description"),
                        source_url=a.get("sourceUrl")
                    )
                    db.add(act_obj)
            db.commit()

        # 2. Seed Legal Sections
        sections_file = os.path.join(LEGAL_DATA_DIR, "sections", "sections.json")
        if os.path.exists(sections_file):
            with open(sections_file, "r", encoding="utf-8") as f:
                sections_data = json.load(f)
            for s in sections_data:
                existing_sec = db.query(LegalSection).filter(LegalSection.id == s["id"]).first()
                if not existing_sec:
                    sec_obj = LegalSection(
                        id=s["id"],
                        act_id=s["actId"],
                        act_short_code=s["actShortCode"],
                        section_number=s["sectionNumber"],
                        title=s["title"],
                        category=s["category"],
                        description=s["description"],
                        simple_explanation=s["simpleExplanation"],
                        punishment=s.get("punishment"),
                        bailable=s.get("bailable"),
                        cognizable=s.get("cognizable"),
                        compoundable=s.get("compoundable"),
                        keywords_json=json.dumps(s.get("keywords", [])),
                        source_url=s.get("sourceUrl"),
                        last_verified=s.get("lastVerified", "2024-07-01")
                    )
                    db.add(sec_obj)
            db.commit()

        # 3. Seed Demo User
        demo_user = db.query(User).filter(User.email == "citizen@lawbot.gov.in").first()
        if not demo_user:
            demo_user = User(
                email="citizen@lawbot.gov.in",
                hashed_password=hash_pw("Citizen@123"),
                full_name="Rajesh Kumar",
                phone_number="+91 98765 43210",
                city="Hyderabad",
                state="Telangana",
                language_pref="en",
                text_size_pref="normal"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # 4. Seed Demo Cases (only if user has no cases yet)
        user_case_count = db.query(Case).filter(Case.user_id == demo_user.id).count()
        if user_case_count == 0:
            demo_cases = [
                {
                    "title": "Unauthorized UPI Debit via Fake Electricity Bill Link",
                    "category": "Cyber Fraud",
                    "status": "in_progress",
                    "initial_description": "Received an SMS stating electricity power would be disconnected. Clicked a link and an unauthorized debit of ₹45,000 happened via PhonePe.",
                    "incident_date": "Yesterday at 4:30 PM",
                    "incident_location": "Online / Cyber Space",
                    "loss_damage": "₹45,000",
                    "completeness_score": 85,
                    "facts": [
                        ("fraud_channel", "UPI (PhonePe)"),
                        ("amount", "₹45,000"),
                        ("transaction_id", "UTR 324892019283"),
                        ("date_time", "Yesterday at 4:30 PM"),
                        ("bank_contacted", "Yes, dispute ticket raised with HDFC Bank"),
                        ("evidence_types", "Payment screenshot, SMS screenshot")
                    ]
                },
                {
                    "title": "Theft of OnePlus Mobile from Rented Room",
                    "category": "Theft",
                    "status": "ready_for_review",
                    "initial_description": "My OnePlus 11R phone was stolen yesterday from my hostel room while I was attending classes.",
                    "incident_date": "Yesterday between 2:00 PM and 5:00 PM",
                    "incident_location": "Hostel Room No. 204, Madhapur, Hyderabad",
                    "loss_damage": "OnePlus 11R Smartphone (₹39,999)",
                    "completeness_score": 90,
                    "facts": [
                        ("object_item", "mobile phone"),
                        ("date_time", "Yesterday"),
                        ("location", "Room / Hostel"),
                        ("without_consent", "Yes, taken completely without permission"),
                        ("suspect_identified", "Unknown delivery person observed near staircase"),
                        ("cctv_available", "Yes, hostel corridor CCTV is operational"),
                        ("ownership_proof", "Amazon GST invoice and original IMEI box available")
                    ]
                },
                {
                    "title": "Encroachment on Ancestral Agricultural Land",
                    "category": "Property Dispute",
                    "status": "ready_for_review",
                    "initial_description": "Adjacent landowner has illegally erected stone boundary markers encroaching 20 feet into our registered ancestral farmland.",
                    "incident_date": "Last week (Friday)",
                    "incident_location": "Survey No. 142/A, Shamshabad Rural, Telangana",
                    "loss_damage": "Encroached agricultural parcel",
                    "completeness_score": 80,
                    "facts": [
                        ("property_type", "Agricultural farmland"),
                        ("ownership_documents", "Registered Sale Deed & Rythu Bandhu Passbook"),
                        ("dispute_nature", "Illegal boundary encroachment and obstruction of water channel"),
                        ("other_party_type", "Adjacent plot holder"),
                        ("prior_legal_action", "Verbal objection raised with Village Revenue Officer")
                    ]
                },
                {
                    "title": "Defective Refrigerator & Manufacturer Warranty Denial",
                    "category": "Consumer Problem",
                    "status": "draft",
                    "initial_description": "Purchased a double door refrigerator from local electronics store. Compressor stopped cooling within 12 days. Dealer refuses replacement.",
                    "incident_date": "Purchased 2 weeks ago",
                    "incident_location": "Hyderabad",
                    "loss_damage": "₹34,500",
                    "completeness_score": 75,
                    "facts": [
                        ("consumer_product", "Double door 265L Refrigerator"),
                        ("defect_nature", "Total cooling failure, food spoiled"),
                        ("seller_type", "Local Authorized Appliance Retailer"),
                        ("invoice_available", "Yes, tax invoice and 10-year warranty card available"),
                        ("grievance_status", "Service center technician visited but dealer denied replacement")
                    ]
                },
                {
                    "title": "Physical Assault & Verbal Threats over Parking Dispute",
                    "category": "Assault / Injury",
                    "status": "ready_for_review",
                    "initial_description": "A neighbor physically assaulted me during a disagreement over apartment parking space, causing facial bruising and issued open threats.",
                    "incident_date": "3 days ago at 8:15 PM",
                    "incident_location": "Basement Parking B-1, Green Valley Apartments",
                    "loss_damage": "Physical injury and psychological distress",
                    "completeness_score": 85,
                    "facts": [
                        ("incident_nature", "Punched in the face causing lip cut and swelling"),
                        ("date_time", "3 days ago"),
                        ("location", "Apartment basement parking"),
                        ("persons_involved", "Identified resident of Flat 302"),
                        ("medical_treatment_status", "Outpatient clinical examination & prescription taken"),
                        ("threats_made", "Threatened severe physical harm if parked there again"),
                        ("witnesses_present", "Apartment security guard witnessed incident")
                    ]
                }
            ]

            for c_data in demo_cases:
                new_c = Case(
                    user_id=demo_user.id,
                    title=c_data["title"],
                    category=c_data["category"],
                    status=c_data["status"],
                    initial_description=c_data["initial_description"],
                    incident_date=c_data["incident_date"],
                    incident_location=c_data["incident_location"],
                    complainant_name=demo_user.full_name,
                    loss_damage=c_data["loss_damage"],
                    completeness_score=c_data["completeness_score"],
                    emergency_flag=False
                )
                db.add(new_c)
                db.commit()
                db.refresh(new_c)

                for f_key, f_val in c_data["facts"]:
                    db.add(CaseFact(
                        case_id=new_c.id,
                        fact_key=f_key,
                        fact_value=f_val,
                        confidence=1.0,
                        is_extracted=True,
                        source="nlp"
                    ))

                # Also add sample generated draft for the theft case
                if new_c.category == "Theft":
                    from backend.app.services.document_generator import DocumentGenerator
                    draft = DocumentGenerator.generate_draft(
                        doc_type="police_complaint",
                        case_info={"title": new_c.title, "category": new_c.category, "initial_description": new_c.initial_description},
                        facts={k: v for k, v in c_data["facts"]},
                        evidence_list=[],
                        complainant_profile={"full_name": demo_user.full_name, "phone_number": demo_user.phone_number, "city": demo_user.city}
                    )
                    db.add(GeneratedDocument(
                        case_id=new_c.id,
                        doc_type="police_complaint",
                        title=draft["title"],
                        content_markdown=draft["content_markdown"],
                        status="draft"
                    ))

            db.commit()
            print("Successfully seeded demo data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
