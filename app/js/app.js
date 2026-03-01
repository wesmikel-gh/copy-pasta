// ── Copy Pasta v2 — App / UI Wiring ──
// Connects tools.js logic to DOM elements.

import { convertCase, tools, findAndReplace, generateLorem, getTextStats } from './tools.js';

// ── DOM Refs ──
const textInput = document.getElementById('text-input');
const exclusionsInput = document.getElementById('exclusions');
const clearBtn = document.getElementById('clear-exclusions');
const toast = document.getElementById('toast');
const clipboardStatus = document.getElementById('clipboard-status');
const findInput = document.getElementById('find-input');
const replaceInput = document.getElementById('replace-input');
const replaceBtn = document.getElementById('replace-btn');
const loremCountInput = document.getElementById('lorem-count');
const loremUnit = document.getElementById('lorem-unit');
const loremBtn = document.getElementById('lorem-btn');

const statChars = document.getElementById('stat-chars');
const statWords = document.getElementById('stat-words');
const statSentences = document.getElementById('stat-sentences');
const statLines = document.getElementById('stat-lines');
const statReading = document.getElementById('stat-reading');

// ── Register browser-only tools (require DOMParser) ──
tools['strip-html'] = t => {
  const doc = new DOMParser().parseFromString(t, 'text/html');
  return doc.body.textContent || '';
};

tools['html-decode'] = t => {
  const doc = new DOMParser().parseFromString(t, 'text/html');
  return doc.documentElement.textContent;
};

// ── Stats ──
function updateStats() {
  const stats = getTextStats(textInput.value);

  statChars.textContent = `CHARS: ${stats.chars}`;
  statWords.textContent = `WORDS: ${stats.words}`;
  statSentences.textContent = `SENTENCES: ${stats.sentences}`;
  statLines.textContent = `LINES: ${stats.lines}`;
  statReading.textContent = stats.readSec >= 60
    ? `READ: ${Math.floor(stats.readSec / 60)}m ${stats.readSec % 60}s`
    : `READ: ${stats.readSec}s`;

  [statChars, statWords, statSentences, statLines, statReading].forEach(el => {
    el.classList.toggle('has-value', stats.chars > 0);
  });
}

textInput.addEventListener('input', updateStats);
updateStats();

// ── Exclusions (localStorage) ──
const saved = localStorage.getItem('copy-pasta-exclusions');
if (saved) exclusionsInput.value = saved;

exclusionsInput.addEventListener('input', () => {
  localStorage.setItem('copy-pasta-exclusions', exclusionsInput.value);
});

clearBtn.addEventListener('click', () => {
  exclusionsInput.value = '';
  localStorage.removeItem('copy-pasta-exclusions');
});

function getExclusionsList() {
  return exclusionsInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// ── Case Buttons ──
document.querySelectorAll('.case-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) return;
    const result = convertCase(text, btn.dataset.case, getExclusionsList());
    setTextAndCopy(result);
  });
});

// ── Tool Buttons ──
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) return;
    const fn = tools[btn.dataset.tool];
    if (fn) setTextAndCopy(fn(text));
  });
});

// ── Find & Replace ──
replaceBtn.addEventListener('click', () => {
  const result = findAndReplace(textInput.value, findInput.value, replaceInput.value);
  if (result !== textInput.value) setTextAndCopy(result);
});

// ── Lorem Ipsum ──
loremBtn.addEventListener('click', () => {
  const count = parseInt(loremCountInput.value) || 3;
  const result = generateLorem(count, loremUnit.value);
  setTextAndCopy(result);
});

// ── Shared: set text, copy, update ──
function setTextAndCopy(text) {
  textInput.value = text;
  updateStats();
  navigator.clipboard.writeText(text).then(() => {
    showToast();
    updateClipboardStatus(true);
  });
}

function updateClipboardStatus(active) {
  if (active) {
    clipboardStatus.innerHTML = '<span class="indicator-dot"></span>CLIPBOARD: COPIED';
    clipboardStatus.classList.add('active');
    setTimeout(() => {
      clipboardStatus.innerHTML = '<span class="indicator-dot idle"></span>CLIPBOARD: IDLE';
      clipboardStatus.classList.remove('active');
    }, 2000);
  }
}

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}
