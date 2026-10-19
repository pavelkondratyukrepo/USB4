# Image-generation prompts

Use these for photoreal or 3D renders that vector art can't match. Each prompt follows the module's colour code. Generated images are illustrations, not documentation of a real board.

**Colour code (paste into every prompt):** glowing GREEN traces = incoming / working power · YELLOW = always-on (auxiliary) rails · BLUE = main system rails · PURPLE = USB-C data and DisplayPort lanes · RED = the stuck / failed area · dim GREY = powered-down sections.

**Shared negative prompt:** cartoon, toy-like, emoji, generic corporate clip-art, sci-fi hologram HUD, neon cyberpunk city, lens flare overload, warped or melted chips, random gibberish text, misspelled labels, brand logos, HP logo, Dell logo, Lenovo logo, Microsoft logo, watermark, extra USB ports on chips, impossible geometry.

---

## R1 · Master PCB motherboard (FIG 01 / 19)

> Top-down orthographic macro photograph of a modern business-laptop motherboard, matte black-green solder mask, gold ENIG pads, fine copper traces visible under the mask, realistic IC packages: a large BGA system-on-chip with a bare silicon die and small substrate capacitors, a 3-phase voltage regulator with square molded inductors marked "R22", a 128-pin LQFP embedded controller, small QFN packages for a USB-C power-delivery controller, mux and retimer next to a stainless-steel USB-C receptacle on the left edge, an NVDC battery-charger IC with a molded inductor near a white battery connector, an SOIC-8 SPI flash, a silver coin cell, M.2 slot, mounting holes with gold rings, fan cut-out at the top right. Overlaid glowing traces follow the colour code: green VBUS path from the USB-C port to the charger and a thick green system power bus, yellow always-on traces to the embedded controller and PD controller, blue main rails to the SoC, purple differential-pair lanes from the SoC through retimer and mux to the USB-C port. The PD controller, mux and retimer have a red hatched glow showing a stuck state. Engineering-textbook teardown aesthetic, crisp silkscreen labels in white sans-serif ("PD CTRL", "MUX", "RETIMER", "EC", "PMIC", "CHARGER"), soft even studio lighting, 8K, extremely sharp, 3:2.

## R2 · USB-C connector cutaway (FIG 02)

> Photoreal macro cutaway of a USB-C plug mated into a laptop receptacle, sectioned along its length to reveal the 24 gold contacts on both sides of the tongue and the cable's internal conductors fanning out behind the overmold. Three bundles of conductors glow and separate to the right: a green power bundle (VBUS and CC wires), a purple data bundle (USB 2.0 pair and SuperSpeed pairs) and a cyan DisplayPort bundle (high-speed lanes and SBU wires). The green bundle ends at a lit green check-mark icon; the purple and cyan bundles end at red X icons. Dark charcoal background, technical-illustration lighting, shallow depth of field on the contacts, 16:9, 8K.

## R3 · HP USB-C Dock G5 internal cutaway (FIG 03)

> Isometric technical cutaway of a compact square USB-C docking station (about 12 × 12 cm, 4.5 cm tall, matte black plastic, rounded corners) with the top shell lifted away to reveal one green PCB. A captive USB-C cable enters from the left. Visible functional blocks as generic unbranded chips: a power-delivery controller near the cable entry, a dock-management microcontroller, a USB 3 hub IC feeding four USB-A ports and one front USB-C port, a gigabit Ethernet controller next to an RJ45 jack, a DisplayPort graphics/MST controller feeding two DisplayPort sockets and one HDMI socket, a DC power-input stage. Glowing traces follow the colour code (green power from the DC jack to the PD controller and up the cable, purple USB paths, cyan DisplayPort paths). No Thunderbolt markings, no logos. Clean white labels with thin leader lines. Studio product lighting on a dark slate background, 16:9, 8K.

## R4 · "The laptop looks off" (FIG 08)

> An open modern business laptop on a dark desk, screen completely black. The laptop base is shown with an X-ray see-through effect revealing the motherboard: the CPU, GPU and main-rail areas are dark grey and unlit, while the battery and charger glow green and the embedded controller, USB-C PD controller, wake logic and RTC coin cell glow soft amber/yellow. Subtle floating callout labels: "CPU OFF", "MAIN RAILS OFF", "BATTERY LIVE", "EC POSSIBLY LIVE", "PD CONTROLLER POSSIBLY LIVE", "RTC LIVE". Moody low-key lighting, cinematic but technically believable, 3:2, 8K.

## R5 · Exploded laptop render (FIG 18)

> Professional exploded-view 3D render of a thin business laptop, layers floating vertically with even spacing and thin dashed alignment lines, viewed from a 30° isometric angle: top — aluminium keyboard deck (semi-transparent), then the motherboard with its components lifted slightly above their footprints (USB-C port, USB-C power-delivery controller, mux / retimer, embedded controller, PMIC / charger IC, CPU / SoC with heat-spreader, GPU / display path), then the lithium-ion battery pack with three cells, and the bottom cover at the bottom. Glowing traces on the motherboard follow the colour code; the PD controller and mux/retimer glow red to mark the stuck state. Right-hand column of clean white callout labels with leader lines. Dark graphite background, soft rim lighting, physically based materials, subtle reflections, 4:3, 8K, octane-style render.

## R6 · Rail voltage decay hero (FIG 10)

> Close-up photograph of an oscilloscope screen in a dark electronics lab showing a single yellow trace: a flat 3.3 V level that drops off in a smooth exponential curve toward 0 V, with a dashed red horizontal cursor labelled "retention threshold" partway down. Probe clipped to a small capacitor on a green PCB in the soft-focus foreground. Realistic phosphor glow, shallow depth of field, 16:9, 8K.

## R7 · Master poster backdrop

> Ultra-wide dark PCB texture backdrop for a technical poster: deep black-green solder mask, faint copper ground pour, sparse vias and fine traces receding into soft focus at the edges, a few faint green, yellow, blue and purple trace glows. The centre is calm and low-contrast, leaving room for overlaid diagrams. No text, no components in the centre, 2400 × 3000 px.
