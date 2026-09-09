import datetime
from typing import Dict, Any, List

class DocumentGenerator:
    """
    Generates structured, professional complaint drafts, chronological statements,
    and evidence inventories conforming to Indian administrative standards.
    """

    DISCLAIMER_TEXT = (
        "> **IMPORTANT NOTICE**: This is an informational draft generated automatically "
        "from the details provided by the complainant. It is NOT an officially submitted document. "
        "Review every fact carefully, attach all supporting documents, and verify current procedures "
        "with a legal professional or competent authority before formal submission."
    )

    @classmethod
    def generate_draft(
        cls,
        doc_type: str,
        case_info: Dict[str, Any],
        facts: Dict[str, Any],
        evidence_list: List[Dict[str, Any]],
        complainant_profile: Dict[str, Any]
    ) -> Dict[str, str]:
        today_str = datetime.date.today().strftime("%d-%B-%Y")
        complainant_name = complainant_profile.get("full_name") or case_info.get("complainant_name") or "[Complainant Full Name]"
        complainant_phone = complainant_profile.get("phone_number") or "[Contact Phone Number]"
        complainant_city = complainant_profile.get("city") or "[City, State]"
        category = case_info.get("category", "General Grievance")

        title = f"{doc_type.replace('_', ' ').title()} — {category}"

        if doc_type == "police_complaint":
            content = cls._police_complaint_template(today_str, complainant_name, complainant_phone, complainant_city, case_info, facts, evidence_list)
        elif doc_type == "cybercrime_report":
            content = cls._cybercrime_report_template(today_str, complainant_name, complainant_phone, complainant_city, case_info, facts, evidence_list)
        elif doc_type == "consumer_notice":
            content = cls._consumer_notice_template(today_str, complainant_name, complainant_phone, complainant_city, case_info, facts, evidence_list)
        elif doc_type == "evidence_list":
            content = cls._evidence_inventory_template(today_str, complainant_name, case_info, evidence_list)
        elif doc_type == "chronology":
            content = cls._chronology_template(today_str, complainant_name, case_info, facts)
        else: # incident_statement
            content = cls._incident_statement_template(today_str, complainant_name, complainant_phone, complainant_city, case_info, facts, evidence_list)

        return {
            "title": title,
            "content_markdown": content
        }

    @classmethod
    def _police_complaint_template(cls, date_str, name, phone, city, case_info, facts, evidence_list):
        evidence_md = "\n".join([f"- **Document {i+1}**: {e.get('original_filename')} ({e.get('file_type')}) — {e.get('description', 'Supporting record')}" for i, e in enumerate(evidence_list)]) or "- None attached yet."

        return f"""# FORMAL WRITTEN COMPLAINT / INFORMATION OF OFFENCE
**(Under Section 173, Bharatiya Nagarik Suraksha Sanhita, 2023 / Relevant Criminal Provisions)**

{cls.DISCLAIMER_TEXT}

**Date:** {date_str}

**To,**  
The Station House Officer (SHO),  
Jurisdictional Police Station,  
{city}

---

### SUBJECT:
Complaint regarding **{case_info.get('title', 'Criminal Incident')}** involving **{case_info.get('category', 'Offence')}** against {facts.get('suspect_identified', 'Unknown Person(s)')}.

---

### 1. DETAILS OF THE INFORMANT / COMPLAINANT:
- **Full Name:** {name}
- **Contact Mobile:** {phone}
- **Address / Location:** {city}

### 2. INCIDENT PARTICULARS:
- **Date & Approximate Time:** {facts.get('date_time', case_info.get('incident_date', 'As specified below'))}
- **Place of Occurrence:** {facts.get('location', case_info.get('incident_location', 'As described below'))}
- **Nature of Property / Injury Involved:** {facts.get('object_item', facts.get('amount', case_info.get('loss_damage', 'N/A')))}

### 3. NARRATIVE OF FACTS:
{case_info.get('initial_description', 'No initial narrative provided.')}

**Additional Structured Specifics:**
- **Whether Consent Given:** No consent was granted by the complainant.
- **CCTV / Camera Surveillance:** {facts.get('cctv_available', 'To be verified through neighborhood inspection')}
- **Suspect Particulars:** {facts.get('suspect_identified', 'Unknown / under investigation')}
- **Witnesses Present:** {facts.get('witnesses_present', 'Available for identification if needed')}

### 4. EVIDENCE ATTACHED:
{evidence_md}

### 5. PRAYER / RELIEF REQUESTED:
In light of the facts narrated above, it is respectfully prayed that:
1. An official First Information Report (FIR) / General Diary entry be registered under applicable provisions of Bharatiya Nyaya Sanhita, 2023 (including Section 303 / 305 / 318 as relevant).
2. Prompt investigation be initiated to locate and preserve relevant electronic records / CCTV footage.
3. Appropriate legal action be initiated against the accused person(s) and recovery of property / restitution be effected.

I hereby affirm that the facts stated above are true to the best of my knowledge, information, and belief.

Sincerely,

_________________________  
**{name}**  
(Informant / Complainant)
"""

    @classmethod
    def _cybercrime_report_template(cls, date_str, name, phone, city, case_info, facts, evidence_list):
        return f"""# COMPREHENSIVE CYBER CRIME INCIDENT REPORT
**(For submission to 1930 Helpline / National Cyber Crime Reporting Portal cybercrime.gov.in)**

{cls.DISCLAIMER_TEXT}

**Date of Report:** {date_str}

### 1. COMPLAINANT PARTICULARS:
- **Name:** {name}
- **Mobile Number:** {phone}
- **Location:** {city}

### 2. INCIDENT SUMMARY:
- **Category:** Online Cyber Fraud / Electronic Cheating
- **Platform / Medium Used:** {facts.get('fraud_channel', 'Online Payment / UPI')}
- **Total Amount Lost:** {facts.get('amount', facts.get('amount_lost', 'Under assessment'))}
- **Date & Time of Debit:** {facts.get('date_time', facts.get('transaction_time', 'Recently'))}
- **Transaction Reference (UTR):** {facts.get('transaction_id', facts.get('has_txn_id', 'Refer to attached statement'))}
- **Bank Intimation Status:** {facts.get('bank_contacted', 'Notice initiated')}

### 3. CHRONOLOGY OF THE FRAUD:
{case_info.get('initial_description', 'The complainant was fraudulently induced to transfer funds.')}

### 4. RELEVANT STATUTORY PROVISIONS (FOR POLICE ACTION):
- **Section 66D, Information Technology Act, 2000:** Cheating by personation using computer resource.
- **Section 318, Bharatiya Nyaya Sanhita, 2023:** Cheating and dishonestly inducing delivery of property.
- **Section 63, Bharatiya Sakshya Adhiniyam, 2023:** Preserved electronic record admissibility.

### 5. RELIEF SOUGHT:
1. Urgent freeze / lien marking of the beneficiary bank account / UPI VPA.
2. Tracing of IP address, SIM card registration, and CDR of the numbers involved.
3. Initiation of recovery under statutory banking and law enforcement procedures.

Signed:

_________________________  
**{name}**
"""

    @classmethod
    def _consumer_notice_template(cls, date_str, name, phone, city, case_info, facts, evidence_list):
        return f"""# FORMAL LEGAL NOTICE OF CONSUMER GRIEVANCE
**(Under Consumer Protection Act, 2019 for Deficiency in Service & Unfair Trade Practice)**

{cls.DISCLAIMER_TEXT}

**Date:** {date_str}

**To,**  
The Authorized Representative / Customer Grievance Officer,  
{facts.get('seller_type', '[Merchant / Company Name]')}

---

**SUBJECT: NOTICE DEMANDING REFUND / REPLACEMENT FOR DEFECTIVE GOODS & DEFICIENCY OF SERVICE**

Sir / Madam,

Under instructions from and on behalf of the Consumer **{name}**, residing at {city}, this formal notice is hereby conveyed:

1. That on or around {facts.get('date_time', 'the specified date')}, the Consumer purchased {facts.get('consumer_product', 'the goods/services')} for valuable consideration of {facts.get('amount', 'the agreed price')}.
2. That upon delivery / commencement of use, the following defect / failure was discovered:
   > {case_info.get('initial_description', 'Deficiency in quality and refusal to honor warranty.')}
3. That despite bringing the grievance to your notice ({facts.get('grievance_status', 'Repeated follow-ups')}), you have failed, neglected, and refused to remedy the defect or issue a refund.
4. That your conduct constitutes **Deficiency in Service** under Section 2(11) and **Unfair Trade Practice** under Section 2(47) of the Consumer Protection Act, 2019.

**DEMAND:**  
You are hereby called upon to:
- Refund the full amount paid OR replace the product with a brand new defect-free unit;
- Pay reasonable compensation for harassment and mental agony;  
within **15 (fifteen) days** from the receipt of this notice.

Failing which, the Consumer shall be constrained to institute formal proceedings before the **District Consumer Disputes Redressal Commission (via e-Daakhil)**, holding you liable for all consequential legal costs.

Yours faithfully,

_________________________  
**{name}** (Consumer)
"""

    @classmethod
    def _evidence_inventory_template(cls, date_str, name, case_info, evidence_list):
        items = []
        for i, ev in enumerate(evidence_list, 1):
            size_kb = round(ev.get("file_size", 0) / 1024, 1)
            items.append(f"""| {i} | {ev.get('original_filename')} | {ev.get('file_type')} | {size_kb} KB | {ev.get('description', 'Uploaded evidence')} |""")

        table = "\n".join(items) if items else "| - | No files currently uploaded | - | - | - |"

        return f"""# EVIDENCE INVENTORY & CERTIFICATION LIST
**(Prepared for Legal Record & Evidentiary Submission)**

{cls.DISCLAIMER_TEXT}

**Case Title:** {case_info.get('title')}  
**Category:** {case_info.get('category')}  
**Date of Audit:** {date_str}  
**Custodian / Informant:** {name}  

---

### INDEX OF ATTACHED EXHIBITS:

| No. | File Name | Category | Size | Evidentiary Purpose |
|---|---|---|---|---|
{table}

### LEGAL NOTE ON ELECTRONIC EVIDENCE:
Under **Section 63 of Bharatiya Sakshya Adhiniyam, 2023**, electronic records such as screenshots, call recordings, CCTV footage, and digital statements are admissible in judicial proceedings when accompanied by a signed Certificate declaring the authenticity of the computer/mobile device used.
"""

    @classmethod
    def _chronology_template(cls, date_str, name, case_info, facts):
        return f"""# CHRONOLOGY OF EVENTS & FACTUAL TIMELINE
**(Structured Record of Incident)**

{cls.DISCLAIMER_TEXT}

**Case Title:** {case_info.get('title')}  
**Category:** {case_info.get('category')}  
**Complainant:** {name}  

---

### TIMELINE:

1. **Initial Incident Event:**
   - **Date / Time:** {facts.get('date_time', 'Recorded in case file')}
   - **Occurrence:** {case_info.get('initial_description')}
   - **Location:** {facts.get('location', 'Specified premises')}

2. **Discovery & Immediate Action:**
   - Property / Loss identified: {facts.get('object_item', facts.get('amount', 'Recorded loss'))}
   - Suspects / Witnesses noticed: {facts.get('suspect_identified', 'Unknown / pending identification')}

3. **Post-Incident Notifications:**
   - Bank / Authority contact status: {facts.get('bank_contacted', facts.get('grievance_status', 'Action in progress'))}

4. **Preparation of Case Dossier:**
   - Date of Documentation: {date_str}
   - Readiness Completeness: Evaluated and ready for human review before filing.
"""

    @classmethod
    def _incident_statement_template(cls, date_str, name, phone, city, case_info, facts, evidence_list):
        return f"""# FACTUAL INCIDENT STATEMENT
**(Prepared for Administrative Review & Legal Assistance)**

{cls.DISCLAIMER_TEXT}

**Date:** {date_str}  
**Name of Declarant:** {name}  
**Contact:** {phone} | {city}  

### 1. STATEMENT OF OCCURRENCE:
I, the undersigned, do hereby make the following true and accurate statement regarding the incident involving **{case_info.get('category')}**:

"{case_info.get('initial_description')}"

### 2. SALIENT FACTS:
- **Date & Time:** {facts.get('date_time', 'N/A')}
- **Location:** {facts.get('location', 'N/A')}
- **Persons Involved:** {facts.get('persons_involved', facts.get('suspect_identified', 'Unknown'))}
- **Harm / Loss:** {facts.get('loss_damage', facts.get('object_item', facts.get('amount', 'N/A')))}

### 3. CONFIRMATION:
This statement is prepared to summarize the factual circumstances clearly and without legal embellishment.

Signature:

_________________________  
**{name}**
"""
