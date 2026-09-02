/* ============ Thema: Deep Learning II – Matrixschreibweise & Forward Pass ============
   FSTI-107, Foliensatz 2: Fully-Connected-Netz, Forward Pass programmieren,
   Skalar/Vektor/Matrix-Notation, z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾, Dimensionen,
   Schicht als Funktion, Gewichte aus gewünschter Funktion bestimmen (y = mx + c). */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt } = U;
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];

  // --- HTML-Bausteine für Vektoren/Matrizen ---
  const mtx = (rows) => `<table class="mtx"><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const col = (arr) => mtx(arr.map(v => [v]));
  const mxrow = (parts) => `<div class="mxrow">${parts.join(' ')}</div>`;
  const bold = (s) => `<b>${s}</b>`;
  const Wl = (l) => `<b>W</b><sup>(${l})</sup>`;
  const bl = (l) => `<b>b</b><sup>(${l})</sup>`;
  const al = (l) => `<b>a</b><sup>(${l})</sup>`;
  const zl = (l) => `<b>z</b><sup>(${l})</sup>`;
  const rowCalc = (ws, xs, b) => ws.map((w, i) => `${fmt(w)}·${fmt(xs[i])}`).join(' + ') + ` + (${fmt(b)})`;
  const dotB = (ws, xs, b) => ws.reduce((s, w, i) => s + w * xs[i], 0) + b;
  const niceW = () => pick([-2, -1, -1, 0, 0, 0.5, 1, 1, 2]);
  const niceX = () => pick([0, 1, 1, 2, 2, 3, -1]);

  // ============================================================
  // KATEGORIE 1: Schreibweise (Skalar / Vektor / Matrix)
  // ============================================================
  function genNotation() {
    const KINDS = [
      { name: 'Skalar (einzelne Zahl)', how: 'normaler kursiver Kleinbuchstabe', ex: ['<i>x<sub>i</sub></i>', '<i>z<sub>j</sub></i><sup>(l)</sup>', '<i>b<sub>1</sub></i><sup>(1)</sup>', '<i>a<sub>2</sub></i><sup>(1)</sup>'] },
      { name: 'Vektor', how: 'fetter Kleinbuchstabe', ex: ['<b>x</b>', `${zl('l')}`, `${bl('l')}`, `${al('l')}`] },
      { name: 'Matrix', how: 'fetter Großbuchstabe', ex: [`${Wl(1)}`, `${Wl('l')}`, '<b>W</b><sup>(2)</sup>'] },
    ];
    const k = pick(KINDS), others = KINDS.filter(x => x !== k);
    const v = rnd(0, 2);
    if (v === 0) return { type: 'choice', prompt: `Notation: Wofür steht ein Symbol wie <span class="formula">${pick(k.ex)}</span>?`,
      options: opts(k.name, others.map(o => o.name).concat(['Aktivierungsfunktion'])),
      explain: `Konvention aus dem Skript: Skalare = kursive Kleinbuchstaben (x<sub>i</sub>, z<sub>j</sub><sup>(l)</sup>), Vektoren = <b>fette Kleinbuchstaben</b> (<b>x</b>, <b>z</b><sup>(l)</sup>), Matrizen = <b>fette Großbuchstaben</b> (<b>W</b><sup>(l)</sup>).` };
    if (v === 1) return { type: 'choice', prompt: `Wie schreibt man laut Konvention eine <b>${k.name.split(' ')[0]}</b>?`,
      options: opts(k.how, others.map(o => o.how).concat(['griechischer Buchstabe'])),
      explain: `Skalar → kursiv klein · Vektor → fett klein · Matrix → fett groß. Beispiel: ${k.ex[0]}` };
    return { type: 'choice', prompt: `Was gilt für <span class="formula"><b>a</b><sup>(0)</sup></span>?`,
      options: opts('Das ist der Eingabevektor: <b>a</b>⁽⁰⁾ = <b>x</b> (Sonderfall der „nullten Schicht“).',
        ['Das ist immer der Nullvektor.', 'Das ist die Ausgabe der letzten Schicht.', 'Das ist der Bias der ersten Schicht.']),
      explain: 'Damit die Formel z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾ auch für Schicht 1 funktioniert, setzt man a⁽⁰⁾ = x.' };
  }

  // ============================================================
  // KATEGORIE 2: Konzepte (Forward Pass, Schicht als Funktion, W & b)
  // ============================================================
  const CONCEPTS = [
    { q: 'Was ist der <b>Forward Pass</b>?', c: 'Das „Durchreichen“ der Daten durch das künstliche neuronale Netz – Schicht für Schicht bis zur Vorhersage.',
      w: ['Das Anpassen der Gewichte anhand des Fehlers.', 'Das Löschen unwichtiger Neuronen.', 'Das Rückwärtslesen der Eingabedaten.'],
      e: 'Forward Pass = Daten vorwärts durchs Netz reichen: aus a⁽ˡ⁻¹⁾ wird z⁽ˡ⁾, daraus a⁽ˡ⁾ – bis ŷ herauskommt.' },
    { q: 'Was macht eine <b>Schicht</b> mathematisch gesehen?', c: 'Sie ist eine Funktion: Aus dem Eingabevektor wird ein Ausgabevektor berechnet – ŷ = f(x), möglichst nah an y.',
      w: ['Sie speichert die Trainingsdaten.', 'Sie zählt die Anzahl der Neuronen.', 'Sie sortiert die Eingaben der Größe nach.'],
      e: 'Die Schicht bestimmt aus dem Eingabevektor x den Ausgabevektor ŷ. Die Schicht ist eine Funktion.' },
    { q: 'Was bestimmt, <b>welche Funktion</b> das Netz berechnet?', c: 'Die Werte in der Gewichtsmatrix W und im Bias-Vektor b.',
      w: ['Nur die Anzahl der Eingaben.', 'Die Reihenfolge der Trainingsdaten.', 'Der Name der Aktivierungsfunktion allein.'],
      e: 'Merksatz aus dem Skript: Die Werte in der Gewichtsmatrix und im Bias-Vektor bestimmen, welche Funktion unser Netz berechnet.' },
    { q: 'Bisher haben wir W und b selbst vorgegeben. Was ist die Idee für <b>komplexere Zusammenhänge</b>?', c: 'Das Netz soll geeignete Werte für W und b anhand von Beispielen selbst finden (Lernen).',
      w: ['Man probiert zufällig, bis es passt, und schreibt die Werte auf.', 'Man nimmt immer die Einheitsmatrix.', 'Komplexe Zusammenhänge sind mit Netzen nicht abbildbar.'],
      e: 'Bei komplexen Zusammenhängen können wir passende Werte nicht mehr selbst herleiten – das Netz soll sie aus Beispielen lernen. (Wie genau → nächstes Kapitel!)' },
    { q: 'Beim Programmieren des Forward Pass: Was ist bei <b>allen Neuronen einer Schicht gleich</b>?', c: 'Der Rechenweg: gewichtete Summe + Bias, dann Aktivierungsfunktion.',
      w: ['Die Gewichte.', 'Der Bias.', 'Die Voraktivierung z.'],
      e: 'Die Struktur (Σ w·a + b, dann φ) ist identisch – nur die Werte von Gewichten und Bias unterscheiden sich pro Neuron.' },
    { q: 'Wie löst man wiederholte, gleichartige Neuronen-Berechnungen im Code <b>effektiver</b>?', c: 'Zusammengehörende Werte als Vektoren/Matrizen darstellen und wiederholte Operationen als Funktionen.',
      w: ['Jede Zeile per Hand kopieren und Variablennamen hochzählen.', 'Alle Werte in einen einzigen String schreiben.', 'Für jedes Neuron ein eigenes Programm starten.'],
      e: 'Genau die Überlegung aus dem Skript – deshalb die Matrixschreibweise z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾.' },
    { q: 'Eine Gewichtsmatrix hat nur auf der <b>Hauptdiagonalen</b> Werte ≠ 0. Was bedeutet das?', c: 'Jede Ausgabe hängt nur vom Eingang an derselben Position ab – alle anderen Verbindungen haben keinen Einfluss.',
      w: ['Das Netz ist kaputt und kann nichts berechnen.', 'Alle Ausgaben sind identisch.', 'Der Bias wird ignoriert.'],
      e: 'Diagonalmatrix: ŷ₁ hängt nur von x₁ ab (z.B. ŷ₁ = 2x₁ + 3). Sollen andere Eingaben einfließen (ŷ₁ = 2x₁ + x₂ + 3), müssen weitere Positionen besetzt werden.' },
    { q: 'Was müsste passieren, damit in der Gewichtsmatrix auch Positionen <b>außerhalb der Diagonalen</b> besetzt sind?', c: 'Eine Ausgabe müsste zusätzlich von anderen Eingabewerten abhängen (z.B. ŷ₁ = 2x₁ + x₂ + 3).',
      w: ['Der Bias müsste größer werden.', 'Die Aktivierungsfunktion müsste ReLU sein.', 'Es müssten mehr Trainingsdaten her.'],
      e: 'w₁₂ ≠ 0 heißt: Eingang 2 fließt in Ausgabe 1 ein. Diagonale = „jeder bleibt bei seinem Partner“.' },
    { q: 'In der Formel <b>z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾</b>: Warum steht bei a der Exponent (l−1)?', c: 'Die Eingaben einer Schicht sind die Ausgaben der vorherigen Schicht.',
      w: ['Weil Vektoren immer eine 1 abgezogen bekommen.', 'Das ist ein Tippfehler im Skript.', 'Weil die letzte Schicht zuerst berechnet wird.'],
      e: 'Wie bei der Einzelneuron-Formel: Eingänge kommen aus Schicht l−1. Für Schicht 1 gilt a⁽⁰⁾ = x.' },
    { q: 'Die Aktivierungsfunktion war bei allen Neuronen die <b>Identität</b>. Was passiert mit z?', c: 'z wird einfach unverändert übergeben: a = z (bzw. ŷ = z in der letzten Schicht).',
      w: ['z wird auf 0 gesetzt.', 'z wird auf den Bereich 0 bis 1 begrenzt.', 'Negative z werden abgeschnitten.'],
      e: '„Wo ist die Aktivierung hin?“ – Identitätsfunktion: z wird direkt weitergereicht.' },
  ];
  const genConcept = () => { const q = pick(CONCEPTS); return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e }; };

  // ============================================================
  // KATEGORIE 3: Dimensionen von W, b, z
  // ============================================================
  function genDim() {
    const nIn = rnd(2, 5); const nOut = (nIn % 4) + 2; // immer 2..5 und != nIn
    const v = rnd(0, 2);
    if (v === 0) return { type: 'choice',
      prompt: `Schicht l hat <b>${nOut} Neuronen</b> und bekommt <b>${nIn} Eingänge</b> aus der vorherigen Schicht. Welche Größe hat die Gewichtsmatrix ${Wl('l')}?`,
      options: opts(`${nOut} × ${nIn} (Zeilen × Spalten)`, [`${nIn} × ${nOut}`, `${nOut} × ${nOut}`, `${nIn} × ${nIn}`]),
      explain: `Pro Neuron eine <b>Zeile</b> (${nOut} Neuronen → ${nOut} Zeilen), pro Eingang eine <b>Spalte</b> (${nIn} Eingänge → ${nIn} Spalten). Zeile j enthält die Gewichte w<sub>j1</sub>…w<sub>j${nIn}</sub>. Allgemein: n<sub>l</sub> × n<sub>l−1</sub>.` };
    if (v === 1) return { type: 'choice',
      prompt: `Schicht l hat <b>${nOut} Neuronen</b>. Wie viele Einträge haben der Bias-Vektor ${bl('l')} und der Vektor ${zl('l')}?`,
      options: opts(`Beide ${nOut} – ein Bias und eine Voraktivierung pro Neuron`, [`Beide ${nIn}`, `b: ${nOut}, z: ${nIn}`, `Beide ${nOut * nIn}`]),
      explain: `Jedes Neuron hat genau einen Bias und eine Voraktivierung → beide Vektoren haben n<sub>l</sub> = ${nOut} Einträge.` };
    return { type: 'choice',
      prompt: `In <span class="formula">z⁽ˡ⁾ = W⁽ˡ⁾ · a⁽ˡ⁻¹⁾ + b⁽ˡ⁾</span>: W ist ${nOut} × ${nIn}. Wie viele Einträge muss <b>a</b>⁽ˡ⁻¹⁾ haben, damit die Multiplikation funktioniert?`,
      options: opts(`${nIn} – so viele wie W Spalten hat`, [`${nOut}`, `${nOut * nIn}`, 'Beliebig viele']),
      explain: `Matrix·Vektor: Spaltenzahl der Matrix (${nIn}) = Länge des Vektors. Das Ergebnis z hat dann ${nOut} Einträge (Zeilenzahl).` };
  }

  // ============================================================
  // KATEGORIE 4: Eine Zeile der Matrix rechnen (z_j)
  // ============================================================
  function genRow() {
    const nIn = pick([2, 3, 3]), nOut = pick([2, 3]);
    const Wm = Array.from({ length: nOut }, () => Array.from({ length: nIn }, niceW));
    const a = Array.from({ length: nIn }, niceX);
    const b = Array.from({ length: nOut }, U.biasVal);
    const j = rnd(1, nOut);
    const z = U.round(dotB(Wm[j - 1], a, b[j - 1]), 3);
    return {
      type: 'numeric', label: `z<sub>${j}</sub><sup>(1)</sup>`,
      prompt: `Berechne die Voraktivierung von <b>Neuron ${j}</b> (= Zeile ${j} der Matrixgleichung).`,
      figure: mxrow([zl(1), '=', mtx(Wm.map(r => r.map(v => fmt(v)))), '·', col(a.map(v => fmt(v))), '+', col(b.map(v => fmt(v)))]),
      answer: z,
      explain: `Zeile ${j} von W mal Vektor a, plus Bias-Eintrag ${j}: <span class="formula">z<sub>${j}</sub> = ${rowCalc(Wm[j - 1], a, b[j - 1])} = <b>${fmt(z)}</b></span>. Merke: Zeile j „gehört“ Neuron j.`,
    };
  }

  // ============================================================
  // KATEGORIE 5: Elementweise Aktivierung auf Vektor
  // ============================================================
  function genVecAct() {
    const act = pick(U.ACTS.filter(a => a.id !== 'sigmoid'));
    const zv = [pick([-3, -2, -1]), pick([0, 1, 2]), pick([-1.5, 3, 4, -4])];
    const zs = shuffle(zv);
    const k = rnd(1, 3);
    const ans = U.round(act.fn(zs[k - 1]), 3);
    return {
      type: 'numeric', label: `a<sub>${k}</sub><sup>(1)</sup>`,
      prompt: `Die Aktivierungsfunktion wird <b>elementweise</b> auf den Vektor angewendet: a⁽¹⁾ = φ(z⁽¹⁾) mit φ = <b>${act.name}</b>. Berechne den Eintrag <b>a<sub>${k}</sub></b>.`,
      figure: mxrow([zl(1), '=', col(zs.map(v => fmt(v))), `, φ = ${act.short} (${act.formula})`]),
      answer: ans,
      explain: `Elementweise heißt: jeder Eintrag einzeln durch φ. ${act.short}(${fmt(zs[k - 1])}) = <b>${fmt(ans)}</b>. Der ganze Vektor: a⁽¹⁾ = (${zs.map(v => fmt(U.round(act.fn(v), 3))).join(' | ')}).`,
    };
  }

  // ============================================================
  // KATEGORIE 6: Forward Pass im Python-Code
  // ============================================================
  function genCode() {
    const v = rnd(0, 2);
    if (v === 0) {
      const x = [niceX(), niceX(), niceX()], w = [niceW(), niceW(), niceW()], b = U.biasVal();
      const z = U.round(dotB(w, x, b), 3), a = Math.max(0, z);
      const ask = U.chance(0.5) ? 'z' : 'a';
      const code = `<div class="codebox"><span class="c"># Eingaben</span>
x1, x2, x3 = ${fmt(x[0])}, ${fmt(x[1])}, ${fmt(x[2])}

<span class="c"># Gewichte und Bias, Neuron 1, Schicht 1</span>
w11_1, w12_1, w13_1 = ${fmt(w[0])}, ${fmt(w[1])}, ${fmt(w[2])}
b1_1 = ${fmt(b)}

z1_1 = w11_1*x1 + w12_1*x2 + w13_1*x3 + b1_1
a1_1 = max(0, z1_1)</div>`.replace(/,/g, ',').replace(/(\d),(\d)/g, '$1.$2');
      return {
        type: 'numeric', label: ask === 'z' ? 'z1_1' : 'a1_1',
        prompt: `Dieses Python-Programm berechnet ein Neuron (wie in der Bildungscampus-Aufgabe). Welchen Wert gibt <b>${ask === 'z' ? 'z1_1' : 'a1_1'}</b> aus?`,
        figure: code,
        answer: ask === 'z' ? z : a,
        explain: `z1_1 = ${rowCalc(w, x, b)} = <b>${fmt(z)}</b>. a1_1 = max(0, ${fmt(z)}) = <b>${fmt(a)}</b> – <span class="mono">max(0, z)</span> ist die ReLU-Funktion.`,
      };
    }
    if (v === 1) return { type: 'choice',
      prompt: `Im Forward-Pass-Code steht: <span class="formula">a1_1 = max(0, z1_1)</span>. Welche Aktivierungsfunktion ist das?`,
      options: opts('ReLU – negative Werte werden 0, positive bleiben erhalten', ['Sigmoid', 'Schwellenfunktion (gibt nur 0 oder 1)', 'Identität']),
      explain: 'max(0, z) = ReLU. Die Schwellenfunktion wäre z.B. <span class="mono">1 if z > 0 else 0</span>, die Identität einfach <span class="mono">a = z</span>.' };
    return { type: 'choice',
      prompt: `Welche Python-Zeile berechnet die <b>Voraktivierung</b> von Neuron 1 (drei Eingaben)?`,
      options: opts('<span class="mono">z = w11*x1 + w12*x2 + w13*x3 + b1</span>',
        ['<span class="mono">z = w11 + x1 * w12 + x2 * w13 + x3 * b1</span>', '<span class="mono">z = max(0, x1 + x2 + x3)</span>', '<span class="mono">z = (x1 + x2 + x3) * (w11 + w12 + w13)</span>']),
      explain: 'Jede Eingabe mal ihr Gewicht, alles addieren, Bias dazu – exakt wie in der Formel z = Σ wᵢxᵢ + b.' };
  }

  // ============================================================
  // KATEGORIE 7: Ganze Schicht in Matrixform (multi)
  // ============================================================
  function genLayer() {
    const Wm = [[niceW(), niceW()], [niceW(), niceW()]];
    const a = [niceX(), niceX()], b = [U.biasVal(), U.biasVal()];
    const z1 = U.round(dotB(Wm[0], a, b[0]), 3), z2 = U.round(dotB(Wm[1], a, b[1]), 3);
    return {
      type: 'multi',
      prompt: `Berechne den kompletten Vektor <b>z⁽¹⁾ = W⁽¹⁾a⁽⁰⁾ + b⁽¹⁾</b> – Zeile für Zeile.`,
      figure: mxrow([zl(1), '=', mtx(Wm.map(r => r.map(fmt))), '·', col(a.map(fmt)), '+', col(b.map(fmt))]),
      steps: [
        { label: 'Zeile 1: z₁ (Gewichte der 1. Zeile · a, plus b₁)', varLabel: 'z₁', answer: z1, explain: `${rowCalc(Wm[0], a, b[0])} = ${fmt(z1)}` },
        { label: 'Zeile 2: z₂ (Gewichte der 2. Zeile · a, plus b₂)', varLabel: 'z₂', answer: z2, explain: `${rowCalc(Wm[1], a, b[1])} = ${fmt(z2)}` },
      ],
      explain: `Ergebnis: z⁽¹⁾ = (${fmt(z1)} | ${fmt(z2)}). Matrix·Vektor = jede Zeile einzeln „Neuron rechnen“ – genau dieselbe Rechnung wie vorher, nur kompakt notiert.`,
    };
  }

  // ============================================================
  // KATEGORIE 8: Funktion → Gewichte (y = m·x + c)
  // ============================================================
  function genFn2W() {
    const m = pick([2, 3, -1, 0.5, 4]), c = pick([0, 1, 2, 3, -2]);
    const n = pick([2, 3]);
    if (U.chance(0.4)) {
      const cNZ = (c === 0 || c === m) ? pick([1, 2, 3, -2].filter(v => v !== m)) : c; // c=0 oder c=m würde Duplikat-Optionen erzeugen
      const wrong1 = mtx([[fmt(m), fmt(cNZ)], [fmt(cNZ), fmt(m)]]);
      const correct = mtx([[fmt(m), '0'], ['0', fmt(m)]]);
      const wrong2 = mtx([[fmt(m), fmt(m)], [fmt(m), fmt(m)]]);
      const wrong3 = mtx([['0', fmt(m)], [fmt(m), '0']]);
      return { type: 'choice',
        prompt: `Ein Netz mit 2 Eingaben, 2 Ausgaben, φ = Identität soll <b>elementweise ŷᵢ = ${fmt(m)}·xᵢ + ${fmt(cNZ)}</b> berechnen. Wie sieht die Gewichtsmatrix W⁽¹⁾ aus?`,
        options: opts(correct, [wrong1, wrong2, wrong3]),
        explain: `Jede Ausgabe hängt nur von der Eingabe an derselben Position ab → nur die <b>Hauptdiagonale</b> ist mit ${fmt(m)} besetzt. Das + ${fmt(cNZ)} kommt in den Bias-Vektor b = (${fmt(cNZ)} | ${fmt(cNZ)}).` };
    }
    return {
      type: 'multi',
      prompt: `Ein Netz mit ${n} Eingaben und ${n} Ausgaben (φ = Identität) soll die Funktion <b>ŷᵢ = ${fmt(m)}·xᵢ ${c >= 0 ? '+ ' + fmt(c) : '− ' + fmt(-c)}</b> abbilden (jede Ausgabe aus der Eingabe an derselben Position). Bestimme die Parameter für Neuron 1.`,
      steps: [
        { label: 'w₁₁ (Gewicht von x₁ zu Neuron 1)', varLabel: 'w₁₁', answer: m, explain: `x₁ wird mit ${fmt(m)} multipliziert → w₁₁ = ${fmt(m)}` },
        { label: 'w₁₂ (Gewicht von x₂ zu Neuron 1)', varLabel: 'w₁₂', answer: 0, explain: 'x₂ darf ŷ₁ nicht beeinflussen → w₁₂ = 0 (deshalb Diagonalmatrix!)' },
        { label: 'b₁ (Bias von Neuron 1)', varLabel: 'b₁', answer: c, explain: `Das „${c >= 0 ? '+' : '−'}${fmt(Math.abs(c))}“ ist der Bias → b₁ = ${fmt(c)}` },
      ],
      explain: `ŷ₁ = w₁₁x₁ + w₁₂x₂ + b₁ soll gleich ${fmt(m)}x₁ ${c >= 0 ? '+' : '−'} ${fmt(Math.abs(c))} sein → w₁₁ = ${fmt(m)}, alle anderen Gewichte 0, b₁ = ${fmt(c)}. Die Werte in W und b bestimmen, welche Funktion das Netz berechnet!`,
    };
  }

  // ============================================================
  // KATEGORIE 9: Zusammenhang aus Zahlenpaaren erkennen (wie Folie)
  // ============================================================
  function genPattern() {
    const m = pick([2, 2, 3, -1, 0.5]), c = pick([0, 1, 3, -2, 5]);
    const xs = shuffle([0, 1, 2, 3, 4, 5, -1, 6]).slice(0, 3).sort((p, q) => p - q);
    const pairs = xs.map(x => [fmt(x), fmt(m * x + c)]);
    const f = (mm, cc) => `ŷ = ${fmt(mm)}·x ${cc >= 0 ? '+ ' + fmt(cc) : '− ' + fmt(-cc)}`;
    const wrongs = new Set([f(m + 1, c), f(m, c + 1), f(c, m)].filter(x => x !== f(m, c)));
    return { type: 'choice',
      prompt: `Eine Schicht (φ = Identität) macht aus jedem Eingabewert den Ausgabewert an derselben Position. Welche <b>Funktion</b> steckt dahinter?`,
      figure: `<div class="mxrow">${F.table(['Eingabe x', 'Ausgabe ŷ'], pairs)}</div>`,
      options: opts(f(m, c), [...wrongs].slice(0, 3)),
      explain: `Prüfen mit einem Paar: x = ${fmt(xs[1])} → ${fmt(m)}·${fmt(xs[1])} ${c >= 0 ? '+' : '−'} ${fmt(Math.abs(c))} = ${fmt(m * xs[1] + c)} ✓. Genau wie auf der Folie (dort ŷ = 2x + 3). Das Netz bildet diese Funktion über w = ${fmt(m)} (Diagonale) und b = ${fmt(c)} ab.`,
    };
  }

  // ============================================================
  // BOSS: Komplette Schicht in Matrixform mit ReLU
  // ============================================================
  function genBoss() {
    const Wm = [[niceW(), niceW(), niceW()], [niceW(), niceW(), niceW()]];
    const x = [niceX(), niceX(), niceX()], b = [U.biasVal(), U.biasVal()];
    const z1 = U.round(dotB(Wm[0], x, b[0]), 3), z2 = U.round(dotB(Wm[1], x, b[1]), 3);
    const a1 = Math.max(0, z1), a2 = Math.max(0, z2);
    return {
      type: 'multi',
      prompt: `<b>Boss: Schicht in Matrixform.</b> Berechne <b>z⁽¹⁾ = W⁽¹⁾x + b⁽¹⁾</b> und dann <b>a⁽¹⁾ = ReLU(z⁽¹⁾)</b> elementweise.`,
      figure: mxrow([zl(1), '=', mtx(Wm.map(r => r.map(fmt))), '·', col(x.map(fmt)), '+', col(b.map(fmt))]),
      given: ['φ = ReLU: φ(z) = max(0, z), elementweise auf jeden Eintrag'],
      steps: [
        { label: 'z₁ (Zeile 1 · x + b₁)', varLabel: 'z₁', answer: z1, explain: `${rowCalc(Wm[0], x, b[0])} = ${fmt(z1)}` },
        { label: 'z₂ (Zeile 2 · x + b₂)', varLabel: 'z₂', answer: z2, explain: `${rowCalc(Wm[1], x, b[1])} = ${fmt(z2)}` },
        { label: 'a₁ = ReLU(z₁)', varLabel: 'a₁', answer: a1, explain: `max(0, ${fmt(z1)}) = ${fmt(a1)}` },
        { label: 'a₂ = ReLU(z₂)', varLabel: 'a₂', answer: a2, explain: `max(0, ${fmt(z2)}) = ${fmt(a2)}` },
      ],
      explain: `z⁽¹⁾ = (${fmt(z1)} | ${fmt(z2)}) → a⁽¹⁾ = (${fmt(a1)} | ${fmt(a2)}). Eine Matrixzeile pro Neuron, dann φ elementweise – der komplette Forward Pass einer Schicht in zwei Formeln: z⁽ˡ⁾ = W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾ und a⁽ˡ⁾ = φ(z⁽ˡ⁾).`,
    };
  }

  // ============================================================
  // REGISTRIERUNG
  // ============================================================
  BrainForge.registerTopic({
    id: 'dl2',
    title: 'Deep Learning II – Matrix & Forward Pass',
    subtitle: 'FSTI-107 · Vektoren, Matrizen, z = Wa + b, Forward Pass im Code',
    description: 'Foliensatz 2: Skalar/Vektor/Matrix-Notation, die Schichtformel <b>z</b>⁽ˡ⁾ = <b>W</b>⁽ˡ⁾<b>a</b>⁽ˡ⁻¹⁾ + <b>b</b>⁽ˡ⁾, Dimensionen, Forward Pass in Python und wie W und b bestimmen, welche Funktion das Netz berechnet.',
    emoji: '🧮',
    color: '#7c5cff',
    categories: [
      { id: 'mx-notation', title: 'Schreibweise', desc: 'Skalar, Vektor, Matrix erkennen', tier: 1, generate: genNotation },
      { id: 'mx-konzept', title: 'Forward Pass verstehen', desc: 'Schicht als Funktion, W & b', tier: 1, generate: genConcept },
      { id: 'mx-vecact', title: 'Elementweise Aktivierung', desc: 'φ auf einen Vektor anwenden', tier: 1, weight: 1.2, generate: genVecAct },
      { id: 'mx-dimension', title: 'Dimensionen', desc: 'Wie groß sind W, b, z?', tier: 2, generate: genDim },
      { id: 'mx-zeile', title: 'Matrixzeile rechnen', desc: 'z_j aus W·a + b bestimmen', tier: 2, weight: 1.3, generate: genRow },
      { id: 'mx-code', title: 'Forward Pass im Code', desc: 'Python-Programm lesen & rechnen', tier: 2, generate: genCode },
      { id: 'mx-schicht', title: 'Ganze Schicht rechnen', desc: 'z⁽¹⁾ = W a + b komplett', tier: 3, weight: 1.3, generate: genLayer },
      { id: 'mx-muster', title: 'Zusammenhang erkennen', desc: 'Aus x/ŷ-Paaren die Funktion ablesen', tier: 3, generate: genPattern },
      { id: 'mx-funktion', title: 'Funktion → Gewichte', desc: 'y = mx + c in W und b übersetzen', tier: 3, generate: genFn2W },
      { id: 'boss-matrix', title: 'Boss: Schicht komplett', desc: 'W·x + b und ReLU, 4 Schritte', tier: 3, boss: true, generate: genBoss },
    ],
  });
})();
