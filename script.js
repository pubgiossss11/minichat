// ========== Matrix "code rain" background ==========
(function matrix(){
  const canvas = document.getElementById('codeRain');
  const ctx = canvas.getContext('2d');
  let w, h, cols, drops;
  const glyphs = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ0123456789';
  const fontSize = 16;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.floor(w / fontSize);
    drops = Array(cols).fill(0);
  }
  window.addEventListener('resize', resize);
  resize();

  function draw(){
    // fade trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#13ff87';
    ctx.font = fontSize + 'px monospace';

    for(let i=0;i<drops.length;i++){
      const text = glyphs[Math.floor(Math.random()*glyphs.length)];
      const x = i*fontSize;
      const y = drops[i]*fontSize;
      ctx.fillText(text, x, y);
      if(y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ========== Chat logic ==========
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const openaiToggle = document.getElementById('openaiToggle');

// CONFIG: set this to true to use OpenAI, and put your key below.
let USE_OPENAI = true;  
let OPENAI_API_KEY = "sk-xxxx123";  
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

openaiToggle.addEventListener('change', (e)=>{
  USE_OPENAI = e.target.checked;
  statusMsg('OpenAI: ' + (USE_OPENAI ? 'ON' : 'OFF'));
});

function statusMsg(t){
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = '▸ ' + t;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMessage(text, isMe){
  const div = document.createElement('div');
  div.className = 'msg ' + (isMe ? 'me' : 'bot');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function botReply(text){
  // Offline mock
  if(!USE_OPENAI || OPENAI_API_KEY === "YOUR_API_KEY"){
    await sleep(400);
    const lower = text.toLowerCase();
    if(lower.includes('xin chào') || lower.includes('hello')){
      return "Xin chào, mình là H4CK-CHAT. Mình có thể trả lời câu hỏi cơ bản!";
    }
    if(lower.includes('giúp')){
      return "Bạn có thể bật OpenAI ở góc dưới (điền API key trong script.js) để có câu trả lời thông minh hơn.";
    }
    if(lower.includes('time') || lower.includes('giờ')){
      return "Bây giờ là: " + new Date().toLocaleString();
    }
    return "Echo: " + text;
  }

  // OpenAI path
  try{
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {role:"system", content:"Bạn là trợ lý thân thiện, trả lời ngắn gọn bằng tiếng Việt."},
          {role:"user", content:text}
        ],
        temperature: 0.4
      })
    });
    const data = await resp.json();
    const msg = data?.choices?.[0]?.message?.content?.trim();
    return msg || "Không nhận được phản hồi từ mô hình.";
  }catch(e){
    return "Lỗi gọi OpenAI: " + e.message;
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function send(){
  const text = inputEl.value.trim();
  if(!text) return;
  addMessage(text, true);
  inputEl.value = '';

  const placeholder = document.createElement('div');
  placeholder.className = 'msg bot';
  placeholder.textContent = "đang gõ...";
  messagesEl.appendChild(placeholder);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const reply = await botReply(text);
  placeholder.remove();
  addMessage(reply, false);
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', e=>{
  if(e.key === 'Enter') send();
});
clearBtn.addEventListener('click', ()=>{
  messagesEl.innerHTML = '';
  statusMsg('đã xóa lịch sử.');
});

// greet
statusMsg('sẵn sàng. Gõ thử: "xin chào", "giúp", "giờ".');
