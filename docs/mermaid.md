# Mermaid versions

Lightweight versions of the main diagrams. They render natively on GitHub, in most wikis and in claude.ai artifacts. Colours follow the module's code: green = power / working, yellow = always-on, blue = main rails, purple = USB-C data, red = stuck, grey = off.

## FIG 04 · Normal USB-C dock bring-up

```mermaid
sequenceDiagram
    autonumber
    participant D as HP USB-C Dock G5
    participant PD as Laptop PD controller
    participant MX as Mux / retimer
    participant SoC as SoC (xHCI + iGPU)
    participant W as Windows
    D->>PD: Cable inserted · Rp on CC
    PD->>PD: CC attach detected · orientation known
    D->>PD: Source_Capabilities (5/9/15/20 V …)
    PD->>D: Request
    D->>PD: Accept → PS_RDY · VBUS at contract voltage
    Note over PD: Charging starts here (power domain done)
    PD->>D: Discover Identity / SVIDs / Modes
    PD->>D: Enter Mode (DisplayPort) · DP Configure
    PD->>MX: Route SS lanes (pin assignment C or D)
    D->>SoC: USB hub enumerates (USB 2 + USB 3)
    SoC->>D: DP link training over AUX (SBU)
    SoC->>W: PnP · displays, Ethernet, USB devices
```

## FIG 05 · Failure state

```mermaid
flowchart TD
    CC["CC ATTACH ✅"]:::ok --> PDN["PD NEGOTIATION ✅"]:::ok
    PDN --> CHG["⚡ CHARGING ✅"]:::ok
    PDN --> CON["USB CONNECTION / DATA-ROLE STATE<br/>⚠️ STUCK — host never told 'USB connected'"]:::stuck
    CON -.-> U2["USB 2.0 enumeration<br/>(needs no Alt Mode) — never started"]:::off
    CON -.-> ALT["Alt Mode · mux · DP — never reached"]:::off
    U2 --> USB["USB · ETHERNET ❌<br/>dock absent from Device Manager"]:::bad
    ALT --> DP["DISPLAYS ❌"]:::bad
    classDef ok fill:#0a1a12,stroke:#3ddc84,color:#e9f0e6
    classDef stuck fill:#2a1010,stroke:#ff9f1a,color:#ffdd99,stroke-width:3px
    classDef bad fill:#1a0b0b,stroke:#ff4f4f,color:#ffb3b3
    classDef off fill:#111614,stroke:#56645c,color:#a6b4ab,stroke-dasharray:5 5
```

## FIG 06 · Restart vs hardware power-state reset

```mermaid
flowchart LR
    subgraph R["WINDOWS RESTART (warm)"]
      direction TB
      r1["CPU → reset"] --> r2["Windows → reload"]
      r3["AUX rail → still on"]:::aux --> r4["USB-C controller → still powered"]:::aux --> r5["Stuck state → survives"]:::bad
      r5 --> rr["⚡ ✅ · USB ❌ · DP ❌"]:::bad
    end
    subgraph H["HARDWARE POWER-STATE RESET"]
      direction TB
      h1["EC / power sequencer"]:::aux --> h2["Regulators disabled"] --> h3["Relevant rails collapse"]:::off
      h3 --> h4["Controller loses volatile state"]:::off --> h5["Cold initialisation"] --> h6["USB-C negotiates again"]:::ok
      h6 --> hr["⚡ ✅ · USB ✅ · DP ✅"]:::ok
    end
    classDef ok fill:#0a1a12,stroke:#3ddc84,color:#e9f0e6
    classDef bad fill:#1a0b0b,stroke:#ff4f4f,color:#ffb3b3
    classDef aux fill:#1a1608,stroke:#f2c230,color:#ffe9a8
    classDef off fill:#111614,stroke:#56645c,color:#a6b4ab
```

## FIG 07 · Power tree (representative)

```mermaid
flowchart TD
    SRC["USB-C SOURCE (dock)<br/>5 / 9 / 15 / 20 V"]:::pwr --> PDC["USB-C PD CONTROLLER"]:::pwr
    PDC --> CHG["CHARGER / POWER PATH"]:::pwr
    BAT["BATTERY PACK 3S/4S"]:::pwr <--> CHG
    CHG --> VSYS["SYSTEM BUS · VSYS"]:::pwr
    VSYS --> AUX["AUX · always-on"]:::aux
    VSYS --> MAIN["MAIN · S0 rails"]:::main
    VSYS --> IO["I/O · USB-C path"]:::io
    AUX --> A1["3.3V_AUX"]:::aux & A2["1.8V_AUX"]:::aux & A3["EC"]:::aux & A4["USB-C / PD logic"]:::aux
    MAIN --> M1["5 V"]:::main & M2["3.3 V"]:::main & M3["CPU VRM → VCORE"]:::main & M4["GPU rails"]:::main
    IO --> I1["USB-C port power"]:::io & I2["MUX"]:::io & I3["RETIMER"]:::io
    classDef pwr fill:#0a1a12,stroke:#3ddc84,color:#e9f0e6
    classDef aux fill:#1a1608,stroke:#f2c230,color:#ffe9a8
    classDef main fill:#0a1422,stroke:#4ea2ff,color:#cfe4ff
    classDef io fill:#160f24,stroke:#b07cff,color:#e5d6ff
```

## FIG 09 · Power-button path

```mermaid
flowchart TD
    BTN["POWER BUTTON"] -- "PWR_BTN# · logic level (µA via pull-up)" --> EC["EMBEDDED CONTROLLER"]:::aux
    EC --> SEQ["POWER SEQUENCER"]:::aux --> PMIC["PMIC / REGULATORS"]:::main --> RAILS["POWER RAILS"]:::main
    RAILS -. "discharge via loads + bleeders" .-> GND["GND"]
    BTN x-. "NOT a discharge path" .-x GND
    classDef aux fill:#1a1608,stroke:#f2c230,color:#ffe9a8
    classDef main fill:#0a1422,stroke:#4ea2ff,color:#cfe4ff
```

## FIG 13 · Reset depth

```mermaid
flowchart TD
    L1["LEVEL 1 · Windows restart<br/>clears OS + CPU only"] --> L2["LEVEL 2 · Forced shutdown (>4 s, ACPI)<br/>+ main rails · PD/mux maybe"]
    L2 --> L3["LEVEL 3 · Residual / hardware power reset<br/>AC + dock out · + PD/mux likely"]
    L3 --> L4["LEVEL 4 · EC / battery-disconnect reset<br/>+ EC + battery path"]
    L5["LEVEL 5 · RTC / CMOS / NVRAM reset<br/>configuration only — different axis"]:::cfg
    classDef cfg fill:#160f24,stroke:#b07cff,color:#e5d6ff,stroke-dasharray:5 5
```

## FIG 14 · Documented hold times (seconds)

```mermaid
gantt
    title OEM-documented power-button procedures (0–60 s)
    dateFormat X
    axisFormat %S
    section ACPI (all PCs)
    Power-button override > 4 s      :milestone, 4, 0s
    section HP
    Power (hard) reset ≈ 15 s        :milestone, 15, 0s
    section Dell
    Hard reset / flea power 15–20 s  :15, 20
    RTC reset window 25–40 s         :done, 25, 40
    RTC reset recommended 30–35 s    :crit, 30, 35
    section Microsoft Surface
    Older models ≈ 15 s              :milestone, 15, 0s
    Force restart ≈ 20 s             :milestone, 20, 0s
    section This incident
    45 s hold                        :active, 45, 46
```

## FIG 16 · Diagnostic decision tree

```mermaid
flowchart TD
    S([DOCK CONNECTED]) --> Q1{Is the laptop charging?}
    Q1 -- NO --> A[Investigate charger · cable · VBUS · CC · PD]
    Q1 -- YES --> Q2{Are USB devices working?}
    Q2 -- YES --> B[Investigate display path separately]
    Q2 -- NO --> Q3{Are displays also missing?}
    Q3 -- NO --> C[USB-only: hub · xHCI · drivers]
    Q3 -- YES --> Q6{Is any dock device in Device Manager?}
    Q6 -- YES --> X[Alt Mode / lane path: DP Alt Mode · mux · retimer · dock graphics]
    Q6 -- NO --> D[BEFORE ANY USB ENUMERATION<br/>PD connection / data-role state · EC ↔ PD ↔ SoC handshake · dock hub]:::bad
    D --> Q4{Did a Windows restart fix it?}
    Q4 -- YES --> E[Software / driver state]
    Q4 -- NO --> F[HARDWARE POWER RESET]:::aux
    F --> Q5{Did function return?}
    Q5 -- NO --> H[Persistent fault: swap cable/dock, other host, firmware, service]
    Q5 -- YES --> G[TRANSIENT CONTROLLER / LINK STATE<br/>strong hypothesis — not proof]:::ok
    classDef ok fill:#0a1a12,stroke:#3ddc84,color:#e9f0e6
    classDef bad fill:#1a0b0b,stroke:#ff4f4f,color:#ffb3b3
    classDef aux fill:#1a1608,stroke:#f2c230,color:#ffe9a8
    linkStyle 0,2,4,6,8,9,11,12,14 stroke:#3ddc84,stroke-width:3px
```

## FIG 21 · Hypothesis map

```mermaid
mindmap
  root((Charging ✅<br/>USB ❌ · Display ❌<br/>dock absent from Device Manager<br/>45 s reset fixed it))
    Consistent — not proven
      PD controller connection / data-role state
      EC ↔ PD ↔ SoC connection handshake
    Possible
      Dock controller · DMC / hub / graphics
      Alt Mode state machine — explains displays, not USB 2.0
    Less consistent
      Mux / retimer alone — USB 2.0 bypasses it
      USB controller / xHCI
      OS / display driver
      Cable / physical connection
    Cannot determine
      Root trigger · FW bug / sleep-wake race / ESD
```
