// ===== SUPABASE CONFIG =====
// TODO: Replace these with your own Supabase project values
const SUPABASE_URL = 'YOUR_SUPABASE_URL';  // e.g. https://abcdefg.supabase.co
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // your anon/public key

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

// ===== ENCODE / DECODE DATA (LZ-compressed, URL-safe) =====
// Minimal LZString compressToEncodedURIComponent implementation
const LZ = (() => {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
  const keyStrMap = {};
  for (let i = 0; i < keyStr.length; i++) keyStrMap[keyStr.charAt(i)] = i;

  function _compress(input, bitsPerChar, getCharFromInt) {
    if (input == null) return '';
    let i, value, context_dictionary = {}, context_dictionaryToCreate = {},
      context_c = '', context_wc = '', context_w = '', context_enlargeIn = 2,
      context_dictSize = 3, context_numBits = 2, context_data = [],
      context_data_val = 0, context_data_position = 0;

    for (let ii = 0; ii < input.length; ii++) {
      context_c = input.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
              else { context_data_position++; }
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
              else { context_data_position++; }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
              else { context_data_position++; }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
              else { context_data_position++; }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) { context_enlargeIn = Math.pow(2, context_numBits); context_numBits++; }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
            else { context_data_position++; }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) { context_enlargeIn = Math.pow(2, context_numBits); context_numBits++; }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }
    if (context_w !== '') {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
            else { context_data_position++; }
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
            else { context_data_position++; }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
            else { context_data_position++; }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
            else { context_data_position++; }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) { context_enlargeIn = Math.pow(2, context_numBits); context_numBits++; }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
          else { context_data_position++; }
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) { context_enlargeIn = Math.pow(2, context_numBits); context_numBits++; }
    }
    value = 2;
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position == bitsPerChar - 1) { context_data_position = 0; context_data.push(getCharFromInt(context_data_val)); context_data_val = 0; }
      else { context_data_position++; }
      value = value >> 1;
    }
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar - 1) { context_data.push(getCharFromInt(context_data_val)); break; }
      else context_data_position++;
    }
    return context_data.join('');
  }

  function _decompress(length, resetValue, getNextValue) {
    let dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3,
      entry = '', result = [], i, w, bits, resb, maxpower, power, c,
      data = { val: getNextValue(0), position: resetValue, index: 1 };

    for (i = 0; i < 3; i++) dictionary[i] = i;

    bits = 0; maxpower = Math.pow(2, 2); power = 1;
    while (power != maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0: bits = 0; maxpower = Math.pow(2, 8); power = 1;
        while (power != maxpower) {
          resb = data.val & data.position; data.position >>= 1;
          if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
          bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
        }
        c = String.fromCharCode(bits); break;
      case 1: bits = 0; maxpower = Math.pow(2, 16); power = 1;
        while (power != maxpower) {
          resb = data.val & data.position; data.position >>= 1;
          if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
          bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
        }
        c = String.fromCharCode(bits); break;
      case 2: return '';
    }
    dictionary[3] = c; w = c; result.push(c);

    while (true) {
      if (data.index > length) return '';
      bits = 0; maxpower = Math.pow(2, numBits); power = 1;
      while (power != maxpower) {
        resb = data.val & data.position; data.position >>= 1;
        if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
        bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
      }

      switch (c = bits) {
        case 0: bits = 0; maxpower = Math.pow(2, 8); power = 1;
          while (power != maxpower) {
            resb = data.val & data.position; data.position >>= 1;
            if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
            bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits); c = dictSize - 1; enlargeIn--; break;
        case 1: bits = 0; maxpower = Math.pow(2, 16); power = 1;
          while (power != maxpower) {
            resb = data.val & data.position; data.position >>= 1;
            if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
            bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits); c = dictSize - 1; enlargeIn--; break;
        case 2: return result.join('');
      }
      if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }

      if (dictionary[c]) { entry = dictionary[c]; }
      else if (c === dictSize) { entry = w + w.charAt(0); }
      else { return null; }

      result.push(entry);
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
      w = entry;
    }
  }

  return {
    compress: (input) => _compress(input, 6, (a) => keyStr.charAt(a)),
    decompress: (input) => {
      if (input == null || input === '') return null;
      input = input.replace(/ /g, '+');
      return _decompress(input.length, 32, (index) => keyStrMap[input.charAt(index)]);
    }
  };
})();

function encodeData(name, paragraphs) {
  // Compact format: name|para1|para2|para3
  const raw = name + '|' + paragraphs.join('|');
  return LZ.compress(raw);
}

function decodeData(encoded) {
  try {
    const raw = LZ.decompress(encoded);
    if (!raw) return null;
    const parts = raw.split('|');
    if (parts.length < 2) return null;
    return { name: parts[0], paragraphs: parts.slice(1) };
  } catch { return null; }
}

// Legacy decoder for old base64 links
function decodeLegacy(encoded) {
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
    // Generate the downloadable card
    setTimeout(() => generateValentineCard(name), 300);
  });

  setupNoDodge(noBtn, yesBtn);
  setupFinalPageDetection(finalPage);
}

// ===== GENERATE DOWNLOADABLE VALENTINE CARD =====
function generateValentineCard(name) {
  const canvas = document.getElementById('cardCanvas');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1920;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#1a0011');
  bgGrad.addColorStop(0.3, '#2d0a1e');
  bgGrad.addColorStop(0.6, '#1a0a2e');
  bgGrad.addColorStop(1, '#0d001a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative glow circles
  const drawGlow = (x, y, r, color, alpha) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  };
  drawGlow(200, 300, 400, '#ff4d6d', 0.12);
  drawGlow(880, 500, 350, '#e8b4f8', 0.1);
  drawGlow(540, 1400, 500, '#ff477e', 0.08);
  drawGlow(100, 1600, 300, '#e8b4f8', 0.06);

  // Scattered heart emojis
  ctx.globalAlpha = 0.15;
  ctx.font = '60px serif';
  ctx.textAlign = 'center';
  const hearts = ['💖', '💕', '💗', '💘', '❤️', '💝', '🩷', '✨'];
  const positions = [
    [120, 200], [960, 180], [180, 600], [900, 550], [100, 1000], [980, 950],
    [200, 1350], [880, 1400], [150, 1700], [950, 1650], [500, 250], [540, 1750]
  ];
  positions.forEach(([x, y], i) => {
    ctx.globalAlpha = 0.12 + Math.random() * 0.08;
    ctx.font = `${40 + Math.random() * 40}px serif`;
    ctx.fillText(hearts[i % hearts.length], x, y);
  });
  ctx.globalAlpha = 1;

  // Central glass card effect
  const cardX = 80, cardY = 500, cardW = W - 160, cardH = 920;
  const cardR = 60;
  ctx.save();
  // Rounded rect path
  ctx.beginPath();
  ctx.moveTo(cardX + cardR, cardY);
  ctx.lineTo(cardX + cardW - cardR, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR);
  ctx.lineTo(cardX + cardW, cardY + cardH - cardR);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardR, cardY + cardH);
  ctx.lineTo(cardX + cardR, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR);
  ctx.lineTo(cardX, cardY + cardR);
  ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left accent bar
  const accentGrad = ctx.createLinearGradient(cardX, cardY + 100, cardX, cardY + cardH - 100);
  accentGrad.addColorStop(0, '#ff4d6d');
  accentGrad.addColorStop(1, '#e8b4f8');
  ctx.fillStyle = accentGrad;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(cardX, cardY + 100, 5, cardH - 200);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Big heart
  ctx.font = '180px serif';
  ctx.textAlign = 'center';
  ctx.fillText('💖', W / 2, cardY + 220);

  // "I said YES!" text
  ctx.font = 'bold 90px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  const yesGrad = ctx.createLinearGradient(W / 2 - 250, 0, W / 2 + 250, 0);
  yesGrad.addColorStop(0, '#ff758f');
  yesGrad.addColorStop(0.5, '#ffd700');
  yesGrad.addColorStop(1, '#ff477e');
  ctx.fillStyle = yesGrad;
  ctx.fillText('I said YES!', W / 2, cardY + 420);

  // Name
  ctx.font = '52px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`to being`, W / 2, cardY + 530);

  ctx.font = 'bold 72px "Segoe UI", Arial, sans-serif';
  const nameGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  nameGrad.addColorStop(0, '#ff758f');
  nameGrad.addColorStop(1, '#e8b4f8');
  ctx.fillStyle = nameGrad;
  ctx.fillText(`${name}'s`, W / 2, cardY + 640);

  ctx.font = 'bold 110px "Segoe UI", Arial, sans-serif';
  const valGrad = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  valGrad.addColorStop(0, '#ff4d6d');
  valGrad.addColorStop(0.5, '#ffd700');
  valGrad.addColorStop(1, '#ff477e');
  ctx.fillStyle = valGrad;
  ctx.fillText('Valentine', W / 2, cardY + 790);

  // Bear emoji
  ctx.font = '100px serif';
  ctx.fillText('🧸💐', W / 2, cardY + 900);

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  ctx.font = '36px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(dateStr, W / 2, H - 180);

  // "Forever & Always"
  ctx.font = '48px "Segoe UI", Arial, sans-serif';
  const foreverGrad = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
  foreverGrad.addColorStop(0, '#ffd700');
  foreverGrad.addColorStop(1, '#ff758f');
  ctx.fillStyle = foreverGrad;
  ctx.fillText('Forever & Always ♾️', W / 2, H - 120);

  // Set preview image
  const dataUrl = canvas.toDataURL('image/png');
  const preview = document.getElementById('cardPreview');
  preview.src = dataUrl;

  // Wire download button
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `valentine-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    downloadBtn.innerHTML = '<span>✅ Saved!</span>';
    setTimeout(() => { downloadBtn.innerHTML = '<span>📥 Save Card</span>'; }, 2000);
  };
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

// ===== SUPABASE HELPERS =====
function genCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function supabaseSave(name, paragraphs) {
  const code = genCode();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/valentines`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ code, name, paragraphs })
  });
  if (!res.ok) throw new Error('Save failed');
  return code;
}

async function supabaseLoad(code) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/valentines?code=eq.${code}&select=name,paragraphs`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (rows.length === 0) return null;
  return { name: rows[0].name, paragraphs: rows[0].paragraphs };
}

// ===== PARSE URL =====
async function getDataFromURL() {
  if (!window.location.hash || window.location.hash.length <= 1) return null;
  const hash = window.location.hash.substring(1);

  // Short code: 6 alphanumeric characters → load from Supabase
  if (/^[a-z0-9]{6}$/.test(hash)) {
    try {
      const data = await supabaseLoad(hash);
      if (data) return { data, code: hash };
    } catch (e) {
      console.log('Supabase unavailable, trying inline decode');
    }
  }

  // Fallback: LZ compressed data in hash
  const data = decodeData(hash);
  if (data) return { data, code: hash };

  // Fallback: legacy base64
  const legacy = decodeLegacy(hash);
  if (legacy) return { data: legacy, code: hash };

  return null;
}

// ===== INIT =====
async function init() {
  const result = await getDataFromURL();

  if (result) {
    const { data, code } = result;
    const linkId = getLinkId(code);

    if (isLinkOpened(linkId)) {
      showScreen(usedScreen);
      return;
    }

    markLinkAsOpened(linkId);
    showScreen(speechScreen);
    buildSpeechPages(data.name, data.paragraphs);
  } else {
    showScreen(creatorScreen);
  }
}

// ===== GENERATE LINK =====
generateBtn.addEventListener('click', async () => {
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

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>Generating...</span>';

  const baseUrl = window.location.origin + window.location.pathname;

  try {
    // Save to Supabase → get short code
    const code = await supabaseSave(name, paragraphs);
    linkText.value = `${baseUrl}#${code}`;
  } catch {
    // Fallback: LZ-compressed in URL
    const encoded = encodeData(name, paragraphs);
    linkText.value = `${baseUrl}#${encoded}`;
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = '<span>Generate Link</span><svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
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
