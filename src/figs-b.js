/* figs-b.js — FIG 10–15 */

/* ================= FIG 10 — voltage decay ================= */
const DECAY = { x0: 120, x1: 1060, y0: 470, y1: 80, tMin: -1, tMax: 6, vMax: 3.6, V0: 3.3 };
const dx = t => DECAY.x0 + (t - DECAY.tMin) / (DECAY.tMax - DECAY.tMin) * (DECAY.x1 - DECAY.x0);
const dy = v => DECAY.y0 - v / DECAY.vMax * (DECAY.y0 - DECAY.y1);
const TAU_PRESETS = [
  ['1 ms', 0.001, '10 µF into a 100 Ω load'],
  ['10 ms', 0.01, '100 µF into a 100 Ω load'],
  ['100 ms', 0.1, '100 µF into a 1 kΩ load'],
  ['1 s', 1, '10 µF into a 100 kΩ bleeder'],
  ['10 s', 10, '10 µF, only a 1 MΩ bleeder']
];
function fmtTime(sec) { return sec < 1 ? (sec * 1000).toPrecision(3).replace(/\.0+$/, '') + ' ms' : sec.toPrecision(3).replace(/\.0+$/, '') + ' s'; }
function fig10(vth = 1.2, tauIdx = 1, compact = false) {
  const V0 = DECAY.V0, td = Math.log(V0 / vth);
  let s = '';
  if (!compact) s += TH(40, 44, 'RAIL VOLTAGE AFTER THE REGULATOR SWITCHES OFF', 'txl') + T(40, 64, 'V(t) = V₀ · e^(−t / RC)   ·   time shown in multiples of τ = RC   ·   threshold is illustrative', 'ts c-dim');
  // grid
  for (let v = 0; v <= 3.5; v += 0.5) s += `<path d="M${DECAY.x0},${dy(v)} H${DECAY.x1}" stroke="#13281d" stroke-width="1"/>` + T(DECAY.x0 - 10, dy(v) + 4, v.toFixed(1) + ' V', 'end ts c-mute');
  for (let t = -1; t <= 6; t++) s += `<path d="M${dx(t)},${DECAY.y1} V${DECAY.y0}" stroke="#13281d" stroke-width="1"/>` + T(dx(t), DECAY.y0 + 20, t === 0 ? '0' : t + 'τ', 'mid ts c-mute');
  s += T(DECAY.x1, DECAY.y0 + 40, 'TIME →', 'end ts tw c-dim') + `<text x="40" y="${(DECAY.y0 + DECAY.y1) / 2}" class="t ts tw c-dim" transform="rotate(-90 40 ${(DECAY.y0 + DECAY.y1) / 2})" text-anchor="middle">RAIL VOLTAGE</text>`;
  // lost-state region
  s += `<rect x="${dx(td)}" y="${DECAY.y1}" width="${DECAY.x1 - dx(td)}" height="${DECAY.y0 - DECAY.y1}" fill="url(#hatchGray)" opacity=".55"/>`;
  s += `<rect x="${dx(0)}" y="${DECAY.y1}" width="${dx(td) - dx(0)}" height="${DECAY.y0 - DECAY.y1}" fill="rgba(242,194,48,.05)"/>`;
  // threshold
  s += `<path d="M${DECAY.x0},${dy(vth)} H${DECAY.x1}" stroke="${P.fail}" stroke-width="1.6" stroke-dasharray="8 6"/>` + T(DECAY.x1 - 4, dy(vth) - 8, `CONTROLLER RETENTION THRESHOLD · ${vth.toFixed(2)} V`, 'end ts tw c-fail');
  // curve
  let d = `M${dx(-1)},${dy(V0)} H${dx(0)}`;
  for (let t = 0; t <= 6.001; t += 0.05) d += ` L${dx(t).toFixed(1)},${dy(V0 * Math.exp(-t)).toFixed(1)}`;
  s += `<path d="${d}" class="tr" stroke="${P.aux}" stroke-width="3" filter="url(#glow)"/>`;
  s += `<circle cx="${dx(td)}" cy="${dy(vth)}" r="6" fill="${P.fail}" stroke="${P.bg}" stroke-width="2"/>`;
  // letter callouts
  const pts = [
    ['A', 0, V0, 'regulator disabled', -12, -16],
    ['B', 0.25, V0 * Math.exp(-0.25), 'rail begins decaying', 12, -12],
    ['C', td * 0.45, V0 * Math.exp(-td * 0.45), 'controller still retains state', 14, -14],
    ['D', td, vth, 'retention threshold crossed', 14, -14],
    ['E', td + 0.9, V0 * Math.exp(-td - 0.9), 'volatile state no longer guaranteed', 14, -18],
    ['F', 5.2, V0 * Math.exp(-5.2), 'rail settles near 0 V', -8, -22]
  ];
  pts.forEach(([L, t, v, label, ox, oy]) => {
    const x = dx(t), y = dy(v);
    s += `<circle cx="${x}" cy="${y}" r="12" fill="${P.bg}" stroke="${L === 'D' ? P.fail : P.ink}" stroke-width="1.6"/>` + T(x, y + 4, L, 'mid tw ts');
    if (!compact) s += T(x + ox + (ox < 0 ? -2 : 4), y + oy, label, `${ox < 0 ? 'end' : ''} ts`, 'style="fill:#cfdcd2"');
  });
  // phase labels
  s += T((dx(0) + dx(td)) / 2, DECAY.y1 + 18, 'STATE RETAINED', 'mid ts tw c-aux') + T((dx(td) + DECAY.x1) / 2, DECAY.y1 + 18, 'STATE LOST', 'mid ts tw c-off');
  if (!compact) {
    const [lab, tau, ex] = TAU_PRESETS[tauIdx];
    const tD = td * tau, t5 = 5 * tau;
    s += `<rect x="${DECAY.x0}" y="510" width="${DECAY.x1 - DECAY.x0}" height="58" rx="6" fill="#0a1611" stroke="${P.line}"/>`;
    s += T(DECAY.x0 + 16, 534, `τ = ${lab}  (${ex})`, 'tw') + T(DECAY.x0 + 16, 554, `D at τ·ln(V₀/Vth) = ${td.toFixed(2)}τ = ${fmtTime(tD)}   ·   ≈ 0 V (5τ) at ${fmtTime(t5)}`, 'ts c-dim');
    const ok = t5 < 45;
    s += T(DECAY.x1 - 16, 544, ok ? `45 s hold covers this ${t5 < 4 ? 'easily' : 'with margin'}` : '45 s would NOT fully clear this rail', 'end tw', `style="fill:${ok ? P.pwr : P.warn}"`);
    // crosshair placeholders
    s += `<g class="xhair" style="display:none"><path d="M0,${DECAY.y1} V${DECAY.y0}" stroke="${P.ink2}" stroke-dasharray="3 3"/><circle r="5" fill="${P.aux}" stroke="${P.bg}" stroke-width="2"/><rect class="xh-bg" x="8" y="-30" width="128" height="40" rx="4" fill="${P.bg}" stroke="${P.line}"/><text class="t ts xh-t" x="16" y="-14"></text><text class="t ts xh-v c-aux" x="16" y="2"></text></g>`;
    s += `<rect class="xh-hit" x="${DECAY.x0}" y="${DECAY.y1}" width="${DECAY.x1 - DECAY.x0}" height="${DECAY.y0 - DECAY.y1}" fill="transparent"/>`;
  }
  return svgWrap(1200, compact ? 500 : 580, s, 'Rail voltage decay after regulator is disabled, with retention threshold');
}

/* ================= FIG 11 — what discharges the rail ================= */
function fig11(on = false) {
  const c = on ? P.main : P.aux;
  let s = TH(40, 44, 'WHAT ACTUALLY DISCHARGES THE RAIL', 'txl') + T(40, 64, on ? 'Regulator ON: it supplies the rail, charges the capacitor and feeds the controller.' : 'Regulator OFF: the capacitor’s stored charge drains through the load and the bleeder — to GND.', 'ts c-dim');
  // regulator
  s += `<rect x="60" y="120" width="190" height="120" rx="8" fill="#0c1b14" stroke="${on ? P.main : P.off}" stroke-width="2"/>` + TH(155, 156, 'REGULATOR', 'mid', 'style="font-size:17px"') + T(155, 176, on ? 'EN = HIGH · switching' : 'EN = LOW · output off', 'mid ts', `style="fill:${on ? P.main : P.ink2}"`);
  s += `<path d="M190,206 H214" stroke="${P.ink}" stroke-width="2"/><path d="M214,206 L236,${on ? 206 : 192}" stroke="${on ? P.main : P.fail}" stroke-width="3" stroke-linecap="round"/><circle cx="214" cy="206" r="3" fill="${P.ink}"/><circle cx="240" cy="206" r="3" fill="${P.ink}"/>`;
  s += T(120, 210, 'VSYS in', 'ts c-dim');
  // EN from EC
  s += `<path d="M155,120 V96 H330" class="tr" stroke="${P.sig || '#c9d6cc'}" stroke-width="1.5" stroke-dasharray="5 4"/>` + T(340, 100, 'EN ← EC / power sequencer', 'ts');
  // rail
  s += `<path d="M250,206 H1000" class="tr" stroke="${c}" stroke-width="6" ${!on ? '' : ''} filter="url(#glow)"/>` + tag(820, 196, on ? 'RAIL · 3.3 V' : 'RAIL · decaying', c);
  // branches
  const br = [[420, 'CONTROLLER', 'normal circuit load'], [640, 'CAPACITOR', 'bulk + decoupling'], [860, 'BLEEDER', 'resistor / active-discharge FET']];
  br.forEach(([x, n, sub], i) => {
    s += `<path d="M${x},206 V280" stroke="${c}" stroke-width="3"/><circle cx="${x}" cy="206" r="5" fill="${c}"/>`;
    if (i === 0) s += `<rect x="${x - 70}" y="280" width="140" height="70" rx="6" fill="#0c1b14" stroke="${P.io}" stroke-width="2"/>` + TH(x, 312, 'PD / MUX', 'mid', 'style="font-size:16px"') + T(x, 332, 'controller', 'mid ts c-dim');
    if (i === 1) s += `<path d="M${x - 40},300 H${x + 40} M${x - 40},316 H${x + 40}" stroke="${P.ink}" stroke-width="4"/><path d="M${x},280 V300 M${x},316 V350" stroke="${c}" stroke-width="3"/>` + T(x + 52, 314, 'C', 'tw');
    if (i === 2) s += `<path d="M${x},280 l-12,7 24,12 -24,12 24,12 -24,12 12,7 V350" fill="none" stroke="${P.ink}" stroke-width="2.4"/>` + T(x + 24, 318, 'R', 'tw');
    s += `<path d="M${x},350 V420" stroke="${on ? P.off : P.aux}" stroke-width="3"/>` + T(x, 378 + 66, n, 'mid tw ts') + T(x, 458, sub, 'mid ts c-dim');
    if (!on) s += `<path d="M${x + (i === 0 ? 86 : 22)},${i === 1 ? 250 : 236} V400" class="tr flow" stroke="${P.aux}" stroke-width="2.5" marker-end="url(#ar-aux)"/>`;
  });
  s += `<path d="M300,420 H900" stroke="${P.ink}" stroke-width="4"/><path d="M300,420 V436 M280,436 H320 M288,446 H312 M296,456 H304" stroke="${P.ink}" stroke-width="3"/>` + T(250, 440, 'GND', 'tw end');
  if (on) s += `<path d="M260,224 H940" class="tr flow" stroke="${P.main}" stroke-width="2" marker-end="url(#ar-main)"/>`;
  // power button separately
  s += `<g transform="translate(980,250)"><rect width="200" height="200" rx="10" fill="#140b0b" stroke="${P.fail}" stroke-opacity=".7"/>` + icon('i-btn', 78, 24, 44, P.ink) + T(100, 92, 'POWER BUTTON', 'mid ts tw') + T(100, 112, '→ PWR_BTN# → EC only', 'mid ts c-dim');
  s += TH(100, 160, 'POWER BUTTON', 'mid', 'style="font-size:15px"') + TH(100, 186, '≠ DISCHARGE PATH', 'mid', `style="font-size:17px;fill:${P.fail}"`) + `</g>`;
  s += `<path d="M1000,212 C1060,212 1080,230 1080,248" stroke="${P.fail}" stroke-width="2" stroke-dasharray="4 4"/><path d="M1068,226 l22,14 M1090,226 l-22,14" stroke="${P.fail}" stroke-width="3"/>`;
  return svgWrap(1200, 480, s, 'Circuit: regulator, rail, controller, capacitor, bleeder; power button is not the discharge path');
}

/* ================= FIG 12 — volatile vs non-volatile ================= */
function fig12(collapsed = true) {
  const L = ['SRAM', 'volatile registers', 'runtime state', 'controller state machine', 'PHY state', 'mux configuration', 'temporary PD state'];
  const R = ['firmware flash', 'EEPROM', 'BIOS firmware', 'NVRAM', 'RTC / CMOS (own supply)'];
  let s = '';
  const bucket = (x, title, sub, items, role, lost) => {
    const c = ROLE[role];
    let g = `<path d="M${x},90 L${x + 30},520 H${x + 430} L${x + 460},90" fill="#0c1b14" stroke="${c}" stroke-width="2.5" ${lost ? '' : 'filter="url(#glow)"'}/>`;
    g += TH(x + 230, 60, title, 'mid', `style="font-size:21px;fill:${c}"`) + T(x + 230, 80, sub, 'mid ts c-dim');
    items.forEach((it, i) => {
      const y = 120 + i * 54, w = 340;
      g += `<g ${lost ? 'opacity=".5"' : ''}><rect x="${x + 60}" y="${y}" width="${w}" height="40" rx="6" fill="${P.bg}" stroke="${lost ? P.off : c}" stroke-width="1.6" ${lost ? 'stroke-dasharray="5 4"' : ''}/>`;
      for (let k = 0; k < 6; k++) g += `<rect x="${x + 70 + k * 6}" y="${y + 12}" width="3" height="16" fill="${lost ? P.off : c}" opacity=".7"/>`;
      g += T(x + 118, y + 25, it, 'tm') + (lost ? `<path d="M${x + 112},${y + 20} H${x + 390}" stroke="${P.fail}" stroke-width="2"/>` : '') + `</g>`;
    });
    return g;
  };
  s += bucket(30, 'LOST WHEN THE DOMAIN COLLAPSES', 'volatile · lives only while powered', L, collapsed ? 'fail' : 'aux', collapsed);
  s += bucket(710, 'PERSISTS', 'non-volatile · survives power loss', R, 'pwr', false);
  s += `<path d="M612,130 L560,300 H608 L578,470 L660,250 H612 L648,130Z" fill="${collapsed ? P.aux : P.off}" ${collapsed ? 'filter="url(#glowBig)"' : ''}/>`;
  s += TH(605, 520, collapsed ? 'POWER LOST' : 'POWERED', 'mid', `style="font-size:16px;fill:${collapsed ? P.aux : P.ink2}"`);
  return svgWrap(1200, 540, s, 'Volatile state is lost when a power domain collapses; non-volatile storage persists');
}

/* ================= FIG 13 — reset depth ================= */
function fig13() {
  const cols = ['OS / DRIVERS', 'CPU / SoC', 'MAIN RAILS', 'PD · MUX STATE', 'EC', 'BATTERY PATH', 'BIOS SETTINGS · CLOCK'];
  // 2 = cleared, 1 = platform-dependent, 0 = survives, -1 = n/a
  const rows = [
    ['LEVEL 1', 'WINDOWS RESTART', 'warm reset, OS-driven', [2, 2, 0, 0, 0, 0, 0]],
    ['LEVEL 2', 'FORCED SHUTDOWN', 'hold > 4 s · ACPI override → S5', [2, 2, 2, 1, 0, 0, 0]],
    ['LEVEL 3', 'RESIDUAL / HARDWARE POWER RESET', 'AC + dock out, hold ≈ 15–20 s', [2, 2, 2, 2, 1, 0, 0]],
    ['LEVEL 4', 'EC / BATTERY DISCONNECT RESET', 'pinhole · BIOS battery-disable', [2, 2, 2, 2, 2, 2, 1]],
    ['LEVEL 5', 'RTC / CMOS / NVRAM RESET', 'configuration reset — a different axis', [-1, -1, -1, -1, -1, -1, 2]]
  ];
  let s = TH(40, 44, 'RESET DEPTH · WHAT EACH ONE ACTUALLY CLEARS', 'txl') + T(40, 64, 'Not interchangeable: deeper power resets clear more volatile state; a CMOS reset clears configuration, not stuck controllers', 'ts c-dim');
  const cx0 = 520, cw = 92;
  cols.forEach((c, i) => s += `<text x="${cx0 + i * cw + cw / 2}" y="112" class="t ts tw c-dim" text-anchor="middle">${c.split(' · ').map((p, k) => `<tspan x="${cx0 + i * cw + cw / 2}" dy="${k ? 12 : 0}">${p}</tspan>`).join('')}</text>`);
  rows.forEach(([lv, name, sub, v], r) => {
    const y = 140 + r * 86, step = r < 4 ? r * 18 : 0, dep = ['#16362a', '#1a4232', '#1f4f3b', '#245d45', '#3a2f55'][r];
    s += `<rect x="${30 + step}" y="${y}" width="${1140 - step}" height="74" rx="8" fill="${dep}" opacity=".55" stroke="${r === 4 ? P.io : '#2c5541'}" ${r === 4 ? 'stroke-dasharray="6 5"' : ''}/>`;
    s += T(50 + step, y + 26, lv, 'ts tw', `style="fill:${r === 4 ? P.io : P.aux}"`) + TH(50 + step, y + 50, name, '', 'style="font-size:17px"') + T(50 + step, y + 66, sub, 'ts c-dim');
    v.forEach((k, i) => {
      const x = cx0 + i * cw + cw / 2, yy = y + 37;
      if (k === 2) s += `<circle cx="${x}" cy="${yy}" r="13" fill="${P.pwr}" filter="url(#glow)"/>`;
      else if (k === 1) s += `<circle cx="${x}" cy="${yy}" r="13" fill="none" stroke="${P.warn}" stroke-width="2.5"/><path d="M${x},${yy - 13} A13,13 0 0 1 ${x},${yy + 13}Z" fill="${P.warn}"/>`;
      else if (k === 0) s += `<circle cx="${x}" cy="${yy}" r="12" fill="none" stroke="#6c7c74" stroke-width="2.5"/>`;
      else s += T(x, yy + 5, '—', 'mid c-mute');
    });
  });
  const ly = 590;
  s += `<circle cx="60" cy="${ly}" r="9" fill="${P.pwr}"/>` + T(76, ly + 4, 'cleared / re-initialised', 'ts') + `<circle cx="290" cy="${ly}" r="9" fill="none" stroke="${P.warn}" stroke-width="2"/><path d="M290,${ly - 9} A9,9 0 0 1 290,${ly + 9}Z" fill="${P.warn}"/>` + T(306, ly + 4, 'platform-dependent (rail wiring, dock VBUS, sealed battery)', 'ts') + `<circle cx="760" cy="${ly}" r="8" fill="none" stroke="#6c7c74" stroke-width="2"/>` + T(776, ly + 4, 'survives', 'ts');
  s += T(40, 622, 'The incident: Level 1 did not fix it, a long hold (Level 2–3 territory) did → the stuck state lived in a domain a restart never powers down.', 'ts tw c-aux');
  return svgWrap(1200, 640, s, 'Five reset levels and what each clears');
}

/* ================= FIG 14 — OEM reset timeline ================= */
const OEM_EVENTS = [
  { lane: 0, t: 4, type: 'forced', label: '> 4 s → power-button override → soft-off (S5)', src: 'ACPI 6.5 §4.8.2.2.1.3', gt: true },
  { lane: 1, t: 15, type: 'residual', label: 'Power (hard) reset · AC unplugged · ≈ 15 s', src: 'HP Support: Perform a power reset' },
  { lane: 2, t0: 15, t1: 20, type: 'residual', label: 'Hard reset · “flea power” drain · 15–20 s', src: 'Dell KB 000139016' },
  { lane: 3, t0: 30, t1: 35, w0: 25, w1: 40, type: 'rtc', label: 'RTC reset · AC on · ≈ 30–35 s (LED 3×) · aborts < 25 s or > 40 s', src: 'Dell KB 000125880' },
  { lane: 4, t: 0, type: 'ec', label: 'Emergency-reset pinhole · AC removed · no duration published', src: 'Lenovo HT510479 / T460 docs', none: true },
  { lane: 5, t: 20, type: 'forced', label: 'Force restart · ≈ 20 s until logo (newer models)', src: 'Microsoft Support 4036280' },
  { lane: 5, t: 15, type: 'forced', label: 'Older models: power + volume-up ≈ 15 s', src: 'Microsoft Support 4036280', alt: true }
];
const OEM_TYPES = { forced: [P.main, 'FORCED SHUTDOWN'], residual: [P.pwr, 'HARDWARE / RESIDUAL RESET'], ec: [P.warn, 'EC / BATTERY-DISCONNECT RESET'], rtc: [P.io, 'RTC RESET'] };
function fig14(compact = false) {
  const X0 = 270, X1 = 1150, tx = t => X0 + t / 60 * (X1 - X0);
  const lanes = ['ACPI SPEC · ALL PCs', 'HP · EliteBook / ProBook / ZBook', 'DELL · Latitude / Precision', 'DELL · RTC', 'LENOVO · ThinkPad', 'MICROSOFT · Surface'];
  const LY = i => 130 + i * 62;
  let s = '';
  if (!compact) s += TH(40, 44, 'OEM-DOCUMENTED POWER-BUTTON PROCEDURES · 0–60 s', 'txl') + T(40, 64, 'Only timings found in OEM / spec documentation are plotted · hover a mark for its source', 'ts c-dim');
  Object.values(OEM_TYPES).forEach(([c, l], i) => s += `<rect x="${40 + i * 260}" y="82" width="16" height="10" rx="2" fill="${c}"/>` + T(62 + i * 260, 92, l, 'ts'));
  s += T(1150, 92, 'no OEM-published battery-reset timing', 'end ts c-mute');
  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].forEach(t => {
    const major = [0, 5, 10, 15, 20, 25, 30, 40, 45, 60].includes(t);
    s += `<path d="M${tx(t)},112 V${LY(5) + 30}" stroke="${major ? '#18301f' : '#10221a'}" stroke-width="1"/>` + (major ? T(tx(t), LY(5) + 52, t + (t === 0 ? ' s' : ''), 'mid ts c-dim') : '');
  });
  lanes.forEach((l, i) => s += `<path d="M${X0},${LY(i)} H${X1}" stroke="#1e3a2b" stroke-width="1"/>` + T(40, LY(i) + 4, l, 'ts tw'));
  // 45 s marker
  s += `<rect x="${tx(45) - 18}" y="104" width="36" height="${LY(5) - 74}" fill="rgba(233,240,230,.06)"/><path d="M${tx(45)},104 V${LY(5) + 30}" stroke="${P.silk}" stroke-width="2.5" filter="url(#glow)"/>`;
  s += `<rect x="${tx(45) - 54}" y="${LY(5) + 34}" width="108" height="26" rx="13" fill="${P.silk}"/>` + TH(tx(45), LY(5) + 52, '45 s · YOUR HOLD', 'mid', `style="font-size:13px;fill:${P.bg}"`);
  OEM_EVENTS.forEach(e => {
    const [c] = OEM_TYPES[e.type]; const y = LY(e.lane) + (e.alt ? 16 : 0);
    let g = `<g class="tip" data-tip="${esc(e.label + ' — ' + e.src)}">`;
    if (e.w0 != null) g += `<rect x="${tx(e.w0)}" y="${y - 12}" width="${tx(e.w1) - tx(e.w0)}" height="24" fill="url(#hatchGray)" stroke="${c}" stroke-dasharray="4 3" opacity=".9"/>`;
    if (e.t0 != null) g += `<rect x="${tx(e.t0)}" y="${y - 8}" width="${tx(e.t1) - tx(e.t0)}" height="16" rx="4" fill="${c}" filter="url(#glow)"/>`;
    else if (e.none) g += `<circle cx="${tx(0)}" cy="${y}" r="9" fill="${P.bg}" stroke="${c}" stroke-width="2.5" stroke-dasharray="3 2"/>`;
    else g += `<path d="M${tx(e.t)},${y - 11} l9,11 -9,11 -9,-11z" fill="${c}" filter="url(#glow)"/>` + (e.gt ? `<path d="M${tx(e.t) + 12},${y} H${tx(e.t) + 46}" stroke="${c}" stroke-width="2" marker-end="url(#ar-main)"/>` : '');
    const lx = e.none ? tx(0) + 18 : (e.t1 != null ? tx(e.t1) + 12 : tx(e.t) + (e.gt ? 54 : 16));
    if (!compact || !e.alt) g += T(e.w1 != null ? tx(e.w1) : lx, e.w1 != null ? y - 18 : y + (e.alt ? 4 : -14), e.label, e.w1 != null ? 'ts end' : 'ts', `style="fill:#cfdcd2${compact ? ';font-size:9px' : ''}"`);
    s += g + `<title>${esc(e.label + ' — ' + e.src)}</title></g>`;
  });
  if (!compact) {
    s += `<rect x="40" y="${LY(5) + 76}" width="1110" height="92" rx="8" fill="#0a1611" stroke="${P.line}"/>`;
    s += TH(60, LY(5) + 106, 'IS 45 SECONDS ACTUALLY SPECIAL?', '', 'style="font-size:19px"') + TH(420, LY(5) + 106, 'NO — IT IS MARGIN, NOT MAGIC.', '', `style="font-size:19px;fill:${P.pwr}"`);
    s += T(60, LY(5) + 130, 'Every verified threshold above is ≤ 40 s. A 45 s hold passes all of them, so whichever one this laptop uses, it fired.', 'ts');
    s += T(60, LY(5) + 150, 'Caution: Dell’s RTC reset aborts if held > 40 s with AC connected — longer is not automatically “deeper”.', 'ts', `style="fill:${P.warn}"`);
  }
  return svgWrap(1200, compact ? 560 : 700, s, 'Timeline of OEM-documented power-button reset procedures with 45 second marker');
}

/* ================= FIG 15 — why 45 s may have worked ================= */
function fig15() {
  let s = TH(40, 44, 'WHY A 45-SECOND HOLD MAY HAVE WORKED', 'txl') + T(40, 64, 'Proportional bar · regulator + rail timing is board-dependent (ms → s); everything after it is margin', 'ts c-dim');
  const X0 = 60, X1 = 1140, tx = t => X0 + t / 45 * (X1 - X0);
  const steps = [
    [0, 'POWER BUTTON HELD', 'EC starts counting', P.ink],
    [4, 'FORCED-OFF THRESHOLD', 'ACPI > 4 s · OEM/platform dependent', P.main],
    [4.2, 'REGULATORS DISABLED', 'EC drops EN lines', P.warn],
    [5.2, 'RAILS COLLAPSE', 'capacitors drain through loads', P.aux],
    [6.2, 'RETENTION THRESHOLD CROSSED', 'controller can no longer hold state', P.fail],
    [7.2, 'VOLATILE STATE LOST', 'stuck Alt Mode / mux state gone', P.off]
  ];
  steps.forEach(([t, n, d, c], i) => {
    const y = 100 + i * 52;
    s += `<circle cx="80" cy="${y}" r="10" fill="${P.bg}" stroke="${c}" stroke-width="3"/>` + (i < steps.length - 1 ? `<path d="M80,${y + 10} V${y + 42}" stroke="#2c4a3a" stroke-width="2"/>` : '');
    s += TH(104, y + 6, n, '', 'style="font-size:16px"') + T(420, y + 5, d, 'ts c-dim');
  });
  s += `<path d="M80,380 V412" stroke="#2c4a3a" stroke-width="2" stroke-dasharray="4 4"/><circle cx="80" cy="424" r="12" fill="${P.silk}"/>` + TH(104, 432, '45 s · RELEASED', '', 'style="font-size:20px"') + TH(330, 432, '“large timing margin”', '', `style="font-size:18px;fill:${P.pwr}"`);
  // proportional bar
  const by = 486;
  s += `<rect x="${tx(0)}" y="${by}" width="${tx(4) - tx(0)}" height="40" fill="${P.main}" opacity=".85"/>` + `<rect x="${tx(4)}" y="${by}" width="${tx(7.2) - tx(4)}" height="40" fill="${P.aux}" opacity=".9"/>` + `<rect x="${tx(7.2)}" y="${by}" width="${tx(45) - tx(7.2)}" height="40" fill="url(#hatchGray)" stroke="${P.pwr}" stroke-width="2"/>`;
  s += T(tx(2), by + 62, 'wait for EC', 'mid ts c-main') + T(tx(5.6), by + 62, 'off + decay*', 'mid ts c-aux') + TH(tx(26), by + 27, 'MARGIN ≈ 38 s', 'mid', `style="font-size:18px;fill:${P.pwr}"`);
  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(t => s += T(tx(t), by - 8, t + 's', 'mid ts c-mute'));
  // equation cards
  s += `<g transform="translate(700,92)"><rect width="440" height="120" rx="10" fill="#140b0b" stroke="${P.fail}"/>` + icon('i-x', 20, 22, 40, P.fail) + TH(76, 52, '45 s ≠ STRONGER DRAIN', '', 'style="font-size:22px"') + T(76, 78, 'The button never carries the discharge current.', 'ts c-dim') + T(76, 96, 'Holding longer does not pull harder on the rails.', 'ts c-dim') + `</g>`;
  s += `<g transform="translate(700,228)"><rect width="440" height="120" rx="10" fill="#0a1a12" stroke="${P.pwr}"/>` + icon('i-ok', 20, 22, 40, P.pwr) + TH(76, 52, '45 s = MORE TIMING MARGIN', '', 'style="font-size:22px"') + T(76, 78, 'It outlasts every documented threshold and', 'ts c-dim') + T(76, 96, 'leaves seconds for slow-bleeding rails to reach 0 V.', 'ts c-dim') + `</g>`;
  s += T(700, 372, '…unless a specific OEM uses a timed routine that needs a longer hold.', 'ts', `style="fill:${P.warn}"`);
  s += T(60, 576, '* decay segment is illustrative; real rails clear in milliseconds to seconds depending on capacitance and bleed resistance (see FIG 10).', 'ts c-mute');
  return svgWrap(1200, 590, s, 'Why a 45 second hold may have worked: timing margin');
}
