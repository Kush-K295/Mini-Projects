import streamlit as st
import requests
import base64
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Heart Disease Prediction",  
    page_icon="❤️",                        
    layout="centered"                      
)

st.logo(
    "logo/heart.png",
    link="https://github.com/Kush-K295" 
)


col1, col2, col3 = st.columns([1, 5, 1])
with col2:
    st.title("Heart Disease Prediction")

col1, col2, col3 = st.columns([1.34, 6, 1])
with col2:
    st.text("Enter the following details to predict the likelihood of heart disease:")

sex_dict ={
    "Male":1,
    "Female":0
}

chestpain_dict = {
    "Typical angina":0,
    "Atypical angina":1,
    "Non-anginal pain":2,
    "Asymptomatic":3
}

fasting_dict = {
    "Yes":1,
    "No":0
}

resting_dict ={
    "Normal":0,
    "ST-T wave abnormality":1,
    "Left ventricular hypertrophy":2
}

exang_dict = {
    "Yes":1,
    "No":0
}

slope_dict = {
    "Upsloping":0,
    "Flat":1,
    "Downsloping":2
}

thal_dict = {
    "Normal":1,
    "Fixed defect":2,
    "Reversable defect":3
}

Age = st.number_input("Enter your age :", min_value=10, max_value=100, value=30)
sex = st.selectbox("Select your sex:", list(sex_dict.keys()))
chestpain_type = st.radio("Select your chest pain type:", list(chestpain_dict.keys()))
Testbps = st.slider("Enter your resting blood pressure (in mm Hg):", min_value=80, max_value=200, value=120)
cholesterol = st.slider("Enter your serum cholesterol (in mg/dl):", min_value=100, max_value=600, value=200)
FastingBS = st.radio("Do you have fasting blood sugar > 120 mg/dl?", list(fasting_dict.keys()), index=1)
Restecg = st.radio("Select your resting electrocardiographic results:", list(resting_dict.keys()))
Thalach = st.number_input("Enter your maximum heart rate achieved:", min_value=60, max_value=220, value=150)
Exang = st.radio("Do you have exercise-induced angina?", list(exang_dict.keys()), index=1   )
Oldpeak = st.slider("Enter your ST depression induced by exercise relative to rest:", min_value=0.0, max_value=6.2, value=1.0)
Slope = st.radio("Select the slope of the peak exercise ST segment:", list(slope_dict.keys()))
ca = st.slider("Enter the number of major vessels (0-3) colored by fluoroscopy:", min_value=0, max_value=3, value=0)
thal = st.radio("Select your Thalassemia type:", list(thal_dict.keys()))

############################To play audio :)############################################
def play_silent_audio(file_path):
    """Plays an audio file once without showing any player UI."""
    try:
        with open(file_path, "rb") as f:
            data = f.read()
        b64 = base64.b64encode(data).decode()
        
        # Hidden HTML audio element that plays once and deletes itself
        html_code = f"""
            <audio autoplay style="display:none;">
                <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
            </audio>
        """
        components.html(html_code, height=0, width=0)
    except FileNotFoundError:
        st.error("Audio file not found!")
############################To play audio############################################
col1, col2, col3 = st.columns([2.3, 1, 2])
with col2:
    button = st.button("Predict")

if (button):
    payload = {
        "age": Age,
        "trestbps": Testbps,
        "chol": cholesterol,
        "thalach": Thalach,
        "oldpeak": Oldpeak,
        "sex": sex_dict[sex],
        "cp": chestpain_dict[chestpain_type],
        "fbs": fasting_dict[FastingBS],
        "restecg": resting_dict[Restecg],
        "exang": exang_dict[Exang],
        "slope": slope_dict[Slope],
        "ca": ca,
        "thal": thal_dict[thal]
    }

    response = requests.post("https://heart-disease-prediction-g7q5.onrender.com/predict", json=payload)
    result = response.json()
    if(result["prediction"] == 0):
        st.error("The model predicts that you are likely to have heart disease. Please consult a doctor.")
        play_silent_audio("RDR2 Low honor sound effect.mp3")
    else:
        st.success("The model predicts that you are unlikely to have heart disease. Keep maintaining a healthy lifestyle!")
        play_silent_audio("RDR2 High Honor sound effect.mp3")