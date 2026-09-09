from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/resources", tags=["Official Resources & Emergency"])

class EmergencyCheckRequest(BaseModel):
    text: str

class EmergencyCheckResponse(BaseModel):
    is_emergency: bool
    message: str
    helpline_numbers: List[Dict[str, str]]

OFFICIAL_RESOURCES_DATA = [
    {
        "category": "Police & Emergency Services",
        "items": [
            {
                "title": "National Emergency Support System",
                "authority": "Ministry of Home Affairs",
                "phone": "112",
                "url": "https://112.gov.in",
                "description": "Unified single emergency response number across India for Police, Fire, and Ambulance.",
                "is_official": True
            },
            {
                "title": "Police Control Room",
                "authority": "State Police Forces",
                "phone": "100",
                "url": "https://mha.gov.in",
                "description": "Direct emergency dispatch for immediate reporting of crime, violence, or security threats.",
                "is_official": True
            },
            {
                "title": "Women Helpline",
                "authority": "Ministry of Women and Child Development",
                "phone": "1090 / 181",
                "url": "https://wcd.nic.in",
                "description": "24x7 toll-free dedicated emergency response for women facing harassment, violence, or domestic distress.",
                "is_official": True
            }
        ]
    },
    {
        "category": "Cyber Crime Reporting",
        "items": [
            {
                "title": "National Cyber Crime Reporting Portal (NCRP)",
                "authority": "Indian Cyber Crime Coordination Centre (I4C), MHA",
                "phone": "1930",
                "url": "https://cybercrime.gov.in",
                "description": "Official national citizen portal to lodge complaints of online financial fraud, cyber stalking, and online impersonation.",
                "is_official": True
            },
            {
                "title": "Citizen Financial Cyber Fraud Reporting System",
                "authority": "I4C & Reserve Bank of India",
                "phone": "1930",
                "url": "https://cybercrime.gov.in",
                "description": "Immediate reporting mechanism to freeze defrauded amounts in the banking system during the 'Golden Hour'.",
                "is_official": True
            }
        ]
    },
    {
        "category": "Consumer Redressal & Mediation",
        "items": [
            {
                "title": "National Consumer Helpline (NCH)",
                "authority": "Department of Consumer Affairs",
                "phone": "1915 / 1800-11-4000",
                "url": "https://consumerhelpline.gov.in",
                "description": "Government grievance portal for consumers to register complaints against deficient products, sellers, and services.",
                "is_official": True
            },
            {
                "title": "e-Daakhil Portal",
                "authority": "National Consumer Disputes Redressal Commission (NCDRC)",
                "phone": "011-24300661",
                "url": "https://edaakhil.nic.in",
                "description": "Official digital filing platform to submit consumer cases online before District, State, and National Consumer Commissions without physical court visits.",
                "is_official": True
            }
        ]
    },
    {
        "category": "Government Legal Services & Legal Aid",
        "items": [
            {
                "title": "National Legal Services Authority (NALSA)",
                "authority": "Statutory body under Legal Services Authorities Act",
                "phone": "15100",
                "url": "https://nalsa.gov.in",
                "description": "Provides free competent legal aid and advice to weaker sections of society, marginalized groups, women, and undertrials.",
                "is_official": True
            },
            {
                "title": "Tele-Law (Department of Justice)",
                "authority": "Ministry of Law and Justice",
                "phone": "14430",
                "url": "https://www.tele-law.in",
                "description": "Connects citizens in rural and urban areas with panel lawyers via video conferencing and telephone at Common Service Centers (CSCs).",
                "is_official": True
            },
            {
                "title": "e-Courts Citizen Portal",
                "authority": "e-Committee, Supreme Court of India",
                "phone": "N/A",
                "url": "https://ecourts.gov.in",
                "description": "Official portal to check case status, court cause lists, FIR status, and judicial orders across District and High Courts.",
                "is_official": True
            }
        ]
    },
    {
        "category": "Statutory Legislation & Gazettes",
        "items": [
            {
                "title": "India Code Digital Repository",
                "authority": "Legislative Department, Ministry of Law and Justice",
                "phone": "N/A",
                "url": "https://www.indiacode.nic.in",
                "description": "Official database containing full, authentic text of all Central Acts and State legislation as amended.",
                "is_official": True
            },
            {
                "title": "The Gazette of India (eGazette)",
                "authority": "Directorate of Printing, Ministry of Housing and Urban Affairs",
                "phone": "N/A",
                "url": "https://egazette.gov.in",
                "description": "Authorized electronic publishing portal for official government notifications, new criminal laws, and presidential acts.",
                "is_official": True
            }
        ]
    }
]

@router.get("")
def get_official_resources():
    return OFFICIAL_RESOURCES_DATA

@router.post("/check-emergency", response_model=EmergencyCheckResponse)
def check_emergency_text(data: EmergencyCheckRequest):
    from backend.app.services.fact_extractor import FactExtractor
    is_emergency = FactExtractor.check_emergency(data.text)
    msg = (
        "⚠️ EMERGENCY DETECTED: If you or anyone is in immediate physical danger, ongoing violence, or facing threat to life, your immediate safety comes first."
        if is_emergency
        else "No immediate physical danger detected."
    )
    helplines = [
        {"name": "National Emergency Helpline", "number": "112"},
        {"name": "Police Control Room", "number": "100"},
        {"name": "National Cyber Crime Helpline", "number": "1930"},
        {"name": "Women in Distress Helpline", "number": "1090 / 181"},
        {"name": "National Consumer Helpline", "number": "1915"}
    ]
    return EmergencyCheckResponse(
        is_emergency=is_emergency,
        message=msg,
        helpline_numbers=helplines
    )
