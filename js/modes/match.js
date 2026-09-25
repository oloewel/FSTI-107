/* ============ Modus: match ============
   Zuordnungsaufgabe: Jeder Zeile (label) wird per Auswahlliste ein Begriff zugeordnet.
   Format: { type:'match', prompt, figure?, pairs:[{label, answer}], choices?:[...], explain }
   choices = alle wählbaren Begriffe (Standard: die answers der pairs).
   Ergebnis: correct = alle richtig; fraction = Anteil richtiger Zuordnungen (Teilpunkte). */
(function () {
  const U = BrainForge.utils;
  BrainForge.registerMode('match', {
    render(root, ch, api) {
      const pairs = ch.keepOrder ? ch.pairs.slice() : U.shuffle(ch.pairs);
      const choices = U.shuffle([...new Set(ch.choices || ch.pairs.map(p => p.answer))]);
      root.innerHTML = `<div class="match">${pairs.map((p, i) => `
          <div class="mrow"><div class="mlabel">${p.label}</div>
            <select class="msel" data-i="${i}"><option value="">Auswählen …</option>${choices.map(c => `<option value="${U.escape(c)}">${c}</option>`).join('')}</select>
            <div class="mres"></div></div>`).join('')}</div>
        <div class="row" style="margin-top:14px"><button class="btn" id="mcheck">Prüfen</button><span class="hint" id="mhint"></span></div>`;
      const sels = [...root.querySelectorAll('.msel')];
      const btn = root.querySelector('#mcheck');
      const submit = () => {
        const missing = sels.filter(s => !s.value).length;
        if (missing) { root.querySelector('#mhint').textContent = `Noch ${missing} ${missing === 1 ? 'Zeile' : 'Zeilen'} offen.`; return; }
        let ok = 0;
        sels.forEach((s, i) => {
          const right = s.value === pairs[i].answer;
          if (right) ok++;
          s.disabled = true;
          s.classList.add(right ? 'good' : 'bad');
          s.parentElement.querySelector('.mres').innerHTML = right ? '✅' : `❌ <span class="muted">richtig: ${pairs[i].answer}</span>`;
        });
        btn.disabled = true;
        api.done(ok === pairs.length, { fraction: ok / pairs.length, answerLine: `${ok} von ${pairs.length} Zuordnungen richtig` });
      };
      btn.addEventListener('click', submit);
      api.setKeys((e) => { if (e.key === 'Enter' && document.activeElement?.tagName !== 'SELECT') { e.preventDefault(); submit(); } });
    },
  });
})();
