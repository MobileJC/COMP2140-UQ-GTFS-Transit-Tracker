# COMP2140-UQ-GTFS-Translink-Tracker

This project was developed as part of **COMP2140: WEB/MOBILE PROGRAMMING** at the University of Queensland in Semester 2, 2023.

It is a command-line translink tracker for the **UQ Lakes bus station**, designed to parse, merge, and filter GTFS static data files and fetch GTFS-realtime JSON feeds. The application is written in **Node.js** using modern JavaScript (ES modules) and demonstrates modular logic, asynchronous data handling, and CSV-to-JSON data transformation.

Note: The connection to the proxy server has been shut down, as it was open only for semester 2, 2023.

---

## 🚀 How to Run

> Ensure the `static-data/` folder is unzipped in the root directory before executing the app.

```bash
node translink-parser.js
```

---

## 🎯 Project Objectives
✅ Ingest and parse GTFS static data: routes.txt, trips.txt, stop_times.txt, calendar.txt, stops.txt

✅ Prompt user for date, time, and bus route to simulate transit search

✅ Validate and format user input using regular expressions

✅ Merge, filter, and return relevant upcoming trip data

✅ Implement async file reading and API fetching using async/await and Promises

✅ Write/read JSON cache files for repeated queries

🔄 Fetch live GTFS data from proxy API endpoints (implementation incomplete)

---

## ✅ Completed Features
Async File I/O & Fetching: Uses the fs and node-fetch modules to read CSV, fetch JSON, and write cache files using async/await.

Clean Structure & Functional Programming: Modular functions with consistent naming and reusable logic. Functions are documented with @param and @returns.

Validation & Formatting: Input validation for date and time formats. Time logic includes pre-arrival buffer (e.g., 10 minutes before bus).

Merging & Filtering: Chained filtering of static GTFS datasets to simulate accurate trip tracking based on user input.

Caching System: Implements read/write of JSON cache files to minimize re-fetching and improve user experience.

---

## ❌ Unfinished Features
Live Data Integration: While the app successfully fetches live GTFS data, this information was not yet integrated into the merged results with static data. The app uses live API calls but only logs or caches them locally.

---

## 🧠 Key Learning & Challenges
Successfully implemented async programming using Promises and async/await.

Learned to work with large, real-world GTFS transit datasets in CSV and JSON formats.

Designed a modular CLI tool with dynamic prompts, data validation, and rich filtering logic.

Discovered challenges around merging live feeds with static schedules, which require additional ID matching and logic.

Strengthened skills in planning, structuring, and testing Node.js applications.

---

🛠 Tech Stack
Language: JavaScript (Node.js)

Modules: fs, prompt-sync, csv-parse, node-fetch

Data Format: GTFS static CSV & real-time JSON

Paradigm: Modular & functional programming

---

## 📁 Folder Structure
<blockquote>
📦 root<br>
┣ 📂 static-data/<br>
┃ ┣ 📄 routes.txt<br>
┃ ┣ 📄 trips.txt<br>
┃ ┣ 📄 stop_times.txt<br>
┃ ┣ 📄 calendar.txt<br>
┃ ┗ 📄 stops.txt<br>
┣ 📄 translink-parser.js<br>
┣ 📄 README.md<br>
</blockquote>

---

## 🧪 Example Use Case
A user wants to know which buses depart from UQ Lakes at around 14:30 on 2023-08-30.
The program will:

Prompt the user for date/time/route

Validate and format inputs

Filter static GTFS data for relevant trips

Return matching results in the terminal

## 📌 Disclaimer
This project was completed as part of an academic assignment and is not intended for public deployment. Live APIs were hosted locally and are mocked for this project.

---

## 📚 Author
Wilkinson John Chan<br>
GitHub: MobileJC<br>
UQ Bachelor of Information Technology (2022–2024)
