import torch
import torch.nn as nn

class MultiInputModel(nn.Module):
    def __init__(self, vocab_size, struct_dim):
        super(MultiInputModel, self).__init__()
        self.embedding = nn.Embedding(num_embeddings=vocab_size, embedding_dim=64, padding_idx=0)
        self.lstm = nn.LSTM(input_size=64, hidden_size=64, batch_first=True)
        self.struct_fc = nn.Sequential(nn.Linear(struct_dim, 64), nn.ReLU(), nn.Dropout(0.3))
        self.combined_fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1)
        )

    def forward(self, text_input, struct_input):
        embedded = self.embedding(text_input)
        lstm_out, _ = self.lstm(embedded)
        text_features = lstm_out[:, -1, :]
        struct_features = self.struct_fc(struct_input)
        combined = torch.cat((text_features, struct_features), dim=1)
        output = self.combined_fc(combined)
        return output.squeeze()
