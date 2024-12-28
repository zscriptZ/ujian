// Fungsi untuk mengacak urutan soal menggunakan algoritma Fisher-Yates
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Tukar elemen
    }
}

let examData = {
    questions: [
        { 
            question: "Apa ibu kota Indonesia?", 
            options: ["Jakarta", "Bandung", "Surabaya"], 
            answer: 0 
        },
        { 
            question: "Berapa 2 + 2?", 
            options: ["3", "4", "5"], 
            answer: 1 
        },
        { 
            question: "Siapa Presiden Indonesia?", 
            options: ["Joko Widodo", "Megawati", "Prabowo"], 
            answer: 0 
        },
        { 
            question: "Gambar ini menunjukkan apa?", 
            image: "https://via.placeholder.com/300", // Gambar soal
            options: ["Gunung", "Pantai", "Kota"], 
            answer: 0 
        },
        { 
            question: "Tuliskan nama ibu kota Indonesia", // Soal isian
            answer: "Jakarta", // Jawaban untuk soal isian
            type: "text" // Menandakan soal ini adalah soal isian
        },
    ],
    correctAnswers: 0,
    wrongAnswers: 0,
    timer: 300, // 5 menit (300 detik)
    isExamFinished: false
};

// Fungsi untuk memuat soal ke dalam halaman
function loadQuestions() {
    shuffle(examData.questions); // Acak urutan soal

    const examForm = document.getElementById("exam-form");
    const questionNav = document.getElementById("question-navigation");

    examData.questions.forEach((q, index) => {
        // Tambahkan nomor soal di sidebar
        const questionNavItem = document.createElement("div");
        questionNavItem.classList.add("question-box");
        questionNavItem.textContent = index + 1;
        questionNavItem.id = `question-nav-${index}`;
        questionNavItem.onclick = () => {
            document.getElementById(`question${index}`).scrollIntoView({ behavior: 'smooth' });
        };
        questionNav.appendChild(questionNavItem);

        // Tambahkan soal ke dalam form ujian
        let questionHTML = `
            <div class="mb-3" id="question${index}">
                <label>${q.question}</label><br>
        `;
        
        // Menambahkan gambar jika soal memiliki properti "image"
        if (q.image) {
            questionHTML += `<img src="${q.image}" alt="Image for question ${index}" class="img-fluid mb-3">`;
        }
        
        // Menambahkan pilihan jawaban untuk soal pilihan ganda
        if (q.options) {
            questionHTML += `
                ${q.options.map((option, i) => `
                    <input type="radio" name="question${index}" value="${i}" id="q${index}a${i}" onclick="markQuestionAsAnswered(${index})">
                    <label for="q${index}a${i}">${option}</label><br>
                `).join('')}
            `;
        }

        // Menambahkan input untuk soal isian
        if (q.type === "text") {
            questionHTML += `
                <input type="text" name="question${index}" id="q${index}-input" class="form-control" placeholder="Tuliskan jawaban Anda" oninput="markQuestionAsAnswered(${index})">
            `;
        }

        questionHTML += `</div>`;
        examForm.innerHTML += questionHTML;

        // Menambahkan garis pemisah setelah setiap soal (kecuali soal terakhir)
        if (index < examData.questions.length - 1) {
            examForm.innerHTML += '<hr class="my-4">';
        }
    });

    startTimer();
}

// Menandai soal yang sudah dijawab
function markQuestionAsAnswered(index) {
    const questionNavItem = document.getElementById(`question-nav-${index}`);
    questionNavItem.classList.add("completed"); // Menandakan soal sudah dijawab
}

// Timer untuk ujian
function startTimer() {
    const timerElement = document.getElementById("timer");
    let secondsRemaining = examData.timer;

    const timerInterval = setInterval(() => {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            finishExam();
        }
        secondsRemaining--;
    }, 1000);
}

// Menyelesaikan ujian dan menghitung nilai
function finishExam() {
    if (examData.isExamFinished) return;

    examData.isExamFinished = true;
    clearInterval(timerInterval);

    examData.questions.forEach((q, index) => {
        // Cek soal pilihan ganda
        if (q.options) {
            const selected = document.querySelector(`input[name="question${index}"]:checked`);
            if (selected && parseInt(selected.value) === q.answer) {
                examData.correctAnswers++;
            } else if (selected) {
                examData.wrongAnswers++;
            }
        }

        // Soal isian tidak dihitung dalam penilaian
    });

    // Hitung nilai (score)
    let score = (examData.correctAnswers / examData.questions.filter(q => q.options).length) * 100;
    examData.score = score;

    showResult(score);
    showToast(`Ujian selesai! Skor Anda: ${score.toFixed(2)}`, "success");

    // Kirim hasil ke webhook
    sendToDiscord();
}

// Menampilkan hasil ujian
function showResult(score) {
    const result = `
        <h3>Hasil Ujian</h3>
        <p>Jawaban Benar: ${examData.correctAnswers}</p>
        <p>Jawaban Salah: ${examData.wrongAnswers}</p>
        <p>Skor: ${score.toFixed(2)}</p>
    `;
    document.getElementById("exam-form").innerHTML = result;
}

// Menampilkan Toast Notification
function showToast(message, type = "success") {
    const toastBody = document.getElementById("toast-body");
    toastBody.textContent = message;

    const toastElement = document.getElementById("toast");
    toastElement.classList.remove("hide");
    toastElement.classList.add("show");
    
    setTimeout(() => {
        toastElement.classList.remove("show");
        toastElement.classList.add("hide");
    }, 3000);
}