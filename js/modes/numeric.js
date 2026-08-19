/* ============ Modus: numeric ============
   Zahl eingeben (Komma oder Punkt). Toleranz über ch.tol (Standard 0.011). */
(function () {
  const U = BrainForge.utils;
  BrainForge.registerMode('numeric', {
    render(root, ch, api) {
      const tol = ch.tol ?? 0.011;
      root.innerHTML = `<div class="answer">
          <span class="mono muted">${ch.label || 'Antwort'} =</span>
          <input id="ans" type="text" inputmode="decimal" autocomplete="off" placeholder="${ch.placeholder || 'z.B. -2,5'}">
          <span class="unit">${ch.unit || ''}</span>
          <button class="btn" id="ok">Prüfen <span class="kbd" style="color:#fff;border-color:rgba(255,255,255,.4)">Enter</span></button>
        </div>
        <div class="hint">${ch.hint || 'Dezimalzahlen mit Komma oder Punkt, Brüche wie 1/2 gehen auch.'}</div>`;
      const inp = root.querySelector('#ans'), btn = root.querySelector('#ok');
      setTimeout(() => inp.focus(), 50);
      const submit = () => {
        const v = U.parseNum(inp.value);
        if (Number.isNaN(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); inp.focus(); return; }
        const correct = Math.abs(v - ch.answer) <= tol;
        inp.disabled = true; btn.disabled = true;
        inp.style.borderColor = correct ? 'var(--good)' : 'var(--bad)';
        api.done(correct, { answerLine: `Deine Antwort: ${U.fmt(v, 3)} · Richtig: <b>${U.fmt(ch.answer, ch.digits ?? 2)}</b>${tol > 0.02 ? ' (±' + U.fmt(tol, 2) + ')' : ''}` });
      };
      btn.addEventListener('click', submit);
      api.setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    },
  });
})();
