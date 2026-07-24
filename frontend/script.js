const API_URL = "http://65.2.74.56:8000";

let lastResponse = "";

async function sendMessage() {
    let input = document.getElementById("userInput");
    let chat = document.getElementById("chat-box");

    if (input.value.trim() === "") {
        alert("Please enter a question.");
        return;
    }

    let prompt = input.value;
    chat.innerHTML += `<p><b>You:</b> ${prompt}</p>`;

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(prompt)}`
        );

        const data = await response.json();

        lastResponse = data.response;

        chat.innerHTML += `<p><b>StudyGen AI:</b><br>${data.response}</p>`;
    } catch (error) {
        chat.innerHTML += `<p><b>StudyGen AI:</b> Unable to connect to backend.</p>`;
    }

    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

async function summarizeNotes() {
    let input = document.getElementById("userInput");

    if (input.value.trim() === "") {
        alert("Please enter notes first.");
        return;
    }

    let prompt =
        "Summarize the following notes in bullet points:\n\n" +
        input.value;

    const response = await fetch(
        `${API_URL}/${encodeURIComponent(prompt)}`
    );

    const data = await response.json();

    lastResponse = data.response;

    document.getElementById("chat-box").innerHTML +=
        `<p><b>Summary:</b><br>${data.response}</p>`;
}

async function generateQuiz() {
    let input = document.getElementById("userInput");

    if (input.value.trim() === "") {
        alert("Please enter a topic.");
        return;
    }

    let prompt =
        "Generate 10 MCQs with answers from:\n\n" +
        input.value;

    const response = await fetch(
        `${API_URL}/${encodeURIComponent(prompt)}`
    );

    const data = await response.json();

    lastResponse = data.response;

    document.getElementById("chat-box").innerHTML +=
        `<p><b>Quiz:</b><br>${data.response}</p>`;
}

async function explainTopic() {
    let input = document.getElementById("userInput");

    if (input.value.trim() === "") {
        alert("Please enter a topic.");
        return;
    }

    let prompt =
        "Explain this topic in simple language:\n\n" +
        input.value;

    const response = await fetch(
        `${API_URL}/${encodeURIComponent(prompt)}`
    );

    const data = await response.json();

    lastResponse = data.response;

    document.getElementById("chat-box").innerHTML +=
        `<p><b>Explanation:</b><br>${data.response}</p>`;
}

async function examAnswer() {
    let input = document.getElementById("userInput");

    if (input.value.trim() === "") {
        alert("Please enter a topic.");
        return;
    }

    let prompt =
        "Write an 8-mark university exam answer on:\n\n" +
        input.value;

    const response = await fetch(
        `${API_URL}/${encodeURIComponent(prompt)}`
    );

    const data = await response.json();

    lastResponse = data.response;

    document.getElementById("chat-box").innerHTML +=
        `<p><b>Exam Answer:</b><br>${data.response}</p>`;
}

async function uploadPDF() {
    const fileInput = document.getElementById("pdfFile");

    if (fileInput.files.length === 0) {
        alert("Please select a PDF.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const response = await fetch(
            `${API_URL}/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        lastResponse = data.summary;

        document.getElementById("chat-box").innerHTML +=
            `<p><b>PDF Summary:</b><br>${data.summary}</p>`;
    } catch (error) {
        document.getElementById("chat-box").innerHTML +=
            `<p><b>StudyGen AI:</b> PDF upload failed.</p>`;
    }
}

function clearChat() {
    document.getElementById("chat-box").innerHTML = "";
    lastResponse = "";
}

function speakAnswer() {
    if (lastResponse === "") {
        alert("No response available.");
        return;
    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(lastResponse);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    speechSynthesis.speak(speech);
}

async function downloadPDF() {
    if (lastResponse === "") {
        alert("Nothing to download.");
        return;
    }

    const response = await fetch(
        `${API_URL}/download`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: lastResponse
            })
        }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "StudyGen_Report.pdf";

    a.click();

    window.URL.revokeObjectURL(url);
}