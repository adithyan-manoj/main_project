import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import json

def advanced_preprocessing_and_training():
    """
    Comprehensive ML Pipeline for CSE-CIC-IDS2018
    Includes rigorous preprocessing, scaling, imbalance handling, 
    and AUTOMATED FEATURE SELECTION to speed up edge inference.
    """
    print("--- STEP 1: DATA LOADING ---")
    file_path = '/content/drive/MyDrive/FedThreat_Data/IDS2018_CSV/02-15-2018.csv'
    df = pd.read_csv(file_path, low_memory=False)
    
    print("\n--- STEP 2: DATA CLEANING ---")
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    print("\n--- STEP 3: BASE COLUMN DROPPING ---")
    # Drop identifying features that cause overfitting
    columns_to_drop = ['Timestamp', 'Flow ID', 'Src IP', 'Dst IP', 'Src Port', 'Dst Port']
    for col in columns_to_drop:
        if col in df.columns:
            df.drop(columns=[col], inplace=True)

    y = df['Label'].apply(lambda x: 0 if x == 'Benign' else 1)
    X = df.drop(columns=['Label']).select_dtypes(include=[np.number])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    ratio = float(np.sum(y_train == 0)) / np.sum(y_train == 1)

    print("\n--- STEP 4: AUTOMATED FEATURE SELECTION ---")
    print(f"Training initial model on all {X_train.shape[1]} features to find the most important ones...")
    selector_model = xgb.XGBClassifier(n_estimators=50, max_depth=4, use_label_encoder=False, eval_metric='logloss')
    selector_model.fit(X_train, y_train)

    # Extract Feature Importances
    importances = selector_model.feature_importances_
    feature_names = X_train.columns
    
    # Create a DataFrame to sort the top features
    feature_importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    feature_importance_df = feature_importance_df.sort_values(by='Importance', ascending=False)
    
    # Select the Top 15 most critical features
    TOP_N = 15
    top_features = feature_importance_df['Feature'].head(TOP_N).tolist()
    print(f"\nSelected Top {TOP_N} Features for Edge Inference:")
    for i, feat in enumerate(top_features):
        print(f"{i+1}. {feat}")

    print("\n--- STEP 5: FILTERING DATA TO TOP FEATURES ---")
    # Filter our datasets to ONLY contain these 15 columns
    X_train_filtered = X_train[top_features]
    X_test_filtered = X_test[top_features]

    print("\n--- STEP 6: DATA SCALING ---")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_filtered)
    X_test_scaled = scaler.transform(X_test_filtered)

    print("\n--- STEP 7: TRAINING FINAL PRODUCTION MODEL ---")
    final_model = xgb.XGBClassifier(
        n_estimators=150,           
        learning_rate=0.1,          
        max_depth=6,                
        scale_pos_weight=ratio,     
        use_label_encoder=False, 
        eval_metric='logloss',
        random_state=42
    )
    final_model.fit(X_train_scaled, y_train)

    print("\n--- STEP 8: MODEL EVALUATION ---")
    predictions = final_model.predict(X_test_scaled)
    print(classification_report(y_test, predictions))

    print("\n--- STEP 9: EXPORTING ARTIFACTS ---")
    # 1. Save the Scaler
    joblib.dump(scaler, '/content/drive/MyDrive/FedThreat_Data/xgboost_scaler.pkl')
    # 2. Save the Model
    final_model.save_model('/content/drive/MyDrive/FedThreat_Data/xgboost_baseline.json')
    # 3. Save the specific list of 15 features so the Edge API knows what to extract!
    with open('/content/drive/MyDrive/FedThreat_Data/top_15_features.json', 'w') as f:
        json.dump(top_features, f)
        
    print("SUCCESS: Model, Scaler, and Feature List exported to Google Drive!")

if __name__ == "__main__":
    advanced_preprocessing_and_training()
