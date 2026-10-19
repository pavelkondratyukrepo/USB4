# USB-C Dock Failure, Explained

An interactive engineering training module about a real incident.

> **Status: hypothesis · AI-assisted analysis.** The incident observations are real. The explanation was produced with AI assistance (Claude) from those observations and public documentation. It is a **hypothesis, not a confirmed root cause**. No logs or measurements were taken from the actual laptop or dock, and no HP or platform engineer has reviewed it. Each figure on the live page is tagged *Observed*, *Documented*, *Typical design*, *Illustrative* or *Hypothesis*.

```
HP USB-C Dock G5 ──USB-C──▶ Windows business laptop
  ⚡ charging ✅   🖧 USB / Ethernet ❌   🖥 displays ❌   dock absent from Device Manager
  Windows restart / shutdown → no change
  Hold power button ≈ 45 s   → everything back
```

![Master infographic](export/master-infographic.png)

> **▶ Live interactive version:** https://pavelkondratyukrepo.github.io/USB4/
> (served by GitHub Pages; needs Pages turned on once, see “Hosting” below)

## Open it

- **Interactive module:** open `index.html` in any browser. It's a single self-contained file that needs no server.
- **Poster:** `export/master-infographic.svg` · `.png` (4800 px wide) · `.pdf`
- **Every figure on its own:** `export/NN-*.svg` and `export/NN-*.png` (2×). The board also comes in all five modes (`19-board-*`).
- **Mermaid versions:** [`docs/mermaid.md`](docs/mermaid.md), which renders on GitHub.
- **Image-generation prompts** for photoreal renders: [`docs/image-prompts.md`](docs/image-prompts.md)

## Figure index

| # | Figure | Type |
|---|---|---|
| 01 | PCB-style motherboard | SVG |
| 02 | USB-C connector cutaway: one connector ≠ one subsystem | SVG |
| 03 | HP USB-C Dock G5 cutaway, verified vs representative blocks | SVG |
| 04 | Normal bring-up sequence (10 stages) | animated |
| 05 | Failure state: where the chain broke | SVG |
| 06 | Windows restart vs hardware power-state reset | split screen |
| 07 | Power rail map | SVG |
| 08 | “Off” does not always mean 0 V | SVG |
| 09 | Power-button path, myth vs reality | SVG |
| 10 | Rail voltage decay, V(t) = V₀e^(−t/RC) | interactive chart |
| 11 | What actually discharges the rail | toggle |
| 12 | Volatile vs non-volatile state | toggle |
| 13 | Reset depth matrix | SVG |
| 14 | OEM reset timeline, sourced timings only | SVG + table |
| 15 | Why 45 s may have worked | SVG |
| 16 | Diagnostic decision tree | clickable |
| 17 | Before · reset · after | 3-panel |
| 18 | Exploded laptop view | isometric SVG |
| 19 | Interactive motherboard: 5 modes, 16 clickable parts | interactive |
| 20 | Power-rail simulator (logic-analyzer view) | live simulation |
| 21 | Root-cause hypothesis map | clickable |
| 22 | Myth vs reality | flip cards |
| ★ | Master infographic | poster |


## Gallery

Static exports of every figure. The live page adds clicking, animation and the rail simulator (FIG 20). Click any image for full resolution; SVG versions sit next to each PNG in `export/`.

### 01 · Master PCB motherboard

![01 · Master PCB motherboard](export/01-motherboard.png)

Power enters at J1, becomes VSYS, splits into always-on (yellow) and main (blue) rails. Red marks the PD controller, mux and retimer.

### 02 · USB-C connector cutaway

![02 · USB-C connector cutaway](export/02-usb-c-connector-cutaway.png)

24 contacts, three independent jobs. Charging proves power only.

### 03 · HP USB-C Dock G5 cutaway

![03 · HP USB-C Dock G5 cutaway](export/03-dock-g5-cutaway.png)

Solid = documented by HP; dashed = representative block.

### 04 · Normal bring-up

![04 · Normal bring-up](export/04-normal-sequence.png)

Ten stages from cable insert to Windows enumeration.

### 05 · Where the chain broke

![05 · Where the chain broke](export/05-failure-state.png)

Dock absent from Device Manager → the break is before any USB enumeration, USB 2.0 included.

### 06 · Restart vs hardware power-state reset

![06 · Restart vs hardware power-state reset](export/06-restart-vs-hardware-reset.png)

A restart never drops the always-on rail feeding the controller.

### 07 · Power rail map

![07 · Power rail map](export/07-power-rail-map.png)

Representative power tree: AUX, MAIN and I/O columns.

### 08 · “Off” is not 0 V

![08 · “Off” is not 0 V](export/08-off-is-not-zero-volts.png)

What can stay powered in S5 with a battery present.

### 09 · Power-button path

![09 · Power-button path](export/09-power-button-path.png)

A logic input to the EC, not a discharge path.

### 10 · Rail voltage decay

![10 · Rail voltage decay](export/10-voltage-decay.png)

V(t) = V₀·e^(−t/RC) with the retention threshold.

### 11 · What discharges the rail

![11 · What discharges the rail](export/11-discharge-path.png)

Loads and bleeders drain the capacitors, not the button.

### 12 · Volatile vs non-volatile

![12 · Volatile vs non-volatile](export/12-volatile-vs-nonvolatile.png)

What is lost when a power domain collapses.

### 13 · Reset depth

![13 · Reset depth](export/13-reset-depth.png)

Five reset types and what each actually clears.

### 14 · OEM reset timeline

![14 · OEM reset timeline](export/14-oem-reset-timeline.png)

Only OEM / spec-documented timings. Is 45 s special? No: it is margin.

### 15 · Why 45 s may have worked

![15 · Why 45 s may have worked](export/15-why-45-seconds.png)

45 s ≠ stronger drain; 45 s = more timing margin.

### 16 · Diagnostic decision tree

![16 · Diagnostic decision tree](export/16-decision-tree.png)

The incident path, including the Device Manager question.

### 17 · Before · reset · after

![17 · Before · reset · after](export/17-before-reset-after.png)

### 18 · Exploded laptop view

![18 · Exploded laptop view](export/18-exploded-view.png)

Isometric vector stand-in for a photoreal render.

### 19 · Board modes: normal

![19 · Board modes: normal](export/19-board-normal.png)

### 19 · Board modes: dock failure

![19 · Board modes: dock failure](export/19-board-failure.png)

### 19 · Board modes: Windows restart

![19 · Board modes: Windows restart](export/19-board-restart.png)

### 19 · Board modes: hard reset

![19 · Board modes: hard reset](export/19-board-hardreset.png)

### 19 · Board modes: cold boot

![19 · Board modes: cold boot](export/19-board-coldboot.png)

### 21 · Root-cause hypothesis map

![21 · Root-cause hypothesis map](export/21-hypothesis-map.png)

Green = consistent with evidence, not proven.

### 20 · Power-rail simulator and 22 · Myth vs reality

These two are interactive-only. Open the live page.

## Hosting

The live page is served by GitHub Pages straight from this repo (`index.html` at the root; `.nojekyll` makes Pages serve files as-is).

One-time setup: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.**
The site appears at https://pavelkondratyukrepo.github.io/USB4/ a minute or two later and updates on every push to `main`.

## What is verified, what is representative

**Verified (sources linked in FIG 14):**
- ACPI 6.5 §4.8.2.2.1.3: holding the power button for more than 4 s forces soft-off.
- HP: power (hard) reset with the AC unplugged, hold ≈ 15 s.
- Dell: hard reset (flea-power drain) is 15–20 s. RTC reset is ≈ 30–35 s with AC connected, and it aborts if held for less than 25 s or more than 40 s.
- Lenovo: emergency-reset pinhole with AC removed. Lenovo publishes no duration.
- Microsoft Surface: newer models force-restart after ≈ 20 s. Older models use power + volume-up for ≈ 15 s.
- HP USB-C Dock G5 datasheet: ports, up to 100 W to the host, PD levels 5/9/10/12/15/20 V at ≤ 5 A, host needs PD + DP Alt Mode, and Thunderbolt laptops run at USB-C speeds (no TBT/PCIe). The SoftPaq firmware notes list three controllers: Dock Management Controller, Power Delivery Controller and Docking Graphic Controller.

**Representative (drawn dashed or labelled as such):** the laptop board layout, rail names and voltages, the dock's hub / NIC / lane-split chips, the retention threshold and τ values, and the simulator's deep-reset threshold.

**Deliberately not claimed:** which controller actually failed. Two observations narrow the field. First, the dock was absent from Device Manager, so not even USB 2.0 enumerated. Second, a long hold fixed it where a restart didn't. Together they point to the USB connection / data-role state that the PD controller (often via the EC) reports to the host, rather than Alt Mode or the mux alone. They do not prove a specific chip.

## Rebuild / re-export

```bash
python3 build.py      # src/ → index.html (+ artifact.html without the document skeleton)
node export.mjs       # needs playwright; regenerates export/*
```

Source layout: `src/core.js` holds the palette, shared SVG CSS and PCB primitives. `src/board.js` is the motherboard and its modes. `src/figs-*.js` hold the other figures, `src/sim.js` the simulator, `src/master.js` the poster and `src/app.js` the wiring.
