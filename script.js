document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    let userName = "";
    let userIC = "";
    let oldDate = "";
    let newDate = "";
    let currentStep = ""; // Track the current step in the "Tukar Temu Janji" process

    function appendMessage(sender, message) {
        let messageElement = document.createElement("div");
        messageElement.classList.add(sender === "bot" ? "bot-message" : "user-message");
        messageElement.innerHTML = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function appendOptions(options) {
        let optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options");
        options.forEach(option => {
            let btn = document.createElement("button");
            btn.innerText = option.text;
            btn.onclick = option.action;
            optionsContainer.appendChild(btn);
        });
        chatBox.appendChild(optionsContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function startChat() {
        appendMessage("bot", "Salam sejahtera Tuan/Puan, saya Minibot daripada KKM. <br>Sebelum kita mula, bolehkah saya dapatkan nama Tuan/Puan?");
        currentStep = "askName";
    }

    function showMainMenu() {
        appendMessage("bot", `Bagaimana saya dapat membantu anda, ${userName}?`);
        appendOptions([
            { text: "Rawatan Pergigian", action: handleRawatanPergigian },
            { text: "Complain", action: handleComplain },
            { text: "Tukar Temu Janji", action: handleTukarTemuJanji }
        ]);
    }

    function sendMessage() {
        let userText = userInput.value.trim();
        if (userText === "") return;

        appendMessage("user", userText);
        userInput.value = "";

        if (currentStep === "askName") {
            userName = userText;
            appendMessage("bot", `Terima kasih, ${userName}. Bagaimana saya boleh membantu anda?`);
            showMainMenu();
        } else if (currentStep === "askIC") {
            userIC = userText;
            appendMessage("bot", "Bolehkah saya dapatkan tarikh temujanji asal Tuan/Puan?");
            currentStep = "askOldDate";
        } else if (currentStep === "askOldDate") {
            oldDate = userText;
            appendMessage("bot", "Bolehkah saya dapatkan tarikh temujanji baru yang Tuan/Puan inginkan?");
            currentStep = "askNewDate";
        } else if (currentStep === "askNewDate") {
            newDate = userText;
            appendMessage("bot", "Terima kasih, staf kami akan menghubungi Tuan/Puan dalam masa terdekat untuk confirmkan penukaran temu janji anda.");
            
            // Send data to Google Sheets
            sendToGoogleSheet(userName, userIC, oldDate, newDate);

            appendOptions([{ text: "Kembali ke Menu", action: showMainMenu }]);
            currentStep = ""; // Reset process
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });

    function handleRawatanPergigian() {
        appendMessage("bot", "Gigi sangat penting. Sila pilih jenis rawatan pergigian:");
        appendOptions([
            { text: "Penskaleran", action: () => appendMessage("bot", "Penskaleran ialah proses pembersihan gigi.") },
            { text: "Tampal Gigi", action: () => appendMessage("bot", "Tampalan gigi membantu mengisi rongga yang rosak.") },
            { text: "Cabut Gigi", action: () => appendMessage("bot", "Cabutan gigi dilakukan jika gigi tidak boleh diselamatkan.") },
            { text: "Kembali ke Menu", action: showMainMenu }
        ]);
    }

    function handleComplain() {
        appendMessage("bot", "Maaf atas kesulitan yang berlaku, bolehkah saya mendapat info lanjutan supaya laporan dapat dijalankan?");
        appendOptions([{ text: "Kembali ke Menu", action: showMainMenu }]);
    }

    function handleTukarTemuJanji() {
        if (!userName) {
            appendMessage("bot", "Bolehkah saya dapatkan nama Tuan/Puan terlebih dahulu?");
            currentStep = "askName";
        } else {
            appendMessage("bot", "Bolehkah saya dapatkan no.ic Tuan/Puan?");
            currentStep = "askIC"; // Start IC input process
        }
    }

    function sendToGoogleSheet(name, ic, oldDate, newDate) {
        fetch("https://script.google.com/macros/s/AKfycbwnZh74D8JMN-M8e3fOfvBNji6u3ORjOj5C83NPRMO8u4QlQaHpDFzWDYxrrIRRx-c9_w/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, ic, oldDate, newDate })
        })
        .then(() => console.log("Data sent to Google Sheets"))
        .catch(error => console.error("Error:", error));
    }

    startChat();
});

