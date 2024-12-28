function sendToDiscord(name, className, participantId, correctAnswers, wrongAnswers, score, remainingTime, timestamp) {
    const webhookURL = "YOUR_DISCORD_WEBHOOK_URL"; // Ganti dengan webhook Discord Anda
    
    const payload = {
        content: `Ujian selesai! Berikut adalah hasil ujian:`,
        embeds: [
            {
                title: "Hasil Ujian",
                description: "Berikut adalah rincian hasil ujian.",
                fields: [
                    {
                        name: "Nama",
                        value: name,
                        inline: true
                    },
                    {
                        name: "Kelas",
                        value: className,
                        inline: true
                    },
                    {
                        name: "Nomor Peserta",
                        value: participantId,
                        inline: true
                    },
                    {
                        name: "Benar",
                        value: correctAnswers.toString(),
                        inline: true
                    },
                    {
                        name: "Salah",
                        value: wrongAnswers.toString(),
                        inline: true
                    },
                    {
                        name: "Nilai",
                        value: score.toFixed(2),
                        inline: true
                    },
                    {
                        name: "Waktu Tersisa",
                        value: `${Math.floor(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' + (remainingTime % 60) : remainingTime % 60}`,
                        inline: true
                    },
                    {
                        name: "Tanggal & Waktu Selesai",
                        value: timestamp,
                        inline: true
                    }
                ],
                color: 3066993
            }
        ]
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => console.log("Webhook sent successfully", data))
    .catch(error => console.error("Error sending webhook:", error));
}