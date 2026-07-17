# Cardia: Heart Disease Prediction Model

This project contains the backend API and machine learning model for predicting the likelihood of heart disease based on clinical parameters. To demonstrate and interact with the model, two frontend versions have been deployed.

## Live Deployments

### 1. Prototype UI (Streamlit)
* **Link:** [Streamlit Prototype App](https://heart-disease-5swzuzhmrocvwryakcim4e.streamlit.app/)
* **Description:** This was the initial prototype built to quickly test the machine learning model's API and validate its predictions in real-time. It serves as a proof-of-concept demonstrating the core functionality before the UI was upgraded.

### 1. Production UI (Vercel)
* **Link:** [Cardia Production App](https://cardia-heart-disease-prediction-5b9mm0ob9.vercel.app/)
* **Description:** This is the fully fledged, improved production version of the user interface. It features a modern, polished UI/UX design, enhanced user validation, and is built to provide an optimal and responsive experience for end-users interacting with the backend ML API.


## About the Project

The core of this project is a Machine Learning model trained to analyze medical datasets and predict heart disease risks. The backend exposes an API endpoint that processes user inputs from these frontends, runs them through the trained model, and returns the prediction results instantly.

## Architecture & How It Works

                                     ┌────────────────────────┐
                                     │  HTML/CSS Frontend 2   │
                                     │       (Vercel)         │
                                     └───────────┬────────────┘
                                                 │ HTTP POST
                                                 ▼
┌───────────────────────┐  HTTP POST ┌────────────────────────┐
│  Streamlit Prototyp   ├───────────►│    FastAPI Backend     │◄─── ML Model File
│ Frontend 1 (Streamlit)│            │     (REST API)         │     (e.g.,svm.pkl / scalar.pkl)
└───────────────────────┘            └────────────────────────┘

## How it Works
1. The user inputs their clinical data through either of the deployed frontends.
2. The frontend sends a POST request with the data payload to the ML model API backend.
3. The backend preprocesses the data, feeds it to the trained model, and generates a prediction percentage/result.
4. The result is seamlessly rendered back to the user on the UI.