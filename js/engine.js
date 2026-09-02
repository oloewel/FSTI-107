/* ============ BrainForge – Engine ============
   Spiel-Logik, Screens, Scoring, Speicherung.
   Themen (js/topics/*.js) registrieren sich mit BrainForge.registerTopic(...)
   Aufgaben-Modi (js/modes/*.js) registrieren sich mit BrainForge.registerMode(...)

   ---- Aufgaben-Format (wird von Generatoren zurückgegeben) ----
   { type: 'numeric', prompt: '<html>', figure?: '<html/svg>', given?: ['<html>', ...],
     answer: 2.5, tol?: 0.011, unit?: '', placeholder?: '', explain: '<html>' }
   { type: 'choice', prompt, figure?, given?, options: [{html, correct:true}, ...], explain }
   { type: 'multi',  prompt, figure?, given?, steps: [{label, answer, tol?, explain?}, ...], explain }

   ---- Themen-Format ----
   { id, title, subtitle, emoji, color, description,
     categories: [{ id, title, tier: 1|2|3, boss?: true, weight?: 1, generate: () => challenge }] }
*/
(function () {
  const U = window.BFUtils, A = window.BFAudio;
  const G = { topics: [], modes: {}, utils: U, figures: window.BFFigures, audio: A };
  const app = () => document.getElementById('app');

  // ---------- Registrierung ----------
  G.registerTopic = (t) => { if (!t.id || !t.categories) throw new Error('Topic braucht id + categories'); G.topics.push(t); };
  G.registerMode = (type, impl) => { G.modes[type] = impl; };

  // ---------- Speicherung ----------
  const store = {
    key: (k) => 'bf_' + k,
    get(k, d) { try { const v = localStorage.getItem(this.key(k)); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(this.key(k), JSON.stringify(v)); } catch (e) { } },
  };
  const statsOf = (topicId) => store.get('stats_' + topicId, { cats: {}, best: {}, runs: 0 });
  const saveStats = (topicId, s) => store.set('stats_' + topicId, s);

  // ---------- Spielzustand ----------
  let run = null;           // aktueller Lauf
  let keyHandler = null;    // aktiver Tastatur-Handler

  const MODES = {
    campaign: { id: 'campaign', title: 'Kampagne', emoji: '🏔️', desc: '12 Aufgaben, steigende Schwierigkeit, am Ende der Boss. 3 Herzen. Senke den Loss bis zur Konvergenz!' },
    endless: { id: 'endless', title: 'Endlos', emoji: '♾️', desc: 'So lange, bis die Herzen weg sind. Wie hoch kommst du? Highscore-Jagd.' },
    practice: { id: 'practice', title: 'Üben', emoji: '🎯', desc: 'Eine Kategorie gezielt trainieren – ohne Herzen, mit Erklärungen. Perfekt vor der Klausur.' },
  };
  const CAMPAIGN_PLAN = [1, 1, 1, 2, 1, 2, 2, 3, 2, 3, 3, 'boss'];

  function setKeys(fn) { keyHandler = fn; }
  document.addEventListener('keydown', (e) => { if (keyHandler) keyHandler(e); });

  // ---------- Screens ----------
  function render(html) { const a = app(); a.innerHTML = ''; a.appendChild(U.el(`<div class="fade-in">${html}</div>`)); return a.firstChild; }

  function topbar(title, backFn, extra = '') {
    return `<div class="topbar">
      <div class="row"><button class="btn ghost small" id="back">← ${title}</button>${extra}</div>
      <div class="row"><button class="btn ghost small" id="mute">${A.isMuted() ? '🔇' : '🔊'}</button></div></div>`;
  }
  function wireTopbar(root, backFn) {
    root.querySelector('#back')?.addEventListener('click', backFn);
    root.querySelector('#mute')?.addEventListener('click', (e) => { const m = A.toggle(); e.target.textContent = m ? '🔇' : '🔊'; });
  }

  // --- Startseite: Themen ---
  G.home = function () {
    setKeys(null); run = null;
    const cards = G.topics.map(t => {
      const st = statsOf(t.id);
      const best = st.best.campaign ? `🏔️ ${st.best.campaign}` : '';
      const bestE = st.best.endless ? `♾️ ${st.best.endless}` : '';
      const total = Object.values(st.cats).reduce((a, c) => a + c.n, 0);
      const corr = Object.values(st.cats).reduce((a, c) => a + c.correct, 0);
      return `<div class="card topic" data-id="${t.id}" style="--topic:${t.color || 'var(--accent)'}">
        <div class="bar"></div>
        <div class="emoji">${t.emoji || '📘'}</div>
        <h3>${t.title}</h3>
        <div class="muted">${t.subtitle || ''}</div>
        <div class="best muted">${t.categories.length} Kategorien · ${total ? Math.round(100 * corr / total) + '% richtig' : 'noch nicht gespielt'}${best ? ' · ' + best : ''}${bestE ? ' · ' + bestE : ''}</div>
      </div>`;
    }).join('');
    const root = render(`
      <div class="hero">
        <h1><span class="logo">BrainForge</span> 🧠⚡</h1>
        <p class="lead">Trainiere dein Gehirn wie ein neuronales Netz: Jede richtige Antwort senkt den <b>Loss</b>, jede falsche kostet ein Herz. Wähle ein Thema.</p>
      </div>
      <div class="grid topics">${cards}</div>`);
    root.querySelectorAll('.topic').forEach(el => el.addEventListener('click', () => { A.click(); G.topicMenu(el.dataset.id); }));
  };

  // --- Themenmenü: Modus wählen ---
  G.topicMenu = function (topicId) {
    setKeys(null);
    const t = G.topics.find(x => x.id === topicId);
    const st = statsOf(t.id);
    document.documentElement.style.setProperty('--topic', t.color || '#3df2c2');
    const modes = Object.values(MODES).map(m => `<div class="card mode" data-mode="${m.id}">
        <div style="font-size:30px">${m.emoji}</div><h3>${m.title}</h3><div class="muted">${m.desc}</div>
        ${st.best[m.id] ? `<div class="hint">Bestleistung: <span class="pts">${st.best[m.id]}</span></div>` : ''}</div>`).join('');
    const cats = t.categories.map(c => {
      const s = st.cats[c.id]; const acc = s && s.n ? Math.round(100 * s.correct / s.n) + '%' : '–';
      return `<button class="cat" data-cat="${c.id}"><span class="acc">${acc}</span><div><span class="tag t${c.boss ? 3 : c.tier}">${c.boss ? 'Boss' : 'Stufe ' + c.tier}</span></div>
        <div style="margin-top:6px;font-weight:600">${c.title}</div><div class="muted">${c.desc || ''}</div></button>`;
    }).join('');
    const root = render(`${topbar('Themen', null, (t.intro ? '<button class="btn ghost small" id="introbtn">ℹ️ Worum geht es?</button>' : '') + (t.sheet ? '<button class="btn ghost small" id="sheetbtn">📋 Formelblatt</button>' : ''))}
      <div class="card">
        <div class="row spread"><div><span class="tag">${t.emoji} Thema</span><h2 style="margin-top:8px">${t.title}</h2><div class="muted">${t.description || t.subtitle || ''}</div></div></div>
      </div>
      <h3 style="margin:22px 0 0">Spielmodus</h3>
      <div class="grid modes">${modes}</div>
      <h3 style="margin:26px 0 0">Üben nach Kategorie <span class="muted" style="font-weight:400;font-size:14px">(Klick = sofort loslegen)</span></h3>
      <div class="grid cats">${cats}</div>`);
    wireTopbar(root, G.home);
    root.querySelector('#sheetbtn')?.addEventListener('click', () => showSheet(t));
    root.querySelector('#introbtn')?.addEventListener('click', () => showIntroOverlay(t));
    root.querySelectorAll('.mode').forEach(el => el.addEventListener('click', () => {
      A.click();
      if (el.dataset.mode === 'practice') { root.querySelector('.cats').scrollIntoView({ behavior: 'smooth' }); return; }
      G.startRun(t.id, el.dataset.mode);
    }));
    root.querySelectorAll('.cat').forEach(el => el.addEventListener('click', () => { A.click(); G.startRun(t.id, 'practice', el.dataset.cat); }));
  };

  // ---------- Formelblatt ----------
  function showSheet(topic, focusRef) {
    const secs = topic.sheet || [];
    if (!secs.length) return;
    const ov = U.el(`<div class="sheet-overlay">
      <div class="sheet card">
        <div class="row spread"><h2>📋 Formelblatt – ${topic.title}</h2><button class="btn small" id="sheetclose">Schließen ✕</button></div>
        <p class="muted" style="margin:4px 0 0">Tipp für die Klausur: Erlaubt ist ein <b>handschriftliches</b> Formelblatt – schreib dir diese Punkte per Hand ab.</p>
        ${secs.map(sec => `<div class="sheet-sec ${sec.id === focusRef ? 'focus' : ''}" id="sec-${sec.id}"><h3>${sec.title}</h3>${sec.rows.map(r => `<div class="sheet-row"><div class="sf">${r.f}</div>${r.d ? `<div class="sd muted">${r.d}</div>` : ''}</div>`).join('')}</div>`).join('')}
      </div></div>`);
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    ov.querySelector('#sheetclose').addEventListener('click', () => ov.remove());
    if (focusRef) setTimeout(() => ov.querySelector('#sec-' + focusRef)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  }
  G.showSheet = showSheet;

  // ---------- Kategorie-Erklärung (Primer) ----------
  function showPrimer(cat) {
    const pr = cat.primer; if (!pr) return;
    const ov = U.el(`<div class="sheet-overlay"><div class="sheet card">
      <div class="row spread"><h2>❓ ${cat.title}</h2><button class="btn small" id="pclose">Alles klar</button></div>
      <div class="sheet-sec"><h3>Worum geht es?</h3><div class="ptext">${pr.what}</div></div>
      <div class="sheet-sec"><h3>Wofür braucht man das?</h3><div class="ptext">${pr.why}</div></div>
      ${pr.ex ? `<div class="sheet-sec"><h3>Beispiel</h3><div class="ptext">${pr.ex}</div></div>` : ''}
    </div></div>`);
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    ov.querySelector('#pclose').addEventListener('click', () => ov.remove());
  }
  G.showPrimer = showPrimer;

  function showIntroOverlay(t) {
    const ov = U.el(`<div class="sheet-overlay"><div class="sheet card">
      <div class="row spread"><h2>${t.emoji} ${t.title}</h2><button class="btn small" id="iclose">Schließen</button></div>
      <div class="introtext">${t.intro}</div></div></div>`);
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    ov.querySelector('#iclose').addEventListener('click', () => ov.remove());
  }

  // ---------- Lauf starten ----------
  G.startRun = function (topicId, mode, catId) {
    const t = G.topics.find(x => x.id === topicId);
    run = {
      topic: t, mode, catId, round: 0, hearts: mode === 'practice' ? Infinity : 3, score: 0, streak: 0, bestStreak: 0,
      loss: 1.0, lossHist: [1.0], history: [], startedAt: Date.now(), total: mode === 'campaign' ? CAMPAIGN_PLAN.length : null,
      recent: [],
    };
    // Beim allerersten Start eines Themas: Kapitel-Intro zeigen (danach über ℹ️ im Themenmenü)
    if (mode !== 'practice' && t.intro && !store.get('introseen_' + t.id, false)) {
      setKeys(null);
      const root = render(`${topbar('Zurück')}
        <div class="card">
          <div style="font-size:44px">${t.emoji}</div>
          <h2>${t.title}</h2>
          <div class="introtext">${t.intro}</div>
          <div class="row" style="margin-top:20px"><button class="btn" id="go">Los geht's <span class="kbd" style="color:#fff;border-color:rgba(255,255,255,.4)">Enter</span></button></div>
        </div>`);
      wireTopbar(root, () => G.topicMenu(t.id));
      const go = () => { store.set('introseen_' + t.id, true); A.click(); nextChallenge(); };
      root.querySelector('#go').addEventListener('click', go);
      setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      return;
    }
    nextChallenge();
  };

  function pickCategory() {
    const t = run.topic, cats = t.categories;
    if (run.mode === 'practice') return cats.find(c => c.id === run.catId);
    let tier;
    if (run.mode === 'campaign') tier = CAMPAIGN_PLAN[run.round - 1];
    else { // endless: steigend, später gemischt
      const r = run.round;
      tier = r <= 3 ? 1 : r <= 7 ? U.pick([1, 2, 2]) : r <= 12 ? U.pick([2, 2, 3]) : U.pick([2, 3, 3, 'boss']);
    }
    let pool = tier === 'boss' ? cats.filter(c => c.boss) : cats.filter(c => c.tier === tier && !c.boss);
    if (!pool.length) pool = cats.filter(c => c.tier === 3) ; if (!pool.length) pool = cats;
    // nicht direkt dieselbe Kategorie wie zuletzt, wenn möglich
    const last = run.recent[run.recent.length - 1];
    const alt = pool.filter(c => c.id !== last); if (alt.length) pool = alt;
    // gewichtete Auswahl; Kategorien mit niedriger Trefferquote erscheinen öfter (Schwächen-Training)
    const stCats = statsOf(t.id).cats;
    const effW = (c) => { let w = c.weight || 1; const st = stCats[c.id]; if (st && st.n >= 3) w *= 1 + Math.max(0, 1 - st.correct / st.n); return w; };
    const tot = pool.reduce((a, c) => a + effW(c), 0); let x = Math.random() * tot;
    for (const c of pool) { x -= effW(c); if (x <= 0) return c; }
    return pool[pool.length - 1];
  }

  function nextChallenge() {
    run.round++;
    if (run.mode === 'campaign' && run.round > run.total) return finish(true);
    const cat = pickCategory();
    run.recent.push(cat.id);
    let ch;
    try { ch = cat.generate(); } catch (e) { console.error('Generator-Fehler in', cat.id, e); run.round--; return nextChallenge(); }
    ch.category = cat;
    ch._start = Date.now();
    G.current = ch; // für Debugging/Tests
    renderChallenge(ch);
  }

  // ---------- HUD ----------
  function hudHtml() {
    const hearts = run.hearts === Infinity ? '<span class="muted">∞ Üben</span>' : [0, 1, 2].map(i => `<span class="${i < run.hearts ? '' : 'lost'}">❤️</span>`).join('');
    const prog = run.total ? `<div class="progress"><i style="width:${((run.round - 1) / run.total) * 100}%"></i></div>` : '';
    return `<div class="hud">
      <div class="stats">
        <div class="stat"><span class="k">Punkte</span><span class="v" id="hud-score">${run.score}</span></div>
        <div class="stat"><span class="k">Streak</span><span class="v streak" id="hud-streak">${run.streak ? '🔥 ' + run.streak : '–'}</span></div>
        <div class="stat"><span class="k">Runde</span><span class="v">${run.round}${run.total ? ' / ' + run.total : ''}</span></div>
        <div class="stat"><span class="k">Herzen</span><span class="v hearts" id="hud-hearts">${hearts}</span></div>
      </div>
      <div class="lossbox"><div class="lbl"><span>Loss</span><span id="hud-loss">${run.loss.toFixed(3)}</span></div><canvas id="losscv" width="220" height="54"></canvas></div>
    </div>${prog}`;
  }
  function drawLoss() {
    const cv = document.getElementById('losscv'); if (!cv) return;
    const ctx = cv.getContext('2d'); const W = cv.width = cv.clientWidth * 2 || 440, H = cv.height = 108;
    ctx.clearRect(0, 0, W, H);
    const h = run.lossHist; const n = Math.max(h.length, 2);
    const px = (i) => (i / (Math.max(n - 1, 12))) * (W - 8) + 4, py = (v) => H - 6 - v * (H - 12);
    const grad = ctx.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, '#ff4d6d'); grad.addColorStop(1, '#3df2c2');
    ctx.beginPath(); h.forEach((v, i) => i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v)));
    ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    const lx = px(h.length - 1), ly = py(h[h.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }

  // ---------- Aufgabe anzeigen ----------
  function renderChallenge(ch) {
    const mode = G.modes[ch.type];
    if (!mode) { console.error('Unbekannter Aufgabentyp', ch.type); return nextChallenge(); }
    const cat = ch.category;
    const givenHtml = ch.given && ch.given.length ? `<div class="given">${ch.given.map(g => `<span>${g}</span>`).join('')}</div>` : '';
    const root = render(`${topbar(run.mode === 'practice' ? 'Abbrechen' : 'Aufgeben', null, `<span class="tag">${MODES[run.mode].emoji} ${MODES[run.mode].title}</span>`)}
      ${hudHtml()}
      <div class="card challenge">
        <div class="head"><div><span class="tag t${cat.boss ? 3 : cat.tier}">${cat.boss ? '👑 Boss' : 'Stufe ' + cat.tier}</span> <span class="muted" style="margin-left:8px">${cat.title}</span></div>
          <div class="row" style="gap:8px">${cat.primer ? `<button class="btn ghost small" id="primerbtn" title="Was ist das und wofür?">❓ Erklärung${run.mode !== 'practice' ? ' <span class="muted">(−50%)</span>' : ''}</button>` : ''}${run.topic.sheet ? `<button class="btn ghost small" id="hintbtn" title="Formelblatt zur Aufgabe">💡 Formeln${run.mode !== 'practice' ? ' <span class="muted">(−50%)</span>' : ''}</button>` : ''}<div class="muted mono" id="timer">0 s</div></div></div>
        <div class="prompt">${ch.prompt}</div>
        ${ch.figure ? `<div class="figure">${ch.figure}</div>` : ''}
        ${givenHtml}
        <div id="mode-root"></div>
        <div id="feedback"></div>
      </div>`);
    wireTopbar(root, () => { if (confirm('Lauf wirklich beenden?')) finish(false, true); });
    const hintBtn = root.querySelector('#hintbtn');
    hintBtn?.addEventListener('click', () => {
      if (run.mode !== 'practice' && !ch._answered && !ch._hintUsed) { ch._hintUsed = true; hintBtn.classList.add('used'); }
      showSheet(run.topic, cat.sheetRef);
    });
    const primerBtn = root.querySelector('#primerbtn');
    primerBtn?.addEventListener('click', () => {
      if (run.mode !== 'practice' && !ch._answered && !ch._hintUsed) { ch._hintUsed = true; primerBtn.classList.add('used'); }
      showPrimer(cat);
    });
    // Üben-Modus: Erklärung vor der ersten Aufgabe automatisch zeigen
    if (run.mode === 'practice' && cat.primer && run.round === 1) setTimeout(() => showPrimer(cat), 250);
    drawLoss();
    // Timer
    const tEl = root.querySelector('#timer');
    const tick = setInterval(() => { if (!document.body.contains(tEl)) return clearInterval(tick); tEl.textContent = Math.round((Date.now() - ch._start) / 1000) + ' s'; }, 500);

    let finished = false;
    const api = {
      done(correct, details = {}) {
        if (finished) return; finished = true; clearInterval(tick);
        onResult(ch, correct, details, root);
      },
      setKeys,
    };
    mode.render(root.querySelector('#mode-root'), ch, api);
  }

  // ---------- Auswertung ----------
  function onResult(ch, correct, details, root) {
    ch._answered = true;
    const cat = ch.category;
    const secs = (Date.now() - ch._start) / 1000;
    const tierVal = cat.boss ? 4 : cat.tier;
    let pts = 0;
    // Teilpunkte bei Multi-Step (details.fraction 0..1)
    const frac = details.fraction !== undefined ? details.fraction : (correct ? 1 : 0);
    if (frac > 0) {
      const base = 100 * tierVal * frac;
      const mult = 1 + 0.25 * Math.min(run.streak, 8);
      const timeBonus = correct ? Math.max(0, Math.round((40 - secs) * tierVal)) : 0;
      pts = Math.round(base * mult + timeBonus);
      if (ch._hintUsed) pts = Math.round(pts / 2); // Formel-Hilfe kostet die Hälfte
    }
    if (correct) {
      run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak);
      run.loss = Math.max(0.005, run.loss * (1 - 0.20 - 0.03 * tierVal));
      run.streak >= 3 ? A.streak(run.streak) : A.correct();
    } else {
      run.streak = 0;
      run.loss = Math.min(1, run.loss + 0.10 + 0.03 * (1 - frac));
      if (run.hearts !== Infinity) run.hearts--;
      A.wrong(); root.querySelector('.challenge').classList.add('shake');
    }
    run.score += pts; run.lossHist.push(run.loss);
    run.history.push({ cat: cat.id, correct, secs, pts });
    // Statistik speichern
    const st = statsOf(run.topic.id);
    st.cats[cat.id] = st.cats[cat.id] || { n: 0, correct: 0 };
    st.cats[cat.id].n++; if (correct) st.cats[cat.id].correct++;
    saveStats(run.topic.id, st);

    // HUD aktualisieren
    root.querySelector('#hud-score').textContent = run.score;
    root.querySelector('#hud-streak').textContent = run.streak ? '🔥 ' + run.streak : '–';
    root.querySelector('#hud-loss').textContent = run.loss.toFixed(3);
    if (run.hearts !== Infinity) root.querySelector('#hud-hearts').innerHTML = [0, 1, 2].map(i => `<span class="${i < run.hearts ? '' : 'lost'}">❤️</span>`).join('');
    drawLoss();
    if (pts > 0) floatText('+' + pts, root.querySelector('#hud-score'));

    // Feedback
    const dead = run.hearts !== Infinity && run.hearts <= 0;
    const last = run.mode === 'campaign' && run.round >= run.total;
    const btnLabel = dead ? 'Auswertung' : last ? 'Zum Ergebnis' : 'Weiter';
    const titles = correct ? (run.streak >= 5 ? ['Unaufhaltsam! 🔥', 'Gradient im Sturzflug!', 'Konvergenz in Sicht!'] : ['Richtig! ✅', 'Sauber gerechnet.', 'Genau so!', 'Treffer!']) : ['Leider falsch ❌', 'Nicht ganz.', 'Daneben – aber jetzt weißt du es.'];
    const fb = U.el(`<div class="feedback ${correct ? 'good' : 'bad'} pop">
      <div class="row spread"><h3>${U.pick(titles)} ${pts ? `<span class="pts">+${pts}</span>` : ''}</h3><button class="btn small" id="next">${btnLabel} <span class="kbd">Enter</span></button></div>
      ${ch._hintUsed ? '<div class="muted" style="font-size:13px">💡 Formel-Hilfe genutzt – halbe Punkte</div>' : ''}
      ${details.answerLine ? `<div class="mono muted">${details.answerLine}</div>` : ''}
      <div class="explain">${ch.explain || ''}</div>
    </div>`);
    root.querySelector('#feedback').appendChild(fb);
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const go = () => { A.click(); if (dead) finish(false); else nextChallenge(); };
    fb.querySelector('#next').addEventListener('click', go);
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }

  function floatText(txt, anchor) {
    const r = anchor.getBoundingClientRect();
    const el = U.el(`<div class="float" style="left:${r.left}px;top:${r.top - 10}px;color:var(--accent)">${txt}</div>`);
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
  }

  // ---------- Ergebnis ----------
  function finish(completed, aborted = false) {
    setKeys(null);
    const t = run.topic, st = statsOf(t.id);
    const n = run.history.length, c = run.history.filter(h => h.correct).length;
    const acc = n ? Math.round(100 * c / n) : 0;
    const dur = Math.round((Date.now() - run.startedAt) / 1000);
    let isBest = false;
    if (run.mode !== 'practice' && !aborted) { if (!st.best[run.mode] || run.score > st.best[run.mode]) { st.best[run.mode] = run.score; isBest = true; } st.runs++; saveStats(t.id, st); }
    let title, big;
    if (run.mode === 'practice') { title = 'Übung beendet'; big = '🎯'; }
    else if (completed) {
      if (run.loss < 0.1) { title = 'Konvergiert! Das Netz sitzt. ✨'; big = '🏆'; A.win(); }
      else if (run.loss < 0.35) { title = 'Fast konvergiert – noch ein paar Epochen!'; big = '📉'; A.win(); }
      else { title = 'Durchgekommen, aber der Loss ist noch hoch.'; big = '🧗'; }
    } else { title = aborted ? 'Lauf abgebrochen' : 'Game over – Gradient explodiert 💥'; big = aborted ? '🚪' : '💀'; if (!aborted) A.lose(); }

    // Kategorien-Auswertung (dieser Lauf)
    const byCat = {};
    run.history.forEach(h => { byCat[h.cat] = byCat[h.cat] || { n: 0, c: 0 }; byCat[h.cat].n++; if (h.correct) byCat[h.cat].c++; });
    const rows = Object.entries(byCat).map(([id, v]) => {
      const cat = t.categories.find(x => x.id === id); const p = Math.round(100 * v.c / v.n);
      return `<div class="r"><span>${cat ? cat.title : id} <span class="muted">(${v.c}/${v.n})</span></span><div class="bar"><i class="${p < 50 ? 'low' : p < 80 ? 'mid' : ''}" style="width:${p}%"></i></div><span class="mono muted">${p}%</span></div>`;
    }).join('');
    const weak = Object.entries(byCat).filter(([, v]) => v.c / v.n < 0.7).map(([id]) => t.categories.find(x => x.id === id)).filter(Boolean);
    const weakHtml = weak.length ? `<div class="hint">Tipp: Übe gezielt <b>${weak.map(w => w.title).join('</b>, <b>')}</b>.</div>` : (n ? '<div class="hint">Keine klaren Schwächen – stark! 💪</div>' : '');

    const root = render(`${topbar('Zurück zum Thema')}
      <div class="card result">
        <div class="big">${big}</div>
        <h2>${title}</h2>
        ${isBest ? '<div style="text-align:center" class="pts pop">🎉 Neue Bestleistung!</div>' : ''}
        <div class="kpis">
          <div class="kpi"><div class="v">${run.score}</div><div class="k">Punkte</div></div>
          <div class="kpi"><div class="v">${acc}%</div><div class="k">richtig (${c}/${n})</div></div>
          <div class="kpi"><div class="v">🔥 ${run.bestStreak}</div><div class="k">beste Serie</div></div>
          <div class="kpi"><div class="v">${run.loss.toFixed(3)}</div><div class="k">End-Loss</div></div>
          <div class="kpi"><div class="v">${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}</div><div class="k">Dauer</div></div>
        </div>
        <div class="lossbox" style="margin-bottom:16px"><div class="lbl"><span>Loss-Verlauf</span><span>${run.lossHist.length - 1} Schritte</span></div><canvas id="losscv" height="54"></canvas></div>
        <h3>Kategorien in diesem Lauf</h3>
        <div class="acclist">${rows || '<span class="muted">keine Aufgaben gespielt</span>'}</div>
        ${weakHtml}
        <div class="row" style="margin-top:22px">
          <button class="btn" id="again">🔁 Nochmal (${MODES[run.mode].title})</button>
          <button class="btn ghost" id="menu">Themenmenü</button>
          <button class="btn ghost" id="home">Alle Themen</button>
        </div>
      </div>`);
    wireTopbar(root, () => G.topicMenu(t.id));
    drawLoss();
    const again = () => { A.click(); G.startRun(t.id, run.mode, run.catId); };
    root.querySelector('#again').addEventListener('click', again);
    root.querySelector('#menu').addEventListener('click', () => G.topicMenu(t.id));
    root.querySelector('#home').addEventListener('click', G.home);
    setKeys((e) => { if (e.key === 'Enter') again(); });
  }

  // ---------- Start ----------
  G.start = function () {
    if (!G.topics.length) { render('<div class="card"><h2>Keine Themen registriert</h2><p class="muted">Lege eine Datei in js/topics/ an und binde sie in index.html ein.</p></div>'); return; }
    // Deep-Link: index.html#topic=dl1&mode=campaign
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get('topic') && G.topics.find(t => t.id === h.get('topic'))) {
      if (h.get('mode')) return G.startRun(h.get('topic'), h.get('mode'), h.get('cat'));
      return G.topicMenu(h.get('topic'));
    }
    G.home();
  };

  window.BrainForge = G;
})();
