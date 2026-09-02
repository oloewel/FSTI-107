/* ============ Modus: multi ============
   Mehrschrittige Rechenaufgabe (z.B. Forward-Pass): Schritt für Schritt Zahlen eingeben.
   Jeder Schritt kann numerisch (answer) oder Auswahl (options) sein.
   Ergebnis: correct = alle Schritte richtig; fraction = Anteil richtiger Schritte (Teilpunkte). */
(function () {
  const U = BrainForge.utils;
  BrainForge.registerMode('multi', {
    render(root, ch, api) {
      const steps = ch.steps; let idx = 0, okCount = 0;
      root.innerHTML = `<div class="steps">${steps.map((s, i) => `<div class="step" id="st${i}"><div class="lbl">Schritt ${i + 1}: ${s.label}</div><div class="body"></div><div class="res"></div></div>`).join('')}</div>`;
      const stepEl = (i) => root.querySelector('#st' + i);

      function finishAll() {
        const frac = okCount / steps.length;
        api.done(okCount === steps.length, { fraction: frac, answerLine: `${okCount} von ${steps.length} Schritten richtig` });
      }
      function show(i) {
        if (i >= steps.length) return finishAll();
        const s = steps[i], el = stepEl(i); el.classList.add('active');
        const body = el.querySelector('.body');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (s.options) {
          const opts = U.shuffle(s.options);
          body.innerHTML = `<div class="options">${opts.map((o, k) => `<button class="opt" data-i="${k}"><span class="key">${k + 1}</span>${o.html}</button>`).join('')}</div>`;
          const btns = [...body.querySelectorAll('.opt')];
          const armedAt = Date.now() + 250;
          const choose = (k) => {
            const o = opts[k]; if (!o || Date.now() < armedAt) return;
            btns.forEach((b, m) => { b.disabled = true; if (opts[m].correct) b.classList.add('correct'); });
            if (!o.correct) btns[k].classList.add('wrong');
            settle(i, !!o.correct, o.correct ? '' : 'Richtig wäre: ' + opts.find(x => x.correct).html);
          };
          btns.forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
          api.setKeys((e) => { const k = parseInt(e.key, 10); if (k >= 1 && k <= opts.length) { e.preventDefault(); choose(k - 1); } });
        } else {
          body.innerHTML = `<div class="answer"><span class="mono muted">${s.varLabel || 'Wert'} =</span><button class="negbtn" type="button" title="Vorzeichen umschalten">±</button><input type="text" inputmode="decimal" autocomplete="off" placeholder="${s.placeholder || '…'}"><button class="btn small">Prüfen</button></div>${s.hint ? `<div class="hint">${s.hint}</div>` : ''}`;
          const inp = body.querySelector('input'), btn = body.querySelector('button.btn');
          body.querySelector('.negbtn').addEventListener('click', () => {
            inp.value = inp.value.startsWith('-') ? inp.value.slice(1) : '-' + inp.value;
            inp.focus();
          });
          setTimeout(() => inp.focus(), 50);
          const submit = () => {
            const v = U.parseNum(inp.value);
            if (Number.isNaN(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); return; }
            const ok = Math.abs(v - s.answer) <= (s.tol ?? 0.011);
            inp.disabled = true; btn.disabled = true; inp.style.borderColor = ok ? 'var(--good)' : 'var(--bad)';
            settle(i, ok, `Deine Antwort: ${U.fmt(v, 3)} · Richtig: ${U.fmt(s.answer, s.digits ?? 2)}`);
          };
          btn.addEventListener('click', submit);
          api.setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        }
      }
      function settle(i, ok, line) {
        const el = stepEl(i); el.classList.remove('active'); el.classList.add(ok ? 'done' : 'failed');
        if (ok) { okCount++; BrainForge.audio.click(); } else { BrainForge.audio.wrong(); }
        el.querySelector('.res').innerHTML = `${ok ? '✅' : '❌'} ${line || ''}${steps[i].explain ? ' · ' + steps[i].explain : ''}`;
        idx = i + 1; setTimeout(() => show(idx), ok ? 250 : 900);
      }
      show(0);
    },
  });
})();
