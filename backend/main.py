from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pypdf import PdfReader
from reportlab.pdfgen import canvas
import requests
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HOME ---------------- #

@app.get("/")
def home():
    return {"message": "StudyGen AI Backend is Running!"}


# ---------------- CHAT ---------------- #

@app.get("/{prompt}")
def chat(prompt: str):

    try:

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": 500
                }
            }
        )

        result = response.json()

        return {
            "response": result["response"]
        }

    except Exception as e:

        return {
            "response": str(e)
        }


# ---------------- PDF UPLOAD ---------------- #

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    try:

        reader = PdfReader(file.file)

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        prompt = f"""
You are StudyGen AI.

Read the uploaded PDF carefully.

Create a student-friendly summary.

Rules:

• Bullet points
• Remove repeated information
• Keep only important concepts
• Maximum 300 words
• Easy revision notes

PDF:

{text}
"""

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": 600
                }
            }
        )

        result = response.json()

        return {
            "summary": result["response"]
        }

    except Exception as e:

        return {
            "summary": str(e)
        }


# ---------------- DOWNLOAD PDF ---------------- #

@app.post("/download")
async def download_pdf(data: dict = Body(...)):

    text = data.get("text", "")

    filename = "StudyGen_Report.pdf"

    c = canvas.Canvas(filename)

    y = 800

    for line in text.split("\n"):

        c.drawString(40, y, line[:100])

        y -= 20

        if y < 40:
            c.showPage()
            y = 800

    c.save()

    return FileResponse(
        path=filename,
        filename="StudyGen_Report.pdf",
        media_type="application/pdf"
    )