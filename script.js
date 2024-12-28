let examData = {
    questions: [
        { question: "Apa ibu kota Indonesia?", options: ["Jakarta", "Bandung", "Surabaya"], answer: 0 },
        { question: "Berapa 2 + 2?", options: ["3", "4", "5"], answer: 1 },
        // Tambah lebih banyak soal sesuai kebutuhan
    ],
    correctAnswers: 0,
    wrongAnswers: 0,
    timer: 300, // 5 menit (300 detik)
};

let timerInterval;

function startExam() {
    const key = document.getElementById("login-key").value;
    if (key === "12345") { // Cek Key Ujian
        document.getElementById("login-key-form").style.display = "none";
        document.getElementById("biodata-form").style.display = "block";
    } else {
        alert("Key Ujian Salah!");
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

    startExamPage();
});

function startExamPage() {
    document.getElementById("biodata-form").style.display = "none";
    document.getElementById("exam-container").style.display = "block";
    loadQuestions();
    startTimer();
}

function loadQuestions() {
    const questionsContainer = document.getElementById("questions");
    examData.questions.forEach((q, index) => {
        let questionHTML = `
            <div class="mb-3">
                <label>${q.question}</label><br>
                ${q.options.map((option, i) => `
                    <input type="radio" name="question${index}" value="${i}" id="q${index}a${i}">
                    <label for="q${index}a${i}">${option}</label><br>
                `).join('')}
            </div>
        `;
        questionsContainer.innerHTML += questionHTML;
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
    clearInterval(timerInterval);

    // Hitung jawaban benar dan salah
    examData.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.answer) {
            examData.correctAnswers++;
        } else {
            examData.wrongAnswers++;
        }
    });

    const name = localStorage.getItem("name");
    const className = localStorage.getItem("class");
    const participantId = localStorage.getItem("participantId");

    // Kirim data ke Discord
    sendToDiscord(name, className, participantId, examData.correctAnswers, examData.wrongAnswers, examData.correctAnswers * 10, examData.timer, new Date().toISOString());

    alert("Ujian selesai. Terima kasih!");
}
