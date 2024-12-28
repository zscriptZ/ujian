function sendToDiscord(name, className, participantId, correct, wrong, score, remainingTime, timestamp) {
    const webhookUrl = "https://discord.com/api/webhooks/your-webhook-url";
    const data = {
        content: `Ujian Selesai!\nNama: ${name}\nKelas: ${className}\nNomor Peserta: ${participantId}\nBenar: ${correct}\nSalah: ${wrong}\nNilai: ${score}\nWaktu Tersisa: ${remainingTime}s\nTanggal & Waktu: ${timestamp}`
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
