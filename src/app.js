/* app.js — mounts every figure and wires the interactions */
(function () {
  // shared stylesheet + defs
  const st = document.createElement('style'); st.textContent = SVG_CSS + '.static *{animation:none!important}'; document.head.appendChild(st);
  const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  host.setAttribute('width', '0'); host.setAttribute('height', '0'); host.setAttribute('aria-hidden', 'true');
  host.style.position = 'absolute'; host.innerHTML = `<defs>${SVG_DEFS}</defs>`; document.body.prepend(host);

  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mount = (id, svg) => { const el = $(`[data-fig="${id}"]`); if (el) el.innerHTML = svg; return el; };

  const R = {
    f01: () => boardSVG('failure'), f02: fig02, f03: fig03, f04: fig04, f05: fig05, f06: fig06, f07: fig07, f08: fig08, f09: fig09,
    f13: fig13, f14: () => fig14(false), f15: fig15, f17: fig17, f18: fig18, master: () => masterSVG(false)
  };
  Object.entries(R).forEach(([k, fn]) => { try { mount(k, fn()); } catch (e) { console.error(k, e); } });

  /* ---- FIG 04 play ---- */
  $('[data-play="f04"]').addEventListener('click', () => {
    const el = $('[data-fig="f04"]');
    const nodes = $$('.seq-node', el), links = $$('.seq-link', el);
    [...nodes, ...links].forEach(n => { n.style.transition = 'opacity .35s'; n.style.opacity = '.12'; });
    nodes.forEach((n, i) => setTimeout(() => {
      n.style.opacity = '1'; const l = links.find(x => +x.dataset.step === i); if (l) l.style.opacity = '1';
    }, 300 + i * 550));
  });

  /* ---- FIG 10 decay ---- */
  const tauSel = $('#tau');
  TAU_PRESETS.forEach(([l, , ex], i) => tauSel.insertAdjacentHTML('beforeend', `<option value="${i}" ${i === 1 ? 'selected' : ''}>${l} · ${ex}</option>`));
  const drawDecay = () => {
    const v = +$('#vth').value; $('#vth-out').textContent = v.toFixed(2) + ' V';
    const el = mount('f10', fig10(v, +tauSel.value));
    const svg = $('svg', el), hit = $('.xh-hit', svg), xh = $('.xhair', svg);
    const move = ev => {
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const t = DECAY.tMin + (p.x - DECAY.x0) / (DECAY.x1 - DECAY.x0) * (DECAY.tMax - DECAY.tMin);
      const V = t < 0 ? DECAY.V0 : DECAY.V0 * Math.exp(-t);
      const x = dx(t), y = dy(V); xh.style.display = '';
      $('path', xh).setAttribute('d', `M${x},${DECAY.y1} V${DECAY.y0}`);
      const c = $('circle', xh); c.setAttribute('cx', x); c.setAttribute('cy', y);
      const flip = x > 900 ? -144 : 0;
      $('.xh-bg', xh).setAttribute('x', x + 8 + flip); $('.xh-bg', xh).setAttribute('y', y - 30);
      const tt = $('.xh-t', xh), tv = $('.xh-v', xh);
      tt.setAttribute('x', x + 16 + flip); tt.setAttribute('y', y - 14); tv.setAttribute('x', x + 16 + flip); tv.setAttribute('y', y + 2);
      const tau = TAU_PRESETS[+tauSel.value][1];
      tt.textContent = `t = ${t.toFixed(2)}τ (${t < 0 ? '−' : ''}${fmtTime(Math.abs(t) * tau)})`;
      tv.textContent = `V = ${V.toFixed(2)} V ${V < v ? '· state lost' : '· retained'}`;
    };
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerleave', () => xh.style.display = 'none');
  };
  $('#vth').addEventListener('input', drawDecay); tauSel.addEventListener('change', drawDecay); drawDecay();

  /* ---- FIG 11 / 12 toggles ---- */
  const segs = (sel, attr, fn) => $$(sel).forEach(b => b.addEventListener('click', () => { $$(sel).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset[attr]); }));
  mount('f11', fig11(false)); segs('[data-reg]', 'reg', v => mount('f11', fig11(v === 'on')));
  mount('f12', fig12(true)); segs('[data-dom]', 'dom', v => mount('f12', fig12(v === 'off')));

  /* ---- FIG 16 decision tree ---- */
  let ans = Object.assign({}, TREE_INCIDENT), tsel = null;
  const treeInfo = id => {
    const box = $('#tree-info');
    if (TREE[id]) { box.innerHTML = `<div class="sub">QUESTION</div><h4>${TREE[id].q}</h4><p>Current answer: <b>${ans[id].toUpperCase()}</b>. Click the node again to flip it.</p>`; return; }
    const L = TREE_LEAF[id];
    if (!L) { box.innerHTML = `<div class="sub">START</div><h4>Dock connected</h4><p>Follow the lit path. The defaults are your incident’s answers.</p>`; return; }
    box.innerHTML = `<div class="sub">OUTCOME</div><h4>${L[0]}</h4><p>${L[1]}</p>`;
  };
  const drawTree = () => {
    const el = mount('f16', fig16(ans, tsel));
    $$('.tnode', el).forEach(n => {
      const go = () => { const id = n.dataset.node; if (TREE[id]) ans[id] = ans[id] === 'yes' ? 'no' : 'yes'; tsel = id; drawTree(); treeInfo(id); };
      n.addEventListener('click', go); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  };
  $('.reset-tree').addEventListener('click', () => { ans = Object.assign({}, TREE_INCIDENT); tsel = 'G'; drawTree(); treeInfo('G'); });
  tsel = 'G'; drawTree(); treeInfo('G');

  /* ---- FIG 19 interactive board ---- */
  let bmode = 'failure', bsel = 'pd';
  const resetChip = { 'YES': 'pwr', 'LIKELY': 'pwr', 'POSSIBLY': 'warn', 'MAYBE': 'warn', 'TRIGGER ONLY': 'warn' };
  const partInfo = id => {
    const I = PART_INFO[id], name = BOARD_PARTS[id].name;
    const ms = (BOARD_MODES[bmode].comp[id] || 'on');
    const stLbl = { ok: ['HEALTHY', 'pwr'], fail: ['STUCK', 'fail'], warn: ['RESETTING', 'warn'], off: ['UNPOWERED', 'off'], live: ['ALIVE · AUX', 'aux'], on: ['POWERED', 'main'] }[ms];
    $('#part-info').innerHTML = `<div class="sub">COMPONENT · ${BOARD_MODES[bmode].label}</div><h4>${name}</h4>
      <div class="chipline" style="margin-bottom:10px"><span class="chip ${stLbl[1]}">${stLbl[0]}</span></div>
      <dl><div><dt>WHAT IT DOES</dt><dd>${I.does}</dd></div>
      <div><dt>VOLTAGE DOMAIN</dt><dd class="chipline">${I.domain.map(d => `<span class="chip aux">${d}</span>`).join('')}</dd></div>
      <div><dt>POWERED DURING SHUTDOWN?</dt><dd><span class="chip ${I.shut[1] || 'off'}">${I.shut[0]}</span></dd></div>
      <div><dt>IF IT GETS STUCK</dt><dd>${I.stuck}</dd></div>
      <div><dt>CLEARED BY A HARD POWER RESET?</dt><dd><span class="chip ${I.reset[1]}">${I.reset[0]}</span>${I.resetNote ? `<br>${I.resetNote}` : ''}</dd></div></dl>`;
  };
  const drawBoard = () => {
    const el = mount('f19', boardSVG(bmode, { interactive: true }));
    $('#mode-note').textContent = `${BOARD_MODES[bmode].label}: ${BOARD_MODES[bmode].note}`;
    $$('.hit', el).forEach(g => {
      const go = () => { bsel = g.dataset.id; partInfo(bsel); $$('.hit .ring', el).forEach(r => r.removeAttribute('data-sel')); };
      g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    partInfo(bsel);
  };
  segs('[data-mode]', 'mode', m => { bmode = m; drawBoard(); });
  drawBoard();

  /* ---- FIG 20 simulator ---- */
  const sim = new RailSim($('#sim'));
  $$('[data-act]').forEach(b => b.addEventListener('click', () => b.dataset.act === 'reset' ? sim.reset() : sim.act(b.dataset.act)));
  $('#sim-ac').addEventListener('change', e => { if (e.target.checked !== sim.ac) sim.toggleAc(); });
  $('#sim-deep').addEventListener('input', e => $('#sim-deep-out').textContent = e.target.value + ' s');
  $('#sim-speed').addEventListener('change', e => sim.speed = +e.target.value);

  /* ---- FIG 21 hypotheses ---- */
  let hsel = 'pd';
  const hypoInfo = id => {
    const h = HYPO.find(x => x.id === id), cls = { pwr: 'pwr', aux: 'aux', fail: 'fail', off: 'off' }[h.v];
    $('#hypo-info').innerHTML = `<div class="sub">HYPOTHESIS</div><h4>${h.name}</h4><div class="chipline" style="margin-bottom:10px"><span class="chip ${cls}">${h.verdict}</span></div>
      <dl><div><dt>EVIDENCE FOR</dt><dd><ul>${h.for.map(x => `<li>${x}</li>`).join('')}</ul></dd></div><div><dt>EVIDENCE AGAINST / GAPS</dt><dd><ul>${h.against.map(x => `<li>${x}</li>`).join('')}</ul></dd></div></dl>`;
  };
  const drawHypo = () => {
    const el = mount('f21', fig21(hsel));
    $$('.hnode', el).forEach(n => {
      const go = () => { hsel = n.dataset.h; drawHypo(); hypoInfo(hsel); };
      n.addEventListener('click', go); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  };
  drawHypo(); hypoInfo(hsel);

  /* ---- FIG 22 myth cards ---- */
  const MYTHS = [
    ['“Static electricity was trapped.”', 'More likely a controller, power-state or negotiation issue.', 'Charge on rails is ordinary capacitor energy that drains in ms–s. The fix pattern points to volatile controller state.'],
    ['“The power button drains the motherboard.”', 'The button sends a logic signal to the EC / power sequencer.', 'Current through it is set by a pull-up resistor, e.g. 3.3 V ÷ 100 kΩ ≈ 33 µA. Rails drain through loads and bleeders.'],
    ['“45 seconds clears CMOS.”', 'Not generally.', 'Dell’s documented RTC reset is 25–40 s with AC connected, and holding > 40 s aborts it. Other OEMs use jumpers, key combos or setup menus.'],
    ['“The EC carries USB data.”', 'USB data travels through USB controllers, PHYs and the mux path.', 'The EC manages power, battery, keyboard and often configures the PD controller over I²C, but it does not carry USB data.'],
    ['“If charging works, USB-C is completely healthy.”', 'Power, USB data and DisplayPort can fail independently.', 'The PD contract finishes before Alt Mode. Charging only proves stages 1–5 of the bring-up.']
  ];
  $('#cards').innerHTML = MYTHS.map(([m, r, d], i) => `<button class="card" type="button" aria-pressed="false" aria-label="Myth ${i + 1}: ${m.replace(/"/g, '')} — flip for reality"><div class="card-in"><div class="face front"><span class="lbl">MYTH ${i + 1}</span><q>${m.replace(/[“”]/g, '')}</q><small>click to flip →</small></div><div class="face back"><span class="lbl">REALITY</span><p>${r}</p><small>${d}</small></div></div></button>`).join('');
  $$('.card').forEach(c => c.addEventListener('click', () => { c.classList.toggle('flipped'); c.setAttribute('aria-pressed', c.classList.contains('flipped')); }));

  /* ---- copy SVG ---- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const id = b.dataset.copy; const svg = id === 'master' ? masterSVG(true) : standalone($(`[data-fig="${id}"] svg`).outerHTML);
    try { await navigator.clipboard.writeText(svg); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Copy blocked'; }
    setTimeout(() => b.textContent = 'Copy SVG', 1600);
  }));
  function standalone(svg) {
    return svg.replace(/<svg /, `<svg width="1200" `).replace(/(<svg[^>]*>)/, `$1<style>@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap');${SVG_CSS}</style><defs>${SVG_DEFS}</defs><rect width="100%" height="100%" fill="${P.bg}"/>`);
  }
  window.__standalone = standalone;

  /* ---- tooltips for [data-tip] ---- */
  const tip = $('#tooltip');
  document.addEventListener('pointermove', e => {
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.dataset.tip; tip.hidden = false;
    tip.style.left = Math.min(e.clientX + 14, innerWidth - 330) + 'px'; tip.style.top = (e.clientY + 16) + 'px';
  });

  /* ---- toc active state ---- */
  const links = $$('.toc a');
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
  $$('.fig').forEach(f => io.observe(f));
})();
