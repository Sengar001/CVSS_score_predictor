import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd
import json
from collections import defaultdict

from model.model import MultiInputModel
from model.utils import preprocess_dataframe, save_vocab_scaler

class MultiInputDataset(Dataset):
    def __init__(self, text_data, struct_data, labels):
        self.text_data = text_data
        self.struct_data = struct_data
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            'text': torch.tensor(self.text_data[idx], dtype=torch.long),
            'struct': torch.tensor(self.struct_data[idx], dtype=torch.float),
            'label': torch.tensor(self.labels[idx], dtype=torch.float)
        }

class EarlyStopping:
    def __init__(self, patience=2, min_delta=0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False
        self.best_model_state = None

    def __call__(self, val_loss, model):
        if self.best_loss is None:
            self.best_loss = val_loss
            self.best_model_state = model.state_dict()
        elif val_loss > self.best_loss - self.min_delta:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = val_loss
            self.best_model_state = model.state_dict()
            self.counter = 0

def retrain_from_feedback(data_path):
    struct_features = [
        "access_complexity", "impact_availability", "impact_confidentiality", "impact_integrity",
        "access_vector_ADJACENT_NETWORK", "access_vector_LOCAL", "access_vector_NETWORK",
        "access_authentication_MULTIPLE", "access_authentication_NONE", "access_authentication_SINGLE"
    ]
    max_len = 100

    df = pd.read_csv(data_path)
    
    df.drop(columns=["cwe_name", "cwe_code"], errors="ignore", inplace=True)
    df = df.dropna()

    df = preprocess_dataframe(df)

    texts = df['summary'].astype(str).tolist()
    structs = df[struct_features].values
    labels = df['cvss'].astype(float).tolist()

    word_counts = defaultdict(int)
    for text in texts:
        for word in str(text).split():
            word_counts[word] += 1

    vocab = {'<PAD>': 0, '<OOV>': 1}
    for word in word_counts:
        if word_counts[word] >= 2 and len(vocab) < 1000:
            vocab[word] = len(vocab)

    padded_sequences = np.zeros((len(texts), max_len))
    for i, text in enumerate(texts):
        seq = [vocab.get(word, vocab['<OOV>']) for word in str(text).split()]
        padded_sequences[i, :min(len(seq), max_len)] = seq[:max_len]

    scaler = StandardScaler()
    struct_scaled = scaler.fit_transform(structs)

    save_vocab_scaler(vocab, scaler)

    X_text_train, X_text_test, X_struct_train, X_struct_test, y_train, y_test = train_test_split(
        padded_sequences, struct_scaled, labels, test_size=0.2, random_state=42)

    train_dataset = MultiInputDataset(X_text_train, X_struct_train, y_train)
    val_dataset = MultiInputDataset(X_text_test, X_struct_test, y_test)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    model = MultiInputModel(vocab_size=len(vocab), struct_dim=X_struct_train.shape[1])
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters())
    early_stopping = EarlyStopping(patience=2)

    for epoch in range(10):
        model.train()
        for batch in train_loader:
            optimizer.zero_grad()
            outputs = model(batch['text'], batch['struct'])
            loss = criterion(outputs, batch['label'])
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            val_loss = sum(criterion(model(b['text'], b['struct']), b['label']).item()
                           for b in val_loader) / len(val_loader)

        print("Epoch {epoch+1} - Val Loss: {val_loss:.4f}")
        early_stopping(val_loss, model)
        if early_stopping.early_stop:
            model.load_state_dict(early_stopping.best_model_state)
            break

    torch.save(model.state_dict(), "model/cvss_model.pt")
    # print("Retrained model saved.")
