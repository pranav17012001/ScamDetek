import re
import random
from typing import Dict, Any
from urllib.parse import urlparse
import joblib
import phonenumbers
import json
from final_version_predict_sms import extract_stronger_numeric_features, get_numeric_cols
import __main__
import pandas as pd
import requests

__main__.get_numeric_cols = get_numeric_cols

xgb_model = joblib.load("./xgb_model/email_classifier_xgb.joblib")
tfidf_vectorizer = joblib.load("./xgb_model/tfidf_vectorizer.joblib")
SMS_MODEL = joblib.load("./xgb_model/final_version_sms_model.pkl")

def custom_tokenizer(url):
    return re.split(r'[\/\.\-\_=\?\&]+', url)

__main__.custom_tokenizer = custom_tokenizer
xgb_model_url = joblib.load("./xgb_model/url_classifier_xgb.joblib")
tfidf_vectorizer_url = joblib.load("./xgb_model/url_tfidf_vectorizer.joblib")

# === Config ===
THREAT_KEYWORDS = [
    "urgent",
    "immediate action required",
    "account suspension",
    "account suspended",
    "security alert",
    "unusual activity",
    "verify your account",
    "legal action",
    "final notice",
    "unauthorized login",
    "your account has been compromised",
    "fraudulent activity detected",
    "pay now",
    "act immediately",
    "your service will be terminated",
    "login attempt detected",
    "security breach",
    "confirm identity",
    "access restricted",
    "action required",
    "emergency",
    "you are in violation",
    "locked account",
    "final warning",
    "report to authority",
    "criminal charges",
    "your device is infected",
]

SENSITIVE_KEYWORDS = [
    "otp",
    "password",
    "passcode",
    "ic number",
    "bank account",
    "credit card",
    "login",
    "verify",
    "security question",
    "ssn",
    "cvv",
    "nric",
    "identity card",
    "account number",
    "pin",
    "sort code",
    "routing number",
    "dob",
    "mother's maiden name",
    "social security",
    "personal info",
    "credentials",
    "2fa code",
    "mobile number",
    "transaction pin",
    "verification code",
]

URL_SHORTENERS = [
    "bit.ly",
    "t.co",
    "goo.gl",
    "tinyurl.com",
    "ow.ly",
    "buff.ly",
    "is.gd",
    "cutt.ly",
    "rb.gy",
    "rebrand.ly",
    "shorte.st",
    "adf.ly",
    "bl.ink",
    "lnkd.in",
    "chilp.it",
    "soo.gd",
    "trib.al",
    "tiny.cc",
    "shorturl.at",
    "clicky.me",
    "vur.me",
    "snip.ly",
]
SUSPICIOUS_TLDS = [
    ".tk",
    ".ml",
    ".ga",
    ".ru",
    ".cn",
    ".xyz",
    ".top",
    ".loan",
    ".click",
    ".gq",
    ".cf",
    ".work",
    ".support",
    ".zip",
    ".cam",
    ".men",
    ".mom",
    ".party",
    ".review",
    ".accountant",
    ".science",
    ".stream",
    ".win",
    ".info",
    ".biz",
    ".rest",
    ".country",
    ".download",
    ".racing",
    ".faith",
    ".date",
    ".cricket",
    ".link",
    ".hosting",
    ".porn",
    ".sex",
    ".exe",
]

FREE_PROVIDERS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com"}
SUSPICIOUS_TLDS = [".ru", ".cn", ".xyz", ".top", ".loan", ".zip", ".gq", ".tk"]
BRAND_KEYWORDS = ["paypal", "apple", "amazon", "bank", "microsoft", "netflix"]


def analyze_sender_email(sender_email):
    result = {
        "is_valid_format": False,
        "suspicious_tld": False,
        "spoofing_brand": False,
        "free_provider_impersonating_brand": False,
        "too_many_subdomains": False,
    }

    # Basic format check
    if not re.match(r"[^@]+@[^@]+\.[^@]+", sender_email):
        return result  # Invalid email format

    result["is_valid_format"] = True
    domain = sender_email.split("@")[1].lower()
    domain_parts = domain.split(".")

    # Suspicious TLD check
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            result["suspicious_tld"] = True
            break

    # Brand impersonation check
    if any(brand in domain for brand in BRAND_KEYWORDS):
        result["spoofing_brand"] = True
        if domain in FREE_PROVIDERS:
            result["free_provider_impersonating_brand"] = True

    # Subdomain abuse
    if len(domain_parts) > 3:
        result["too_many_subdomains"] = True

    return result


def classify_phone_number_robust(number: str) -> str:
    # Remove all non-numeric characters
    clean = re.sub(r"[^\d]", "", number)

    # Check basic validity
    if not clean or len(clean) < 4 or not clean.isdigit():
        return "invalid"

    # Shortcodes: typically 4–6 digits, used by SMS gateways
    if 4 <= len(clean) <= 6:
        return "shortcode"

    # Toll-free numbers (common: 1800, 1300 in MY, SG)
    if clean.startswith("1800") or clean.startswith("1300"):
        return "toll_free"

    # Premium-rate numbers (common scam: 600, 609, 905)
    if clean.startswith(("600", "609", "905")):
        return "premium"

    # Mobile numbers (Malaysia/Singapore patterns: 01X-XXXXXXXX or XXXXXXXXXX)
    if re.match(r"^01[0-9]{8,9}$", clean):
        return "mobile"

    # Landline (Malaysia: 03-XXXXXXX, 04-XXXXXXX, etc.)
    if re.match(r"^0[3-9][0-9]{7,8}$", clean):
        return "landline"

    # If no match, fallback
    return "invalid"


# === Helper Functions ===
def get_links_from_text(text):
    # url_pattern = re.compile(r"https?://\S+|www\.\S+")
    url_pattern = re.compile(
    r"h\s*t\s*t\s*p\s*s?\s*[:：]?\s*/{0,2}\s*\S+|w\s*w\s*w\s*[.．]\s*\S+",
    re.IGNORECASE
    )
    return url_pattern.findall(text)


def extract_domain(url):
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except:
        return ""


def has_suspicious_tld(domain):
    return any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)


def uses_url_shortener(domain):
    return domain in URL_SHORTENERS


def simulate_ml_prediction():
    return random.uniform(0, 1)

def analyze_email(content: str, sender: str = "") -> Dict[str, Any]:
    if not content.strip():
        return {"error": "Email content is empty"}

    lines = content.strip().split("\n")
    subject = next((line for line in lines if line.strip()), "No Subject")
    body = content
    links = get_links_from_text(body)
    text_lower = body.lower()
    words = re.findall(r"\b\w+\b", text_lower)

    SUSPICIOUS_EXTENSIONS = [".exe", ".scr", ".docm", ".zip"]

    suspicious_extensions_found = [
        ext for ext in SUSPICIOUS_EXTENSIONS if ext in text_lower
    ]

    # Rule-based flags
    flags = {
        "grammar_errors": len(words) > 100 and random.random() > 0.7,
        "has_threatening_language": any(kw in text_lower for kw in THREAT_KEYWORDS),
        "asks_sensitive_info": any(kw in text_lower for kw in SENSITIVE_KEYWORDS),
        "suspicious_links": False,
        "url_mismatch": False,
        "contains_links": len(links) > 0,
        "creates_urgency": any(
            word in text_lower
            for word in [
                "urgent", "immediately", "warning", "alert", "now", "quick", "fast",
            ]
        ),
        "no_personal_greeting": not any(
            line.lower().startswith(greeting)
            for greeting in ["dear", "hi", "hello", "greetings"]
            for line in lines[:5]
        ),
        "suspicious_attachments": len(suspicious_extensions_found) > 0,
    }

    # Analyze URLs
    for url in links:
        domain = extract_domain(url)
        if has_suspicious_tld(domain) or uses_url_shortener(domain):
            flags["suspicious_links"] = True

    # ML prediction
    print(body)
    text_vector = tfidf_vectorizer.transform([body])
    prediction = xgb_model.predict(text_vector)[0]
    prob = float(xgb_model.predict_proba(text_vector)[0][1])

    # Combine ML and rules for final risk scoring
    ml_score = prob
    rule_based_flags_count = sum(1 for v in flags.values() if v)
    risk_percentage = int(ml_score * 100)

    # Final risk level logic
    risk_level = (
        "High" if risk_percentage > 70 or rule_based_flags_count >= 4
        else "Medium" if risk_percentage > 30 or rule_based_flags_count >= 2
        else "Low"
    )

    sensitive_found = [kw for kw in SENSITIVE_KEYWORDS if kw in text_lower]
    threat_found = [kw for kw in THREAT_KEYWORDS if kw in text_lower]
    suspicious_domains = [
        extract_domain(url)
        for url in links
        if has_suspicious_tld(extract_domain(url)) or uses_url_shortener(extract_domain(url))
    ]

    metadata = {
        "subject": subject,
        "word_count": len(words),
        "link_count": len(links),
        "suspicious_domains": suspicious_domains or None,
        "sensitive_keywords_found": sensitive_found or None,
        "threat_keywords_found": threat_found or None,
        "suspicious_extensions_found": suspicious_extensions_found or None,
        "predicted_label": "Possible scam" if prediction == 1 else "Unlikely Scam",
    }

    explanations = {}
    if flags["has_threatening_language"] and threat_found:
        explanations["has_threatening_language"] = (
            f"Detected threatening keyword(s): {', '.join(threat_found)}."
        )
    if flags["asks_sensitive_info"] and sensitive_found:
        explanations["asks_sensitive_info"] = (
            f"Sensitive keyword(s) found: {', '.join(sensitive_found)}."
        )
    if flags["creates_urgency"]:
        explanations["creates_urgency"] = (
            "Message contains urgency phrases like 'urgent', 'now', or 'immediately'."
        )
    if flags["no_personal_greeting"]:
        explanations["no_personal_greeting"] = (
            "Greeting is generic like 'Dear user' instead of using your name."
        )
    if flags["suspicious_links"] and suspicious_domains:
        explanations["suspicious_links"] = (
            f"Suspicious domain(s): {', '.join(suspicious_domains)}."
        )
    if flags["grammar_errors"]:
        explanations["grammar_errors"] = (
            "Message may contain grammar issues due to word count or structure."
        )
    if flags["contains_links"]:
        explanations["contains_links"] = (
            f"The message contains {len(links)} link(s), which may be used for phishing."
        )
    if flags["suspicious_attachments"] and suspicious_extensions_found:
        explanations["suspicious_attachments"] = (
            f"Suspicious file extension(s) mentioned: {', '.join(suspicious_extensions_found)}."
        )

    # Sender analysis (optional)
    if sender:
        sender_info = analyze_sender_email(sender)
        metadata["sender_email"] = sender
        metadata["sender_analysis"] = sender_info

        if (
            sender_info["suspicious_tld"]
            or sender_info["spoofing_brand"]
            or sender_info["too_many_subdomains"]
        ):
            flags["suspicious_sender"] = True
            explanations["suspicious_sender"] = (
                "Sender email looks suspicious based on domain and branding."
            )
    print(risk_percentage)
    return {
        "risk_level": risk_level,
        "risk_percentage": risk_percentage,
        "predicted_label": "spam" if prediction == 1 else "ham",
        "ml_confidence": round(ml_score, 4),
        "flags": flags,
        "metadata": metadata,
        "explanations": explanations,
    }


def classify_phone_number_robust(phone_number):
    try:
        parsed = phonenumbers.parse(phone_number, "MY")
        if phonenumbers.is_possible_number(parsed) and phonenumbers.is_valid_number(
            parsed
        ):
            if phonenumbers.number_type(parsed) == phonenumbers.PhoneNumberType.MOBILE:
                return "Mobile"
            elif (
                phonenumbers.number_type(parsed)
                == phonenumbers.PhoneNumberType.FIXED_LINE
            ):
                return "Landline"
            elif (
                phonenumbers.number_type(parsed)
                == phonenumbers.PhoneNumberType.TOLL_FREE
            ):
                return "Toll-Free"
            elif (
                phonenumbers.number_type(parsed)
                == phonenumbers.PhoneNumberType.SHORT_CODE
            ):
                return "Short Code"
            else:
                return "Other"
        else:
            return "Invalid"
    except:
        return "Unknown"


def analyze_sender_phone(sender_phone):
    phone_type = classify_phone_number_robust(sender_phone)
    try:
        parsed = phonenumbers.parse(sender_phone, None)
        is_valid = phonenumbers.is_valid_number(parsed)
    except:
        is_valid = False

    result = {
        "phone_type": phone_type,
        "is_valid_format": is_valid,
        "is_short_code": len(re.sub(r"[^\d]", "", sender_phone)) <= 6,
    }
    return result

def analyze_sms(content: str, sender: str = "") -> Dict[str, Any]:
    text_lower = content.lower()
    links = get_links_from_text(content)
    phone_type = classify_phone_number_robust(sender) if sender else None

    # === Rule-based flags ===
    flags = {
        "has_threatening_language": any(kw in text_lower for kw in THREAT_KEYWORDS),
        "asks_sensitive_info": any(kw in text_lower for kw in SENSITIVE_KEYWORDS),
        "contains_links": len(links) > 0,
        "suspicious_links": any(
            has_suspicious_tld(extract_domain(url)) or uses_url_shortener(extract_domain(url))
            for url in links
        ),
        "creates_urgency": any(
            word in text_lower
            for word in ["urgent", "immediately", "warning", "alert", "now", "quick", "fast"]
        ),
    }

    # === ML-based detection ===
    df = pd.DataFrame({"Message": [content]})
    numeric_features = df["Message"].apply(extract_stronger_numeric_features)
    df = pd.concat([df, numeric_features], axis=1)
    prob_array = SMS_MODEL.predict_proba(df)[0]
    ml_score = float(prob_array[0])  # Assumes index 0 = SPAM — change to [1] if needed
    risk_percentage = int(ml_score * 100)
    num_flags = sum(1 for v in flags.values() if v)

    risk_level = (
        "High" if risk_percentage > 70 or num_flags >= 3
        else "Medium" if risk_percentage > 30 or num_flags >= 1
        else "Low"
    )

    # === Keyword Matches ===
    sensitive_found = [kw for kw in SENSITIVE_KEYWORDS if kw in text_lower]
    threat_found = [kw for kw in THREAT_KEYWORDS if kw in text_lower]
    suspicious_domains = [
        extract_domain(url)
        for url in links
        if has_suspicious_tld(extract_domain(url)) or uses_url_shortener(extract_domain(url))
    ]

    # === Metadata ===
    metadata = {
        "character_count": len(content),
        "link_count": len(links),
        "suspicious_domains": suspicious_domains or None,
        "sensitive_keywords_found": sensitive_found or None,
        "threat_keywords_found": threat_found or None,
    }

    # === Explanations ===
    explanations = {}
    if flags["has_threatening_language"] and threat_found:
        explanations["has_threatening_language"] = (
            f"Detected threatening keyword(s): {', '.join(threat_found)}."
        )
    if flags["asks_sensitive_info"] and sensitive_found:
        explanations["asks_sensitive_info"] = (
            f"Sensitive keyword(s) found: {', '.join(sensitive_found)}."
        )
    if flags["creates_urgency"]:
        explanations["creates_urgency"] = "Message uses urgency-related language."
    if flags["suspicious_links"] and suspicious_domains:
        explanations["suspicious_links"] = f"Suspicious domain(s): {', '.join(suspicious_domains)}."
    if flags["contains_links"]:
        explanations["contains_links"] = f"The message contains {len(links)} link(s)."

    # === Sender Analysis ===
    if sender:
        sender_info = analyze_sender_phone(sender)
        metadata["sender_number"] = sender
        metadata["sender_analysis"] = sender_info

        if sender_info["phone_type"].lower() in ["premium", "shortcode", "invalid"]:
            flags["suspicious_sender"] = True
            explanations["suspicious_sender"] = (
                f"Sender number type '{sender_info['phone_type']}' is commonly used in scams."
            )
        elif flags.get("suspicious_sender") and "suspicious_sender" not in explanations:
            explanations["suspicious_sender"] = (
                f"Sender number type '{sender_info.get('phone_type', 'unknown')}' is suspicious."
            )

    return {
        "risk_level": risk_level,
        "risk_percentage": risk_percentage,
        "predicted_label": "Possible Scam" if ml_score >= 0.5 else "Unlikely Scam",
        "ml_confidence": round(ml_score, 2),
        "flags": flags,
        "metadata": metadata,
        "explanations": explanations,
    }

# === URL Analysis ===

def is_ip_address(domain):
    ip_pattern = r'^\d{1,3}(\.\d{1,3}){3}$'
    return bool(re.match(ip_pattern, domain))

IPQS_API_KEYS = [
    'HCQd7UbKqoJcfml7EUhcBSt1QKfeBdNw',
    'i6hWdrQq944uImBjSLFe6h4NjopkMmvU',
    'htVmTyAuNnUPXHcz3SDF68IG4mqDbtNi',
    '7B9QUIPW5nFQCSRlag4nFCJHgil90RhI'
]
def check_url_ipqs(url: str) -> Dict[str, Any]:
    """Use IPQualityScore Malicious URL Scanner to check URL."""

    for api_key in IPQS_API_KEYS:
        api_url = f"https://ipqualityscore.com/api/json/url/{api_key}"
        try:
            response = requests.get(api_url, params={"url": url}, timeout=8)
            if response.status_code == 200:
                result = response.json()
                if result.get("success", True) is False:
                    continue  
                is_malicious = result.get("suspicious", False) or result.get("malware", False) or result.get("phishing", False)
                return {
                    "is_malicious": bool(is_malicious),
                    "risk_score": result.get("risk_score", 0),
                    "ipqs_response": result
                }
            else:
                continue  # not 200, next key
        except Exception as e:
                continue  # next key
        
    # if all keys failed
    return {
        "is_malicious": False,
        "risk_score": 0,
        "ipqs_response": None,
        "error": "All IPQS API keys failed or quota exceeded."
    }

def analyze_url(url: str) -> Dict[str, Any]:
    domain = extract_domain(url)
    flags = {
        "suspicious_tld": has_suspicious_tld(domain),
        "is_url_shortener": uses_url_shortener(domain),
        "contains_suspicious_keywords": any(
            kw in url.lower()
            for kw in [
                "secure",
                "login",
                "verify",
                "bank",
                "account",
                "update",
                "confirm",
            ]
        ),
        "excessive_subdomains": domain.count(".") > 2,

        "excessive_subdomains": domain.count(".") > 2,
        "no_https": not url.startswith("https"),  # The URL does not use https
        "has_ip_address": is_ip_address(domain),  # The domain name is directly the IP
        "long_path": len(urlparse(url).path) > 30, # Path too long
        
    }

    # === IPQS  ===
    ipqs_result = check_url_ipqs(url)
    ipqs_malicious = ipqs_result.get("is_malicious", False)
    ipqs_risk_score = ipqs_result.get("risk_score", None)

    # ML prediction
    text_vector_u = tfidf_vectorizer_url.transform([url])
    prediction_u = xgb_model_url.predict(text_vector_u)[0]
    prob = float(xgb_model_url.predict_proba(text_vector_u)[0][1])

    ml_score = prob
    risk_percentage = int(ml_score * 100)

    # num_flags = sum(1 for v in flags.values() if v)

    # if ipqs_risk_score is None:
    # # If IPQS reports an error, only use the model score
    #     final_percentage = risk_percentage
    # else:
    #     if ipqs_risk_score < 30:
    #         final_percentage = 0.8 * risk_percentage + 0.2 * ipqs_risk_score
    #     elif ipqs_risk_score < 50:
    #         final_percentage = 0.5 * risk_percentage + 0.5 * ipqs_risk_score
    #     else:
    #         final_percentage = 0.2 * risk_percentage + 0.8 * ipqs_risk_score

    # final_percentage = round(final_percentage, 2)

    # risk_level = (
    #     "High" if  final_percentage > 70 or num_flags >= 2
    #     else "Medium" if  final_percentage > 30 or num_flags >= 1
    #     else "Low"
    # )

    base_risk = risk_percentage  # XGBoost prediction score
    flags_score = sum(1 for v in flags.values() if v) * 5  # Each warning, add 5 points

    if ipqs_risk_score is not None:
        if ipqs_risk_score > 80:
            final_percentage = 0.7 * ipqs_risk_score + 0.3 * (base_risk + flags_score)
        elif ipqs_risk_score > 50:
            final_percentage = 0.5 * ipqs_risk_score + 0.5 * (base_risk + flags_score)
        else:
            final_percentage = 0.3 * ipqs_risk_score + 0.7 * (base_risk + flags_score)
    else:
        # When IPQS fails, only rely on local model + rules
        final_percentage = base_risk + flags_score

    # Limit the maximum score to 100 points
    final_percentage = min(round(final_percentage, 2), 100)

    risk_level = (
    "High" if final_percentage > 70
    else "Medium" if final_percentage > 30
    else "Low"
)

    metadata = {
        "domain": domain,
        "path_length": len(urlparse(url).path),
        "query_parameters": bool(urlparse(url).query),
        "uses_https": url.startswith("https://"),
        "has_ip_address": is_ip_address(domain),
        "ipqs_malicious": ipqs_malicious,
        "ipqs_risk_score": ipqs_risk_score,
    }

    explanations = {}
    if flags["suspicious_tld"]:
        explanations["suspicious_tld"] = (
            f"The domain ends with a suspicious TLD like {domain[-4:]}."
        )
    if flags["is_url_shortener"]:
        explanations["is_url_shortener"] = (
            f"The domain '{domain}' is a known URL shortener."
        )
    if flags["contains_suspicious_keywords"]:
        explanations["contains_suspicious_keywords"] = (
            "The URL contains keywords like 'login', 'bank', or 'verify'."
        )
    if flags["excessive_subdomains"]:
        explanations["excessive_subdomains"] = (
            "The domain has many subdomains which may indicate phishing."
        )

    if flags["no_https"]:
        explanations["no_https"] = "The URL does not use HTTPS, making it less secure."

    if flags["has_ip_address"]:
        explanations["has_ip_address"] = "The domain is a raw IP address, which is uncommon for legitimate websites."

    if flags["long_path"]:
        explanations["long_path"] = "The URL has an unusually long path which may indicate phishing or redirection."

    
    if ipqs_malicious:
        explanations["ipqs_malicious"] = (
            "IPQualityScore indicates this URL is suspicious or malicious."
        )

    return {
        "risk_level": risk_level,
        "risk_percentage":  final_percentage,
        "predicted_label": "scam" if prediction_u == 1 else "ham",
        "flags": flags,
        "metadata": metadata,
        "ml_confidence": round(ml_score, 2),
        "explanations": explanations,
    }


# # Load once (global to avoid reloading on every request)
# SMS_MODEL = joblib.load("sms_model.pkl")

# def predict_sms_spam_probability(message: str) -> float:
#     """Returns probability the SMS is spam (0.0 to 1.0)"""
#     prob_array = SMS_MODEL.predict_proba([message])[0]
#     spam_prob = prob_array[0]  # Adjust if needed based on how model is trained
#     return spam_prob
