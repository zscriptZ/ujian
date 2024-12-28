let examData = {
    questions: [],
    correctAnswers: 0,
    wrongAnswers: 0,
    timer: 300, // 5 menit (300 detik)
    isExamFinished: false
};

let timerInterval;

function startExam() {
    const key = document.getElementById("login-key").value;
    if (key === "12345") { // Cek Key Ujian
        document.getElementById("login-key-form").style.display = "none";
        document.getElementById("biodata-form").style.display = "block";
    } else {
        showToast("Key Ujian Salah!", "danger");
    }
}

document.getElementById("biodata").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const className = document.getElementById("class").value;
    const participantId = document.getElementById("participant-id").value;

    localStorage.setItem("name", name);
    localStorage.setItem("class", className);
    localStorage.setItem("participantId", participantId);

    fetchQuestionsFromPastebin();
});

async function fetchQuestionsFromPastebin() {
    try {
        const pastebinURL = "YOUR_PASTEBIN_URL"; // Ganti dengan URL Pastebin
        const response = await fetch(pastebinURL);
        const data = await response.text(); // Mendapatkan data sebagai teks biasa

        const questions = parseQuestions(data);
        examData.questions = questions;

        // Ambil judul mata pelajaran dari data yang diambil
        const subjectTitle = questions[0].subject || "Mata Pelajaran Tidak Ditemukan";
        document.getElementById("subject-title").textContent = subjectTitle;

        startExamPage();
    } catch (error) {
        console.error("Error fetching data from Pastebin:", error);
        showToast("Gagal memuat soal. Coba lagi.", "danger");
    }
}

function parseQuestions(data) {
    const lines = data.split("\n");
    const questions = [];
    let currentQuestion = null;

    lines.forEach(line => {
        line = line.trim();

        // Menangkap judul mata pelajaran di baris pertama
        if (line.match(/^Mata Pelajaran:/)) {
            questions.push({ subject: line.replace(/^Mata Pelajaran:\s*/, "") });
        }

        // Soal Gambar dengan Pilihan Jawaban
        if (line.match(/^Gambar:/) && line.includes("Pilihan:")) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = { type: "image-choice", options: [], image: null, answer: null };
            currentQuestion.question = line.replace(/^Gambar:\s*/, "").replace(/Pilihan:.*/, "");
        }

        // Soal Gambar dengan Jawaban Isian
        if (line.match(/^Gambar:/) && line.includes("Jawaban:")) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = { type: "image-input", image: null, answer: null };
            currentQuestion.question = line.replace(/^Gambar:\s*/, "").replace(/Jawaban:.*/, "");
            currentQuestion.image = line.split("Jawaban:")[1].trim();
        }

        // Soal Tertulis dengan Jawaban Isian
        if (line.match(/^Jawaban:/)) {
            currentQuestion.answer = line.replace(/^Jawaban:\s*/, "").trim();
        }

        // Mendapatkan Pilihan Jawaban untuk soal Gambar Pilihan
        if (line.match(/^[A-C]\./)) {
            const option = line.replace(/^[A-C]\.\s*/, "");
            currentQuestion.options.push(option);
        }
    });

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions;
}

function startExamPage() {
    document.getElementById("biodata-form").style.display = "none";
    document.getElementById("exam-container").style.display = "block";
    loadQuestions();
    startTimer();
}

function loadQuestions() {
    const examForm = document.getElementById("exam-form");
    examData.questions.forEach((q, index) => {
        let questionHTML = '';

        if (q.type === "image-choice") {
            questionHTML = `
                <div class="mb-3">
                    <label>${q.question}</label><br>
                    <img src="${q.image}" alt="Soal Gambar" class="img-fluid mb-3">
                    ${q.options.map((option, i) => `
                        <input type="radio" name="question${index}" value="${i}" id="q${index}a${i}">
                        <label for="q${index}a${i}">${option}</label><br>
                    `).join('')}
                </div>
            `;
        } else if (q.type === "image-input") {
            questionHTML = `
                <div class="mb-3">
                    <label>${q.question}</label><br>
                    <img src="${q.image}" alt="Soal Gambar" class="img-fluid mb-3">
                    <input type="text" name="question${index}" class="form-control" placeholder="Jawab di sini">
                </div>
            `;
        } else if (q.type === "text-input") {
            questionHTML = `
                <div class="mb-3">
                    <label>${q.question}</label><br>
                    <input type="text" name="question${index}" class="form-control" placeholder="Jawab di sini">
                </div>
            `;
        }

        examForm.innerHTML += questionHTML;

        if (index < examData.questions.length - 1) {
            examForm.innerHTML += '<hr class="my-4">';
        }
    });
}

function startTimer() {
    timerInterval = setInterval(function () {
        examData.timer--;
        let minutes = Math.floor(examData.timer / 60);
        let seconds = examData.timer % 60;
        document.getElementById("timer").textContent = `Waktu Tersisa: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        
        if (examData.timer <= 0) {
            clearInterval(timerInterval);
            finishExam();
        }
    }, 1000);
}

function finishExam() {
    if (examData.isExamFinished) return;

    examData.isExamFinished = true;
    clearInterval(timerInterval);

    // Hitung jawaban benar dan salah
    examData.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.answer) {
            examData.correctAnswers++;
        } else {
            examData.wrongAnswers++;
        }

        // Jika soal isian, periksa jawabannya
        if (q.type === "image-input" || q.type === "text-input") {
            const input = document.querySelector(`input[name="question${index}"]`);
            if (input && input.value.trim().toLowerCase() === q.answer.toLowerCase()) {
                examData.correctAnswers++;
            } else {
                examData.wrongAnswers++;
            }
        }
    });

    // Hitung nilai
    let score = (examData.correctAnswers / examData.questions.length) * 100;

    // Simpan nilai dan tampilkan hasil
    examData.score = score;
    const name = localStorage.getItem("name");
    const className = localStorage.getItem("class");
    const participantId = localStorage.getItem("participantId");

    showResult(score);
    showToast(`Ujian selesai! Skor Anda: ${score.toFixed(2)}`, "success");
}

function showResult(score) {
    const resultText = `
        <strong>Nama:</strong> ${localStorage.getItem("name")}<br>
        <strong>Kelas:</strong> ${localStorage.getItem("class")}<br>
        <strong>Nomor Peserta:</strong> ${localStorage.getItem("participantId")}<br>
        <strong>Benar:</strong> ${examData.correctAnswers}<br>
        <strong>Salah:</strong> ${examData.wrongAnswers}<br>
        <strong>Nilai:</strong> ${score.toFixed(2)}<br>
    `;
    document.getElementById("result-text").innerHTML = resultText;
    document.getElementById("exam-container").style.display = "none";
    document.getElementById("result-container").style.display = "block";
}

function showToast(message, type = "success") {
    const toastElement = document.getElementById('exam-toast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function reloadPage() {
    location.reload();
}