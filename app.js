// ===== DOM ELEMENTS =====
const heartsBg = document.getElementById('heartsBg');
const creatorScreen = document.getElementById('creatorScreen');
const speechScreen = document.getElementById('speechScreen');
const yesScreen = document.getElementById('yesScreen');
const usedScreen = document.getElementById('usedScreen');
const nameInput = document.getElementById('nameInput');
const speechInput = document.getElementById('speechInput');
const generateBtn = document.getElementById('generateBtn');
const linkOutput = document.getElementById('linkOutput');
const linkText = document.getElementById('linkText');
const copyBtn = document.getElementById('copyBtn');
const copiedMsg = document.getElementById('copiedMsg');
const snapScroll = document.getElementById('snapScroll');

// ===== ONE-TIME LINK STORAGE =====
const STORAGE_KEY = 'valentine_opened_links';

function getOpenedLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function markLinkAsOpened(linkId) {
  const links = getOpenedLinks();
  links[linkId] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function isLinkOpened(linkId) {
  const links = getOpenedLinks();
  return !!links[linkId];
}

// Create a short unique ID from the hash data
function getLinkId(encoded) {
  // Simple hash for the encoded data
  let hash = 0;
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return 'v_' + Math.abs(hash).toString(36);
}

// ===== ENCODE / DECODE DATA =====
function encodeData(name, paragraphs) {
  const json = JSON.stringify({ n: name, p: paragraphs });
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    return { name: data.n, paragraphs: data.p };
  } catch { return null; }
}

// ===== FLOATING HEARTS =====
const heartEmojis = ['💖', '💕', '💗', '💓', '💘', '💝', '❤️', '🩷', '🤍', '✨'];
function spawnHeart() {
  const h = document.createElement('span');
  h.className = 'floating-heart';
  h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  h.style.left = Math.random() * 100 + '%';
  h.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
  h.style.animationDuration = (6 + Math.random() * 8) + 's';
  h.style.animationDelay = Math.random() * 2 + 's';
  heartsBg.appendChild(h);
  setTimeout(() => h.remove(), 16000);
}
setInterval(spawnHeart, 900);
for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 250);

// ===== CONFETTI =====
function launchConfetti(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const colors = ['#ff4d6d', '#ff758f', '#ffd700', '#e8b4f8', '#ff477e', '#ff0a54', '#fff', '#ff85a1'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.width = (5 + Math.random() * 10) + 'px';
    c.style.height = (5 + Math.random() * 10) + 'px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = (2 + Math.random() * 3) + 's';
    c.style.animationDelay = Math.random() * 1.5 + 's';
    container.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
}

// ===== HEARTS BURST =====
function heartsBurst(container) {
  if (!container) return;
  const hearts = ['💖', '💕', '💗', '💘', '❤️', '✨', '💝'];
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('span');
    h.className = 'burst-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const angle = (i / 12) * Math.PI * 2;
    const dist = 80 + Math.random() * 60;
    h.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    h.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    h.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 2000);
  }
}

// ===== SCREEN NAVIGATION =====
function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ===== BUILD SPEECH PAGES =====
function buildSpeechPages(name, paragraphs) {
  snapScroll.innerHTML = '';

  // Title page
  const titlePage = document.createElement('section');
  titlePage.className = 'snap-page';
  titlePage.innerHTML = `
    <div class="page-content">
      <span class="sparkle-big">✨</span>
      <h1 class="page-title script">For you, ${escapeHtml(name)}</h1>
      <span class="sparkle-big">✨</span>
      <div class="scroll-hint abs">
        <span>Swipe up</span>
        <div class="scroll-arrow">↓</div>
      </div>
    </div>`;
  snapScroll.appendChild(titlePage);

  // Speech card pages
  paragraphs.forEach((text, i) => {
    const page = document.createElement('section');
    page.className = 'snap-page';
    const isLast = i === paragraphs.length - 1;
    page.innerHTML = `
      <div class="page-content">
        <div class="page-card">
          <div class="card-glow"></div>
          <p>${escapeHtml(text)}</p>
        </div>
        ${isLast ? '<div class="scroll-hint" style="margin-top:20px"><span>keep going...</span><div class="scroll-arrow">↓</div></div>' : ''}
      </div>`;
    snapScroll.appendChild(page);
  });

  // Final Valentine page
  const finalPage = document.createElement('section');
  finalPage.className = 'snap-page final-page';
  finalPage.id = 'finalPage';
  finalPage.innerHTML = `
    <div class="page-content">
      <div class="confetti-container" id="confettiContainer"></div>
      <div class="hearts-burst" id="heartsBurst"></div>
      <div class="rose-emoji">🌹</div>
      <h1 class="title script">Hey ${escapeHtml(name)},</h1>
      <p class="question">Will you be my<br><span class="highlight">Valentine?</span></p>
      <div class="bear-emoji">🧸💐</div>
      <div class="final-buttons">
        <button class="btn btn-yes" id="yesBtn">Yes! 💖</button>
        <button class="btn btn-no" id="noBtn">No 😢</button>
      </div>
    </div>`;
  snapScroll.appendChild(finalPage);

  // Wire buttons
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');

  yesBtn.addEventListener('click', () => {
    showScreen(yesScreen);
    noBtn.style.display = 'none';
    setTimeout(() => launchConfetti('yesConfetti'), 200);
    setTimeout(() => launchConfetti('yesConfetti'), 1000);
    setTimeout(() => launchConfetti('yesConfetti'), 2000);
  });

  setupNoDodge(noBtn, yesBtn);
  setupFinalPageDetection(finalPage);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== FINAL PAGE DETECTION =====
let finalRevealed = false;
function setupFinalPageDetection(finalPage) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !finalRevealed) {
        finalRevealed = true;
        setTimeout(() => launchConfetti('confettiContainer'), 300);
        setTimeout(() => heartsBurst(document.getElementById('heartsBurst')), 500);
      }
    });
  }, { root: snapScroll, threshold: 0.4 });
  observer.observe(finalPage);
}

// ===== DODGING NO BUTTON =====
let noDodgeCount = 0;
function setupNoDodge(noBtn, yesBtn) {
  function dodge() {
    noDodgeCount++;
    const vw = window.innerWidth, vh = window.innerHeight;
    const bw = noBtn.offsetWidth || 100, bh = noBtn.offsetHeight || 48;
    const pad = 16;
    noBtn.classList.add('dodging');
    noBtn.style.left = (pad + Math.random() * (vw - bw - pad * 2)) + 'px';
    noBtn.style.top = (pad + Math.random() * (vh - bh - pad * 2)) + 'px';

    const texts = ['No 😢', 'Nope 😭', 'Stop! 🏃', 'Catch me! 😜', "Can't touch this! 💃", 'Too slow! 🐌', 'Hehe 😏', 'Nice try! 🤣'];
    noBtn.textContent = texts[Math.min(noDodgeCount, texts.length - 1)];

    if (noDodgeCount >= 2) {
      yesBtn.style.transform = `scale(${1 + noDodgeCount * 0.06})`;
    }
  }

  noBtn.addEventListener('mouseenter', (e) => { e.preventDefault(); dodge(); });
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodge(); }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!finalRevealed) return;
    const t = e.touches[0], r = noBtn.getBoundingClientRect(), p = 35;
    if (t.clientX > r.left - p && t.clientX < r.right + p && t.clientY > r.top - p && t.clientY < r.bottom + p) dodge();
  }, { passive: true });
}

// ===== PARSE URL =====
function getDataFromURL() {
  // Hash: #BASE64
  if (window.location.hash && window.location.hash.length > 1) {
    const encoded = window.location.hash.substring(1);
    const data = decodeData(encoded);
    if (data) return { data, encoded };
  }
  // Query: ?d=BASE64
  const params = new URLSearchParams(window.location.search);
  const d = params.get('d');
  if (d) {
    const data = decodeData(d);
    if (data) return { data, encoded: d };
  }
  return null;
}

// ===== INIT =====
function init() {
  const result = getDataFromURL();

  if (result) {
    const { data, encoded } = result;
    const linkId = getLinkId(encoded);

    // Check if already opened
    if (isLinkOpened(linkId)) {
      showScreen(usedScreen);
      return;
    }

    // Mark as opened immediately
    markLinkAsOpened(linkId);

    showScreen(speechScreen);
    buildSpeechPages(data.name, data.paragraphs);
  } else {
    showScreen(creatorScreen);
  }
}

// ===== GENERATE LINK =====
generateBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = '#ff4d6d';
    nameInput.style.animation = 'shake 0.5s ease';
    setTimeout(() => { nameInput.style.borderColor = ''; nameInput.style.animation = ''; }, 600);
    nameInput.focus();
    return;
  }

  const rawText = speechInput.value.trim();
  let paragraphs;
  if (rawText) {
    paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    if (paragraphs.length <= 1 && rawText.includes('\n')) {
      paragraphs = rawText.split(/\n/).map(p => p.trim()).filter(p => p.length > 0);
    }
  } else {
    paragraphs = [
      "I've been thinking about how to say this for a while now...",
      "Every time I see you, my heart skips a beat 🌟",
      "You make the ordinary feel extraordinary ✨",
      "I could write a thousand words and still not capture what you mean to me 💕",
      "So instead, I'll ask you something simple..."
    ];
  }

  const encoded = encodeData(name, paragraphs);

  let basePath = window.location.pathname;
  if (!basePath.endsWith('.html')) {
    basePath = basePath.endsWith('/') ? basePath + 'index.html' : basePath + '/index.html';
  }
  const link = `${window.location.origin}${basePath}#${encoded}`;

  linkText.value = link;
  linkOutput.classList.remove('hidden');
  copiedMsg.classList.add('hidden');
});

// ===== COPY =====
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(linkText.value);
  } catch {
    linkText.select();
    document.execCommand('copy');
  }
  copiedMsg.classList.remove('hidden');
  copyBtn.textContent = '✅';
  setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
});

// ===== ENTER KEY =====
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    speechInput.focus();
  }
});

// ===== START =====
init();
