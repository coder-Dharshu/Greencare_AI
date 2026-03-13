import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import joblib
import json
import os
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import xgboost as xgb
from pytorch_tabular import TabularModel
from pytorch_tabular.models import TabTransformerConfig
from pytorch_tabular.config import DataConfig, OptimizerConfig, TrainerConfig


def run_training():
    print("Loading dataset...")
    # Assume the dataset is in the backend folder or desktop.
    csv_path = 'Crop_recommendation.csv'
    if not os.path.exists(csv_path):
        # Check standard locations
        if os.path.exists('../Crop_recommendation.csv'):
            csv_path = '../Crop_recommendation.csv'
        elif os.path.exists('../../Crop_recommendation.csv'):
            csv_path = '../../Crop_recommendation.csv'
        else:
            print("❌ ERROR: Could not find Crop_recommendation.csv dataset locally.")
            return

    df = pd.read_csv(csv_path)
    
    # ── Prepare data ──
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols].values
    y = df['label'].values

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    n_classes = len(le.classes_)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train_s, X_test_s, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    X_train_r, X_test_r, _, _ = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    results = {}
    print('🚀 Training all models...\n')

    # ── BASELINE 1: Random Forest ──
    print('1/4 Training Random Forest (Baseline)...')
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train_r, y_train)
    rf_pred = rf.predict(X_test_r)
    results['Random Forest'] = {
        'accuracy': round(accuracy_score(y_test, rf_pred) * 100, 2),
        'f1': round(f1_score(y_test, rf_pred, average='weighted'), 4),
        'type': 'baseline'
    }
    print(f'   ✅ Random Forest: {results["Random Forest"]["accuracy"]}%')

    # ── BASELINE 2: SVM ──
    print('2/4 Training SVM (Baseline)...')
    svm = SVC(kernel='rbf', probability=True, random_state=42, C=10)
    svm.fit(X_train_s, y_train)
    svm_pred = svm.predict(X_test_s)
    results['SVM'] = {
        'accuracy': round(accuracy_score(y_test, svm_pred) * 100, 2),
        'f1': round(f1_score(y_test, svm_pred, average='weighted'), 4),
        'type': 'baseline'
    }
    print(f'   ✅ SVM: {results["SVM"]["accuracy"]}%')

    # ── BASELINE 3: XGBoost ──
    print('3/4 Training XGBoost (Baseline)...')
    xgb_model = xgb.XGBClassifier(
        n_estimators=100, random_state=42,
        eval_metric='mlogloss', use_label_encoder=False, n_jobs=-1
    )
    xgb_model.fit(X_train_r, y_train)
    xgb_pred = xgb_model.predict(X_test_r)
    results['XGBoost'] = {
        'accuracy': round(accuracy_score(y_test, xgb_pred) * 100, 2),
        'f1': round(f1_score(y_test, xgb_pred, average='weighted'), 4),
        'type': 'baseline'
    }
    print(f'   ✅ XGBoost: {results["XGBoost"]["accuracy"]}%')

    # ── YOUR MODEL: TabTransformer (High Accuracy Version) ──
    print('4/4 Training TabTransformer (Proposed Model)...')

    from sklearn.model_selection import train_test_split as tts

    # Split directly from df
    train_raw, test_raw = tts(df, test_size=0.2, random_state=42, stratify=df['label'])
    train_raw, val_raw  = tts(train_raw, test_size=0.15, random_state=42, stratify=train_raw['label'])

    cols_needed = feature_cols + ['label']
    train_raw = train_raw[cols_needed].reset_index(drop=True)
    val_raw   = val_raw[cols_needed].reset_index(drop=True)
    test_raw  = test_raw[cols_needed].reset_index(drop=True)

    data_config = DataConfig(
        target=['label'],
        continuous_cols=feature_cols,
        categorical_cols=[],
        normalize_continuous_features=True
    )
    trainer_config = TrainerConfig(
        max_epochs=200,                    
        batch_size=32,                     
        progress_bar='none',
        load_best=True,
        early_stopping='valid_loss',
        early_stopping_patience=20,        
        checkpoints='valid_loss',
        checkpoints_path='checkpoints',
        checkpoints_name='best_tab'
    )
    optimizer_config = OptimizerConfig(
        optimizer='AdamW',                 
        optimizer_params={'weight_decay': 1e-4},
        lr_scheduler='ReduceLROnPlateau',
        lr_scheduler_params={
            'patience': 8,
            'factor'  : 0.3,               
            'min_lr'  : 1e-7
        }
    )
    model_config = TabTransformerConfig(
        task='classification',
        learning_rate=5e-4,                
        num_heads=8,                       
        num_attn_blocks=6,                 
        attn_dropout=0.05,                 
        ff_dropout=0.05,
        input_embed_dim=64,                
        ff_hidden_multiplier=4             
    )

    tab_model = TabularModel(
        data_config=data_config,
        model_config=model_config,
        optimizer_config=optimizer_config,
        trainer_config=trainer_config
    )
    tab_model.fit(train=train_raw, validation=val_raw)

    # Evaluate
    pred_df       = tab_model.predict(test_raw)
    t_pred_labels = pred_df['label_prediction'].values
    y_true_labels = test_raw['label'].values

    tab_acc = accuracy_score(y_true_labels, t_pred_labels)
    tab_f1  = f1_score(y_true_labels, t_pred_labels, average='weighted')

    results['TabTransformer (Ours)'] = {
        'accuracy': round(tab_acc * 100, 2),
        'f1'      : round(tab_f1, 4),
        'type'    : 'proposed'
    }
    print(f'   ✅ TabTransformer: {results["TabTransformer (Ours)"]["accuracy"]}%')

    with open('model_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    # Output for paper
    print('\n' + '='*58)
    print('📊 RESULTS TABLE — COPY INTO YOUR RESEARCH PAPER')
    print('='*58)
    print(f'{"Model":<28} {"Accuracy":>10} {"F1 Score":>10}')
    print('-'*58)
    for name, m in results.items():
        tag = ' ⭐' if m['type'] == 'proposed' else ''
        print(f'{name+tag:<30} {str(m["accuracy"])+"%":>10} {m["f1"]:>10}')
    print('='*58)

if __name__ == '__main__':
    run_training()
