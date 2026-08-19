/* ============ BrainForge – Utils ============
   Kleine Helfer für Zufall, Formatierung und Mathe-Notation.
   Alles global unter window.BF (wird von engine.js übernommen). */
(function () {
  const U = {};

  // --- Zufall ---
  U.rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;     // ganzzahlig [a,b]
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // zufälliger "schöner" Wert aus einer Menge (z.B. Gewichte)
  U.nice = (opts) => U.pick(opts);
  U.weightVal = () => U.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2, 1, -1]);
  U.biasVal = () => U.pick([-3, -2, -1, -1, 0, 0, 1, 2]);
  U.inputVal = () => U.pick([0, 1, 1, 2, 2, 3, 4, 5, -1]);

  // --- Zahlen ---
  U.round = (x, d = 2) => Math.round((x + Number.EPSILON) * Math.pow(10, d)) / Math.pow(10, d);
  U.fmt = (x, d = 2) => {
    if (x === null || x === undefined || Number.isNaN(x)) return '?';
    const r = U.round(x, d);
    let s = String(r);
    if (Math.abs(r - Math.round(r)) < 1e-9) s = String(Math.round(r));
    return s.replace('.', ',');
  };
  U.sigmoid = (z) => 1 / (1 + Math.exp(-z));
  U.relu = (z) => Math.max(0, z);
  U.step = (z) => (z > 0 ? 1 : 0);
  U.ident = (z) => z;
  // Parsen einer Nutzereingabe: "0,5" / "0.5" / "-2" / "1/2"
  U.parseNum = (s) => {
    if (s === null || s === undefined) return NaN;
    s = String(s).trim().replace(/\s+/g, '').replace(',', '.');
    if (s === '') return NaN;
    const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
    if (!/^-?\d*\.?\d+(e-?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  };

  // --- Notation (HTML) ---
  // Gewicht w_ji^(l)
  U.W = (j, i, l) => `w<sub>${j}${i}</sub><sup>(${l})</sup>`;
  U.Wsimple = (i) => `w<sub>${i}</sub>`;
  // Aktivierung a_j^(l)
  U.A = (j, l) => `a<sub>${j}</sub><sup>(${l})</sup>`;
  U.Z = (j, l) => `z<sub>${j}</sub><sup>(${l})</sup>`;
  U.B = (j, l) => `b<sub>${j}</sub><sup>(${l})</sup>`;
  U.X = (i) => `x<sub>${i}</sub>`;
  U.phi = 'φ';
  U.yhat = 'ŷ';

  // Unicode-Variante für SVG-Text (kein <sub>/<sup> möglich)
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', i: 'ᵢ', j: 'ⱼ', n: 'ₙ' };
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '(': '⁽', ')': '⁾', l: 'ˡ', L: 'ᴸ' };
  U.sub = (s) => String(s).split('').map(c => SUB[c] || c).join('');
  U.sup = (s) => String(s).split('').map(c => SUP[c] || c).join('');
  U.uW = (j, i, l) => `w${U.sub(String(j) + String(i))}${U.sup('(' + l + ')')}`;
  U.uA = (j, l) => `a${U.sub(j)}${U.sup('(' + l + ')')}`;
  U.uX = (i) => `x${U.sub(i)}`;

  // Aktivierungsfunktionen als Katalog (für viele Generatoren nützlich)
  U.ACTS = [
    { id: 'ident', name: 'Lineare Funktion (Identität)', short: 'Identität', fn: U.ident, formula: 'φ(z) = z',
      desc: 'gibt die Voraktivierung unverändert weiter' },
    { id: 'step', name: 'Schwellenfunktion', short: 'Schwelle', fn: U.step, formula: 'φ(z) = 0 für z ≤ 0, 1 für z > 0',
      desc: 'gibt nur „aus“ (0) oder „an“ (1) weiter' },
    { id: 'relu', name: 'ReLU', short: 'ReLU', fn: U.relu, formula: 'φ(z) = max(0, z)',
      desc: 'schneidet negative Werte ab, positive bleiben erhalten' },
    { id: 'sigmoid', name: 'Sigmoid', short: 'Sigmoid', fn: U.sigmoid, formula: 'φ(z) = 1 / (1 + e⁻ᶻ)',
      desc: 'begrenzt beliebige Werte auf den Bereich zwischen 0 und 1' },
  ];
  U.actById = (id) => U.ACTS.find(a => a.id === id);

  U.escape = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  U.el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  window.BFUtils = U;
})();
