# predict_sms_interactive.py

import joblib

def load_model(model_path="sms_model.pkl"):
    return joblib.load(model_path)

def get_risk_level(spam_prob):
    """
    Example thresholding for risk categories.
    Adjust as you see fit.
    """
    if spam_prob >= 0.75:
        return "High Risk"
    elif spam_prob >= 0.5:
        return "Medium Risk"
    elif spam_prob >= 0.25:
        return "Risk Controlled"
    else:
        return "Almost NO Risk"

def predict_sms(model, message):
    prob_array = model.predict_proba([message])[0]
    spam_prob = prob_array[0]
    label_num = model.predict([message])[0]
    label_str = "SPAM" if label_num == 0 else "HAM"
    risk = get_risk_level(spam_prob)

    print("------------------------------")
    print(f"Message: {message}")
    print(f"Predicted Label: {label_str}")
    print(f"SPAM Probability: {spam_prob*100:.2f}%")
    print(f"Risk Level: {risk}")
    print("------------------------------")

def main():
    # Load model
    model = load_model("sms_model.pkl")
    
    # Input the message
    user_message = input("Please enter your SMS message: ")
    
    # Predict
    predict_sms(model, user_message)

if __name__ == "__main__":
    main()