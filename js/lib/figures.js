/* ============ BrainForge – Figures ============
   SVG-Generatoren für Abbildungen (Netzdiagramme, Funktionsgraphen, Neuron).
   Themenpakete können diese in ihren Aufgaben verwenden. */
(function () {
  const U = window.BFUtils;
  const F = {};
  const C = { line: '#3a4a6e', text: '#e6ecff', muted: '#8a98c0', accent: '#3df2c2', accent2: '#7c5cff', warn: '#ffb347', bad: '#ff4d6d', node: '#172240' };

  /**
   * Netzdiagramm.
   * opts: { inputs: 2, layers: [2,2,1], highlight: {l, j, i} | null, labels: true,
   *         inputLabels: ['x₁','x₂'], width, height, showWeightLabel: false, tag: 'Schicht' }
   * Konvention wie im Skript: Schicht 1 = erste Neuronenschicht nach den Eingaben.
   * Kante (l, j, i): führt in Schicht l zu Neuron j, kommt von Neuron/Eingang i.
   */
  F.network = function (opts = {}) {
    const inputs = opts.inputs ?? 2;
    const layers = opts.layers ?? [2, 2, 1];
    const W = opts.width ?? 560, H = opts.height ?? 260;
    const cols = [inputs, ...layers];
    const padX = 60, padY = 30;
    const padR = opts.outputArrow === false ? padX : 100; // Platz für Ausgabepfeil + ŷ
    const colX = (c) => padX + (c * (W - padX - padR)) / (cols.length - 1);
    const rowY = (c, r) => { const n = cols[c]; const gap = (H - 2 * padY) / Math.max(n, 1); return padY + gap * (r + 0.5); };
    const r = 20;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, monospace">`;
    // Kanten
    for (let c = 1; c < cols.length; c++) {
      for (let j = 0; j < cols[c]; j++) for (let i = 0; i < cols[c - 1]; i++) {
        const hl = opts.highlight && opts.highlight.l === c && opts.highlight.j === j + 1 && opts.highlight.i === i + 1;
        const x1 = colX(c - 1) + (c - 1 === 0 ? 16 : r), y1 = rowY(c - 1, i), x2 = colX(c) - r, y2 = rowY(c, j);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hl ? C.warn : C.line}" stroke-width="${hl ? 4 : 1.5}" ${hl ? 'stroke-linecap="round"' : ''}/>`;
        if (hl && opts.weightLabel) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 8;
          s += `<text x="${mx}" y="${my}" fill="${C.warn}" font-size="14" text-anchor="middle" font-weight="700">${opts.weightLabel}</text>`;
        }
        if (hl && !opts.weightLabel) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 8;
          s += `<text x="${mx}" y="${my}" fill="${C.warn}" font-size="16" text-anchor="middle" font-weight="700">?</text>`;
        }
      }
    }
    // Eingaben
    for (let i = 0; i < inputs; i++) {
      const x = colX(0), y = rowY(0, i);
      const lbl = (opts.inputLabels && opts.inputLabels[i]) || U.uX(i + 1);
      s += `<text x="${x}" y="${y + 5}" fill="${C.accent2}" font-size="16" text-anchor="middle" font-weight="700">${lbl}</text>`;
    }
    // Neuronen
    for (let c = 1; c < cols.length; c++) {
      for (let j = 0; j < cols[c]; j++) {
        const x = colX(c), y = rowY(c, j);
        const hlNode = opts.highlightNode && opts.highlightNode.l === c && opts.highlightNode.j === j + 1;
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.node}" stroke="${hlNode ? C.accent : C.accent2}" stroke-width="${hlNode ? 3 : 2}"/>`;
        if (opts.labels !== false) {
          const lbl = (c === cols.length - 1 && cols[c] === 1 && opts.outputLabel) ? opts.outputLabel : U.uA(j + 1, c);
          s += `<text x="${x}" y="${y + 5}" fill="${C.text}" font-size="13" text-anchor="middle">${lbl}</text>`;
        }
      }
      if (opts.layerTags !== false) {
        s += `<text x="${colX(c)}" y="${H - 6}" fill="${C.muted}" font-size="12" text-anchor="middle">Schicht ${c}</text>`;
      }
    }
    if (opts.layerTags !== false) s += `<text x="${colX(0)}" y="${H - 6}" fill="${C.muted}" font-size="12" text-anchor="middle">Eingaben</text>`;
    // Ausgabe-Pfeil
    const lastC = cols.length - 1;
    if (opts.outputArrow !== false) {
      for (let j = 0; j < cols[lastC]; j++) {
        const x = colX(lastC) + r, y = rowY(lastC, j);
        s += `<line x1="${x}" y1="${y}" x2="${x + 26}" y2="${y}" stroke="${C.accent}" stroke-width="2"/><polygon points="${x + 26},${y - 5} ${x + 34},${y} ${x + 26},${y + 5}" fill="${C.accent}"/>`;
        if (cols[lastC] === 1) s += `<text x="${x + 40}" y="${y + 5}" fill="${C.accent}" font-size="15" font-weight="700">ŷ</text>`;
      }
    }
    s += '</svg>';
    return s;
  };

  /**
   * Einzelnes Neuron mit Eingaben, Gewichten, Bias, Aktivierung.
   * opts: { inputs:[{label, w}], bias, act: 'ReLU', showValues:true }
   */
  F.neuron = function (opts = {}) {
    const ins = opts.inputs || [];
    const n = ins.length;
    const W = 560, H = Math.max(170, 60 + n * 52);
    const cx = 330, cy = H / 2, r = 36;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, monospace">`;
    ins.forEach((inp, k) => {
      const y = 30 + (k + 0.5) * ((H - 60) / n);
      s += `<text x="60" y="${y + 5}" fill="${C.accent2}" font-size="16" text-anchor="end" font-weight="700">${inp.label}</text>`;
      if (opts.showValues && inp.value !== undefined) s += `<text x="66" y="${y + 5}" fill="${C.muted}" font-size="13">= ${U.fmt(inp.value)}</text>`;
      s += `<line x1="130" y1="${y}" x2="${cx - r - 4}" y2="${cy}" stroke="${C.line}" stroke-width="1.5"/>`;
      // Gewichts-Label nahe an der Eingabe (bei vielen Eingaben überlappen sie sonst in der Mitte)
      const t = n > 2 ? 0.3 : 0.5;
      const mx = 130 + t * (cx - r - 4 - 130), my = y + t * (cy - y);
      const wl = inp.wLabel || `w${U.sub(k + 1)}`;
      const txt = `${wl}${inp.w !== undefined ? ' = ' + U.fmt(inp.w) : ''}`;
      const bw = 10 + txt.length * 7.4;
      s += `<rect x="${mx - bw / 2}" y="${my - 11}" width="${bw}" height="20" rx="5" fill="#0a1020" stroke="${C.line}"/>`;
      s += `<text x="${mx}" y="${my + 4}" fill="${C.warn}" font-size="12" text-anchor="middle">${txt}</text>`;
    });
    // Bias
    s += `<text x="${cx}" y="${cy - r - 10}" fill="${C.muted}" font-size="13" text-anchor="middle">b${opts.bias !== undefined ? ' = ' + U.fmt(opts.bias) : ''}</text>`;
    s += `<line x1="${cx}" y1="${cy - r - 6}" x2="${cx}" y2="${cy - r}" stroke="${C.line}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.node}" stroke="${C.accent}" stroke-width="2.5"/>`;
    s += `<text x="${cx - 12}" y="${cy + 6}" fill="${C.text}" font-size="18" text-anchor="middle">Σ</text>`;
    s += `<line x1="${cx}" y1="${cy - r + 6}" x2="${cx}" y2="${cy + r - 6}" stroke="${C.line}"/>`;
    s += `<text x="${cx + 13}" y="${cy + 6}" fill="${C.text}" font-size="18" text-anchor="middle">φ</text>`;
    s += `<line x1="${cx + r}" y1="${cy}" x2="${cx + r + 40}" y2="${cy}" stroke="${C.accent}" stroke-width="2"/><polygon points="${cx + r + 40},${cy - 5} ${cx + r + 48},${cy} ${cx + r + 40},${cy + 5}" fill="${C.accent}"/>`;
    s += `<text x="${cx + r + 56}" y="${cy + 5}" fill="${C.accent}" font-size="16" font-weight="700">${opts.outLabel || 'a'}</text>`;
    if (opts.act) s += `<text x="${cx}" y="${cy + r + 20}" fill="${C.muted}" font-size="12" text-anchor="middle">φ = ${opts.act}</text>`;
    s += '</svg>';
    return s;
  };

  /**
   * Funktionsgraph a = φ(z).
   * opts: { fn, xmin:-5, xmax:5, ymin:-2, ymax:5, width:320, height:220, color, label }
   */
  F.plot = function (opts = {}) {
    const fn = opts.fn, xmin = opts.xmin ?? -5, xmax = opts.xmax ?? 5, ymin = opts.ymin ?? -2, ymax = opts.ymax ?? 5;
    const W = opts.width ?? 320, H = opts.height ?? 220, pad = 18;
    const sx = (x) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
    const sy = (y) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, monospace">`;
    // Gitter
    for (let x = Math.ceil(xmin); x <= xmax; x++) s += `<line x1="${sx(x)}" y1="${pad}" x2="${sx(x)}" y2="${H - pad}" stroke="#1a2440" stroke-width="1"/>`;
    for (let y = Math.ceil(ymin); y <= ymax; y++) s += `<line x1="${pad}" y1="${sy(y)}" x2="${W - pad}" y2="${sy(y)}" stroke="#1a2440" stroke-width="1"/>`;
    // Achsen
    s += `<line x1="${sx(xmin)}" y1="${sy(0)}" x2="${sx(xmax)}" y2="${sy(0)}" stroke="${C.muted}" stroke-width="1.5"/>`;
    s += `<line x1="${sx(0)}" y1="${sy(ymin)}" x2="${sx(0)}" y2="${sy(ymax)}" stroke="${C.muted}" stroke-width="1.5"/>`;
    s += `<text x="${sx(xmax) - 4}" y="${sy(0) - 6}" fill="${C.muted}" font-size="12" text-anchor="end">z</text>`;
    s += `<text x="${sx(0) + 6}" y="${sy(ymax) + 12}" fill="${C.muted}" font-size="12">a</text>`;
    // Ticks 1
    s += `<text x="${sx(1)}" y="${sy(0) + 13}" fill="${C.muted}" font-size="10" text-anchor="middle">1</text>`;
    s += `<text x="${sx(0) - 5}" y="${sy(1) + 4}" fill="${C.muted}" font-size="10" text-anchor="end">1</text>`;
    if (ymin < -1) s += `<text x="${sx(0) - 5}" y="${sy(-1) + 4}" fill="${C.muted}" font-size="10" text-anchor="end">-1</text>`;
    // Kurve
    if (fn) {
      const pts = [];
      const N = 400;
      for (let k = 0; k <= N; k++) {
        const x = xmin + (k / N) * (xmax - xmin);
        let y = fn(x);
        y = Math.max(ymin - 1, Math.min(ymax + 1, y));
        pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
      }
      s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${opts.color || C.accent}" stroke-width="2.5" stroke-linejoin="round" clip-path="inset(0)"/>`;
    }
    if (opts.label) s += `<text x="${W / 2}" y="${H - 3}" fill="${C.text}" font-size="12" text-anchor="middle">${opts.label}</text>`;
    s += '</svg>';
    return s;
  };

  /** Kleine Datentabelle als HTML. rows: [[..],[..]], head: [..] */
  F.table = function (head, rows) {
    let s = '<table class="tbl"><thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    rows.forEach(r => { s += '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>'; });
    return s + '</tbody></table>';
  };

  window.BFFigures = F;
})();
