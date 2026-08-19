/* ============ VORLAGE für ein neues Themenpaket ============
   1. Diese Datei kopieren, z.B. nach js/topics/dl2-training.js
   2. id/title/emoji/color anpassen und Kategorien mit generate()-Funktionen füllen
   3. In index.html einbinden:  <script src="js/topics/dl2-training.js"></script>
   (Die Datei _template.js selbst ist NICHT eingebunden.)

   Jede generate()-Funktion gibt EINE zufällige Aufgabe zurück. Drei Aufgabentypen:

   numeric: { type:'numeric', prompt, figure?, given?, answer, tol?, hint?, explain }
   choice:  { type:'choice',  prompt, figure?, given?, options:[{html, correct:true}, {html}, ...], explain }
   multi:   { type:'multi',   prompt, figure?, given?, steps:[{label, varLabel?, answer, tol?, explain?}, ...], explain }
            (multi-Schritte können statt answer auch options:[...] haben)

   Hilfen: BrainForge.utils (rnd, pick, shuffle, fmt, W/A/Z/B/X-Notation, ACTS, sigmoid, ...)
           BrainForge.figures (network, neuron, plot, table) */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt } = U;
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];

  // --- Beispiel 1: Wissensfrage aus einem Pool ---
  const FRAGEN = [
    { q: 'Beispielfrage?', c: 'Richtige Antwort', w: ['Falsch 1', 'Falsch 2', 'Falsch 3'], e: 'Erklärung, die nach der Antwort angezeigt wird.' },
  ];
  const genFrage = () => { const f = pick(FRAGEN); return { type: 'choice', prompt: f.q, options: opts(f.c, f.w), explain: f.e }; };

  // --- Beispiel 2: Rechenaufgabe mit Zufallszahlen ---
  const genRechnen = () => {
    const a = rnd(1, 9), b = rnd(1, 9);
    return { type: 'numeric', prompt: `Berechne <b>${a} · ${b}</b>.`, answer: a * b, explain: `${a} · ${b} = ${a * b}` };
  };

  // --- Beispiel 3: Mehrschrittig ---
  const genSchritte = () => {
    const a = rnd(1, 5), b = rnd(1, 5);
    return {
      type: 'multi', prompt: `Erst addieren, dann verdoppeln: a = ${a}, b = ${b}`,
      steps: [
        { label: 'Summe a + b', varLabel: 's', answer: a + b },
        { label: 'Verdoppeln: 2 · s', varLabel: 'r', answer: 2 * (a + b) },
      ],
      explain: `(${a} + ${b}) · 2 = ${2 * (a + b)}`,
    };
  };

  BrainForge.registerTopic({
    id: 'template',                       // eindeutig, wird für Speicherung genutzt
    title: 'Neues Thema',
    subtitle: 'Kurzbeschreibung',
    description: 'Längere Beschreibung fürs Themenmenü (HTML erlaubt).',
    emoji: '📘',
    color: '#ffb347',
    categories: [
      // tier 1 = leicht, 2 = mittel, 3 = schwer; boss:true = Endgegner der Kampagne
      { id: 'wissen', title: 'Wissensfragen', desc: 'Begriffe', tier: 1, generate: genFrage },
      { id: 'rechnen', title: 'Rechnen', desc: 'Zahlen', tier: 2, weight: 1.5, generate: genRechnen },
      { id: 'boss', title: 'Boss: Schrittweise', desc: 'Mehrschrittig', tier: 3, boss: true, generate: genSchritte },
    ],
  });
})();
