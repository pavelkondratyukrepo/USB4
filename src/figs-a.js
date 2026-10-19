/* figs-a.js — FIG 02–09 */

const DPC = P.dp; // DisplayPort identity colour inside connector/dock figures (distinct from USB purple)

/* generic labelled block */
function block(x, y, w, h, o = {}) {
  const c = ROLE[o.role] || o.role || P.line;
  let s = `<g ${o.attrs || ''}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="${o.fill || '#0c1b14'}" stroke="${c}" stroke-width="${o.sw || 1.6}" ${o.dash ? 'stroke-dasharray="6 5"' : ''} ${o.glow ? 'filter="url(#glow)"' : ''}/>`;
  if (o.fillOver) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="${o.fillOver}"/>`;
  let ty = y + (o.lines ? 24 : h / 2 + 6);
  if (o.title) s += `<text x="${o.left ? x + 14 : x + w / 2}" y="${ty}" class="th ${o.left ? '' : 'mid'}" style="font-size:${o.fs || 18}px;fill:${o.tc || P.silk}">${o.title}</text>`;
  (o.lines || []).forEach((l, i) => s += T(o.left ? x + 14 : x + w / 2, ty + 20 + i * 16, l, `${o.left ? '' : 'mid'} ts c-dim`));
  if (o.chip) s += tag(x + w - o.chip.length * 6.4 - 22, y + 4, o.chip, c);
  return s + `</g>`;
}
function bigMark(x, y, ok, s = 44) {
  const map = { true: ['i-ok', P.pwr], false: ['i-x', P.fail], warn: ['i-warn', P.warn], off: ['i-q', P.off] };
  const [id, c] = map[String(ok)];
  return icon(id, x, y, s, c, ok === false || ok === true ? 'filter="url(#glow)"' : '');
}

/* ================= FIG 02 — USB-C connector cutaway ================= */
function fig02() {
  const top = ['GND', 'TX1+', 'TX1−', 'VBUS', 'CC1', 'D+', 'D−', 'SBU1', 'VBUS', 'RX2−', 'RX2+', 'GND'];
  const bot = ['GND', 'RX1+', 'RX1−', 'VBUS', 'SBU2', 'D−', 'D+', 'CC2', 'VBUS', 'TX2−', 'TX2+', 'GND'];
  const grp = n => n === 'GND' ? 'gnd' : (n === 'VBUS' || n.startsWith('CC')) ? 'pwr' : (n === 'D+' || n === 'D−') ? 'usb' : n.startsWith('SBU') ? 'dp' : 'ss';
  const col = { gnd: '#5d6a63', pwr: P.pwr, usb: P.io, dp: DPC };
  let s = '';
  s += TH(40, 52, 'ONE CONNECTOR ≠ ONE SUBSYSTEM', 'txl');
  s += T(40, 76, 'USB-C receptacle, viewed face-on · 24 contacts · three independent jobs', 'ts c-dim');
  // shell
  s += `<rect x="40" y="130" width="500" height="200" rx="96" fill="url(#metal)" stroke="#aab4b9" stroke-width="2"/>`;
  s += `<rect x="58" y="146" width="464" height="168" rx="80" fill="#07090a"/>`;
  s += `<rect x="80" y="186" width="420" height="88" rx="10" fill="#1f2a30" stroke="#3c4a52"/>`;
  const x0 = 98, pitch = 35;
  top.forEach((n, i) => {
    const g = grp(n), x = x0 + i * pitch, c = col[g];
    s += g === 'ss' ? `<rect x="${x}" y="192" width="20" height="30" rx="2" fill="${P.io}"/><rect x="${x + 10}" y="192" width="10" height="30" rx="2" fill="${DPC}"/>` : `<rect x="${x}" y="192" width="20" height="30" rx="2" fill="${c}"/>`;
    s += T(x + 10, 182, n, 'mid ts', `style="fill:${g === 'gnd' ? '#8a968f' : P.silk};font-size:9px"`);
    s += T(x + 10, 233, 'A' + (i + 1), 'mid', 'style="font-size:7.5px;fill:#0a0d0e;font-weight:700"');
  });
  bot.forEach((n, i) => {
    const g = grp(n), x = x0 + i * pitch, c = col[g];
    s += g === 'ss' ? `<rect x="${x}" y="238" width="20" height="30" rx="2" fill="${P.io}"/><rect x="${x + 10}" y="238" width="10" height="30" rx="2" fill="${DPC}"/>` : `<rect x="${x}" y="238" width="20" height="30" rx="2" fill="${c}"/>`;
    s += T(x + 10, 288, n, 'mid ts', `style="fill:${g === 'gnd' ? '#8a968f' : P.silk};font-size:9px"`);
    s += T(x + 10, 264, 'B' + (12 - i), 'mid', 'style="font-size:7.5px;fill:#0a0d0e;font-weight:700"');
  });
  // legend under connector
  const lg = [[P.pwr, 'POWER · VBUS + CC (PD messages ride CC)'], [P.io, 'USB 2.0 · D+/D−'], [P.io, 'SUPERSPEED PAIRS — shared:', DPC], [DPC, 'SBU1/2 → DP AUX in Alt Mode'], ['#5d6a63', 'GROUND']];
  lg.forEach(([c, l, c2], i) => { const y = 360 + i * 24; s += `<rect x="60" y="${y - 11}" width="20" height="14" rx="2" fill="${c}"/>` + (c2 ? `<rect x="70" y="${y - 11}" width="10" height="14" rx="2" fill="${c2}"/>` : '') + T(92, y, l, 'ts') + (c2 ? T(300, y, 'USB 3 or DisplayPort, set by the mux', 'ts c-dim') : ''); });
  s += T(60, 500, 'Plug is reversible: CC tells the controller which way round it is,', 'ts c-dim') + T(60, 516, 'then the mux maps TX1/RX1 or TX2/RX2 to the right destination.', 'ts c-dim');
  // bundles to the right
  s += `<path d="M540,200 C600,200 590,128 660,128" class="tr" stroke="${P.pwr}" stroke-width="10" stroke-opacity=".85" filter="url(#glow)"/>`;
  s += `<path d="M540,230 C600,230 600,290 660,290" class="tr" stroke="${P.io}" stroke-width="10" stroke-opacity=".85" filter="url(#glow)"/>`;
  s += `<path d="M540,260 C600,260 590,452 660,452" class="tr" stroke="${DPC}" stroke-width="10" stroke-opacity=".85" filter="url(#glow)"/>`;
  s += block(660, 70, 380, 120, { role: 'pwr', title: 'POWER', left: true, lines: ['VBUS · 5 / 9 / 15 / 20 V', 'CC1 / CC2 · attach + orientation', 'USB Power Delivery contract'] });
  s += block(660, 232, 380, 120, { role: 'io', title: 'USB DATA', left: true, lines: ['D+ / D− · USB 2.0', 'SuperSpeed TX / RX pairs · USB 3', 'Dock hub → USB ports + Ethernet'] });
  s += block(660, 394, 380, 120, { role: DPC, title: 'DISPLAYPORT', left: true, lines: ['High-speed lanes (2 or 4, via mux)', 'SBU1 / SBU2 → DP AUX channel', 'DisplayPort Alt Mode'] });
  s += T(1110, 58, 'INCIDENT', 'mid ts tw c-dim');
  s += bigMark(1088, 108, true) + T(1110, 172, 'WORKING', 'mid ts tw c-pwr');
  s += bigMark(1088, 270, false) + T(1110, 334, 'MISSING', 'mid ts tw c-fail');
  s += bigMark(1088, 432, false) + T(1110, 496, 'MISSING', 'mid ts tw c-fail');
  s += `<rect x="660" y="540" width="500" height="54" rx="6" fill="rgba(255,79,79,.08)" stroke="${P.fail}" stroke-opacity=".6"/>`;
  s += T(680, 562, 'Charging proves VBUS + CC + PD are healthy.', 'ts tw') + T(680, 580, 'It proves nothing about the data and display paths.', 'ts c-dim');
  return svgWrap(1200, 620, s, 'USB-C connector cutaway: power works, USB data and DisplayPort missing');
}

/* ================= FIG 03 — HP USB-C Dock G5 cutaway ================= */
function fig03() {
  let s = '';
  s += TH(40, 48, 'HP USB-C DOCK G5 · FUNCTIONAL CUTAWAY', 'txl');
  s += T(40, 70, 'Solid = publicly documented by HP · Dashed = representative function block (chip not publicly confirmed)', 'ts c-dim');
  // laptop stub + cable
  s += `<rect x="30" y="300" width="150" height="96" rx="8" fill="#151b18" stroke="#3a4a42"/><rect x="40" y="310" width="130" height="62" rx="4" fill="#07090a"/>` + T(105, 412, 'HOST LAPTOP', 'mid ts tw');
  s += T(105, 428, 'USB-C · PD + DP Alt Mode', 'mid ts c-dim');
  s += `<path d="M180,348 C240,348 250,348 330,348" stroke="#26302b" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M180,342 H330" class="tr" stroke="${P.pwr}" stroke-width="3" filter="url(#glow)"/><path d="M180,348 H330" class="tr" stroke="${P.io}" stroke-width="3"/><path d="M180,354 H330" class="tr" stroke="${DPC}" stroke-width="3"/>`;
  s += T(255, 334, 'captive USB-C cable', 'mid ts c-dim');
  // dock shell
  s += `<rect x="330" y="96" width="560" height="560" rx="70" fill="#0f1412" stroke="#46524c" stroke-width="3"/>`;
  s += `<rect x="352" y="118" width="516" height="516" rx="54" fill="url(#pcbTex)" stroke="${P.maskLine}" stroke-width="1.5"/>`;
  s += T(610, 650, '≈ 12.2 × 12.2 cm footprint (HP datasheet)', 'mid ts c-mute');
  // blocks
  s += block(372, 300, 150, 96, { role: 'pwr', title: 'PD CONTROLLER', lines: ['CC · PD · Alt Mode', '≤ 100 W to host'], chip: 'HP FW', fs: 15 });
  s += block(372, 140, 150, 96, { role: P.ink, title: 'DOCK MGMT', lines: ['controller (DMC)', 'firmware updates'], chip: 'HP FW', fs: 15 });
  s += block(372, 470, 150, 110, { role: 'pwr', title: 'POWER STAGE', lines: ['from dock AC adapter', '5·9·10·12·15·20 V', '≤ 5 A to host'], chip: 'HP SPEC', fs: 15 });
  s += block(552, 300, 110, 96, { role: P.ink2, title: 'LANE SPLIT', lines: ['dock-side mux', 'USB 3 ↔ DP'], dash: true, fs: 14 });
  s += block(692, 130, 160, 92, { role: 'io', title: 'USB 3 HUB', lines: ['USB 2 + USB 3', 'audio codec on hub'], dash: true, fs: 15 });
  s += block(692, 262, 160, 44, { role: 'io', title: 'GbE NIC · USB', dash: true, fs: 14 });
  s += block(700, 400, 150, 110, { role: DPC, title: 'GRAPHIC CTRL', lines: ['“Docking Graphic', 'Controller” · DP', 'MST-style split'], chip: 'HP FW', fs: 15 });
  // internal wiring
  s += arrow('M330,342 H372', 'pwr', 3);
  s += arrow('M522,348 H552', 'io', 3);
  s += arrow('M662,330 C682,330 672,176 690,176', 'io', 3) + arrow('M662,368 C684,368 676,455 698,455', DPC, 3);
  s += arrow('M772,222 V260', 'io', 2);
  s += arrow('M447,300 V236', P.ink2, 1.5, 'stroke-dasharray="4 4"') + T(456, 272, 'I²C / mgmt', 'ts c-mute');
  s += arrow('M447,470 V396', 'pwr', 3);
  // ports
  const port = (x, y, w, h, label, role) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#0a0d0c" stroke="${ROLE[role] || role}" stroke-width="1.6"/>` + T(x + w + 8, y + h / 2 + 4, label, 'ts tw');
  s += port(900, 130, 24, 14, '2× USB-A 3.0 (back)', 'io') + port(900, 168, 24, 14, '2× USB-A 3.0 (side)', 'io') + port(900, 206, 20, 12, 'USB-C front · data + 15 W', 'io');
  s += port(900, 243, 24, 12, 'Audio combo jack', 'io') + port(900, 273, 24, 18, 'RJ45 · 10/100/1000', 'io');
  s += port(900, 404, 24, 14, 'DisplayPort 1.4 · ×2', DPC) + port(900, 452, 26, 12, 'HDMI 2.0', DPC);
  s += port(900, 560, 24, 20, 'Power in (dock adapter)', 'pwr');
  s += arrow('M852,145 C872,145 878,137 896,137', 'io', 2) + arrow('M852,168 C872,168 878,175 896,175', 'io', 2) + arrow('M852,190 C872,190 878,212 896,212', 'io', 2) + arrow('M852,208 C872,208 878,249 896,249', 'io', 2) + arrow('M852,282 H896', 'io', 2);
  s += arrow('M850,430 H896', DPC, 2.5) + arrow('M850,470 C870,470 875,458 896,458', DPC, 2.5) + arrow('M896,570 C700,610 600,560 522,540', 'pwr', 2.5);
  // notes
  s += `<rect x="30" y="470" width="280" height="150" rx="6" fill="#0b1712" stroke="${P.line}"/>`;
  s += TL(44, 494, 'NOT THUNDERBOLT\nHP: Thunderbolt laptops “function at\nUSB-C speeds”. No PCIe tunnelling.\nHost needs PD + DP Alt Mode.\nTechnical notes: 2 external displays\n+ host panel (all three outputs usable).', 17, 'ts', 'style="fill:#cfdcd2"');
  s += `<g transform="translate(30,90)"><rect width="280" height="120" rx="6" fill="#0b1712" stroke="${P.line}"/>` + TL(14, 24, 'HP FIRMWARE PACKAGE LISTS\n• Dock Management Controller\n• Power Delivery Controller\n• Docking Graphic Controller\n(SoftPaq release notes)', 18, 'ts', 'style="fill:#cfdcd2"') + `</g>`;
  return svgWrap(1200, 680, s, 'HP USB-C Dock G5 functional cutaway');
}

/* ================= FIG 04/05 — sequences ================= */
const SEQ = [
  ['CABLE INSERTED', 'plug mates · orientation unknown', 'ink'],
  ['CC ATTACH', 'Rp/Rd seen on CC1 or CC2 → flip known', 'pwr'],
  ['PD NEGOTIATION', 'Source_Caps → Request → Accept → PS_RDY', 'pwr'],
  ['VBUS ESTABLISHED', 'contract voltage, e.g. 20 V', 'pwr'],
  ['CHARGING', 'charger takes VBUS → VSYS + battery', 'pwr'],
  ['DP ALT MODE', 'Discover ID/SVIDs/Modes → Enter Mode', 'io'],
  ['MUX ROUTES LANES', 'pin assignment C or D · orientation', 'io'],
  ['USB HUB ENUMERATES', 'dock hub, NIC, audio, ports', 'io'],
  ['DP LINK TRAINS', 'AUX over SBU · clock recovery · EQ', DPC],
  ['WINDOWS ENUMERATES', 'PnP: displays, Ethernet, USB devices', 'main']
];
function seqNodes(state) { // state[i] in 'ok' | 'fail' | 'off' | 'warn'
  let s = '';
  const pos = i => i < 5 ? [150 + i * 225, 150] : [150 + (9 - i) * 225, 330];
  // snake path
  s += `<path d="M150,150 H1050 C1130,150 1130,330 1050,330 H150" fill="none" stroke="#1d3428" stroke-width="10" stroke-linecap="round"/>`;
  for (let i = 0; i < 9; i++) {
    const [x1, y1] = pos(i), [x2, y2] = pos(i + 1);
    const c = state[i + 1] === 'ok' ? (ROLE[SEQ[i + 1][2]] || SEQ[i + 1][2]) : state[i + 1] === 'fail' ? P.fail : P.off;
    const d = i === 4 ? `M${x1},${y1} C1130,150 1130,330 ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
    s += `<path d="${d}" class="tr seq-link" data-step="${i + 1}" stroke="${c}" stroke-width="3" ${state[i + 1] === 'ok' ? 'filter="url(#glow)"' : ''} ${state[i + 1] !== 'ok' ? 'stroke-dasharray="7 6"' : ''}/>`;
  }
  SEQ.forEach(([t, d, role], i) => {
    const [x, y] = pos(i); const st = state[i];
    const c = st === 'ok' ? (ROLE[role] || role) : st === 'fail' ? P.fail : st === 'warn' ? P.warn : P.off;
    s += `<g class="seq-node" data-step="${i}">`;
    s += `<circle cx="${x}" cy="${y}" r="27" fill="${P.bg}" stroke="${c}" stroke-width="3" ${st !== 'off' ? 'filter="url(#glow)"' : ''}/>`;
    s += TH(x, y + 8, String(i + 1), 'mid tl', `style="fill:${c};font-size:22px"`);
    s += TH(x, y + (i < 5 ? -44 : 52), t, 'mid', `style="font-size:15px;fill:${st === 'off' ? '#7f8f86' : P.silk}"`);
    s += T(x, y + (i < 5 ? -28 : 68), d, 'mid', 'style="font-size:9px;fill:#97ad9f"');
    if (st === 'fail' || st === 'warn') s += icon(st === 'fail' ? 'i-x' : 'i-warn', x + 14, y - 34, 22, st === 'fail' ? P.fail : P.warn);
    s += `</g>`;
  });
  return s;
}
function fig04() {
  let s = TH(40, 50, 'NORMAL USB-C DOCK BRING-UP', 'txl') + T(40, 72, 'Representative order · USB 2.0 can enumerate as soon as VBUS is up; DP and USB 3 wait for Alt Mode', 'ts c-dim');
  s += `<g transform="translate(0,40)">${seqNodes(Array(10).fill('ok'))}</g>`;
  const band = (x, w, c, l) => `<rect x="${x}" y="470" width="${w}" height="6" rx="3" fill="${c}"/>` + T(x, 496, l, 'ts tw', `style="fill:${c}"`);
  s += band(40, 330, P.pwr, 'POWER DOMAIN · stages 1–5') + band(400, 380, P.io, 'DATA / ALT MODE · 6–8') + band(810, 160, DPC, 'DISPLAY · 9') + band(1000, 160, P.main, 'OS · 10');
  s += statusPill(330, 520, 'pwr', true, 'CHARGING', 170) + statusPill(515, 520, 'usb', true, 'USB', 150) + statusPill(680, 520, 'dp', true, 'DISPLAY', 170);
  return svgWrap(1200, 580, s, 'Normal USB-C dock bring-up sequence, ten stages', 'seq');
}
function fig05() {
  let s = TH(40, 50, 'WHERE THE CHAIN BROKE', 'txl') + T(40, 72, 'Power contract completed (charging proves it). The dock never appeared in Device Manager, so the break sits before ANY USB enumeration — USB 2.0 included.', 'ts c-dim');
  const nodeBox = (x, y, w, title, ok, role, fs = 21) => {
    const c = ok === true ? (ROLE[role] || role) : ok === 'warn' ? P.warn : ok === 'off' ? P.off : P.fail;
    return `<rect x="${x}" y="${y}" width="${w}" height="64" rx="10" fill="${ok === 'warn' ? 'url(#hatchRed)' : P.bg}" stroke="${c}" stroke-width="2.5" ${ok === 'warn' ? 'class="pulse"' : ''} ${ok === 'off' ? 'stroke-dasharray="6 5"' : 'filter="url(#glow)"'}/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="64" rx="10" fill="${P.bg}" opacity="${ok === 'warn' ? .55 : 0}"/>` +
      TH(x + 22, y + 41, title, '', `style="font-size:${fs}px;fill:${ok === 'off' ? '#7f8f86' : P.silk}"`) + bigMark(x + w - 50, y + 12, ok, 40);
  };
  s += nodeBox(80, 110, 380, 'CC ATTACH', true, 'pwr');
  s += arrow('M270,174 V214', 'pwr', 3);
  s += nodeBox(80, 218, 380, 'PD NEGOTIATION', true, 'pwr');
  s += arrow('M460,250 H640', 'pwr', 4, 'filter="url(#glow)"');
  s += `<rect x="650" y="214" width="320" height="72" rx="36" fill="${P.bg}" stroke="${P.pwr}" stroke-width="2.5" filter="url(#glow)"/>` + icon('i-bolt', 674, 232, 36, P.pwr) + TH(722, 262, 'CHARGING', '', 'style="font-size:22px"') + bigMark(910, 228, true, 44);
  s += arrow('M270,282 V330', P.warn, 3);
  s += nodeBox(80, 334, 560, 'USB CONNECTION / DATA-ROLE STATE', 'warn', 'pwr', 20);
  s += TH(170, 432, 'STUCK', '', `style="font-size:30px;fill:${P.fail}" filter="url(#glow)"`) + T(270, 418, 'PD controller (via EC) never reports a USB connection,', 'ts c-dim') + T(270, 434, 'so the host never enables the port’s USB 2.0 or USB 3', 'ts c-dim');
  // downstream: USB 2 path, Alt Mode path
  s += arrow('M150,398 V454', 'fail', 2.5, 'stroke-dasharray="6 5"') + arrow('M620,398 V454', 'fail', 2.5, 'stroke-dasharray="6 5"');
  s += nodeBox(80, 458, 380, 'USB 2.0 ENUMERATION', 'off', 'io', 18) + nodeBox(480, 458, 330, 'ALT MODE · MUX · DP', 'off', 'io', 18);
  s += T(90, 540, 'needs no Alt Mode, no mux — still absent', 'ts c-fail') + T(490, 540, 'never reached', 'ts c-fail');
  s += arrow('M300,522 C300,600 560,600 646,600', 'fail', 2.5) + arrow('M810,490 C840,490 850,600 860,610', 'fail', 2.5);
  s += `<rect x="650" y="568" width="250" height="64" rx="32" fill="${P.bg}" stroke="${P.fail}" stroke-width="2.5"/>` + icon('i-usb', 670, 584, 32, P.ink) + TH(712, 610, 'USB · LAN', '', 'style="font-size:20px"') + bigMark(846, 580, false, 40);
  s += `<rect x="910" y="568" width="250" height="64" rx="32" fill="${P.bg}" stroke="${P.fail}" stroke-width="2.5"/>` + icon('i-mon', 930, 584, 32, P.ink) + TH(972, 610, 'DISPLAYS', '', 'style="font-size:20px"') + bigMark(1106, 580, false, 40);
  s += `<g transform="translate(1000,110)"><rect width="170" height="420" rx="8" fill="#0b1712" stroke="${P.line}"/>` + TL(14, 28, 'WHY THIS SHAPE\nMATTERS\n\nIf only Alt Mode\nhad failed, USB 2.0\nwould still work and\nthe dock would show\na Billboard device.\n\nNothing showed up,\nso the stuck state\nsits upstream of\nboth paths.', 17, 'ts', 'style="fill:#cfdcd2"') + `</g>`;
  // evidence strip: Device Manager
  const y0 = 670;
  s += `<rect x="40" y="${y0}" width="1130" height="250" rx="10" fill="#08130e" stroke="${P.line}"/>` + T(60, y0 + 28, 'EVIDENCE · WINDOWS DEVICE MANAGER (View → Devices by connection)', 'ts tw c-aux');
  const dm = (x, title, rows, ok) => {
    let g = `<rect x="${x}" y="${y0 + 44}" width="520" height="186" rx="6" fill="#0f1513" stroke="${ok ? '#3a4a42' : P.fail}" stroke-width="1.5"/>` + `<rect x="${x}" y="${y0 + 44}" width="520" height="28" rx="6" fill="#16201b"/>` + T(x + 14, y0 + 63, title, 'ts tw', `style="fill:${ok ? P.ink : P.fail}"`);
    rows.forEach(([ind, txt, c], i) => g += T(x + 20 + ind * 18, y0 + 96 + i * 22, (ind ? '└ ' : '▸ ') + txt, 'ts', `style="fill:${c || '#cfdcd2'}"`));
    return g;
  };
  s += dm(60, 'IF ONLY ALT MODE / LANES HAD FAILED (expected)', [[0, 'USB xHCI controller → Type-C port'], [1, 'Generic USB hub (dock, USB 2.0 side)'], [2, 'USB Billboard device  ← “display connection may be limited”', P.aux], [2, 'Dock USB 2.0 devices (management, audio …)'], [0, 'USB Connector Managers → UCM-UCSI ACPI device'], [0, 'no DisplayPort monitors · no USB 3 hub', P.ink2]], true);
  s += dm(630, 'OBSERVED IN THIS INCIDENT', [[0, 'USB xHCI controller → Type-C port'], [1, '(nothing attached — no hub, no Billboard,', P.fail], [1, ' no Ethernet, no audio, no dock device)', P.fail], [0, 'Charging indicator: ON', P.pwr], [0, '→ break is before USB 2.0 enumeration', P.aux]], false);
  return svgWrap(1200, 940, s, 'Failure state: charging works, USB connection state stuck before any USB enumeration, dock absent from Device Manager');
}

/* ================= FIG 06 — warm vs hardware reset ================= */
function fig06() {
  let s = '';
  const col = (x, title, sub, steps, res, scope) => {
    let g = `<rect x="${x}" y="20" width="560" height="640" rx="10" fill="#0a1611" stroke="${P.line}"/>` + TH(x + 24, 60, title, 'txl') + T(x + 24, 82, sub, 'ts c-dim');
    let y = 104;
    steps.forEach(([t, role, note], i) => {
      if (t === 'BUT') { g += TH(x + 280, y + 22, 'BUT', 'mid', `style="font-size:20px;fill:${P.warn}"`); y += 36; return; }
      const c = ROLE[role] || role;
      g += `<rect x="${x + 40}" y="${y}" width="300" height="34" rx="6" fill="${role === 'fail' ? 'url(#hatchRed)' : P.bg}" stroke="${c}" stroke-width="2" ${role !== 'off' ? 'filter="url(#glow)"' : ''}/>` + TH(x + 56, y + 23, t, '', 'style="font-size:15px"');
      if (note) g += T(x + 352, y + 22, note, 'ts', `style="fill:${c}"`);
      if (i < steps.length - 1 && steps[i + 1][0] !== 'BUT') g += arrow(`M${x + 190},${y + 34} V${y + 46}`, role === 'off' ? 'ink' : role, 2);
      y += 48;
    });
    g += T(x + 40, y + 16, 'RESULT', 'ts tw c-dim');
    g += statusPill(x + 40, y + 26, 'pwr', res[0], 'POWER', 150) + statusPill(x + 200, y + 26, 'usb', res[1], 'USB', 150) + statusPill(x + 360, y + 26, 'dp', res[2], 'DISPLAY', 160);
    g += scope;
    return g;
  };
  // mini scopes: rail feeding PD/mux
  const scope = (x, drop) => {
    let g = `<rect x="${x + 40}" y="566" width="480" height="78" rx="4" fill="#050b08" stroke="#1d3428"/>`;
    for (let i = 1; i < 6; i++) g += `<path d="M${x + 40 + i * 80},566 V644" stroke="#11251a"/>`;
    const y3 = 584, y0 = 636;
    const d = drop ? `M${x + 44},${y3} H${x + 180} C${x + 210},${y3} ${x + 220},${y0} ${x + 270},${y0} H${x + 380} L${x + 400},${y3} H${x + 516}` : `M${x + 44},${y3} H${x + 516}`;
    g += `<path d="${d}" class="tr" stroke="${P.aux}" stroke-width="2.4" filter="url(#glow)"/>`;
    g += T(x + 50, 580, 'AUX rail feeding PD / mux logic', 'ts c-aux') + T(x + 514, 640, drop ? 'collapses → state lost' : 'never drops → state survives', 'end ts', `style="fill:${drop ? P.pwr : P.fail}"`);
    return g;
  };
  s += col(20, 'WINDOWS RESTART', 'warm reset · OS-controlled', [
    ['CPU → RESET', 'warn', 'core reset'], ['WINDOWS → RELOAD', 'main', 'drivers re-init'], ['BUT'],
    ['AUX POWER RAIL → STILL ON', 'aux', 'never switched'], ['USB-C CONTROLLER → POWERED', 'aux', 'keeps its RAM'], ['STUCK STATE → SURVIVES', 'fail', 'same bad state']
  ], [true, false, false], scope(20, false));
  s += col(620, 'HARDWARE POWER-STATE RESET', 'long power-button hold · EC-controlled', [
    ['EC / POWER SEQUENCER', 'aux', 'reads PWR_BTN#'], ['REGULATORS DISABLED', 'warn', 'EN pins low'], ['RELEVANT RAILS COLLAPSE', 'off', 'caps discharge'],
    ['CONTROLLER LOSES STATE', 'off', 'volatile cleared'], ['COLD INITIALISATION', 'main', 'firmware reloads'], ['USB-C NEGOTIATES AGAIN', 'pwr', 'CC → PD → Alt Mode']
  ], [true, true, true], scope(620, true));
  return svgWrap(1200, 680, s, 'Windows restart versus hardware power-state reset');
}

/* ================= FIG 07 — power rail map ================= */
function fig07() {
  let s = TH(40, 46, 'POWER TREE · WHO FEEDS WHOM', 'txl') + T(40, 68, 'Representative voltages and rail names · counts, names and sequencing differ per platform', 'ts c-dim');
  s += block(60, 96, 300, 86, { role: 'pwr', title: 'USB-C SOURCE (DOCK)', lines: ['PD fixed levels 5 / 9 / 15 / 20 V', 'HP G5 also lists 10 V, 12 V · ≤ 5 A'], glow: true });
  s += block(450, 96, 300, 86, { role: 'pwr', title: 'USB-C PD CONTROLLER', lines: ['negotiates the contract', 'switches the VBUS sink path'] });
  s += block(840, 96, 300, 86, { role: 'pwr', title: 'BATTERY PACK', lines: ['3S/4S Li-ion · ≈ 9–17 V', 'charged and discharged via charger'] });
  s += arrow('M360,139 H446', 'pwr', 4, 'filter="url(#glow)"');
  s += block(450, 228, 300, 76, { role: 'pwr', title: 'CHARGER / POWER PATH', lines: ['NVDC: VSYS ≈ battery voltage'] });
  s += arrow('M600,182 V224', 'pwr', 4, 'filter="url(#glow)"') + `<path d="M840,139 H800 V266 H754" class="tr" stroke="${P.pwr}" stroke-width="4" marker-start="url(#ar-pwr)" marker-end="url(#ar-pwr)" filter="url(#glow)"/>` + T(808, 210, 'charge ⇄', 'ts c-pwr') + T(808, 224, 'discharge', 'ts c-pwr');
  s += `<rect x="80" y="346" width="1040" height="18" rx="9" fill="${P.pwr}" opacity=".9" filter="url(#glow)"/>` + TH(600, 360, 'SYSTEM BUS · VSYS', 'mid', `style="font-size:14px;fill:${P.bg}"`);
  s += arrow('M600,304 V344', 'pwr', 5);
  const colm = (x, title, role, state, leaves) => {
    const c = ROLE[role];
    let g = arrow(`M${x + 160},364 V396`, role, 4) + `<rect x="${x}" y="398" width="320" height="56" rx="8" fill="${P.bg}" stroke="${c}" stroke-width="2.4" filter="url(#glow)"/>` + TH(x + 20, 434, title, '', `style="font-size:20px;fill:${c}"`) + tag(x + 320 - state.length * 6.4 - 24, 418, state, c);
    leaves.forEach(([n, v], i) => {
      const y = 486 + i * 52;
      g += `<path d="M${x + 24},454 V${y + 18} H${x + 48}" class="tr" stroke="${c}" stroke-width="2.4"/>` + `<rect x="${x + 48}" y="${y}" width="272" height="36" rx="6" fill="#0c1b14" stroke="${c}" stroke-opacity=".7"/>` + T(x + 62, y + 23, n, 'tw') + T(x + 306, y + 23, v, 'end ts c-dim');
    });
    return g;
  };
  s += colm(60, 'AUX · ALWAYS-ON', 'aux', 'S0–S5', [['3.3V_AUX', 'standby LDO/buck'], ['1.8V_AUX', 'logic I/O'], ['EC', 'on 3.3V_AUX'], ['USB-C / PD logic', 'often here']]);
  s += colm(440, 'MAIN · S0 RAILS', 'main', 'S0 only', [['5 V', 'USB / misc'], ['3.3 V', 'SSD, peripherals'], ['CPU VRM → VCORE', '≈ 0.6–1.4 V'], ['GPU rails', 'if dGPU fitted']]);
  s += colm(820, 'I/O · USB-C PATH', 'io', 'S0 · varies', [['USB-C port power', 'laptop as source'], ['MUX', 'SS / DP routing'], ['RETIMER', 'HS signal conditioning']]);
  s += `<rect x="60" y="702" width="1080" height="44" rx="6" fill="rgba(242,194,48,.07)" stroke="${P.aux}" stroke-opacity=".5"/>` + T(80, 729, 'Key point: a controller fed from the AUX column can keep running — and keep a bad state — while every MAIN rail is off.', 'ts', `style="fill:${P.aux}"`);
  return svgWrap(1200, 760, s, 'Motherboard power tree: source, charger, system bus, AUX, MAIN and I/O rails');
}

/* ================= FIG 08 — off ≠ 0 V ================= */
function fig08() {
  let s = TH(600, 50, 'THE LAPTOP LOOKS OFF —', 'mid txl') + TH(600, 82, 'BUT PARTS OF THE BOARD MAY STILL BE POWERED', 'mid txl', `style="fill:${P.aux}"`);
  // laptop
  s += `<rect x="370" y="110" width="460" height="270" rx="14" fill="#141a17" stroke="#3a4842" stroke-width="2"/><rect x="386" y="126" width="428" height="236" rx="4" fill="#020403"/>`;
  s += `<path d="M386,126 L520,126 L386,250Z" fill="#ffffff" opacity=".03"/>` + T(600, 252, 'SCREEN OFF', 'mid tm c-mute');
  s += `<path d="M330,384 H870 L920,420 H280Z" fill="#1a211d" stroke="#3a4842" stroke-width="2"/><rect x="560" y="404" width="80" height="8" rx="4" fill="#0c100e"/>`;
  // x-ray grid
  const cells = [
    ['CPU', 'OFF', 'off', '0 V'], ['GPU', 'OFF', 'off', '0 V'], ['MAIN RAILS', 'OFF', 'off', '5V · 3V3 → 0 V'],
    ['BATTERY', 'LIVE', 'pwr', 'VBAT ≈ 12 V'], ['CHARGER IC', 'LIVE', 'pwr', 'VSYS present'], ['EC', 'POSSIBLY LIVE', 'aux', '3.3V_AUX'],
    ['USB-C PD CONTROLLER', 'POSSIBLY LIVE', 'aux', 'AUX or VBUS'], ['WAKE LOGIC', 'LIVE', 'aux', 'lid · button · LAN'], ['RTC DOMAIN', 'LIVE', 'aux', 'clock + CMOS']
  ];
  s += `<path d="M320,420 L60,470 M880,420 L1140,470" stroke="#2c4a3a" stroke-dasharray="4 5"/>`;
  s += `<rect x="40" y="470" width="1120" height="300" rx="10" fill="#08130e" stroke="#2c4a3a"/>` + T(56, 492, 'X-RAY · SHUTDOWN STATE (S5) WITH BATTERY PRESENT', 'ts tw c-dim');
  cells.forEach(([n, st, role, v], i) => {
    const x = 60 + (i % 3) * 366, y = 504 + Math.floor(i / 3) * 86, c = ROLE[role];
    const maybe = st.startsWith('POSSIBLY');
    s += `<rect x="${x}" y="${y}" width="350" height="74" rx="8" fill="${role === 'off' ? '#0b100e' : '#0c1b14'}" stroke="${c}" stroke-width="2" ${maybe ? 'stroke-dasharray="7 5"' : ''} ${role !== 'off' ? 'filter="url(#glow)"' : ''}/>`;
    s += `<circle cx="${x + 26}" cy="${y + 37}" r="9" fill="${role === 'off' ? '#26302b' : c}" ${role !== 'off' ? 'filter="url(#glow)"' : ''} ${maybe ? 'class="pulse"' : ''}/>`;
    s += TH(x + 46, y + 32, n, '', `style="font-size:17px;fill:${role === 'off' ? '#7f8f86' : P.silk}"`) + T(x + 46, y + 54, v, 'ts c-dim');
    s += T(x + 336, y + 32, st, 'end ts tw', `style="fill:${role === 'off' ? '#7f8f86' : c}"`);
  });
  return svgWrap(1200, 790, s, 'Laptop looks off but parts of the board may still be powered');
}

/* ================= FIG 09 — power button path ================= */
function fig09() {
  let s = '';
  // WRONG
  s += `<rect x="20" y="20" width="480" height="560" rx="10" fill="#140b0b" stroke="#4a2020"/>` + TH(44, 62, 'MYTH', 'txl', `style="fill:${P.fail}"`) + T(44, 86, '“The button drains electricity”', 'tm c-dim');
  s += `<g transform="translate(150,130)" opacity=".85">` +
    `<path d="M100,0 V40" stroke="${P.ink}" stroke-width="3"/>` + `<path d="M60,40 H140 M78,54 H122 M60,68 H140 M78,82 H122" stroke="${P.ink}" stroke-width="4"/>` + T(160, 66, 'BATTERY', 'ts tw') +
    `<path d="M100,82 V150" stroke="${P.ink}" stroke-width="3"/><circle cx="100" cy="154" r="5" fill="${P.ink}"/><path d="M100,158 L140,200" stroke="${P.ink}" stroke-width="3"/><circle cx="100" cy="214" r="5" fill="${P.ink}"/>` + T(150, 186, 'POWER BUTTON', 'ts tw') +
    `<path d="M100,218 V290 M66,290 H134 M78,302 H122 M90,314 H110" stroke="${P.ink}" stroke-width="3"/>` + T(150, 300, 'GROUND', 'ts tw') + `</g>`;
  s += `<path d="M90,150 L430,500 M430,150 L90,500" stroke="${P.fail}" stroke-width="18" stroke-linecap="round" opacity=".9" filter="url(#glow)"/>`;
  s += T(260, 556, 'No such path exists on a modern laptop.', 'mid ts c-dim');
  // CORRECT
  s += `<rect x="520" y="20" width="660" height="560" rx="10" fill="#0a1611" stroke="${P.line}"/>` + TH(544, 62, 'REALITY', 'txl', `style="fill:${P.pwr}"`) + T(544, 86, 'The button is a logic input to the EC', 'tm c-dim');
  const chain = [['POWER BUTTON', 'ink'], ['PWR_BTN# · logic level', 'sig'], ['EMBEDDED CONTROLLER', 'aux'], ['POWER SEQUENCER', 'aux'], ['PMIC / REGULATORS', 'main'], ['POWER RAILS', 'main']];
  chain.forEach(([t, r], i) => {
    const y = 114 + i * 74, c = ROLE[r];
    s += `<rect x="560" y="${y}" width="290" height="46" rx="8" fill="${P.bg}" stroke="${c}" stroke-width="2" ${i === 1 ? 'stroke-dasharray="6 4"' : ''} filter="url(#glow)"/>` + TH(705, y + 30, t, 'mid', 'style="font-size:16px"');
    if (i < chain.length - 1) s += arrow(`M705,${y + 46} V${y + 72}`, i === 0 ? 'sig' : r, 2.4);
  });
  // inset schematic
  s += `<g transform="translate(880,110)"><rect width="280" height="300" rx="8" fill="#07110c" stroke="#1d3428"/>` + T(14, 22, 'WHAT THE BUTTON REALLY DOES', 'ts tw c-dim');
  s += `<path d="M60,44 V64" stroke="${P.aux}" stroke-width="2.4"/>` + T(72, 50, '3.3V_AUX', 'ts c-aux');
  s += `<path d="M60,64 l-8,5 16,8 -16,8 16,8 -16,8 16,8 -8,5 V140" fill="none" stroke="${P.ink}" stroke-width="2"/>` + T(80, 100, 'pull-up, e.g. 100 kΩ', 'ts');
  s += `<path d="M60,140 H170" stroke="${P.ink}" stroke-width="2" stroke-dasharray="5 4"/><circle cx="60" cy="140" r="3.5" fill="${P.ink}"/>` + T(180, 144, '→ EC pin', 'ts') + T(80, 132, 'PWR_BTN#', 'ts tw');
  s += `<path d="M60,140 V176" stroke="${P.ink}" stroke-width="2"/><circle cx="60" cy="180" r="4" fill="${P.ink}"/><path d="M60,184 L88,206" stroke="${P.ink}" stroke-width="2.4"/><circle cx="60" cy="214" r="4" fill="${P.ink}"/>` + T(96, 204, 'button', 'ts');
  s += `<path d="M60,218 V240 M40,240 H80 M48,248 H72 M56,256 H64" stroke="${P.ink}" stroke-width="2"/>`;
  s += T(14, 282, 'I = 3.3 V ÷ 100 kΩ ≈ 33 µA', 'ts tw c-pwr') + T(14, 296, 'example values · a signal, not a drain', 'ts c-dim') + `</g>`;
  // waveform
  s += `<g transform="translate(880,424)"><rect width="280" height="130" rx="8" fill="#07110c" stroke="#1d3428"/>` + T(14, 20, 'PWR_BTN# AS THE EC SEES IT', 'ts tw c-dim');
  s += `<path d="M14,50 H70 V98 H230 V50 H266" class="tr" stroke="${P.aux}" stroke-width="2.4" filter="url(#glow)"/>` + T(20, 44, '3.3 V', 'ts c-dim') + T(76, 114, 'held → EC counts time', 'ts') + `<path d="M74,86 H226" stroke="${P.ink2}" marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"/>` + `</g>`;
  s += T(850, 600, 'The power button is normally a logic input, not the electrical discharge path.', 'mid tm tw');
  return svgWrap(1200, 620, s, 'Power button myth versus reality');
}
