import pandas as pd
import re
import numpy as np
import xgboost as xgb
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import FunctionTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report

# === 1. Helper functions ===

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

def get_numeric_cols(df):
    return df[["has_weird_spelling", "num_symbols", "message_length", "abnormal_uppercase"]]

# === 2. Main ===

def main():
    # Load CSV (modify path as needed)
    df = pd.read_csv("/Users/zhangyuxuan/Desktop/shuffled_combined_sms.csv")
    if df["Label"].dtype == object:
        df["Label"] = df["Label"].map({"SPAM": 0, "HAM": 1, "spam": 0, "ham": 1})

    # Feature engineering
    feature_df = df["Message"].apply(extract_stronger_numeric_features)
    df = pd.concat([df, feature_df], axis=1)

    X = df[["Message", "has_weird_spelling", "num_symbols", "message_length", "abnormal_uppercase"]]
    y = df["Label"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Preprocessing pipeline
    num_transformer = FunctionTransformer(get_numeric_cols, validate=False)
    preprocessor = ColumnTransformer([
        ("tfidf", TfidfVectorizer(
            stop_words='english',
            max_df=0.8,
            max_features=5000,
            min_df=1,
            ngram_range=(1, 1)
        ), "Message"),
        ("numeric", num_transformer, ["has_weird_spelling", "num_symbols", "message_length", "abnormal_uppercase"])
    ])

    # Full pipeline with best XGBoost params
    model = Pipeline([
        ("preprocess", preprocessor),
        ("clf", xgb.XGBClassifier(
            use_label_encoder=False,
            eval_metric='mlogloss',
            learning_rate=0.1978244469269318,
            max_depth=6,
            n_estimators=500,
            subsample=1.0
        ))
    ])

    # Fit model
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["SPAM", "HAM"]))

    # Save model
    joblib.dump(model, "final_version_sms_model.pkl")
    print(" Model saved as 'final_version_sms_model.pkl'")

if __name__ == "__main__":
    main()
