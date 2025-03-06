document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // We'll keep a "greetingName" just for greeting.
    let greetingName = "";

    // These are specifically for the "Tukar Temu Janji" flow.
    let userFullName = "";
    let userIC = "";
    let oldDate = "";
    let newDate = "";

    // Track the current step in conversation.
    let currentStep = "";

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

    // Start the conversation by asking the user's name for greeting.
    function startChat() {
        appendMessage("bot", "Salam sejahtera Tuan/Puan, saya Minibot daripada KKM. Bolehkah saya dapatkan nama Tuan/Puan?");
        currentStep = "askGreetingName";
    }

    // Show the main menu (buttons).
    function showMainMenu() {
        appendOptions([
            { text: "Rawatan Pergigian", action: handleRawatanPergigian },
            { text: "Complain", action: handleComplain },
            { text: "Tukar Temu Janji", action: handleTukarTemuJanji }
        ]);
    }

    // Handle user messages typed in the input box.
    function sendMessage() {
        let userText = userInput.value.trim();
        if (userText === "") return;

        appendMessage("user", userText);
        userInput.value = "";

        switch (currentStep) {
            case "askGreetingName":
                // This name is just for greeting
                greetingName = userText;
                appendMessage("bot", `Terima kasih, ${greetingName}. Sila pilih salah satu pilihan berikut:`);
                showMainMenu();
                currentStep = "menuDisplayed";
                break;

            // "Tukar Temu Janji" flow
            case "askFullName":
                userFullName = userText;
                appendMessage("bot", "Bolehkah saya dapatkan nombor IC Tuan/Puan?");
                currentStep = "askIC";
                break;

            case "askIC":
                userIC = userText;
                appendMessage("bot", "Bolehkah saya dapatkan tarikh temujanji asal Tuan/Puan? (Format: YYYY-MM-DD)");
                currentStep = "askOldDate";
                break;

            case "askOldDate":
                oldDate = userText;
                appendMessage("bot", "Bolehkah saya dapatkan tarikh temujanji baru yang Tuan/Puan inginkan? (Format: YYYY-MM-DD)");
                currentStep = "askNewDate";
                break;

            case "askNewDate":
                newDate = userText;
                appendMessage("bot", "Terima kasih, staf kami akan menghubungi Tuan/Puan dalam masa terdekat untuk confirmkan penukaran temu janji anda.");

                // Send data to Google Sheets
                sendToGoogleSheet(userFullName, userIC, oldDate, newDate);

                // Offer to go back to the main menu
                appendOptions([{ text: "Kembali ke Menu", action: () => {
                    appendMessage("bot", "Baik, silakan pilih daripada menu di bawah.");
                    showMainMenu();
                    currentStep = "menuDisplayed";
                }}]);
                currentStep = "";
                break;

            default:
                // If user is typing something outside of a known flow, you can handle it here
                appendMessage("bot", "Maaf, saya tidak pasti dengan arahan tersebut. Sila pilih salah satu pilihan di bawah:");
                showMainMenu();
                break;
        }
    }

    // Menu Handlers
    function handleRawatanPergigian() {
        appendMessage("bot", "Gigi sangat penting. Sila pilih rawatan:");
        appendOptions([
            { text: "Penskaleran", action: () => appendMessage("bot", "Penskaleran: Proses cuci gigi") },
            { text: "Tampal Gigi", action: () => appendMessage("bot", "Tampal Gigi: Proses penampalan kaviti") },
            { text: "Cabut Gigi", action: () => appendMessage("bot", "Cabut Gigi: Proses mencabut gigi yang rosak") },
            { text: "Kembali ke Menu", action: () => {
                appendMessage("bot", "Baik, silakan pilih daripada menu di bawah.");
                showMainMenu();
                currentStep = "menuDisplayed";
            }}
        ]);
    }

    function handleComplain() {
        appendMessage("bot", "Maaf atas kesulitan yang berlaku. Bolehkah saya mendapat info lanjutan supaya laporan dapat dijalankan?");
        appendOptions([
            { text: "Kembali ke Menu", action: () => {
                appendMessage("bot", "Baik, silakan pilih daripada menu di bawah.");
                showMainMenu();
                currentStep = "menuDisplayed";
            }}
        ]);
    }

    function handleTukarTemuJanji() {
        // When user clicks "Tukar Temu Janji", start asking for details
        appendMessage("bot", "Bolehkah saya dapatkan nama penuh Tuan/Puan?");
        currentStep = "askFullName";
    }

    // Send data to Google Sheets
    function sendToGoogleSheet(name, ic, oldDate, newDate) {
        // Replace the URL below with your own Google Apps Script deployment URL
        fetch("https://script.google.com/macros/s/AKfycbwnZh74D8JMN-M8e3fOfvBNji6u3ORjOj5C83NPRMO8u4QlQaHpDFzWDYxrrIRRx-c9_w/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                userName: name,
                userIC: ic,
                oldDate: oldDate,
                newDate: newDate
            })
        })
        .then(() => console.log("Data sent to Google Sheets"))
        .catch(error => console.error("Error:", error));
    }

    // Event Listeners
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });

    // Start the chatbot
    startChat();
});

