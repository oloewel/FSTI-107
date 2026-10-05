/* ============ Thema: Deep Learning V – Ableiten (Mathe-Einschub) ============
   FSTI-107, Foliensätze 5 + 6 und aufgaben.txt: Funktion, Parameter vs. Variable,
   Steigung (Sekante/Tangente), Ableitungsregeln (Konstante, Variable, Potenz, Faktor,
   Summe/Differenz, Kette), Steigung an einer Stelle, partielle Ableitungen, Gradient,
   Loss ableiten, Vertiefung (Wurzeln, Brüche, sin/cos/e^x) und Reflexion Modellarchitektur. */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt } = U;
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];
  const minus = (s) => String(s).replace(/-/g, '−');
  const num = (x) => minus(fmt(x));
  const sup = (p) => U.sup(String(p));
  const fm = (s) => `<span class="formula">${s}</span>`;

  // ---------- Polynome als Liste von [Koeffizient, Exponent] ----------
  function polyStr(terms, v = 'x') {
    const t = terms.filter(([c]) => c !== 0).sort((a, b) => b[1] - a[1]);
    if (!t.length) return '0';
    return t.map(([c, p], i) => {
      const abs = Math.abs(c);
      const coef = abs === 1 && p > 0 ? '' : fmt(abs);
      const body = coef + (p === 0 ? '' : p === 1 ? v : v + sup(p));
      const sign = i === 0 ? (c < 0 ? '−' : '') : (c < 0 ? ' − ' : ' + ');
      return sign + body;
    }).join('');
  }
  const deriv = (terms) => terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p - 1]);
  const evalPoly = (terms, x) => terms.reduce((s, [c, p]) => s + c * Math.pow(x, p), 0);
  function randPoly() {
    const deg = pick([2, 3, 3, 4]);
    const powers = shuffle([...Array(deg).keys()].map(k => k + 1)).slice(0, rnd(1, Math.min(3, deg)));
    if (!powers.includes(deg)) powers.push(deg);
    const terms = powers.map(p => [pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7]), p]);
    if (U.chance(0.6)) terms.push([pick([-7, -5, -2, 1, 3, 5, 7]), 0]);
    return terms;
  }
  // typische Fehler beim Ableiten -> falsche Antwortoptionen
  function polyWrongs(terms, v) {
    const right = polyStr(deriv(terms), v);
    const d = deriv(terms);
    const cand = [
      polyStr(terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p]), v),           // Exponent nicht verringert
      polyStr(terms.filter(([, p]) => p > 0).map(([c, p]) => [c, p - 1]), v),           // Faktor vergessen
      polyStr([...d, ...terms.filter(([, p]) => p === 0)], v),                           // Konstante stehen gelassen
      polyStr(d.map(([c, p], i) => (i === 0 ? [c + (c > 0 ? 1 : -1), p] : [c, p])), v), // Rechenfehler
      polyStr(d.map(([c, p]) => [-c, p]), v),                                            // Vorzeichen
      polyStr(terms.map(([c, p]) => [c * (p + 1), p + 1]), v),                           // in die falsche Richtung
    ];
    return [...new Set(cand)].filter(s => s !== right).slice(0, 3);
  }

  // ============================================================
  // KATEGORIE 1: Grundbegriffe (Funktion, Steigung, Ableitung)
  // ============================================================
  const KONZEPTE = [
    { q: 'Was beschreibt eine <b>Funktion</b>?', c: 'Einen Zusammenhang zwischen einer Eingabe und einer Ausgabe.',
      w: ['Eine Liste von Zahlen ohne Zusammenhang.', 'Nur Geraden im Koordinatensystem.', 'Die Steigung an einem Punkt.'],
      e: 'Beispiel f(x) = 2x + 1: Für die Eingabe x = 3 ist die Ausgabe f(3) = 2·3 + 1 = 7. f(x) = y ist nur eine andere Schreibweise.' },
    { q: 'In <b>f(x) = m·x + b</b>: Was ist die Variable, was sind die Parameter?', c: 'x ist die Variable, m und b sind Parameter.',
      w: ['m ist die Variable, x und b sind Parameter.', 'Alle drei sind Variablen.', 'b ist die Variable, m und x sind Parameter.'],
      e: 'Die Variable x setzen wir ein und verändern sie. Die Parameter m (Steigung) und b (Achsenabschnitt) sind Eigenschaften der konkreten Funktion. Im Netz sind Gewichte und Bias genau solche Parameter.' },
    { q: 'Wie ist die <b>Steigung</b> definiert?', c: 'Änderung der Ausgabe geteilt durch Änderung der Eingabe: m = Δy / Δx',
      w: ['Änderung der Eingabe geteilt durch Änderung der Ausgabe: Δx / Δy', 'Ausgabe mal Eingabe', 'Der größte Funktionswert'],
      e: 'm = Δy / Δx. Bei f(x) = 2x + 1 steigt y pro +1 in x um +2, also m = 2.' },
    { q: 'Was gilt für die Steigung einer <b>linearen</b> Funktion?', c: 'Sie ist überall gleich.',
      w: ['Sie wird nach rechts immer größer.', 'Sie ist an jeder Stelle verschieden.', 'Sie ist immer 0.'],
      e: 'Merksatz von der Folie: Bei einer linearen Funktion ist die Steigung überall gleich. Bei f(x) = 2x + 1 ist sie überall 2.' },
    { q: 'Was gilt für die Steigung von <b>f(x) = x²</b>?', c: 'Sie ist nicht überall gleich – sie hängt von der Stelle x ab.',
      w: ['Sie ist überall 2.', 'Sie ist überall gleich, weil x² eine Potenzfunktion ist.', 'x² hat keine Steigung.'],
      e: 'Die Funktionswerte 0, 1, 4, 9, 16 wachsen um +1, +3, +5, +7 – die Steigung ändert sich. f′(x) = 2x gibt für jede Stelle die dortige Steigung an.' },
    { q: 'Was beschreibt die <b>Sekantensteigung</b> zwischen zwei Punkten?', c: 'Die mittlere Steigung zwischen den beiden betrachteten Punkten.',
      w: ['Die exakte Steigung an genau einem Punkt.', 'Den Achsenabschnitt der Funktion.', 'Die zweite Ableitung.'],
      e: 'Bei x² zwischen x = 1 und x = 2: (4 − 1)/(2 − 1) = 3 – das ist die durchschnittliche Steigung dazwischen, nicht die Steigung an einem Punkt.' },
    { q: 'Was erhält man, wenn man den Abstand der beiden Punkte der Sekante <b>immer weiter verkleinert</b>?', c: 'Die Steigung der Tangente an einem Punkt – also die Ableitung.',
      w: ['Immer die Steigung 0.', 'Den Funktionswert f(x).', 'Die Sekante wird unendlich steil.'],
      e: 'Aus Δx wird ein „infinitesimal“ kleiner Abstand. Die Sekantensteigung wird zur Tangentensteigung (Stichwort Differenzenquotient).' },
    { q: 'Was ist die <b>Ableitung f′(x)</b> einer Funktion?', c: 'Wieder eine Funktion, die für jede Stelle die dortige Steigung angibt.',
      w: ['Eine einzelne Zahl, die für alle Stellen gilt.', 'Der Funktionswert an der Stelle 0.', 'Die Umkehrfunktion von f.'],
      e: 'f(x) = x² → f′(x) = 2x. An der Stelle x = 3 ist die Steigung f′(3) = 6. Mit den Ableitungsregeln bekommt man f′ direkt, ohne jedes Mal Sekanten anzunähern.' },
    { q: 'Warum braucht man im Deep Learning überhaupt <b>Ableitungen</b>?', c: 'Sie zeigen, wie sich der Loss ändert, wenn man einen Parameter (Gewicht, Bias) ein wenig verändert.',
      w: ['Um die Eingabedaten zu sortieren.', 'Um die Anzahl der Neuronen festzulegen.', 'Um die Aktivierungsfunktion zu ersetzen.'],
      e: 'Die Ableitung ist eine Änderungs-Information. ∂L/∂w sagt: Wird der Loss größer oder kleiner, wenn ich w erhöhe – und wie stark? Daraus entsteht der Gradient fürs Training.' },
    { q: 'Was ist eine <b>partielle Ableitung</b>?', c: 'Die Ableitung nach einer Größe, wobei alle anderen Größen wie feste Zahlen behandelt werden.',
      w: ['Die Ableitung nur eines Teils des Definitionsbereichs.', 'Eine Ableitung, die nur halb so groß ist.', 'Die Ableitung nach allen Größen gleichzeitig zu einer Zahl addiert.'],
      e: 'f(x, y) = x² + 3y: ∂f/∂x = 2x (y fest), ∂f/∂y = 3 (x fest). Für jede veränderbare Größe gibt es eine eigene partielle Ableitung.' },
    { q: 'Was ist der <b>Gradient</b> einer Funktion mit mehreren Größen?', c: 'Der Vektor aller partiellen Ableitungen – die Änderungsinformation für alle Größen gleichzeitig.',
      w: ['Die größte der partiellen Ableitungen.', 'Die Summe aller Funktionswerte.', 'Die Ableitung nach der ersten Variablen.'],
      e: 'f(x, y) = x² + 3y → ∇f = (2x | 3). Beim Training: ∇L = (∂L/∂w | ∂L/∂b).' },
  ];
  const genKonzept = () => { const q = pick(KONZEPTE); return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e }; };

  // ============================================================
  // KATEGORIE 2: Reflexion Training & Modellarchitektur
  // ============================================================
  function genArchitektur() {
    const v = rnd(0, 2);
    if (v === 0) {
      const nIn = pick([2, 3, 5, 5, 4]), nOut = pick([5, 10, 20, 3].filter(n => n !== nIn));
      return { type: 'choice', prompt: `Eine Schicht hat <b>${nIn} Eingänge</b> und <b>${nOut} Neuronen</b>. Welche Größe hat die Gewichtsmatrix?`,
        options: opts(`${nOut} × ${nIn}`, [`${nIn} × ${nOut}`, `${nOut} × ${nOut}`, `${nIn + nOut} × 1`]),
        explain: `Zeilen = Neuronen, Spalten = Eingänge → ${nOut} × ${nIn}. Folien-Beispiel: 5 Eingänge, 10 Neuronen → 10 × 5; mit 20 Neuronen wäre es 20 × 5.` };
    }
    if (v === 1) {
      const nIn = pick([2, 3, 4, 5]), nOut = pick([2, 3, 5, 10]);
      return { type: 'numeric', label: 'Parameter',
        prompt: `Wie viele <b>trainierbare Parameter</b> (Gewichte und Bias-Werte) hat eine Schicht mit ${nIn} Eingängen und ${nOut} Neuronen?`,
        answer: nIn * nOut + nOut,
        explain: `Gewichte: ${nOut} · ${nIn} = ${nOut * nIn} (die Matrix), Bias: ${nOut} (einer pro Neuron) → <b>${nIn * nOut + nOut}</b>. Mehr Neuronen = mehr Parameter, die gelernt werden müssen.` };
    }
    const QA = [
      { q: 'Wird ein Modell <b>automatisch besser</b>, wenn es mehr Schichten besitzt?', c: 'Nein – bei einem einfachen Zusammenhang können zusätzliche Schichten sogar unnötig sein und das Training erschweren.',
        w: ['Ja, jede zusätzliche Schicht senkt den Loss garantiert.', 'Ja, solange jede Schicht mindestens 10 Neuronen hat.', 'Nein, mehr Schichten sind grundsätzlich verboten.'],
        e: 'Mehr Schichten machen ein Modell nicht automatisch besser. Die Architektur muss zum Problem passen.' },
      { q: 'Wird das Training <b>automatisch schneller</b>, wenn eine Zwischenschicht mehr Neuronen besitzt?', c: 'Nein – mehr Neuronen bedeuten mehr Parameter, die berechnet und gelernt werden müssen. Das Training kann sogar länger dauern.',
        w: ['Ja, mehr Neuronen rechnen parallel und sind immer schneller.', 'Ja, weil der Loss dann sofort 0 ist.', 'Die Anzahl der Neuronen hat keinen Einfluss.'],
        e: 'Jedes zusätzliche Neuron bringt eigene Gewichte und einen Bias mit – mehr Rechenaufwand pro Epoche.' },
      { q: 'Welche zusätzlichen Werte muss ein <b>größeres Modell</b> lernen?', c: 'Zusätzliche Gewichte und Bias-Werte.',
        w: ['Zusätzliche Trainingsdaten.', 'Eine zusätzliche Lernrate pro Neuron.', 'Zusätzliche Aktivierungsfunktionen.'],
        e: 'Je mehr Neuronen und Schichten, desto mehr trainierbare Parameter (W und b).' },
      { q: 'Welche Architektur passt am besten für den einfachen Zusammenhang <b>y = m·x + b</b>?', c: 'Ein möglichst einfaches Modell mit nur einer linearen Schicht.',
        w: ['Ein tiefes Netz mit vielen Schichten und ReLU.', 'Mindestens zwei Zwischenschichten mit je 20 Neuronen.', 'Ein Netz ohne Gewichte, nur mit Bias.'],
        e: 'Ein Neuron mit Identität berechnet genau w·x + b – mehr braucht man nicht.' },
    ];
    const q = pick(QA);
    return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e };
  }

  // ============================================================
  // KATEGORIE 3: Steigung aus zwei Punkten (Sekante)
  // ============================================================
  const SEK_FNS = [
    { s: '2x + 1', f: x => 2 * x + 1, lin: true }, { s: 'x²', f: x => x * x }, { s: 'x³', f: x => x * x * x },
    { s: '3x − 2', f: x => 3 * x - 2, lin: true }, { s: 'x² + x', f: x => x * x + x }, { s: '−x² + 4', f: x => -x * x + 4 },
  ];
  function genSekante() {
    const fn = pick(SEK_FNS);
    const x1 = rnd(-2, 2), x2 = x1 + pick([1, 2, 3]);
    const y1 = fn.f(x1), y2 = fn.f(x2), m = (y2 - y1) / (x2 - x1);
    return { type: 'numeric', label: 'm',
      prompt: `Gegeben ist <b>f(x) = ${fn.s}</b>. Berechne die Steigung zwischen den Stellen <b>x = ${num(x1)}</b> und <b>x = ${num(x2)}</b>.`,
      figure: F.table(['x', 'f(x)'], [[num(x1), num(y1)], [num(x2), num(y2)]]),
      given: ['m = Δy / Δx = (f(x₂) − f(x₁)) / (x₂ − x₁)'],
      answer: U.round(m, 3),
      explain: `${fm(`m = (${num(y2)} − (${num(y1)})) / (${num(x2)} − (${num(x1)})) = ${num(y2 - y1)} / ${num(x2 - x1)} = <b>${num(U.round(m, 3))}</b>`)}<br>${fn.lin ? 'Bei einer linearen Funktion kommt hier immer dieselbe Steigung heraus – egal welche zwei Punkte.' : 'Das ist die <b>mittlere</b> Steigung (Sekantensteigung) zwischen den Punkten. Bei dieser Funktion hängt sie von den gewählten Stellen ab.'}` };
  }

  // ============================================================
  // KATEGORIE 4: Welche Regel?
  // ============================================================
  const RULES = { konst: 'Konstantenregel (f′ = 0)', vari: 'Ableitung der Variablen (f′ = 1)', pot: 'Potenzregel', fak: 'Faktorregel (zusammen mit der Potenzregel)', sum: 'Summen-/Differenzregel (Teile einzeln ableiten)', kette: 'Kettenregel' };
  function genRegel() {
    const type = pick(['konst', 'vari', 'pot', 'fak', 'sum', 'kette']);
    let f, d, why, exclude = [];
    const n = pick([2, 3, 4, 5]), c = pick([2, 3, 4, 5, 7]);
    if (type === 'konst') { const k = pick([7, -4, 12, 3]); f = num(k); d = '0'; why = 'Eine Konstante ändert sich nie – ihre Steigung ist 0.'; }
    if (type === 'vari') { const v = pick(['x', 't', 'z']); f = v; d = '1'; why = `f = ${v} steigt pro +1 in ${v} genau um +1 – Steigung 1.`; }
    if (type === 'pot') { f = 'x' + sup(n); d = `${n}x${n - 1 === 1 ? '' : sup(n - 1)}`; why = 'Potenzregel: Exponent nach vorne, Exponent um 1 verringern.'; }
    if (type === 'fak') { f = `${c}x${sup(n)}`; d = `${c * n}x${n - 1 === 1 ? '' : sup(n - 1)}`; why = `Der Faktor ${c} bleibt stehen, x${sup(n)} wird mit der Potenzregel abgeleitet: ${c}·${n}x${n - 1 === 1 ? '' : sup(n - 1)}.`; exclude = ['pot']; }
    if (type === 'sum') { const t = [[c, 2], [pick([-3, 4, 5]), 1], [pick([-7, 2, 6]), 0]]; f = polyStr(t); d = polyStr(deriv(t)); why = 'Bei einer Summe/Differenz leitet man jeden Teil einzeln ab und setzt die Ergebnisse wieder zusammen.'; exclude = ['pot', 'fak', 'konst']; }
    if (type === 'kette') { const a = pick([2, 3, 4]), b = pick([1, -2, 3, 5]); f = `(${polyStr([[a, 1], [b, 0]])})${sup(n === 5 ? 2 : Math.min(n, 3))}`; d = '…'; why = 'Eine Funktion steckt in einer anderen (innere Funktion ax + b in der äußeren Potenz) → Kettenregel: äußere Ableitung mal innere Ableitung.'; exclude = ['pot', 'fak', 'sum']; }
    const wrongs = shuffle(Object.keys(RULES).filter(k => k !== type && !exclude.includes(k))).slice(0, 3).map(k => RULES[k]);
    return { type: 'choice', prompt: `Welche Ableitungsregel wird für <b>f(x) = ${f}</b> vor allem gebraucht?`,
      options: opts(RULES[type], wrongs),
      explain: `${why}${d !== '…' ? ` Ergebnis: ${fm(`f′(x) = ${d}`)}` : ''}` };
  }

  // ============================================================
  // KATEGORIE 5: Ableitung bestimmen (Konstante, Potenz, Faktor, Summe, Parameter)
  // ============================================================
  const PARAM_FNS = [
    { f: 'f(x) = a·x', d: 'a', w: ['1', 'a·x', '0'], e: 'a ist ein fester Wert (Faktor), x wird zu 1 → f′(x) = a.' },
    { f: 'f(x) = a·x + b', d: 'a', w: ['a + b', 'a + 1', 'b'], e: 'a·x → a, die Konstante b → 0.' },
    { f: 'f(x) = a·x² + b·x + c', d: '2a·x + b', w: ['2a·x + b + c', 'a·x + b', '2x + 1'], e: 'a·x² → 2a·x, b·x → b, c → 0.' },
    { f: 'f(t) = m·t² + b', d: '2m·t', w: ['2m·t + b', 'm·t', '2t'], e: 'Abgeleitet wird nach t: m·t² → 2m·t, die Konstante b → 0.' },
    { f: 'f(z) = a·z³ + b·z² + c·z + d', d: '3a·z² + 2b·z + c', w: ['3a·z² + 2b·z + c + d', 'a·z² + b·z + c', '3z² + 2z + 1'], e: 'Jeder Teil einzeln: 3a·z², 2b·z, c, und d → 0.' },
    { f: 'f(a) = 4a', d: '4', w: ['4a', '0', 'a'], e: 'Hier ist a die Variable! 4a nach a abgeleitet ergibt 4.' },
    { f: 'f(z) = 3z + 5', d: '3', w: ['3z', '8', '5'], e: '3z → 3, die 5 fällt weg.' },
    { f: 'f(t) = t', d: '1', w: ['t', '0', '2t'], e: 'Die Variable selbst abgeleitet ergibt 1 – egal wie sie heißt.' },
  ];
  function genAbleitung() {
    if (U.chance(0.3)) {
      const p = pick(PARAM_FNS);
      return { type: 'choice', prompt: `Bestimme die Ableitung von <b>${p.f}</b>. Andere Buchstaben als die Variable werden wie feste Werte behandelt.`,
        options: opts(fm(`${p.f.split('=')[0].replace('f(', 'f′(').trim()} = ${p.d}`), p.w.map(w => fm(`${p.f.split('=')[0].replace('f(', 'f′(').trim()} = ${w}`))),
        explain: p.e };
    }
    const terms = randPoly();
    const right = polyStr(deriv(terms));
    return { type: 'choice', prompt: `Bestimme die Ableitung von <b>f(x) = ${polyStr(terms)}</b>.`,
      options: opts(fm(`f′(x) = ${right}`), polyWrongs(terms).map(w => fm(`f′(x) = ${w}`))),
      explain: `Jeden Teil einzeln ableiten (Summenregel): ${terms.slice().sort((a, b) => b[1] - a[1]).map(([c, p]) => `${polyStr([[c, p]])} → ${p === 0 ? '0' : polyStr([[c * p, p - 1]])}`).join(' · ')}.<br>${fm(`f′(x) = ${right}`)}<br>Typische Fehler: Exponent nicht verringern, Faktor vergessen, Konstante stehen lassen.` };
  }

  // ============================================================
  // KATEGORIE 6: Koeffizienten von f′ bestimmen
  // ============================================================
  function genKoeff() {
    const a = pick([1, 2, 3, -2, 4, -1]), b = pick([-4, -2, 1, 2, 3, 5]), c = pick([-5, -3, 1, 2, 4, 6]), d = pick([-7, -1, 2, 5, 7]);
    const terms = [[a, 3], [b, 2], [c, 1], [d, 0]];
    return { type: 'multi',
      prompt: `Leite <b>f(x) = ${polyStr(terms)}</b> ab und gib die Koeffizienten an: ${fm('f′(x) = □·x² + □·x + □')}`,
      steps: [
        { label: 'Koeffizient vor x²', varLabel: '□₁', answer: 3 * a, explain: `${polyStr([[a, 3]])} → 3·${num(a)}·x² = ${num(3 * a)}x²` },
        { label: 'Koeffizient vor x', varLabel: '□₂', answer: 2 * b, explain: `${polyStr([[b, 2]])} → 2·${num(b)}·x = ${num(2 * b)}x` },
        { label: 'Konstante', varLabel: '□₃', answer: c, explain: `${polyStr([[c, 1]])} → ${num(c)}, und ${num(d)} → 0` },
      ],
      explain: `${fm(`f′(x) = ${polyStr(deriv(terms))}`)} – die Konstante ${num(d)} fällt beim Ableiten weg.` };
  }

  // ============================================================
  // KATEGORIE 7: Steigung an einer Stelle (f′(x₀) und Bedeutung)
  // ============================================================
  function genStelle() {
    const terms = pick([[[1, 2]], [[1, 3]], [[1, 2], [-2, 1]], [[2, 2], [-4, 1], [1, 0]], [[-1, 2], [3, 1]], [[1, 3], [-3, 1]]]);
    const x0 = pick([-2, -1, 0, 1, 2, 3]);
    const d = deriv(terms), m = evalPoly(d, x0);
    const meaning = m > 0 ? 'An dieser Stelle steigt die Funktion.' : m < 0 ? 'An dieser Stelle fällt die Funktion.' : 'An dieser Stelle hat die Funktion eine waagerechte Tangente (Steigung 0).';
    return { type: 'multi',
      prompt: `Gegeben ist <b>f(x) = ${polyStr(terms)}</b>. Bestimme die Ableitung und die Steigung an der Stelle <b>x = ${num(x0)}</b>.`,
      steps: [
        { label: 'Welche Ableitung hat f?', options: opts(fm(`f′(x) = ${polyStr(d)}`), polyWrongs(terms).map(w => fm(`f′(x) = ${w}`))) },
        { label: `Steigung f′(${num(x0)})`, varLabel: `f′(${num(x0)})`, answer: m, explain: `${polyStr(d).replace(/x/g, `(${num(x0)})`)} = ${num(m)}` },
        { label: 'Was bedeutet das Ergebnis?', options: [
          { html: meaning, correct: true },
          ...['An dieser Stelle steigt die Funktion.', 'An dieser Stelle fällt die Funktion.', 'An dieser Stelle hat die Funktion eine waagerechte Tangente (Steigung 0).'].filter(t => t !== meaning).map(t => ({ html: t }))] },
      ],
      explain: `f′(${num(x0)}) = ${num(m)}. Positiv → steigend, negativ → fallend, 0 → waagerechte Tangente. Je größer der Betrag, desto steiler. Beispiel aus den Aufgaben: f(x) = x² → f′(1) = 2, f′(2) = 4 (steiler), f′(−1) = −2 (fallend).` };
  }

  // ============================================================
  // KATEGORIE 8: Kettenregel
  // ============================================================
  function genKette() {
    const a = pick([2, 3, 4, -2, -1]), b = pick([-3, -2, 1, 2, 3, 5]), n = pick([2, 2, 3]);
    const inner = polyStr([[a, 1], [b, 0]]);
    const f = `(${inner})${sup(n)}`;
    const pw = (e) => (e === 1 ? '' : sup(e));
    const right = `${num(n * a)}(${inner})${pw(n - 1)}`;
    if (U.chance(0.5)) {
      const wrongs = [`${num(n)}(${inner})${pw(n - 1)}`, `${num(n * a)}(${inner})${sup(n)}`, a * a === 1 ? `${num(n * a)}x${pw(n - 1)}` : `${num(n * a * a)}(${inner})${pw(n - 1)}`];
      return { type: 'choice', prompt: `Leite <b>f(x) = ${f}</b> mit der Kettenregel ab.`,
        options: opts(fm(`f′(x) = ${right}`), wrongs.map(w => fm(`f′(x) = ${w}`))),
        explain: `Äußere Funktion u${sup(n)} → ${n}u${pw(n - 1)}, innere Funktion ${inner} → ${num(a)}. Zusammen: ${fm(`f′(x) = ${n}(${inner})${pw(n - 1)} · ${num(a)} = ${right}`)}<br>Häufigster Fehler: die innere Ableitung (${num(a)}) vergessen.` };
    }
    const x0 = pick([0, 1, -1]);
    const val = n * a * Math.pow(a * x0 + b, n - 1);
    return { type: 'multi',
      prompt: `Leite <b>f(x) = ${f}</b> mit der Kettenregel ab – Schritt für Schritt.`,
      steps: [
        { label: 'Welches ist die äußere und welches die innere Funktion?', options: [
          { html: `äußere: u${sup(n)} · innere: u = ${inner}`, correct: true },
          { html: `äußere: ${inner} · innere: u${sup(n)}` },
          { html: `äußere: ${num(a)}x · innere: ${num(b)}` },
          { html: 'Es gibt keine innere Funktion.' }] },
        { label: `Ableitung der inneren Funktion (${inner})′`, varLabel: 'v′', answer: a, explain: `${inner} → ${num(a)}` },
        { label: `Steigung an der Stelle x = ${num(x0)}: f′(${num(x0)})`, varLabel: `f′(${num(x0)})`, answer: val, explain: `f′(x) = ${right} → ${num(n * a)}·(${num(a * x0 + b)})${pw(n - 1)} = ${num(val)}` },
      ],
      explain: `Kettenregel: äußere Ableitung (mit innerer Funktion eingesetzt) mal innere Ableitung → ${fm(`f′(x) = ${right}`)}. Folien-Beispiel: (2x + 1)² → 2(2x + 1)·2 = 4(2x + 1).` };
  }

  // ============================================================
  // KATEGORIE 9: Partielle Ableitungen
  // ============================================================
  function genPartiell() {
    const [u, v] = pick([['x', 'y'], ['x', 'y'], ['w', 'b']]);
    const a = pick([1, 2, 3]), bb = pick([0, 1, 2, 3, -1]), c = pick([0, 1, 2, -1]), e = pick([0, 3, 2, -2]);
    if (bb === 0 && c === 0 && e === 0) return genPartiell();
    const parts = [];
    const add = (co, s) => { if (co === 0) return; const abs = Math.abs(co); parts.push((co < 0 ? (parts.length ? ' − ' : '−') : (parts.length ? ' + ' : '')) + (abs === 1 ? '' : abs) + s); };
    add(a, `${u}²`); add(bb, `${u}${v}`); add(c, `${v}²`); add(e, v);
    const fstr = `f(${u}, ${v}) = ${parts.join('')}`;
    const x0 = pick([-1, 1, 2, 3]), y0 = pick([-2, -1, 1, 2]);
    const du = 2 * a * x0 + bb * y0, dv = bb * x0 + 2 * c * y0 + e;
    return { type: 'multi',
      prompt: `Gegeben ist <b>${fstr}</b>. Bestimme die partiellen Ableitungen an der Stelle <b>${u} = ${num(x0)}, ${v} = ${num(y0)}</b>.`,
      given: [`∂f/∂${u}: ${v} wie eine feste Zahl behandeln`, `∂f/∂${v}: ${u} wie eine feste Zahl behandeln`],
      steps: [
        { label: `∂f/∂${u}`, varLabel: `∂f/∂${u}`, answer: du, explain: `∂f/∂${u} = ${[a ? `${2 * a}${u}` : '', bb ? `${num(bb)}${v}` : ''].filter(Boolean).join(' + ')} → ${num(du)}` },
        { label: `∂f/∂${v}`, varLabel: `∂f/∂${v}`, answer: dv, explain: `∂f/∂${v} = ${[bb ? `${num(bb)}${u}` : '', c ? `${num(2 * c)}${v}` : '', e ? num(e) : ''].filter(Boolean).join(' + ') || '0'} → ${num(dv)}` },
      ],
      explain: `Für jede Größe einzeln ableiten, die andere ist dabei konstant. Zusammen ergibt das den Gradienten ${fm(`∇f = (${num(du)} | ${num(dv)})`)} an dieser Stelle. Achtung beim gemischten Term ${bb ? `${num(bb)}${u}${v}` : `${u}${v}`}: nach ${u} abgeleitet bleibt ${v} stehen, nach ${v} abgeleitet bleibt ${u} stehen.` };
  }

  // ============================================================
  // KATEGORIE 10: Vertiefung (Wurzeln, Brüche, sin, cos, e^x)
  // ============================================================
  const VERT = [
    { f: '√x', d: '1 / (2√x)', w: ['2√x', '½·x', '1 / √x'], e: '√x = x^(1/2) → ½·x^(−1/2) = 1/(2√x).' },
    { f: '∛x', d: '⅓·x^(−2/3)', w: ['3·x^(2/3)', '⅓·x^(1/3)', '1 / (2√x)'], e: '∛x = x^(1/3) → ⅓·x^(1/3 − 1) = ⅓·x^(−2/3).' },
    { f: '3√x', d: '3 / (2√x)', w: ['1 / (2√x)', '3√x', '6√x'], e: 'Faktor 3 bleibt: 3·½·x^(−1/2) = 3/(2√x).' },
    { f: '√(2x + 1)', d: '1 / √(2x + 1)', w: ['1 / (2√(2x + 1))', '2√(2x + 1)', '2 / √(2x + 1)'], e: 'Kettenregel: (2x+1)^(1/2) → ½(2x+1)^(−1/2)·2 = 1/√(2x + 1).' },
    { f: '1/x', d: '−1/x²', w: ['1/x²', '−1/x', 'ln(x)'], e: '1/x = x^(−1) → −1·x^(−2) = −1/x².' },
    { f: '1/x²', d: '−2/x³', w: ['2/x³', '−1/x³', '−2/x'], e: '1/x² = x^(−2) → −2·x^(−3) = −2/x³.' },
    { f: '3/x²', d: '−6/x³', w: ['6/x³', '−3/x³', '3/(2x)'], e: '3·x^(−2) → 3·(−2)·x^(−3) = −6/x³.' },
    { f: 'x² + 1/x', d: '2x − 1/x²', w: ['2x + 1/x²', '2x − 1/x', 'x − 1/x²'], e: 'Summenregel: x² → 2x, x^(−1) → −x^(−2).' },
    { f: 'sin(x)', d: 'cos(x)', w: ['−cos(x)', '−sin(x)', 'sin(x)'], e: 'Regel: (sin x)′ = cos x.' },
    { f: 'cos(x)', d: '−sin(x)', w: ['sin(x)', '−cos(x)', 'cos(x)'], e: 'Regel: (cos x)′ = −sin x – das Minus nicht vergessen!' },
    { f: 'eˣ', d: 'eˣ', w: ['x·eˣ⁻¹', 'e', '0'], e: 'eˣ ist die Funktion, die beim Ableiten sich selbst ergibt.' },
    { f: '3·sin(x)', d: '3·cos(x)', w: ['−3·cos(x)', 'cos(3x)', '3·sin(x)'], e: 'Faktorregel: der Faktor 3 bleibt stehen.' },
    { f: '2eˣ + 4x²', d: '2eˣ + 8x', w: ['2eˣ + 4x', 'eˣ + 8x', '2x·eˣ + 8x'], e: 'Summenregel: 2eˣ → 2eˣ, 4x² → 8x.' },
    { f: 'sin(2x)', d: '2·cos(2x)', w: ['cos(2x)', '2·cos(x)', '−2·sin(2x)'], e: 'Kettenregel: cos(2x)·2.' },
    { f: 'cos(3x)', d: '−3·sin(3x)', w: ['3·sin(3x)', '−sin(3x)', '−3·cos(3x)'], e: 'Kettenregel: −sin(3x)·3.' },
    { f: 'sin(2x + 1)', d: '2·cos(2x + 1)', w: ['cos(2x + 1)', '2·cos(2x)', '2·sin(2x + 1)'], e: 'Kettenregel: cos(2x + 1)·2.' },
    { f: 'e²ˣ', d: '2e²ˣ', w: ['e²ˣ', '2x·e²ˣ⁻¹', 'e²'], e: 'Kettenregel: e²ˣ·2.' },
    { f: 'e³ˣ⁺¹', d: '3e³ˣ⁺¹', w: ['e³ˣ⁺¹', '(3x + 1)·e³ˣ', '3e³ˣ'], e: 'Kettenregel: e³ˣ⁺¹·3.' },
    { f: '(sin x)²', d: '2·sin(x)·cos(x)', w: ['2·sin(x)', 'cos²(x)', '2·cos(x)'], e: 'Kettenregel: äußere u² → 2u, innere sin x → cos x: 2·sin(x)·cos(x).' },
  ];
  function genVertiefung() {
    const q = pick(VERT);
    return { type: 'choice', prompt: `Bestimme die Ableitung von <b>f(x) = ${q.f}</b>.`,
      options: opts(fm(`f′(x) = ${q.d}`), q.w.map(w => fm(`f′(x) = ${w}`))),
      explain: q.e + ' Tipp: Wurzeln und Brüche erst als Potenz schreiben (√x = x^(1/2), 1/x = x^(−1)), dann die Potenzregel anwenden.' };
  }

  // ============================================================
  // BOSS: Loss ableiten – Vorbereitung aufs Training
  // ============================================================
  function genBoss() {
    const x = pick([1, 2, 3]), y = pick([4, 5, 6, 8]), w = pick([0, 1, 2, -1]), b = pick([0, 1, -1]);
    const inner = w * x + b - y;
    return { type: 'multi',
      prompt: `<b>Boss: Loss ableiten.</b> Gegeben ist die Loss-Funktion <b>L = (w·x + b − y)²</b>. Analysiere sie und berechne den Gradienten für x = ${num(x)}, y = ${num(y)}, w = ${num(w)}, b = ${num(b)}.`,
      steps: [
        { label: 'Von welchen Größen hängt L ab?', options: [
          { html: 'Von w, b, x und y.', correct: true }, { html: 'Nur von w.' }, { html: 'Nur von x und y.' }, { html: 'Nur von b.' }] },
        { label: 'Welche Größen sind beim Training veränderbare Parameter?', options: [
          { html: 'w und b', correct: true }, { html: 'x und y' }, { html: 'nur y' }, { html: 'w, b, x und y' }] },
        { label: 'Welche Formel hat ∂L/∂w? (Kettenregel)', options: [
          { html: fm('2(w·x + b − y)·x'), correct: true }, { html: fm('2(w·x + b − y)') }, { html: fm('(w·x + b − y)²·x') }, { html: fm('2x') }] },
        { label: 'Welche Formel hat ∂L/∂b?', options: [
          { html: fm('2(w·x + b − y)'), correct: true }, { html: fm('2(w·x + b − y)·x') }, { html: fm('2b') }, { html: fm('(w·x + b − y)·b') }] },
        { label: '∂L/∂w für die gegebenen Werte', varLabel: '∂L/∂w', answer: 2 * inner * x, explain: `2·(${num(w)}·${num(x)} + ${num(b)} − ${num(y)})·${num(x)} = 2·(${num(inner)})·${num(x)} = ${num(2 * inner * x)}` },
        { label: '∂L/∂b für die gegebenen Werte', varLabel: '∂L/∂b', answer: 2 * inner, explain: `2·(${num(inner)}) = ${num(2 * inner)}` },
      ],
      explain: `Äußere Funktion u² → 2u, innere Funktion w·x + b − y abgeleitet nach w ergibt x, nach b ergibt 1. Gradient: ${fm(`∇L = (∂L/∂w | ∂L/∂b) = (${num(2 * inner * x)} | ${num(2 * inner)})`)}<br>x und y sind die Trainingsdaten und bleiben fest, nur w und b werden beim Training verändert. Genau diese Rechnung steckt in Thema 4 hinter dem SGD-Update.` };
  }

  // ============================================================
  // REGISTRIERUNG
  // ============================================================
  BrainForge.registerTopic({
    id: 'dl5',
    intro: 'Ein Mathe-Einschub, ohne den Training nicht funktioniert: <b>Ableiten</b>.<br><br><b>Was wird behandelt?</b> Was eine Funktion ist, was Steigung bedeutet (Sekante und Tangente), die Ableitungsregeln (Konstante, Potenz, Faktor, Summe, Kette), die Steigung an einer Stelle und partielle Ableitungen für Funktionen mit mehreren Größen. Dazu die Reflexion zur Modellarchitektur aus der letzten Stunde.<br><br><b>Wofür braucht man das?</b> Beim Training will man wissen, wie sich der Loss ändert, wenn man ein Gewicht oder einen Bias ein kleines Stück verändert. Genau das ist eine Ableitung. Alle partiellen Ableitungen zusammen bilden den Gradienten, und mit ihm passt SGD die Parameter an. Der Boss verbindet beides: Du leitest den Loss L = (wx + b − y)² selbst ab.',
    title: 'Deep Learning V – Ableiten',
    subtitle: 'FSTI-107 · Steigung, Ableitungsregeln, Kettenregel, partielle Ableitungen',
    description: 'Foliensätze 5 und 6 plus die Übungsaufgaben: Funktion und Steigung, Ableitungsregeln, Kettenregel, Steigung an einer Stelle, partielle Ableitungen, Vertiefung mit Wurzeln, Brüchen, sin, cos und eˣ – und als Boss den Loss selbst ableiten.',
    emoji: '📈',
    color: '#4dd2ff',
    sheet: [
      { id: 'grund', title: 'Funktion & Steigung', rows: [
        { f: 'f(x) = y: Eingabe x → Ausgabe f(x)', d: 'Variable = Wert, den man einsetzt · Parameter (z.B. m, b) = Eigenschaften der Funktion' },
        { f: 'Steigung m = Δy / Δx = (f(x₂) − f(x₁)) / (x₂ − x₁)', d: 'zwischen zwei Punkten = Sekantensteigung (mittlere Steigung)' },
        { f: 'Linear: Steigung überall gleich · x²: Steigung hängt von der Stelle ab', d: 'Abstand der Punkte → 0 ergibt die Tangentensteigung = Ableitung' },
        { f: 'f′(x) ist wieder eine Funktion: Steigung an jeder Stelle', d: 'f′(x₀) > 0 steigt · < 0 fällt · = 0 waagerechte Tangente' },
      ]},
      { id: 'regeln', title: 'Ableitungsregeln', rows: [
        { f: 'Konstante: f = c → f′ = 0 · Variable: f = x → f′ = 1', d: '' },
        { f: 'Potenzregel: f = xⁿ → f′ = n·xⁿ⁻¹', d: 'Exponent nach vorne, Exponent um 1 verringern' },
        { f: 'Faktorregel: f = c·g(x) → f′ = c·g′(x)', d: 'Faktor bleibt stehen' },
        { f: 'Summen-/Differenzregel: (g ± h)′ = g′ ± h′', d: 'jeden Teil einzeln ableiten' },
        { f: 'Andere Buchstaben (a, b, m …) sind feste Werte', d: 'f(x) = ax² + bx + c → f′(x) = 2ax + b' },
      ]},
      { id: 'kette', title: 'Kettenregel', rows: [
        { f: 'f(x) = u(v(x)) → f′(x) = u′(v(x)) · v′(x)', d: 'äußere Ableitung (innere eingesetzt) mal innere Ableitung' },
        { f: '(2x + 1)² → 2(2x + 1)·2 = 4(2x + 1)', d: '(3x − 2)³ → 3(3x − 2)²·3 = 9(3x − 2)²' },
        { f: '(ax + b)ⁿ → n·a·(ax + b)ⁿ⁻¹', d: 'häufigster Fehler: innere Ableitung a vergessen' },
      ]},
      { id: 'partiell', title: 'Partielle Ableitungen & Gradient', rows: [
        { f: '∂f/∂x: alle anderen Größen wie feste Zahlen behandeln', d: 'f(x, y) = x² + 3y → ∂f/∂x = 2x, ∂f/∂y = 3' },
        { f: '∇f = (∂f/∂x | ∂f/∂y | …)', d: 'Gradient = alle partiellen Ableitungen, Änderungsinformation für alle Größen gleichzeitig' },
        { f: 'L = (wx + b − y)² → ∂L/∂w = 2(wx + b − y)·x · ∂L/∂b = 2(wx + b − y)', d: 'veränderbare Parameter: w und b · x und y sind Daten' },
      ]},
      { id: 'vertiefung', title: 'Vertiefung', rows: [
        { f: '√x = x^(1/2) → 1/(2√x) · 1/x = x^(−1) → −1/x²', d: 'Wurzeln und Brüche als Potenz schreiben, dann Potenzregel' },
        { f: '(sin x)′ = cos x · (cos x)′ = −sin x · (eˣ)′ = eˣ', d: 'mit Kettenregel: sin(2x) → 2cos(2x), e³ˣ⁺¹ → 3e³ˣ⁺¹' },
      ]},
      { id: 'arch', title: 'Modellarchitektur', rows: [
        { f: 'Mehr Schichten ≠ automatisch besser · mehr Neuronen ≠ automatisch schneller', d: 'mehr Neuronen = mehr Parameter = mehr Rechenaufwand' },
        { f: 'W hat n_l × n_{l−1} Einträge · Parameter einer Schicht = n_l·n_{l−1} + n_l', d: '5 Eingänge, 10 Neuronen → W 10 × 5, 60 Parameter' },
        { f: 'Für y = mx + b genügt eine lineare Schicht', d: 'möglichst einfaches Modell wählen' },
      ]},
    ],
    categories: [
      { id: 'ab-konzept', sheetRef: 'grund', title: 'Funktion, Steigung, Ableitung', desc: 'Grundbegriffe und warum man ableitet', tier: 1, generate: genKonzept,
        primer: { what: 'Die Grundbegriffe: Funktion (Eingabe → Ausgabe), Variable vs. Parameter, Steigung als Δy/Δx, Sekante vs. Tangente und die Ableitung als Steigungsfunktion.',
          why: 'Ableiten heißt nichts anderes als „Steigung bestimmen“. Wer das Bild dahinter versteht, weiß später, was der Gradient beim Training aussagt.',
          ex: 'f(x) = 2x + 1 hat überall die Steigung 2. f(x) = x² hat bei x = 1 die Steigung 2, bei x = 3 die Steigung 6 – die Ableitung f′(x) = 2x liefert das für jede Stelle.' } },
      { id: 'ab-architektur', sheetRef: 'arch', title: 'Reflexion Modellarchitektur', desc: 'Schichten, Neuronen, Parameter', tier: 1, generate: genArchitektur,
        primer: { what: 'Die Auswertung der Notebook-Aufgabe „Training und Modellarchitektur“: Was bringen mehr Schichten oder mehr Neuronen, wie groß werden die Gewichtsmatrizen?',
          why: 'Größer ist nicht automatisch besser. Jedes zusätzliche Neuron bringt Parameter mit, die gelernt werden müssen – die Architektur sollte zum Problem passen.',
          ex: '5 Eingänge, 10 Neuronen: W ist 10 × 5 = 50 Gewichte, dazu 10 Bias-Werte → 60 trainierbare Parameter.' } },
      { id: 'ab-sekante', sheetRef: 'grund', title: 'Steigung aus zwei Punkten', desc: 'Δy / Δx berechnen', tier: 1, weight: 1.1, generate: genSekante,
        primer: { what: 'Die mittlere Steigung zwischen zwei Stellen: Unterschied der Funktionswerte geteilt durch Unterschied der x-Werte.',
          why: 'So nähert man sich der Ableitung an: Je näher die beiden Punkte zusammenrücken, desto genauer wird aus der Sekantensteigung die Steigung an einem Punkt.',
          ex: 'f(x) = x² zwischen x = 1 und x = 2: (4 − 1)/(2 − 1) = 3.' } },
      { id: 'ab-regel', sheetRef: 'regeln', title: 'Welche Regel?', desc: 'Die passende Ableitungsregel erkennen', tier: 1, generate: genRegel,
        primer: { what: 'Vor dem Ableiten erkennen, welche Regel gebraucht wird: Konstante, Variable, Potenz, Faktor, Summe oder Kette.',
          why: 'Die Aufgaben sagen ausdrücklich: Nicht nur das Ergebnis aufschreiben, sondern wissen, welche Regel man verwendet. Wer die Regel erkennt, macht weniger Fehler.',
          ex: '4x² → Faktorregel mit Potenzregel · x² + x → Summenregel · (2x + 1)² → Kettenregel.' } },
      { id: 'ab-ableitung', sheetRef: 'regeln', title: 'Ableitung bestimmen', desc: 'Potenz, Faktor, Summe, Parameter', tier: 2, weight: 1.3, generate: genAbleitung,
        primer: { what: 'Polynome und Funktionen mit Parametern ableiten – jeden Teil einzeln mit Potenz- und Faktorregel, Konstanten fallen weg.',
          why: 'Das ist das Handwerk, das man für jede Loss-Ableitung braucht.',
          ex: 'f(x) = 3x³ + 2x² − 5x + 7 → f′(x) = 9x² + 4x − 5. Die 7 fällt weg.' } },
      { id: 'ab-koeff', sheetRef: 'regeln', title: 'Koeffizienten von f′', desc: 'f′(x) = □x² + □x + □ ausfüllen', tier: 2, generate: genKoeff,
        primer: { what: 'Ein Polynom dritten Grades ableiten und die Zahlen vor x², x und die Konstante einzeln eintragen – wie im Bildungscampus.',
          why: 'So übst du die Potenzregel Term für Term und siehst, an welcher Stelle sich ein Fehler einschleicht.',
          ex: 'f(x) = 2x³ − 4x² + 3x − 7 → f′(x) = 6x² − 8x + 3.' } },
      { id: 'ab-stelle', sheetRef: 'grund', title: 'Steigung an einer Stelle', desc: 'f′(x₀) berechnen und deuten', tier: 2, weight: 1.2, generate: genStelle,
        primer: { what: 'Erst f′(x) bestimmen, dann einen x-Wert einsetzen. Das Ergebnis ist die Steigung genau an dieser Stelle.',
          why: 'Beim Training ist genau das die Frage: Wie steil ist der Loss gerade an der aktuellen Stelle – und in welche Richtung?',
          ex: 'f(x) = x² → f′(x) = 2x: f′(1) = 2 (steigt), f′(2) = 4 (steigt steiler), f′(−1) = −2 (fällt).' } },
      { id: 'ab-kette', sheetRef: 'kette', title: 'Kettenregel', desc: 'Innere und äußere Funktion', tier: 3, weight: 1.3, generate: genKette,
        primer: { what: 'Für verschachtelte Funktionen: äußere Funktion ableiten (die innere bleibt drin) und mit der Ableitung der inneren Funktion multiplizieren.',
          why: 'Der Loss (wx + b − y)² ist genau so eine verschachtelte Funktion. Ohne Kettenregel kein Gradient.',
          ex: '(2x + 1)²: äußere u² → 2u, innere 2x + 1 → 2. Zusammen: 2(2x + 1)·2 = 4(2x + 1).' } },
      { id: 'ab-partiell', sheetRef: 'partiell', title: 'Partielle Ableitungen', desc: 'Nach einer Größe ableiten, Rest fest', tier: 3, weight: 1.2, generate: genPartiell,
        primer: { what: 'Bei Funktionen mit mehreren Größen leitet man nach jeder Größe einzeln ab. Alle anderen Größen werden dabei wie feste Zahlen behandelt.',
          why: 'Der Loss hängt von vielen Parametern ab. Für jeden gibt es eine partielle Ableitung – zusammen bilden sie den Gradienten.',
          ex: 'f(w, b) = w² + 3wb + b²: ∂f/∂w = 2w + 3b, ∂f/∂b = 3w + 2b.' } },
      { id: 'ab-vertiefung', sheetRef: 'vertiefung', title: 'Vertiefung', desc: 'Wurzeln, Brüche, sin, cos, eˣ', tier: 3, generate: genVertiefung,
        primer: { what: 'Die Advanced-Aufgaben: Wurzeln und Brüche als Potenz schreiben, dazu die Ableitungen von sin, cos und eˣ – auch mit Kettenregel.',
          why: 'Viele Funktionen im Deep Learning (z.B. Sigmoid mit e⁻ᶻ) brauchen diese Regeln.',
          ex: '√x = x^(1/2) → 1/(2√x) · sin(2x) → 2cos(2x) · e³ˣ⁺¹ → 3e³ˣ⁺¹.' } },
      { id: 'ab-boss-loss', sheetRef: 'partiell', boss: true, title: 'Boss: Loss ableiten', desc: 'L = (wx + b − y)² analysieren und ableiten', tier: 3, generate: genBoss,
        primer: { what: 'Die Herausforderungs-Aufgabe: Von welchen Größen hängt der Loss ab, welche sind veränderbar, wie lauten ∂L/∂w und ∂L/∂b – und was ergibt sich für konkrete Werte?',
          why: 'Hier treffen Ableiten und Training aufeinander. Genau diese beiden Ableitungen stecken im SGD-Update aus Thema 4.',
          ex: 'x = 2, y = 6, w = 1, b = 0: innerer Fehler 2 − 6 = −4 → ∂L/∂w = 2·(−4)·2 = −16, ∂L/∂b = −8.' } },
    ],
  });
})();
