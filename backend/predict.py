import torch
import torch.nn as nn
import joblib
import pandas as pd
import numpy as np

# 1. RE-DEFINE MODEL (Must match training)
class TabularTransformer(nn.Module):
    def __init__(self, num_features, num_classes, d_model=64, nhead=4, num_layers=2):
        super().__init__()
        self.feature_embedders = nn.ModuleList([nn.Linear(1, d_model) for _ in range(num_features)])
        self.cls_token = nn.Parameter(torch.randn(1, 1, d_model))
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc = nn.Linear(d_model, num_classes)

    def forward(self, x):
        batch_size = x.size(0)
        x = x.unsqueeze(-1)
        embeddings = [embed(x[:, i, :]) for i, embed in enumerate(self.feature_embedders)]
        x = torch.stack(embeddings, dim=1)
        cls_tokens = self.cls_token.expand(batch_size, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = self.transformer_encoder(x)
        return self.fc(x[:, 0, :])

# 2. LOAD ARTIFACTS
DEVICE = torch.device("cpu")
try:
    scaler = joblib.load('home_scaler.pkl')
    label_encoder = joblib.load('home_label_encoder.pkl')
    num_classes = len(label_encoder.classes_)
    model = TabularTransformer(num_features=7, num_classes=num_classes)
    model.load_state_dict(torch.load('home_garden_model.pth', map_location=DEVICE))
    model.eval()
except Exception as e:
    print(f"Error loading model files: {e}")

# 3. PREDICTION FUNCTION
def recommend_crop(n, p, k, temp, humidity, ph, rain):
    input_data = pd.DataFrame([[n, p, k, temp, humidity, ph, rain]])
    scaled_data = scaler.transform(input_data)
    tensor_data = torch.FloatTensor(scaled_data).to(DEVICE)

    with torch.no_grad():
        output = model(tensor_data)
        probs = torch.softmax(output, dim=1)
        top_prob, top_idx = torch.topk(probs, 1)

    plant_name = label_encoder.inverse_transform([top_idx.item()])[0]
    return plant_name
