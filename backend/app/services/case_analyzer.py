from typing import Dict, Any, List, Tuple

class CaseAnalyzer:
    """
    Evaluates case information completeness, separates facts present from
    critical missing elements, and prepares next actionable citizen steps.
    Never promises win rate or court outcome.
    """

    CRITICAL_FIELDS = {
        "Theft": [
            ("object_item", "Details of stolen item"),
            ("date_time", "Approximate date and time"),
            ("location", "Specific location or premises"),
            ("ownership_proof", "Proof of ownership (invoice/IMEI/box)"),
            ("cctv_available", "CCTV availability status"),
            ("suspect_identified", "Suspect information / unknown status")
        ],
        "Cyber Fraud": [
            ("fraud_channel", "Fraud channel / payment medium"),
            ("amount", "Exact monetary loss amount"),
            ("date_time", "Transaction date and time"),
            ("transaction_id", "Transaction Reference / UTR number"),
            ("bank_contacted", "Bank / payment provider intimation status")
        ],
        "Assault / Injury": [
            ("incident_nature", "Description of physical act"),
            ("date_time", "Date and time of incident"),
            ("location", "Location of occurrence"),
            ("persons_involved", "Identity or description of persons involved"),
            ("medical_treatment_status", "Medical treatment / MLC record")
        ],
        "Property Dispute": [
            ("property_type", "Type and description of property"),
            ("ownership_documents", "Title deed / registered sale deed details"),
            ("dispute_nature", "Nature of grievance or encroachment"),
            ("other_party_type", "Opposing party details")
        ],
        "Consumer Problem": [
            ("consumer_product", "Product or service details"),
            ("defect_nature", "Defect or service failure details"),
            ("invoice_available", "Tax invoice or purchase receipt"),
            ("seller_type", "Seller / merchant details"),
            ("grievance_status", "Prior customer care escalation")
        ]
    }

    @classmethod
    def calculate_readiness(
        cls,
        category: str,
        facts: Dict[str, Any],
        evidence_count: int = 0
    ) -> Tuple[int, List[str], List[str], List[str]]:
        """
        Returns:
            (completeness_score, information_used, information_still_needed, recommended_steps)
        """
        fields = cls.CRITICAL_FIELDS.get(category, cls.CRITICAL_FIELDS["Theft"])
        total_possible = len(fields) + 1 # +1 for evidence
        matched_count = 0
        used_items = []
        needed_items = []

        # Check fields
        for key, label in fields:
            # Check direct key or alternate keys
            val = facts.get(key)
            if not val and key == "amount":
                val = facts.get("amount_lost")
            if not val and key == "transaction_id":
                val = facts.get("has_txn_id")

            if val and str(val).strip() and str(val).lower() not in ["none", "no proof currently", "not sure"]:
                matched_count += 1
                used_items.append(f"{label}: {val}")
            else:
                needed_items.append(f"{label} (Optional but strongly strengthens documentation)")

        # Evidence bonus
        if evidence_count > 0:
            matched_count += 1
            used_items.append(f"Attached Evidence: {evidence_count} file(s) uploaded")
        else:
            needed_items.append("Supporting Evidence (receipts, photos, screenshots, or CCTV footage)")

        # Calculate completeness percentage (capped between 25% and 95%)
        # Base intake gives 25% just for initial narrative
        raw_pct = int((matched_count / total_possible) * 75) + 25
        completeness_score = min(95, max(25, raw_pct))

        # Build recommended next steps based on category
        recommended_steps = cls._generate_next_steps(category, facts, evidence_count)

        return completeness_score, used_items, needed_items, recommended_steps

    @classmethod
    def _generate_next_steps(cls, category: str, facts: Dict[str, Any], evidence_count: int) -> List[str]:
        if category == "Cyber Fraud":
            return [
                "Call 1930 immediately or lodge a cyber grievance at https://cybercrime.gov.in (National Cyber Crime Reporting Portal).",
                "Request your bank's fraud monitoring team to mark a lien / freeze on the destination account using your UTR number.",
                "Download and preserve your official bank statement and screenshots in PDF format.",
                "Submit the generated complaint draft to your local Cyber Crime Police Station or Citizen Service Center."
            ]
        elif category == "Theft":
            return [
                "Preserve proof of ownership such as purchase invoice, product box, or IMEI details.",
                "Request building management / shopkeepers near the scene to preserve CCTV recordings immediately.",
                "Submit the prepared Police Complaint Draft to the Station House Officer (SHO) of your local jurisdictional police station under BNSS Section 173.",
                "Ensure you receive an acknowledgment receipt and a free copy of the registered First Information Report (FIR)."
            ]
        elif category == "Assault / Injury":
            return [
                "Prioritize medical attention at a government or registered hospital; request a Medico-Legal Case (MLC) examination report.",
                "Photograph all visible injuries, torn clothing, or property damage in clear lighting.",
                "Present the Incident Statement Draft at the nearest police station to report the occurrence.",
                "If feeling threatened or unsafe, contact National Emergency 112 immediately."
            ]
        elif category == "Property Dispute":
            return [
                "Obtain certified copies of your registered title deed and recent revenue records (e.g., Encumbrance Certificate, Patta / Jamabandi).",
                "Take dated photographs showing the exact boundary pillars or encroached portion.",
                "Serve a formal legal notice through an advocate or report criminal trespass to the local police if unauthorized entry is active.",
                "Consult a civil lawyer regarding an injunction application before the jurisdictional Civil Court."
            ]
        elif category == "Consumer Problem":
            return [
                "Preserve the tax invoice, warranty terms, and all written correspondence with the seller/manufacturer.",
                "Register an official complaint on the National Consumer Helpline portal (https://consumerhelpline.gov.in) or call 1915.",
                "Send the generated formal Consumer Notice to the seller's registered address granting 15 days to resolve.",
                "If unresolved, file an electronic consumer dispute via the official e-Daakhil portal (https://edaakhil.nic.in)."
            ]
        return [
            "Review your structured case summary draft.",
            "Gather any available receipts, photographs, or witness contacts.",
            "Consult a qualified legal professional or free legal aid (NALSA) to verify applicable local procedures."
        ]
