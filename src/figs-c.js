/* figs-c.js — FIG 16, 17, 18, 21 + master-infographic helpers */

/* ================= FIG 16 — diagnostic decision tree ================= */
const TREE = {
  q1: { q: 'IS THE LAPTOP CHARGING?', yes: 'q2', no: 'A' },
  q2: { q: 'ARE USB DEVICES WORKING?', yes: 'B', no: 'q3' },
  q3: { q: 'ARE DISPLAYS ALSO MISSING?', yes: 'q6', no: 'C' },
  q6: { q: 'IS ANY DOCK DEVICE IN DEVICE MANAGER?', yes: 'X', no: 'D' },
  q4: { q: 'DID A WINDOWS RESTART FIX IT?', yes: 'E', no: 'F' },
  q5: { q: 'DID FUNCTION RETURN?', yes: 'G', no: 'H' }
};
const TREE_LEAF = {
  A: ['POWER PATH', 'Investigate charger, cable, VBUS, CC, PD contract. Try a known-good USB-C charger directly.', 'warn'],
  B: ['DISPLAY PATH ONLY', 'USB works, so lanes + controller are alive. Check DP Alt Mode, MST / monitor settings, display cable, graphics driver.', 'main'],
  C: ['USB PATH ONLY', 'Displays fine, USB missing: dock hub, xHCI, USB selective-suspend, drivers.', 'main'],
  X: ['ALT MODE / LANE PATH', 'Hub or Billboard device visible, so USB 2.0 works: focus on DP Alt Mode, mux, retimer, dock graphics controller.', 'main'],
  D: ['BEFORE ANY USB ENUMERATION', 'Shared domain upstream of USB 2.0 and Alt Mode: PD connection / data-role state · EC ↔ PD ↔ SoC handshake · dock hub power / firmware.', 'fail'],
  E: ['SOFTWARE / DRIVER STATE', 'A warm reset was enough: xHCI, graphics or OS power-policy state. Update drivers.', 'main'],
  F: ['HARDWARE POWER RESET', 'Unplug the dock, hold the power button past the forced-off threshold (15–20 s per HP / Dell docs; 45 s also works), reconnect.', 'aux'],
  G: ['TRANSIENT CONTROLLER / LINK STATE', 'Strong hypothesis — not proof. Next: update dock firmware, BIOS, PD / retimer firmware, graphics + chipset drivers; log each recurrence.', 'pwr'],
  H: ['PERSISTENT FAULT', 'Swap cable / dock, test another host, re-flash dock firmware, escalate to hardware service.', 'fail']
};
const TREE_INCIDENT = { q1: 'yes', q2: 'no', q3: 'yes', q6: 'no', q4: 'no', q5: 'yes' };
function fig16(ans = TREE_INCIDENT, sel = null) {
  // active path
  const active = new Set(['start', 'q1']);
  let cur = 'q1';
  const seq = { D: 'q4', F: 'q5' };
  while (cur) {
    const nxt = TREE[cur] ? TREE[cur][ans[cur]] : seq[cur];
    if (!nxt) break; active.add(nxt); cur = nxt;
  }
  const pos = { start: [360, 50], q1: [360, 150], q2: [360, 275], q3: [360, 400], q6: [360, 525], D: [360, 650], q4: [360, 780], F: [360, 905], q5: [360, 1030], G: [360, 1150], A: [850, 150], B: [850, 275], C: [850, 400], X: [850, 525], E: [850, 780], H: [850, 1030] };
  const on = id => active.has(id);
  let s = '';
  const link = (a, b, label, side) => {
    const [x1, y1] = pos[a], [x2, y2] = pos[b]; const lit = on(a) && on(b);
    const c = lit ? (side ? P.silk : P.pwr) : '#2a4636';
    const d = side ? `M${x1 + 230},${y1} H${x2 - 210}` : `M${x1},${y1 + 34} V${y2 - 34}`;
    s += `<path d="${d}" class="tr" stroke="${c}" stroke-width="${lit ? 3 : 2}" ${lit ? 'filter="url(#glow)"' : 'stroke-dasharray="5 5"'} marker-end="url(#ar-${lit ? (side ? 'ink' : 'pwr') : 'off'})"/>`;
    if (label) s += tag(side ? x1 + 250 : x1 + 14, side ? y1 - 8 : (y1 + y2) / 2 + 4, label, lit ? P.silk : '#5d7a6a');
  };
  link('start', 'q1');
  Object.entries(TREE).forEach(([id, n]) => {
    const yesSide = pos[n.yes][0] > 600, noSide = pos[n.no][0] > 600;
    link(id, n.yes, 'YES', yesSide); link(id, n.no, 'NO', noSide);
  });
  link('D', 'q4'); link('F', 'q5');
  const node = (id, w, title, role, q) => {
    const [x, y] = pos[id]; const lit = on(id); const c = lit ? (ROLE[role] || role) : '#2c4a3a';
    let g = `<g class="tnode" data-node="${id}" tabindex="0" role="button" aria-label="${esc(title)}" style="cursor:pointer">`;
    g += `<rect x="${x - w / 2}" y="${y - 32}" width="${w}" height="64" rx="${q ? 32 : 8}" fill="${role === 'fail' && lit ? 'url(#hatchRed)' : P.bg}" stroke="${sel === id ? P.silk : c}" stroke-width="${sel === id ? 3 : 2}" ${lit ? 'filter="url(#glow)"' : ''}/>`;
    if (role === 'fail' && lit) g += `<rect x="${x - w / 2}" y="${y - 32}" width="${w}" height="64" rx="8" fill="${P.bg}" opacity=".5"/>`;
    g += TH(x, y + (q ? 7 : -2), title, 'mid', `style="font-size:${title.length > 26 ? 15 : 17}px;fill:${lit ? P.silk : '#6c8576'}"`);
    if (q && TREE[id]) g += T(x, y + 24, `answer: ${ans[id].toUpperCase()} · click to flip`, 'mid', `style="font-size:9px;fill:${lit ? P.ink2 : '#4d6457'}"`);
    if (!q && TREE_LEAF[id]) g += T(x, y + 18, 'click for detail', 'mid', `style="font-size:9px;fill:${lit ? P.ink2 : '#4d6457'}"`);
    return g + `</g>`;
  };
  s += node('start', 300, 'DOCK CONNECTED', 'pwr', true);
  Object.entries(TREE).forEach(([id, n]) => s += node(id, 420, n.q, 'aux', true));
  Object.entries(TREE_LEAF).forEach(([id, [t, , role]]) => s += node(id, ['D', 'F', 'G'].includes(id) ? 440 : 400, t, role, false));
  // incident badge
  const isIncident = Object.keys(TREE_INCIDENT).every(k => ans[k] === TREE_INCIDENT[k]);
  s += `<g transform="translate(620,1118)"><rect width="570" height="64" rx="8" fill="#0a1611" stroke="${isIncident ? P.pwr : P.line}"/>` + T(16, 26, isIncident ? 'SHOWING: YOUR INCIDENT PATH' : 'SHOWING: A DIFFERENT PATH', 'ts tw', `style="fill:${isIncident ? P.pwr : P.aux}"`) + T(16, 46, 'Charging YES · USB NO · Displays missing · not in Device Mgr · restart NO · reset YES', 'ts c-dim') + `</g>`;
  return svgWrap(1200, 1200, s, 'Interactive diagnostic decision tree');
}
/* compact horizontal version for the master infographic */
function fig16h() {
  let s = '';
  const steps = [['DOCK', 'CONNECTED', 'pwr'], ['CHARGING?', 'YES', 'pwr'], ['USB WORKING?', 'NO', 'fail'], ['DISPLAYS?', 'MISSING', 'fail'], ['IN DEVICE MGR?', 'NOT AT ALL', 'fail'], ['PRE-USB STATE', 'PD conn · EC', 'warn'], ['RESTART FIXED?', 'NO', 'fail'], ['HARD RESET', 'hold power', 'aux'], ['RETURNED?', 'YES', 'pwr'], ['TRANSIENT STATE', 'strong hypothesis', 'pwr']];
  steps.forEach(([a, b, r], i) => {
    const x = 20 + i * 236, c = ROLE[r];
    s += `<rect x="${x}" y="40" width="204" height="86" rx="10" fill="${P.bg}" stroke="${c}" stroke-width="2.5" filter="url(#glow)"/>` + TH(x + 102, 78, a, 'mid', 'style="font-size:19px"') + T(x + 102, 104, b, 'mid tm tw', `style="fill:${c}"`);
    if (i < steps.length - 1) s += arrow(`M${x + 206},83 H${x + 232}`, 'ink', 3);
  });
  s += T(20, 160, 'Side exits: not charging → charger / cable / PD   ·   USB OK → display path only   ·   dock visible in Device Manager → Alt Mode / lane path   ·   restart fixes it → driver / OS state   ·   reset fails → hardware fault', 'tm c-dim');
  return svgWrap(2380, 180, s, 'Decision path summary');
}

/* ================= FIG 17 — before / reset / after ================= */
function fig17() {
  let s = '';
  const panel = (x, n, title, c) => `<rect x="${x}" y="20" width="380" height="600" rx="10" fill="#0a1611" stroke="${c}" stroke-opacity=".7"/>` + T(x + 20, 50, 'PANEL ' + n, 'ts tw', `style="fill:${c}"`) + TH(x + 20, 82, title, 'txl');
  const chip = (x, y, ok) => {
    const c = ok ? P.pwr : P.fail;
    return `<g>${qfn(x, y, 120, 120, { label: 'PD CTRL', sub: ok ? 'FRESH STATE' : 'STUCK STATE' })}<rect x="${x - 10}" y="${y - 10}" width="140" height="140" rx="10" fill="${ok ? 'none' : 'url(#hatchRed)'}" stroke="${c}" stroke-width="3" filter="url(#glow)" ${ok ? '' : 'class="pulse"'}/></g>`;
  };
  // 1
  s += panel(20, 1, 'BEFORE', P.fail) + chip(150, 130, false);
  s += statusPill(60, 330, 'pwr', true, 'POWER', 300) + statusPill(60, 378, 'usb', false, 'USB', 300) + statusPill(60, 426, 'dp', false, 'DISPLAY', 300);
  s += TL(60, 500, 'Contract is up and charging,\nbut the controller’s volatile state\nis wrong, and restart never\npowers it down.', 18, 'ts c-dim');
  // 2
  s += panel(410, 2, 'RESET', P.aux);
  const ch = [['POWER BUTTON', 'ink'], ['EC', 'aux'], ['PMIC', 'warn'], ['RAILS COLLAPSE', 'off'], ['VOLTAGE DECAY', 'aux'], ['VOLATILE STATE LOST', 'fail']];
  ch.forEach(([t, r], i) => {
    const y = 110 + i * 78;
    s += `<rect x="450" y="${y}" width="300" height="46" rx="8" fill="${P.bg}" stroke="${ROLE[r]}" stroke-width="2" ${r !== 'off' ? 'filter="url(#glow)"' : ''}/>` + TH(600, y + 30, t, 'mid', 'style="font-size:17px"');
    if (r === 'aux' && i === 4) s += `<path d="M666,${y + 10} H690 C706,${y + 10} 712,${y + 38} 738,${y + 38}" class="tr" stroke="${P.aux}" stroke-width="2"/>`;
    if (i < ch.length - 1) s += arrow(`M600,${y + 46} V${y + 76}`, 'ink', 2);
  });
  // 3
  s += panel(800, 3, 'AFTER', P.pwr);
  const ch3 = ['CC', 'PD', 'ALT MODE', 'USB', 'WINDOWS'];
  ch3.forEach((t, i) => {
    const x = 830 + i * 66;
    s += `<rect x="${x}" y="110" width="58" height="40" rx="6" fill="${P.bg}" stroke="${P.pwr}" stroke-width="2" filter="url(#glow)"/>` + T(x + 29, 135, t, 'mid', `style="font-size:${t.length > 4 ? 8 : 11}px;font-weight:700"`);
    if (i < 4) s += `<path d="M${x + 58},130 h8" stroke="${P.pwr}" stroke-width="2"/>`;
  });
  s += chip(930, 190, true);
  s += statusPill(840, 360, 'pwr', true, 'POWER', 300) + statusPill(840, 408, 'usb', true, 'USB · ETHERNET', 300) + statusPill(840, 456, 'dp', true, 'DISPLAYS', 300);
  s += TL(840, 530, 'Same hardware, clean state:\nthe chain re-negotiates\nfrom stage 1.', 18, 'ts c-dim');
  s += arrow('M400,320 H406', 'ink', 3) + arrow('M790,320 H796', 'ink', 3);
  return svgWrap(1200, 640, s, 'Before, reset, after');
}

/* ================= FIG 18 — exploded isometric laptop ================= */
function fig18() {
  const k = 0.95, cx = 430, cy = 392;
  const iso = (x, y, z) => [cx + (x - y) * 0.866 * k, cy + (x + y) * 0.5 * k - z * k];
  const poly = pts => pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const plane = (x, y, w, d, z) => [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)];
  const prism = (x, y, w, d, z, h, top, side1, side2, extra = '') =>
    `<polygon points="${poly([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)])}" fill="${side1}" ${extra}/>` +
    `<polygon points="${poly([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)])}" fill="${side2}" ${extra}/>` +
    `<polygon points="${poly(plane(x, y, w, d, z + h))}" fill="${top}" stroke="#00000055" ${extra}/>`;
  const line = (pts, c, w, extra = '') => `<polyline points="${poly(pts)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const W = 520, D = 340, ZB = 180, ZBAT = 80, ZTOP = 345;
  const anchors = {};
  let s = '';
  // bottom cover
  s += prism(0, 0, W, D, 0, 8, '#1b2320', '#121815', '#0e1311');
  anchors.bottom = iso(W, D / 2, 4);
  // battery
  s += prism(60, 190, 400, 120, ZBAT, 14, '#202b25', '#151d19', '#111714');
  [0, 1, 2].forEach(i => s += `<polygon points="${poly(plane(72 + i * 130, 200, 120, 100, ZBAT + 14.5))}" fill="#2b3a32" stroke="#3f5246"/>`);
  s += line([iso(250, 250, ZBAT + 15), iso(250, 250, ZB)], P.pwr, 3, 'stroke-dasharray="4 4"');
  anchors.bat = iso(460, 250, ZBAT + 7);
  // motherboard
  s += prism(0, 0, W, D - 150, ZB, 5, '#0d2a1b', '#0a1f14', '#081a11');
  s += `<polygon points="${poly(plane(0, 0, W, D - 150, ZB + 5.2))}" fill="url(#pcbTex)" opacity=".8"/>`;
  anchors.mb = iso(W, 95, ZB + 2);
  const zt = ZB + 5.5;
  // traces on board
  s += line([iso(8, 120, zt), iso(8, 175, zt), iso(150, 175, zt)], P.pwr, 4, 'filter="url(#glow)"');
  s += line([iso(200, 160, zt), iso(330, 160, zt), iso(330, 140, zt)], P.pwr, 4, 'filter="url(#glow)"');
  s += line([iso(250, 150, zt), iso(250, 95, zt), iso(215, 95, zt)], P.aux, 3, 'filter="url(#glow)"');
  s += line([iso(185, 80, zt), iso(110, 55, zt), iso(85, 55, zt)], P.aux, 3, 'filter="url(#glow)"');
  s += line([iso(200, 150, zt), iso(300, 120, zt), iso(340, 95, zt)], P.main, 3, 'filter="url(#glow)"');
  s += line([iso(345, 125, zt), iso(110, 125, zt)], P.fail, 3.5, 'filter="url(#glow)"');
  s += line([iso(60, 125, zt), iso(20, 100, zt)], P.fail, 3.5, 'filter="url(#glow)"');
  s += line([iso(450, 90, zt), iso(420, 90, zt)], P.io, 3, 'filter="url(#glow)"');
  // floating components with drop lines
  const comp = (key, x, y, w, d, lift, h, top, glowC, label) => {
    const z = zt + lift;
    let g = line([iso(x + w / 2, y + d / 2, zt), iso(x + w / 2, y + d / 2, z)], glowC, 1.2, 'stroke-dasharray="3 4" opacity=".8"');
    g += `<polygon points="${poly(plane(x, y, w, d, zt))}" fill="${glowC}" opacity=".18"/>`;
    g += prism(x, y, w, d, z, h, top, '#0b0d0e', '#16191b');
    g += `<polygon points="${poly(plane(x, y, w, d, z + h))}" fill="none" stroke="${glowC}" stroke-width="2" filter="url(#glow)"/>`;
    if (label) { const [lx, ly] = iso(x + w / 2, y + d / 2, z + h); g += `<text x="${lx}" y="${ly + 4}" class="t mid" style="font-size:9px;font-weight:700">${label}</text>`; }
    anchors[key] = iso(x + w, y + d / 2, z + h / 2);
    return g;
  };
  // port is on the edge
  s += prism(-14, 85, 22, 50, zt, 14, '#9aa4aa', '#6d777c', '#59636a');
  anchors.port = iso(-14, 110, zt + 7);
  s += comp('pd', 40, 35, 50, 45, 55, 8, '#1a1e21', P.fail, 'PD');
  s += comp('mux', 60, 105, 55, 45, 42, 8, '#1a1e21', P.fail, 'MUX/RT');
  s += comp('ec', 180, 60, 60, 60, 70, 9, '#1a1e21', P.aux, 'EC');
  s += comp('pmic', 150, 140, 60, 45, 30, 9, '#1a1e21', P.pwr, 'PMIC');
  s += comp('cpu', 320, 60, 100, 100, 50, 12, '#3a434a', P.main, 'SoC');
  s += comp('gpu', 440, 50, 60, 60, 80, 10, '#3a434a', P.io, 'GPU');
  // chassis / keyboard deck (translucent)
  s += `<polygon points="${poly(plane(0, 0, W, D, ZTOP))}" fill="#1b2420" fill-opacity=".14" stroke="#7d8c84" stroke-width="1.5"/>`;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) s += `<polygon points="${poly(plane(48 + c * 33, 30 + r * 30, 27, 24, ZTOP + 0.5))}" fill="none" stroke="#56645c" stroke-width=".8" stroke-opacity=".7"/>`;
  s += `<polygon points="${poly(plane(190, 200, 140, 100, ZTOP + 0.5))}" fill="none" stroke="#56645c"/>`;
  anchors.chassis = iso(W, 0, ZTOP);
  // callouts
  const call = [['chassis', 'LAPTOP CHASSIS · keyboard deck', P.ink], ['mb', 'MOTHERBOARD', P.pwr], ['port', 'USB-C PORT', P.io], ['pd', 'USB-C PD CONTROLLER', P.fail], ['mux', 'MUX / RETIMER', P.fail], ['ec', 'EMBEDDED CONTROLLER', P.aux], ['pmic', 'PMIC / CHARGER IC', P.pwr], ['cpu', 'CPU / SoC', P.main], ['gpu', 'GPU / DISPLAY PATH', P.io], ['bat', 'BATTERY', P.pwr], ['bottom', 'BOTTOM COVER', P.ink2]];
  call.sort((p, q) => anchors[p[0]][1] - anchors[q[0]][1]);
  call.forEach(([k2, l, c], i) => {
    const y = 60 + i * 64, [ax, ay] = anchors[k2];
    s += `<path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${930},${y} H${948}" fill="none" stroke="${c}" stroke-width="1.2" opacity=".75"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.5" fill="${c}"/>`;
    s += T(956, y + 4, l, 'tw', `style="fill:${c === P.ink2 ? P.ink2 : P.silk}"`) + `<rect x="956" y="${y + 10}" width="${l.length * 7.2}" height="2" fill="${c}" opacity=".8"/>`;
  });
  s += T(40, 40, 'TOP', 'ts tw c-dim') + T(40, 780, 'BOTTOM', 'ts tw c-dim') + `<path d="M58,52 V762" stroke="#2c4a3a" stroke-width="1.5" marker-start="url(#ar-off)" marker-end="url(#ar-off)"/>`;
  return svgWrap(1200, 800, s, 'Exploded isometric view of the laptop with glowing power and data paths');
}

/* ================= FIG 21 — hypothesis map ================= */
const HYPO = [
  { id: 'pd', name: 'PD CONTROLLER CONNECTION / DATA-ROLE STATE', v: 'pwr', verdict: 'CONSISTENT', for: ['Contract stayed valid (charging) while no USB device of any kind appeared', 'The PD controller reports “USB connected / data role” to the host; if that never happens, even USB 2.0 stays off on many current platforms', 'Often fed from AUX or VBUS, so a restart does not power it down', 'Cleared after a forced power-off'], against: ['Cannot be told apart from EC firmware or the SoC Type-C subsystem without logs'] },
  { id: 'ec', name: 'EC ↔ PD ↔ SoC CONNECTION HANDSHAKE', v: 'pwr', verdict: 'CONSISTENT', for: ['On many designs the EC relays PD connection status to the SoC (and to Windows via UCSI)', 'EC and PD state both survive a Windows restart', 'A long hold is exactly the event that makes the EC re-sequence everything'], against: ['No other EC symptoms reported (battery, keyboard, power LED fine)'] },
  { id: 'dock', name: 'DOCK CONTROLLER (DMC / HUB / GRAPHICS)', v: 'aux', verdict: 'POSSIBLE', for: ['A dock whose hub never powers up looks identical from the host: nothing in Device Manager', 'The laptop reset forced a fresh PD contract, which can re-initialise dock logic', 'HP ships dock firmware fixes for detection and network drops'], against: ['The dock kept its own adapter power throughout the laptop reset'] },
  { id: 'alt', name: 'ALT MODE STATE MACHINE (ALONE)', v: 'aux', verdict: 'POSSIBLE · PART', for: ['Explains missing displays and USB 3'], against: ['Cannot explain the missing USB 2.0 devices: USB 2.0 needs no Alt Mode', 'A compliant dock that fails Alt Mode shows a USB Billboard device — none appeared'] },
  { id: 'mux', name: 'MUX / RETIMER STATE (ALONE)', v: 'fail', verdict: 'LESS CONSISTENT', for: ['Wrong routing kills USB 3 + DP together'], against: ['USB 2.0 D+/D− bypasses the SuperSpeed mux, yet USB 2.0 was gone too', 'Usually on S0 rails that a restart may also cycle'] },
  { id: 'xhci', name: 'USB CONTROLLER / xHCI', v: 'fail', verdict: 'LESS CONSISTENT', for: ['Would explain missing USB + Ethernet'], against: ['A Windows restart re-initialises xHCI — it did not help', 'xHCI does not carry DisplayPort'] },
  { id: 'os', name: 'OS / DISPLAY DRIVER', v: 'fail', verdict: 'LESS CONSISTENT', for: ['Drivers can lose devices'], against: ['Restart reloads every driver — no change', 'A driver fault usually leaves a device with an error, not no device at all'] },
  { id: 'cable', name: 'CABLE / PHYSICAL CONNECTION', v: 'fail', verdict: 'LESS CONSISTENT', for: ['Broken data wires could keep power but drop all data'], against: ['Fixed without touching the cable', 'Physical faults usually persist across resets'] },
  { id: 'trigger', name: 'ROOT TRIGGER (FW BUG · SLEEP/WAKE RACE · ESD)', v: 'off', verdict: 'CANNOT DETERMINE', for: ['Something put the controller in that state'], against: ['No logs or reproduction — the evidence cannot say what'] }
];
function fig21(sel = null) {
  let s = '';
  const cx = 600, cy = 400;
  HYPO.forEach((h, i) => {
    const a = -Math.PI / 2 + i * (2 * Math.PI / HYPO.length);
    const x = cx + Math.cos(a) * 430, y = cy + Math.sin(a) * 290, c = ROLE[h.v] === P.off ? '#7f8f86' : ROLE[h.v];
    s += `<path d="M${cx + Math.cos(a) * 130},${cy + Math.sin(a) * 130} L${x - Math.cos(a) * 60},${y - Math.sin(a) * 30}" stroke="${c}" stroke-width="${h.v === 'pwr' ? 3 : 2}" ${h.v === 'pwr' ? '' : 'stroke-dasharray="6 5"'} opacity=".8"/>`;
    const w = 250;
    s += `<g class="hnode" data-h="${h.id}" tabindex="0" role="button" aria-label="${esc(h.name)}" style="cursor:pointer"><rect x="${x - w / 2}" y="${y - 36}" width="${w}" height="72" rx="10" fill="${P.bg}" stroke="${sel === h.id ? P.silk : c}" stroke-width="${sel === h.id ? 3 : 2}" ${h.v === 'pwr' ? 'filter="url(#glow)"' : ''} ${h.v === 'off' ? 'stroke-dasharray="4 3"' : ''}/>`;
    const words = h.name.split(' '); let l1 = '', l2 = '';
    words.forEach(wd => { if ((l1 + ' ' + wd).trim().length <= 24 && !l2) l1 = (l1 + ' ' + wd).trim(); else l2 = (l2 + ' ' + wd).trim(); });
    s += TH(x, y - (l2 ? 8 : 0), l1, 'mid', 'style="font-size:15px"') + (l2 ? TH(x, y + 10, l2, 'mid', 'style="font-size:15px"') : '');
    s += T(x, y + 28, h.verdict, 'mid ts tw', `style="fill:${c}"`) + `</g>`;
  });
  s += `<circle cx="${cx}" cy="${cy}" r="128" fill="#0a1611" stroke="${P.silk}" stroke-width="2"/>`;
  s += statusPill(cx - 95, cy - 88, 'pwr', true, 'CHARGING', 190) + statusPill(cx - 95, cy - 46, 'usb', false, 'USB', 190) + statusPill(cx - 95, cy - 4, 'dp', false, 'DISPLAY', 190);
  s += TH(cx, cy + 62, '45-SECOND RESET', 'mid', 'style="font-size:18px"') + TH(cx, cy + 84, 'FIXED IT', 'mid', `style="font-size:18px;fill:${P.pwr}"`);
  const lg = [[P.pwr, 'CONSISTENT WITH EVIDENCE (not proven)'], [P.aux, 'POSSIBLE'], [P.fail, 'LESS CONSISTENT'], ['#7f8f86', 'CANNOT DETERMINE']];
  lg.forEach(([c, l], i) => s += `<rect x="${40 + i * 290}" y="770" width="18" height="10" rx="2" fill="${c}"/>` + T(64 + i * 290, 780, l, 'ts'));
  return svgWrap(1200, 800, s, 'Root-cause hypothesis map');
}
