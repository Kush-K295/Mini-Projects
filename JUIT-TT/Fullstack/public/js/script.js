/* ========================================================================
   BACKGROUND VIDEO — graceful fallback if no file is present yet
   ======================================================================== */
(function(){
  const video = document.getElementById('bgVideo');
  video.addEventListener('loadeddata', ()=> video.classList.add('loaded'));
  video.addEventListener('error', ()=> video.style.display = 'none');
  // if no source loads within a moment, just hide it (keeps gradient + particles only)
  setTimeout(()=>{ if(video.readyState === 0) video.style.display = 'none'; }, 2500);
})();

/* ========================================================================
   PARTICLE BACKGROUND
   ======================================================================== */
(function(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COUNT = reduced ? 0 : 55;
  let paused = false; 
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function makeParticle(){
    return {
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.6 + 0.4,
      speed: Math.random()*0.35 + 0.05,
      drift: (Math.random()-0.5)*0.25,
      alpha: Math.random()*0.5 + 0.15,
      pulse: Math.random()*Math.PI*2,
      hue: Math.random() > 0.75 ? 'coral' : 'gold'
    };
  }
  for(let i=0;i<COUNT;i++) particles.push(makeParticle());

  function draw(){
    if (paused) return; 
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.y -= p.speed; p.x += p.drift; p.pulse += 0.02;
      if(p.y < -10){ p.y = h+10; p.x = Math.random()*w; }
      if(p.x < -10) p.x = w+10;
      if(p.x > w+10) p.x = -10;
      const a = p.alpha * (0.6 + 0.4*Math.sin(p.pulse));
      const color = p.hue === 'coral' ? `232,74,116` : `209,158,52`;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color},${a})`;
      ctx.shadowColor = `rgba(${color},0.8)`;
      ctx.shadowBlur = 6;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    if(!reduced) requestAnimationFrame(draw);
  }
  if(!reduced) draw();
  window.__pauseParticles = () => { paused = true; };          
  window.__resumeParticles = () => {                           
    paused = false;
    if(!reduced) draw();
  };
})();

/* ========================================================================
   BATCH INPUT — TYPEWRITER PLACEHOLDER
   ======================================================================== */
(function(){
  const el = document.getElementById('batchInput');
  const example = '24A110';
  let i = 0, deleting = false, pause = 0;

  function tick(){
    if(document.activeElement === el || el.value){
      el.placeholder = '';
      setTimeout(tick, 400);
      return;
    }
    if(pause > 0){ pause--; setTimeout(tick, 60); return; }
    if(!deleting){
      i++; el.placeholder = example.slice(0, i);
      if(i === example.length){ deleting = true; pause = 18; }
    } else {
      i--; el.placeholder = example.slice(0, i);
      if(i === 0){ deleting = false; pause = 6; }
    }
    setTimeout(tick, deleting ? 70 : 130);
  }
  tick();
})();

/* ========================================================================
   RECENT BATCHES — localStorage
   Note: this reads/writes localStorage, which browsers block inside
   sandboxed preview iframes (like this chat's artifact preview) but
   works normally once the file is actually served by your FastAPI app.
   ======================================================================== */
const RECENT_KEY = 'juit_tt_recent_batches';

function getRecentBatches(){
  try{ return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch(e){ return []; }
}
function saveRecentBatch(batch){
  try{
    let list = getRecentBatches().filter(b => b !== batch);
    list.unshift(batch);
    list = list.slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  }catch(e){ /* storage unavailable — skip silently */ }
  renderRecentChips();
}
function renderRecentChips(){
  const wrap = document.getElementById('recentWrap');
  const list = getRecentBatches();
  if(list.length === 0){ wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<span class="recent-label">Recent</span>` +
    list.map(b => `<button type="button" class="recent-chip" data-batch="${b}">${b}</button>`).join('');
}
document.getElementById('recentWrap').addEventListener('click', (e)=>{
  const chip = e.target.closest('.recent-chip');
  if(!chip) return;
  const batchInput = document.getElementById('batchInput');
  batchInput.value = chip.dataset.batch;
  userTypedBatch = true;
});
renderRecentChips();

/* ========================================================================
   STATE
   ======================================================================== */
const state = { sem: null, batch: '', grouped: {} };
let userTypedBatch = false;

const TIME_ORDER = [
  "09:00 – 09:55 AM","10:00 – 10:55 AM","11:00 – 11:55 AM","12:00 – 12:55 PM",
  "01:00 – 01:55 PM","02:00 – 02:55 PM","03:00 – 03:55 PM","04:00 – 04:55 PM","05:00 – 05:55 PM",
];
const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* batch codes start with the admission year: 26xx = sem1, 25xx = sem3, 24xx = sem5, 23xx = sem7 */
const SEM_YEAR_PREFIX = { 1: '26', 3: '25', 5: '24', 7: '23' };

const batchInputEl = document.getElementById('batchInput');
batchInputEl.addEventListener('input', ()=>{
  userTypedBatch = batchInputEl.value.length > 0;
});

/* ========================================================================
   SEMESTER SELECTION
   ======================================================================== */
const SEM_ORDER = [1, 3, 5, 7];

document.getElementById('semRow').addEventListener('click', (e)=>{
  const btn = e.target.closest('.ult-orb');
  if(!btn) return;
  state.sem = parseInt(btn.dataset.sem, 10);
  const selectedIdx = SEM_ORDER.indexOf(state.sem);

  document.querySelectorAll('.ult-orb').forEach(b=>{
    const bIdx = SEM_ORDER.indexOf(parseInt(b.dataset.sem, 10));
    b.classList.remove('selected', 'filled');
    if(bIdx < selectedIdx) b.classList.add('filled');
    else if(bIdx === selectedIdx) b.classList.add('selected');
  });

  // only auto-fill the year prefix if the user hasn't started typing their own batch
  if(!userTypedBatch){
    batchInputEl.value = SEM_YEAR_PREFIX[state.sem];
    batchInputEl.classList.remove('flash');
    void batchInputEl.offsetWidth; // restart animation
    document.querySelector('.batch-plate').classList.add('flash');
    setTimeout(()=> document.querySelector('.batch-plate').classList.remove('flash'), 500);
  }
});

/* ========================================================================
   VAMOS — FETCH & RENDER
   ======================================================================== */
const errorMsg = document.getElementById('errorMsg');
function showError(msg){ errorMsg.textContent = msg; errorMsg.classList.remove('hidden'); }
function clearError(){ errorMsg.classList.add('hidden'); }

document.getElementById('vamosBtn').addEventListener('click', async ()=>{
  clearError();
  const batch = batchInputEl.value.trim().toUpperCase();

  if(!state.sem){ showError('Pick a semester first.'); return; }
  if(!batch){ showError('Enter your batch code.'); return; }

  const btn = document.getElementById('vamosBtn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Loading…';

  try{
    const res = await fetch(`/getTT/${state.sem}/${encodeURIComponent(batch)}`);
    if(!res.ok){
      const body = await res.json().catch(()=>({detail:'Something went wrong.'}));
      throw new Error(body.detail || 'Something went wrong.');
    }
    const data = await res.json();
    state.batch = batch;
    groupData(data);
    saveRecentBatch(batch);
    await playTeleportTransition(enterTimetable);
  }catch(err){
    showError(err.message || 'Could not reach the server.');
  }finally{
    btn.disabled = false;
    btn.textContent = originalText;
  }
});

document.getElementById('vamosIconLink').addEventListener('click', (e)=>{
  e.preventDefault();
  document.getElementById('vamosBtn').click();
});

/* ========================================================================
   TELEPORT TRANSITION — Chamber alpha-channel clip, plays between screens
   The screen swap happens WHILE the clip is still fully covering the
   viewport (around 80% through), not after it ends — that way the reveal
   is always clean regardless of how fast the fetch/render underneath was.
   ======================================================================== */
function playTeleportTransition(onCovered){
  return new Promise((resolve)=>{
    const video = document.getElementById('transitionVideo');
    let swapped = false, done = false;

    const doSwap = ()=>{
      if(swapped) return;
      swapped = true;
      onCovered();
    };
    const onTimeUpdate = ()=>{
      if(video.duration && video.currentTime / video.duration > 0.07) doSwap();
    };
    const finish = ()=>{
      if(done) return;
      done = true;
      doSwap(); // safety net — guarantees the swap happens even if timeupdate never fired
      video.classList.add('fade-out');
      if (window.__resumeParticles) window.__resumeParticles();
      setTimeout(()=>{
        video.classList.add('hidden');
        video.classList.remove('fade-out');
        video.removeEventListener('ended', finish);
        video.removeEventListener('timeupdate', onTimeUpdate);
        resolve();
      }, 350); // matches the #transitionVideo.fade-out CSS transition length
    };

    video.classList.remove('hidden', 'fade-out');
    video.currentTime = 0;
    video.volume = 0.35;
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', finish);
    if (window.__pauseParticles) window.__pauseParticles();
    video.play().catch(()=> finish()); // autoplay-with-sound blocked → just skip ahead
    setTimeout(finish, 2200); // safety net in case 'ended' never fires
  });
}

function groupData(rows){
  const grouped = {};
  DAY_ORDER.forEach(d => grouped[d] = {});
  for(const row of rows){
    if(!grouped[row.day]) grouped[row.day] = {};
    if(!grouped[row.day][row.time]) grouped[row.day][row.time] = [];
    grouped[row.day][row.time].push(row);
  }
  state.grouped = grouped;
}

/* ========================================================================
   SCREEN SWITCH
   ======================================================================== */
function enterTimetable(){
  document.getElementById('selectScreen').classList.add('hidden');
  document.getElementById('ttScreen').classList.remove('hidden');
  document.getElementById('badgeBatch').textContent = state.batch;
  document.getElementById('badgeSem').textContent = `SEM ${state.sem}`;

  const today = new Date().getDay();
  const defaultDay = (today === 0) ? 'Monday' : DAY_ORDER[today-1];
  document.getElementById('daySelect').value = defaultDay;
  renderDay(defaultDay);
}

document.getElementById('backBtn').addEventListener('click', ()=>{
  document.getElementById('ttScreen').classList.add('hidden');
  document.getElementById('selectScreen').classList.remove('hidden');
});
document.getElementById('daySelect').addEventListener('change', (e)=> renderDay(e.target.value));

/* ========================================================================
   GRID RENDER
   ======================================================================== */
const TYPE_CLASS = { 'Lecture': 'type-lecture', 'Tutorial': 'type-tutorial', 'Practical': 'type-practical' };

function renderDay(day){
  const grid = document.getElementById('ttGrid');
  grid.innerHTML = '';
  const dayData = state.grouped[day] || {};

  TIME_ORDER.forEach((timeLabel, idx)=>{
    const entries = dayData[timeLabel];
    const cell = document.createElement('div');
    cell.style.animationDelay = (idx * 0.04) + 's';

    const timeCol = document.createElement('div');
    timeCol.className = 'time-col';
    timeCol.textContent = timeLabel;

    if(!entries || entries.length === 0){
      cell.className = 'tt-cell type-empty';
      const contentCol = document.createElement('div');
      contentCol.className = 'content-col';
      contentCol.innerHTML = `<span class="no-class">No Class</span>`;
      cell.append(timeCol, contentCol);
      grid.appendChild(cell);
      return;
    }

    const isElective = entries.length > 1 || !!entries[0].elective;

    if(isElective){
      cell.className = 'tt-cell type-elective';
      const contentCol = document.createElement('div');
      contentCol.className = 'content-col';
      const label = entries.length > 1 ? `${entries.length} elective options` : (entries[0].subject || 'Elective');
      contentCol.innerHTML = `<span class="type-tag">Elective</span><span class="subject">${escapeHtml(label)}</span>`;
      cell.append(timeCol, contentCol);
      cell.addEventListener('click', ()=> openElectiveModal(day, timeLabel, entries));
    } else {
      const e = entries[0];
      const typeClass = TYPE_CLASS[e.type] || 'type-lecture';
      cell.className = `tt-cell ${typeClass}`;
      const contentCol = document.createElement('div');
      contentCol.className = 'content-col';
      const facultyLine = e.faculty ? `<div class="meta">${escapeHtml(e.faculty)}</div>` : '';
      const roomLine = e.room ? `<div class="meta">${escapeHtml(e.room)}</div>` : '';
      contentCol.innerHTML = `
        <span class="type-tag">${escapeHtml(e.type || 'Class')}</span>
        <span class="subject">${escapeHtml(e.subject || 'Unknown')}</span>
        ${facultyLine}${roomLine}
      `;
      cell.append(timeCol, contentCol);
    }
    grid.appendChild(cell);
  });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ========================================================================
   ELECTIVE MODAL
   ======================================================================== */
function openElectiveModal(day, timeLabel, entries){
  document.getElementById('electiveTime').textContent = `${day} · ${timeLabel}`;
  const list = document.getElementById('electiveList');
  list.innerHTML = entries.map(e => `
    <div class="elective-option">
      ${e.elective ? `<span class="eo-tag">${escapeHtml(e.elective)}</span>` : ''}
      <div class="eo-subject">${escapeHtml(e.subject || 'Unknown')}</div>
      <div class="eo-meta">
        ${e.faculty ? `<span>${escapeHtml(e.faculty)}</span>` : ''}
        ${e.room ? `<span>${escapeHtml(e.room)}</span>` : ''}
      </div>
    </div>
  `).join('');
  document.getElementById('electiveModal').classList.remove('hidden');
}

/* ========================================================================
   MODAL CLOSE HANDLERS
   ======================================================================== */
document.querySelectorAll('.modal-close').forEach(btn=>{
  btn.addEventListener('click', ()=> document.getElementById(btn.dataset.close).classList.add('hidden'));
});
document.querySelectorAll('.modal-overlay').forEach(overlay=>{
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) overlay.classList.add('hidden'); });
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') document.querySelectorAll('.modal-overlay').forEach(o=>o.classList.add('hidden'));
});
document.getElementById('aboutBtn').addEventListener('click', ()=> document.getElementById('aboutModal').classList.remove('hidden'));

document.getElementById('githubLink').href = 'https://github.com/Kush-K295';
document.getElementById('linkedinLink').href = 'https://www.linkedin.com/in/kush-mahant/';
document.getElementById('reportLink').href = 'https://docs.google.com/forms/d/e/1FAIpQLSc4qX8F4HuHmcIz5ucUSS4KDLU4rwuhtr32-LzQJkRoAxIDaw/viewform?usp=dialog';
