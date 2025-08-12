# predict_enhanced_sms.py

import joblib
import pandas as pd
import re
import os

# === Feature extraction functions ===

def count_abnormal_upper(msg):
    abnormal_count = 0
    lines = msg.split('\n')
    for line in lines:
        words = line.strip().split()
        for i, word in enumerate(words):
            clean_word = re.sub(r'\W+', '', word)
            if not clean_word:
                continue
            if i == 0:
                continue
            if re.match(r'^[A-Z][a-z]+$', clean_word):
                continue
            if any(c.isupper() for c in clean_word[1:]):
                abnormal_count += 1
    return abnormal_count

def extract_stronger_numeric_features(msg):
    has_weird = 0
    words = msg.split()
    for w in words:
        if re.search(r'[A-Za-z]+[^A-Za-z0-9\s]+[A-Za-z]+', w):
            has_weird = 1
            break
        if re.search(r'[A-Za-z]+\d+[A-Za-z]+', w):
            has_weird = 1
            break
    num_symbols = sum(not c.isalnum() and not c.isspace() for c in msg)
    msg_len = len(msg)
    num_abnormal_upper = count_abnormal_upper(msg)
    return pd.Series({
        "has_weird_spelling": has_weird,
        "num_symbols": num_symbols,
        "message_length": msg_len,
        "abnormal_uppercase": num_abnormal_upper
    })

def load_model(model_filename="final_version_sms_model.pkl"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, model_filename)
    return joblib.load(model_path)

def get_numeric_cols(df):
    return df[["has_weird_spelling", "num_symbols", "message_length", "abnormal_uppercase"]]


# === Risk label function ===
def get_risk_level(spam_prob):
    if spam_prob >= 0.75:
        return "🔴 High Risk"
    elif spam_prob >= 0.5:
        return "🟠 Medium Risk"
    elif spam_prob >= 0.25:
        return "🟡 Risk Controlled"
    else:
        return "🟢 Almost NO Risk"

# === Prediction function ===
def predict_sms(model, message):
    df = pd.DataFrame({"Message": [message]})
    features = df["Message"].apply(extract_stronger_numeric_features)
    df = pd.concat([df, features], axis=1)

    prob_array = model.predict_proba(df)[0]
    spam_prob = prob_array[0]  # probability for class 0 (SPAM)
    label_num = model.predict(df)[0]
    label_str = "Possible Scam" if label_num == 0 else "Unlikely Scam"
    risk = get_risk_level(spam_prob)

    print("\n================= Prediction =================")
    print(f"Message         : {message}")
    print(f"Predicted Label : {label_str}")
    print(f"SPAM Probability: {spam_prob*100:.2f}%")
    print(f"Risk Level      : {risk}")
    print("==============================================\n")

# === Main entry ===
def main():
    model = load_model("final_version_sms_model.pkl")
    user_message = input("Please enter your SMS message: ")
    predict_sms(model, user_message)

if __name__ == "__main__":
    main()
