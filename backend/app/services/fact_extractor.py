import re
from typing import Dict, Any, List, Tuple

class FactExtractor:
    """
    Deterministic rule-based fact extraction engine designed for ordinary citizens'
    informal complaint language. Extracts dates, locations, objects, categories,
    financial loss, suspects, and emergency signals.
    """

    EMERGENCY_KEYWORDS = [
        "immediate danger", "life threat", "threat to kill", "killing me",
        "ongoing attack", "weapons", "holding a knife", "holding a gun",
        "being beaten right now", "serious bleeding", "domestic violence now",
        "emergency", "hostage"
    ]

    CATEGORY_PATTERNS = {
        "Theft": [
            r"\b(?:stolen|theft|stole|robbed|pickpocket|burglary|break-in|snatched|missing phone|missing bike)\b",
            r"\btook my (?:phone|mobile|wallet|bag|laptop|bike|car|money|jewelry|gold)\b"
        ],
        "Cyber Fraud": [
            r"\b(?:upi|gpay|phonepe|paytm|bank transfer|phishing|otp|scam|cheated online|electricity bill link|debit card fraud|credit card fraud|unauthorized debit|telegram task|apk)\b",
            r"\btransferred money without\b",
            r"\bhacked my account\b"
        ],
        "Assault / Injury": [
            r"\b(?:assault|beaten|beat me|hit me|slapped|punched|physical attack|attacked me|injured|threatened to beat|bleeding|hospitalized|fracture)\b",
            r"\bfight happened\b"
        ],
        "Property Dispute": [
            r"\b(?:property|land|plot|encroachment|boundary|tenant|landlord|illegal possession|eviction|trespass|patta|registry|ancestral land)\b",
            r"\billegally occupied\b"
        ],
        "Consumer Problem": [
            r"\b(?:defective|not working|warranty|refused refund|replacement|amazon|flipkart|seller|poor service|damaged product|refrigerator|appliance)\b",
            r"\bdelivered damaged\b"
        ]
    }

    OBJECT_PATTERNS = {
        "mobile phone": [r"\b(?:phone|mobile|smartphone|iphone|oneplus|samsung|redmi|vivo|oppo|handset)\b"],
        "laptop/computer": [r"\b(?:laptop|computer|macbook|dell|hp|pc|tablet|ipad)\b"],
        "vehicle/bike": [r"\b(?:bike|motorcycle|scooter|activa|car|vehicle|bicycle)\b"],
        "wallet/purse": [r"\b(?:wallet|purse|handbag|bag|backpack)\b"],
        "money/cash": [r"\b(?:cash|money|rupees|amount|funds|savings)\b"],
        "jewelry/gold": [r"\b(?:gold|jewelry|jewellery|chain|ring|necklace)\b"],
        "appliances": [r"\b(?:refrigerator|fridge|tv|washing machine|ac|air conditioner)\b"],
        "land/plot": [r"\b(?:land|plot|flat|apartment|house|shop|farmland|field)\b"]
    }

    LOCATION_PATTERNS = {
        "room/hostel": [r"\b(?:room|hostel|pg|paying guest|dormitory|dorm)\b"],
        "home/residence": [r"\b(?:home|house|flat|apartment|residence|building)\b"],
        "public place/street": [r"\b(?:street|road|bus stop|railway station|metro|market|bazaar|mall)\b"],
        "office/workplace": [r"\b(?:office|workplace|shop|store|work)\b"],
        "online/internet": [r"\b(?:online|internet|whatsapp|telegram|instagram|facebook|website|app)\b"]
    }

    TIME_PATTERNS = {
        "yesterday": r"\byesterday\b",
        "today": r"\btoday\b",
        "last night": r"\blast night\b",
        "this morning": r"\bthis morning\b",
        "last week": r"\blast week\b",
        "a few days ago": r"\b(?:few days ago|2 days ago|3 days ago|couple of days ago)\b",
        "specific_date": r"\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
    }

    @classmethod
    def check_emergency(cls, text: str) -> bool:
        lowered = text.lower()
        for kw in cls.EMERGENCY_KEYWORDS:
            if kw in lowered:
                return True
        return False

    @classmethod
    def classify_category(cls, text: str) -> str:
        lowered = text.lower()
        scores: Dict[str, int] = {cat: 0 for cat in cls.CATEGORY_PATTERNS}

        for cat, patterns in cls.CATEGORY_PATTERNS.items():
            for pat in patterns:
                matches = re.findall(pat, lowered)
                scores[cat] += len(matches) * 2

        best_cat = max(scores, key=scores.get)
        if scores[best_cat] > 0:
            return best_cat
        return "Other"

    @classmethod
    def extract_facts(cls, text: str, existing_category: str = None) -> Dict[str, Any]:
        lowered = text.lower()
        extracted: Dict[str, Any] = {}

        # 1. Category
        detected_category = cls.classify_category(text)
        category = existing_category if existing_category and existing_category != "I don't know" else detected_category
        extracted["category"] = category

        # 2. Emergency check
        extracted["emergency_detected"] = cls.check_emergency(text)

        # 3. Incident Type / Action
        if "stolen" in lowered or "theft" in lowered or "took" in lowered:
            extracted["incident_type"] = "Theft without consent"
        elif "upi" in lowered or "transferred" in lowered or "scam" in lowered or "fraud" in lowered:
            extracted["incident_type"] = "Unauthorized financial transaction / online fraud"
        elif "hit" in lowered or "beaten" in lowered or "assault" in lowered:
            extracted["incident_type"] = "Physical assault / hurt"
        elif "encroach" in lowered or "trespass" in lowered:
            extracted["incident_type"] = "Property encroachment / dispute"
        elif "defective" in lowered or "refund" in lowered:
            extracted["incident_type"] = "Consumer service deficiency"

        # 4. Object / Item
        for obj_label, patterns in cls.OBJECT_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, lowered):
                    extracted["object_item"] = obj_label
                    break
            if "object_item" in extracted:
                break

        # 5. Location
        for loc_label, patterns in cls.LOCATION_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, lowered):
                    extracted["location"] = loc_label
                    break
            if "location" in extracted:
                break

        # 6. Incident Date / Time
        for time_label, pat in cls.TIME_PATTERNS.items():
            match = re.search(pat, lowered)
            if match:
                extracted["date_time"] = match.group(0) if time_label == "specific_date" else time_label
                break

        # 7. Monetary Amount (e.g. ₹45,000, 5000 rs, Rs. 10000)
        amount_match = re.search(r"(?:rs\.?|inr|₹)\s*([\d,]+)|([\d,]+)\s*(?:rupees|rs)", lowered)
        if amount_match:
            amt = amount_match.group(1) or amount_match.group(2)
            extracted["amount"] = f"₹{amt.replace(',', '')}"

        # 8. Transaction ID (e.g. UPI Ref, Txn ID)
        txn_match = re.search(r"(?:txn|utr|ref|transaction)\s*(?:id|no\.?|number)?\s*[:#-]?\s*([a-zA-Z0-9]{8,24})", lowered)
        if txn_match:
            extracted["transaction_id"] = txn_match.group(1)

        # 9. Evidence mentions
        evidence_found = []
        if "cctv" in lowered:
            evidence_found.append("CCTV Footage")
        if "receipt" in lowered or "bill" in lowered or "invoice" in lowered:
            evidence_found.append("Purchase Receipt / Invoice")
        if "screenshot" in lowered:
            evidence_found.append("Screenshots")
        if "statement" in lowered:
            evidence_found.append("Bank Account Statement")
        if "message" in lowered or "whatsapp" in lowered or "sms" in lowered:
            evidence_found.append("Chat / SMS Messages")
        if evidence_found:
            extracted["evidence_mentioned"] = evidence_found

        # 10. Suspect or other party
        if "unknown" in lowered or "stranger" in lowered or "don't know who" in lowered:
            extracted["suspect_status"] = "Unknown person"
        elif "roommate" in lowered:
            extracted["suspect_status"] = "Roommate / acquaintance"
        elif "friend" in lowered:
            extracted["suspect_status"] = "Known associate / acquaintance"
        elif "seller" in lowered or "shopkeeper" in lowered:
            extracted["suspect_status"] = "Seller / vendor"

        return extracted
