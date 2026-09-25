/* ============ Thema: Übungsfragen der Lehrkraft (Fragensammlung) ============
   Fragen aus der Fragensammlung im Bildungscampus, nach Bereichen gruppiert.
   Neue Fragen einfach unten in BANK ergänzen – jede Frage braucht eine cat
   (siehe CATS) und entweder choice-Felder (q, c, w, e) oder match-Felder (q, pairs, e).
   Pro Kategorie wird ohne Wiederholung gezogen, bis alle Fragen einmal dran waren. */
(function () {
  const U = BrainForge.utils;
  const { shuffle } = U;

  // ---------- Grafik zu Frage 1: Neuron mit nummerierten Feldern ----------
  const neuronSlots = (() => {
    const C = { line: '#3a4a6e', text: '#e6ecff', slot: '#ffb347', node: '#172240', arrow: '#3df2c2' };
    const box = (x, y, n) => `<rect x="${x - 22}" y="${y - 16}" width="44" height="32" rx="7" fill="#0a1020" stroke="${C.slot}" stroke-width="2"/><text x="${x}" y="${y + 6}" fill="${C.slot}" font-size="16" font-weight="700" text-anchor="middle">${n}</text>`;
    const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2 - 8}" y2="${y2}" stroke="${C.arrow}" stroke-width="3"/><polygon points="${x2 - 10},${y2 - 6} ${x2},${y2} ${x2 - 10},${y2 + 6}" fill="${C.arrow}"/>`;
    let s = `<svg viewBox="0 0 760 230" width="760" height="230" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, monospace">`;
    const ys = [50, 115, 180];
    ys.forEach((y, k) => { s += arrow(62, y, 238 + (k === 1 ? 0 : 12), y === 115 ? 115 : y + (y < 115 ? 18 : -18)); });
    s += `<circle cx="310" cy="115" r="78" fill="${C.node}" stroke="${C.line}" stroke-width="3"/>`;
    s += arrow(388, 115, 470, 115) + arrow(516, 115, 580, 115) + arrow(626, 115, 690, 115);
    ys.forEach((y, k) => { s += box(40, y, k + 1); });
    ys.forEach((y, k) => { s += box(150, y - 22, k + 4); });
    s += box(310, 115, 7) + box(430, 82, 8) + box(493, 115, 9) + box(603, 115, 10) + box(730, 115, 11);
    return s + '</svg>';
  })();

  const CATS = {
    grund: { title: 'Grundbegriffe', desc: 'x, y, ŷ, Gewicht, Bias, Voraktivierung', tier: 1 },
    zuordnung: { title: 'Zuordnen', desc: 'Symbole & Aktivierungsfunktionen zuordnen', tier: 1 },
    aktivierung: { title: 'Aktivierung verstehen', desc: 'Was folgt aus z? Wozu dient φ?', tier: 2 },
    notation: { title: 'Netz-Notation', desc: 'l, j, n_{l−1}, w_ji^(l) im Netz', tier: 2 },
    rechnen: { title: 'Neuron rechnen', desc: 'z und ReLU-Ausgabe als Zahl', tier: 1 },
    linear: { title: 'Lineare Funktionen', desc: 'm und b bestimmen, komponentenweise anwenden', tier: 2 },
    relu: { title: 'ReLU & Nichtlinearität', desc: 'Knickstellen, z², Annäherung an Kurven', tier: 2 },
    matrix: { title: 'Gewichtsmatrix & Bias', desc: 'W und b aufstellen, lesen und rechnen', tier: 3 },
  };

  // ---------- Fragen-Datenbank ----------
  const BANK = [
    // Frage 1 – Neuron beschriften
    { id: 'f1', cat: 'aufbau', type: 'match', keepOrder: true,
      q: 'Welcher Begriff bzw. welches Symbol gehört in welches <b>nummerierte Feld</b> des künstlichen Neurons?',
      figure: neuronSlots,
      pairs: [
        { label: 'Feld 1 (oberste Eingabe)', answer: 'x₁' }, { label: 'Feld 2 (mittlere Eingabe)', answer: 'x₂' }, { label: 'Feld 3 (unterste Eingabe)', answer: 'xₙ' },
        { label: 'Feld 4 (Gewicht oben)', answer: 'w₁' }, { label: 'Feld 5 (Gewicht Mitte)', answer: 'w₂' }, { label: 'Feld 6 (Gewicht unten)', answer: 'wₙ' },
        { label: 'Feld 7 (im Neuron)', answer: 'Σ' }, { label: 'Feld 8 (über dem Ausgangspfeil)', answer: '+b' },
        { label: 'Feld 9', answer: 'z' }, { label: 'Feld 10', answer: 'φ(z)' }, { label: 'Feld 11 (ganz rechts)', answer: 'a' },
      ],
      e: 'Der Weg durchs Neuron von links nach rechts: <b>Eingaben x₁, x₂, …, xₙ</b> → jede Eingabe wird mit ihrem <b>Gewicht w₁, w₂, …, wₙ</b> multipliziert → im Neuron wird <b>summiert (Σ)</b> → der <b>Bias +b</b> kommt dazu → das Ergebnis ist die <b>Voraktivierung z</b> → die <b>Aktivierungsfunktion φ(z)</b> verarbeitet z → heraus kommt die <b>Ausgabe a</b>.' },
    // Frage 2 – Aktivierungsfunktionen zuordnen
    { id: 'f2', cat: 'zuordnung', type: 'match',
      q: 'Welche <b>Aktivierungsfunktion</b> passt zu welcher Beschreibung?',
      pairs: [
        { label: 'Die Voraktivierung wird unverändert weitergegeben.', answer: 'Lineare Funktion / Identitätsfunktion' },
        { label: 'Die Ausgabe liegt zwischen 0 und 1.', answer: 'Sigmoid-Funktion' },
        { label: 'Negative Werte werden zu 0, positive werden unverändert weitergegeben.', answer: 'ReLU' },
        { label: 'Die Ausgabe ist entweder 0 oder 1.', answer: 'Schwellenfunktion' },
      ],
      e: 'Identität: φ(z) = z · Sigmoid: 1/(1+e⁻ᶻ), immer zwischen 0 und 1 · ReLU: max(0, z) · Schwelle: nur 0 oder 1. Achtung Verwechslungsgefahr: <b>Sigmoid</b> liefert <i>jeden</i> Wert zwischen 0 und 1, die <b>Schwelle</b> nur genau 0 oder 1.' },
    // Frage 3 – Symbole zuordnen
    { id: 'f3', cat: 'zuordnung', type: 'match',
      q: 'Welche <b>Bedeutung</b> gehört zu welchem Symbol?',
      pairs: [
        { label: '<span class="formula">ŷ</span>', answer: 'Vorhersage des Modells' },
        { label: '<span class="formula">b</span>', answer: 'Bias' },
        { label: '<span class="formula">a</span>', answer: 'Ausgabe / Aktivierung eines Neurons' },
        { label: '<span class="formula">z</span>', answer: 'Voraktivierung' },
        { label: '<span class="formula">wᵢ</span>', answer: 'Gewicht einer Eingabe' },
        { label: '<span class="formula">φ</span>', answer: 'Aktivierungsfunktion' },
        { label: '<span class="formula">y</span>', answer: 'tatsächlicher Zielwert' },
        { label: '<span class="formula">xᵢ</span>', answer: 'einzelne Eingabe' },
      ],
      e: 'Eselsbrücke: y ohne Hut = die <b>Wahrheit</b>, ŷ mit Hut = die <b>Schätzung</b> des Modells. z kommt <i>vor</i> φ (Voraktivierung), a kommt <i>nach</i> φ (Aktivierung).' },
    // Frage 4
    { id: 'f4', cat: 'aktivierung', q: 'Welche Aufgabe hat die <b>Aktivierungsfunktion</b> eines künstlichen Neurons?',
      c: 'Sie verarbeitet die Voraktivierung z und erzeugt daraus die Ausgabe a.',
      w: ['Sie bestimmt die Anzahl der Eingaben des Neurons.', 'Sie berechnet ausschließlich die Gewichte des Neurons.', 'Sie ersetzt den Bias b.'],
      e: 'a = φ(z): Die gewichtete Summe plus Bias liefert z, die Aktivierungsfunktion macht daraus die Ausgabe a. Gewichte und Bias sind eigene Parameter – φ ändert an ihnen nichts.' },
    // Frage 5
    { id: 'f5', cat: 'notation', q: 'Was beschreibt <b>n<sub>l−1</sub></b> in der Formel <span class="formula">z<sub>j</sub><sup>(l)</sup> = Σ<sub>i=1</sub><sup>n<sub>l−1</sub></sup> w<sub>ji</sub><sup>(l)</sup> a<sub>i</sub><sup>(l−1)</sup> + b<sub>j</sub><sup>(l)</sup></span>?',
      c: 'Die Anzahl der Elemente bzw. Eingaben aus der vorherigen Schicht',
      w: ['Die Nummer der letzten Schicht', 'Die Anzahl der Aktivierungsfunktionen', 'Die Nummer des Zielneurons'],
      e: 'n<sub>l−1</sub> ist die obere Grenze der Summe: Es wird über alle Eingänge summiert, und die kommen aus Schicht l−1. Die letzte Schicht heißt L, das Zielneuron ist j.' },
    // Frage 6
    { id: 'f6', cat: 'aktivierung', q: 'Für Neuron 1 in Schicht 2 wurde <b>z<sub>1</sub><sup>(2)</sup> = −2</b> berechnet. Welche Aussage ist richtig?',
      c: 'Die Ausgabe hängt davon ab, welche Aktivierungsfunktion für das Neuron verwendet wird.',
      w: ['Die Ausgabe ist immer a<sub>1</sub><sup>(2)</sup> = −2.', 'Die Ausgabe ist immer a<sub>1</sub><sup>(2)</sup> = 0.', 'Nach der Berechnung von z<sub>1</sub><sup>(2)</sup> ist keine weitere Berechnung mehr notwendig.'],
      e: 'Nach z kommt immer noch φ. Bei z = −2: Identität → −2 · Schwelle → 0 · ReLU → 0 · Sigmoid → ≈ 0,12. Ohne zu wissen, welches φ verwendet wird, steht die Ausgabe also nicht fest.' },
    // Frage 7
    { id: 'f7', cat: 'notation', q: 'Ein Netz hat Schicht 1 mit n₁ = 2, Schicht 2 mit n₂ = 1 und Schicht 3 mit n₃ = 2 Neuronen. Das Neuron in Schicht 2 erzeugt die Ausgabe <b>a<sub>1</sub><sup>(2)</sup></b>, die mit beiden Neuronen in Schicht 3 verbunden ist. Welche Bedeutung hat a<sub>1</sub><sup>(2)</sup> für die Neuronen in Schicht 3?',
      c: 'a<sub>1</sub><sup>(2)</sup> dient als Eingabe für die Neuronen in Schicht 3.',
      w: ['a<sub>1</sub><sup>(2)</sup> ist automatisch die Vorhersage ŷ des gesamten Netzes.', 'a<sub>1</sub><sup>(2)</sup> bestimmt die Anzahl der Neuronen in Schicht 3.', 'a<sub>1</sub><sup>(2)</sup> wird zum Bias der Neuronen in Schicht 3.'],
      e: 'Die Ausgabe einer Schicht ist die Eingabe der nächsten. ŷ wäre sie nur, wenn Schicht 2 die letzte Schicht wäre – hier folgt aber noch Schicht 3.' },
    // Frage 8
    { id: 'f8', cat: 'notation', q: 'Schicht 1 und Schicht 2 haben je 2 Neuronen. Gesucht ist das Gewicht der Verbindung <b>von Neuron 2 aus Schicht 1 zu Neuron 1 in Schicht 2</b>. Wie lautet die korrekte Bezeichnung?',
      c: '<span class="formula">w<sub>12</sub><sup>(2)</sup></span>',
      w: ['<span class="formula">w<sub>12</sub><sup>(1)</sup></span>', '<span class="formula">w<sub>21</sub><sup>(2)</sup></span>', '<span class="formula">w<sub>21</sub><sup>(1)</sup></span>'],
      e: 'w<sub>ji</sub><sup>(l)</sup>: hochgestellt die Schicht, <b>in die</b> die Verbindung führt (2), dann <b>zu</b> welchem Neuron (j = 1), dann <b>von</b> welchem Neuron (i = 2) → w<sub>12</sub><sup>(2)</sup>. Merke: erst wohin, dann woher.' },
    // Frage 9
    { id: 'f9', cat: 'aktivierung', q: 'Für ein Neuron wurde die Voraktivierung <b>z = −2</b> berechnet. Welche Aussage ist richtig?',
      c: 'Die Ausgabe a hängt davon ab, welche Aktivierungsfunktion verwendet wird.',
      w: ['Aus z kann grundsätzlich keine Ausgabe bestimmt werden.', 'Die Ausgabe a ist immer −2.', 'Die Ausgabe a ist immer 0.'],
      e: 'Dieselbe Idee wie bei der Frage zu z<sub>1</sub><sup>(2)</sup>: a = φ(z). Identität → −2, ReLU und Schwelle → 0, Sigmoid → ≈ 0,12.' },
    // Frage 10
    { id: 'f10', cat: 'notation', q: 'Was bezeichnet <b>l</b> in unserer Netznotation?',
      c: 'Die Schicht, in der sich das aktuell betrachtete Neuron befindet',
      w: ['Die Nummer der Eingabe', 'Die Ausgabe des gesamten Modells', 'Die Anzahl aller Gewichte'],
      e: 'l steht immer hochgestellt in Klammern, z.B. a<sub>j</sub><sup>(l)</sup> oder w<sub>ji</sub><sup>(l)</sup>. Die Nummer der Eingabe ist i, die Ausgabe des Modells ist ŷ.' },
    // Frage 11
    { id: 'f11', cat: 'notation', q: 'Was bezeichnet der Index <b>j</b>, zum Beispiel in <span class="formula">a<sub>j</sub><sup>(l)</sup></span>?',
      c: 'Das Neuron innerhalb der Schicht l',
      w: ['Die vorherige Schicht', 'Die Aktivierungsfunktion', 'Die Anzahl der Eingaben'],
      e: 'a<sub>j</sub><sup>(l)</sup> = Ausgabe von Neuron j in Schicht l. Die vorherige Schicht wäre l−1, die Anzahl der Eingaben n<sub>l−1</sub>.' },
    // Frage 12
    { id: 'f12', cat: 'notation', q: 'Was beschreibt das Gewicht <span class="formula">w<sub>21</sub><sup>(2)</sup></span>?',
      c: 'Die Verbindung von Neuron 1 in Schicht 1 zu Neuron 2 in Schicht 2.',
      w: ['Das Gewicht des zweiten Eingangs von Neuron 1 in Schicht 1.', 'Die Verbindung von Neuron 2 in Schicht 1 zu Neuron 1 in Schicht 2.', 'Die Verbindung von Neuron 2 in Schicht 2 zu Neuron 1 in Schicht 3.'],
      e: 'Hochgestellt (2) = Zielschicht 2 · erster Index 2 = <b>zu</b> Neuron 2 · zweiter Index 1 = <b>von</b> Neuron 1 (in Schicht 2−1 = 1). Die Falle ist Antwort „Neuron 2 → Neuron 1“ – das wäre w<sub>12</sub><sup>(2)</sup>.' },
    // Frage 13
    { id: 'f13', cat: 'grund', q: 'Was ist ein <b>zentraler Unterschied</b> zwischen klassischem Machine Learning und Deep Learning?',
      c: 'Beim klassischen Machine Learning werden Merkmale häufig vorgegeben, beim Deep Learning können Merkmalsrepräsentationen aus den Daten gelernt werden.',
      w: ['Deep Learning funktioniert ohne Modell.', 'Deep Learning arbeitet nur mit Bildern.', 'Machine Learning braucht keine Daten.'],
      e: 'Klassisches ML: ein Mensch legt Features fest (z.B. Kanten, Mittelwerte). Deep Learning: das Netz lernt die Merkmale aus den Rohdaten selbst. Beide brauchen Daten und ein Modell, und DL funktioniert auch mit Text, Audio oder Sensordaten.' },
    // Frage 14
    { id: 'f14', cat: 'grund', q: 'Wofür steht <b>x</b> im Zusammenhang mit einem Modell?',
      c: 'Für die Eingabedaten', w: ['Für den tatsächlichen Zielwert', 'Für die Vorhersage des Modells', 'Für die Aktivierungsfunktion'],
      e: 'x = Eingabe · y = tatsächlicher Zielwert · ŷ = Vorhersage · φ = Aktivierungsfunktion.' },
    // Frage 15
    { id: 'f15', cat: 'grund', q: 'Worin besteht der Unterschied zwischen <b>y</b> und <b>ŷ</b>?',
      c: 'y ist der tatsächliche Zielwert, ŷ ist die Vorhersage des Modells.',
      w: ['y ist die Eingabe, ŷ ist der Bias.', 'y ist die Vorhersage, ŷ ist der Zielwert.', 'y und ŷ bedeuten immer dasselbe.'],
      e: 'Der „Hut“ auf ŷ steht für geschätzt. Das Training soll ŷ möglichst nah an y bringen.' },
    // Frage 16
    { id: 'f16', cat: 'grund', q: 'Wofür steht ein Gewicht <b>wᵢ</b> in einem künstlichen Neuron?',
      c: 'Es bestimmt, wie stark und in welche Richtung eine Eingabe xᵢ in die Berechnung eingeht.',
      w: ['Es bestimmt, wie stark eine Eingabe xᵢ in die Berechnung eingeht.', 'Es zählt die Anzahl der Eingaben.', 'Es ist immer gleich dem Zielwert y.', 'Es ist die Aktivierungsfunktion.'],
      e: 'Die Falle ist die fast gleiche Antwort ohne „Richtung“. Ein Gewicht bestimmt auch die <b>Richtung</b>: ein negatives Gewicht wirkt hemmend, ein positives verstärkend. Deshalb ist nur die vollständige Antwort richtig.' },
    // Frage 17
    { id: 'f17', cat: 'grund', q: 'Was bedeutet <b>wᵢ = 0</b>?',
      c: 'Die zugehörige Eingabe xᵢ hat keinen Einfluss auf die gewichtete Summe.',
      w: ['Das gesamte Neuron gibt immer 0 aus.', 'Die Aktivierungsfunktion wird übersprungen.', 'Der Bias wird ebenfalls 0.'],
      e: 'xᵢ · 0 = 0, der Term fällt aus der Summe. Die anderen Eingaben und der Bias wirken weiter, deshalb gibt das Neuron nicht automatisch 0 aus.' },
    // Frage 18
    { id: 'f18', cat: 'grund', q: 'Was beschreibt die <b>Voraktivierung z</b>?',
      c: 'Das Zwischenergebnis aus gewichteter Summe und Bias',
      w: ['Die Menge der Eingaben', 'Die Anzahl der Neuronen', 'Die endgültige Vorhersage des gesamten Modells'],
      e: 'z = Σ xᵢwᵢ + b ist ein Zwischenergebnis. Erst nach φ entsteht die Ausgabe a, und erst die Ausgabe der letzten Schicht ist ŷ.' },
    // Frage 19
    { id: 'f19', cat: 'grund', q: 'Welche Formel beschreibt die <b>Voraktivierung</b> eines künstlichen Neurons korrekt?',
      c: '<span class="formula">z = Σ<sub>i=1</sub><sup>n</sup> xᵢwᵢ + b</span>',
      w: ['<span class="formula">z = Σ<sub>i=1</sub><sup>n</sup> xᵢ + wᵢ + b</span>', '<span class="formula">z = y − ŷ</span>', '<span class="formula">z = φ(xᵢ)</span>'],
      e: 'Eingabe <b>mal</b> Gewicht, nicht plus. y − ŷ wäre ein Fehler (Loss-Thema), φ kommt erst nach z.' },
    // Frage 20
    { id: 'f20', cat: 'grund', q: 'Welche Aussage zum <b>Bias b</b> ist richtig?',
      c: 'Der Bias verschiebt die Berechnung des Neurons unabhängig von den Eingaben.',
      w: ['Der Bias ist identisch mit dem Gewicht wᵢ.', 'Der Bias ist eine zusätzliche Eingabe.', 'Der Bias ist immer 0.'],
      e: 'b wird zur gewichteten Summe addiert, egal welche Eingaben anliegen. Damit verschiebt er, ab wann das Neuron reagiert (Entscheidungsgrenze). Er ist ein eigener, lernbarer Parameter.' },

    // ===================== Fragen 21–40 =====================
    // Frage 21
    { id: 'f21', cat: 'aktivierung', q: 'Was macht die Aktivierungsfunktion <b>φ(z)</b>?',
      c: 'Sie bestimmt, wie die Voraktivierung z weiterverarbeitet wird.',
      w: ['Sie ersetzt die Gewichte.', 'Sie addiert die Eingaben.', 'Sie berechnet den Zielwert y.'],
      e: 'φ nimmt z und macht daraus die Ausgabe a. Das Addieren der Eingaben passiert vorher (gewichtete Summe), und den Zielwert y kennt man aus den Daten, den berechnet das Neuron nicht.' },
    // Frage 22
    { id: 'f22', cat: 'rechnen', type: 'numeric', label: 'z<sub>1</sub><sup>(2)</sup>',
      q: 'Schicht 1 hat zwei Neuronen (n₁ = 2), Schicht 2 ein Neuron (n₂ = 1). Wir betrachten Neuron j = 1 in Schicht l = 2. Berechne die Voraktivierung <b>z<sub>1</sub><sup>(2)</sup></b>.',
      given: ['a<sub>1</sub><sup>(1)</sup> = <b>2</b>', 'a<sub>2</sub><sup>(1)</sup> = <b>3</b>', 'w<sub>11</sub><sup>(2)</sup> = <b>0,5</b>', 'w<sub>12</sub><sup>(2)</sup> = <b>−1</b>', 'b<sub>1</sub><sup>(2)</sup> = <b>0</b>'],
      answer: -2,
      e: '<span class="formula">z<sub>1</sub><sup>(2)</sup> = a<sub>1</sub><sup>(1)</sup>·w<sub>11</sub><sup>(2)</sup> + a<sub>2</sub><sup>(1)</sup>·w<sub>12</sub><sup>(2)</sup> + b<sub>1</sub><sup>(2)</sup> = 2·0,5 + 3·(−1) + 0 = 1 − 3 = <b>−2</b></span>. Das ist genau die Aufgabe aus Foliensatz 1.' },
    // Frage 23
    { id: 'f23', cat: 'rechnen', type: 'numeric', label: 'a<sub>1</sub><sup>(2)</sup>',
      q: 'Für Neuron 1 in Schicht 2 wurde <b>z<sub>1</sub><sup>(2)</sup> = −2</b> berechnet. Es wird ReLU verwendet: a<sub>1</sub><sup>(2)</sup> = max(0, z<sub>1</sub><sup>(2)</sup>). Berechne die Ausgabe.',
      answer: 0,
      e: 'max(0, −2) = <b>0</b>. ReLU nimmt immer den größeren der beiden Werte, und 0 ist größer als −2.' },
    // Frage 24
    { id: 'f24', cat: 'rechnen', type: 'numeric', label: 'a',
      q: 'Für ein Neuron wurde die Voraktivierung <b>z = −3</b> berechnet. Als Aktivierungsfunktion wird ReLU verwendet. Welchen Wert hat die Ausgabe a?',
      answer: 0,
      e: 'ReLU(−3) = max(0, −3) = <b>0</b>. Jede negative Voraktivierung wird bei ReLU zu 0.' },
    // Frage 25 – Reihenfolge
    { id: 'f25', cat: 'aufbau', type: 'match', keepOrder: true,
      q: 'Bring die Verarbeitungsschritte eines künstlichen Neurons in die <b>richtige Reihenfolge</b>. Welcher Schritt steht an welcher Stelle?',
      pairs: [
        { label: '1. Schritt', answer: 'Eingaben xᵢ' }, { label: '2. Schritt', answer: 'Gewichtung mit wᵢ' },
        { label: '3. Schritt', answer: 'gewichtete Summe' }, { label: '4. Schritt', answer: 'Bias b addieren' },
        { label: '5. Schritt', answer: 'Voraktivierung z' }, { label: '6. Schritt', answer: 'Aktivierungsfunktion φ(z)' },
        { label: '7. Schritt', answer: 'Ausgabe a' },
      ],
      e: 'Eingaben → mit Gewichten multiplizieren → aufsummieren → Bias dazu → das ergibt z → φ anwenden → Ausgabe a. Es ist exakt die Reihenfolge der Formeln z = Σ xᵢwᵢ + b und a = φ(z). Im Bildungscampus sortierst du die Liste per Drag & Drop, hier ordnest du jedem Platz den passenden Schritt zu.' },
    // Frage 26
    { id: 'f26', cat: 'notation', type: 'tf', answer: false,
      q: 'Wahr oder falsch? <i>„Eine Verbindung führt von Neuron 1 in Schicht 1 zu Neuron 2 in Schicht 2. Das zugehörige Gewicht trägt die hochgestellte Schichtnummer (1), da die Verbindung aus Schicht 1 kommt.“</i>',
      e: '<b>Falsch.</b> Die hochgestellte Zahl ist die Schicht, in die die Verbindung <b>führt</b>, also (2). Das Gewicht heißt w<sub>21</sub><sup>(2)</sup>: zu Neuron 2, von Neuron 1, in Schicht 2.' },
    // Frage 27
    { id: 'f27', cat: 'aktivierung', type: 'tf', answer: true,
      q: 'Wahr oder falsch? <i>„Bei der ReLU-Funktion gilt für negative Werte der Voraktivierung z: Die Ausgabe a ist 0.“</i>',
      e: '<b>Wahr.</b> ReLU(z) = max(0, z): Für jedes negative z ist 0 der größere Wert.' },
    // Frage 28
    { id: 'f28', cat: 'aktivierung', type: 'tf', answer: false,
      q: 'Wahr oder falsch? <i>„Die Voraktivierung z und die Ausgabe a eines Neurons sind immer gleich.“</i>',
      e: '<b>Falsch.</b> a = φ(z). Nur bei der Identitätsfunktion ist a = z. Bei ReLU, Schwelle oder Sigmoid kommt meist etwas anderes heraus, z.B. z = −2 → ReLU gibt 0.' },
    // Frage 29
    { id: 'f29', cat: 'linear', type: 'multi',
      q: 'Gegeben sind die Punkte <b>P₁ = (1 | 5)</b> und <b>P₂ = (4 | 11)</b>. Bestimme die lineare Funktion <b>f(x) = m·x + b</b>.',
      steps: [
        { label: 'Steigung m', varLabel: 'm', answer: 2, explain: '(11 − 5) / (4 − 1) = 6 / 3 = 2' },
        { label: 'Achsenabschnitt b', varLabel: 'b', answer: 3, explain: '5 = 2·1 + b → b = 3' },
      ],
      e: '<span class="formula">f(x) = 2x + 3</span>. Probe mit P₂: 2·4 + 3 = 11 ✓. Achtung: Hier heißt der Achsenabschnitt b, im Neuron entspricht er genau dem Bias.' },
    // Frage 30
    { id: 'f30', cat: 'relu', type: 'multi',
      q: 'Ein einzelnes Neuron erhält den Eingang <b>x = −3</b>. Es gilt w<sup>(1)</sup> = 1, b<sup>(1)</sup> = 0, und die Aktivierungsfunktion ist <b>φ(z) = z²</b>.',
      steps: [
        { label: 'Berechne die Ausgabe ŷ des Neurons', varLabel: 'ŷ', answer: 9, explain: 'z = 1·(−3) + 0 = −3 → ŷ = (−3)² = 9' },
        { label: 'Welche Eigenschaft von φ(z) = z² kann problematisch sein?', options: [
          { html: 'Positive und negative Werte gleichen Betrags führen zur gleichen Aktivierung.', correct: true },
          { html: 'Die Aktivierungsfunktion ist eine lineare Funktion.' },
          { html: 'Die Aktivierungsfunktion verändert den Wert von z grundsätzlich nicht.' },
          { html: 'Die Aktivierungsfunktion kann ausschließlich negative Ausgabewerte erzeugen.' }] },
      ],
      e: '(−3)² = 3² = 9: Das Neuron kann nicht mehr unterscheiden, ob die Eingabe −3 oder +3 war, die Vorzeichen-Information geht verloren. Zweites Problem aus Foliensatz 3: Die Werte wachsen über mehrere Schichten stark an.' },
    // Frage 31
    { id: 'f31', cat: 'relu', type: 'multi',
      q: 'Gegeben ist der Voraktivierungsvektor <b>z</b><sup>(1)</sup> = (−4 | 2 | 0 | −1). Als Aktivierungsfunktion wird ReLU verwendet: φ(z) = max(0, z). Bestimme den Aktivierungsvektor <b>a</b><sup>(1)</sup>.',
      steps: [
        { label: 'a₁ = ReLU(−4)', varLabel: 'a₁', answer: 0 },
        { label: 'a₂ = ReLU(2)', varLabel: 'a₂', answer: 2 },
        { label: 'a₃ = ReLU(0)', varLabel: 'a₃', answer: 0 },
        { label: 'a₄ = ReLU(−1)', varLabel: 'a₄', answer: 0 },
        { label: 'Welche Aussage über ReLU ist korrekt?', options: [
          { html: 'ReLU ist stückweise linear, aber insgesamt keine lineare Funktion.', correct: true },
          { html: 'ReLU quadriert alle positiven Werte.' },
          { html: 'ReLU ist eine Identitätsfunktion für alle Werte von z.' },
          { html: 'ReLU erzeugt ausschließlich Werte kleiner oder gleich 0.' }] },
      ],
      e: '<b>a</b><sup>(1)</sup> = (0 | 2 | 0 | 0). ReLU wird elementweise angewendet. Links von 0 ist ReLU eine waagerechte Linie, rechts eine Gerade mit Steigung 1. Jedes Stück ist linear, wegen des Knicks bei 0 ist die Funktion insgesamt aber nicht linear.' },
    // Frage 32
    { id: 'f32', cat: 'relu', type: 'multi',
      q: 'Die ReLU-Aktivierungsfunktion ist stückweise linear. Trotzdem können Netze mit ReLU auch gekrümmte, nichtlineare Zusammenhänge annähern. Beantworte die vier Teilfragen.',
      steps: [
        { label: 'Welche Aussage beschreibt ReLU korrekt?', options: [
          { html: 'ReLU ist stückweise linear und besitzt eine Knickstelle bei z = 0.', correct: true },
          { html: 'ReLU ist über ihren gesamten Definitionsbereich eine einzige lineare Funktion.' },
          { html: 'ReLU ist eine quadratische Funktion.' },
          { html: 'ReLU besitzt keine Stelle, an der sich die Steigung ändert.' }] },
        { label: 'Welche Bedeutung können unterschiedliche Gewichte und Bias-Werte mehrerer ReLU-Neuronen haben?', options: [
          { html: 'Sie können dazu führen, dass die Knickstellen verschiedener Neuronen an unterschiedlichen Stellen liegen.', correct: true },
          { html: 'Sie haben nur Einfluss auf die Bezeichnung der Neuronen, nicht auf deren Berechnung.' },
          { html: 'Sie sorgen dafür, dass jedes ReLU-Neuron automatisch x² berechnet.' },
          { html: 'Unterschiedliche Gewichte und Bias-Werte machen die Aktivierungsfunktion überflüssig.' }] },
        { label: 'Warum können mehrere ReLU-Neuronen gemeinsam eine gekrümmte Funktion zunehmend besser annähern?', options: [
          { html: 'Mehrere passend angeordnete Knickstellen ermöglichen eine feinere stückweise lineare Annäherung an eine gekrümmte Funktion.', correct: true },
          { html: 'Weil jedes zusätzliche Neuron die Eingabewerte quadriert.' },
          { html: 'Weil durch mehrere Neuronen keine Knickstellen mehr vorhanden sind.' },
          { html: 'Weil mehrere ReLU-Neuronen zusammen automatisch eine exakte quadratische Formel bilden.' }] },
        { label: 'Welche Aussage zur Approximation von f(x) = x² durch ein ReLU-Netz ist korrekt?', options: [
          { html: 'Ein ReLU-Netz kann f(x) = x² auf einem begrenzten Bereich durch mehrere lineare Abschnitte annähern.', correct: true },
          { html: 'ReLU-Netze können grundsätzlich nur lineare Zusammenhänge darstellen.' },
          { html: 'Damit ein ReLU-Netz x² annähern kann, muss jedes Gewicht denselben Wert besitzen.' },
          { html: 'Ein einzelnes ReLU-Neuron stellt f(x) = x² für alle Werte exakt dar.' }] },
      ],
      e: 'Die Kette der Idee: ReLU hat genau einen Knick (bei z = 0) → Gewicht und Bias verschieben diesen Knick → viele Neuronen = viele Knicke an verschiedenen Stellen → daraus entsteht ein Streckenzug, der eine Kurve wie x² immer feiner nachbildet. Exakt wird es nie, und es gilt nur auf einem begrenzten Bereich.' },
    // Frage 33
    { id: 'f33', cat: 'relu', type: 'multi',
      q: 'Ein Neuron berechnet die Voraktivierung <b>z<sup>(1)</sup> = 2x − 4</b> und verwendet anschließend ReLU: a<sup>(1)</sup> = max(0, z<sup>(1)</sup>).',
      steps: [
        { label: 'Bei welchem Wert von x liegt die Knickstelle der Aktivierung?', varLabel: 'x', answer: 2, explain: 'Knick dort, wo z = 0: 2x − 4 = 0 → x = 2' },
        { label: 'Berechne die Aktivierung für x = 1', varLabel: 'a<sup>(1)</sup>', answer: 0, explain: 'z = 2·1 − 4 = −2 → max(0, −2) = 0' },
        { label: 'Berechne die Aktivierung für x = 3', varLabel: 'a<sup>(1)</sup>', answer: 2, explain: 'z = 2·3 − 4 = 2 → max(0, 2) = 2' },
        { label: 'Welche Aussage beschreibt die Wirkung des Bias in diesem Beispiel am besten?', options: [
          { html: 'Der Bias kann die Stelle verschieben, an der die ReLU ihre Knickstelle besitzt.', correct: true },
          { html: 'Der Bias sorgt dafür, dass ReLU zu einer quadratischen Aktivierungsfunktion wird.' },
          { html: 'Der Bias hat keinen Einfluss darauf, bei welchem Eingangswert die Voraktivierung 0 wird.' },
          { html: 'Der Bias bestimmt ausschließlich, wie groß die positive Steigung der ReLU ist.' }] },
      ],
      e: 'Ohne Bias (z = 2x) läge der Knick bei x = 0. Der Bias −4 verschiebt ihn nach x = 2. Genau so erzeugen mehrere ReLU-Neuronen Knicke an unterschiedlichen Stellen. Die Steigung (hier 2) kommt vom Gewicht, nicht vom Bias.' },
    // Frage 34
    { id: 'f34', cat: 'matrix', type: 'multi',
      q: 'Vollständig verbundenes Netz mit zwei Eingaben und zwei Neuronen, Aktivierung ReLU. Berechne die Voraktivierungen und Aktivierungen für das Eingabebeispiel <b>x</b>₁.',
      figure: 'MX34',
      steps: [
        { label: 'z<sub>1,1</sub><sup>(1)</sup> (Zeile 1 von W mal x₁, plus b₁)', varLabel: 'z<sub>1,1</sub>', answer: -3, explain: '1·2 + (−2)·3 + 1 = −3' },
        { label: 'z<sub>1,2</sub><sup>(1)</sup> (Zeile 2 von W mal x₁, plus b₂)', varLabel: 'z<sub>1,2</sub>', answer: 6, explain: '2·2 + 1·3 + (−1) = 6' },
        { label: 'a<sub>1,1</sub><sup>(1)</sup> = ReLU(z<sub>1,1</sub>)', varLabel: 'a<sub>1,1</sub>', answer: 0, explain: 'max(0, −3) = 0' },
        { label: 'a<sub>1,2</sub><sup>(1)</sup> = ReLU(z<sub>1,2</sub>)', varLabel: 'a<sub>1,2</sub>', answer: 6, explain: 'max(0, 6) = 6' },
      ],
      e: '<b>z</b> = (−3 | 6) → <b>a</b> = (0 | 6). Zur Schreibweise: Bei z<sub>1,2</sub><sup>(1)</sup> steht die erste Zahl für das Beispiel (x₁), die zweite für das Neuron.' },
    // Frage 35
    { id: 'f35', cat: 'linear', type: 'multi',
      q: 'Für ein Ausgabeneuron gelten die drei Wertepaare <b>(0 | 3)</b>, <b>(2 | −1)</b> und <b>(4 | −5)</b>. Bestimme die lineare Funktion f(x) = m·x + b.',
      steps: [
        { label: 'Steigung m', varLabel: 'm', answer: -2, explain: '(−1 − 3) / (2 − 0) = −4 / 2 = −2' },
        { label: 'Achsenabschnitt b', varLabel: 'b', answer: 3, explain: 'bei x = 0 ist y = 3 → b = 3' },
      ],
      e: '<span class="formula">f(x) = −2x + 3</span>. Probe mit dem dritten Paar: −2·4 + 3 = −5 ✓. Tipp: Wenn ein Paar mit x = 0 dabei ist, kannst du b direkt ablesen.' },
    // Frage 36
    { id: 'f36', cat: 'linear', type: 'multi',
      q: 'Gegeben ist die Funktion <b>f(x) = −2x + 3</b> und der Eingabevektor <b>x</b>₁ = (−1 | 0 | 2 | 4). Die Funktion wird komponentenweise angewendet. Bestimme den Ausgabevektor.',
      steps: [
        { label: 'y<sub>1,1</sub> = f(−1)', varLabel: 'y<sub>1,1</sub>', answer: 5, explain: '−2·(−1) + 3 = 5' },
        { label: 'y<sub>1,2</sub> = f(0)', varLabel: 'y<sub>1,2</sub>', answer: 3, explain: '−2·0 + 3 = 3' },
        { label: 'y<sub>1,3</sub> = f(2)', varLabel: 'y<sub>1,3</sub>', answer: -1, explain: '−2·2 + 3 = −1' },
        { label: 'y<sub>1,4</sub> = f(4)', varLabel: 'y<sub>1,4</sub>', answer: -5, explain: '−2·4 + 3 = −5' },
      ],
      e: 'Ausgabevektor (5 | 3 | −1 | −5). Komponentenweise heißt: Jeder Eintrag wird einzeln in f eingesetzt. Vorsicht bei −2·(−1): Minus mal Minus ergibt Plus.' },
    // Frage 37
    { id: 'f37', cat: 'matrix', type: 'multi',
      q: 'Netz mit 3 Eingaben und 3 Ausgabeneuronen, Aktivierung = Identität. Es sollen gelten:<br><span class="formula">ŷ<sub>m,1</sub> = 2x<sub>m,1</sub> − x<sub>m,3</sub> + 1</span> <span class="formula">ŷ<sub>m,2</sub> = x<sub>m,1</sub> + 3x<sub>m,2</sub> − 2</span> <span class="formula">ŷ<sub>m,3</sub> = −x<sub>m,2</sub> + 2x<sub>m,3</sub> + 4</span><br>Bestimme Gewichtsmatrix <b>W</b><sup>(1)</sup> und Bias-Vektor <b>b</b><sup>(1)</sup> – Zeile für Zeile.',
      steps: [
        { label: 'Zeile 1: w₁₁ (Koeffizient von x₁ in ŷ₁)', varLabel: 'w₁₁', answer: 2 },
        { label: 'Zeile 1: w₁₂ (Koeffizient von x₂ in ŷ₁)', varLabel: 'w₁₂', answer: 0, explain: 'x₂ kommt in ŷ₁ nicht vor' },
        { label: 'Zeile 1: w₁₃ (Koeffizient von x₃ in ŷ₁)', varLabel: 'w₁₃', answer: -1 },
        { label: 'b₁ (Konstante in ŷ₁)', varLabel: 'b₁', answer: 1 },
        { label: 'Zeile 2: w₂₁', varLabel: 'w₂₁', answer: 1 },
        { label: 'Zeile 2: w₂₂', varLabel: 'w₂₂', answer: 3 },
        { label: 'Zeile 2: w₂₃', varLabel: 'w₂₃', answer: 0, explain: 'x₃ kommt in ŷ₂ nicht vor' },
        { label: 'b₂', varLabel: 'b₂', answer: -2 },
        { label: 'Zeile 3: w₃₁', varLabel: 'w₃₁', answer: 0, explain: 'x₁ kommt in ŷ₃ nicht vor' },
        { label: 'Zeile 3: w₃₂', varLabel: 'w₃₂', answer: -1 },
        { label: 'Zeile 3: w₃₃', varLabel: 'w₃₃', answer: 2 },
        { label: 'b₃', varLabel: 'b₃', answer: 4 },
      ],
      figure: 'MX37',
      e: 'Regel: Zeile j gehört zu ŷ<sub>j</sub>, Spalte i zu x<sub>i</sub>. Jeder Koeffizient kommt in seine Spalte, fehlende Eingaben bekommen eine 0, die Konstante wandert in den Bias. Häufigster Fehler: das Minus bei −x vergessen (das ist der Koeffizient −1).' },
    // Frage 38
    { id: 'f38', cat: 'matrix', type: 'multi',
      q: 'Netz mit 3 Eingaben und 3 Ausgabeneuronen, φ<sup>(1)</sup>(z) = z. Damit gilt <b>ŷ</b> = <b>a</b><sup>(1)</sup> = <b>z</b><sup>(1)</sup> = <b>W</b><sup>(1)</sup><b>x</b> + <b>b</b><sup>(1)</sup>. Berechne den Ausgabevektor <b>ŷ</b>₁.',
      figure: 'MX38',
      steps: [
        { label: 'ŷ<sub>1,1</sub> (Zeile 1)', varLabel: 'ŷ<sub>1,1</sub>', answer: 1, explain: '1·2 + 2·(−1) + 0·3 + 1 = 1' },
        { label: 'ŷ<sub>1,2</sub> (Zeile 2)', varLabel: 'ŷ<sub>1,2</sub>', answer: 5, explain: '(−1)·2 + 0·(−1) + 3·3 + (−2) = 5' },
        { label: 'ŷ<sub>1,3</sub> (Zeile 3)', varLabel: 'ŷ<sub>1,3</sub>', answer: -8, explain: '0·2 + 2·(−1) + (−2)·3 + 0 = −8' },
        { label: 'Welche Aussage erklärt, warum hier direkt ŷ₁ = z<sup>(1)</sup> gilt?', options: [
          { html: 'Weil die Identitätsfunktion den Wert von z unverändert weitergibt.', correct: true },
          { html: 'Weil der Bias-Vektor immer 0 ist.' },
          { html: 'Weil die Gewichtsmatrix quadratisch ist.' },
          { html: 'Weil bei einer Ausgabeschicht keine Aktivierungsfunktion verwendet werden darf.' }] },
      ],
      e: '<b>ŷ</b>₁ = (1 | 5 | −8). Mit φ(z) = z ist a = z, und weil es die letzte Schicht ist, ist a gleich ŷ. Der Bias ist hier gar nicht 0 (b = (1 | −2 | 0)).' },
    // Frage 39
    { id: 'f39', cat: 'matrix', type: 'multi',
      q: 'Gegeben sind Gewichtsmatrix und Bias-Vektor, Aktivierung = Identität. Bestimme die Funktion des <b>zweiten</b> Ausgabeneurons: <span class="formula">ŷ<sub>m,2</sub> = □·x<sub>m,1</sub> + □·x<sub>m,2</sub> + □·x<sub>m,3</sub> + □</span>',
      figure: 'MX39',
      steps: [
        { label: 'Koeffizient von x<sub>m,1</sub>', varLabel: 'w₂₁', answer: 1 },
        { label: 'Koeffizient von x<sub>m,2</sub>', varLabel: 'w₂₂', answer: 3 },
        { label: 'Koeffizient von x<sub>m,3</sub>', varLabel: 'w₂₃', answer: 0 },
        { label: 'Konstante (Bias)', varLabel: 'b₂', answer: -1 },
      ],
      e: 'Neuron 2 = <b>Zeile 2</b> von W: (1 | 3 | 0), dazu b₂ = −1 → ŷ<sub>m,2</sub> = x<sub>m,1</sub> + 3x<sub>m,2</sub> − 1. Das ist die Umkehrung von Frage 37: dort Funktion → Matrix, hier Matrix → Funktion.' },
    // Frage 40
    { id: 'f40', cat: 'matrix', type: 'multi',
      q: 'Gegeben ist die Gewichtsmatrix W<sup>(1)</sup>. Beantworte beide Teilaufgaben zum Gewicht <b>w<sub>23</sub><sup>(1)</sup></b>.',
      figure: 'MX40',
      steps: [
        { label: 'Welchen Wert besitzt w<sub>23</sub><sup>(1)</sup>?', varLabel: 'w<sub>23</sub>', answer: 4, explain: 'Zeile 2, Spalte 3 → 4' },
        { label: 'Welche Aussage beschreibt w<sub>23</sub><sup>(1)</sup> korrekt?', options: [
          { html: 'Eingang x₃ wirkt auf Neuron 2.', correct: true },
          { html: 'Neuron 3 wirkt auf Eingang x₂.' },
          { html: 'Eingang x₂ wirkt auf Neuron 3.' },
          { html: 'w<sub>23</sub><sup>(1)</sup> bezeichnet den Bias von Neuron 2.' }] },
      ],
      e: 'w<sub>ji</sub>: erster Index = Zeile = Ziel-Neuron (2), zweiter Index = Spalte = Eingang (3). Also Zeile 2, Spalte 3 = 4, und x₃ wirkt mit Gewicht 4 auf Neuron 2.' },
  ];

  // ---------- Ziehen ohne Wiederholung ----------
  const decks = {};
  const draw = (key, pool) => { if (!decks[key] || !decks[key].length) decks[key] = shuffle(pool); return decks[key].pop(); };
  const mtx = (rows) => `<table class="mtx"><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const col = (arr) => mtx(arr.map(v => [v]));
  const row = (parts) => `<div class="mxrow">${parts.join(' ')}</div>`;
  const FIG = {
    MX34: row(['<b>W</b><sup>(1)</sup> =', mtx([['1', '−2'], ['2', '1']]), '&nbsp; <b>b</b><sup>(1)</sup> =', col(['1', '−1']), '&nbsp; <b>x</b>₁ =', col(['2', '3'])]),
    MX37: row(['<b>W</b><sup>(1)</sup> =', mtx([['w₁₁', 'w₁₂', 'w₁₃'], ['w₂₁', 'w₂₂', 'w₂₃'], ['w₃₁', 'w₃₂', 'w₃₃']]), '&nbsp; <b>b</b><sup>(1)</sup> =', col(['b₁', 'b₂', 'b₃'])]),
    MX38: row(['<b>W</b><sup>(1)</sup> =', mtx([['1', '2', '0'], ['−1', '0', '3'], ['0', '2', '−2']]), '&nbsp; <b>b</b><sup>(1)</sup> =', col(['1', '−2', '0']), '&nbsp; <b>x</b>₁ =', col(['2', '−1', '3'])]),
    MX39: row(['<b>W</b><sup>(1)</sup> =', mtx([['2', '0', '−1'], ['1', '3', '0'], ['0', '−2', '4']]), '&nbsp; <b>b</b><sup>(1)</sup> =', col(['2', '−1', '3'])]),
    MX40: row(['<b>W</b><sup>(1)</sup> =', mtx([['1', '−2', '0'], ['0', '3', '4'], ['5', '0', '−1']])]),
  };
  const toChallenge = (q) => {
    const figure = FIG[q.figure] || q.figure;
    if (q.type === 'match') return { type: 'match', prompt: q.q, figure, pairs: q.pairs, keepOrder: q.keepOrder, explain: q.e };
    if (q.type === 'numeric') return { type: 'numeric', prompt: q.q, figure, given: q.given, label: q.label, answer: q.answer, explain: q.e };
    if (q.type === 'multi') return { type: 'multi', prompt: q.q, figure, given: q.given, steps: q.steps, explain: q.e };
    if (q.type === 'tf') return { type: 'choice', keepOrder: true, prompt: q.q, figure, options: [{ html: 'Wahr', correct: q.answer === true }, { html: 'Falsch', correct: q.answer === false }], explain: q.e };
    return { type: 'choice', prompt: q.q, figure, options: [{ html: q.c, correct: true }, ...q.w.map(w => ({ html: w }))], explain: q.e };
  };
  const gen = (cat) => () => toChallenge(draw(cat, BANK.filter(q => q.cat === cat)));

  const sheets = ['dl1', 'dl2', 'dl3'].map(id => BrainForge.topics.find(t => t.id === id)).filter(Boolean).flatMap(t => t.sheet || []);

  BrainForge.registerTopic({
    id: 'fs',
    intro: 'Hier stehen die Fragen aus der <b>Fragensammlung der Lehrkraft</b> im Bildungscampus. Sie decken den Stoff aus Thema 1 bis 3 ab.<br><br><b>Wofür ist das gut?</b> Genau so sehen die Fragen in der Prüfung aus. Die Kategorien sind nach Bereichen sortiert. Mit „Alle Fragen“ gehst du die Sammlung einmal komplett ohne Wiederholungen durch, wie in einer Probeklausur.<br><br>Tipp: Viele falsche Antworten sind absichtlich <b>fast richtig</b> (z.B. „wie stark“ statt „wie stark und in welche Richtung“). Lies immer alle Antworten, bevor du wählst.',
    title: 'Übungsfragen der Lehrkraft',
    subtitle: 'FSTI-107 · Fragensammlung aus dem Bildungscampus',
    description: 'Die Fragen aus der Fragensammlung der Lehrkraft, mit Erklärungen, warum die anderen Antworten falsch sind. Enthält Zuordnungs-, Rechen-, Wahr/Falsch- und Matrixaufgaben wie in der Prüfung.',
    emoji: '📝',
    color: '#5ab8ff',
    sheet: sheets.length ? sheets : undefined,
    categories: [
      ...Object.entries(CATS).map(([id, c]) => ({
        id: 'fs-' + id, title: c.title, desc: c.desc, tier: c.tier,
        sheetRef: { grund: 'neuron', zuordnung: 'symbols', aktivierung: 'acts', notation: 'notation', rechnen: 'neuron', linear: 'gerade', relu: 'nl', matrix: 'rechnen' }[id],
        generate: gen(id),
      })),
      { id: 'fs-alle', title: 'Alle Fragen (Probeklausur)', desc: 'Die ganze Sammlung einmal ohne Wiederholung', tier: 3, sheetRef: 'neuron',
        generate: () => toChallenge(draw('alle', BANK)) },
      { id: 'fs-aufbau', title: 'Boss: Aufbau des Neurons', desc: 'Neuron beschriften & Schritte sortieren', tier: 3, boss: true, sheetRef: 'neuron',
        primer: { what: 'Jeder Baustein des Neurons an seinen Platz: Eingaben, Gewichte, Summe, Bias, Voraktivierung, Aktivierungsfunktion, Ausgabe.',
          why: 'Wer das Bild im Kopf hat, kann jede Formel zum Neuron herleiten. In der Prüfung gibt es dafür 11 Punkte, so viele wie für keine andere Frage.',
          ex: 'Von links nach rechts: x → ·w → Σ → +b → z → φ(z) → a. Die Reihenfolge folgt genau der Rechnung z = Σ xᵢwᵢ + b, a = φ(z).' },
        generate: gen('aufbau') },
    ],
  });
  BrainForge.fsBank = BANK; // für Tests
})();
