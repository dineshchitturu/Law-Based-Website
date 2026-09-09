from typing import Dict, Any, List, Optional

class QuestionItem:
    def __init__(
        self,
        code: str,
        category: str,
        text: str,
        q_type: str,
        options: List[str],
        required: bool,
        target_fact: str,
        skip_if_fact_present: Optional[str] = None,
        help_text: Optional[str] = None
    ):
        self.code = code
        self.category = category
        self.text = text
        self.q_type = q_type
        self.options = options
        self.required = required
        self.target_fact = target_fact
        self.skip_if_fact_present = skip_if_fact_present
        self.help_text = help_text

class InterviewEngine:
    """
    Adaptive intake interview engine. Formulates next questions based on
    facts already extracted, skips redundant questions, and maintains a clean
    one-question-at-a-time government intake flow.
    """

    QUESTION_TREES: Dict[str, List[QuestionItem]] = {
        "Theft": [
            QuestionItem(
                code="theft_item",
                category="Theft",
                text="What was taken?",
                q_type="text",
                options=["Mobile phone", "Laptop / Computer", "Vehicle / Bike", "Money / Cash", "Jewelry", "Other item"],
                required=True,
                target_fact="object_item",
                skip_if_fact_present="object_item",
                help_text="Name the specific item or belongings that were stolen."
            ),
            QuestionItem(
                code="theft_when",
                category="Theft",
                text="When did the incident happen?",
                q_type="text",
                options=["Yesterday", "Today", "Last night", "Within last 3 days", "Last week", "More than a week ago"],
                required=True,
                target_fact="date_time",
                skip_if_fact_present="date_time",
                help_text="Approximate date and time helps establish the timeline for investigation."
            ),
            QuestionItem(
                code="theft_where",
                category="Theft",
                text="Where was the item taken from?",
                q_type="text",
                options=["From my room / hostel", "From inside my house", "Public place / bus / train", "Workplace / office", "Vehicle / road"],
                required=True,
                target_fact="location",
                skip_if_fact_present="location",
                help_text="Specify whether it was taken from a residential room, public transport, or street."
            ),
            QuestionItem(
                code="theft_saw_suspect",
                category="Theft",
                text="Did you see who took it, or do you suspect someone specific?",
                q_type="single_choice",
                options=["No, I did not see anyone", "Yes, I saw the person", "I suspect someone specific", "Not sure"],
                required=True,
                target_fact="suspect_identified",
                help_text="Identifying suspects or noting they are unknown is critical for the complaint draft."
            ),
            QuestionItem(
                code="theft_cctv",
                category="Theft",
                text="Is CCTV footage available near the location?",
                q_type="single_choice",
                options=["Yes, CCTV is available", "No CCTV in the area", "Not sure / need to check"],
                required=True,
                target_fact="cctv_available",
                help_text="Police can request CCTV preservation under Bharatiya Nagarik Suraksha Sanhita."
            ),
            QuestionItem(
                code="theft_ownership_proof",
                category="Theft",
                text="Do you have proof that the item belongs to you?",
                q_type="single_choice",
                options=["Yes, purchase receipt / invoice", "Yes, product box / IMEI / serial number", "Online order confirmation", "No proof currently"],
                required=True,
                target_fact="ownership_proof",
                help_text="Proof of purchase or serial number verifies legal custody of the movable property."
            ),
            QuestionItem(
                code="theft_approx_value",
                category="Theft",
                text="What is the approximate value of the stolen property?",
                q_type="single_choice",
                options=["Under ₹5,000", "₹5,000 to ₹25,000", "₹25,000 to ₹1,00,000", "Above ₹1,00,000"],
                required=False,
                target_fact="item_value",
                skip_if_fact_present="amount",
                help_text="Under Bharatiya Nyaya Sanhita 2023, theft of value under ₹5,000 has specific provisions."
            ),
            QuestionItem(
                code="theft_witnesses",
                category="Theft",
                text="Were there any witnesses who were present?",
                q_type="single_choice",
                options=["Yes, witnesses were present", "No witnesses", "Not sure"],
                required=False,
                target_fact="witnesses_present",
                help_text="Witness statements provide crucial evidentiary support."
            )
        ],

        "Cyber Fraud": [
            QuestionItem(
                code="cyber_fraud_channel",
                category="Cyber Fraud",
                text="How did the fraud happen?",
                q_type="single_choice",
                options=["UPI (GPay / PhonePe / Paytm)", "Bank Transfer / Net Banking", "Debit / Credit Card", "Online Shopping / Fake Website", "Fake Call / Impersonation", "Social Media / Telegram"],
                required=True,
                target_fact="fraud_channel",
                help_text="Helps determine whether Information Technology Act Sec 66D applies."
            ),
            QuestionItem(
                code="cyber_amount_lost",
                category="Cyber Fraud",
                text="How much money was involved?",
                q_type="single_choice",
                options=["Under ₹10,000", "₹10,000 to ₹50,000", "₹50,000 to ₹2,00,000", "Above ₹2,00,000"],
                required=True,
                target_fact="amount_lost",
                skip_if_fact_present="amount",
                help_text="Exact amount transferred or deducted without your permission."
            ),
            QuestionItem(
                code="cyber_when",
                category="Cyber Fraud",
                text="When did the transaction happen?",
                q_type="text",
                options=["Within the last 2 hours", "Today", "Yesterday", "2 to 7 days ago", "More than a week ago"],
                required=True,
                target_fact="transaction_time",
                skip_if_fact_present="date_time",
                help_text="Reporting within the 'Golden Hour' (first 2-24 hours) maximizes chance of funds lien freeze."
            ),
            QuestionItem(
                code="cyber_txn_id",
                category="Cyber Fraud",
                text="Do you have the Transaction Reference / UTR ID?",
                q_type="single_choice",
                options=["Yes, have 12-digit UTR/Txn ID", "Visible in bank statement", "Not available right now"],
                required=True,
                target_fact="has_txn_id",
                skip_if_fact_present="transaction_id",
                help_text="UTR number allows cyber police to trace the beneficiary bank account immediately."
            ),
            QuestionItem(
                code="cyber_bank_notified",
                category="Cyber Fraud",
                text="Did you contact your bank or payment provider?",
                q_type="single_choice",
                options=["Yes, bank frozen / ticket opened", "Called helpline, waiting for reply", "Not yet contacted bank"],
                required=True,
                target_fact="bank_contacted",
                help_text="Immediate intimation to bank is mandatory under RBI guidelines for limited liability."
            ),
            QuestionItem(
                code="cyber_evidence_available",
                category="Cyber Fraud",
                text="What evidence do you have available?",
                q_type="single_choice",
                options=["Payment screenshot & debit SMS", "Full bank account statement", "WhatsApp/Telegram chats & link", "Phone numbers of fraudster", "Multiple of the above"],
                required=False,
                target_fact="evidence_types",
                help_text="Preserving digital records under Bharatiya Sakshya Adhiniyam Section 63."
            )
        ],

        "Assault / Injury": [
            QuestionItem(
                code="assault_what_happened",
                category="Assault / Injury",
                text="What happened during the incident?",
                q_type="single_choice",
                options=["Physical beating / hitting", "Pushed / slapped during argument", "Attacked with object / weapon", "Threatened with physical harm only"],
                required=True,
                target_fact="incident_nature",
                help_text="Helps determine applicable section under BNS 2023 (Sec 115 vs Sec 117)."
            ),
            QuestionItem(
                code="assault_who_involved",
                category="Assault / Injury",
                text="Who was involved?",
                q_type="single_choice",
                options=["Known neighbor or acquaintance", "Family member / relative", "Unknown stranger", "Group of individuals"],
                required=True,
                target_fact="persons_involved",
                help_text="Specifying whether perpetrator is known or unknown."
            ),
            QuestionItem(
                code="assault_when_where",
                category="Assault / Injury",
                text="When and where did this occur?",
                q_type="text",
                options=["Today near my residence", "Yesterday in public area", "At workplace", "Other location"],
                required=True,
                target_fact="incident_location_time",
                skip_if_fact_present="location",
                help_text="Jurisdictional police station depends on location of occurrence."
            ),
            QuestionItem(
                code="assault_medical_treatment",
                category="Assault / Injury",
                text="Was medical treatment or hospital examination obtained?",
                q_type="single_choice",
                options=["Yes, Government Hospital / MLC prepared", "Yes, private clinic prescription", "First aid at home", "No medical treatment yet"],
                required=True,
                target_fact="medical_treatment_status",
                help_text="Medico-Legal Certificate (MLC) is primary corroborative evidence in hurt cases."
            ),
            QuestionItem(
                code="assault_threats",
                category="Assault / Injury",
                text="Were threats made to your life or safety?",
                q_type="single_choice",
                options=["Yes, direct threats to life or limb", "Threats of property damage / false cases", "No threats made"],
                required=False,
                target_fact="threats_made",
                help_text="Invokes Criminal Intimidation under BNS Section 351."
            ),
            QuestionItem(
                code="assault_evidence",
                category="Assault / Injury",
                text="Do you have photo or video evidence of injuries or the altercation?",
                q_type="single_choice",
                options=["Yes, photos of injuries", "Yes, video recording / CCTV", "Medical prescription available", "No photo/video proof"],
                required=False,
                target_fact="injury_evidence",
                help_text="Physical injury photos support police FIR registration."
            )
        ],

        "Property Dispute": [
            QuestionItem(
                code="prop_type",
                category="Property Dispute",
                text="What type of property is involved in this dispute?",
                q_type="single_choice",
                options=["Residential house / flat", "Vacant residential plot", "Agricultural farmland", "Commercial shop / building", "Ancestral shared land"],
                required=True,
                target_fact="property_type",
                help_text="Categorizes whether civil revenue or municipal guidelines apply."
            ),
            QuestionItem(
                code="prop_ownership_docs",
                category="Property Dispute",
                text="Do you possess legal ownership documents?",
                q_type="single_choice",
                options=["Yes, registered Sale Deed / Patta in my name", "Ancestral partition / Will documents", "Agreement of sale / Possession receipt", "No formal documents currently"],
                required=True,
                target_fact="ownership_documents",
                help_text="Title documents substantiate lawful possession and ownership rights."
            ),
            QuestionItem(
                code="prop_dispute_nature",
                category="Property Dispute",
                text="What is the nature of the dispute?",
                q_type="single_choice",
                options=["Illegal encroachment / trespassing", "Refusal of tenant to vacate", "Dispute over boundaries / survey", "Family inheritance disagreement", "Fraudulent sale / fake documents"],
                required=True,
                target_fact="dispute_nature",
                help_text="Distinguishes criminal trespass from pure civil boundary demarcation."
            ),
            QuestionItem(
                code="prop_other_party",
                category="Property Dispute",
                text="Who is the other party in the dispute?",
                q_type="single_choice",
                options=["Neighboring property owner", "Relative / family co-sharer", "Tenant / occupant", "Third party / land grabber"],
                required=True,
                target_fact="other_party_type",
                help_text="Identifies the respondent or opposing party."
            ),
            QuestionItem(
                code="prop_police_notice",
                category="Property Dispute",
                text="Have legal notices or police reports been lodged previously?",
                q_type="single_choice",
                options=["Legal notice sent through advocate", "Police complaint filed earlier", "Civil suit pending in court", "No prior legal action taken"],
                required=False,
                target_fact="prior_legal_action",
                help_text="Prevents duplicate litigation and checks status of notices."
            )
        ],

        "Consumer Problem": [
            QuestionItem(
                code="consumer_product",
                category="Consumer Problem",
                text="What product or service is this complaint about?",
                q_type="single_choice",
                options=["Home appliance / electronics", "Mobile phone / computer", "E-commerce delivery / order", "Vehicle / automobile", "Internet / telecom / utility", "Banking / financial service"],
                required=True,
                target_fact="consumer_product",
                help_text="Item or service purchased by you as a consumer."
            ),
            QuestionItem(
                code="consumer_defect",
                category="Consumer Problem",
                text="What went wrong with the product or service?",
                q_type="single_choice",
                options=["Defective / stopped working within warranty", "Different / damaged product delivered", "Seller refused replacement or refund", "Service was deficient or delayed", "Billed unfairly / hidden charges"],
                required=True,
                target_fact="defect_nature",
                help_text="Defines deficiency of service or unfair trade practice under CPA 2019."
            ),
            QuestionItem(
                code="consumer_seller",
                category="Consumer Problem",
                text="Who was the seller or service provider?",
                q_type="text",
                options=["Online platform (Amazon / Flipkart / etc.)", "Local retail shop / dealer", "Authorized brand service center", "Service company"],
                required=True,
                target_fact="seller_type",
                help_text="Name of the merchant or company who supplied the product."
            ),
            QuestionItem(
                code="consumer_invoice",
                category="Consumer Problem",
                text="Do you have the tax invoice, bill, or warranty card?",
                q_type="single_choice",
                options=["Yes, have invoice and warranty card", "Have digital order bill / email receipt", "Have bank transaction proof only", "No receipt available"],
                required=True,
                target_fact="invoice_available",
                help_text="Tax invoice is essential proof of consumer transaction under Section 2(7) CPA."
            ),
            QuestionItem(
                code="consumer_complaint_raised",
                category="Consumer Problem",
                text="Did you already submit a grievance to the company?",
                q_type="single_choice",
                options=["Yes, raised ticket but rejected", "Yes, waiting over 15 days without resolution", "Not contacted customer care yet"],
                required=False,
                target_fact="grievance_status",
                help_text="Shows that opportunity was given to the seller before seeking legal redressal."
            )
        ]
    }

    @classmethod
    def get_questions_for_category(cls, category: str) -> List[QuestionItem]:
        # Fallback to Theft if unknown
        return cls.QUESTION_TREES.get(category, cls.QUESTION_TREES["Theft"])

    @classmethod
    def get_next_question(
        cls,
        category: str,
        known_facts: Dict[str, Any],
        answered_codes: List[str]
    ) -> Optional[QuestionItem]:
        """
        Determines the single next most relevant question.
        Skips questions if the fact is already known (e.g. extracted via NLP from user initial input).
        """
        questions = cls.get_questions_for_category(category)

        for q in questions:
            # Check if already answered in this session
            if q.code in answered_codes:
                continue

            # Check if fact was already extracted from initial text!
            if q.skip_if_fact_present and q.skip_if_fact_present in known_facts:
                val = known_facts.get(q.skip_if_fact_present)
                if val and str(val).strip():
                    continue

            if q.target_fact in known_facts:
                val = known_facts.get(q.target_fact)
                if val and str(val).strip():
                    continue

            return q

        return None
