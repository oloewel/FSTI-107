/* ============ Thema: Deep Learning IV – Training: Loss, Gradient & SGD ============
   FSTI-107, Foliensatz 4: Trainingszyklus (Epoche), Fehlermaße (Abweichung, |e|, e²,
   MAE/MSE/RMSE), Gradient (partielle Ableitungen, Interpretation, Berechnung am
   1-Neuron-Beispiel ŷ = wx + b) und Parameter-Update per SGD mit Lernrate η. */
(function () {
  const U = BrainForge.utils, F = BrainForge.figures;
  const { rnd, pick, shuffle, fmt } = U;
  const opts = (correct, wrongs) => [{ html: correct, correct: true }, ...wrongs.map(w => ({ html: w }))];
  const R = (x) => U.round(x, 4);

  // Saubere Zufalls-Setups für ŷ = w·x + b
  function setup() {
    const x = pick([1, 2, 2, 3]), w = pick([0.5, 1, 1, 2, -1]), b = pick([0, 0, 1, -1]);
    let y = pick([4, 6, 6, 8, -2, 2]);
    if (R(w * x + b) === y) y += 2; // Fehler 0 wäre langweilig
    const e = R(w * x + b - y);
    return { x, w, b, y, yh: R(w * x + b), e, gw: R(2 * e * x), gb: R(2 * e) };
  }

  // ============================================================
  // KATEGORIE 1: Der Trainingszyklus
  // ============================================================
  const STEPS = ['Forward Pass', 'Fehler berechnen (Loss)', 'Backpropagation: Gradient bestimmen', 'Parameter mit dem Optimierer anpassen (z.B. SGD)', 'Wiederholen'];
  function genZyklus() {
    const v = rnd(0, 2);
    if (v === 0) {
      const i = rnd(0, 3);
      return { type: 'choice', prompt: `Eine Trainings-Epoche hat 5 Schritte. Was ist <b>Schritt ${i + 1}</b>?`,
        options: opts(STEPS[i], shuffle(STEPS.filter((_, k) => k !== i)).slice(0, 3)),
        explain: `Die Epoche: 1. ${STEPS[0]} → 2. ${STEPS[1]} → 3. ${STEPS[2]} → 4. ${STEPS[3]} → 5. ${STEPS[4]}.` };
    }
    if (v === 1) {
      const good = STEPS.slice(0, 4).join(' → ');
      const w1 = [STEPS[1], STEPS[0], STEPS[2], STEPS[3]].join(' → ');
      const w2 = [STEPS[0], STEPS[2], STEPS[1], STEPS[3]].join(' → ');
      const w3 = [STEPS[3], STEPS[2], STEPS[1], STEPS[0]].join(' → ');
      return { type: 'choice', prompt: 'Welche <b>Reihenfolge</b> der Trainingsschritte ist richtig?',
        options: opts(good, [w1, w2, w3]),
        explain: 'Erst vorwärts rechnen (Forward Pass), dann kann man den Fehler messen, daraus den Gradienten bestimmen und erst dann die Parameter sinnvoll anpassen.' };
    }
    const QA = [
      { q: 'Was macht der Schritt <b>„Gradient bestimmen“</b> (Backpropagation) im Training?', c: 'Er berechnet, wie der Loss auf Änderungen jedes einzelnen Parameters reagiert.',
        w: ['Er löscht falsch klassifizierte Trainingsdaten.', 'Er verdoppelt alle Gewichte.', 'Er wählt zufällig neue Parameter aus.'],
        e: 'Der Gradient sammelt die partiellen Ableitungen ∂L/∂w₁, ∂L/∂w₂, … – die Änderungs-Information für jeden Parameter.' },
      { q: 'Was ist eine <b>Epoche</b>?', c: 'Ein kompletter Durchlauf der Trainingsschritte: Forward Pass, Loss, Gradient, Parameter-Update.',
        w: ['Ein einzelnes Neuron im Netz.', 'Die Anzahl der Eingaben.', 'Der Name der Aktivierungsfunktion.'],
        e: 'Im Notebook laufen diese Schritte in einer Schleife über die Zahl der Epochen – mit jeder Epoche sollte der Loss sinken.' },
      { q: 'Was unterscheidet den Optimierer <b>Adam</b> von einfachem Gradient Descent?', c: 'Adam nimmt ein „Gedächtnis“ mehrerer Schritte mit.',
        w: ['Adam braucht keinen Gradienten.', 'Adam funktioniert nur bei einem einzigen Parameter.', 'Adam vergrößert den Loss absichtlich.'],
        e: 'Von der Folie: Es gibt verschiedene Optimierer – SGD/Batch Gradient Descent, oder z.B. Adam, der Informationen aus mehreren Schritten mitnimmt.' },
      { q: 'Welche Werte <b>lernt</b> das Netz beim Training selbst – und welche werden vorgegeben?', c: 'Gelernt: Gewichte W und Bias b. Vorgegeben: Daten, Architektur, Lernrate, Epochenzahl.',
        w: ['Gelernt: die Trainingsdaten. Vorgegeben: die Gewichte.', 'Gelernt: die Anzahl der Neuronen. Vorgegeben: der Loss.', 'Es wird alles vorgegeben, gelernt wird nichts.'],
        e: 'Genau die Leitfrage aus dem Notebook: W und b verändern sich beim Training – Daten, Architektur und Hyperparameter (η, Epochen) gibt der Mensch vor.' },
    ];
    const q = pick(QA);
    return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e };
  }

  // ============================================================
  // KATEGORIE 2: Einzelnen Fehler berechnen (e, |e|, e²)
  // ============================================================
  function genFehler() {
    const y = pick([4, 6, 8, 10, -2]), yh = pick([1, 2, 3, 5, 7, -4].filter(v => v !== y));
    const e = R(yh - y);
    const which = pick(['einfach', 'abs', 'quad']);
    const map = {
      einfach: { name: 'einfache Abweichung', formula: 'e = ŷ − y', ans: e, note: 'Vorzeichen zeigt die Richtung der Abweichung!' },
      abs: { name: 'absoluter Fehler', formula: '|ŷ − y|', ans: Math.abs(e), note: 'immer positiv' },
      quad: { name: 'quadratischer Fehler', formula: '(ŷ − y)²', ans: R(e * e), note: 'immer positiv, große Abweichungen werden stärker „bestraft“' },
    };
    const m = map[which];
    return { type: 'numeric', label: which === 'einfach' ? 'e' : 'Fehler',
      prompt: `Das Modell sagt <b>ŷ = ${fmt(yh)}</b> vorher, der wahre Wert ist <b>y = ${fmt(y)}</b>. Berechne den <b>${m.name}</b> (${m.formula}).`,
      answer: m.ans,
      explain: `<span class="formula">${m.formula} = ${which === 'quad' ? `(${fmt(yh)} − ${fmt(y)})² = (${fmt(e)})² = <b>${fmt(m.ans)}</b>` : which === 'abs' ? `|${fmt(yh)} − ${fmt(y)}| = <b>${fmt(m.ans)}</b>` : `${fmt(yh)} − ${fmt(y)} = <b>${fmt(m.ans)}</b>`}</span> (${m.note})` };
  }

  // ============================================================
  // KATEGORIE 3: Loss-Konzepte
  // ============================================================
  const KONZEPTE = [
    { q: 'Was ist das Problem der <b>einfachen Abweichung</b> e = ŷ − y als Fehlermaß über viele Datenpunkte?', c: 'Positive und negative Fehler können sich gegenseitig aufheben – der Gesamtfehler sieht kleiner aus, als er ist.',
      w: ['Sie ist zu aufwändig zu berechnen.', 'Sie ist immer positiv.', 'Sie funktioniert nur bei ganzen Zahlen.'],
      e: 'e = +4 und e = −4 ergeben im Mittel 0, obwohl beide Vorhersagen falsch sind. Gut an ihr: das Vorzeichen zeigt die Richtung. Lösung: Betrag (MAE) oder Quadrat (MSE).' },
    { q: 'Warum <b>quadriert</b> der MSE die Fehler?', c: 'Alles wird positiv, und größere Abweichungen werden stärker „bestraft“.',
      w: ['Damit die Rechnung schneller geht.', 'Damit der Fehler immer kleiner als 1 ist.', 'Weil Wurzeln verboten sind.'],
      e: 'Fehler 2 → 4, Fehler 4 → 16: der doppelte Fehler zählt vierfach. Deshalb reagiert der MSE empfindlich auf Ausreißer.' },
    { q: 'Was ist der Vorteil des <b>RMSE</b> gegenüber dem MSE?', c: 'Durch die Wurzel hat er wieder dieselbe Einheit wie y – er ist direkt interpretierbar.',
      w: ['Er ist immer kleiner als der MAE.', 'Er braucht keine Trainingsdaten.', 'Er kann negativ werden.'],
      e: 'MSE misst in „Einheit²“ (z.B. Grad²) – der RMSE = √MSE bringt das zurück auf die ursprüngliche Einheit.' },
    { q: 'Warum testet man nicht einfach für <b>jeden Parameter</b> aus, ob +0,01 oder −0,01 den Loss senkt?', c: 'Bei Millionen von Gewichten wäre das extrem aufwändig – man braucht eine mathematisch bestimmbare Änderungs-Information.',
      w: ['Weil kleine Änderungen den Loss nie verändern.', 'Weil Parameter nur ganze Zahlen sein dürfen.', 'Weil der Loss geheim ist.'],
      e: 'Genau die Folien-Überlegung: Ausprobieren skaliert nicht. Die Lösung ist die Ableitung – sie sagt direkt, wie der Loss auf eine Änderung reagiert.' },
    { q: 'Was ist der <b>Gradient</b>?', c: 'Der Vektor aller partiellen Ableitungen des Loss nach den Parametern – er zeigt im Parameterraum in Richtung des stärksten Anstiegs.',
      w: ['Die Differenz zwischen ŷ und y.', 'Die Anzahl der Epochen.', 'Der größte Wert in der Gewichtsmatrix.'],
      e: '∇L = (∂L/∂w₁, ∂L/∂w₂, …, ∂L/∂b₁, …) – für alle Parameter gleichzeitig die Info, wie sich der Loss ändert.' },
    { q: 'Der Gradient zeigt in Richtung des <b>stärksten Anstiegs</b> des Loss. Wie nutzen wir ihn beim Training?', c: 'Wir bewegen die Parameter in die entgegengesetzte Richtung – dann sinkt der Loss.',
      w: ['Wir folgen ihm exakt – dann steigt der Loss am schnellsten.', 'Wir ignorieren ihn und würfeln neue Parameter.', 'Wir setzen alle Parameter auf null.'],
      e: 'Daher das Minus in der Update-Formel: w_neu = w_alt − η · ∂L/∂w.' },
    { q: 'Wofür ist die <b>Lernrate η</b> zuständig?', c: 'Sie bestimmt, wie groß der Schritt bei der Parameteränderung ist.',
      w: ['Sie zählt die Trainingsbeispiele.', 'Sie legt die Anzahl der Schichten fest.', 'Sie wählt die Aktivierungsfunktion aus.'],
      e: 'w_neu = w_alt − η·∂L/∂w: η skaliert den Gradienten. Zu klein → Training dauert ewig; zu groß → man springt über das Minimum hinweg.' },
    { q: 'Wann entspricht der <b>MSE</b> genau dem quadratischen Fehler eines Punktes?', c: 'Bei nur einem Datenpunkt – erst bei mehreren wird summiert und gemittelt.',
      w: ['Nie, das sind völlig verschiedene Dinge.', 'Nur wenn der Fehler negativ ist.', 'Nur bei η = 1.'],
      e: 'MSE = (1/n)·Σ(ŷᵢ−yᵢ)². Für n = 1 bleibt genau (ŷ−y)² übrig – wie im Folien-Beispiel: (2−6)² = 16.' },
  ];
  const genKonzept = () => { const q = pick(KONZEPTE); return { type: 'choice', prompt: q.q, options: opts(q.c, q.w), explain: q.e }; };

  // ============================================================
  // KATEGORIE 4: MAE / MSE / RMSE über mehrere Punkte
  // ============================================================
  function genLossmass() {
    const n = pick([2, 2, 3]);
    const diffs = Array.from({ length: n }, () => pick([-4, -3, -2, -1, 1, 2, 3, 4]));
    const ys = diffs.map(() => pick([2, 4, 5, 6, 8, 10]));
    const yhs = diffs.map((d, i) => R(ys[i] + d)); // ŷ = y + d, also e = ŷ − y = d
    const mae = R(diffs.reduce((a, d) => a + Math.abs(d), 0) / n);
    const mse = R(diffs.reduce((a, d) => a + d * d, 0) / n);
    const which = pick(['MAE', 'MSE', 'MSE']);
    const ans = which === 'MAE' ? mae : mse;
    const rows = yhs.map((yh, i) => [fmt(yh), fmt(ys[i]), fmt(diffs[i])]);
    return {
      type: 'numeric', label: which,
      prompt: `Berechne den <b>${which === 'MAE' ? 'MAE (Mean Absolute Error)' : 'MSE (Mean Squared Error)'}</b> über die ${n} Trainingsbeispiele.`,
      figure: F.table(['ŷᵢ', 'yᵢ', 'eᵢ = ŷᵢ − yᵢ'], rows),
      given: [which === 'MAE' ? 'MAE = (1/n) · Σ |ŷᵢ − yᵢ|' : 'MSE = (1/n) · Σ (ŷᵢ − yᵢ)²'],
      answer: ans, digits: 2,
      explain: which === 'MAE'
        ? `<span class="formula">MAE = (${diffs.map(d => '|' + fmt(d) + '|').join(' + ')}) / ${n} = ${fmt(diffs.reduce((a, d) => a + Math.abs(d), 0))} / ${n} = <b>${fmt(mae, 2)}</b></span>`
        : `<span class="formula">MSE = (${diffs.map(d => '(' + fmt(d) + ')²').join(' + ')}) / ${n} = ${fmt(diffs.reduce((a, d) => a + d * d, 0))} / ${n} = <b>${fmt(mse, 2)}</b></span> – große Fehler zählen quadratisch!`,
    };
  }

  // ============================================================
  // KATEGORIE 5: Gradient lesen & interpretieren
  // ============================================================
  function genGradLesen() {
    let gw = pick([-16, -8, -4, -2, 2, 4, 8, 16]);
    let gb = pick([-8, -6, -3, -1, 1, 3, 6, 8].filter(v => Math.abs(v) !== Math.abs(gw)));
    const grad = `<span class="formula">∇L = ( ${fmt(gw)} | ${fmt(gb)} )</span> <span class="muted">(oben: ∂L/∂w, unten: ∂L/∂b)</span>`;
    const v = rnd(0, 2);
    if (v === 0) {
      const par = pick(['w', 'b']); const g = par === 'w' ? gw : gb;
      return { type: 'choice',
        prompt: `Gegeben ist der Gradient ${grad}.<br>Was passiert mit dem <b>Loss</b>, wenn man <b>${par}</b> ein kleines Stück <b>vergrößert</b>?`,
        options: opts(g < 0 ? 'Der Loss wird kleiner.' : 'Der Loss wird größer.',
          [g < 0 ? 'Der Loss wird größer.' : 'Der Loss wird kleiner.', 'Der Loss bleibt exakt gleich.', 'Das kann man aus dem Gradienten nicht ablesen.']),
        explain: `∂L/∂${par} = ${fmt(g)} ist ${g < 0 ? 'negativ → ' + par + ' vergrößern senkt den Loss' : 'positiv → ' + par + ' vergrößern erhöht den Loss'}. Genau so liest man den Gradienten – wie auf der Folie mit ∂L/∂w = −4 („w vergrößern → Loss kleiner“).` };
    }
    if (v === 1) {
      const stronger = Math.abs(gw) > Math.abs(gb) ? 'w' : 'b';
      return { type: 'choice',
        prompt: `Gegeben ist der Gradient ${grad}.<br>Auf welchen Parameter reagiert der Loss <b>stärker</b>?`,
        options: opts(`Auf ${stronger} – der Betrag |${fmt(stronger === 'w' ? gw : gb)}| ist größer.`,
          [`Auf ${stronger === 'w' ? 'b' : 'w'} – der Betrag ist größer.`, 'Auf beide exakt gleich stark.', 'Auf keinen – der Gradient sagt nichts über die Stärke.']),
        explain: `Der <b>Betrag</b> der partiellen Ableitung zeigt, wie stark der Loss reagiert: |${fmt(gw)}| vs. |${fmt(gb)}| → ${stronger} wirkt stärker. Das Vorzeichen zeigt nur die Richtung.` };
    }
    return { type: 'choice',
      prompt: `Der Gradient zeigt in Richtung des <b>stärksten Anstiegs</b> des Loss. In welche Richtung verändern wir die Parameter beim Training?`,
      options: opts('Entgegen der Gradientenrichtung – wir wollen den Loss ja verkleinern.',
        ['Genau in Gradientenrichtung.', 'Immer in positive Richtung, egal was der Gradient sagt.', 'Senkrecht zum Gradienten.']),
      explain: 'Deshalb steht in der SGD-Formel ein Minus: w_neu = w_alt − η·∂L/∂w. Bergab statt bergauf!' };
  }

  // ============================================================
  // KATEGORIE 6: SGD-Update (ein Parameter)
  // ============================================================
  function genSgd() {
    const par = pick(['w', 'b']);
    const alt = pick([0, 0.5, 1, 1, 2, -1]);
    const g = pick([-16, -8, -4, -2, 2, 4, 8, 10]);
    const eta = pick([0.05, 0.1, 0.1, 0.25]);
    const neu = R(alt - eta * g);
    return { type: 'numeric', label: `${par}<sub>neu</sub>`,
      prompt: `SGD-Update für einen Parameter: <span class="formula">${par}<sub>neu</sub> = ${par}<sub>alt</sub> − η · ∂L/∂${par}</span>`,
      given: [`${par}<sub>alt</sub> = <b>${fmt(alt)}</b>`, `∂L/∂${par} = <b>${fmt(g)}</b>`, `η = <b>${fmt(eta)}</b>`],
      answer: neu, digits: 2,
      explain: `<span class="formula">${par}<sub>neu</sub> = ${fmt(alt)} − ${fmt(eta)}·(${fmt(g)}) = ${fmt(alt)} ${g < 0 ? '+ ' + fmt(eta * -g) : '− ' + fmt(eta * g)} = <b>${fmt(neu)}</b></span>. Negativer Gradient → Parameter wird größer (Minus mal Minus). Wie auf der Folie: w = 1 − 0,05·(−16) = 1,8.` };
  }

  // ============================================================
  // KATEGORIE 7: Gradient berechnen (∂L/∂w und ∂L/∂b)
  // ============================================================
  function genGradRechnen() {
    const s = setup();
    return {
      type: 'multi',
      prompt: `Ein-Neuron-Modell <b>ŷ = w·x + b</b> mit MSE-Loss (ein Datenpunkt): L = (w·x + b − y)². Berechne den Gradienten.`,
      given: [`x = <b>${fmt(s.x)}</b>`, `y = <b>${fmt(s.y)}</b>`, `w = <b>${fmt(s.w)}</b>`, `b = <b>${fmt(s.b)}</b>`,
        '∂L/∂w = 2·(w·x + b − y)·x', '∂L/∂b = 2·(w·x + b − y)'],
      steps: [
        { label: '∂L/∂w = 2·(w·x + b − y)·x', varLabel: '∂L/∂w', answer: s.gw, explain: `2·(${fmt(s.w)}·${fmt(s.x)} + ${fmt(s.b)} − ${fmt(s.y)})·${fmt(s.x)} = 2·(${fmt(s.e)})·${fmt(s.x)} = ${fmt(s.gw)}` },
        { label: '∂L/∂b = 2·(w·x + b − y)', varLabel: '∂L/∂b', answer: s.gb, explain: `2·(${fmt(s.e)}) = ${fmt(s.gb)}` },
      ],
      explain: `∇L = (${fmt(s.gw)} | ${fmt(s.gb)}). Beide Formeln enthalten den „inneren Fehler“ (w·x + b − y) = ${fmt(s.e)}; bei ∂L/∂w kommt noch ·x dazu (Kettenregel). ${s.gw < 0 ? 'Negative Werte → Parameter vergrößern senkt den Loss.' : 'Positive Werte → Parameter verkleinern senkt den Loss.'}`,
    };
  }

  // ============================================================
  // KATEGORIE 8: Beide Parameter updaten + neue Vorhersage
  // ============================================================
  function genUpdateVoll() {
    const s = setup();
    const eta = pick([0.05, 0.1]);
    const wN = R(s.w - eta * s.gw), bN = R(s.b - eta * s.gb);
    const yhN = R(wN * s.x + bN);
    return {
      type: 'multi',
      prompt: `Der Gradient ist schon berechnet – führe jetzt das <b>SGD-Update</b> für beide Parameter durch und bestimme die neue Vorhersage.`,
      given: [`w<sub>alt</sub> = <b>${fmt(s.w)}</b>`, `b<sub>alt</sub> = <b>${fmt(s.b)}</b>`, `∂L/∂w = <b>${fmt(s.gw)}</b>`, `∂L/∂b = <b>${fmt(s.gb)}</b>`, `η = <b>${fmt(eta)}</b>`, `x = <b>${fmt(s.x)}</b>`, `y = <b>${fmt(s.y)}</b>`],
      steps: [
        { label: 'w<sub>neu</sub> = w<sub>alt</sub> − η·∂L/∂w', varLabel: 'w<sub>neu</sub>', answer: wN, explain: `${fmt(s.w)} − ${fmt(eta)}·(${fmt(s.gw)}) = ${fmt(wN)}` },
        { label: 'b<sub>neu</sub> = b<sub>alt</sub> − η·∂L/∂b', varLabel: 'b<sub>neu</sub>', answer: bN, explain: `${fmt(s.b)} − ${fmt(eta)}·(${fmt(s.gb)}) = ${fmt(bN)}` },
        { label: 'Neue Vorhersage ŷ = w<sub>neu</sub>·x + b<sub>neu</sub>', varLabel: 'ŷ', answer: yhN, explain: `${fmt(wN)}·${fmt(s.x)} + ${fmt(bN)} = ${fmt(yhN)}` },
      ],
      explain: `Vorher: ŷ = ${fmt(s.yh)}, Ziel y = ${fmt(s.y)}. Nach dem Update: ŷ = <b>${fmt(yhN)}</b> – ${Math.abs(yhN - s.y) < Math.abs(s.yh - s.y) ? 'näher am Ziel! Genau das soll ein Trainingsschritt bewirken.' : 'der Schritt war hier zu groß (Lernrate!), das Prinzip bleibt gleich.'} Wie auf der Folie: von ŷ = 2 auf ŷ = 4 bei y = 6.`,
    };
  }

  // ============================================================
  // BOSS: Eine komplette Trainings-Epoche
  // ============================================================
  function genBossEpoche() {
    const s = setup();
    const eta = pick([0.05, 0.1]);
    const L = R(s.e * s.e);
    const wN = R(s.w - eta * s.gw), bN = R(s.b - eta * s.gb);
    const yhN = R(wN * s.x + bN);
    return {
      type: 'multi',
      prompt: `<b>Boss: eine komplette Trainings-Epoche</b> für das Ein-Neuron-Modell ŷ = w·x + b – vom Forward Pass bis zur neuen Vorhersage (wie das Folien-Beispiel mit x=2, y=6).`,
      given: [`x = <b>${fmt(s.x)}</b>`, `y = <b>${fmt(s.y)}</b>`, `w = <b>${fmt(s.w)}</b>`, `b = <b>${fmt(s.b)}</b>`, `η = <b>${fmt(eta)}</b>`,
        'L = (ŷ − y)²', '∂L/∂w = 2·(ŷ − y)·x', '∂L/∂b = 2·(ŷ − y)'],
      steps: [
        { label: '1. Forward Pass: ŷ = w·x + b', varLabel: 'ŷ', answer: s.yh, explain: `${fmt(s.w)}·${fmt(s.x)} + ${fmt(s.b)} = ${fmt(s.yh)}` },
        { label: '2. Loss: L = (ŷ − y)²', varLabel: 'L', answer: L, explain: `(${fmt(s.yh)} − ${fmt(s.y)})² = (${fmt(s.e)})² = ${fmt(L)}` },
        { label: '3a. Gradient: ∂L/∂w = 2·(ŷ − y)·x', varLabel: '∂L/∂w', answer: s.gw, explain: `2·(${fmt(s.e)})·${fmt(s.x)} = ${fmt(s.gw)}` },
        { label: '3b. Gradient: ∂L/∂b = 2·(ŷ − y)', varLabel: '∂L/∂b', answer: s.gb, explain: `2·(${fmt(s.e)}) = ${fmt(s.gb)}` },
        { label: '4a. Update: w<sub>neu</sub> = w − η·∂L/∂w', varLabel: 'w<sub>neu</sub>', answer: wN, explain: `${fmt(s.w)} − ${fmt(eta)}·(${fmt(s.gw)}) = ${fmt(wN)}` },
        { label: '4b. Update: b<sub>neu</sub> = b − η·∂L/∂b', varLabel: 'b<sub>neu</sub>', answer: bN, explain: `${fmt(s.b)} − ${fmt(eta)}·(${fmt(s.gb)}) = ${fmt(bN)}` },
        { label: '5. Neue Vorhersage: ŷ<sub>neu</sub> = w<sub>neu</sub>·x + b<sub>neu</sub>', varLabel: 'ŷ<sub>neu</sub>', answer: yhN, explain: `${fmt(wN)}·${fmt(s.x)} + ${fmt(bN)} = ${fmt(yhN)}` },
      ],
      explain: `Die ganze Epoche: ŷ = ${fmt(s.yh)} → L = ${fmt(L)} → ∇L = (${fmt(s.gw)} | ${fmt(s.gb)}) → w = ${fmt(wN)}, b = ${fmt(bN)} → ŷ<sub>neu</sub> = <b>${fmt(yhN)}</b> (Ziel: ${fmt(s.y)}). Neuer Loss: (${fmt(R(yhN - s.y))})² = ${fmt(R((yhN - s.y) * (yhN - s.y)), 2)} ${R((yhN - s.y) * (yhN - s.y)) < L ? '< ' + fmt(L) + ' – der Loss ist gesunken! ✓' : '– hier war η zu groß.'} Im Notebook läuft genau das in einer Schleife über die Epochen.`,
    };
  }

  // ============================================================
  // REGISTRIERUNG
  // ============================================================
  BrainForge.registerTopic({
    id: 'dl4',
    intro: "Bisher haben wir Gewichte und Bias von Hand bestimmt. Jetzt kommt der spannendste Teil: <b>Das Netz lernt sie selbst.</b><br><br><b>Was wird behandelt?</b> Der Trainingszyklus (Forward Pass → Loss → Gradient → Update → wiederholen), Fehlermaße (MAE, MSE, RMSE), wie man den Gradienten liest und für ein Ein-Neuron-Modell selbst berechnet – und das SGD-Update mit der Lernrate η.<br><br><b>Wofür braucht man das?</b> Training IST Deep Learning – genau so entstehen aus zufälligen Startwerten Modelle wie ChatGPT. Und die Epoche einmal komplett von Hand durchzurechnen (Folien-Beispiel: von ŷ = 2 auf ŷ = 4 bei Ziel 6) ist die perfekte Klausurvorbereitung.",
    title: 'Deep Learning IV – Training: Loss & SGD',
    subtitle: 'FSTI-107 · Trainingszyklus, MAE/MSE/RMSE, Gradient, Lernrate',
    description: 'Foliensatz 4: Was in einer Trainings-Epoche passiert, wie man Fehler misst (einfache/absolute/quadratische Abweichung, MAE/MSE/RMSE), was der Gradient aussagt und wie SGD mit der Lernrate η die Parameter verbessert – inklusive komplett durchgerechneter Epoche.',
    emoji: '🏋️',
    color: '#ff4d6d',
    sheet: [
      { id: 'zyklus', title: 'Der Trainingszyklus (eine Epoche)', rows: [
        { f: '1. Forward Pass → 2. Loss berechnen → 3. Gradient bestimmen (Backpropagation) → 4. Parameter anpassen (Optimierer, z.B. SGD) → 5. Wiederholen', d: 'läuft im Notebook als Schleife über die Epochen' },
        { f: 'Gelernt werden W und b – vorgegeben sind Daten, Architektur, Lernrate, Epochenzahl', d: 'Optimierer-Varianten: SGD, Batch Gradient Descent, Adam (nimmt „Gedächtnis“ mehrerer Schritte mit)' },
      ]},
      { id: 'loss', title: 'Fehlermaße (Loss)', rows: [
        { f: 'Einfache Abweichung: e = ŷ − y', d: 'Vorzeichen = Richtung, aber Fehler können sich über viele Punkte aufheben' },
        { f: 'MAE = (1/n) · Σ |ŷᵢ − yᵢ|', d: 'immer positiv' },
        { f: 'MSE = (1/n) · Σ (ŷᵢ − yᵢ)²', d: 'große Fehler werden stärker gewichtet („bestraft“)' },
        { f: 'RMSE = √MSE', d: 'wieder gleiche Einheit wie y' },
        { f: 'Bei n = 1 gilt: MSE = (ŷ − y)²', d: 'Folien-Beispiel: (2 − 6)² = 16' },
      ]},
      { id: 'gradient', title: 'Der Gradient', rows: [
        { f: '∇L = Vektor aller partiellen Ableitungen ∂L/∂w₁, ∂L/∂w₂, …, ∂L/∂b, …', d: 'zeigt im Parameterraum in Richtung des stärksten Loss-Anstiegs → wir gehen entgegen' },
        { f: '∂L/∂w negativ → w vergrößern senkt den Loss · positiv → w vergrößern erhöht ihn', d: 'der Betrag zeigt, wie stark der Loss reagiert' },
        { f: 'Ein Neuron (ŷ = wx + b, L = (ŷ−y)²): ∂L/∂w = 2·(wx + b − y)·x · ∂L/∂b = 2·(wx + b − y)', d: 'beide enthalten den „inneren Fehler“ (ŷ − y); bei w kommt ·x dazu' },
      ]},
      { id: 'sgd', title: 'SGD-Update', rows: [
        { f: 'w_neu = w_alt − η · ∂L/∂w · b_neu = b_alt − η · ∂L/∂b', d: 'Minus, weil wir entgegen dem Gradienten gehen (bergab)' },
        { f: 'η = Lernrate: bestimmt die Schrittgröße', d: 'zu klein → langsam · zu groß → springt übers Minimum' },
        { f: 'Folien-Beispiel: w = 1 − 0,05·(−16) = 1,8 · b = 0 − 0,05·(−8) = 0,4 → ŷ: 2 → 4 (Ziel 6)', d: 'Loss gesunken: 16 → 4' },
      ]},
    ],
    categories: [
      { id: 'tr-zyklus', sheetRef: 'zyklus', primer: {
          what: 'Der immer gleiche Kreislauf des Trainings: vorwärts rechnen, Fehler messen, Gradient bestimmen, Parameter anpassen – und das Ganze viele Epochen lang wiederholen.',
          why: 'Diese 5 Schritte sind das Grundgerüst jedes Trainings, vom Mini-Notebook bis zu ChatGPT. Wer die Reihenfolge und den Zweck jedes Schritts kennt, versteht, was der Computer beim „Lernen“ wirklich tut.',
          ex: 'Warum diese Reihenfolge? Ohne Forward Pass gibt es kein ŷ – ohne ŷ keinen Fehler – ohne Fehler keinen Gradienten – ohne Gradient weiß niemand, in welche Richtung die Gewichte sollen.' },
        title: 'Der Trainingszyklus', desc: 'Die 5 Schritte einer Epoche', tier: 1, generate: genZyklus },
      { id: 'tr-fehler', sheetRef: 'loss', primer: {
          what: 'Drei Arten, den Fehler EINER Vorhersage zu messen: einfache Abweichung ŷ − y (mit Vorzeichen), Betrag |ŷ − y| und Quadrat (ŷ − y)².',
          why: 'Bevor das Netz besser werden kann, muss man „schlecht“ messen können. Die drei Varianten haben verschiedene Eigenschaften – das Quadrat bestraft große Fehler besonders stark.',
          ex: 'ŷ = 2, y = 6: einfache Abweichung 2 − 6 = −4 (das Minus sagt: Vorhersage zu klein) · Betrag 4 · Quadrat 16.' },
        title: 'Fehler einer Vorhersage', desc: 'e, |e| und e² berechnen', tier: 1, weight: 1.2, generate: genFehler },
      { id: 'tr-konzept', sheetRef: 'loss', primer: {
          what: 'Die Warum-Fragen des Trainings: Warum reicht die einfache Abweichung nicht? Warum quadriert MSE? Was ist der Gradient, was macht die Lernrate?',
          why: 'Verständnisfragen wie diese standen wörtlich auf den Folien („Wo liegt hier ein Problem?“) – sie sind perfekte Klausurkandidaten und machen aus Formelwissen echtes Verständnis.',
          ex: 'Zwei Fehler +4 und −4: im Mittel 0 – sieht perfekt aus, ist es aber nicht. Deshalb Betrag (MAE) oder Quadrat (MSE) statt einfacher Abweichung.' },
        title: 'Training verstehen', desc: 'Warum MSE? Was macht η?', tier: 1, generate: genKonzept },
      { id: 'tr-lossmass', sheetRef: 'loss', primer: {
          what: 'MAE und MSE fassen die Fehler VIELER Trainingsbeispiele zu einer Zahl zusammen: Beträge bzw. Quadrate der Abweichungen, dann den Mittelwert bilden.',
          why: 'Ein Netz trainiert nie auf einem Punkt – man braucht einen Gesamtwert, den man senken kann. Genau dieser Wert ist die Loss-Kurve, die beim Training (auch in diesem Spiel!) sinkt.',
          ex: 'Fehler e = (−2 | 3): MAE = (2 + 3)/2 = 2,5 · MSE = (4 + 9)/2 = 6,5 – der große Fehler dominiert den MSE.' },
        title: 'MAE & MSE berechnen', desc: 'Fehler über mehrere Beispiele mitteln', tier: 2, weight: 1.2, generate: genLossmass },
      { id: 'tr-grad-lesen', sheetRef: 'gradient', primer: {
          what: 'Den Gradienten interpretieren, ohne zu rechnen: Vorzeichen = Richtung (negativ → Parameter vergrößern senkt den Loss), Betrag = Stärke der Reaktion.',
          why: 'Der Gradient ist die zentrale Information des Trainings. Wer ihn lesen kann, versteht sofort, warum in der Update-Formel ein Minus steht.',
          ex: 'Folie: ∇L = (−4 | 2) → w ein Stück vergrößern: Loss sinkt (−4 ist negativ). b vergrößern: Loss steigt (+2). Der Loss reagiert auf w stärker (|−4| > |2|).' },
        title: 'Gradient lesen', desc: 'Vorzeichen & Beträge interpretieren', tier: 2, generate: genGradLesen },
      { id: 'tr-sgd', sheetRef: 'sgd', primer: {
          what: 'Die Update-Formel anwenden: neuer Wert = alter Wert − Lernrate · Gradient. Ein Rechenschritt pro Parameter.',
          why: 'Das ist der Moment, in dem das Netz tatsächlich „lernt“ – die einzige Stelle im ganzen Training, an der sich W und b ändern.',
          ex: 'w = 1, ∂L/∂w = −16, η = 0,05: w_neu = 1 − 0,05·(−16) = 1 + 0,8 = 1,8. Achtung Vorzeichen: Minus mal Minus = Plus!' },
        title: 'SGD-Update', desc: 'w_neu = w_alt − η·Gradient', tier: 2, weight: 1.2, generate: genSgd },
      { id: 'tr-grad-rechnen', sheetRef: 'gradient', primer: {
          what: 'Den Gradienten fürs Ein-Neuron-Modell selbst berechnen: ∂L/∂w = 2·(wx + b − y)·x und ∂L/∂b = 2·(wx + b − y).',
          why: 'Einmal von Hand gerechnet, verliert „Backpropagation“ seinen Schrecken: Es ist nur die Ableitung des Loss – der innere Fehler mal 2, bei w noch mal x.',
          ex: 'Folie: x=2, y=6, w=1, b=0 → innerer Fehler = 1·2+0−6 = −4 → ∂L/∂w = 2·(−4)·2 = −16, ∂L/∂b = 2·(−4) = −8.' },
        title: 'Gradient berechnen', desc: '∂L/∂w und ∂L/∂b bestimmen', tier: 3, weight: 1.2, generate: genGradRechnen },
      { id: 'tr-update-voll', sheetRef: 'sgd', primer: {
          what: 'Beide Parameter mit dem gegebenen Gradienten updaten und prüfen, ob die neue Vorhersage näher am Ziel liegt.',
          why: 'Hier sieht man den Effekt des Lernens direkt: Nach einem Schritt ist ŷ näher an y. Genau dieser Fortschritt ist es, den die Loss-Kurve sichtbar macht.',
          ex: 'Folie: w: 1 → 1,8 und b: 0 → 0,4 ergibt ŷ = 1,8·2 + 0,4 = 4 statt vorher 2 – bei Ziel 6 ein deutlicher Schritt in die richtige Richtung.' },
        title: 'Update & neue Vorhersage', desc: 'Beide Parameter anpassen, ŷ prüfen', tier: 3, generate: genUpdateVoll },
      { id: 'tr-boss-epoche', sheetRef: 'zyklus', boss: true, primer: {
          what: 'Eine komplette Trainings-Epoche von Hand: Forward Pass → Loss → beide Gradienten → beide Updates → neue Vorhersage. Sieben Schritte, wie das Folien-Beispiel.',
          why: 'Die Königsdisziplin des Kapitels und eine realistische Klausuraufgabe. Wer das kann, hat das Training wirklich verstanden – alles andere ist nur „mehr davon in einer Schleife“.',
          ex: 'Ablauf am Folien-Beispiel: ŷ = 2 → L = 16 → ∇L = (−16 | −8) → w = 1,8, b = 0,4 → ŷ_neu = 4. Neuer Loss: (4−6)² = 4 < 16 ✓' },
        title: 'Boss: Eine Epoche komplett', desc: 'Forward, Loss, Gradient, Update (7 Schritte)', tier: 3, generate: genBossEpoche },
    ],
  });
})();
