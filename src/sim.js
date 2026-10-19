/* sim.js — FIG 20: conceptual power-rail simulator (logic-analyzer view).
   Not a model of any specific laptop: rail sequencing is platform-specific. */

const SIM_RAILS = [
  { id: 'vbus', name: 'VBUS (from dock)', nom: 20, role: 'pwr', tauOff: 0.25 },
  { id: 'vbat', name: 'BATTERY VOLTAGE', nom: 12.3, role: 'pwr', tauOff: 50 },
  { id: 'vsys', name: 'SYSTEM BUS · VSYS', nom: 12.6, role: 'pwr', tauOff: 0.5 },
  { id: 'a33', name: '3.3V AUX', nom: 3.3, role: 'aux', tauOff: 1 },
  { id: 'a18', name: '1.8V AUX', nom: 1.8, role: 'aux', tauOff: 1 },
  { id: 'm33', name: 'MAIN 3.3V', nom: 3.3, role: 'main', tauOff: 0.35 },
  { id: 'm5', name: '5V', nom: 5, role: 'main', tauOff: 0.35 },
  { id: 'core', name: 'CPU CORE', nom: 1.0, role: 'main', tauOff: 0.05 },
  { id: 'pd', name: 'USB-C CONTROLLER RAIL', nom: 3.3, role: 'aux', tauOff: 2 },
  { id: 'mux', name: 'MUX / RETIMER RAIL', nom: 1.8, role: 'io', tauOff: 0.3 }
];
const SIM_WINDOW = 60;   // seconds of sim time visible
const SIM_RET = 1.2;     // illustrative retention threshold for the controller rail (V)

class RailSim {
  constructor(root) {
    this.root = root;
    this.svg = root.querySelector('.sim-svg');
    this.log = root.querySelector('.sim-log');
    this.status = root.querySelector('.sim-status');
    this.speed = 6;
    this.build();
    this.reset();
    this.last = performance.now();
    const loop = now => { this.tick(Math.min(0.1, (now - this.last) / 1000)); this.last = now; this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  reset() {
    this.t = 0; this.events = []; this.marks = [];
    this.ac = this.root.querySelector('#sim-ac').checked;
    this.sys = 'S0'; this.ctrl = 'stuck'; this.holding = null; this.busy = false;
    this.on = { vbus: this.ac, vbat: true, vsys: true, a33: true, a18: true, m33: true, m5: true, core: true, pd: true, mux: true };
    this.v = {}; SIM_RAILS.forEach(r => this.v[r.id] = this.on[r.id] ? r.nom : 0);
    this.hist = SIM_RAILS.map(() => []);
    this.log.innerHTML = '';
    this.note('Incident state: running (S0), dock attached, controller state STUCK.', 'fail');
    this.render();
  }
  get tauPd() { return parseFloat(this.root.querySelector('#sim-tau').value); }
  get deep() { return parseFloat(this.root.querySelector('#sim-deep').value); }
  note(msg, cls = '') {
    const li = document.createElement('li');
    li.innerHTML = `<span class="sim-t">t=${this.t.toFixed(1)} s</span> <span class="${cls}">${msg}</span>`;
    this.log.prepend(li);
    while (this.log.children.length > 14) this.log.lastChild.remove();
  }
  at(dt, fn) { this.events.push({ t: this.t + dt, fn }); }
  mark(label, color) { this.marks.push({ t: this.t, label, color }); }
  railsOff(ids) { ids.forEach(i => this.on[i] = false); }
  railsOn(ids) { ids.forEach(i => this.on[i] = true); }

  /* ---------- actions ---------- */
  act(a) {
    if (this.holding && a.startsWith('hold')) return;
    const n = { 'restart': () => this.restart(), 'shutdown': () => this.shutdown(), 'ac': () => this.toggleAc(), 'on': () => this.powerOn(), 'cold': () => this.coldBoot() }[a];
    if (n) return n();
    if (a.startsWith('hold')) this.hold(parseFloat(a.slice(4)));
  }
  restart() {
    if (this.sys !== 'S0') return this.note('Restart needs a running system. Press SYSTEM ON first.', 'warn');
    this.mark('RESTART', P.main); this.note('Windows restart: OS shuts down, CPU gets a warm reset.');
    this.at(0.8, () => { this.on.core = false; this.note('CPU core reset (warm). Main + AUX rails stay up.'); });
    this.at(1.3, () => { this.on.core = true; });
    this.at(3.5, () => this.note(this.ctrl === 'stuck' ? 'Windows reloaded. Controller rail never dropped → state still STUCK.' : 'Windows reloaded.', this.ctrl === 'stuck' ? 'fail' : 'ok'));
  }
  shutdown() {
    if (this.sys !== 'S0') return this.note('Already off.', 'warn');
    this.mark('SHUTDOWN', P.main); this.note('Windows shutdown → S5.');
    this.at(0.6, () => { this.railsOff(['core']); });
    this.at(0.9, () => { this.railsOff(['m5', 'm33', 'mux']); this.sys = 'S5'; this.note('Main + I/O rails off. AUX stays on.' + (this.ac ? ' The PD controller stays powered to keep charging.' : ''), 'aux'); });
  }
  toggleAc() {
    this.ac = !this.ac; this.root.querySelector('#sim-ac').checked = this.ac;
    this.on.vbus = this.ac; this.mark(this.ac ? 'DOCK IN' : 'DOCK OUT', P.pwr);
    this.note(this.ac ? 'Dock plugged in: CC attach → PD contract → VBUS.' : 'Dock unplugged: VBUS collapses, battery takes over. Controller rail stays on battery AUX.', 'aux');
    if (!this.ac && this.ctrl === 'stuck') this.note('A healthy controller resets its state on detach; a wedged one may not — reseating alone is not guaranteed.', 'warn');
  }
  powerOn() {
    if (this.sys === 'S0') return this.note('Already running.', 'warn');
    this.mark('POWER ON', P.pwr); this.note('Power on: EC sequences the main rails.');
    this.sys = 'BOOT';
    this.at(0.2, () => this.railsOn(['m5'])); this.at(0.4, () => this.railsOn(['m33'])); this.at(0.7, () => this.railsOn(['core'])); this.at(0.9, () => this.railsOn(['mux']));
    this.at(1.2, () => {
      this.sys = 'S0';
      if (this.ctrl === 'stuck') { this.note('Booted — but the controller kept its old state: no USB connection reported, dock absent, displays missing.', 'fail'); return; }
      this.negotiate();
    });
  }
  coldBoot() {
    if (this.sys === 'S0') {
      this.note('Cold boot = full shutdown, then power on.');
      this.shutdown(); this.at(3, () => this.powerOn()); return;
    }
    this.powerOn();
  }
  negotiate() {
    if (!this.on.pd) return;
    this.ctrl = 'neg';
    const steps = [[0.2, 'CC attach detected'], [0.6, 'PD contract: Source_Caps → Request → Accept → PS_RDY'], [0.8, 'USB connection / data role reported to host'], [1.0, 'DP Alt Mode entered'], [1.3, 'Mux routes lanes'], [1.8, 'USB hub enumerates'], [2.2, 'DP link trains'], [2.8, 'Windows enumerates devices']];
    steps.forEach(([d, m], i) => this.at(d, () => { this.note(m, 'ok'); if (i === steps.length - 1) { this.ctrl = 'ok'; this.mark('ALL UP', P.pwr); } }));
  }
  hold(sec) {
    const start = this.t; const deep = this.deep; const wasOn = this.sys === 'S0';
    this.holding = { start, sec }; this.mark(`HOLD ${sec}s`, P.warn);
    this.note(`Power button held for ${sec} s. EC starts counting.`, 'warn');
    if (wasOn || this.sys === 'BOOT') this.at(4, () => { this.mark('FORCED OFF', P.main); this.railsOff(['core', 'm5', 'm33', 'mux']); this.sys = 'S5'; this.note('> 4 s: power-button override → forced off (S5). Controller rail still up.', 'aux'); });
    if (sec >= deep) this.at(deep, () => {
      this.mark('DEEP RESET', P.fail); this.railsOff(['pd', 'mux']);
      this.note(`${deep} s: platform deep-reset threshold — EC drops the Type-C controller domain. Rail decays (τ = ${this.tauPd} s).`, 'fail');
    }); else this.note(`This hold ends before the ${deep} s deep-reset threshold in this model.`, 'warn');
    this.at(sec, () => {
      this.mark('RELEASE', P.silk); this.holding = null;
      if (!this.on.pd) {
        if (this.ctrl === 'cleared') this.note(`Released. Rail spent ${(sec - deep).toFixed(0)} s off — below retention → volatile state gone.`, 'ok');
        else this.note(`Released after only ${(sec - deep).toFixed(1)} s off — rail never fell below ${SIM_RET} V. State may survive.`, 'fail');
        this.at(0.3, () => { this.on.pd = true; if (this.ac && this.ctrl === 'cleared') this.at(0.3, () => this.note('Controller restarts cold: CC → PD contract → charging resumes.', 'ok')); });
      } else this.note('Released. Controller rail never dropped — state ' + (this.ctrl === 'stuck' ? 'STUCK.' : 'unchanged.'), this.ctrl === 'stuck' ? 'fail' : '');
      this.note('System is off. Press SYSTEM ON or COLD BOOT.');
    });
  }

  /* ---------- simulation ---------- */
  tick(dtReal) {
    const dt = dtReal * this.speed; this.t += dt;
    this.events.sort((a, b) => a.t - b.t);
    while (this.events.length && this.events[0].t <= this.t) this.events.shift().fn();
    SIM_RAILS.forEach(r => {
      let target = this.on[r.id];
      if (r.id === 'vbus') target = this.ac;
      if (r.id === 'vsys') target = true;
      const nom = r.id === 'vsys' ? (this.ac && this.on.pd ? 12.6 : 12.3) : r.nom;
      const tau = r.id === 'pd' ? this.tauPd : r.tauOff;
      this.v[r.id] = target ? nom - (nom - this.v[r.id]) * Math.exp(-dt / 0.08) : this.v[r.id] * Math.exp(-dt / tau);
    });
    if (!this.on.pd && this.v.pd < SIM_RET && this.ctrl !== 'cleared') { this.ctrl = 'cleared'; this.mark('STATE LOST', P.off); this.note(`Controller rail < ${SIM_RET} V: volatile state no longer retained.`, 'ok'); }
    this.hist.forEach((h, i) => { h.push([this.t, this.v[SIM_RAILS[i].id]]); while (h.length && h[0][0] < this.t - SIM_WINDOW - 1) h.shift(); });
    this.marks = this.marks.filter(m => m.t > this.t - SIM_WINDOW);
    this.render();
  }
  build() {
    let s = '';
    SIM_RAILS.forEach((r, i) => {
      const y = 22 + i * 52;
      s += `<rect x="200" y="${y - 4}" width="860" height="44" fill="${i % 2 ? '#081310' : '#0a1712'}"/>`;
      s += T(14, y + 16, r.name, 'tw', 'style="font-size:12px"') + T(14, y + 32, `nominal ${r.nom} V`, 'ts c-mute');
      s += `<path class="sim-line" data-i="${i}" d="" fill="none" stroke-width="2.2" stroke-linejoin="round"/>`;
      s += `<text class="t sim-val" data-i="${i}" x="1188" y="${y + 24}" text-anchor="end" style="font-size:15px;font-weight:700"></text>`;
    });
    s += `<path d="M200,${22 + 10 * 52} H1060" stroke="#2c4a3a"/>`;
    for (let k = 0; k <= 6; k++) s += T(200 + k * 860 / 6, 22 + 10 * 52 + 18, k === 6 ? 'now' : `−${SIM_WINDOW - k * 10} s`, 'mid ts c-mute');
    s += `<g class="sim-marks"></g>`;
    this.svg.innerHTML = s;
    this.lines = [...this.svg.querySelectorAll('.sim-line')];
    this.vals = [...this.svg.querySelectorAll('.sim-val')];
    this.marksG = this.svg.querySelector('.sim-marks');
  }
  render() {
    const X = t => 200 + (t - (this.t - SIM_WINDOW)) / SIM_WINDOW * 860;
    SIM_RAILS.forEach((r, i) => {
      const y = 22 + i * 52, h = 36, max = r.nom * 1.08;
      const pts = this.hist[i] || [];
      const d = pts.length ? 'M' + pts.map(([t, v]) => `${Math.max(200, X(t)).toFixed(1)},${(y + h - Math.min(v, max) / max * h).toFixed(1)}`).join(' L') : '';
      const v = this.v[r.id] || 0, live = v > r.nom * 0.25;
      const c = r.id === 'pd' && this.ctrl === 'stuck' && live ? P.fail : live ? ROLE[r.role] : P.off;
      this.lines[i].setAttribute('d', d); this.lines[i].setAttribute('stroke', c);
      this.vals[i].textContent = v.toFixed(v < 10 ? 2 : 1) + ' V'; this.vals[i].style.fill = c;
    });
    this.marksG.innerHTML = this.marks.map(m => `<path d="M${X(m.t).toFixed(1)},14 V${22 + 10 * 52}" stroke="${m.color}" stroke-width="1.4" stroke-dasharray="4 3"/><text class="t" x="${(X(m.t) + 4).toFixed(1)}" y="12" style="font-size:9.5px;font-weight:700;fill:${m.color}">${m.label}</text>`).join('');
    // status panel
    const ch = this.ac ? (this.on.pd && this.v.pd > 2 ? true : 'warn') : 'off';
    const io = this.sys !== 'S0' ? 'off' : this.ctrl === 'ok' ? true : this.ctrl === 'stuck' ? false : 'warn';
    const ctrlTxt = { stuck: ['STUCK', 'fail'], cleared: ['CLEARED · cold', 'off'], neg: ['NEGOTIATING', 'warn'], ok: ['NEGOTIATED', 'pwr'] }[this.ctrl];
    const key = [this.sys, ch, io, this.ctrl, !!this.holding, this.holding ? Math.floor(this.t - this.holding.start) : 0].join('|');
    if (key === this.lastKey) return; this.lastKey = key;
    const pill = (ok, label) => `<span class="pill ${ok === true ? 'ok' : ok === 'off' ? 'off' : ok === 'warn' ? 'warn' : 'bad'}">${label} ${ok === true ? '✓' : ok === 'off' ? '–' : ok === 'warn' ? '…' : '✕'}</span>`;
    this.status.innerHTML = `<div class="sim-chip"><b>SYSTEM</b><span>${this.sys === 'S0' ? 'RUNNING · S0' : this.sys === 'BOOT' ? 'BOOTING' : 'OFF · S5'}</span></div>` +
      `<div class="sim-chip ${ctrlTxt[1]}"><b>PD CONNECTION STATE</b><span>${ctrlTxt[0]}</span></div>` +
      `<div class="sim-chip"><b>POWER BUTTON</b><span>${this.holding ? `HELD ${Math.floor(this.t - this.holding.start)} / ${this.holding.sec} s` : 'released'}</span></div>` +
      `<div class="sim-pills">${pill(ch, 'CHARGING')}${pill(io, 'USB')}${pill(io, 'DISPLAY')}</div>`;
  }
}
