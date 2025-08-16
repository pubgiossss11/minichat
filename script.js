let USE_OPENAI = false;  
let OPENAI_API_KEY = "YOUR_API_KEY";  
let OPENAI_MODEL = "gpt-3.5-turbo";  

const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

// --- Lưu & tải lịch sử ---
function saveChatHistory() {
    localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChatHistory() {
    const history = localStorage.getItem("chatHistory");
    if (history) {
        chatBox.innerHTML = history;
    }
}

// --- Hàm thêm tin nhắn ---
function addMessage(sender, text) {
    let msg = document.createElement("div");
    msg.className = sender === "user" ? "msg user" : "msg bot";
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveChatHistory(); // 👉 lưu lại mỗi lần có tin nhắn
}

// --- Gửi tin nhắn ---
sendBtn.addEventListener("click", async () => {
    let text = inputField.value.trim();
    if (!text) return;
    addMessage("user", text);
    inputField.value = "";

    // Gọi OpenAI nếu bật
    if (USE_OPENAI) {
        let reply = await askOpenAI(text);
        addMessage("bot", reply);
    } else {
        // Chat giả lập
        addMessage("bot", "Bot trả lời: " + text);
    }
});

// Enter để gửi
inputField.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

// --- Hàm gọi API OpenAI ---
async function askOpenAI(prompt) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        return "Lỗi khi gọi API!";
    }
}

// --- Khi load lại trang, hiển thị lịch sử ---
loadChatHistory();

// --- Hiệu ứng nền Matrix ---
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "アァイィウヴエェオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワヰヱヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) drops[x] = 1;

function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

setInterval(draw, 33);
