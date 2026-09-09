from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.legal import LegalSection, LegalAct

class LegalMatcher:
    """
    Deterministic retrieval engine that cross-references structured case facts
    against authoritative statutory provisions in BNS 2023, BNSS 2023, BSA 2023,
    IT Act 2000, and Consumer Protection Act 2019.
    Zero LLM hallucinations: Every provision is directly grounded in statutory records.
    """

    @classmethod
    def match_provisions(
        cls,
        db: Session,
        category: str,
        facts: Dict[str, Any],
        has_evidence: bool = False
    ) -> List[Dict[str, Any]]:
        matched_results = []
        all_sections = db.query(LegalSection).all()

        # 1. Theft matches
        if category == "Theft":
            # Primary Theft: Section 303 BNS
            sec_303 = next((s for s in all_sections if s.id == "sec-bns-303"), None)
            if sec_303:
                matched_results.append({
                    "section": sec_303,
                    "relevance_score": 0.95,
                    "reason_explanation": "Movable property (such as mobile phone, cash, or valuables) was taken out of your possession without your consent.",
                    "matched_facts": [f"Object: {facts.get('object_item', 'Movable property')}", f"Incident: {facts.get('incident_type', 'Theft')}"]
                })

            # Dwelling house theft: Section 305 BNS if taken from room/house/hostel
            location_val = str(facts.get("location", "")).lower()
            if "room" in location_val or "hostel" in location_val or "house" in location_val or "home" in location_val or "flat" in location_val:
                sec_305 = next((s for s in all_sections if s.id == "sec-bns-305"), None)
                if sec_305:
                    matched_results.append({
                        "section": sec_305,
                        "relevance_score": 0.92,
                        "reason_explanation": "Theft occurred inside a residential room, hostel, or dwelling house premises, which attracts aggravated penalties under BNS Section 305.",
                        "matched_facts": [f"Location: {facts.get('location', 'Room / Dwelling')}"]
                    })

            # Procedural FIR: Section 173 BNSS
            sec_173 = next((s for s in all_sections if s.id == "sec-bnss-173"), None)
            if sec_173:
                matched_results.append({
                    "section": sec_173,
                    "relevance_score": 0.88,
                    "reason_explanation": "Theft is a cognizable offence under the First Schedule of BNSS 2023. Police have a statutory obligation to register an FIR without requiring prior court permission.",
                    "matched_facts": ["Offence nature: Cognizable"]
                })

        # 2. Cyber Fraud matches
        elif category == "Cyber Fraud":
            # IT Act 66D
            sec_66d = next((s for s in all_sections if s.id == "sec-it-66d"), None)
            if sec_66d:
                matched_results.append({
                    "section": sec_66d,
                    "relevance_score": 0.96,
                    "reason_explanation": "Computer resources, mobile phones, or online communication channels were used to deceive and cheat you into unauthorized financial debit.",
                    "matched_facts": [f"Medium: {facts.get('fraud_channel', 'Online/UPI')}", f"Loss: {facts.get('amount', facts.get('amount_lost', 'Financial Loss'))}"]
                })

            # BNS 318 (Cheating)
            sec_318 = next((s for s in all_sections if s.id == "sec-bns-318"), None)
            if sec_318:
                matched_results.append({
                    "section": sec_318,
                    "relevance_score": 0.90,
                    "reason_explanation": "Fraudulent inducement causing dishonest delivery of funds or property from your bank account.",
                    "matched_facts": ["Financial deception"]
                })

            # IT Act 66C (Identity Theft / OTP / Password misuse)
            sec_66c = next((s for s in all_sections if s.id == "sec-it-66c"), None)
            if sec_66c:
                matched_results.append({
                    "section": sec_66c,
                    "relevance_score": 0.85,
                    "reason_explanation": "Fraudster misused digital credentials, OTP, or identity features to execute the unauthorized transaction.",
                    "matched_facts": ["Digital credentials misuse"]
                })

        # 3. Assault / Injury matches
        elif category == "Assault / Injury":
            # BNS 115 (Voluntarily causing hurt)
            sec_115 = next((s for s in all_sections if s.id == "sec-bns-115"), None)
            if sec_115:
                matched_results.append({
                    "section": sec_115,
                    "relevance_score": 0.94,
                    "reason_explanation": "Physical pain, bodily harm, or injury was inflicted intentionally during the incident.",
                    "matched_facts": [f"Harm: {facts.get('incident_nature', 'Physical assault')}"]
                })

            # BNS 351 (Criminal intimidation)
            sec_351 = next((s for s in all_sections if s.id == "sec-bns-351"), None)
            if sec_351:
                matched_results.append({
                    "section": sec_351,
                    "relevance_score": 0.89,
                    "reason_explanation": "Verbal threats to life, bodily safety, or property were made with intent to cause alarm or distress.",
                    "matched_facts": ["Threats to safety"]
                })

        # 4. Property Dispute matches
        elif category == "Property Dispute":
            # BNS 329 (Criminal trespass)
            sec_329 = next((s for s in all_sections if s.id == "sec-bns-329"), None)
            if sec_329:
                matched_results.append({
                    "section": sec_329,
                    "relevance_score": 0.92,
                    "reason_explanation": "Unlawful entry or remaining upon land/plot in your possession with intent to commit an offence or illegally occupy it.",
                    "matched_facts": [f"Property: {facts.get('property_type', 'Real estate property')}"]
                })

        # 5. Consumer Problem matches
        elif category == "Consumer Problem":
            # CPA Section 2(11) (Deficiency in service)
            sec_cpa = next((s for s in all_sections if s.id == "sec-cpa-2-11"), None)
            if sec_cpa:
                matched_results.append({
                    "section": sec_cpa,
                    "relevance_score": 0.95,
                    "reason_explanation": "The product or service purchased failed to perform as agreed, had manufacturing defects, or replacement/refund was unjustly denied.",
                    "matched_facts": [f"Product/Service: {facts.get('consumer_product', 'Goods/Services')}", f"Issue: {facts.get('defect_nature', 'Defect / denial of refund')}"]
                })

        # 6. Electronic Evidence Rule: Section 63 BSA 2023
        # If evidence includes screenshots, CCTV, emails, or digital statements
        has_digital_evidence = has_evidence or "cctv" in str(facts).lower() or "screenshot" in str(facts).lower() or "receipt" in str(facts).lower()
        if has_digital_evidence:
            sec_bsa = next((s for s in all_sections if s.id == "sec-bsa-63"), None)
            if sec_bsa:
                matched_results.append({
                    "section": sec_bsa,
                    "relevance_score": 0.85,
                    "reason_explanation": "Electronic records (CCTV footage, digital invoices, screenshots, WhatsApp chats) are legally admissible before authorities under BSA Section 63 when accompanied by a certificate.",
                    "matched_facts": ["Digital evidence attached/available"]
                })

        return matched_results
