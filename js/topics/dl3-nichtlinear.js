/* ============ Thema: Deep Learning III – Lineare Netze & Nichtlinearität ============
   FSTI-107, Foliensatz 3: Lineare Funktion durch 2 Punkte, eine Funktion pro Neuron
   (Diagonalmatrix), Off-Diagonal-Einträge, zwei lineare Schichten bleiben linear,
   warum Nichtlinearität (φ als Schlüssel), warum nicht φ(z)=z², ReLU-Knickstellen,
   Transferaufgabe (Funktionen → W und b → ŷ = Wx + b). */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt } = U;
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];
  const mtx = (rows) => `<table class="mtx"><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const col = (arr) => mtx(arr.map(v => [v]));
  const mxrow = (parts) => `<div class="mxrow">${parts.join(' ')}</div>`;
  // Funktionsterm f(x) = m·x + c hübsch formatieren
  const lin = (m, c, xName = 'x') => {
    let s = m === 1 ? xName : m === -1 ? '−' + xName : `${fmt(m)}·${xName}`;
    if (c > 0) s += ` + ${fmt(c)}`; else if (c < 0) s += ` − ${fmt(-c)}`;
    return s;
  };

  // ============================================================
  // KATEGORIE 1: Lineare Funktion durch 2 Punkte
  // ============================================================
  function genLine2P() {
    const m = pick([1, 2, 3, -1, -2, 0.5, 1.5]);
    const c = pick([-3, -2, -1, 0, 1, 2, 3, 4]);
    const x1 = rnd(-2, 2), x2 = x1 + pick([2, 2, 4]);
    const y1 = U.round(m * x1 + c, 3), y2 = U.round(m * x2 + c, 3);
    return {
      type: 'multi',
      prompt: `Welche lineare Funktion <b>y = m·x + c</b> verläuft durch die Punkte <b>P1 = (${fmt(x1)} | ${fmt(y1)})</b> und <b>P2 = (${fmt(x2)} | ${fmt(y2)})</b>? (Wie auf der Folie: P1 = (2|1), P2 = (6|7) → y = 1,5x − 2)`,
      steps: [
        { label: 'Steigung m = (y₂ − y₁) / (x₂ − x₁)', varLabel: 'm', answer: m, explain: `(${fmt(y2)} − ${fmt(y1)}) / (${fmt(x2)} − ${fmt(x1)}) = ${fmt(y2 - y1)} / ${fmt(x2 - x1)} = ${fmt(m)}` },
        { label: 'Achsenabschnitt c (m und einen Punkt einsetzen)', varLabel: 'c', answer: c, explain: `${fmt(y1)} = ${fmt(m)}·${fmt(x1)} + c → c = ${fmt(c)}` },
      ],
      explain: `<span class="formula">y = ${lin(m, c)}</span>. Probe mit P2: ${fmt(m)}·${fmt(x2)} ${c >= 0 ? '+' : '−'} ${fmt(Math.abs(c))} = ${fmt(y2)} ✓. Genau so eine Funktion kann ein Neuron mit Gewicht m und Bias c abbilden.`,
    };
  }

  // ============================================================
  // KATEGORIE 2: Konzepte Nichtlinearität
  // ============================================================
  const CONCEPTS = [
    { q: 'Zwei Schichten mit <b>linearer</b> Aktivierungsfunktion werden hintereinandergeschaltet. Was kann das Gesamtnetz darstellen?',
      c: 'Wieder nur eine lineare Funktion – das Hintereinanderschalten linearer Funktionen bleibt linear.',
      w: ['Beliebige Funktionen, auch y = x².', 'Nur konstante Funktionen.', 'Nur Funktionen mit positiver Steigung.'],
      e: 'Einsetzen ergibt ŷ = w₂(w₁x + b₁) + b₂ = (w₂w₁)x + (w₂b₁ + b₂) – wieder die Form wx + c. Egal wie viele lineare Schichten: ohne Nichtlinearität bleibt alles linear.' },
    { q: 'Kann die Schicht <b>ŷ = Wa + b</b> (ohne Aktivierungsfunktion) die Funktion <b>y = x²</b> abbilden?',
      c: 'Nein – Wa + b ist ein linearer Zusammenhang, x² ist nichtlinear.',
      w: ['Ja, mit genügend großen Gewichten.', 'Ja, wenn der Bias negativ ist.', 'Ja, mit einer Diagonalmatrix.'],
      e: 'Was kann unsere Schicht berechnen? ŷ = Wa + b – das ist linear. Für x² brauchen wir eine nichtlineare Aktivierungsfunktion.' },
    { q: 'Was muss <b>zwischen den linearen Berechnungen</b> passieren, damit das Netz nichtlineare Zusammenhänge darstellen kann?',
      c: 'Nichtlineare Aktivierungsfunktionen müssen verwendet werden.',
      w: ['Mehr Neuronen pro Schicht.', 'Größere Bias-Werte.', 'Mehr Trainingsdaten.'],
      e: 'Mehr lineare Schichten helfen nicht – erst die Nichtlinearität in φ macht nichtlineare Funktionen möglich.' },
    { q: 'Welche <b>Erkenntnis</b> über die Aktivierungsfunktion liefert das Kapitel?',
      c: 'Sie ist nicht bloß ein Zusatz – sie ist das Element, das dem Netz überhaupt ermöglicht, nichtlineare Zusammenhänge darzustellen.',
      w: ['Sie dient nur dazu, Werte zu runden.', 'Sie ist nur beim Training wichtig, danach kann man sie weglassen.', 'Sie verhindert, dass Gewichte negativ werden.'],
      e: 'Merksatz von der Folie: Die Aktivierungsfunktion ist DAS Element für Nichtlinearität – ohne sie bleibt jedes noch so tiefe Netz linear.' },
    { q: 'Problem 1 einer quadratischen Aktivierung <b>φ(z) = z²</b>:',
      c: 'Werte wachsen stark an (2→4, 5→25, 10→100) und schaukeln sich über mehrere Schichten auf – numerisch ungünstig, besonders beim Training.',
      w: ['Alle Werte werden kleiner und verschwinden.', 'Die Ausgabe ist immer negativ.', 'Sie kann nur ganze Zahlen verarbeiten.'],
      e: 'Schon nach einer Schicht: 10 → 100. Mehrere solcher Schichten hintereinander → Explosion der Werte.' },
    { q: 'Problem 2 einer quadratischen Aktivierung <b>φ(z) = z²</b>:',
      c: 'Positive und negative Werte werden ununterscheidbar: (−2)² = 2² = 4 – die Vorzeichen-Information geht verloren.',
      w: ['Negative Werte werden noch negativer.', 'Die Funktion ist nicht berechenbar.', 'Der Bias wird ignoriert.'],
      e: 'Das Neuron verliert die Information über das Vorzeichen von z.' },
    { q: 'Welche nichtlinearen Aktivierungsfunktionen sind laut Skript <b>etabliert</b>?',
      c: 'ReLU, Sigmoid und Tanh (je nach Architektur auch andere) – wir verwenden hauptsächlich ReLU.',
      w: ['Quadrat, Kubik und Wurzel.', 'Sinus, Cosinus und Tangens.', 'Nur die Identitätsfunktion.'],
      e: 'Es gibt nicht DIE EINE optimale nichtlineare Funktion. Etabliert: ReLU, Sigmoid, Tanh – im Kurs hauptsächlich ReLU.' },
    { q: 'ReLU ist selbst <b>stückweise linear</b>. Wie kann ein ReLU-Netz trotzdem z.B. einen quadratischen Zusammenhang annähern?',
      c: 'Mehrere Neuronen mit unterschiedlichen Gewichten und Bias-Werten erzeugen unterschiedliche „Knickstellen“ – mehr Knicke = bessere Annäherung.',
      w: ['Gar nicht, ReLU-Netze können nur Geraden darstellen.', 'Indem man ReLU durch die Identität ersetzt.', 'Indem alle Neuronen denselben Bias bekommen.'],
      e: 'Jedes ReLU-Neuron knickt an einer anderen Stelle (bestimmt durch Gewicht und Bias). Viele Knicke ergeben zusammen eine Kurve.' },
    { q: 'Eine Gewichtsmatrix ist <b>diagonal</b>, aber jedes Neuron berechnet eine andere Funktion. Wie passt das zusammen?',
      c: 'Diagonal heißt nicht „gleiche Funktion“, sondern: Jede Ausgabe hängt nur vom zugehörigen Eingang ab – die Diagonalwerte und Biase dürfen verschieden sein.',
      w: ['Gar nicht – diagonale Matrizen erzwingen überall dieselbe Funktion.', 'Diagonal bedeutet, dass alle Gewichte gleich 1 sind.', 'Das geht nur ohne Bias.'],
      e: 'W = diag(2, −1, 1, 3, −2) mit b = (1|4|2|−1|5): jedes Neuron hat seine eigene Funktion fⱼ(x) = wⱼⱼ·x + bⱼ, aber jede Ausgabe nutzt nur „ihren“ Eingang.' },
    { q: 'Wir suchen EINE Funktion, die für alle Vektor-Positionen gilt. Was haben wir dabei <b>stillschweigend angenommen</b>?',
      c: 'Dass für alle Positionen derselbe Zusammenhang gilt – das muss aber nicht so sein.',
      w: ['Dass alle Eingaben positiv sind.', 'Dass das Netz genau zwei Schichten hat.', 'Dass der Bias null ist.'],
      e: 'Wenn jede Position ihren eigenen Zusammenhang hat, bekommt jedes Neuron eigene Werte auf der Diagonalen und im Bias-Vektor.' },
    { q: 'Mit <b>φ(z) = z²</b>, W = Einheitsmatrix und b = 0: Was berechnet die Schicht?',
      c: 'ŷ = x² (elementweise) – für diesen Spezialfall bräuchte man nicht einmal zwei Schichten.',
      w: ['ŷ = 2x', 'ŷ = 0 für alle Eingaben', 'ŷ = x, das Quadrat kürzt sich weg'],
      e: 'z = 1·x + 0 = x, dann a = φ(z) = z² = x². Die Nichtlinearität steckt komplett in φ.' },
  ];
  const genConcept = () => { const q = pick(CONCEPTS); return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e }; };

  // ============================================================
  // KATEGORIE 3: Funktion pro Neuron aus Wertepaaren
  // ============================================================
  function genPerNeuron() {
    const m = pick([1, 2, 3, -1, -2, 0.5]), c = pick([-2, -1, 0, 1, 2, 3, 4]);
    const j = rnd(1, 5);
    const xs = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
    const pairs = xs.map(x => `(${fmt(x)}, ${fmt(m * x + c)})`).join(', ');
    if (U.chance(0.5)) {
      const f = (mm, cc) => `f<sub>${j}</sub>(x) = ${lin(mm, cc)}`;
      const cand = [f(m + 1, c), f(m, c + 1), f(c, m), f(-m, c), f(m + 2, c - 1), f(m, c - 1)];
      const wrongs = [...new Set(cand)].filter(x => x !== f(m, c)).slice(0, 3);
      return { type: 'choice',
        prompt: `Neuron ${j} zeigt über drei Beispiele hinweg diese (Eingabe, Ausgabe)-Paare: <b>${pairs}</b>. Welche Funktion berechnet es? (Wie auf der Folie: (0,1), (2,5), (4,9) → f(x) = 2x + 1)`,
        options: opts(f(m, c), wrongs),
        explain: `Steigung aus zwei Paaren, dann c ablesen: m = ${fmt(m)}, c = ${fmt(c)} → f<sub>${j}</sub>(x) = ${lin(m, c)}. Probe: f(${fmt(xs[2])}) = ${fmt(m * xs[2] + c)} ✓` };
    }
    return {
      type: 'multi',
      prompt: `Neuron ${j} zeigt über drei Beispiele hinweg diese (Eingabe, Ausgabe)-Paare: <b>${pairs}</b>. Bestimme seine Funktion f<sub>${j}</sub>(x) = m·x + c.`,
      steps: [
        { label: 'Steigung m', varLabel: 'm', answer: m, explain: `(${fmt(m * xs[1] + c)} − ${fmt(m * xs[0] + c)}) / (${fmt(xs[1])} − ${fmt(xs[0])}) = ${fmt(m)}` },
        { label: 'Achsenabschnitt c', varLabel: 'c', answer: c, explain: `${fmt(m * xs[0] + c)} = ${fmt(m)}·${fmt(xs[0])} + c → c = ${fmt(c)}` },
      ],
      explain: `f<sub>${j}</sub>(x) = ${lin(m, c)}. Im Netz: w<sub>${j}${j}</sub> = ${fmt(m)} (Diagonale) und b<sub>${j}</sub> = ${fmt(c)}.`,
    };
  }

  // ============================================================
  // KATEGORIE 4: Diagonalmatrix lesen (W & b → Funktion, und zurück)
  // ============================================================
  function genDiagRead() {
    const n = 3;
    const d = Array.from({ length: n }, () => pick([2, -1, 1, 3, -2, 0.5]));
    const b = Array.from({ length: n }, () => pick([-2, -1, 0, 1, 2, 4]));
    const Wm = d.map((v, i) => d.map((_, k) => (i === k ? fmt(v) : '0')));
    const j = rnd(1, n);
    const fig = mxrow([`<b>W</b><sup>(1)</sup> =`, mtx(Wm), `<b>b</b><sup>(1)</sup> =`, col(b.map(fmt))]);
    if (U.chance(0.5)) {
      const f = (mm, cc) => `ŷ<sub>${j}</sub> = ${lin(mm, cc, 'x' + '₁₂₃'[j - 1])}`;
      const correct = f(d[j - 1], b[j - 1]);
      const cand = [f(d[j % n], b[j - 1]), f(d[j - 1], b[j % n]), f(-d[j - 1], b[j - 1]), f(d[j - 1] + 1, b[j - 1]), f(d[j - 1], b[j - 1] + 1), f(d[j - 1] + 2, b[j - 1] - 1)];
      const wrongs = [...new Set(cand)].filter(x => x !== correct).slice(0, 3);
      return { type: 'choice',
        prompt: `Aktivierung = Identität. Welche Funktion berechnet <b>Neuron ${j}</b>?`, figure: fig,
        options: opts(correct, wrongs),
        explain: `Zeile ${j} hat nur auf der Diagonalen einen Wert: ŷ<sub>${j}</sub> = w<sub>${j}${j}</sub>·x<sub>${j}</sub> + b<sub>${j}</sub> = ${lin(d[j - 1], b[j - 1], 'x' + '₁₂₃'[j - 1])}.` };
    }
    const ask = U.chance(0.5) ? 'w' : 'b';
    return { type: 'numeric',
      label: ask === 'w' ? `w<sub>${j}${j}</sub><sup>(1)</sup>` : `b<sub>${j}</sub><sup>(1)</sup>`,
      prompt: `Neuron ${j} soll die Funktion <b>ŷ<sub>${j}</sub> = ${lin(d[j - 1], b[j - 1], 'x<sub>' + j + '</sub>')}</b> berechnen (φ = Identität, Ausgabe hängt nur von x<sub>${j}</sub> ab). Welchen Wert braucht <b>${ask === 'w' ? 'w<sub>' + j + j + '</sub>' : 'b<sub>' + j + '</sub>'}</b>?`,
      answer: ask === 'w' ? d[j - 1] : b[j - 1],
      explain: `ŷ<sub>${j}</sub> = w<sub>${j}${j}</sub>·x<sub>${j}</sub> + b<sub>${j}</sub> → w<sub>${j}${j}</sub> = ${fmt(d[j - 1])}, b<sub>${j}</sub> = ${fmt(b[j - 1])}. Alle anderen Gewichte der Zeile sind 0.`,
    };
  }

  // ============================================================
  // KATEGORIE 5: Off-Diagonal-Einträge verstehen
  // ============================================================
  function genOffdiag() {
    const n = 3;
    const d = Array.from({ length: n }, () => pick([2, -1, 1, 3, -2]));
    const r = rnd(1, n); let cc = rnd(1, n); if (cc === r) cc = (cc % n) + 1;
    const v = pick([1, 2, -1, 0.5].filter(x => x !== d[r - 1]));
    const b = Array.from({ length: n }, () => pick([-1, 0, 1, 2]));
    const Wm = d.map((dv, i) => d.map((_, k) => (i === k ? fmt(dv) : (i === r - 1 && k === cc - 1 ? `<b style="color:var(--warn)">${fmt(v)}</b>` : '0'))));
    const fig = mxrow([`<b>W</b><sup>(1)</sup> =`, mtx(Wm), `<b>b</b><sup>(1)</sup> =`, col(b.map(fmt))]);
    if (U.chance(0.5)) return { type: 'choice',
      prompt: `Was bedeutet der markierte Eintrag <b>w<sub>${r}${cc}</sub> = ${fmt(v)}</b> außerhalb der Diagonalen?`, figure: fig,
      options: opts(`Eingabe x<sub>${cc}</sub> wirkt jetzt zusätzlich auf Ausgabe ŷ<sub>${r}</sub>.`,
        [`Eingabe x<sub>${r}</sub> wirkt jetzt zusätzlich auf Ausgabe ŷ<sub>${cc}</sub>.`, `Der Bias von Neuron ${r} wird verdoppelt.`, `Neuron ${cc} wird komplett abgeschaltet.`]),
      explain: `w<sub>ji</sub>: j = Ziel-Neuron (Zeile ${r}), i = Herkunft (Spalte ${cc}). Also fließt x<sub>${cc}</sub> in ŷ<sub>${r}</sub> ein – wie auf der Folie: „Jetzt ist auch Eingabe 2 an Ausgabe 1 beteiligt!“` };
    const correct = `ŷ<sub>${r}</sub> = ${lin(d[r - 1], 0, 'x<sub>' + r + '</sub>').replace(/ [+−] 0$/, '')} ${v >= 0 ? '+' : '−'} ${Math.abs(v) === 1 ? '' : fmt(Math.abs(v)) + '·'}x<sub>${cc}</sub> ${b[r - 1] >= 0 ? '+ ' + fmt(b[r - 1]) : '− ' + fmt(-b[r - 1])}`;
    const w1 = `ŷ<sub>${r}</sub> = ${lin(d[r - 1], b[r - 1], 'x<sub>' + r + '</sub>')}`;
    const w2 = `ŷ<sub>${cc}</sub> = ${lin(d[cc - 1], b[cc - 1], 'x<sub>' + cc + '</sub>')} ${v >= 0 ? '+' : '−'} ${Math.abs(v) === 1 ? '' : fmt(Math.abs(v)) + '·'}x<sub>${r}</sub>`;
    const w3 = `ŷ<sub>${r}</sub> = ${fmt(v)}·x<sub>${r}</sub> ${b[r - 1] >= 0 ? '+ ' + fmt(b[r - 1]) : '− ' + fmt(-b[r - 1])}`;
    return { type: 'choice',
      prompt: `φ = Identität. Wie lautet die Formel für <b>ŷ<sub>${r}</sub></b> (Zeile ${r})?`, figure: fig,
      options: opts(correct, [w1, w2, w3]),
      explain: `Zeile ${r} hat zwei Einträge ≠ 0: die Diagonale (w<sub>${r}${r}</sub> = ${fmt(d[r - 1])} für x<sub>${r}</sub>) und w<sub>${r}${cc}</sub> = ${fmt(v)} für x<sub>${cc}</sub>. Dazu der Bias b<sub>${r}</sub> = ${fmt(b[r - 1])}.` };
  }

  // ============================================================
  // KATEGORIE 6: Zwei lineare Schichten zusammenfassen
  // ============================================================
  function genLinChain() {
    const w1 = pick([2, 3, -1, -2, 0.5]), b1 = pick([-2, -1, 1, 2, 3]);
    const w2 = pick([2, -1, 3, 0.5, -2]), b2 = pick([-1, 0, 1, 2]);
    const w = U.round(w2 * w1, 3), c = U.round(w2 * b1 + b2, 3);
    return {
      type: 'multi',
      prompt: `Zwei Schichten mit <b>linearer</b> Aktivierung (je 1 Neuron):<br>Schicht 1: a = ${lin(w1, b1)} · Schicht 2: ŷ = ${lin(w2, b2, 'a')}.<br>Setze ein und fasse zur Gesamtfunktion <b>ŷ = w·x + c</b> zusammen.`,
      steps: [
        { label: 'Gesamt-Steigung w = w₂ · w₁', varLabel: 'w', answer: w, explain: `${fmt(w2)} · ${fmt(w1)} = ${fmt(w)}` },
        { label: 'Gesamt-Konstante c = w₂ · b₁ + b₂', varLabel: 'c', answer: c, explain: `${fmt(w2)}·${fmt(b1)} + ${fmt(b2)} = ${fmt(c)}` },
      ],
      explain: `ŷ = w₂(w₁x + b₁) + b₂ = (w₂w₁)x + (w₂b₁ + b₂) = <b>${lin(w, c)}</b> – wieder linear! Genau die Folien-Erkenntnis: lineare Schichten hintereinander bleiben linear. Erst nichtlineare Aktivierungsfunktionen ändern das.`,
    };
  }

  // ============================================================
  // KATEGORIE 7: Quadratische Aktivierung φ(z) = z²
  // ============================================================
  function genSquare() {
    const v = rnd(0, 2);
    if (v === 0) {
      const x = pick([2, 3, -2, -3, 4, 5, -4, 0.5]);
      return { type: 'numeric', label: 'ŷ',
        prompt: `Ein Neuron mit <b>w = 1, b = 0</b> und Aktivierungsfunktion <b>φ(z) = z²</b> bekommt die Eingabe x = ${fmt(x)}. Was ist die Ausgabe ŷ?`,
        answer: x * x,
        explain: `z = 1·${fmt(x)} + 0 = ${fmt(x)}, dann ŷ = φ(z) = (${fmt(x)})² = <b>${fmt(x * x)}</b>.${x < 0 ? ` Beachte: (${fmt(x)})² = ${fmt(-x)}² = ${fmt(x * x)} – das Vorzeichen geht verloren!` : ''}` };
    }
    if (v === 1) {
      const x = pick([2, 3, -2]);
      const y = Math.pow(x * x, 2);
      return { type: 'numeric', label: 'ŷ',
        prompt: `<b>Zwei</b> Schichten mit φ(z) = z² hintereinander (je w = 1, b = 0). Eingabe x = ${fmt(x)}. Was kommt am Ende heraus?`,
        answer: y,
        explain: `Schicht 1: ${fmt(x)} → ${fmt(x * x)}. Schicht 2: ${fmt(x * x)} → <b>${fmt(y)}</b>. Genau das Aufschaukel-Problem von der Folie: Werte explodieren über mehrere Schichten (10 → 100 → 10.000) – numerisch ungünstig fürs Training.` };
    }
    const a = pick([2, 3, 4, 5]);
    return { type: 'choice',
      prompt: `φ(z) = z². Welche <b>zwei verschiedenen</b> Eingaben erzeugen dieselbe Ausgabe ${fmt(a * a)}?`,
      options: opts(`z = ${fmt(a)} und z = ${fmt(-a)}`, [`z = ${fmt(a)} und z = ${fmt(a * a)}`, `z = ${fmt(a * a)} und z = ${fmt(-a * a)}`, `Es gibt keine zwei solchen Eingaben.`]),
      explain: `(${fmt(a)})² = (${fmt(-a)})² = ${fmt(a * a)}. Positive und negative Werte werden ununterscheidbar – das Neuron verliert die Vorzeichen-Information. Einer der Gründe, warum man nicht z² als Aktivierung nimmt.` };
  }

  // ============================================================
  // KATEGORIE 8: Funktion mit zwei Eingaben → Matrixzeile (Transfer)
  // ============================================================
  function genFnRow() {
    const j = rnd(1, 3);
    const m = pick([2, -1, 1, 3, -2]);            // Koeffizient für x_j
    let other = rnd(1, 3); if (other === j) other = (other % 3) + 1;
    const k = pick([1, -1, 2, -2]);               // Koeffizient für die zweite Eingabe
    const c = pick([-1, 0, 1, 2, 3]);
    const third = [1, 2, 3].find(i => i !== j && i !== other);
    const term = (co, idx) => `${co < 0 ? '− ' : '+ '}${Math.abs(co) === 1 ? '' : fmt(Math.abs(co)) + '·'}x<sub>${idx}</sub>`;
    const fn = `ŷ<sub>${j}</sub> = ${lin(m, 0, 'x<sub>' + j + '</sub>').replace(/ [+−] 0$/, '')} ${term(k, other)}${c !== 0 ? (c > 0 ? ' + ' + fmt(c) : ' − ' + fmt(-c)) : ''}`;
    const wOf = (i) => (i === j ? m : i === other ? k : 0);
    return {
      type: 'multi',
      prompt: `Transferaufgabe: Netz mit 3 Eingaben, 3 Ausgabeneuronen, φ = Identität. Für Neuron ${j} soll gelten: <span class="formula">${fn}</span>. Bestimme die Zeile ${j} von <b>W</b>⁽¹⁾ und den Bias.`,
      steps: [
        { label: `w<sub>${j}1</sub> (Gewicht für x₁)`, varLabel: `w<sub>${j}1</sub>`, answer: wOf(1), explain: `Koeffizient von x₁ in der Funktion: ${fmt(wOf(1))}` },
        { label: `w<sub>${j}2</sub> (Gewicht für x₂)`, varLabel: `w<sub>${j}2</sub>`, answer: wOf(2), explain: `Koeffizient von x₂: ${fmt(wOf(2))}` },
        { label: `w<sub>${j}3</sub> (Gewicht für x₃)`, varLabel: `w<sub>${j}3</sub>`, answer: wOf(3), explain: `Koeffizient von x₃: ${fmt(wOf(3))}` },
        { label: `b<sub>${j}</sub> (Bias)`, varLabel: `b<sub>${j}</sub>`, answer: c, explain: `Die Konstante: ${fmt(c)}` },
      ],
      explain: `Zeile ${j}: (${[1, 2, 3].map(i => fmt(wOf(i))).join(' | ')}), b<sub>${j}</sub> = ${fmt(c)}. Jeder Koeffizient wandert an „seine“ Spalte (x<sub>${third}</sub> kommt nicht vor → Gewicht 0), die Konstante in den Bias – genau wie in der Transferaufgabe der Folien.`,
    };
  }

  // ============================================================
  // BOSS: Transferaufgabe komplett (Funktionen → W, b → ŷ = Wx + b)
  // ============================================================
  function genBoss() {
    // 3 Funktionen: Diagonale immer besetzt, eine Zeile mit Extra-Term
    const d = Array.from({ length: 3 }, () => pick([2, -1, 1, 0.5, -2]));
    const bb = Array.from({ length: 3 }, () => pick([-1, 0, 1, 2, 3]));
    const rExtra = rnd(1, 3); let cExtra = rnd(1, 3); if (cExtra === rExtra) cExtra = (cExtra % 3) + 1;
    const vExtra = pick([1, -1, 2]);
    const x = Array.from({ length: 3 }, () => pick([1, 2, -1, 3, 0]));
    const wOf = (r, c) => (r === c ? d[r - 1] : (r === rExtra && c === cExtra ? vExtra : 0));
    const yh = [1, 2, 3].map(r => U.round([1, 2, 3].reduce((s, c) => s + wOf(r, c) * x[c - 1], 0) + bb[r - 1], 3));
    const term = (co, idx) => co === 0 ? '' : ` ${co < 0 ? '−' : '+'} ${Math.abs(co) === 1 ? '' : fmt(Math.abs(co)) + '·'}x<sub>${idx}</sub>`;
    const fnStr = (r) => {
      let s = `ŷ<sub>${r}</sub> = ${lin(d[r - 1], 0, 'x<sub>' + r + '</sub>').replace(/ [+−] 0$/, '')}`;
      if (r === rExtra) s += term(vExtra, cExtra);
      if (bb[r - 1] !== 0) s += bb[r - 1] > 0 ? ` + ${fmt(bb[r - 1])}` : ` − ${fmt(-bb[r - 1])}`;
      return s;
    };
    return {
      type: 'multi',
      prompt: `<b>Boss: Transferaufgabe.</b> Netz mit 3 Eingaben, 3 Ausgabeneuronen, φ = Identität (ŷ = Wx + b). Gegeben sind die drei Zusammenhänge:<br><span class="formula">${fnStr(1)}</span> <span class="formula">${fnStr(2)}</span> <span class="formula">${fnStr(3)}</span>`,
      figure: mxrow([`Eingabe: <b>x</b> =`, col(x.map(fmt))]),
      steps: [
        { label: `Kontrolle W: Welchen Wert hat w<sub>${rExtra}${cExtra}</sub>?`, varLabel: `w<sub>${rExtra}${cExtra}</sub>`, answer: vExtra, explain: `Koeffizient von x<sub>${cExtra}</sub> in Funktion ${rExtra}: ${fmt(vExtra)} (Off-Diagonale!)` },
        { label: 'Kontrolle b: Welchen Wert hat b₂?', varLabel: 'b₂', answer: bb[1], explain: `Konstante der 2. Funktion: ${fmt(bb[1])}` },
        { label: `ŷ₁ für die gegebene Eingabe berechnen`, varLabel: 'ŷ₁', answer: yh[0], explain: `${fnStr(1).replace(/<[^>]+>/g, '')} mit x = (${x.map(fmt).join('|')}) → ${fmt(yh[0])}` },
        { label: `ŷ₂ berechnen`, varLabel: 'ŷ₂', answer: yh[1], explain: `→ ${fmt(yh[1])}` },
        { label: `ŷ₃ berechnen`, varLabel: 'ŷ₃', answer: yh[2], explain: `→ ${fmt(yh[2])}` },
      ],
      explain: `${mxrow([`<b>W</b>⁽¹⁾ =`, mtx([1, 2, 3].map(r => [1, 2, 3].map(c => fmt(wOf(r, c))))), `<b>b</b>⁽¹⁾ =`, col(bb.map(fmt)), `→ <b>ŷ</b> =`, col(yh.map(fmt))])}Koeffizienten in die Zeilen von W (Diagonale + Extra-Term), Konstanten in b, dann Zeile für Zeile ŷ = Wx + b rechnen – exakt die Transferaufgabe aus dem Skript.`,
    };
  }

  // ============================================================
  // REGISTRIERUNG
  // ============================================================
  BrainForge.registerTopic({
    id: 'dl3',
    intro: "Dieses Kapitel beantwortet eine der wichtigsten Fragen überhaupt: <b>Warum gibt es Aktivierungsfunktionen?</b><br><br><b>Was wird behandelt?</b> Wie man lineare Funktionen aus Punkten bestimmt und in W und b übersetzt (Diagonale, Off-Diagonale) – und dann der entscheidende Aha-Moment: egal wie viele <i>lineare</i> Schichten man stapelt, herauskommt immer wieder eine Gerade. Erst nichtlineare Aktivierungsfunktionen (z.B. ReLU) machen Kurven möglich. Außerdem: warum φ(z) = z² keine gute Idee ist.<br><br><b>Wofür braucht man das?</b> Ohne Nichtlinearität könnte kein Netz der Welt Bilder erkennen oder Sprache verstehen. Das „Warum“ dahinter ist eine beliebte Prüfungsfrage.",
    title: 'Deep Learning III – Linear & Nichtlinear',
    subtitle: 'FSTI-107 · Lineare Funktionen im Netz, Diagonalmatrizen, warum Nichtlinearität',
    description: 'Foliensatz 3: Gerade durch zwei Punkte, eine Funktion pro Neuron (Diagonalmatrix), Off-Diagonal-Einträge, warum zwei lineare Schichten linear bleiben, das Problem mit φ(z) = z², ReLU-Knickstellen und die große Transferaufgabe (Funktionen → W und b → ŷ = Wx + b).',
    emoji: '🎢',
    color: '#ffb347',
    sheet: [
      { id: 'gerade', title: 'Lineare Funktion bestimmen', rows: [
        { f: 'y = m·x + c', d: 'm = Steigung, c = Achsenabschnitt' },
        { f: 'm = (y₂ − y₁) / (x₂ − x₁)', d: 'aus zwei Punkten P₁(x₁|y₁), P₂(x₂|y₂)' },
        { f: 'c = y₁ − m·x₁', d: 'm und einen Punkt einsetzen' },
        { f: 'Im Neuron: w = m (Gewicht), b = c (Bias)', d: 'Funktion aus Wertepaaren ablesen → direkt W und b' },
      ]},
      { id: 'diag', title: 'Diagonal- & Off-Diagonal-Einträge', rows: [
        { f: 'Diagonalmatrix: ŷ<sub>j</sub> = w<sub>jj</sub>·x<sub>j</sub> + b<sub>j</sub>', d: 'jede Ausgabe hängt nur vom Eingang derselben Position ab' },
        { f: 'Diagonal heißt NICHT „gleiche Funktion“', d: 'jedes Neuron darf eigenes w<sub>jj</sub> und b<sub>j</sub> haben' },
        { f: 'w<sub>ji</sub> ≠ 0 neben der Diagonalen: Eingabe i wirkt zusätzlich auf Ausgabe j', d: 'Koeffizienten der Funktion → Zeile j von W, Konstante → b<sub>j</sub>' },
      ]},
      { id: 'lin', title: 'Lineare Schichten verketten', rows: [
        { f: 'ŷ = w₂(w₁x + b₁) + b₂ = (w₂w₁)·x + (w₂b₁ + b₂)', d: 'zwei lineare Schichten ergeben wieder eine lineare Funktion' },
        { f: 'Beliebig viele lineare Schichten bleiben linear/affin', d: 'deshalb kann Wa + b niemals y = x² darstellen' },
      ]},
      { id: 'nl', title: 'Nichtlinearität', rows: [
        { f: 'Nichtlineare Zusammenhänge brauchen nichtlineare Aktivierungsfunktionen', d: 'φ ist DAS Element für Nichtlinearität – kein bloßer Zusatz' },
        { f: 'Warum nicht φ(z) = z²? 1. Werte explodieren (2→4, 5→25, 10→100)', d: 'schaukelt sich über Schichten auf – numerisch ungünstig fürs Training' },
        { f: 'Warum nicht φ(z) = z²? 2. (−2)² = 2² = 4', d: 'Vorzeichen-Information geht verloren' },
        { f: 'Etabliert: ReLU, Sigmoid, Tanh – hauptsächlich ReLU', d: 'ReLU ist stückweise linear: viele Neuronen = viele „Knickstellen“ = Kurven-Annäherung' },
      ]},
    ],
    categories: [
      { id: 'nl-gerade', primer: {"what": "Das Mathe-Handwerkszeug: Aus zwei Punkten die Gerade y = m·x + c bestimmen (Steigung m aus dem Differenzenquotienten, dann c durch Einsetzen).", "why": "Ein Neuron mit Identitäts-Aktivierung <b>ist</b> die Funktion y = w·x + b. Wer m und c bestimmen kann, kann also Gewicht und Bias eines Neurons direkt aus Daten ablesen.", "ex": "Folie: P1 = (2|1), P2 = (6|7):<br><span class=\"formula\">m = (7−1)/(6−2) = 6/4 = 1,5 · c = 1 − 1,5·2 = −2 → y = 1,5x − 2</span>"}, sheetRef: 'gerade', title: 'Gerade durch 2 Punkte', desc: 'm und c bestimmen', tier: 1, weight: 1.2, generate: genLine2P },
      { id: 'nl-konzept', primer: {"what": "Die wichtigste Erkenntnis des Kapitels: Warum braucht ein Netz überhaupt nichtlineare Aktivierungsfunktionen?", "why": "Ohne Nichtlinearität bleibt jedes Netz – egal wie tief – mathematisch eine einzige lineare Funktion und könnte nicht einmal y = x² darstellen. φ ist kein Detail, sondern der Schlüssel.", "ex": "Stapelt man 100 lineare Schichten, kann man sie alle zu <b>einer</b> Formel wx + c zusammenfassen. 100 Schichten Aufwand, Ergebnis: eine simple Gerade."}, sheetRef: 'nl', title: 'Nichtlinearität verstehen', desc: 'Warum φ das entscheidende Element ist', tier: 1, generate: genConcept },
      { id: 'nl-quadrat', primer: {"what": "Ein Gedankenexperiment: Was wäre, wenn man als Aktivierung einfach φ(z) = z² nähme? Es erzeugt Nichtlinearität – hat aber zwei ernste Probleme.", "why": "Es erklärt, warum man nicht „irgendwas Nichtlineares“ nimmt, sondern bewährte Funktionen wie ReLU: z² lässt Werte explodieren und vergisst das Vorzeichen.", "ex": "Explosion: 10 → 100 → 10.000 über zwei Schichten. Vorzeichen: (−2)² = 2² = 4 – ob die Schwingung positiv oder negativ war, ist danach nicht mehr erkennbar."}, sheetRef: 'nl', title: 'φ(z) = z² erkunden', desc: 'Rechnen & Probleme der Quadrat-Aktivierung', tier: 1, weight: 1.1, generate: genSquare },
      { id: 'nl-neuron-fn', primer: {"what": "Jede Vektor-Position kann ihren <b>eigenen</b> Zusammenhang haben: Pro Neuron liest man aus dessen Wertepaaren (über mehrere Beispiele hinweg) die eigene Funktion ab.", "why": "Der Schritt von „eine Funktion für alle“ zu „jedes Neuron seine eigene“ – deshalb dürfen die Diagonalwerte und Biase verschieden sein.", "ex": "Neuron 1 über drei Beispiele: (0, 1), (2, 5), (4, 9) → pro +2 bei x kommt +4 bei y → m = 2, c = 1 → f₁(x) = 2x + 1."}, sheetRef: 'gerade', title: 'Funktion pro Neuron', desc: 'Aus Wertepaaren f(x) = mx + c ablesen', tier: 2, weight: 1.2, generate: genPerNeuron },
      { id: 'nl-diagonal', primer: {"what": "Diagonalmatrix lesen und schreiben: ŷ<sub>j</sub> = w<sub>jj</sub>·x<sub>j</sub> + b<sub>j</sub> – jede Ausgabe hängt nur vom Eingang an derselben Position ab.", "why": "Diagonal heißt <b>nicht</b> „überall dieselbe Funktion“, sondern nur „keine Querverbindungen“. Dieses Missverständnis wurde im Skript extra aufgeklärt – Verständnisfrage mit Klausurpotenzial.", "ex": "W = diag(2, −1) und b = (1 | 4) bedeutet: ŷ₁ = 2x₁ + 1 und ŷ₂ = −x₂ + 4 – zwei völlig verschiedene Funktionen, trotzdem diagonal."}, sheetRef: 'diag', title: 'Diagonalmatrix lesen', desc: 'W & b ↔ Funktion je Neuron', tier: 2, generate: genDiagRead },
      { id: 'nl-offdiag', primer: {"what": "Einträge <b>neben</b> der Diagonalen sind Querverbindungen: w<sub>ji</sub> ≠ 0 heißt, Eingabe i fließt zusätzlich in Ausgabe j ein.", "why": "Erst damit kann eine Ausgabe von mehreren Eingaben abhängen – die Voraussetzung für alles Interessante, was Netze können. Und man lernt, W-Einträge in Formeln zu übersetzen.", "ex": "Steht in Zeile 1 zusätzlich w₁₂ = 1, wird aus ŷ₁ = 2x₁ + b₁ die Formel ŷ₁ = 2x₁ + x₂ + b₁ – „jetzt ist auch Eingabe 2 an Ausgabe 1 beteiligt!“ (Folie)"}, sheetRef: 'diag', title: 'Neben der Diagonalen', desc: 'Was bedeutet w_ji außerhalb?', tier: 2, generate: genOffdiag },
      { id: 'nl-kette', primer: {"what": "Der Beweis durch Einsetzen: Zwei lineare Schichten a = w₁x + b₁ und ŷ = w₂a + b₂ ergeben zusammengefasst wieder ŷ = (w₂w₁)x + (w₂b₁ + b₂) – eine Gerade.", "why": "Das ist die mathematische Begründung, warum mehr lineare Schichten nichts bringen. Die Rechnung selbst (einsetzen, ausmultiplizieren, Konstanten zusammenfassen) ist klausurtauglich.", "ex": "a = 2x + 1, ŷ = 3a − 1: Einsetzen → ŷ = 3(2x + 1) − 1 = 6x + 2. Gesamt-Steigung 3·2 = 6, Gesamt-Konstante 3·1 − 1 = 2."}, sheetRef: 'lin', title: 'Lineare Schichten verketten', desc: 'w₂(w₁x + b₁) + b₂ zusammenfassen', tier: 3, weight: 1.2, generate: genLinChain },
      { id: 'nl-fnrow', primer: {"what": "Funktionen mit <b>mehreren</b> Eingaben in Matrixzeilen übersetzen: Jeder Koeffizient wandert in „seine“ Spalte, die Konstante in den Bias.", "why": "Die Verallgemeinerung der Diagonal-Idee und der Kern der Transferaufgabe: beliebige lineare Zusammenhänge als W und b schreiben.", "ex": "ŷ₂ = −x₂ + 2x₄ − 1 bedeutet für Zeile 2: w₂₂ = −1, w₂₄ = 2, alle anderen 0, b₂ = −1."}, sheetRef: 'diag', title: 'Funktion → Matrixzeile', desc: 'Koeffizienten in W und b eintragen', tier: 3, weight: 1.2, generate: genFnRow },
      { id: 'boss-transfer', primer: {"what": "Die komplette Transferaufgabe aus dem Skript: Aus gegebenen Funktionen die Gewichtsmatrix und den Bias-Vektor aufstellen und dann ŷ = Wx + b für einen konkreten Eingabevektor ausrechnen.", "why": "Hier kommt alles zusammen: Koeffizienten lesen, W und b aufstellen, Matrix mal Vektor rechnen. Wer das kann, hat Kapitel 3 bestanden.", "ex": "Vorgehen: 1) Pro Funktion die Koeffizienten in die passende Zeile von W (auch Off-Diagonale!), 2) Konstanten in b, 3) für die gegebene Eingabe Zeile für Zeile ŷ berechnen."}, sheetRef: 'diag', title: 'Boss: Transferaufgabe', desc: 'Funktionen → W, b → ŷ = Wx + b (5 Schritte)', tier: 3, boss: true, generate: genBoss },
    ],
  });
})();
