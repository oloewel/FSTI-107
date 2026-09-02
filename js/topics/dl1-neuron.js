/* ============ Thema: Deep Learning I – Das künstliche Neuron ============
   FSTI-107, Folien 0 + 1: ML vs DL, Neuron, Voraktivierung, Aktivierungsfunktionen,
   vom Neuron zum Netz, Notation w_ji^(l), Forward-Pass.
   Jede Kategorie hat einen generate()-Aufruf, der eine zufällige Aufgabe baut. */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt, W, A, Z, B, X } = U;

  // Hilfsfunktionen für Choice-Optionen
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];
  const actPlot = (act, w = 240, h = 170) => F.plot({ fn: act.fn, xmin: -5, xmax: 5, ymin: -2, ymax: 3, width: w, height: h });
  const calcExpr = (xs, ws, b) => xs.map((x, i) => `${fmt(x)}·(${fmt(ws[i])})`).join(' + ') + ` + (${fmt(b)})`;
  const dot = (xs, ws, b) => xs.reduce((s, x, i) => s + x * ws[i], 0) + b;
  const actVal = (act, z) => U.round(act.fn(z), 4);
  const actTol = (act) => act.id === 'sigmoid' ? 0.02 : 0.011;
  const actHint = (act) => act.id === 'sigmoid' ? 'Sigmoid mit Taschenrechner: erst e⁻ᶻ (Vorzeichen von z umdrehen!), dann 1 + …, dann 1 ÷ …. Auf 2 Nachkommastellen runden reicht. Merke: z=0 → 0,5 · z<0 → unter 0,5 · z>0 → über 0,5.' : '';
  // Rechenweg für Sigmoid als HTML (für Erklärungen)
  const sigSteps = (z) => { const e = Math.exp(-z); return `Rechenweg: −z = ${fmt(-z)} → e<sup>${fmt(-z)}</sup> ≈ ${fmt(e, 3)} → 1 + ${fmt(e, 3)} = ${fmt(1 + e, 3)} → 1 ÷ ${fmt(1 + e, 3)} ≈ <b>${fmt(1 / (1 + e), 2)}</b>`; };
  const actExplain = (act, z) => act.id === 'sigmoid' ? sigSteps(z) : '';

  // ============================================================
  // KATEGORIE 1: ML vs. DL (Konzept)
  // ============================================================
  const CONCEPTS_ML = [
    { q: 'Was ist laut Skript der wesentliche Unterschied zwischen klassischem Machine Learning und Deep Learning?',
      c: 'Beim Deep Learning lernt das Netz Features/Merkmale selbstständig aus Rohdaten – beim klassischen ML werden sie manuell vorgegeben.',
      w: ['Deep Learning benötigt keine Trainingsdaten, klassisches ML schon.', 'Klassisches ML nutzt immer tiefe neuronale Netze, Deep Learning nicht.', 'Deep Learning funktioniert ausschließlich mit Bilddaten.'],
      e: 'Klassisch: Mensch definiert sinnvolle Features (z.B. Kanten, Histogramme). DL: Rohdaten → mehrere lernende Schichten → Ausgabe; Features werden gelernt.' },
    { q: 'Woher hat „Deep Learning“ seinen Namen?', c: 'Von den <b>tiefen</b> (vielschichtigen) künstlichen neuronalen Netzen.',
      w: ['Von der besonders tiefen/langen Rechenzeit beim Training.', 'Weil tief in den Daten nach Ausreißern gesucht wird.', 'Vom Erfinder Prof. Deep.'],
      e: 'Deep Learning nutzt tiefe künstliche neuronale Netze – daher der Name.' },
    { q: 'Bildklassifikation mit <b>klassischem ML</b>: Was wird typischerweise manuell vorgegeben?', c: 'Features wie Kanten, Texturkennwerte oder Histogramme.',
      w: ['Nichts – das Modell lernt alle Merkmale selbst.', 'Nur die rohen Pixelwerte ohne jede Vorverarbeitung.', 'Die Anzahl der Schichten des Netzes.'],
      e: 'Klassisches ML: Kanten, Texturkennwerte, Histogramme vorgeben. DL: Netz lernt selbst Kanten/Strukturen/komplexe Merkmale.' },
    { q: 'Zeitreihen mit <b>Deep Learning</b>: Was passiert mit den Merkmalen?', c: 'Das Netz lernt relevante zeitliche Muster selbst.',
      w: ['Temperaturmittelwert und Varianz müssen vorgegeben werden.', 'Zeitreihen können mit DL nicht verarbeitet werden.', 'Es werden ausschließlich Frequenzkennwerte vorgegeben.'],
      e: 'Klassisch: Mittelwert, Varianz usw. vorgeben. DL: Netz lernt relevante zeitliche Muster.' },
    { q: 'Welche Variante der Datenverarbeitung ist das: <i>„Daten, Regeln &amp; Filter → Ergebnis“</i>?', c: 'Klassisch programmiert', w: ['Machine Learning', 'Deep Learning', 'Reinforcement Learning'],
      e: '1. Klassisch programmiert: Daten, Regeln & Filter → Ergebnis. 2. ML: Daten & bekannte Ergebnisse → Lernen → Modell. 3. DL: Rohdaten → mehrere lernende Schichten → Ausgabe.' },
    { q: 'Welche Variante der Datenverarbeitung ist das: <i>„Daten &amp; bekannte Ergebnisse → Lernen → Modell“</i>?', c: 'Machine Learning', w: ['Klassisch programmiert', 'Deep Learning', 'Datenbankabfrage'],
      e: '1. Klassisch programmiert: Daten, Regeln & Filter → Ergebnis. 2. ML: Daten & bekannte Ergebnisse → Lernen → Modell. 3. DL: Rohdaten → mehrere lernende Schichten → Ausgabe.' },
    { q: 'Welche Variante der Datenverarbeitung ist das: <i>„Rohdaten → mehrere lernende Schichten → Ausgabe“</i>?', c: 'Deep Learning', w: ['Klassisch programmiert', 'Machine Learning (klassisch)', 'Regelbasiertes System'],
      e: '1. Klassisch programmiert: Daten, Regeln & Filter → Ergebnis. 2. ML: Daten & bekannte Ergebnisse → Lernen → Modell. 3. DL: Rohdaten → mehrere lernende Schichten → Ausgabe.' },
    { q: 'Wie verhält sich Deep Learning zu Machine Learning?', c: 'DL kann als Untervariante des ML verstanden werden, teilweise aber auch als eigenständige Gruppe – die Definitionen widersprechen sich leicht.',
      w: ['DL und ML sind exakt dasselbe, nur andere Namen.', 'ML ist eine Untervariante von DL.', 'Es gibt genau eine weltweit verbindliche Definition.'],
      e: 'Merksatz aus dem Skript: Es gibt unterschiedliche Definitionen, die sich teils leicht widersprechen – das müssen wir hinnehmen.' },
    { q: 'Was weiß das Modell <b>während des Trainings</b>?', c: 'Welche Eingabe zur richtigen Ausgabe y führt („wahre Aussage“).',
      w: ['Nichts – es rät komplett zufällig.', 'Nur die Eingaben, nie die richtigen Ausgaben.', 'Die Formel der Aktivierungsfunktion ist unbekannt.'],
      e: 'Beim Training kennen wir die richtige Antwort (y) zu jeder Eingabe.' },
    { q: 'Warum ist die Ausgabe des Modells <b>ŷ</b> und nicht <b>y</b>?', c: 'Das Modell kann nur schätzen – ŷ ist die Vorhersage, y der wahre/bekannte Wert.',
      w: ['ŷ ist nur eine andere Schreibweise für denselben Wert.', 'y ist die Eingabe, ŷ die Ausgabe.', 'ŷ steht für den Bias.'],
      e: 'Wir möchten ŷ = f(x) finden, sodass ŷ möglichst nah an y liegt.' },
    { q: 'Was suchen wir beim Lernen mathematisch gesehen?', c: 'Eine Funktion/Abbildung f mit ŷ = f(x), sodass ŷ möglichst nah an y liegt.',
      w: ['Eine Datenbank, die jede Eingabe speichert.', 'Den größten Wert in den Trainingsdaten.', 'Die Anzahl der Klassen.'],
      e: 'Eingabe x führt durch Funktion f zur Vorhersage ŷ. f steht für eine beliebige Berechnung – z.B. ein Neuron.' },
    { q: 'Datensatz: Temperatur 40→0, 50→0, 80→1, 90→1. Welche einfache Regel passt?', c: '<span class="mono">if temperatur &gt; 60: y = 1 else: y = 0</span>',
      w: ['<span class="mono">if temperatur &gt; 30: y = 1 else: y = 0</span>', '<span class="mono">if temperatur &lt; 60: y = 1 else: y = 0</span>', '<span class="mono">y = temperatur / 100</span>'],
      e: 'Eine Schwelle zwischen 50 und 80 trennt die Klassen – z.B. 60. Genau so eine Entscheidungsgrenze kann ein Neuron mit Bias lernen.' },
    { q: 'Was ist die <b>Eingabe</b> und die <b>gewünschte Ausgabe</b> im Maschinenbeispiel (fehlerfrei/auffällig)?', c: 'Eingaben: Temperatur, Schwingung, Lautstärke … – Ausgabe: 0 = unauffällig, 1 = auffällig.',
      w: ['Eingabe: 0 oder 1 – Ausgabe: Temperatur.', 'Eingabe: der Bias – Ausgabe: die Gewichte.', 'Eingabe: das Modell – Ausgabe: die Daten.'],
      e: 'x = Sensorwerte (x₁ Temperatur, x₂ Schwingung, …), y = Zustand der Maschine (0/1).' },
  ];
  function genConcept(pool) {
    const q = pick(pool);
    return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e };
  }

  // ============================================================
  // KATEGORIE 2: Symbole (Formelsammlung)
  // ============================================================
  const SYMBOLS = [
    { s: 'a', m: 'Aktivierung / Ausgabe eines Neurons', e: 'Wert nach Anwendung der Aktivierungsfunktion; kann Eingabe für weitere Neuronen sein.' },
    { s: 'b', m: 'Bias', e: 'Wird unabhängig von den Eingaben zur gewichteten Summe addiert; verschiebt die Reaktion des Neurons.' },
    { s: 'f', m: 'Funktion / Abbildung', e: 'Verarbeitet Eingaben zu einer Ausgabe, z.B. ŷ = f(x) für das gesamte Modell.' },
    { s: 'i', m: 'Index', e: 'Kennzeichnet, welcher einzelne Wert gemeint ist: x₁, x₂ … oder w₁, w₂ …' },
    { s: 'n', m: 'Anzahl der Eingaben', e: 'Bei drei Eingaben gilt n = 3.' },
    { s: 'w<sub>i</sub>', m: 'Gewicht', e: 'Bestimmt, wie stark und in welche Richtung x<sub>i</sub> in die Berechnung eingeht.' },
    { s: 'x', m: 'Eingabe (Eingabedaten)', e: 'Die Daten, die dem Modell zur Verfügung gestellt werden.' },
    { s: 'x<sub>i</sub>', m: 'Einzelne Eingabe', e: 'z.B. x₁ = Temperatur, x₂ = Schwingung.' },
    { s: 'y', m: 'Zielwert / tatsächlicher Wert', e: 'Die bekannte richtige Ausgabe zu einer Eingabe.' },
    { s: 'ŷ', m: 'Vorhersage des Modells', e: 'Soll möglichst gut mit y übereinstimmen.' },
    { s: 'z', m: 'Voraktivierung', e: 'Zwischenergebnis aus gewichteter Summe der Eingaben plus Bias.' },
    { s: 'Σ', m: 'Summenzeichen', e: 'Mehrere Terme werden addiert – beim Neuron die gewichteten Eingaben.' },
    { s: 'φ', m: 'Aktivierungsfunktion', e: 'Verarbeitet die Voraktivierung z: a = φ(z).' },
    { s: '∈', m: '„ist Element von“ / „gehört zu“', e: 'i ∈ ℕ bedeutet: i ist eine natürliche Zahl.' },
    { s: 'ℕ', m: 'Natürliche Zahlen {1, 2, 3, …}', e: 'Werden z.B. zum Zählen oder für Indizes verwendet.' },
    { s: 'ℕ₀', m: 'Natürliche Zahlen mit Null {0, 1, 2, …}', e: 'Wie ℕ, aber inklusive 0.' },
    { s: 'ℝ', m: 'Reelle Zahlen', e: 'Alle Zahlen der Zahlengeraden (−2, 0, 1,5, ½, π …). Eingaben, Gewichte und Bias sind reelle Zahlen.' },
  ];
  function genSymbol() {
    const s = pick(SYMBOLS);
    const others = shuffle(SYMBOLS.filter(x => x !== s)).slice(0, 3);
    if (U.chance(0.5)) {
      return { type: 'choice', prompt: `Wofür steht das Symbol <span class="formula">${s.s}</span> ?`, options: opts(s.m, others.map(o => o.m)), explain: `<b>${s.s}</b> = ${s.m}. ${s.e}` };
    }
    return { type: 'choice', prompt: `Welches Symbol bezeichnet: <b>${s.m}</b>?`, options: opts(`<span class="formula">${s.s}</span>`, others.map(o => `<span class="formula">${o.s}</span>`)), explain: `<b>${s.s}</b> = ${s.m}. ${s.e}` };
  }

  // ============================================================
  // KATEGORIE 3: Voraktivierung z berechnen
  // ============================================================
  function genZ() {
    const n = pick([2, 2, 3, 3, 4]);
    const xs = Array.from({ length: n }, U.inputVal), ws = Array.from({ length: n }, U.weightVal), b = U.biasVal();
    const z = U.round(dot(xs, ws, b), 3);
    const asTable = U.chance(0.5);
    const figure = asTable
      ? F.table(['', ...xs.map((_, i) => `x${U.sub(i + 1)}`), 'b'], [['Eingabe', ...xs.map(x => fmt(x)), '–'], ['Gewicht', ...ws.map(w => fmt(w)), fmt(b)]])
      : F.neuron({ inputs: xs.map((x, i) => ({ label: U.uX(i + 1), value: x, w: ws[i] })), bias: b, showValues: true, outLabel: 'z' });
    return {
      type: 'numeric', label: 'z',
      prompt: `Berechne die <b>Voraktivierung z</b> des Neurons (gewichtete Summe + Bias).`,
      figure, answer: z,
      explain: `<span class="formula">z = Σ x<sub>i</sub>·w<sub>i</sub> + b = ${calcExpr(xs, ws, b)} = <b>${fmt(z)}</b></span>`,
    };
  }

  // ============================================================
  // KATEGORIE 4: Aktivierungsfunktion anwenden
  // ============================================================
  function genActApply() {
    const act = pick(U.ACTS);
    const z = pick([-4, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3, 4]);
    const a = actVal(act, z);
    return {
      type: 'numeric', label: 'a',
      prompt: `Die Voraktivierung ist <b>z = ${fmt(z)}</b>. Als Aktivierungsfunktion wird die <b>${act.name}</b> verwendet. Welche Ausgabe a = φ(z) ergibt sich?`,
      given: [`φ: ${act.formula}`], answer: a, tol: actTol(act), hint: actHint(act), digits: 2,
      explain: `${act.name}: ${act.desc}. <span class="formula">a = φ(${fmt(z)}) = <b>${fmt(a, 2)}</b></span>${act.id === 'sigmoid' ? '<br>' + sigSteps(z) : ''}`,
    };
  }

  // ============================================================
  // KATEGORIE 5: Aktivierungsfunktion erkennen (Graph / Beschreibung)
  // ============================================================
  function genActIdentify() {
    const act = pick(U.ACTS);
    const others = U.ACTS.filter(a => a !== act);
    const v = rnd(0, 3);
    if (v === 0) { // Graph → Name
      return { type: 'choice', prompt: 'Welche Aktivierungsfunktion zeigt der Graph?', figure: actPlot(act, 320, 220),
        options: opts(act.name, others.map(o => o.name)), explain: `${act.name}: ${act.desc}. <span class="formula">${act.formula}</span>` };
    }
    if (v === 1) { // Name → Graph
      return { type: 'choice', prompt: `Welcher Graph gehört zur <b>${act.name}</b>?`,
        options: opts(actPlot(act), others.map(o => actPlot(o))), explain: `${act.name}: ${act.desc}. <span class="formula">${act.formula}</span>` };
    }
    if (v === 2) { // Beschreibung → Name
      const descs = {
        ident: ['Die Voraktivierung wird unverändert weitergegeben.', 'Ein Spezialfall der linearen Funktion: φ(z) = z.'],
        step: ['Das Neuron gibt nur „aus“ (0) oder „an“ (1) weiter.', 'a = 0 für z ≤ 0, a = 1 für z > 0.'],
        relu: ['Negative Werte werden abgeschnitten, positive bleiben erhalten.', 'φ(z) = max(0, z).'],
        sigmoid: ['Beliebige Werte werden auf den Bereich zwischen 0 und 1 begrenzt.', 'z ≪ 0 → Ausgabe nahe 0, z = 0 → 0,5, z ≫ 0 → nahe 1.'],
      };
      return { type: 'choice', prompt: `Welche Aktivierungsfunktion ist gemeint? <i>„${pick(descs[act.id])}“</i>`,
        options: opts(act.name, others.map(o => o.name)), explain: `${act.name}: ${act.desc}. <span class="formula">${act.formula}</span>` };
    }
    // Formel → Name
    return { type: 'choice', prompt: `Zu welcher Aktivierungsfunktion gehört die Vorschrift <span class="formula">${act.formula}</span>?`,
      options: opts(act.name, others.map(o => o.name)), explain: `${act.name}: ${act.desc}.` };
  }

  // ============================================================
  // KATEGORIE 6: Neuron-Konzepte
  // ============================================================
  const CONCEPTS_NEURON = [
    { q: 'Was bedeutet es, wenn ein Gewicht <b>w<sub>i</sub> = 0</b> wird?', c: 'Die zugehörige Eingabe x<sub>i</sub> hat keinen Einfluss auf das Neuron.',
      w: ['Das Neuron gibt immer 0 aus.', 'Die Eingabe zählt doppelt.', 'Der Bias wird ebenfalls 0.'], e: 'x<sub>i</sub>·0 = 0 – der Term fällt aus der Summe heraus.' },
    { q: 'Kann ein Gewicht <b>negativ</b> sein?', c: 'Ja – die Eingabe wirkt dann in die entgegengesetzte Richtung (hemmend).',
      w: ['Nein, Gewichte sind immer ≥ 0.', 'Nur der Bias darf negativ sein.', 'Nur bei der Sigmoid-Funktion.'], e: 'Gewichte sind reelle Zahlen (w ∈ ℝ). Ein negatives Gewicht senkt z, wenn die Eingabe positiv ist.' },
    { q: 'Wofür brauchen wir den <b>Bias</b>?', c: 'Er legt fest, ab welchem Bereich/Wert ein Neuron reagiert – wir können Entscheidungsgrenzen verschieben.',
      w: ['Er normiert die Eingaben auf den Bereich 0 bis 1.', 'Er zählt die Anzahl der Eingaben.', 'Er ersetzt die Aktivierungsfunktion.'], e: 'z = Σ x<sub>i</sub>w<sub>i</sub> + b: Der Bias verschiebt die gesamte Berechnung.' },
    { q: 'Was ist die <b>Voraktivierung</b> z?', c: 'Ein Zwischenergebnis des Neurons: gewichtete Summe der Eingaben plus Bias.',
      w: ['Die endgültige Ausgabe des gesamten Netzes.', 'Die Anzahl der aktiven Neuronen.', 'Der Fehler zwischen y und ŷ.'], e: 'z = x₁w₁ + x₂w₂ + … + x<sub>n</sub>w<sub>n</sub> + b. Danach kommt φ.' },
    { q: 'In welcher <b>Reihenfolge</b> rechnet ein künstliches Neuron?', c: 'Eingaben gewichten → summieren → Bias addieren (= z) → Aktivierungsfunktion → Ausgabe a',
      w: ['Aktivierungsfunktion → Bias → gewichtete Summe → Ausgabe', 'Bias → Aktivierungsfunktion → Eingaben gewichten', 'Ausgabe → Bias → Summe → Eingaben'], e: 'Gewichtete Summe + Bias = Voraktivierung z; dann a = φ(z).' },
    { q: 'Warum heißt die Ausgabe eines Neurons allgemein <b>a</b> und nicht ŷ?', c: 'Weil mehrere Neuronen hintereinander geschaltet werden – nur die Ausgabe des letzten Neurons ist ŷ.',
      w: ['Weil a für „Antwort“ steht und ŷ veraltet ist.', 'Weil ŷ nur für Eingaben verwendet wird.', 'Es gibt keinen Unterschied, beide sind der Bias.'], e: 'a kann Eingabe für weitere Neuronen sein; a kann im letzten Neuron zu ŷ werden.' },
    { q: 'Was macht die <b>Aktivierungsfunktion φ</b>?', c: 'Sie verarbeitet die Voraktivierung z weiter zur Ausgabe: a = φ(z).',
      w: ['Sie berechnet die gewichtete Summe der Eingaben.', 'Sie wählt die Trainingsdaten aus.', 'Sie bestimmt die Anzahl der Schichten.'], e: 'Die Voraktivierung liefert einen beliebigen Zahlenwert; φ macht daraus die gewünschte Ausgabe.' },
    { q: 'Wie drückt man aus, dass Eingabe x₁ <b>stärker zählt</b> als x₂?', c: 'Durch Gewichtungsfaktoren: |w₁| größer als |w₂|.',
      w: ['Durch einen größeren Bias.', 'Indem x₁ zuerst in die Summe geschrieben wird.', 'Durch eine andere Aktivierungsfunktion für x₁.'], e: 'Jede Eingabe wird mit einem Gewicht versehen, dann werden die gewichteten Eingaben addiert.' },
    { q: 'Welchen Wert liefert die <b>Sigmoid</b>-Funktion bei z = 0?', c: '0,5', w: ['0', '1', '−1'], e: 'Sigmoid: 1/(1+e⁰) = 1/2 = 0,5. z ≪ 0 → nahe 0, z ≫ 0 → nahe 1.' },
    { q: 'Welche vier Aktivierungsfunktionen sind laut Skript die gängigsten, auf die wir uns fokussieren?', c: 'Schwellenfunktion, Sigmoid, lineare Funktion, ReLU',
      w: ['Sinus, Cosinus, Tangens, Exponentialfunktion', 'Softmax, Tanh, GELU, Swish', 'Maximum, Minimum, Mittelwert, Median'], e: '1. Schwellenfunktion 2. Sigmoid 3. Lineare Funktion 4. ReLU.' },
    { q: 'Wie viele verschiedene Ausgabewerte kann die <b>Schwellenfunktion</b> liefern?', c: 'Genau zwei: 0 oder 1', w: ['Unendlich viele zwischen 0 und 1', 'Drei: −1, 0, 1', 'Beliebig viele reelle Werte'], e: 'a = 0 für z ≤ 0, a = 1 für z > 0 – „aus“ oder „an“.' },
    { q: 'Die <b>Identitätsfunktion</b> φ(z) = z ist ein Spezialfall welcher Funktionsart?', c: 'Linear (a = m·z + c mit m = 1, c = 0)', w: ['Sigmoid', 'Schwellenfunktion', 'ReLU'], e: 'Fall 1 im Skript: Voraktivierung unverändert weitergeben → lineare Funktion, Spezialfall Identität.' },
    { q: 'Was unterscheidet <b>ReLU</b> von der <b>Identität</b>?', c: 'ReLU schneidet negative Werte ab (0), positive bleiben gleich – Identität lässt alles durch.',
      w: ['ReLU begrenzt auf 0 bis 1, Identität nicht.', 'Es gibt keinen Unterschied.', 'ReLU gibt nur 0 oder 1 aus.'], e: 'ReLU: φ(z) = max(0, z). Für z > 0 sind beide identisch.' },
    { q: 'Welche Aussage über <b>Sigmoid</b> ist richtig?', c: 'Für sehr negative z ist die Ausgabe nahe 0, für sehr positive z nahe 1.',
      w: ['Die Ausgabe kann beliebig groß werden.', 'Für z = 0 ist die Ausgabe 0.', 'Negative z ergeben negative Ausgaben.'], e: 'Sigmoid begrenzt auf den Bereich (0, 1); bei z = 0 genau 0,5.' },
  ];

  // ============================================================
  // KATEGORIE 7: Neuron komplett (z + Aktivierung → a)
  // ============================================================
  function genNeuronFull() {
    const n = pick([2, 3, 3]);
    const xs = Array.from({ length: n }, U.inputVal), ws = Array.from({ length: n }, U.weightVal), b = U.biasVal();
    const act = pick(U.ACTS);
    const z = U.round(dot(xs, ws, b), 3), a = actVal(act, z);
    return {
      type: 'numeric', label: 'a',
      prompt: `Berechne die <b>Ausgabe a</b> des Neurons: erst die Voraktivierung z, dann die Aktivierungsfunktion <b>${act.name}</b> anwenden.`,
      figure: F.neuron({ inputs: xs.map((x, i) => ({ label: U.uX(i + 1), value: x, w: ws[i] })), bias: b, showValues: true, act: act.short }),
      given: [`φ: ${act.formula}`], answer: a, tol: actTol(act), hint: actHint(act), digits: 2,
      explain: `<span class="formula">z = ${calcExpr(xs, ws, b)} = ${fmt(z)}</span><br><span class="formula">a = φ(${fmt(z)}) = <b>${fmt(a, 2)}</b></span> (${act.short}: ${act.desc})${act.id === 'sigmoid' ? '<br>' + sigSteps(z) : ''}`,
    };
  }

  // ============================================================
  // KATEGORIE 8: Notation – Kante im Netz benennen
  // ============================================================
  function genEdge() {
    const inputs = pick([2, 2, 3]);
    const layers = pick([[2, 2, 1], [2, 1], [3, 2, 1], [2, 2, 1]]);
    const cols = [inputs, ...layers];
    const l = rnd(1, layers.length), j = rnd(1, cols[l]), i = rnd(1, cols[l - 1]);
    const correct = W(j, i, l);
    const wrongSet = new Set();
    const cand = [W(i, j, l), W(j, i, l + 1), W(j, i, Math.max(1, l - 1)), W(i, j, l + 1), W(j, (i % cols[l - 1]) + 1, l), W((j % cols[l]) + 1, i, l)];
    cand.forEach(c => { if (c !== correct) wrongSet.add(c); });
    const wrongs = shuffle([...wrongSet]).slice(0, 3);
    const from = l === 1 ? `Eingabe ${X(i)}` : `Neuron ${A(i, l - 1)} (Schicht ${l - 1})`;
    return {
      type: 'choice',
      prompt: `Wie heißt das <b>markierte Gewicht</b> (orange) in korrekter Notation w<sub>ji</sub><sup>(l)</sup>?`,
      figure: F.network({ inputs, layers, highlight: { l, j, i } }),
      options: opts(`<span class="formula">${correct}</span>`, wrongs.map(w => `<span class="formula">${w}</span>`)),
      explain: `Die Verbindung führt in <b>Schicht ${l}</b> (hochgestellt) zu <b>Neuron ${j}</b> (1. Index) und kommt von <b>${from}</b> (2. Index) → ${correct}. Merke: (l) = wohin (Schicht), j = zu welchem Neuron, i = von welchem Neuron/Eingang.`,
    };
  }

  // ============================================================
  // KATEGORIE 9: Notation lesen / verstehen
  // ============================================================
  function genNotationRead() {
    const v = rnd(0, 5);
    const l = rnd(1, 3); let j = rnd(1, 3), i = rnd(1, 3);
    if (j === l) j = (j % 3) + 1; // verhindert identische Distraktoren a_j^(l) vs a_l^(j)
    const MEAN = { l: 'Schicht, in die die Verbindung führt (hochgestellt, in Klammern)', j: 'Neuron, zu dem die Verbindung führt (1. Index)', i: 'Neuron/Eingang, von dem die Verbindung kommt (2. Index)' };
    if (v === 0) {
      const which = pick(['l', 'j', 'i']);
      const label = which === 'l' ? `die hochgestellte <b>(${l})</b>` : which === 'j' ? `der erste Index <b>${j}</b>` : `der zweite Index <b>${i}</b>`;
      return { type: 'choice', prompt: `Gewicht <span class="formula">${W(j, i, l)}</span>: Was bedeutet ${label}?`,
        options: opts(MEAN[which], Object.keys(MEAN).filter(k => k !== which).map(k => MEAN[k]).concat(['Die Anzahl der Trainingsdaten'])),
        explain: `w<sub>ji</sub><sup>(l)</sup>: (l) = Schicht, zu der die Verbindung führt · j = Ziel-Neuron · i = Herkunft (Neuron der Schicht l−1 bzw. Eingang).` };
    }
    if (v === 1) {
      return { type: 'choice', prompt: `Wie heißt die <b>Ausgabe von Neuron ${j} in Schicht ${l}</b>?`,
        options: opts(`<span class="formula">${A(j, l)}</span>`, [`<span class="formula">${A(l, j)}</span>`, `<span class="formula">${W(j, l, l)}</span>`, `<span class="formula">${Z(l, j)}</span>`]),
        explain: `Für Ausgaben: hochgestellt (l) = Schicht, tiefgestellt = Neuron → ${A(j, l)}. (z<sub>j</sub><sup>(l)</sup> wäre die Voraktivierung.)` };
    }
    if (v === 2) {
      const jj = rnd(1, 2), ii = pick([1, 2, 3].filter(v => v !== jj));
      return { type: 'choice', prompt: `Wie heißt das Gewicht von der <b>Eingabe ${X(ii)}</b> zum <b>Neuron ${jj} in Schicht 1</b>?`,
        figure: F.network({ inputs: 3, layers: [2, 1], highlight: { l: 1, j: jj, i: ii } }),
        options: opts(`<span class="formula">${W(jj, ii, 1)}</span>`, [`<span class="formula">${W(ii, jj, 1)}</span>`, `<span class="formula">${W(jj, ii, 2)}</span>`, `<span class="formula">${W(ii, jj, 0)}</span>`]),
        explain: `Schicht 1 (die Verbindung führt in Schicht 1), zu Neuron ${jj}, von Eingang ${ii} → ${W(jj, ii, 1)}.` };
    }
    if (v === 3) {
      const lq = rnd(2, 3), jq = rnd(1, 2), iq = 3 - jq;
      return { type: 'choice', prompt: `Das Gewicht <span class="formula">${W(jq, iq, lq)}</span> verbindet …`,
        options: opts(`Neuron ${iq} der Schicht ${lq - 1} mit Neuron ${jq} der Schicht ${lq}`,
          [`Neuron ${jq} der Schicht ${lq - 1} mit Neuron ${iq} der Schicht ${lq}`, `Neuron ${iq} der Schicht ${lq} mit Neuron ${jq} der Schicht ${lq + 1}`, `Eingabe x<sub>${jq}</sub> mit Neuron ${iq} der Schicht ${lq}`]),
        explain: `2. Index = Herkunft (Neuron ${iq} in Schicht ${lq - 1}), 1. Index = Ziel (Neuron ${jq}), (${lq}) = Zielschicht.` };
    }
    if (v === 4) {
      return { type: 'choice', prompt: `Über wie viele Eingänge wird bei der Voraktivierung eines Neurons in <b>Schicht l</b> summiert?`,
        options: opts('Über n<sub>l−1</sub> – die Anzahl der Neuronen/Eingänge der <b>vorherigen</b> Schicht', ['Über n<sub>l</sub> – die Anzahl der Neuronen der eigenen Schicht', 'Über L – die Anzahl aller Schichten', 'Immer über genau 2 Eingänge']),
        explain: 'Die Eingaben stammen aus der vorherigen Schicht l−1, daher läuft die Summe von i = 1 bis n<sub>l−1</sub>.' };
    }
    return { type: 'choice', prompt: `Warum schreiben wir in der allgemeinen Formel <span class="formula">a<sub>i</sub><sup>(l−1)</sup></span> statt x<sub>i</sub> als Eingabe?`,
      options: opts('Weil die Eingabe im Netz meist die Ausgabe a der vorherigen Schicht ist – x ist nur der Sonderfall der ersten Schicht.',
        ['Weil x nur für Gewichte verwendet wird.', 'Weil a und x völlig verschiedene Zahlenbereiche haben.', 'Weil x in der Formelsammlung nicht vorkommt.']),
      explain: 'Schritt 3 im Skript: „Unsere Eingabe ist ja nicht immer x, sondern im Netz dann auch a – dass die Eingabe x ist, ist ein Sonderfall!“' };
  }

  // ============================================================
  // KATEGORIE 10: Formel mit Indizes
  // ============================================================
  const SUM = (top) => `<span style="display:inline-block;vertical-align:middle;text-align:center;font-size:.75em;line-height:1.1">${top}<br><span style="font-size:1.6em">Σ</span><br>i=1</span>`;
  const formula = ({ top = 'n<sub>l−1</sub>', w = 'w<sub>ji</sub><sup>(l)</sup>', a = 'a<sub>i</sub><sup>(l−1)</sup>', b = 'b<sub>j</sub><sup>(l)</sup>', z = 'z<sub>j</sub><sup>(l)</sup>' } = {}) =>
    `<span class="formula">${z} = ${SUM(top)} ${w} · ${a} ${b ? '+ ' + b : ''}</span>`;
  const FLAWS = [
    { f: formula({ a: 'a<sub>i</sub><sup>(l)</sup>' }), err: 'Die Eingaben müssen aus der vorherigen Schicht stammen: a<sub>i</sub><sup>(l−1)</sup>, nicht a<sub>i</sub><sup>(l)</sup>.' },
    { f: formula({ top: 'n<sub>l</sub>' }), err: 'Die Summe läuft über die Eingänge der vorherigen Schicht: bis n<sub>l−1</sub>, nicht n<sub>l</sub>.' },
    { f: formula({ w: 'w<sub>ij</sub><sup>(l)</sup>' }), err: 'Index-Reihenfolge: erst Ziel-Neuron j, dann Herkunft i → w<sub>ji</sub><sup>(l)</sup>.' },
    { f: formula({ b: 'b<sub>i</sub><sup>(l)</sup>' }), err: 'Der Bias gehört zum berechneten Neuron j: b<sub>j</sub><sup>(l)</sup>, nicht b<sub>i</sub>.' },
    { f: formula({ b: '' }), err: 'Der Bias b<sub>j</sub><sup>(l)</sup> fehlt komplett.' },
    { f: formula({ z: 'z<sub>i</sub><sup>(l)</sup>' }), err: 'Wir berechnen Neuron j, also z<sub>j</sub><sup>(l)</sup> – nicht z<sub>i</sub>.' },
    { f: formula({ w: 'w<sub>ji</sub><sup>(l−1)</sup>' }), err: 'Das Gewicht trägt die Schicht, in die die Verbindung führt: w<sub>ji</sub><sup>(l)</sup>.' },
  ];
  const CORRECT_F = formula();
  function genFormula() {
    if (U.chance(0.5)) {
      const wrongs = shuffle(FLAWS).slice(0, 3).map(x => x.f);
      return { type: 'choice', prompt: 'Welche Formel für die <b>Voraktivierung von Neuron j in Schicht l</b> ist vollständig korrekt indiziert?',
        options: opts(CORRECT_F, wrongs),
        explain: `Richtig: ${CORRECT_F}<br>Schicht l = wo das Neuron sitzt, j = welches Neuron, i = Eingänge aus Schicht l−1, Summe bis n<sub>l−1</sub>, Bias b<sub>j</sub><sup>(l)</sup>.` };
    }
    const fl = pick(FLAWS);
    const wrongs = shuffle(FLAWS.filter(x => x !== fl)).slice(0, 2).map(x => x.err).concat(['Die Formel ist vollständig korrekt.']);
    return { type: 'choice', prompt: `Diese Formel enthält einen Fehler. <b>Welchen?</b><br>${fl.f}`,
      options: opts(fl.err, wrongs), explain: `Richtig wäre: ${CORRECT_F}` };
  }

  // ============================================================
  // KATEGORIE 11: Neuron in Schicht 2 rechnen (multi)
  // ============================================================
  function genLayerCalc() {
    const a1 = pick([1, 2, 2, 3, 0.5, -1]), a2 = pick([1, 2, 3, 3, 0.5, -2]);
    const w1 = U.weightVal(), w2 = U.weightVal(), b = U.biasVal();
    const act = pick(U.ACTS);
    const j = rnd(1, 2);
    const z = U.round(a1 * w1 + a2 * w2 + b, 3), a = actVal(act, z);
    return {
      type: 'multi',
      prompt: `Gegeben ist <b>Neuron ${j} in Schicht 2</b>. Berechne Schritt für Schritt die Voraktivierung und die Aktivierung.`,
      figure: F.network({ inputs: 2, layers: [2, 2, 1], highlightNode: { l: 2, j } }),
      given: [`${A(1, 1)} = <b>${fmt(a1)}</b>`, `${A(2, 1)} = <b>${fmt(a2)}</b>`, `${W(j, 1, 2)} = <b>${fmt(w1)}</b>`, `${W(j, 2, 2)} = <b>${fmt(w2)}</b>`, `${B(j, 2)} = <b>${fmt(b)}</b>`, `φ = <b>${act.short}</b> (${act.formula})`],
      steps: [
        { label: `Voraktivierung ${Z(j, 2)}`, varLabel: `z<sub>${j}</sub><sup>(2)</sup>`, answer: z, explain: `${fmt(a1)}·(${fmt(w1)}) + ${fmt(a2)}·(${fmt(w2)}) + (${fmt(b)}) = ${fmt(z)}` },
        { label: `Aktivierung ${A(j, 2)} = φ(${Z(j, 2)}) mit ${act.short}`, varLabel: `a<sub>${j}</sub><sup>(2)</sup>`, answer: a, tol: actTol(act), hint: actHint(act), explain: `${act.short}(${fmt(z)}) = ${fmt(a, 2)}${act.id === 'sigmoid' ? ' · ' + sigSteps(z) : ''}` },
      ],
      explain: `<span class="formula">${Z(j, 2)} = ${A(1, 1)}·${W(j, 1, 2)} + ${A(2, 1)}·${W(j, 2, 2)} + ${B(j, 2)} = ${fmt(z)}</span>, dann <span class="formula">${A(j, 2)} = φ(${fmt(z)}) = ${fmt(a, 2)}</span>.`,
    };
  }

  // ============================================================
  // KATEGORIE 12: Aktivierungen vergleichen (multi, alle 4 Funktionen)
  // ============================================================
  function genActCompare() {
    const z = pick([-3, -2, -2, -1, -0.5, 0, 0.5, 1, 2, 3]);
    const order = shuffle(U.ACTS);
    return {
      type: 'multi',
      prompt: `Die Voraktivierung ist <b>z = ${fmt(z)}</b>. Bestimme die Ausgabe für <b>jede</b> der vier Aktivierungsfunktionen.`,
      given: U.ACTS.map(a => `${a.short}: ${a.formula}`),
      steps: order.map(act => ({ label: `${act.name}`, varLabel: 'a', answer: actVal(act, z), tol: actTol(act), hint: actHint(act), explain: `${act.short}(${fmt(z)}) = ${fmt(actVal(act, z), 2)}${act.id === 'sigmoid' ? ' · ' + sigSteps(z) : ''}` })),
      explain: `Bei z = ${fmt(z)}: ` + U.ACTS.map(a => `${a.short} → <b>${fmt(actVal(a, z), 2)}</b>`).join(' · '),
    };
  }

  // ============================================================
  // BOSS 1: Neuronen-Kette (wie Aufgabe Teil 1 + 2 im Skript)
  // ============================================================
  function genChainBoss() {
    const xs = [U.inputVal(), U.inputVal(), U.inputVal()], ws = [U.weightVal(), U.weightVal(), U.weightVal()], b1 = U.biasVal();
    const act1 = pick(U.ACTS.filter(a => a.id !== 'sigmoid')); // erstes Neuron ohne Sigmoid, damit Kettenwerte „schön“ bleiben
    const z1 = U.round(dot(xs, ws, b1), 3), a1 = actVal(act1, z1);
    const w2 = pick([-2, -1, -0.5, 0.5, 1, 1.5, 2]), b2 = U.biasVal();
    const act2 = pick(U.ACTS);
    const z2 = U.round(a1 * w2 + b2, 3), a2 = actVal(act2, z2);
    const fig = `<div style="display:flex;flex-direction:column;gap:4px;align-items:center">
      ${F.neuron({ inputs: xs.map((x, i) => ({ label: U.uX(i + 1), value: x, w: ws[i], wLabel: U.uW(1, i + 1, 1) })), bias: b1, showValues: true, act: act1.short, outLabel: U.uA(1, 1) })}
      <div style="font-size:26px;color:var(--accent);line-height:1">⤵ <span style="font-size:13px;color:var(--muted)">a₁⁽¹⁾ wird Eingabe von Neuron 2</span></div>
      ${F.neuron({ inputs: [{ label: U.uA(1, 1), w: w2, wLabel: U.uW(1, 1, 2) }], bias: b2, act: act2.short, outLabel: 'ŷ' })}</div>`;
    return {
      type: 'multi',
      prompt: `<b>Boss: Neuronen-Kette.</b> Die Ausgabe des ersten Neurons ist die einzige Eingabe des zweiten Neurons. Rechne den kompletten Weg bis zur Vorhersage ŷ.`,
      figure: fig,
      given: [`Neuron 1: φ₁ = ${act1.short} (${act1.formula})`, `Neuron 2: φ₂ = ${act2.short} (${act2.formula})`],
      steps: [
        { label: `Voraktivierung ${Z(1, 1)} des ersten Neurons`, varLabel: 'z₁⁽¹⁾', answer: z1, explain: `${calcExpr(xs, ws, b1)} = ${fmt(z1)}` },
        { label: `Ausgabe ${A(1, 1)} = φ₁(${Z(1, 1)})`, varLabel: 'a₁⁽¹⁾', answer: a1, tol: actTol(act1), explain: `${act1.short}(${fmt(z1)}) = ${fmt(a1, 2)}` },
        { label: `Voraktivierung ${Z(1, 2)} des zweiten Neurons`, varLabel: 'z₁⁽²⁾', answer: z2, explain: `${fmt(a1, 2)}·(${fmt(w2)}) + (${fmt(b2)}) = ${fmt(z2)}` },
        { label: `Vorhersage ŷ = φ₂(${Z(1, 2)})`, varLabel: 'ŷ', answer: a2, tol: actTol(act2), hint: actHint(act2), explain: `${act2.short}(${fmt(z2)}) = ${fmt(a2, 2)}${act2.id === 'sigmoid' ? ' · ' + sigSteps(z2) : ''}` },
      ],
      explain: `Forward-Pass: z₁⁽¹⁾ = ${fmt(z1)} → a₁⁽¹⁾ = ${fmt(a1, 2)} → z₁⁽²⁾ = ${fmt(z2)} → ŷ = <b>${fmt(a2, 2)}</b>. Die Ausgabe a eines Neurons ist die Eingabe des nächsten.`,
    };
  }

  // ============================================================
  // BOSS 2: Kleines Netz 2-2-1 komplett (Forward-Pass)
  // ============================================================
  function genNetBoss() {
    const xs = [pick([1, 2, 3, 0.5]), pick([1, 2, -1, 0.5])];
    const w = [[U.weightVal(), U.weightVal()], [U.weightVal(), U.weightVal()]]; // w[j-1][i-1] Schicht 1
    const b1 = [U.biasVal(), U.biasVal()];
    const act1 = pick(U.ACTS.filter(a => a.id !== 'sigmoid'));
    const z11 = U.round(xs[0] * w[0][0] + xs[1] * w[0][1] + b1[0], 3), a11 = actVal(act1, z11);
    const z21 = U.round(xs[0] * w[1][0] + xs[1] * w[1][1] + b1[1], 3), a21 = actVal(act1, z21);
    const v = [U.weightVal(), U.weightVal()], b2 = U.biasVal();
    const act2 = pick(U.ACTS);
    const z12 = U.round(a11 * v[0] + a21 * v[1] + b2, 3), yhat = actVal(act2, z12);
    return {
      type: 'multi',
      prompt: `<b>Boss: kompletter Forward-Pass.</b> Zwei Eingaben, Schicht 1 mit zwei Neuronen (φ = ${act1.short}), Schicht 2 mit einem Ausgabeneuron (φ = ${act2.short}). Rechne bis zur Vorhersage ŷ.`,
      figure: F.network({ inputs: 2, layers: [2, 1], outputLabel: U.uA(1, 2) }),
      given: [`${X(1)} = <b>${fmt(xs[0])}</b>`, `${X(2)} = <b>${fmt(xs[1])}</b>`,
        `${W(1, 1, 1)} = <b>${fmt(w[0][0])}</b>`, `${W(1, 2, 1)} = <b>${fmt(w[0][1])}</b>`, `${B(1, 1)} = <b>${fmt(b1[0])}</b>`,
        `${W(2, 1, 1)} = <b>${fmt(w[1][0])}</b>`, `${W(2, 2, 1)} = <b>${fmt(w[1][1])}</b>`, `${B(2, 1)} = <b>${fmt(b1[1])}</b>`,
        `${W(1, 1, 2)} = <b>${fmt(v[0])}</b>`, `${W(1, 2, 2)} = <b>${fmt(v[1])}</b>`, `${B(1, 2)} = <b>${fmt(b2)}</b>`,
        `φ Schicht 1: ${act1.formula}`, `φ Schicht 2: ${act2.formula}`],
      steps: [
        { label: `${Z(1, 1)} (Neuron 1, Schicht 1)`, varLabel: 'z₁⁽¹⁾', answer: z11, explain: `${fmt(xs[0])}·(${fmt(w[0][0])}) + ${fmt(xs[1])}·(${fmt(w[0][1])}) + (${fmt(b1[0])}) = ${fmt(z11)}` },
        { label: `${A(1, 1)} = ${act1.short}(${Z(1, 1)})`, varLabel: 'a₁⁽¹⁾', answer: a11, explain: `${act1.short}(${fmt(z11)}) = ${fmt(a11)}` },
        { label: `${Z(2, 1)} (Neuron 2, Schicht 1)`, varLabel: 'z₂⁽¹⁾', answer: z21, explain: `${fmt(xs[0])}·(${fmt(w[1][0])}) + ${fmt(xs[1])}·(${fmt(w[1][1])}) + (${fmt(b1[1])}) = ${fmt(z21)}` },
        { label: `${A(2, 1)} = ${act1.short}(${Z(2, 1)})`, varLabel: 'a₂⁽¹⁾', answer: a21, explain: `${act1.short}(${fmt(z21)}) = ${fmt(a21)}` },
        { label: `${Z(1, 2)} (Ausgabeneuron) – Eingaben sind ${A(1, 1)} und ${A(2, 1)}`, varLabel: 'z₁⁽²⁾', answer: z12, explain: `${fmt(a11)}·(${fmt(v[0])}) + ${fmt(a21)}·(${fmt(v[1])}) + (${fmt(b2)}) = ${fmt(z12)}` },
        { label: `ŷ = ${act2.short}(${Z(1, 2)})`, varLabel: 'ŷ', answer: yhat, tol: actTol(act2), hint: actHint(act2), explain: `${act2.short}(${fmt(z12)}) = ${fmt(yhat, 2)}${act2.id === 'sigmoid' ? ' · ' + sigSteps(z12) : ''}` },
      ],
      explain: `Schicht 1: a₁⁽¹⁾ = ${fmt(a11)}, a₂⁽¹⁾ = ${fmt(a21)}. Schicht 2: z₁⁽²⁾ = a₁⁽¹⁾·w₁₁⁽²⁾ + a₂⁽¹⁾·w₁₂⁽²⁾ + b₁⁽²⁾ = ${fmt(z12)} → ŷ = <b>${fmt(yhat, 2)}</b>.`,
    };
  }

  // ============================================================
  // REGISTRIERUNG
  // ============================================================
  BrainForge.registerTopic({
    id: 'dl1',
    title: 'Deep Learning I – Das künstliche Neuron',
    subtitle: 'FSTI-107 · ML vs. DL, Neuron, Aktivierung, Notation, Forward-Pass',
    description: 'Alles aus den Folien 0 & 1: Unterschied ML/DL, Aufbau eines Neurons (Gewichte, Bias, Voraktivierung z, Aktivierungsfunktion φ), die vier Aktivierungsfunktionen, Notation w<sub>ji</sub><sup>(l)</sup> und Rechnen durch ein kleines Netz.',
    emoji: '🧠',
    color: '#3df2c2',
    sheet: [
      { id: 'mldl', title: 'ML vs. Deep Learning', rows: [
        { f: '1. Klassisch: Daten, Regeln & Filter → Ergebnis', d: 'Regeln werden programmiert' },
        { f: '2. ML: Daten & bekannte Ergebnisse → Lernen → Modell', d: 'Features werden manuell vorgegeben' },
        { f: '3. DL: Rohdaten → mehrere lernende Schichten → Ausgabe', d: 'Netz lernt Features selbst; tiefe neuronale Netze' },
      ]},
      { id: 'neuron', title: 'Das künstliche Neuron', rows: [
        { f: 'z = x₁w₁ + x₂w₂ + … + xₙwₙ + b', d: 'Voraktivierung: jede Eingabe mal Gewicht, alles addieren, Bias dazu' },
        { f: 'a = φ(z)', d: 'Aktivierungsfunktion φ macht aus z die Ausgabe; letzte Ausgabe im Netz = ŷ' },
        { f: 'Reihenfolge: gewichten → summieren → Bias → φ', d: '' },
        { f: 'w = 0: Eingabe ohne Einfluss · w &lt; 0: wirkt entgegengesetzt', d: 'Bias verschiebt die Entscheidungsgrenze (ab wann das Neuron reagiert)' },
        { f: 'y = wahrer Wert · ŷ = Vorhersage des Modells', d: 'Ziel: ŷ = f(x) möglichst nah an y' },
      ]},
      { id: 'acts', title: 'Aktivierungsfunktionen', rows: [
        { f: 'Identität (linear): φ(z) = z', d: 'gibt z unverändert weiter' },
        { f: 'Schwelle: φ(z) = 0 für z ≤ 0, 1 für z &gt; 0', d: 'nur „aus“ oder „an“' },
        { f: 'ReLU: φ(z) = max(0, z)', d: 'negativ → 0, positiv bleibt' },
        { f: 'Sigmoid: φ(z) = 1 / (1 + e⁻ᶻ)', d: 'begrenzt auf 0…1 · Rechenweg: −z bilden → e⁻ᶻ → 1 + … → 1 ÷ …' },
        { f: 'σ(0) = 0,5 · σ(1) ≈ 0,73 · σ(2) ≈ 0,88 · σ(−1) ≈ 0,27 · σ(−2) ≈ 0,12', d: 'Symmetrie: σ(−z) = 1 − σ(z) · z&lt;0 → unter 0,5 · z&gt;0 → über 0,5' },
      ]},
      { id: 'notation', title: 'Notation im Netz', rows: [
        { f: 'w<sub>ji</sub><sup>(l)</sup>: (l) = Zielschicht · j = zu welchem Neuron · i = von welchem Neuron/Eingang', d: 'Merke: erst wohin, dann woher' },
        { f: 'a<sub>j</sub><sup>(l)</sup> = Ausgabe von Neuron j in Schicht l · ebenso z<sub>j</sub><sup>(l)</sup>, b<sub>j</sub><sup>(l)</sup>', d: '' },
        { f: 'z<sub>j</sub><sup>(l)</sup> = Σ<sub>i=1…n<sub>l−1</sub></sub> w<sub>ji</sub><sup>(l)</sup> · a<sub>i</sub><sup>(l−1)</sup> + b<sub>j</sub><sup>(l)</sup>', d: 'Eingänge kommen aus Schicht l−1; Summe über n<sub>l−1</sub> Eingänge; a⁽⁰⁾ = x' },
        { f: 'Forward Pass: Schicht für Schicht z und a berechnen, bis ŷ herauskommt', d: 'Ausgabe a einer Schicht = Eingabe der nächsten' },
      ]},
      { id: 'symbols', title: 'Symbole', rows: [
        { f: 'x Eingabe · xᵢ einzelne Eingabe · n Anzahl der Eingaben · Σ Summenzeichen', d: '' },
        { f: 'y Zielwert · ŷ Vorhersage · z Voraktivierung · a Aktivierung · b Bias · φ Aktivierungsfunktion', d: '' },
        { f: '∈ „ist Element von“ · ℕ natürliche Zahlen · ℕ₀ mit Null · ℝ reelle Zahlen', d: 'Eingaben, Gewichte, Bias ∈ ℝ · Indizes ∈ ℕ' },
      ]},
    ],
    categories: [
      { id: 'ml-vs-dl', sheetRef: 'mldl', title: 'ML vs. Deep Learning', desc: 'Begriffe, Definitionen, Varianten der Datenverarbeitung', tier: 1, generate: () => genConcept(CONCEPTS_ML) },
      { id: 'symbole', sheetRef: 'symbols', title: 'Symbole & Formelsammlung', desc: 'a, b, z, φ, ŷ, Σ, ℕ, ℝ …', tier: 1, generate: genSymbol },
      { id: 'z-berechnen', sheetRef: 'neuron', title: 'Voraktivierung z berechnen', desc: 'Gewichtete Summe + Bias', tier: 1, weight: 1.3, generate: genZ },
      { id: 'akt-anwenden', sheetRef: 'acts', title: 'Aktivierungsfunktion anwenden', desc: 'z gegeben → a = φ(z)', tier: 1, weight: 1.3, generate: genActApply },
      { id: 'akt-erkennen', sheetRef: 'acts', title: 'Aktivierungsfunktion erkennen', desc: 'Graph, Beschreibung oder Formel → Name', tier: 1, generate: genActIdentify },
      { id: 'neuron-konzepte', sheetRef: 'neuron', title: 'Neuron verstehen', desc: 'Bias, Gewichte, Voraktivierung, a vs. ŷ', tier: 2, generate: () => genConcept(CONCEPTS_NEURON) },
      { id: 'neuron-komplett', sheetRef: 'acts', title: 'Neuron komplett rechnen', desc: 'z berechnen und φ anwenden', tier: 2, weight: 1.3, generate: genNeuronFull },
      { id: 'notation-kante', sheetRef: 'notation', title: 'Gewicht im Netz benennen', desc: 'Markierte Kante → w_ji^(l)', tier: 2, weight: 1.3, generate: genEdge },
      { id: 'notation-lesen', sheetRef: 'notation', title: 'Notation lesen', desc: 'Was bedeuten l, j, i? a_j^(l)?', tier: 2, generate: genNotationRead },
      { id: 'formel-indizes', sheetRef: 'notation', title: 'Formel mit Indizes', desc: 'z_j^(l) = Σ w_ji^(l) a_i^(l−1) + b_j^(l)', tier: 3, generate: genFormula },
      { id: 'schicht-rechnen', sheetRef: 'notation', title: 'Neuron in Schicht 2', desc: 'Mit Schicht-Notation rechnen (2 Schritte)', tier: 3, weight: 1.3, generate: genLayerCalc },
      { id: 'akt-vergleich', sheetRef: 'acts', title: 'Aktivierungen vergleichen', desc: 'Ein z, alle vier Funktionen', tier: 3, generate: genActCompare },
      { id: 'boss-kette', sheetRef: 'notation', title: 'Boss: Neuronen-Kette', desc: 'Forward-Pass über zwei Neuronen (4 Schritte)', tier: 3, boss: true, generate: genChainBoss },
      { id: 'boss-netz', sheetRef: 'notation', title: 'Boss: Netz 2-2-1', desc: 'Kompletter Forward-Pass (6 Schritte)', tier: 3, boss: true, generate: genNetBoss },
    ],
  });
})();
