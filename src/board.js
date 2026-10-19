/* board.js — the master PCB-style motherboard (FIG 01) and its interactive
   twin (FIG 19). One renderer, five operating modes. */

const BOARD_PARTS = {
  port:   { box: [40, 296, 60, 100],  name: 'USB-C PORT' },
  pd:     { box: [136, 166, 80, 80],  name: 'USB-C PD CONTROLLER' },
  mux:    { box: [118, 436, 66, 66],  name: 'MUX' },
  rt:     { box: [196, 436, 72, 66],  name: 'RETIMER' },
  chg:    { box: [296, 466, 149, 78], name: 'CHARGER / POWER PATH' },
  auxreg: { box: [496, 326, 68, 68],  name: 'ALWAYS-ON (AUX) REGULATOR' },
  pmic:   { box: [516, 96, 153, 98],  name: 'PMIC / MAIN REGULATORS' },
  ec:     { box: [319, 239, 122, 122], name: 'EMBEDDED CONTROLLER (EC)' },
  spi:    { box: [351, 160, 70, 44],  name: 'SPI FLASH (BIOS / EC FIRMWARE)' },
  rtc:    { box: [589, 539, 52, 52],  name: 'RTC / CMOS CELL' },
  vrm:    { box: [696, 232, 200, 48], name: 'CPU VRM' },
  cpu:    { box: [756, 292, 228, 198], name: 'CPU / SoC' },
  usbctl: { box: [908, 332, 64, 114], name: 'USB CONTROLLER (xHCI)' },
  gpu:    { box: [1016, 292, 120, 186], name: 'GPU' },
  bat:    { box: [296, 686, 608, 108], name: 'BATTERY PACK' },
  btn:    { box: [126, 706, 64, 64],   name: 'POWER BUTTON' }
};

/* net -> role per mode; comp -> state per mode */
const BOARD_MODES = {
  normal: {
    label: 'NORMAL', note: 'Contract up, lanes routed, everything enumerated.',
    net: { pdrail: 'aux', vbus: 'pwr', vbat: 'pwr', vsys: 'pwr', aux: 'aux', main: 'main', ior: 'main', vcore: 'main', hs: 'io', cc: 'io', sig: 'sig', pbtn: 'sig' },
    comp: { pd: 'ok', mux: 'ok', rt: 'ok' }, ep: [true, true, true], flow: true
  },
  failure: {
    label: 'DOCK FAILURE', note: 'Hypothesis: power contract fine, but the USB connection / data-role state is wrong, so nothing enumerates, not even USB 2.0.',
    net: { pdrail: 'aux', vbus: 'pwr', vbat: 'pwr', vsys: 'pwr', aux: 'aux', main: 'main', ior: 'main', vcore: 'main', hs: 'fail', cc: 'io', sig: 'sig', pbtn: 'sig' },
    comp: { pd: 'fail', mux: 'fail', rt: 'fail' }, ep: [true, false, false], flow: true
  },
  restart: {
    label: 'WINDOWS RESTART', note: 'CPU + OS reset. The always-on domain (and, per the hypothesis, its stuck state) never loses power.',
    net: { pdrail: 'aux', vbus: 'pwr', vbat: 'pwr', vsys: 'pwr', aux: 'aux', main: 'main', ior: 'main', vcore: 'warn', hs: 'fail', cc: 'io', sig: 'sig', pbtn: 'sig' },
    comp: { pd: 'fail', mux: 'fail', rt: 'fail', cpu: 'warn', usbctl: 'warn' }, ep: [true, false, false], flow: true
  },
  hardreset: {
    label: 'HARD RESET', note: 'Forced off: main + I/O rails collapse, PD/mux state cleared (platform-dependent).',
    net: { pdrail: 'off', vbus: 'pwr', vbat: 'pwr', vsys: 'pwr', aux: 'aux', main: 'off', ior: 'off', vcore: 'off', hs: 'off', cc: 'off', sig: 'sig', pbtn: 'warn' },
    comp: { pd: 'off', mux: 'off', rt: 'off', cpu: 'off', usbctl: 'off', gpu: 'off', vrm: 'off', pmic: 'off', ec: 'live', auxreg: 'live', btn: 'warn' }, ep: [true, 'off', 'off'], flow: false
  },
  coldboot: {
    label: 'COLD BOOT', note: 'Rails ramp in order. CC → PD → Alt Mode → USB → Windows, from a clean state.',
    net: { pdrail: 'aux', vbus: 'pwr', vbat: 'pwr', vsys: 'pwr', aux: 'aux', main: 'main', ior: 'main', vcore: 'main', hs: 'io', cc: 'io', sig: 'sig', pbtn: 'sig' },
    comp: { pd: 'ok', mux: 'ok', rt: 'ok' }, ep: [true, true, true], flow: true, boot: true
  }
};

const STATE_COLOR = { ok: P.pwr, fail: P.fail, warn: P.warn, off: P.off, live: P.aux };

function boardSVG(mode = 'failure', opt = {}) {
  const M = BOARD_MODES[mode];
  const r = k => M.net[k];
  const boot = M.boot ? { pdrail: 1.3, aux: 0, vsys: 0, vbat: 0, vbus: 0, main: .5, vcore: .9, ior: 1.2, cc: 1.5, hs: 2.0, sig: 0, pbtn: 0 } : null;
  const tr = (d, net, w, extra = {}) => trace(d, r(net), w, Object.assign({ flow: M.flow && opt.flow !== false && ['vbus', 'vbat', 'vsys', 'aux', 'hs'].includes(net), cls: boot ? 'boot' : '', style: boot ? `animation-delay:${boot[net]}s` : '' }, extra));
  const pr = (pts, net, gap, w) => pair(pts, r(net), gap, w, { flow: M.flow && opt.flow !== false && net === 'hs', cls: boot ? 'boot' : '', style: boot ? `animation-delay:${boot[net]}s` : '' });
  const sig = (d, net = 'sig') => `<path d="${d}" class="tr${boot ? ' boot' : ''}${net === 'pbtn' && mode === 'hardreset' ? ' pulse' : ''}" stroke="${ROLE[r(net)]}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
  const st = id => (M.comp[id] || 'on');
  const dimmed = id => st(id) === 'off' ? 'opacity="0.42"' : '';
  const hitOpen = id => opt.interactive ? `<g class="hit" data-id="${id}" tabindex="0" role="button" aria-label="${BOARD_PARTS[id].name}">` : `<g data-id="${id}">`;
  const ring = id => {
    const s = st(id); const [x, y, w, h] = BOARD_PARTS[id].box;
    if (s === 'on') return opt.interactive ? `<rect class="ring" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="transparent" stroke="#ffffff" stroke-opacity="0" stroke-width="1"/>` : '';
    const c = STATE_COLOR[s];
    return (s === 'fail' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#hatchRed)"/>` : '') +
      `<rect class="ring ${s === 'warn' || (s === 'fail' && mode !== 'restart') ? 'pulse' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${opt.interactive ? 'transparent' : 'none'}" stroke="${c}" stroke-width="2.2" ${s === 'off' ? 'stroke-dasharray="5 4"' : ''} ${s === 'fail' || s === 'ok' ? 'filter="url(#glow)"' : ''}/>`;
  };
  const part = (id, body) => hitOpen(id) + `<g ${dimmed(id)}>${body}</g>` + ring(id) + `</g>`;

  let s = '';
  /* legend + title strip */
  if (opt.legend !== false) {
    const L = [['pwr', 'POWER SOURCE / WORKING'], ['aux', 'ALWAYS-ON (AUX)'], ['main', 'MAIN (S0) RAILS'], ['io', 'USB-C HIGH-SPEED I/O'], ['fail', 'SUSPECTED STUCK'], ['off', 'POWERED DOWN']];
    L.forEach(([k, l], i) => { const x = 70 + i * 180; s += `<rect x="${x}" y="22" width="22" height="6" rx="3" fill="${ROLE[k]}" ${k !== 'off' ? 'filter="url(#glow)"' : ''}/>` + T(x + 30, 30, l, 'ts c-dim'); });
    s += T(1150, 52, `MODE · ${M.label}`, 'end tw', `style="fill:${mode === 'normal' || mode === 'coldboot' ? P.pwr : mode === 'hardreset' ? P.aux : P.fail}"`);
  }
  /* thermal module in the board cut-out */
  s += `<g opacity=".55"><rect x="880" y="78" width="256" height="146" rx="14" fill="#0d1512" stroke="#2c3b34"/><circle cx="1010" cy="151" r="62" fill="#0a0f0d" stroke="#3a4a42"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M1010,151 q${(30 * Math.cos(i * 0.698)).toFixed(1)},${(30 * Math.sin(i * 0.698)).toFixed(1)} ${(52 * Math.cos(i * 0.698 + .5)).toFixed(1)},${(52 * Math.sin(i * 0.698 + .5)).toFixed(1)}" stroke="#4a5a52" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="1010" cy="151" r="16" fill="#26302b"/>` + T(1010, 216, 'FAN / THERMAL MODULE', 'mid ts c-mute') + `</g>`;
  /* board outline */
  s += `<path d="M70,90 L90,70 H860 V230 H1130 L1150,250 V620 L1130,640 H90 L70,620 Z" fill="url(#pcbTex)" stroke="${P.maskLine}" stroke-width="2"/>`;
  s += `<path d="M78,94 L94,78 H852 V238 H1126 L1142,254 V616 L1126,632 H94 L78,616 Z" fill="none" stroke="#16402a" stroke-width="1" stroke-dasharray="2 5"/>`;
  [[110, 112], [820, 112], [1110, 282], [1110, 602], [110, 602], [700, 612]].forEach(([x, y]) => s += hole(x, y));
  /* decorative copper pours + passives */
  s += `<path d="M300,560 H445 V596 H300Z" fill="#c4813f" opacity=".07"/><path d="M700,520 H1000 V580 H700Z" fill="#c4813f" opacity=".06"/>`;
  const caps = [[230, 180], [230, 196], [282, 520], [452, 470], [452, 530], [612, 205], [640, 205], [748, 300], [748, 320], [748, 470], [990, 300], [990, 320], [990, 440], [470, 400], [470, 416], [590, 330], [590, 346], [600, 120], [300, 210], [112, 520], [190, 520], [800, 545], [830, 545], [860, 545], [890, 545], [1050, 520], [1070, 520]];
  caps.forEach(([x, y], i) => s += cap(x, y, i % 3 === 0));
  [[250, 300], [470, 300], [700, 420], [990, 560], [600, 470], [140, 300], [1040, 600], [880, 600], [520, 560], [270, 120]].forEach(([x, y]) => s += via(x, y));
  /* M.2 + silkscreen */
  s += `<rect x="790" y="598" width="190" height="24" rx="2" fill="#151a17" stroke="#3b4a42"/>` + T(885, 614, 'M.2 SSD', 'mid ts c-mute');
  s += T(96, 86, 'MB-REV A · 10L HDI', 'ts c-mute') + T(846, 86, 'U-SoC', 'end ts c-mute');

  /* ---------- traces (drawn below parts) ---------- */
  // battery cable + VBAT
  s += tr('M340,690 V626', 'vbat', 7) + tr('M340,604 V542', 'vbat', 6);
  // VBUS from connector to charger input
  s += tr('M70,392 V585 L82,597 H262 V520 L277,505 H300', 'vbus', 6);
  // charger -> inductor -> VSYS
  s += tr('M380,505 H395', 'vsys', 6) + tr('M441,501 H1000 V454 H1030', 'vsys', 7) + tr('M530,501 V392', 'vsys', 4) + tr('M690,501 V256 H700', 'vsys', 5) + tr('M690,256 V210 H565 V192', 'vsys', 5);
  // AUX
  s += tr('M500,345 H432', 'aux', 3) + tr('M515,330 V222 H386', 'aux', 3) + tr('M386,222 H214', 'pdrail', 3) + tr('M386,222 V200', 'aux', 2.5);
  // main S0 rails
  s += tr('M665,120 H682 V340 H758', 'main', 4) + tr('M682,340 V585 H1126 V352 H1134', 'main', 3) + tr('M744,256 H760', 'vcore', 4);
  s += tr('M780,276 V296', 'vcore', 5) + tr('M826,276 V296', 'vcore', 5) + tr('M872,276 V296', 'vcore', 5);
  s += tr('M540,110 V92 H232 V440', 'ior', 3) + tr('M232,420 H151 V440', 'ior', 2.5);
  // high-speed lanes + CC
  s += pr([[758, 452], [266, 452]], 'hs', 5, 1.8) + pr([[758, 467], [266, 467]], 'hs', 5, 1.8) + pr([[200, 466], [180, 466]], 'hs', 5, 1.8);
  s += pr([[122, 466], [104, 466], [104, 362], [96, 362]], 'hs', 5, 1.8);
  s += tr('M88,300 V214 H138', 'cc', 2.2);
  // logic signals
  s += sig('M165,242 V438') + sig('M330,300 H222 V244') + sig('M430,270 H470 V150 H518') + sig('M350,350 V468') + sig('M500,605 V572 H390 V352', 'pbtn');
  s += sig('M175,734 H262 V662 H515 V627', 'pbtn');
  s += `<rect x="478" y="605" width="74" height="20" rx="2" fill="#e6e1d3"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${484 + i * 9.5}" y="609" width="5" height="12" fill="#2b2b2b"/>`).join('');

  /* ---------- parts ---------- */
  // USB-C receptacle
  s += part('port', `<rect x="44" y="300" width="52" height="92" rx="12" fill="url(#metal)" stroke="#9aa4aa"/><rect x="51" y="311" width="18" height="70" rx="8" fill="#0a0d0e"/><rect x="57" y="321" width="6" height="50" rx="2" fill="#2d3a40"/>` +
    Array.from({ length: 6 }, (_, i) => `<rect x="57.5" y="${324 + i * 8}" width="5" height="3" fill="${P.pad}"/>`).join('') + T(70, 414, 'J1 USB-C', 'mid ts tw'));
  s += part('pd', qfn(140, 170, 72, 72, { label: 'PD CTRL', sub: 'CC·PD·ALT' }));
  s += part('mux', qfn(122, 440, 58, 58, { label: 'MUX', sub: 'SS / DP' }));
  s += part('rt', qfn(200, 440, 64, 58, { label: 'RETIMER', sub: 'HS lanes' }));
  s += part('chg', qfn(300, 470, 80, 70, { label: 'CHARGER', sub: 'NVDC·SMBus' }) + inductor(395, 478, 46, '2R2') + `<rect x="305" y="552" width="30" height="20" fill="#1b1f22" stroke="#3a4247"/><rect x="345" y="552" width="30" height="20" fill="#1b1f22" stroke="#3a4247"/>` + T(340, 586, 'Q1  Q2', 'mid ts c-mute'));
  s += `<g ${dimmed('chg')}><rect x="300" y="604" width="80" height="22" rx="2" fill="#e6e1d3"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${306 + i * 9}" y="608" width="5" height="14" fill="#2b2b2b"/>`).join('') + T(390, 620, 'BATT', 'ts c-dim') + `</g>`;
  s += part('auxreg', qfn(500, 330, 60, 60, { label: 'AUX REG', sub: '3V3A·1V8A' }));
  s += part('pmic', qfn(520, 110, 90, 80, { label: 'PMIC', sub: '5V·3V3·1V8' }) + inductor(625, 100, 40, '1R0') + inductor(625, 150, 40, '1R5'));
  s += part('ec', lqfp(330, 250, 100, 100, { label: 'EC', sub: 'KBC · PWR SEQ' }));
  s += part('spi', soic(355, 168, 62, 30, { label: 'SPI ROM' }));
  s += part('rtc', `<circle cx="615" cy="565" r="24" fill="url(#metal)" stroke="#aab4b9"/><circle cx="615" cy="565" r="17" fill="none" stroke="#6f797e"/>` + T(615, 569, 'RTC', 'mid ts tw', 'style="fill:#1a1f22"'));
  s += part('vrm', qfn(700, 238, 44, 36, { label: 'VR', pins: 3, pinsV: 3 }) + inductor(760, 236, 40, 'R22') + inductor(806, 236, 40, 'R22') + inductor(852, 236, 40, 'R22') + T(830, 228, 'CPU VRM · 3φ', 'mid ts c-dim'));
  s += part('cpu', bga(760, 296, 220, 190, { dies: [{ x: 14, y: 18, w: 132, h: 150, label: 'CPU · iGPU' }] }) + T(830, 478, 'U1 SoC', 'mid ts c-dim'));
  s += part('usbctl', `<rect x="912" y="336" width="56" height="106" rx="2" fill="url(#die)" stroke="#6b7782" stroke-width=".8"/>` + T(940, 384, 'PCH', 'mid ts tw') + T(940, 398, 'xHCI', 'mid ts c-dim') + T(940, 412, 'USB', 'mid ts c-dim'));
  s += part('gpu', bga(1020, 296, 112, 112, { dies: [{ x: 16, y: 16, w: 80, h: 80, label: 'dGPU' }] }) + inductor(1030, 436, 36, 'R33') + inductor(1076, 436, 36, 'R33') + T(1076, 490, 'GPU VR · optional', 'mid ts c-mute'));
  // heat pipe overlay
  s += `<path d="M790,326 H960 L1004,214" stroke="#c4813f" stroke-opacity=".22" stroke-width="22" fill="none" stroke-linecap="round" ${dimmed('cpu')}/>`;
  // battery pack + power button (off-board)
  s += part('bat', `<rect x="300" y="690" width="600" height="100" rx="10" fill="#141c18" stroke="#34463c"/>` + [0, 1, 2].map(i => `<rect x="${312 + i * 196}" y="700" width="184" height="80" rx="8" fill="url(#cell)" stroke="#3f5246"/>`).join('') +
    T(600, 736, 'BATTERY PACK · 3S/4S Li-ion', 'mid tw tm') + T(600, 756, 'VBAT ≈ 9–17 V (representative) · gas gauge + protection', 'mid ts c-dim'));
  s += part('btn', `<circle cx="158" cy="738" r="26" fill="#121615" stroke="#5b6a62" stroke-width="2"/>` + icon('i-btn', 144, 724, 28, mode === 'hardreset' ? P.warn : P.ink) + T(158, 786, 'POWER BUTTON', 'mid ts tw'));

  /* ---------- net labels ---------- */
  s += tag(86, 625, 'VBUS 5–20 V', ROLE[r('vbus')]) + tag(350, 662, 'VBAT', ROLE[r('vbat')]) + tag(560, 524, 'VSYS · SYSTEM POWER BUS', ROLE[r('vsys')]);
  s += tag(522, 282, '3V3_AUX · 1V8_AUX', ROLE[r('aux')]) + tag(600, 424, 'S0 RAILS', ROLE[r('main')]) + tag(902, 268, 'VCORE', ROLE[r('vcore')]);
  s += tag(238, 404, 'I/O RAIL', ROLE[r('ior')]) + tag(560, 440, 'SS USB · DP LANES', ROLE[r('hs')]) + tag(92, 282, 'CC1/CC2', ROLE[r('cc')]);
  s += tag(396, 592, 'PWR_BTN#', ROLE[r('pbtn')]) + tag(440, 142, 'EN / PG', ROLE.sig) + tag(232, 316, 'I²C', ROLE.sig);

  /* ---------- endpoint status ---------- */
  s += T(930, 662, 'AT THE DOCK', 'ts c-dim tw');
  s += statusPill(930, 672, 'pwr', M.ep[0], 'CHARGING', 210) + statusPill(930, 714, 'usb', M.ep[1], 'USB · ETHERNET', 210) + statusPill(930, 756, 'dp', M.ep[2], 'DISPLAYS', 210);
  if (opt.disclaimer !== false) s += T(70, 822, 'Representative modern business-laptop architecture — exact implementation varies by model.' + (mode === 'failure' || mode === 'restart' ? ' Red = suspected area (hypothesis).' : ''), 'ts c-dim');
  return svgWrap(1200, 832, s, 'PCB-style laptop motherboard, mode ' + M.label, 'board');
}

/* ---------- FIG 19 component dossier ---------- */
const PART_INFO = {
  port: { does: 'Passive 24-pin receptacle. Carries VBUS, CC1/CC2, USB 2.0 D+/D−, four SuperSpeed pairs and SBU1/2 at once.', domain: ['none — passive'], shut: ['n/a'], stuck: 'Cannot hold logic state. Debris, wear or a half-seated plug can break individual pins while power still flows.', reset: ['NO effect', 'off'] },
  pd: { does: 'USB-C port controller. Detects attach on CC, negotiates the PD power contract, runs Alt Mode discovery (Discover Identity → SVIDs → Modes → Enter Mode) and tells the mux what to route.', domain: ['3V3_AUX', 'or VBUS (dead-battery)'], shut: ['OFTEN YES', 'aux'], stuck: 'The power contract can stay valid while the connection / data-role state is wrong. If the host is never told “USB connected”, even USB 2.0 stays off — charging works, nothing enumerates, the dock is absent from Device Manager. Consistent with the incident (hypothesis, not confirmed).', reset: ['POSSIBLY', 'warn'], resetNote: 'If its supply collapses, or the EC/sequencer re-initialises it during cold boot. Not guaranteed while a dock keeps VBUS present.' },
  mux: { does: 'Routes the four SuperSpeed lane pairs to USB 3 or DisplayPort according to plug orientation and the DP pin assignment (C = 4 DP lanes, D = 2 DP + USB 3).', domain: ['I/O rail', 'S0 / platform-specific'], shut: ['USUALLY NO', 'off'], stuck: 'Lanes routed wrong or not at all: SuperSpeed USB and DP vanish — but USB 2.0 bypasses the mux, so the dock would still appear in Device Manager. Weak fit alone.', reset: ['LIKELY', 'pwr'], resetNote: 'Loses its register configuration when its rail drops; rewritten by the PD controller after boot.' },
  rt: { does: 'Retimer / redriver. Recovers and re-transmits multi-gigabit lanes so they survive board + cable loss. Present on many USB4/TBT designs; plain USB-C designs may use a redriver or nothing.', domain: ['I/O rail', 'S0'], shut: ['USUALLY NO', 'off'], stuck: 'Lane training fails: links never come up even though the connector is fine.', reset: ['LIKELY', 'pwr'] },
  chg: { does: 'Narrow-VDC charger + power path. Picks VBUS or battery, builds the system bus (VSYS), charges the pack. Controlled by the EC over SMBus.', domain: ['VBUS in', 'VSYS out ≈ VBAT'], shut: ['YES', 'pwr'], stuck: 'Charging would misbehave. In this incident charging worked — evidence the charger path was healthy.', reset: ['NOT TYPICALLY', 'off'] },
  auxreg: { does: 'Always-on regulators for the S5 / standby domain: 3V3_AUX, 1V8_AUX (names vary: _A, _DSW, _ALW).', domain: ['3V3_AUX', '1V8_AUX'], shut: ['YES', 'aux'], stuck: 'A regulator does not hold logic state, but it keeps everything downstream alive — including any stuck controller state.', reset: ['MAYBE', 'warn'], resetNote: 'Stays up while battery or adapter can feed it. Only battery disconnect / full drain guarantees collapse.' },
  pmic: { does: 'Main regulators for S0/S3 rails (5 V, 3.3 V, 1.8 V, memory, VCCIO). Turned on in order by the EC / sequencer through EN and power-good (PG) lines.', domain: ['VSYS in', '5V · 3V3 · 1V8 out'], shut: ['NO (S5)', 'off'], stuck: 'A sequencing fault means no boot at all — not the incident pattern.', reset: ['YES', 'pwr'], resetNote: 'Disabled at forced-off: its rails collapse.' },
  ec: { does: 'Embedded controller: a small always-on microcontroller. Watches the power button, runs power sequencing, battery / charger, keyboard, thermals; often talks to the PD controller over I²C and relays its connection status to the SoC and to Windows (UCSI).', domain: ['3V3_AUX'], shut: ['YES', 'aux'], stuck: 'Battery, keyboard, power-button or EC↔PD coordination glitches. It does not carry USB data.', reset: ['NO (usually)', 'off'], resetNote: 'It is the chip counting your button hold. Resetting the EC itself needs an OEM procedure, battery disconnect or pinhole.' },
  spi: { does: 'Non-volatile flash holding BIOS/UEFI and often EC firmware. Read at boot.', domain: ['3V3_AUX / 1V8'], shut: ['DATA PERSISTS', 'pwr'], stuck: 'Flash does not get “stuck”; corrupted firmware is a different failure class.', reset: ['NO — non-volatile', 'off'] },
  rtc: { does: 'Coin cell or RTC domain keeping the clock and CMOS/NVRAM settings (many modern designs fold this into the main battery).', domain: ['VCCRTC ≈ 3 V'], shut: ['YES', 'aux'], stuck: 'Wrong date/time or BIOS settings — unrelated to dock lanes.', reset: ['NO', 'off'], resetNote: 'A 45 s hold does not clear CMOS. Dell’s documented RTC reset is a 25–40 s window with AC connected.' },
  vrm: { does: 'Multi-phase buck converter making VCORE for the CPU from VSYS.', domain: ['VSYS in', 'VCORE ≈ 0.6–1.4 V'], shut: ['NO', 'off'], stuck: 'Crash / no boot, not a dock symptom.', reset: ['YES', 'pwr'] },
  cpu: { does: 'SoC: cores, integrated GPU (the DisplayPort source for Alt Mode), memory controller. On many current platforms the Type-C subsystem (mux, PD logic) is partly integrated.', domain: ['VCORE', 'S0 rails'], shut: ['NO', 'off'], stuck: 'OS hang or driver fault. A Windows restart resets it, so it is a weak sole explanation here.', reset: ['YES', 'pwr'] },
  usbctl: { does: 'xHCI USB host controller inside the PCH / SoC. Enumerates the dock’s hub, Ethernet and USB devices.', domain: ['S0 rails'], shut: ['NO', 'off'], stuck: 'USB stops enumerating. But a Windows restart re-initialises xHCI, and it does not carry DisplayPort — inconsistent as the sole cause.', reset: ['YES', 'pwr'] },
  gpu: { does: 'Optional discrete GPU. On most business laptops the USB-C DisplayPort comes from the iGPU; routing varies by design.', domain: ['GPU VR', 'S0'], shut: ['NO', 'off'], stuck: 'Would affect display only, not USB.', reset: ['YES', 'pwr'] },
  bat: { does: 'Li-ion pack with fuel gauge and protection. Feeds the charger / VSYS and, through it, the always-on domain.', domain: ['VBAT ≈ 9–17 V'], shut: ['ALWAYS', 'pwr'], stuck: 'Gauge or protection faults affect charging, not dock lanes.', reset: ['NO', 'off'], resetNote: 'Holding the button does not drain the battery. Only battery disconnect / ship mode removes it.' },
  btn: { does: 'A momentary switch that pulls the PWR_BTN# logic line low. The EC times how long it is held.', domain: ['logic: 3V3_AUX pull-up'], shut: ['n/a'], stuck: 'n/a', reset: ['TRIGGER ONLY', 'warn'], resetNote: 'It is a request, not a discharge path. The EC / sequencer decides what to switch off.' }
};
