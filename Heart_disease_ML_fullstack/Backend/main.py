from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd

app = FastAPI()

with open("svm_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

class InputData(BaseModel):
    age: int
    trestbps: int
    chol: int
    thalach: int
    oldpeak: float
    sex: int
    cp: int
    fbs: int
    restecg: int
    exang: int
    slope: int
    ca: int
    thal: int

cols_to_scale = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
cols_categorical = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal']

@app.post("/predict")

def predict_heart_disease(data: InputData):
    input_df = pd.DataFrame([data.model_dump()])
    input_df = input_df[cols_to_scale + cols_categorical]
    input_df[cols_to_scale] = scaler.transform(input_df[cols_to_scale])
    prediction = model.predict(input_df)
    return {"prediction": int(prediction[0])}