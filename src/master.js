/* master.js — the single combined poster (2400 × 2860) built from the figure renderers */

function nest(svgStr, x, y, w) {
  const m = svgStr.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const h = w * (+m[2] / +m[1]);
  return { s: svgStr.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" `).replace('class="fig-svg ', 'class="nested '), h };
}
function masterSVG(standalone = false) {
  const W = 2400;
  let s = `<rect width="${W}" height="2860" fill="${P.bg}"/><rect width="${W}" height="2860" fill="url(#pcbTex)" opacity=".35"/>`;
  // header
  s += `<rect x="0" y="0" width="${W}" height="230" fill="#07140d"/><path d="M0,230 H${W}" stroke="${P.maskLine}" stroke-width="2"/>`;
  s += T(60, 58, 'ENGINEERING TRAINING MODULE · USB-C / PLATFORM POWER · REV A', 'tm tw c-dim');
  s += TH(60, 128, 'USB-C DOCK FAILURE EXPLAINED', '', 'style="font-size:76px"');
  s += T(62, 172, 'HP USB-C Dock G5 → Windows business laptop · charging kept working · USB, Ethernet, displays gone — dock absent from Device Manager · restart did not help · ≈45 s hold fixed it', 'tm c-dim');
  s += T(62, 202, 'Representative architecture — exact implementation varies by model. The successful reset does not prove which controller failed.', 'tm', `style="fill:${P.aux}"`);
  s += `<g transform="translate(1690,52) scale(1.25)">` + statusPill(0, 0, 'pwr', true, 'CHARGING', 200) + statusPill(0, 42, 'usb', false, 'USB · LAN', 200) + statusPill(0, 84, 'dp', false, 'DISPLAYS', 200) + `</g>`;
  s += TH(2004, 128, '→', 'mid', 'style="font-size:54px"') + T(2004, 160, '45 s hold', 'mid tm tw c-aux');
  s += `<g transform="translate(2090,52) scale(1.25)">` + statusPill(0, 0, 'pwr', true, '', 230 / 1.25 - 10) + statusPill(0, 42, 'usb', true, '', 230 / 1.25 - 10) + statusPill(0, 84, 'dp', true, '', 230 / 1.25 - 10) + `</g>`;

  const frame = (x, y, w, h, n, title) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#08130e" stroke="${P.line}" stroke-width="2"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="52" rx="14" fill="#0c1d15"/><rect x="${x}" y="${y + 38}" width="${w}" height="14" fill="#0c1d15"/>` +
    T(x + 24, y + 34, n, 'tm tw c-aux') + TH(x + 80, y + 36, title, '', 'style="font-size:26px"');
  const col = [40, 1220], cw = 1140;
  let y = 260;
  // row 1
  let a = nest(boardSVG('failure', { flow: false }), col[0] + 10, y + 56, cw - 20), b = nest(fig02(), col[1] + 10, y + 56, cw - 20);
  let rh = Math.max(a.h, b.h) + 76;
  s += frame(col[0], y, cw, rh, '01', 'PCB MOTHERBOARD · WHERE THE STATE LIVES') + a.s + frame(col[1], y, cw, rh, '02', 'USB-C SIGNAL PATH · ONE CONNECTOR, THREE JOBS') + b.s;
  s += `<g transform="translate(${col[1] + 40},${y + 56 + b.h + 8})">` + TL(0, 0, 'Power finished early and stayed up. Not even USB 2.0 enumerated, so the stuck step sits\nbefore data AND display: the USB connection / data-role state the PD controller reports.', 26, 'tm', 'style="fill:#cfdcd2"') + `</g>`;
  y += rh + 30;
  // row 2
  a = nest(fig10(1.2, 1, true), col[0] + 10, y + 70, cw - 20); b = nest(fig06(), col[1] + 10, y + 56, cw - 20);
  rh = Math.max(a.h + 90, b.h + 70);
  s += frame(col[0], y, cw, rh, '03', 'VOLTAGE DECAY · WHEN STATE IS ACTUALLY LOST') + a.s + frame(col[1], y, cw, rh, '04', 'WARM VS HARDWARE RESET') + b.s;
  s += T(col[0] + 40, y + 56 + a.h + 50, 'V(t) = V₀·e^(−t/RC) · state survives until the rail crosses the retention threshold', 'tm c-dim');
  y += rh + 30;
  // row 3
  a = nest(fig14(true), col[0] + 10, y + 56, cw - 20); b = nest(fig04(), col[1] + 10, y + 56, cw - 20);
  rh = Math.max(a.h, b.h) + 110;
  s += frame(col[0], y, cw, rh, '05', 'RESET TIMELINE · IS 45 s SPECIAL?') + a.s + frame(col[1], y, cw, rh, '06', 'USB-C REINITIALISATION · CC → PD → ALT → USB → OS') + b.s;
  s += T(col[0] + 40, y + rh - 26, 'No verified procedure needs 45 s; all documented thresholds are ≤ 40 s. 45 s = margin, not magic.', 'tm tw c-pwr');
  s += T(col[1] + 40, y + rh - 26, 'After a clean reset, the chain re-runs from stage 1 and every function returns.', 'tm tw c-pwr');
  y += rh + 30;
  // row 4
  b = nest(fig16h(), 50, y + 66, W - 100);
  rh = b.h + 90;
  s += frame(40, y, W - 80, rh, '07', 'DIAGNOSTIC DECISION PATH · THIS INCIDENT') + b.s;
  y += rh + 24;
  s += T(60, y + 10, 'Sources: ACPI 6.5 §4.8.2.2.1.3 · HP Support “Perform a power reset” · HP USB-C Dock G5 datasheet + SoftPaq firmware notes · Dell KB 000139016, 000125880 · Lenovo HT510479 · Microsoft Support 4036280', 'ts c-mute');
  const H = y + 40;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${standalone ? `width="${W}" height="${H}"` : ''} class="fig-svg master static" role="img" aria-label="USB-C dock failure master infographic">`;
  if (standalone) out += `<style>@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap');${SVG_CSS}*{animation:none!important}</style><defs>${SVG_DEFS}</defs>`;
  return out + s.replace(`<rect width="${W}" height="2860"`, `<rect width="${W}" height="${H}"`).replace(`<rect width="${W}" height="2860"`, `<rect width="${W}" height="${H}"`) + `</svg>`;
}
