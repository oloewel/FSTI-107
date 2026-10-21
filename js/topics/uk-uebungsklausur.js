/* ============ Thema: Übungsklausur 21.10.2026 ============
   Die sechs Aufgaben der Übungsklausur (60 Minuten). Jede Kategorie zeigt zuerst die
   Original-Aufgabe, danach Varianten mit neuen Zahlen. „Komplette Übungsklausur“ geht
   Aufgabe 1–6 im Original der Reihe nach durch. */
(function () {
  const U = BrainForge.utils;
  const { rnd, pick, shuffle, fmt } = U;
  const R = (x) => U.round(x, 4);
  const num = (x) => String(fmt(x)).replace(/-/g, '−');
  const fm = (s) => `<span class="formula">${s}</span>`;
  const sup = (p) => U.sup(String(p));
  const mtx = (rows) => `<table class="mtx"><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const col = (arr) => mtx(arr.map(v => [v]));
  const mxrow = (parts) => `<div class="mxrow">${parts.join(' ')}</div>`;
  const opt = (html, correct) => ({ html, correct: !!correct });
  const tag = (orig) => orig ? '<span class="tag t1">📄 Original aus der Übungsklausur</span> ' : '<span class="tag t2">🔁 Variante mit neuen Zahlen</span> ';
  const nz = (arr) => pick(arr.filter(v => v !== 0));

  // Lineare Terme wie „2x₁ − 3x₂ + 1“
  function lin(terms) {
    const t = terms.filter(([c]) => c !== 0);
    if (!t.length) return '0';
    return t.map(([c, v], i) => {
      const abs = Math.abs(c), body = (abs === 1 && v ? '' : num(abs)) + v;
      return (i === 0 ? (c < 0 ? '−' : '') : (c < 0 ? ' − ' : ' + ')) + body;
    }).join('');
  }
  // Polynome [[Koeffizient, Exponent], ...]
  function poly(terms, v) {
    const t = terms.filter(([c]) => c !== 0).sort((a, b) => b[1] - a[1]);
    if (!t.length) return '0';
    return t.map(([c, p], i) => {
      const abs = Math.abs(c), coef = abs === 1 && p > 0 ? '' : num(abs);
      const body = coef + (p === 0 ? '' : p === 1 ? v : v + sup(p));
      return (i === 0 ? (c < 0 ? '−' : '') : (c < 0 ? ' − ' : ' + ')) + body;
    }).join('');
  }
  const deriv = (terms) => terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p - 1]);
  function polyWrongs(terms, v) {
    const right = poly(deriv(terms), v), d = deriv(terms);
    const cand = [
      poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p]), v),
      poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c, p - 1]), v),
      poly([...d, ...terms.filter(([, p]) => p === 0)], v),
      poly(d.map(([c, p]) => [-c, p]), v),
      poly(d.map(([c, p], i) => (i === 0 ? [c + 1, p] : [c, p])), v),
    ];
    return [...new Set(cand)].filter(s => s !== right).slice(0, 3);
  }

  // ============================================================
  // AUFGABE 1: Grundlagen und Modellverständnis (Erklärungsfragen)
  // ============================================================
  function a1() {
    return {
      type: 'multi',
      prompt: tag(true) + '<b>Aufgabe 1 – Grundlagen und Modellverständnis.</b> In der Klausur beantwortest du die Teile in eigenen Worten. Hier wählst du die Antwort, die einer vollen Lösung entspricht.',
      steps: [
        { label: 'a) Typischer Unterschied zwischen klassischem ML und Deep Learning bei der Gewinnung von Merkmalen (Features)?', options: [
          opt('Beim klassischen ML legen Menschen die Merkmale meist fest (Feature Engineering). Deep Learning lernt geeignete Merkmalsrepräsentationen selbst aus den Rohdaten.', true),
          opt('Deep Learning braucht keine Daten, klassisches ML schon.'),
          opt('Beim Deep Learning legt der Mensch die Merkmale fest, beim klassischen ML lernt das Modell sie selbst.'),
          opt('Es gibt keinen Unterschied, nur die Rechengeschwindigkeit ist anders.')] },
        { label: 'b) Eine Maschine wird über Schwingungsdaten überwacht. Welches ist ein von Menschen festgelegtes Merkmal, das bei der Erkennung auffälliger Zustände hilft?', options: [
          opt('Die maximale Schwingungsamplitude (oder Mittelwert, Varianz, dominante Frequenz) in einem Zeitfenster.', true),
          opt('Das Gewicht w₁ des ersten Neurons.'),
          opt('Die Lernrate η des Trainings.'),
          opt('Die Anzahl der Schichten des Netzes.')] },
        { label: 'c) Mehrere aufeinanderfolgende lineare/affine Schichten mit Identitätsaktivierung: Wird das Gesamtmodell dadurch nichtlinear?', options: [
          opt('Nein. Die Verkettung affiner Abbildungen ist wieder affin: W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂).', true),
          opt('Ja, jede zusätzliche Schicht macht das Modell automatisch nichtlinear.'),
          opt('Ja, weil die Gewichtsmatrizen multipliziert werden.'),
          opt('Nein, weil affine Schichten gar nicht hintereinandergeschaltet werden können.')] },
      ],
      explain: '<b>Musterantworten zum Aufschreiben:</b><br>a) Im klassischen ML werden Merkmale meist von Menschen festgelegt (z.B. Mittelwert, Maximum, Frequenzen). Deep Learning lernt aus den Rohdaten selbst, welche Merkmale wichtig sind.<br>b) Z.B. maximale Amplitude, Mittelwert, Varianz/Standardabweichung oder die dominante Frequenz der Schwingung in einem Zeitfenster.<br>c) Nein. Hintereinandergeschaltete affine Schichten lassen sich zu einer einzigen affinen Funktion zusammenfassen: ŷ = (W₂W₁)x + (W₂b₁ + b₂). Für Nichtlinearität braucht man nichtlineare Aktivierungsfunktionen wie ReLU.',
    };
  }

  // ============================================================
  // AUFGABE 2: Ein künstliches Neuron berechnen
  // ============================================================
  function a2(orig) {
    let x1 = 2, x2 = -1, w1 = -1, w2 = 3, b = 2;
    if (!orig) {
      do { x1 = pick([-2, -1, 1, 2, 3]); x2 = pick([-2, -1, 1, 2, 3]); w1 = nz([-3, -2, -1, 1, 2, 3]); w2 = nz([-3, -2, -1, 1, 2, 3]); b = pick([-2, -1, 0, 1, 2, 3]); }
      while (U.chance(0.7) && w1 * x1 + w2 * x2 + b >= 0);
    }
    const z = w1 * x1 + w2 * x2 + b, a = Math.max(0, z);
    const neg = z < 0;
    return {
      type: 'multi',
      prompt: tag(orig) + `<b>Aufgabe 2 – Ein künstliches Neuron berechnen.</b> Ein Neuron erhält die Eingaben x₁ = ${num(x1)} und x₂ = ${num(x2)}. Die Gewichte sind w₁ = ${num(w1)} und w₂ = ${num(w2)}, der Bias ist b = ${num(b)}.`,
      steps: [
        { label: 'a) Voraktivierung z = w₁x₁ + w₂x₂ + b', varLabel: 'z', answer: z, explain: `${num(w1)}·${num(x1)} + ${num(w2)}·(${num(x2)}) + ${num(b)} = ${num(w1 * x1)} + (${num(w2 * x2)}) + ${num(b)} = ${num(z)}` },
        { label: 'b) Ausgabe a mit ReLU: a = max(0, z)', varLabel: 'a', answer: a, explain: `max(0, ${num(z)}) = ${num(a)}` },
        { label: 'c) Ausgabe mit der Identitätsfunktion φ(z) = z', varLabel: 'a', answer: z, explain: `φ(${num(z)}) = ${num(z)}` },
        { label: 'c) Worin liegt der Unterschied?', options: [
          opt(neg ? `ReLU schneidet den negativen Wert ab und gibt 0 aus, die Identität gibt z = ${num(z)} unverändert weiter.` : 'Hier gibt es keinen Unterschied: Für z ≥ 0 liefern ReLU und Identität denselben Wert.', true),
          opt(neg ? 'Hier gibt es keinen Unterschied: Für z ≥ 0 liefern ReLU und Identität denselben Wert.' : 'ReLU schneidet den Wert ab und gibt immer 0 aus.'),
          opt('Die Identität begrenzt die Ausgabe auf den Bereich zwischen 0 und 1.'),
          opt('ReLU verändert die Gewichte, die Identität den Bias.')] },
      ],
      explain: `z = ${num(z)} → ReLU: ${num(a)}, Identität: ${num(z)}. ${neg ? 'Weil z negativ ist, setzt ReLU den Wert auf 0. Die Identität lässt ihn unverändert.' : 'Weil z nicht negativ ist, verhalten sich ReLU und Identität hier gleich.'}`,
    };
  }

  // ============================================================
  // AUFGABE 3: Zwei Schichten – Notation, Matrizen, Forward Pass
  // ============================================================
  function a3(orig) {
    let x = [2, 1], W1 = [[1, -3], [2, -1]], b1 = [0, -1], W2 = [2, -1], b2 = 1, ji = [1, 2];
    if (!orig) {
      x = [pick([-1, 1, 2, 3]), pick([-1, 1, 2, 3])];
      W1 = [[pick([-2, -1, 1, 2, 3]), pick([-3, -2, -1, 1, 2])], [pick([-2, -1, 1, 2, 3]), pick([-3, -1, 1, 2])]];
      b1 = [pick([-2, -1, 0, 1]), pick([-2, -1, 0, 1])];
      W2 = [nz([-2, -1, 1, 2, 3]), nz([-2, -1, 1, 2, 3])];
      b2 = pick([-1, 0, 1, 2]);
      ji = pick([[1, 2], [2, 1]]);
    }
    const z = [0, 1].map(j => W1[j][0] * x[0] + W1[j][1] * x[1] + b1[j]);
    const a = z.map(v => Math.max(0, v));
    const yh = W2[0] * a[0] + W2[1] * a[1] + b2;
    const [j, i] = ji, wv = W1[j - 1][i - 1];
    const wl = `w<sub>${j}${i}</sub><sup>(1)</sup>`;
    return {
      type: 'multi',
      prompt: tag(orig) + '<b>Aufgabe 3 – Zwei Schichten: Notation, Matrizen und Forward Pass.</b> Es gilt a⁽⁰⁾ = x. Die Zeilen einer Gewichtsmatrix gehören zu den Zielneuronen, die Spalten zu den Ausgaben der vorherigen Schicht. Schicht 1 verwendet ReLU, die Ausgabeschicht die Identität.',
      figure: mxrow(['<b>x</b> =', col(x.map(num)), '&nbsp; <b>W</b><sup>(1)</sup> =', mtx(W1.map(r => r.map(num))), '&nbsp; <b>b</b><sup>(1)</sup> =', col(b1.map(num)), '&nbsp; <b>W</b><sup>(2)</sup> =', mtx([W2.map(num)]), `<span style="white-space:nowrap">&nbsp; <b>b</b><sup>(2)</sup> = ${num(b2)}</span>`]),
      steps: [
        { label: 'a) Dimensionen von W⁽¹⁾ und W⁽²⁾', options: [
          opt('W⁽¹⁾: 2 × 2, W⁽²⁾: 1 × 2', true), opt('W⁽¹⁾: 2 × 2, W⁽²⁾: 2 × 1'), opt('W⁽¹⁾: 2 × 1, W⁽²⁾: 1 × 2'), opt('W⁽¹⁾: 4 × 1, W⁽²⁾: 2 × 1')] },
        { label: `a) Welche Verbindung beschreibt ${wl}?`, options: [
          opt(`Von Eingang x${U.sub(i)} zu Neuron ${j} in Schicht 1`, true),
          opt(`Von Eingang x${U.sub(j)} zu Neuron ${i} in Schicht 1`),
          opt(`Von Neuron ${j} in Schicht 1 zum Ausgabeneuron in Schicht 2`),
          opt(`Der Bias von Neuron ${j} in Schicht 1`)] },
        { label: `a) Wert von ${wl}`, varLabel: wl, answer: wv, explain: `Zeile ${j}, Spalte ${i} von W⁽¹⁾ → ${num(wv)}` },
        { label: 'b) z₁⁽¹⁾ (Zeile 1 von W⁽¹⁾ mal x, plus b₁⁽¹⁾)', varLabel: 'z₁⁽¹⁾', answer: z[0], explain: `${num(W1[0][0])}·${num(x[0])} + (${num(W1[0][1])})·${num(x[1])} + ${num(b1[0])} = ${num(z[0])}` },
        { label: 'b) z₂⁽¹⁾ (Zeile 2 von W⁽¹⁾ mal x, plus b₂⁽¹⁾)', varLabel: 'z₂⁽¹⁾', answer: z[1], explain: `${num(W1[1][0])}·${num(x[0])} + (${num(W1[1][1])})·${num(x[1])} + (${num(b1[1])}) = ${num(z[1])}` },
        { label: 'b) a₁⁽¹⁾ = ReLU(z₁⁽¹⁾)', varLabel: 'a₁⁽¹⁾', answer: a[0], explain: `max(0, ${num(z[0])}) = ${num(a[0])}` },
        { label: 'b) a₂⁽¹⁾ = ReLU(z₂⁽¹⁾)', varLabel: 'a₂⁽¹⁾', answer: a[1], explain: `max(0, ${num(z[1])}) = ${num(a[1])}` },
        { label: 'c) Modellvorhersage ŷ = W⁽²⁾a⁽¹⁾ + b⁽²⁾', varLabel: 'ŷ', answer: yh, explain: `${num(W2[0])}·${num(a[0])} + (${num(W2[1])})·${num(a[1])} + ${num(b2)} = ${num(yh)}` },
      ],
      explain: `W⁽¹⁾ hat 2 Zeilen (2 Neuronen) und 2 Spalten (2 Eingänge), W⁽²⁾ hat 1 Zeile (1 Ausgabeneuron) und 2 Spalten (2 Ausgaben aus Schicht 1). ${wl}: erster Index = Zielneuron, zweiter = Herkunft → von x${U.sub(i)} zu Neuron ${j}, Wert ${num(wv)}.<br>${fm(`z⁽¹⁾ = (${num(z[0])} | ${num(z[1])}) → a⁽¹⁾ = (${num(a[0])} | ${num(a[1])}) → ŷ = ${num(yh)}`)}<br>Wichtig: ReLU erst nach der kompletten Matrixrechnung anwenden, und in Schicht 2 mit a⁽¹⁾ weiterrechnen, nicht mit z⁽¹⁾.`,
    };
  }

  // ============================================================
  // AUFGABE 4: Vom linearen Zusammenhang zur Gewichtsmatrix
  // ============================================================
  function a4(orig) {
    let W = [[2, -3], [-1, 0]], b = [1, 4];
    if (!orig) {
      W = [[nz([-3, -2, -1, 1, 2, 3, 4]), nz([-3, -2, -1, 1, 2, 3])], [nz([-3, -2, -1, 1, 2, 3]), nz([-2, -1, 1, 2, 3, 4])]];
      const [zj, zi] = pick([[0, 0], [0, 1], [1, 0], [1, 1]]);
      W[zj][zi] = 0;
      b = [pick([-3, -2, -1, 1, 2, 3, 5]), pick([-2, -1, 1, 2, 4, 5])];
    }
    let zj = 0, zi = 0;
    W.forEach((r, j) => r.forEach((v, i) => { if (v === 0) { zj = j + 1; zi = i + 1; } }));
    const y1 = lin([[W[0][0], 'x₁'], [W[0][1], 'x₂'], [b[0], '']]);
    const y2 = lin([[W[1][0], 'x₁'], [W[1][1], 'x₂'], [b[1], '']]);
    const other = zi === 1 ? 2 : 1;
    return {
      type: 'multi',
      prompt: tag(orig) + `<b>Aufgabe 4 – Vom linearen Zusammenhang zur Gewichtsmatrix.</b> Eine Schicht mit zwei Eingaben und zwei Ausgabeneuronen verwendet die Identitätsfunktion. Sie soll berechnen:<br>${fm(`ŷ₁ = ${y1}`)} ${fm(`ŷ₂ = ${y2}`)}<br>Bestimme W und b für ŷ = Wx + b.`,
      steps: [
        { label: 'w₁₁ (Koeffizient von x₁ in ŷ₁)', varLabel: 'w₁₁', answer: W[0][0] },
        { label: 'w₁₂ (Koeffizient von x₂ in ŷ₁)', varLabel: 'w₁₂', answer: W[0][1] },
        { label: 'w₂₁ (Koeffizient von x₁ in ŷ₂)', varLabel: 'w₂₁', answer: W[1][0] },
        { label: 'w₂₂ (Koeffizient von x₂ in ŷ₂)', varLabel: 'w₂₂', answer: W[1][1] },
        { label: 'b₁ (Konstante in ŷ₁)', varLabel: 'b₁', answer: b[0] },
        { label: 'b₂ (Konstante in ŷ₂)', varLabel: 'b₂', answer: b[1] },
        { label: `b) Was bedeutet das Gewicht w${U.sub(String(zj) + zi)} = 0?`, options: [
          opt(`Eingang x${U.sub(zi)} hat keinen Einfluss auf die Ausgabe ŷ${U.sub(zj)}.`, true),
          opt(`Das Ausgabeneuron ŷ${U.sub(zj)} gibt immer 0 aus.`),
          opt(`Eingang x${U.sub(zi)} hat auf keine der beiden Ausgaben Einfluss.`),
          opt(`Der Bias b${U.sub(zj)} ist ebenfalls 0.`)] },
      ],
      explain: `${mxrow(['<b>W</b> =', mtx(W.map(r => r.map(num))), '&nbsp; <b>b</b> =', col(b.map(num))])}Zeile j gehört zu ŷⱼ, Spalte i zu xᵢ. Kommt eine Eingabe in einer Gleichung nicht vor, steht dort eine 0. w${U.sub(String(zj) + zi)} = 0 heißt: x${U.sub(zi)} fließt nicht in ŷ${U.sub(zj)} ein. ŷ${U.sub(zj)} hängt aber weiter von x${U.sub(other)} und vom Bias ab, gibt also nicht automatisch 0 aus.`,
    };
  }

  // ============================================================
  // AUFGABE 5: Ableitungen und Gradienten
  // ============================================================
  function a5(orig) {
    let f = [[2, 3], [-3, 2], [4, 1], [-5, 0]], ga = 2, gc = -1, p = 2, q = 3, r = -4, s = 0;
    if (!orig) {
      f = [[nz([-3, -2, 1, 2, 3, 4]), 3], [nz([-4, -3, -2, 2, 3, 5]), 2], [nz([-5, -2, 1, 3, 4, 6]), 1], [pick([-7, -5, 2, 3, 8]), 0]];
      ga = pick([2, 3, -2, 4]); gc = nz([-3, -2, -1, 1, 2, 5]);
      p = pick([1, 2, 3]); q = pick([1, 2, 4]); r = pick([-6, -4, -2, 3, 5]); s = pick([0, 0, -3, 2]);
    }
    const fs = poly(f, 't'), fd = poly(deriv(f), 't');
    const inner = lin([[ga, 'x'], [gc, '']]);
    const gd = `${num(2 * ga)}(${inner})`, gdExp = lin([[2 * ga * ga, 'x'], [2 * ga * gc, '']]);
    const coef = (c) => (c === 1 ? '' : num(c));
    const hs = `${coef(p)}w² + ${coef(q)}b²${r < 0 ? ' − ' : ' + '}${num(Math.abs(r))}w${s ? (s < 0 ? ' − ' : ' + ') + num(Math.abs(s)) + 'b' : ''}`;
    const dW = poly([[2 * p, 1], [r, 0]], 'w'), dB = poly([[2 * q, 1], [s, 0]], 'b');
    return {
      type: 'multi',
      prompt: tag(orig) + '<b>Aufgabe 5 – Ableitungen und Gradienten.</b> In der Klausur schreibst du den Rechenweg so auf, dass die verwendeten Regeln erkennbar sind.',
      steps: [
        { label: `a) Leite f(t) = ${fs} nach t ab.`, options: [opt(fm(`f′(t) = ${fd}`), true), ...polyWrongs(f, 't').map(w => opt(fm(`f′(t) = ${w}`)))] },
        { label: `b) Leite g(x) = (${inner})² mit der Kettenregel ab.`, options: [
          opt(fm(`g′(x) = 2(${inner})·${num(ga)} = ${gd}`), true),
          opt(fm(`g′(x) = 2(${inner})`)),
          opt(fm(`g′(x) = ${num(2 * ga)}x`)),
          opt(fm(`g′(x) = ${num(ga)}(${inner})²`))] },
        { label: `c) h(w, b) = ${hs}. Bestimme ∂h/∂w.`, options: [
          opt(fm(`∂h/∂w = ${dW}`), true), opt(fm(`∂h/∂w = ${poly([[p, 1], [r, 0]], 'w')}`)), opt(fm(`∂h/∂w = ${poly([[2 * p, 1]], 'w')}`)), opt(fm(`∂h/∂w = ${dW} + ${dB}`))] },
        { label: 'c) Bestimme ∂h/∂b.', options: [
          opt(fm(`∂h/∂b = ${dB}`), true), opt(fm(`∂h/∂b = ${poly([[q, 1], [s, 0]], 'b')}`)), opt(fm(`∂h/∂b = ${poly([[2 * q, 2]], 'b')}`)), opt(fm(`∂h/∂b = ${dB} + ${dW}`))] },
        { label: 'c) Gradient ∇h als Spaltenvektor (Reihenfolge: w, b)', options: [
          opt(fm(`∇h = (${dW} | ${dB})`), true), opt(fm(`∇h = (${dB} | ${dW})`)), opt(fm(`∇h = ${dW} + ${dB}`)), opt(fm(`∇h = (${poly([[p, 1], [r, 0]], 'w')} | ${poly([[q, 1], [s, 0]], 'b')})`))] },
      ],
      explain: `a) Summenregel, jeden Term mit Potenz- und Faktorregel ableiten, die Konstante fällt weg: ${fm(`f′(t) = ${fd}`)}<br>b) Kettenregel: äußere Funktion u² → 2u, innere ${inner} → ${num(ga)}: ${fm(`g′(x) = ${gd} = ${gdExp}`)}<br>c) Nach w ableiten (b fest): ${fm(dW)}, nach b ableiten (w fest): ${fm(dB)}. Gradient: ${fm(`∇h = (${dW} | ${dB})`)} – oben ∂h/∂w, unten ∂h/∂b.`,
    };
  }

  // ============================================================
  // AUFGABE 6: Ein Trainingsschritt mit Gradient Descent / SGD
  // ============================================================
  function a6(orig) {
    let x = 2, y = 4, w = 1, b = 1, eta = 0.05;
    if (!orig) {
      x = pick([1, 2, 3]); w = pick([0, 0.5, 1, 2, -1]); b = pick([0, 1, -1]);
      y = pick([2, 4, 5, 6, 8]); if (w * x + b === y) y += 2;
      eta = x === 3 ? 0.05 : pick([0.05, 0.1]);
    }
    const yh = R(w * x + b), e = R(yh - y), L = R(e * e);
    const gw = R(2 * e * x), gb = R(2 * e);
    const wN = R(w - eta * gw), bN = R(b - eta * gb), yN = R(wN * x + bN), LN = R((yN - y) * (yN - y));
    const better = LN < L;
    return {
      type: 'multi',
      prompt: tag(orig) + `<b>Aufgabe 6 – Ein Trainingsschritt mit Gradient Descent / SGD.</b> Lineares Modell für ein Trainingsbeispiel: ${fm('ŷ = wx + b,  L = (ŷ − y)² = (wx + b − y)²')}<br>Zu Beginn: x = ${num(x)}, y = ${num(y)}, w<sub>alt</sub> = ${num(w)}, b<sub>alt</sub> = ${num(b)}, Lernrate η = ${num(eta)}.`,
      steps: [
        { label: 'a) Ursprüngliche Vorhersage ŷ', varLabel: 'ŷ', answer: yh, explain: `${num(w)}·${num(x)} + ${num(b)} = ${num(yh)}` },
        { label: 'a) Loss L', varLabel: 'L', answer: L, explain: `(${num(yh)} − ${num(y)})² = (${num(e)})² = ${num(L)}` },
        { label: 'b) Allgemeiner Term für ∂L/∂w (Kettenregel)', options: [
          opt(fm('∂L/∂w = 2(wx + b − y)·x'), true), opt(fm('∂L/∂w = 2(wx + b − y)')), opt(fm('∂L/∂w = (wx + b − y)²·x')), opt(fm('∂L/∂w = 2x'))] },
        { label: 'b) Allgemeiner Term für ∂L/∂b', options: [
          opt(fm('∂L/∂b = 2(wx + b − y)'), true), opt(fm('∂L/∂b = 2(wx + b − y)·x')), opt(fm('∂L/∂b = 2b')), opt(fm('∂L/∂b = (wx + b − y)·b'))] },
        { label: 'c) ∂L/∂w mit den Ausgangswerten', varLabel: '∂L/∂w', answer: gw, explain: `2·(${num(e)})·${num(x)} = ${num(gw)}` },
        { label: 'c) ∂L/∂b mit den Ausgangswerten', varLabel: '∂L/∂b', answer: gb, explain: `2·(${num(e)}) = ${num(gb)}` },
        { label: 'd) w<sub>neu</sub> = w<sub>alt</sub> − η·∂L/∂w', varLabel: 'w<sub>neu</sub>', answer: wN, explain: `${num(w)} − ${num(eta)}·(${num(gw)}) = ${num(wN)}` },
        { label: 'd) b<sub>neu</sub> = b<sub>alt</sub> − η·∂L/∂b', varLabel: 'b<sub>neu</sub>', answer: bN, explain: `${num(b)} − ${num(eta)}·(${num(gb)}) = ${num(bN)}` },
        { label: 'e) Vorhersage nach dem Update', varLabel: 'ŷ<sub>neu</sub>', answer: yN, explain: `${num(wN)}·${num(x)} + ${num(bN)} = ${num(yN)}` },
        { label: 'e) Loss nach dem Update', varLabel: 'L<sub>neu</sub>', answer: LN, explain: `(${num(yN)} − ${num(y)})² = ${num(LN)}` },
        { label: 'e) War der Trainingsschritt erfolgreich?', options: [
          opt(better ? `Ja: Der Loss ist von ${num(L)} auf ${num(LN)} gesunken, die Vorhersage liegt näher am Ziel y = ${num(y)}.` : `Nein: Der Loss ist von ${num(L)} auf ${num(LN)} nicht gesunken.`, true),
          opt(better ? `Nein: Der Loss ist von ${num(L)} auf ${num(LN)} nicht gesunken.` : `Ja: Der Loss ist von ${num(L)} auf ${num(LN)} gesunken.`),
          opt('Das lässt sich erst nach weiteren Epochen sagen.'),
          opt('Ja, weil sich w und b verändert haben.')] },
      ],
      explain: `Gradient ∇L = (${num(gw)} | ${num(gb)}). ${gw < 0 ? 'Beide Ableitungen sind negativ → w und b werden größer (Minus mal Minus).' : 'Positive Ableitungen → w und b werden kleiner.'} Ergebnis: w = ${num(wN)}, b = ${num(bN)}, ŷ: ${num(yh)} → ${num(yN)}, L: ${num(L)} → ${num(LN)}.${orig ? '<br>Hinweis aus der Klausur: Wer Teil c) nicht gelöst hat, darf für d) die Ersatzwerte ∂L/∂w = −4 und ∂L/∂b = −2 verwenden – das sind genau die richtigen Werte.' : ''}`,
    };
  }

  // ---------- Original zuerst, danach Varianten ----------
  const counts = {};
  const firstOrig = (key, fn) => () => { counts[key] = (counts[key] || 0) + 1; return fn(counts[key] === 1); };
  const ORDER = [() => a1(), () => a2(true), () => a3(true), () => a4(true), () => a5(true), () => a6(true)];
  let seq = 0;
  const all = () => ORDER[(seq++) % ORDER.length]();

  const sheets = ['dl1', 'dl2', 'dl3', 'dl4', 'dl5'].map(id => BrainForge.topics.find(t => t.id === id)).filter(Boolean).flatMap(t => t.sheet || []);

  BrainForge.registerTopic({
    id: 'uk',
    intro: 'Hier ist die <b>Übungsklausur vom 21.10.2026</b> (60 Minuten, unbenotet) mit allen sechs Aufgaben.<br><br><b>So übst du am besten:</b> Spiel zuerst „Komplette Übungsklausur“ einmal am Stück, wie in der echten Prüfung. Danach übst du einzelne Aufgaben gezielt. Jede Aufgabe kommt beim ersten Mal im Original, danach mit neuen Zahlen. So merkst du, ob du den Rechenweg verstanden oder nur die Lösung behalten hast.<br><br><b>Formelsammlung:</b> Laut Klausur höchstens zwei beschriebene DIN-A4-Seiten, selbst erstellt. Sie ist auch für die Klassenarbeit am 02.12.2026 zugelassen.',
    title: 'Übungsklausur 21.10.2026',
    subtitle: 'FSTI-107 · alle 6 Aufgaben, im Original und mit neuen Zahlen',
    description: 'Die Übungsklausur mit Grundlagen, Neuron, zwei Schichten in Matrixform, linearer Zusammenhang → W und b, Ableitungen und einem kompletten SGD-Trainingsschritt.',
    emoji: '🧪',
    color: '#c084fc',
    sheet: sheets.length ? sheets : undefined,
    categories: [
      { id: 'uk-a1', sheetRef: 'mldl', title: 'Aufgabe 1: Grundlagen', desc: 'ML vs. DL, Merkmale, affine Schichten', tier: 1, generate: () => a1(),
        primer: { what: 'Drei Erklärungsfragen: Merkmalsgewinnung bei ML und DL, ein selbst festgelegtes Merkmal für Schwingungsdaten und ob affine Schichten allein ein Modell nichtlinear machen.',
          why: 'In der Klausur musst du diese Fragen in eigenen Worten beantworten. Die Erklärung am Ende enthält Musterantworten, die du so aufschreiben kannst.',
          ex: 'Für c) reicht ein Satz plus Formel: W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂), also wieder affin.' } },
      { id: 'uk-a2', sheetRef: 'acts', title: 'Aufgabe 2: Neuron berechnen', desc: 'z, ReLU und Identität', tier: 1, generate: firstOrig('a2', a2),
        primer: { what: 'Voraktivierung z = w₁x₁ + w₂x₂ + b berechnen, dann die Ausgabe mit ReLU und mit der Identität vergleichen.',
          why: 'Das ist der Grundbaustein jeder Netzrechnung. Der Vergleich zeigt, wann ReLU etwas verändert und wann nicht.',
          ex: 'Original: z = (−1)·2 + 3·(−1) + 2 = −3 → ReLU 0, Identität −3.' } },
      { id: 'uk-a4', sheetRef: 'diag', title: 'Aufgabe 4: Zusammenhang → W und b', desc: 'Gleichungen in Matrix und Bias übersetzen', tier: 2, generate: firstOrig('a4', a4),
        primer: { what: 'Zwei Gleichungen ŷ₁ und ŷ₂ in eine Gewichtsmatrix W und einen Bias-Vektor b übersetzen und ein Null-Gewicht deuten.',
          why: 'Zeile j von W gehört zu ŷⱼ, Spalte i zu xᵢ. Wer das sicher kann, liest jede Matrix-Aufgabe richtig.',
          ex: 'ŷ₂ = −x₁ + 4 enthält kein x₂ → w₂₂ = 0, b₂ = 4.' } },
      { id: 'uk-a5', sheetRef: 'regeln', title: 'Aufgabe 5: Ableitungen', desc: 'Polynom, Kettenregel, partiell, Gradient', tier: 2, generate: firstOrig('a5', a5),
        primer: { what: 'Ein Polynom nach t ableiten, eine Kettenregel-Aufgabe und eine Funktion mit zwei Parametern partiell ableiten, inklusive Gradient.',
          why: 'Genau diese Ableitungen brauchst du in Aufgabe 6 für den Loss.',
          ex: 'g(x) = (2x − 1)² → 2(2x − 1)·2 = 4(2x − 1) = 8x − 4.' } },
      { id: 'uk-a3', sheetRef: 'schichtformel', title: 'Aufgabe 3: Zwei Schichten', desc: 'Dimensionen, w₁₂⁽¹⁾, Forward Pass mit ReLU', tier: 3, generate: firstOrig('a3', a3),
        primer: { what: 'Ein Netz mit zwei Schichten in Matrixform: Dimensionen ablesen, ein Gewicht deuten, z⁽¹⁾ und a⁽¹⁾ mit ReLU berechnen und die Vorhersage ŷ bestimmen.',
          why: 'Das ist ein kompletter Forward Pass, die zentrale Rechenaufgabe des Kurses.',
          ex: 'Original: z⁽¹⁾ = (−1 | 2) → a⁽¹⁾ = (0 | 2) → ŷ = 2·0 + (−1)·2 + 1 = −1.' } },
      { id: 'uk-alle', sheetRef: 'neuron', title: 'Komplette Übungsklausur', desc: 'Aufgabe 1–6 im Original, der Reihe nach', tier: 3, generate: all,
        primer: { what: 'Alle sechs Aufgaben der Übungsklausur im Original, in der Reihenfolge der Klausur.',
          why: 'So übst du die Prüfungssituation. Die Klausur ist auf 60 Minuten angelegt, die einzelnen Aufgaben auf 5 bis 15 Minuten.',
          ex: 'Tipp: Starte im Üben-Modus mit dieser Kategorie und schau dir am Ende die Auswertung an. Dort siehst du, welche Aufgabe du noch einmal einzeln üben solltest.' } },
      { id: 'uk-a6', sheetRef: 'sgd', boss: true, title: 'Boss: Aufgabe 6 – SGD-Schritt', desc: 'ŷ, L, Gradient, Update, Erfolgskontrolle', tier: 3, generate: firstOrig('a6', a6),
        primer: { what: 'Ein kompletter Trainingsschritt: Vorhersage und Loss, Ableitungen des Loss, Gradient, Parameter-Update und die Kontrolle, ob der Loss gesunken ist.',
          why: 'Die größte Aufgabe der Klausur (15 Minuten). Sie verbindet Ableiten und Training.',
          ex: 'Original: ŷ = 3, L = 1 → ∇L = (−4 | −2) → w = 1,2, b = 1,1 → ŷ = 3,5, L = 0,25. Der Loss sinkt, der Schritt war erfolgreich.' } },
    ],
  });
})();
