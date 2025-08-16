// Đồng hồ đếm ngược 5 phút
let timeLeft = 300; // 300s = 5 phút
let spins = 121;

function updateCountdown() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  document.getElementById("countdown").textContent =
    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  if (timeLeft > 0) {
    timeLeft--;
  }
}
setInterval(updateCountdown, 1000);

// Hiển thị số vòng quay
document.getElementById("spins").textContent = spins;
