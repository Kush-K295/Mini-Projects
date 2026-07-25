# JUIT-TT
A FastAPI backend that serves the odd-semester (1 / 3 / 5 / 7) timetable for JUIT students, paired with a Chamber (Valorant) themed frontend for looking up your schedule by semester and batch code.

## Live Deployment

* **Link:** 
* **Description:** The frontend is served directly by the FastAPI app via static file mounting, so there's a single deployment rather than a separate frontend/backend hosting setup.

## About the Project

The backend parses raw, semi-structured timetable strings (exported from the institute's official Excel timetable) into clean, structured JSON per batch. It resolves faculty codes, course codes, and class types (Lecture / Tutorial / Practical) into full names, and groups overlapping entries into elective options. The frontend themed around Chamber from Valorant, (cause its my favourite agent to play), with a gold/purple/coral palette, an anchor style semester selector, and a teleport transition between screens consumes this API to render a day-by-day timetable.

## Architecture & How It Works

                                     ┌────────────────────────┐
                                     │   Chamber-Themed UI    │
                                     │   (HTML / CSS / JS)    │
                                     │  served from /static   │
                                     └───────────┬────────────┘
                                                 │ HTTP GET
                                                 ▼
                                     ┌───────────────────────────┐
                                     │      FastAPI Backend      │
                                     │  GET /getTT/{sem}/{batch} │
                                     └───────────┬───────────────┘
                                                 │
                                     ┌───────────▼────────────┐
                                     │  parser.py + lookups.py│
                                     │ raw strings → structured│
                                     │        JSON            │
                                     └───────────┬────────────┘
                                                 │
                                     ┌───────────▼────────────┐
                                     │      Data/*.json       │
                                     │ sem1 / sem3 / sem5 /   │
                                     │ sem7, faculty & course │
                                     │        codes           │
                                     └────────────────────────┘

## How It Works
1. The user selects a semester anchor (1, 3, 5, or 7) and enters their batch code (e.g. `24A110`) on the frontend.
2. The frontend sends a `GET` request to `/getTT/{sem}/{batch}`.
3. The backend loads that semester's raw JSON and runs each slot's raw string through `parser.py`, keeping only the entries that match the given batch.
4. `lookups.py` resolves faculty codes, course codes, and class-type shorthand (L/T/P) into full names.
5. The structured result — day, time, subject, type, faculty, room, and elective info — is returned as JSON and rendered into the timetable grid, with multi-option elective slots grouped into a single clickable card.

## Project Structure

```
JUIT-TT/
├── main_api.py          # FastAPI app, routes, request/response models
├── parser.py             # Raw timetable string → structured entry
├── lookups.py             # Faculty / course code → full name, class type mapping
├── Data/
│   ├── faculty_codes.json
│   ├── course_codes.json
│   ├── sem1.json
│   ├── sem3.json
│   ├── sem5.json
│   └── sem7.json
└── static/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── script.js
    └── assets/
        ├── icons/
        └── videos/
```
## Tech Stack

* **Backend:** FastAPI, Pydantic, Python
* **Frontend:** Vanilla HTML / CSS / JS (no framework)

## Author

* **GitHub:** [Kush-K295](https://github.com/Kush-K295)
* **LinkedIn:** [kush-mahant](https://www.linkedin.com/in/kush-mahant/)
