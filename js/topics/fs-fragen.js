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
  ];

  // ---------- Ziehen ohne Wiederholung ----------
  const decks = {};
  const draw = (key, pool) => { if (!decks[key] || !decks[key].length) decks[key] = shuffle(pool); return decks[key].pop(); };
  const toChallenge = (q) => {
    const figure = q.figure;
    if (q.type === 'match') return { type: 'match', prompt: q.q, figure, pairs: q.pairs, keepOrder: q.keepOrder, explain: q.e };
    return { type: 'choice', prompt: q.q, figure, options: [{ html: q.c, correct: true }, ...q.w.map(w => ({ html: w }))], explain: q.e };
  };
  const gen = (cat) => () => toChallenge(draw(cat, BANK.filter(q => q.cat === cat)));

  const dl1 = BrainForge.topics.find(t => t.id === 'dl1');

  BrainForge.registerTopic({
    id: 'fs',
    intro: 'Hier stehen die Fragen aus der <b>Fragensammlung der Lehrkraft</b> im Bildungscampus. Sie decken den Stoff aus Thema 1 und 2 ab.<br><br><b>Wofür ist das gut?</b> Genau so sehen die Fragen in der Prüfung aus. Die Kategorien sind nach Bereichen sortiert. Mit „Alle Fragen“ gehst du die Sammlung einmal komplett ohne Wiederholungen durch, wie in einer Probeklausur.<br><br>Tipp: Viele falsche Antworten sind absichtlich <b>fast richtig</b> (z.B. „wie stark“ statt „wie stark und in welche Richtung“). Lies immer alle Antworten, bevor du wählst.',
    title: 'Übungsfragen der Lehrkraft',
    subtitle: 'FSTI-107 · Fragensammlung aus dem Bildungscampus',
    description: 'Die Fragen aus der Fragensammlung der Lehrkraft, mit Erklärungen, warum die anderen Antworten falsch sind. Enthält Zuordnungsaufgaben wie in der Prüfung.',
    emoji: '📝',
    color: '#5ab8ff',
    sheet: dl1 ? dl1.sheet : undefined,
    categories: [
      ...Object.entries(CATS).map(([id, c]) => ({
        id: 'fs-' + id, title: c.title, desc: c.desc, tier: c.tier,
        sheetRef: { grund: 'neuron', zuordnung: 'symbols', aktivierung: 'acts', notation: 'notation' }[id],
        generate: gen(id),
      })),
      { id: 'fs-alle', title: 'Alle Fragen (Probeklausur)', desc: 'Die ganze Sammlung einmal ohne Wiederholung', tier: 3, sheetRef: 'neuron',
        generate: () => toChallenge(draw('alle', BANK)) },
      { id: 'fs-aufbau', title: 'Boss: Neuron beschriften', desc: '11 Felder im Neuron zuordnen', tier: 3, boss: true, sheetRef: 'neuron',
        primer: { what: 'Jeder Baustein des Neurons an seinen Platz: Eingaben, Gewichte, Summe, Bias, Voraktivierung, Aktivierungsfunktion, Ausgabe.',
          why: 'Wer das Bild im Kopf hat, kann jede Formel zum Neuron herleiten. In der Prüfung gibt es dafür 11 Punkte, so viele wie für keine andere Frage.',
          ex: 'Von links nach rechts: x → ·w → Σ → +b → z → φ(z) → a. Die Reihenfolge folgt genau der Rechnung z = Σ xᵢwᵢ + b, a = φ(z).' },
        generate: gen('aufbau') },
    ],
  });
  BrainForge.fsBank = BANK; // für Tests
})();
