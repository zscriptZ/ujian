// Kirim hasil ujian ke Discord Webhook
function sendToDiscord() {
    const webhookUrl = 'YOUR_DISCORD_WEBHOOK_URL';

    const resultData = {
        username: "Ujian Sekolah",
        content: `Hasil Ujian:
        - Nama: ${examData.name}
        - Kelas: ${examData.class}
        - Nomor Peserta: ${examData.participantId}
        - Jawaban Benar: ${examData.correctAnswers}
        - Jawaban Salah: ${examData.wrongAnswers}
        - Skor: ${examData.score}
        - Waktu Tersisa: ${examData.timer}
        - Tanggal & Waktu Selesai: ${new Date().toLocaleString()}`
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
}