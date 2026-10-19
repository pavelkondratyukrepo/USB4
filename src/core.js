/* core.js — palette, shared SVG stylesheet, <defs>, and drawing primitives.
   Every figure is an SVG string built from these helpers so the same art can be
   rendered in the page, nested into the master infographic, and exported. */

const P = {
  bg: '#06100b', board: '#0a2216', boardHi: '#0e2c1c', maskLine: '#1c4a31',
  silk: '#e9f0e6', ink: '#d5e1d8', ink2: '#97ad9f', ink3: '#62796b',
  copper: '#c4813f', pad: '#d8b66c', pkg: '#111416', pkgTop: '#1a1e21',
  pwr: '#3ddc84', aux: '#f2c230', main: '#4ea2ff', io: '#b07cff',
  fail: '#ff4f4f', off: '#56645c', warn: '#ff9f1a', panel: '#0b1912', line: '#24402f', dp: '#46d7e6'
};
const ROLE = { dp: P.dp, pwr: P.pwr, aux: P.aux, main: P.main, io: P.io, fail: P.fail, off: P.off, warn: P.warn, ink: P.ink, sig: '#c9d6cc', dim: '#2f4a3b' };

const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";
const FONT_HEAD = "'Archivo', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";

const SVG_CSS = `
.t{font-family:${FONT_MONO};fill:${P.silk};font-size:12px;letter-spacing:.02em}
.th{font-family:${FONT_HEAD};font-weight:700;font-stretch:78%;letter-spacing:.03em;fill:${P.silk}}
.ts{font-size:10px}.tm{font-size:14px}.tl{font-size:17px}.txl{font-size:24px}.txxl{font-size:36px}.tw{font-weight:700}
.mid{text-anchor:middle}.end{text-anchor:end}
.c-dim{fill:${P.ink2}}.c-mute{fill:${P.ink3}}.c-pwr{fill:${P.pwr}}.c-aux{fill:${P.aux}}.c-main{fill:${P.main}}
.c-io{fill:${P.io}}.c-fail{fill:${P.fail}}.c-off{fill:#7f8f86}.c-warn{fill:${P.warn}}.c-ink{fill:${P.ink}}.c-bg{fill:${P.bg}}
.tr{fill:none;stroke-linecap:round;stroke-linejoin:round}
.pad{fill:${P.pad}}.pkg{fill:${P.pkg};stroke:#2b3236;stroke-width:1}.pkg-top{fill:${P.pkgTop}}
.pin1{fill:#3a4247}.ic-l{font-family:${FONT_MONO};font-size:11px;font-weight:700;fill:${P.silk}}
.ic-s{font-family:${FONT_MONO};font-size:8.5px;fill:${P.ink2}}
.silk{fill:none;stroke:${P.silk};stroke-opacity:.55;stroke-width:1}
.box{fill:#0c1b14;stroke:${P.line};stroke-width:1.2}
.box2{fill:#0f241a;stroke:#2c5541;stroke-width:1.2}
.hit{cursor:pointer}.hit:hover .pkg-top,.hit:focus .pkg-top{fill:#26313a}
.hit:focus{outline:none}.hit:focus-visible .ring{stroke:#fff;stroke-width:2.5;opacity:1}
.flow{stroke-dasharray:3 13;animation:flow 1.1s linear infinite}
.flow-slow{stroke-dasharray:3 13;animation:flow 2.4s linear infinite}
@keyframes flow{to{stroke-dashoffset:-16}}
.pulse{animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{50%{opacity:.25}}
.boot{animation:bootOn .9s ease-out both}
@keyframes bootOn{from{stroke:${P.off};opacity:.35}}
.fade-in{animation:fadeIn .5s ease-out both}
@keyframes fadeIn{from{opacity:0}}
@media (prefers-reduced-motion: reduce){.flow,.flow-slow,.pulse,.boot,.fade-in{animation:none}}
`;

/* Shared defs: filters, patterns, arrow markers, icons. Inserted once per page
   (hidden host svg) and copied into exported standalone SVGs. */
function arrowMarker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
}
const SVG_DEFS = `
<filter id="glow" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowBig" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".55"/></filter>
<pattern id="pcbTex" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${P.board}"/><path d="M0 12H24M12 0V24" stroke="${P.boardHi}" stroke-width=".6"/><circle cx="12" cy="12" r=".9" fill="#174a30"/></pattern>
<pattern id="hatchRed" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="rgba(255,79,79,.10)"/><line x1="0" y1="0" x2="0" y2="8" stroke="${P.fail}" stroke-width="2" stroke-opacity=".55"/></pattern>
<pattern id="hatchGray" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${P.off}" stroke-width="1.5" stroke-opacity=".6"/></pattern>
<pattern id="hatchYel" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${P.aux}" stroke-width="1.5" stroke-opacity=".5"/></pattern>
<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd6da"/><stop offset=".5" stop-color="#8b959b"/><stop offset="1" stop-color="#5d666b"/></linearGradient>
<linearGradient id="cell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3a33"/><stop offset="1" stop-color="#18211c"/></linearGradient>
<linearGradient id="die" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a6670"/><stop offset=".45" stop-color="#2f363c"/><stop offset="1" stop-color="#4a545c"/></linearGradient>
${Object.entries({ dp: P.dp, pwr: P.pwr, aux: P.aux, main: P.main, io: P.io, fail: P.fail, off: P.off, ink: P.ink, warn: P.warn, sig: '#c9d6cc' }).map(([k, c]) => arrowMarker('ar-' + k, c)).join('')}
<symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.5 2 4 14h6.5L9 22l11-13.5h-7z" fill="currentColor"/></symbol>
<symbol id="i-usb" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V4"/><path d="M9 6.5 12 2l3 4.5z" fill="currentColor"/><path d="M12 15 6.5 11.5V8.5"/><circle cx="6.5" cy="7" r="1.6" fill="currentColor"/><path d="M12 18l5.5-3.5V11"/><rect x="15.8" y="8" width="3.4" height="3.4" fill="currentColor"/><circle cx="12" cy="20.5" r="1.8" fill="currentColor"/></g></symbol>
<symbol id="i-mon" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M8.5 20.5h7M12 16.5v4" stroke-linecap="round"/></g></symbol>
<symbol id="i-net" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 7h16v11H4z"/><path d="M8 18v-4h8v4M9 7V4h6v3"/></g></symbol>
<symbol id="i-ok" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#06100b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m8 8 8 8M16 8l-8 8" stroke="#06100b" stroke-width="2.6" stroke-linecap="round"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 2.5 22.5 21h-21z" fill="currentColor"/><path d="M12 9v5.5" stroke="#06100b" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.4" fill="#06100b"/></symbol>
<symbol id="i-q" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M9.2 9.3a2.9 2.9 0 1 1 3.9 2.7c-.8.3-1.1.9-1.1 1.7v.5" fill="none" stroke="#06100b" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.3" fill="#06100b"/></symbol>
<symbol id="i-btn" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v8"/><path d="M7.2 6.2a7.5 7.5 0 1 0 9.6 0"/></g></symbol>
`;

/* ---------- primitives ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function T(x, y, s, cls = '', extra = '') { return `<text x="${x}" y="${y}" class="t ${cls}" ${extra}>${s}</text>`; }
function TH(x, y, s, cls = '', extra = '') { return `<text x="${x}" y="${y}" class="th ${cls}" ${extra}>${s}</text>`; }
/* multi-line text, lines separated by \n */
function TL(x, y, s, lh, cls = '', extra = '') {
  return `<text x="${x}" y="${y}" class="t ${cls}" ${extra}>` + String(s).split('\n').map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${l}</tspan>`).join('') + `</text>`;
}
function wire(d, role, w = 2, extra = '') { return `<path d="${d}" class="tr" stroke="${ROLE[role] || role}" stroke-width="${w}" ${extra}/>`; }
function roleKey(role) { return ROLE[role] ? role : (Object.keys(ROLE).find(k => ROLE[k] === role && ['dp','pwr','aux','main','io','fail','off','ink','warn','sig'].includes(k)) || 'ink'); }
function arrow(d, role, w = 2, extra = '') { return `<path d="${d}" class="tr" stroke="${ROLE[role] || role}" stroke-width="${w}" marker-end="url(#ar-${roleKey(role)})" ${extra}/>`; }
function icon(id, x, y, s, color, extra = '') { return `<use href="#${id}" x="${x}" y="${y}" width="${s}" height="${s}" style="color:${color}" ${extra}/>`; }
function svgWrap(w, h, inner, label, cls = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="fig-svg ${cls}" role="img" aria-label="${esc(label)}">${inner}</svg>`;
}
/* status pill: icon + label + check/cross */
function statusPill(x, y, kind, ok, label, w = 170) {
  const ico = { pwr: 'i-bolt', usb: 'i-usb', dp: 'i-mon', net: 'i-net' }[kind];
  const col = ok === true ? P.pwr : ok === 'warn' ? P.warn : ok === 'off' ? P.off : P.fail;
  const mark = ok === true ? 'i-ok' : ok === 'warn' ? 'i-warn' : ok === 'off' ? 'i-q' : 'i-x';
  return `<g transform="translate(${x},${y})"><rect width="${w}" height="34" rx="17" fill="${P.bg}" stroke="${col}" stroke-width="1.6"/>` +
    icon(ico, 10, 7, 20, P.ink) + T(38, 22, label, 'tm tw') + icon(mark, w - 30, 7, 20, col) + `</g>`;
}
function tag(x, y, s, color, fill = P.bg, cls = 'ts') {
  const w = s.length * 6.4 + 14;
  return `<g transform="translate(${x},${y})"><rect x="0" y="-12" width="${w}" height="17" rx="3" fill="${fill}" stroke="${color}" stroke-width="1"/>${T(7, 0.5, s, cls, `style="fill:${color}"`)}</g>`;
}

/* ---------- PCB part packages ---------- */
function qfn(x, y, w, h, o = {}) {
  let s = '';
  const n = o.pins || Math.max(3, Math.round(w / 10)), m = o.pinsV || Math.max(3, Math.round(h / 10));
  for (let i = 0; i < n; i++) { const px = x + (w / (n + 1)) * (i + 1) - 2; s += `<rect x="${px}" y="${y - 3}" width="4" height="5" class="pad"/><rect x="${px}" y="${y + h - 2}" width="4" height="5" class="pad"/>`; }
  for (let i = 0; i < m; i++) { const py = y + (h / (m + 1)) * (i + 1) - 2; s += `<rect x="${x - 3}" y="${py}" width="5" height="4" class="pad"/><rect x="${x + w - 2}" y="${py}" width="5" height="4" class="pad"/>`; }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="pkg"/><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="2" class="pkg-top"/><circle cx="${x + 7}" cy="${y + 7}" r="2.2" class="pin1"/>`;
  s += icText(x, y, w, h, o);
  return s;
}
function lqfp(x, y, w, h, o = {}) {
  let s = '';
  const n = o.pins || Math.round(w / 6);
  for (let i = 0; i < n; i++) {
    const px = x + 8 + ((w - 16) / (n - 1)) * i - 1.2, py = y + 8 + ((h - 16) / (n - 1)) * i - 1.2;
    s += `<rect x="${px}" y="${y - 9}" width="2.4" height="10" class="pad"/><rect x="${px}" y="${y + h - 1}" width="2.4" height="10" class="pad"/>`;
    s += `<rect x="${x - 9}" y="${py}" width="10" height="2.4" class="pad"/><rect x="${x + w - 1}" y="${py}" width="10" height="2.4" class="pad"/>`;
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="pkg"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="2" class="pkg-top"/><circle cx="${x + 10}" cy="${y + 10}" r="3" class="pin1"/>`;
  s += icText(x, y, w, h, o);
  return s;
}
function soic(x, y, w, h, o = {}) {
  let s = '';
  for (let i = 0; i < 4; i++) { const px = x + 6 + i * ((w - 12) / 3) - 1.5; s += `<rect x="${px}" y="${y - 6}" width="3" height="7" class="pad"/><rect x="${px}" y="${y + h - 1}" width="3" height="7" class="pad"/>`; }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="pkg"/><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="1" class="pkg-top"/><circle cx="${x + 5}" cy="${y + 5}" r="1.6" class="pin1"/>`;
  s += icText(x, y, w, h, o);
  return s;
}
function bga(x, y, w, h, o = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#24301f" stroke="#3d4c33" stroke-width="1"/>`;
  // substrate caps around the die
  for (let i = 0; i < Math.floor(w / 14); i++) s += `<rect x="${x + 6 + i * 14}" y="${y + 5}" width="7" height="4" fill="#b59a6a"/><rect x="${x + 6 + i * 14}" y="${y + h - 9}" width="7" height="4" fill="#b59a6a"/>`;
  (o.dies || [{ x: 10, y: 14, w: w - 20, h: h - 28 }]).forEach(d => {
    s += `<rect x="${x + d.x}" y="${y + d.y}" width="${d.w}" height="${d.h}" rx="2" fill="url(#die)" stroke="#6b7782" stroke-width=".8"/>`;
    if (d.label) s += T(x + d.x + d.w / 2, y + d.y + d.h / 2 + 4, d.label, 'mid ts tw', `style="fill:#e9f0e6"`);
  });
  if (o.label) s += T(x + w / 2, y + h + 16, o.label, 'mid tw');
  return s;
}
function icText(x, y, w, h, o) {
  let s = '';
  if (o.label) s += `<text x="${x + w / 2}" y="${y + h / 2 + (o.sub ? -1 : 4)}" class="ic-l mid">${o.label}</text>`;
  if (o.sub) s += `<text x="${x + w / 2}" y="${y + h / 2 + 11}" class="ic-s mid">${o.sub}</text>`;
  return s;
}
function inductor(x, y, s = 40, mark = 'R47') {
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="4" fill="#2a2f31" stroke="#454c50"/><rect x="${x + 4}" y="${y + 4}" width="${s - 8}" height="${s - 8}" rx="3" fill="#33393c"/>` +
    `<text x="${x + s / 2}" y="${y + s / 2 + 4}" class="t ts mid" style="fill:#aab3b6">${mark}</text>`;
}
function cap(x, y, v = false) {
  return v ? `<rect x="${x}" y="${y}" width="4" height="8" fill="#a8865a"/><rect x="${x}" y="${y}" width="4" height="2" fill="#d6d9da"/><rect x="${x}" y="${y + 6}" width="4" height="2" fill="#d6d9da"/>`
    : `<rect x="${x}" y="${y}" width="8" height="4" fill="#a8865a"/><rect x="${x}" y="${y}" width="2" height="4" fill="#d6d9da"/><rect x="${x + 6}" y="${y}" width="2" height="4" fill="#d6d9da"/>`;
}
function via(x, y) { return `<circle cx="${x}" cy="${y}" r="3.2" fill="${P.pad}"/><circle cx="${x}" cy="${y}" r="1.4" fill="${P.bg}"/>`; }
function hole(x, y) { return `<circle cx="${x}" cy="${y}" r="11" fill="${P.pad}" opacity=".85"/><circle cx="${x}" cy="${y}" r="6" fill="${P.bg}"/>`; }
/* PCB trace with optional glow + animated current overlay */
function trace(d, role, w = 4, o = {}) {
  const c = ROLE[role] || role;
  let s = `<path d="${d}" class="tr ${o.cls || ''}" stroke="${c}" stroke-width="${w}" ${role === 'off' ? 'stroke-opacity=".7"' : ''} ${o.glow !== false && role !== 'off' ? 'filter="url(#glow)"' : ''} ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} ${o.style ? `style="${o.style}"` : ''}/>`;
  if (o.flow && role !== 'off') s += `<path d="${d}" class="tr flow" stroke="#ffffff" stroke-opacity=".75" stroke-width="${Math.max(1.2, w * 0.35)}" ${o.style ? `style="${o.style}"` : ''}/>`;
  return s;
}
/* differential pair: two parallel polylines offset by gap */
function pair(points, role, gap = 5, w = 1.8, o = {}) {
  const off = (pts, k) => pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    return [x - dy * k, y + dx * k];
  });
  const toD = pts => 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
  return trace(toD(off(points, gap / 2)), role, w, o) + trace(toD(off(points, -gap / 2)), role, w, o);
}
