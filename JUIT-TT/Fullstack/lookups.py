import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "Data"

with open(DATA_DIR / "faculty_codes.json", encoding="utf-8") as f:
    faculty_codes = json.load(f)

with open(DATA_DIR / "course_codes.json", encoding="utf-8") as f:
    course_codes = json.load(f)


classTypes = {
    "L": "Lecture",
    "T": "Tutorial",
    "P": "Practical",
}


def get_class_type(class_code: str) -> str | None:
    return classTypes.get(class_code)


def get_faculty_name(faculty_code: str) -> str | None:
    if faculty_code in faculty_codes:
        return faculty_codes.get(faculty_code)
    return None


def get_course_name(course_code: str) -> str:
    if course_code in course_codes:
        return course_codes.get(course_code)
    return "Unknown"
