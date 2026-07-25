from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional
import json
import os
import parser
#from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()
DATA_DIR = Path(__file__).resolve().parent / "Data"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    
    allow_methods=["GET"],   
    allow_headers=["*"],
)

with open(DATA_DIR / "sem1.json", encoding="utf-8") as f:
    sem1 = json.load(f)

with open(DATA_DIR / "sem3.json", encoding="utf-8") as f:
    sem3 = json.load(f)

with open(DATA_DIR / "sem5.json", encoding="utf-8") as f:
    sem5 = json.load(f)

with open(DATA_DIR / "sem7.json", encoding="utf-8") as f:
    sem7 = json.load(f)

semdata = {
    1: sem1,
    3: sem3,
    5: sem5,
    7: sem7,
}

days = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
}

time = {
    0: "09:00 – 09:55 AM",
    1: "10:00 – 10:55 AM",
    2: "11:00 – 11:55 AM",
    3: "12:00 – 12:55 PM",
    4: "01:00 – 01:55 PM",
    5: "02:00 – 02:55 PM",
    6: "03:00 – 03:55 PM",
    7: "04:00 – 04:55 PM",
    8: "05:00 – 05:55 PM",
}


class incoming(BaseModel):
    sem: int
    batch: str

    @field_validator("batch")
    @classmethod
    def uppercase(cls, value: str) -> str:
        return value.upper()


class outgoing(BaseModel):
    day: str
    time: str
    batches: str
    type: Optional[str] = None
    subject: str
    elective: Optional[str] = None
    faculty: Optional[str] = None
    room: str


@app.get("/getTT/{sem}/{batch}", response_model=list[outgoing])
def get_time_table(sem: int, batch: str):
    if sem not in semdata:
        raise HTTPException(
            status_code=400,
            detail="Invalid semester. Must be one of 1, 3, 5, 7.",
        )

    batch = batch.upper()
    data = semdata[sem]
    finalData = []

    for slot in data:
        day_indx = slot["day"]
        time_indx = slot["time"]

        for rawstr in slot["data"]:
            parsedData = parser.parseit(rawstr, batch)
            if parsedData is not None:
                parsedData["day"] = days[day_indx]
                parsedData["time"] = time[time_indx]
                finalData.append(parsedData)

    if len(finalData) == 0:
        raise HTTPException(
            status_code=404,
            detail="No data found for the given semester and batch.",
        )
    return finalData
#app.mount("/", StaticFiles(directory="public", html=True), name="static")