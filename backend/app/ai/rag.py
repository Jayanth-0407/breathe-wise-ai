from typing import List, Dict, Any

AUTHORITATIVE_KNOWLEDGE_DOCS = [
    {
        "id": "who_aqg_2021_pm25",
        "title": "WHO Global Air Quality Guidelines (2021) — Particulate Matter",
        "source": "World Health Organization (WHO), 2021. ISBN 978-92-4-003422-8",
        "url": "https://www.who.int/publications/i/item/9789240034228",
        "keywords": ["pm2.5", "pm10", "threshold", "who", "guidelines", "standards", "respiratory", "cardiovascular"],
        "content": (
            "WHO 2021 Guidelines recommend an annual mean PM2.5 limit of 5 µg/m³ and a 24-hour mean limit of 15 µg/m³. "
            "For PM10, the annual limit is 15 µg/m³ and the 24-hour limit is 45 µg/m³. Exposure to particulate matter is "
            "causally linked to ischemic heart disease, stroke, lung cancer, chronic obstructive pulmonary disease (COPD), "
            "and acute lower respiratory infections in children."
        ),
    },
    {
        "id": "cpcb_naqi_standards",
        "title": "CPCB National Air Quality Index (NAQI) Technical Report",
        "source": "Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, India, 2014",
        "url": "https://cpcb.nic.in/national-air-quality-index/",
        "keywords": ["cpcb", "naqi", "india", "delhi", "breakpoints", "categories", "severe", "poor"],
        "content": (
            "The CPCB NAQI defines six categories: Good (0-50, minimal impact), Satisfactory (51-100, minor breathing discomfort to sensitive people), "
            "Moderate (101-200, breathing discomfort to people with lungs, asthma, and heart diseases), Poor (201-300, breathing discomfort to most people on prolonged exposure), "
            "Very Poor (301-400, respiratory illness on prolonged exposure), and Severe (401-500, affects healthy people and seriously impacts those with existing diseases)."
        ),
    },
    {
        "id": "masks_and_respirators",
        "title": "Personal Protective Equipment Against Urban Ambient Particulate Matter",
        "source": "US Centers for Disease Control and Prevention (CDC) & NIOSH Particulate Standards",
        "url": "https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/",
        "keywords": ["mask", "n95", "cloth mask", "surgical", "protection", "respirator", "filter"],
        "content": (
            "Certified particulate respirators (such as N95, FFP2, or KF94) filter at least 94-95% of airborne particles down to 0.3 microns when properly fitted. "
            "Simple surgical masks and cloth face coverings offer little to no fine particle protection against PM2.5 (often less than 20-30% filtration) because "
            "they lack electrostatically charged meltblown filter media and do not create an airtight facial seal."
        ),
    },
    {
        "id": "indoor_air_purification",
        "title": "Residential Air Cleaners and Indoor Air Quality",
        "source": "US Environmental Protection Agency (EPA) Indoor Environments Division (EPA 402-F-08-004)",
        "url": "https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home",
        "keywords": ["hepa", "air purifier", "indoor", "cadr", "filtration", "dust", "smoke", "cleaning"],
        "content": (
            "True HEPA filters capture 99.97% of particles as small as 0.3 microns. To ensure effective room air exchange, "
            "the Clean Air Delivery Rate (CADR) for smoke should equal at least two-thirds (2/3) of the room area in square feet. "
            "Avoid ozone-generating or ionizing cleaners, as ozone is a powerful lung irritant. Keep windows sealed during peak outdoor pollution hours."
        ),
    },
    {
        "id": "exercise_pollution_tradeoff",
        "title": "Health Benefits of Cycling and Walking Versus Harm from Inhaled Air Pollution",
        "source": "Tainio et al., Preventive Medicine (2016), Cambridge University Environmental Health Research",
        "url": "https://doi.org/10.1016/j.ypmed.2016.02.002",
        "keywords": ["exercise", "jogging", "cycling", "health tradeoff", "tipping point", "benefit", "risk"],
        "content": (
            "In most urban environments, the cardiovascular benefits of physical activity outweigh the risks of air pollution up to a 'tipping point'. "
            "However, when ambient PM2.5 exceeds 100-150 µg/m³ (AQI > 200), intense endurance exercise (such as distance running) increases deep alveolar deposition "
            "substantially due to high ventilation rates (up to 40-60 L/min) and mouth breathing, shifting the balance toward net harm. In such conditions, shifting to indoor exercise is advised."
        ),
    },
]

class EnvironmentalRAG:
    @classmethod
    def search(cls, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        query_terms = query.lower().split()
        scored_docs = []

        for doc in AUTHORITATIVE_KNOWLEDGE_DOCS:
            score = 0
            # Check keywords match
            for kw in doc["keywords"]:
                if any(kw in term or term in kw for term in query_terms):
                    score += 3
            # Check text match
            content_lower = doc["content"].lower()
            for term in query_terms:
                if len(term) > 3 and term in content_lower:
                    score += 1

            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [d for _, d in scored_docs[:top_k]]
        
        # If no direct match, return primary WHO doc as grounding baseline
        if not results:
            results = [AUTHORITATIVE_KNOWLEDGE_DOCS[0]]

        return results
