import re
import string
import numpy as np
import pandas as pd
import torch
import pickle

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(f"[{re.escape(string.punctuation)}]", '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def text_to_sequence(text, vocab, max_len=100):
    text = preprocess_text(text)
    tokens = [vocab.get(word, vocab['<OOV>']) for word in text.split()]
    seq = np.zeros(max_len)
    seq[:min(len(tokens), max_len)] = tokens[:max_len]
    return torch.tensor(seq, dtype=torch.long)

def load_vocab_scaler():
    with open("model/vocab.pkl", "rb") as f:
        vocab = pickle.load(f)
    with open("model/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    return vocab, scaler

def save_vocab_scaler(vocab, scaler):
    with open("model/vocab.pkl", "wb") as f:
        pickle.dump(vocab, f)

    with open("model/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

# Categorical & text preprocessing for structured dataset
def hot_encode(df, col):
    unique_vals = df[col].unique()
    mapping = {val: i for i, val in enumerate(unique_vals)}
    df[col] = df[col].replace(mapping)
    return df

def preprocess_dataframe(df):
    # One-hot encode specific columns if they exist
    if 'access_vector' in df.columns or 'access_authentication' in df.columns:
        df = pd.get_dummies(df, columns=['access_vector', 'access_authentication'], drop_first=False)

    # Label encode object columns except 'summary'
    for col in df.columns:
        if df[col].dtype == 'object' and col != 'summary':
            df = hot_encode(df, col)

    # Convert boolean columns to integers
    for col in df.columns:
        if df[col].dtype == 'bool':
            df[col] = df[col].astype(int)

    # Clean text
    if 'summary' in df.columns:
        df['summary'] = df['summary'].astype(str).apply(preprocess_text)

    return df
