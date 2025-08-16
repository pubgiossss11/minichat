// ===== Matrix-like background =====
(function bg(){
  const c = document.getElementById('bg'); const ctx = c.getContext('2d');
  let w,h,cols,drops; const font=16;
  const glyphs = '01▓▒░█アカサタナハマヤラワガザダバパ0123456789'.split('');
  function resize(){ w=c.width=innerWidth; h=c.height=innerHeight; cols=Math.floor(w/font); drops=Array(cols).fill(0); }
  addEventListener('resize', resize); resize();
  (function draw(){
    ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#13ff87'; ctx.font=font+'px monospace';
    for(let i=0;i<drops.length;i++){ const t=glyphs[Math.random()*glyphs.length|0]; ctx.fillText(t, i*font, drops[i]*font);
      if(drops[i]*font>h && Math.random()>.975) drops[i]=0; drops[i]++; }
    requestAnimationFrame(draw);
  })();
})();

// ===== Lottery logic (6/45) – education only =====
const N=45, K=6; // 6 numbers picked from 1..45
const slotsEl = document.getElementById('slots');
const randomBtn = document.getElementById('randomBtn');
const clearBtn = document.getElementById('clearBtn');
const runSimBtn = document.getElementById('runSimBtn');
const nTrialsEl = document.getElementById('nTrials');
const simResultEl = document.getElementById('simResult');
const oddsBox = document.getElementById('oddsBox');

// init slots
let current = Array(K).fill(null);
function renderSlots(){
  slotsEl.innerHTML='';
  current.forEach((v,idx)=>{
    const s=document.createElement('div'); s.className='slot'+(v==null?' empty':'');
    s.textContent = v==null ? '-' : v;
    s.addEventListener('click', ()=>{
      const val = prompt('Nhập số 1–'+N, v??'');
      if(val===null) return;
      const num = Number(val);
      if(!Number.isInteger(num) || num<1 || num>N) return alert('Số không hợp lệ.');
      if(current.includes(num) && current[idx]!==num) return alert('Không được trùng số.');
      current[idx]=num; renderSlots();
    });
    slotsEl.appendChild(s);
  });
}
renderSlots();

function randomPick(){
  const pool = Array.from({length:N}, (_,i)=>i+1);
  const pick = [];
  for(let i=0;i<K;i++){
    const j = Math.floor(Math.random()*pool.length);
    pick.push(pool.splice(j,1)[0]);
  }
  pick.sort((a,b)=>a-b);
  current = pick;
  renderSlots();
}
randomBtn.addEventListener('click', randomPick);
clearBtn.addEventListener('click', ()=>{ current=Array(K).fill(null); renderSlots(); });

function combinations(n,k){
  if(k<0||k>n) return 0;
  if(k===0||k===n) return 1;
  k=Math.min(k,n-k);
  let num=1, den=1;
  for(let i=1;i<=k;i++){ num*= (n - k + i); den*= i; }
  return Math.round(num/den);
}

function computeOdds(){
  const total = combinations(N,K);
  // probability of matching m numbers exactly (orderless, without bonus ball)
  let txt = `Tổng số tổ hợp 6/${N}: C(${N},${K}) = ${total.toLocaleString()}

`;
  txt += `Xác suất trùng đúng m số (m = 0..6):
`;
  for(let m=0;m<=K;m++){
    const ways = combinations(K,m)*combinations(N-K, K-m);
    const p = ways/total;
    txt += `- m = ${m}: ${(p*100).toExponential(2)}%  (≈ 1 / ${(1/p).toFixed(0).toLocaleString()})
`;
  }
  txt += `
Kỳ vọng thắng (nếu thưởng > 0) phụ thuộc thể lệ từng loại hình. Công cụ này không gợi ý đặt cược.`;
  oddsBox.textContent = txt;
}
computeOdds();

function drawOnce(){
  // draw 6 unique numbers
  const pool = Array.from({length:N}, (_,i)=>i+1);
  const draw=[];
  for(let i=0;i<K;i++){ draw.push(pool.splice(Math.random()*pool.length|0,1)[0]); }
  draw.sort((a,b)=>a-b);
  return draw;
}
function countMatches(a,b){ let set=new Set(a); return b.filter(x=>set.has(x)).length; }

runSimBtn.addEventListener('click', ()=>{
  // validate chosen numbers
  if(current.some(v=>v==null)){ return alert('Hãy điền đủ 6 số hoặc bấm "Chọn ngẫu nhiên".'); }
  const chosen = [...current].sort((a,b)=>a-b);
  const trials = Math.max(1, Math.min(200000, parseInt(nTrialsEl.value)||1000));
  const bucket = [0,0,0,0,0,0,0]; // matches 0..6
  for(let t=0;t<trials;t++){
    const draw = drawOnce();
    const m = countMatches(chosen, draw);
    bucket[m]++;
  }
  let out = `Đã mô phỏng ${trials.toLocaleString()} lần.
Bộ số của bạn: ${chosen.join('-')}.

Phân bố số lần trùng (m = 0..6):
`;
  for(let m=0;m<=6;m++){
    const c=bucket[m]; const pct=(c/trials*100).toFixed(3);
    out += `- m = ${m}: ${c.toLocaleString()} lần (${pct}%)
`;
  }
  simResultEl.textContent = out;
});
