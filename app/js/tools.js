// ── Copy Pasta v2 — Text Processing Functions ──
// Pure logic, no DOM dependencies. Fully testable.

// ── Case Conversion Helpers ──
const titleSmallWords = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'in', 'on', 'at', 'to', 'by', 'of', 'up', 'as', 'is', 'it'
]);

const apostropher = /[\w'\u2018\u2019\u0027\u2032]+/g;
const apostropheStrip = /['\u2018\u2019\u0027\u2032]/g;

export function toSentenceCase(text) {
  return text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, sep, c) => sep + c.toUpperCase());
}

export function toCapitalizedCase(text) {
  return text.toLowerCase().replace(apostropher, w => w.charAt(0).toUpperCase() + w.slice(1));
}

export function toTitleCase(text) {
  let isFirst = true;
  return text.toLowerCase().replace(apostropher, (word) => {
    const core = word.replace(apostropheStrip, '');
    if (isFirst || !titleSmallWords.has(core)) {
      isFirst = false;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    isFirst = false;
    return word;
  });
}

export function applyExclusions(text, exclusions) {
  let result = text;
  for (const word of exclusions) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, word);
  }
  return result;
}

export function convertCase(text, mode, exclusions = []) {
  if (!text.trim()) return text;

  switch (mode) {
    case 'sentence':   text = toSentenceCase(text); break;
    case 'lower':      text = text.toLowerCase(); break;
    case 'upper':      text = text.toUpperCase(); break;
    case 'capitalize': text = toCapitalizedCase(text); break;
    case 'title':      text = toTitleCase(text); break;
  }

  return applyExclusions(text, exclusions);
}

// ── Tool Operations ──
export const tools = {
  'strip-whitespace': t => t.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '').replace(/\n{3,}/g, '\n\n'),
  'remove-breaks': t => t.replace(/\r?\n+/g, ' ').replace(/ {2,}/g, ' ').trim(),
  'smart-quotes': t => t
    .replace(/(\s|^|[(\[])"(\S)/g, '$1\u201C$2')
    .replace(/(\S)"(\s|$|[.,;:!?)\]])/g, '$1\u201D$2')
    .replace(/"/g, '\u201D')
    .replace(/(\s|^|[(\[])'(\S)/g, '$1\u2018$2')
    .replace(/(\S)'(\s|$|[.,;:!?)\]])/g, '$1\u2019$2')
    .replace(/'/g, '\u2019'),
  'straight-quotes': t => t
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'"),
  'html-encode': t => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'),
  'url-encode': t => encodeURIComponent(t),
  'url-decode': t => { try { return decodeURIComponent(t); } catch(e) { return t; } },
  'slug': t => t.split('\n').map(line => line.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u0027\u2032]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  ).join('\n'),
  'sort-az': t => t.split('\n').sort((a,b) => a.localeCompare(b)).join('\n'),
  'sort-za': t => t.split('\n').sort((a,b) => b.localeCompare(a)).join('\n'),
  'dedup': t => [...new Set(t.split('\n'))].join('\n'),
  'number-lines': t => t.split('\n').map((l,i) => `${i+1}. ${l}`).join('\n'),
  'bullet-lines': t => t.split('\n').map(l => `\u2022 ${l}`).join('\n'),
};

// strip-html and html-decode require DOMParser (browser-only).
// They are registered separately in app.js.

// ── Find & Replace ──
export function findAndReplace(text, find, replacement) {
  if (!text || !find) return text;
  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'g'), replacement);
}

// ── Lorem Ipsum ──
export const loremPool = [
  "Tempestates venerunt super planitiem fractam et milites in tenebris stabant.",
  "Gladius eius lucem auream emisit, iuramentum antiquum in acie renovatum.",
  "Reges ceciderunt et turres eorum in pulverem redactae sunt.",
  "Per campos desolatos iter fecit, umbras praeteritorum bellorum sequens.",
  "Iuravit sub caelo ardenti se numquam genua flexurum.",
  "Laminae armaturae fractae sunt sed animus eius integer mansit.",
  "Ventus ululavit per ruinas urbis quondam magnae et potentis.",
  "Oculi eius flammas tempestatis reflectebant dum ad hostem progreditur.",
  "Fulmina super montes resonabant et terra ipsa tremebat sub pedibus.",
  "Custodes ad murum stabant, vigilantes contra tenebras crescentes.",
  "Liber antiquus secreta potestatis oblitae intra paginas celabat.",
  "Ex cinere veteris mundi novum regnum surrexit, forgiatum ferro et igne.",
  "Milites iuramentum dixerunt, voces eorum per vallem resonantes.",
  "Nemo scire poterat quid ultra tempestates iaceret, sed progredi debebant.",
  "Lux per nubila erupit et campus desolatus in auro splenduit.",
  "Scutum eius mille ictus tulit sed numquam confractum est.",
  "In profundis terrae antiqua potestas evigilavit et oculos aperuit.",
  "Heroes non nascuntur sed in fornace adversitatis formantur.",
  "Ultimum proelium non viribus sed voluntate et honore decernetur.",
  "Stetit solus contra exercitum, et tempestates ipsae ab eo recesserunt.",
];

export function generateLorem(count = 3, unit = 'sentences') {
  if (unit === 'sentences') {
    const sentences = [];
    for (let i = 0; i < count; i++) {
      sentences.push(loremPool[i % loremPool.length]);
    }
    return sentences.join(' ');
  } else {
    const paragraphs = [];
    for (let p = 0; p < count; p++) {
      const sentCount = 3 + Math.floor(Math.random() * 4);
      const para = [];
      for (let s = 0; s < sentCount; s++) {
        const idx = (p * 7 + s) % loremPool.length;
        para.push(loremPool[idx]);
      }
      paragraphs.push(para.join(' '));
    }
    return paragraphs.join('\n\n');
  }
}

// ── Text Stats ──
export function getTextStats(text) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0) : 0;
  const lines = text.trim() ? text.split(/\n/).length : 0;
  const readSec = Math.ceil(words / 4.2);
  return { chars, words, sentences, lines, readSec };
}
