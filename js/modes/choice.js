/* ============ Modus: choice ============
   Multiple Choice (genau eine richtige Option). Optionen werden gemischt.
   Tasten 1–9 wählen direkt. */
(function () {
  const U = BrainForge.utils;
  BrainForge.registerMode('choice', {
    render(root, ch, api) {
      const opts = ch.keepOrder ? ch.options.slice() : U.shuffle(ch.options);
      root.innerHTML = `<div class="options">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${i + 1}</span>${o.html}</button>`).join('')}</div>
        <div class="hint">Tipp: Tasten <span class="kbd">1</span>–<span class="kbd">${opts.length}</span> wählen direkt.</div>`;
      const btns = [...root.querySelectorAll('.opt')];
      const armedAt = Date.now() + 250; // Schutz vor Doppelklick aus dem vorherigen Screen
      const choose = (i) => {
        const o = opts[i]; if (!o || Date.now() < armedAt) return;
        btns.forEach((b, k) => { b.disabled = true; if (opts[k].correct) b.classList.add('correct'); });
        if (!o.correct) btns[i].classList.add('wrong');
        api.done(!!o.correct, {});
      };
      btns.forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
      api.setKeys((e) => { const k = parseInt(e.key, 10); if (k >= 1 && k <= opts.length) { e.preventDefault(); choose(k - 1); } });
    },
  });
})();
