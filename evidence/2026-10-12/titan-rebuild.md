# Titan Class Rebuild (Steve 2026-10-11 confirmed)

## What changed

**Eater stripped of titan status.** The Eater is a wave-4 boss (The Eater, 👄, sigW4 eats->grows->poison). It was never meant to be the Herald — a worker conflated them. Removed from `src/data/titans.json`. Titan gate no longer applies. Its signature mechanics and multi-move kit are untouched.

**Herald is a new, separate titan.** ID `herald`, wave 4, THE HERALD (📯).
- HP [700, 900] (tutorial — weaker than Eater's [950, 1150])
- Speed 3 (slow, deliberate — it ARRIVES, doesn't ambush)
- Vibe: "it stands at the edge of the world, getting bigger. It is not attacking. It is ARRIVING."
- 3-move tutorial kit:
  - **First Omen** [30,50]: 3-tile line, windup 2. Teaches: read the omen, move.
  - **Second Omen** [25,45]: burst, windup 2, cooldown 3. Teaches: split the coalition, don't cluster.
  - **The Naming** [80,120]: burst, windup 3, bloodied-gated (hp<0.5). Teaches: when it's desperate, RUN or burn it down.
- All moves announce first (omen theme). Max damage 120 — forgiving for a tutorial.

**Scale up.** minAllies: Herald 10, Nielsen 12, Finale 15. (Steve: "10+ person fights.")

**Visual: ants vs titan (Steve 2026-10-11).**
- Grid stays 9x9 (mobile constraint — never bigger).
- `body.titan-fight` class toggled when a titan is in the fight.
- Cells pack denser (smaller font-size, 1px gap).
- Fighter sprites shrink to ant-size (28px max).
- Titan cell looms large (72px max, higher z-index).
- Player gets a spotlight: gold outline + glow (`player-spotlight` class on player cell).

## Files changed

- `src/data/titans.json`: removed eater, added herald (minAllies 10), nielsen→12, finale→15.
- `src/data/monsters.json`: added herald monster (+1, total 57).
- `src/js/titans.js`: titanCast() uses 'herald' not 'eater'.
- `src/js/app.js`: titan-fight body class toggle; titan-cell and player-spotlight cell classes.
- `src/css/main.css`: titan-fight visual rules.
- `scripts/test-titan-class.js`: eater→herald, 10 allies.
- `scripts/test-sigW5.js`: muster counts 12/15.
- `scripts/test-wave35-mechanics.js`: Eater no longer needs muster.
- `scripts/test-herald-titan.js`: NEW, 22 checks × 3 seeds.

## Proof

- test-herald-titan.js: 22/22 × 3 seeds (20261012, 777, 424242)
- test-titan-class.js: 32/32
- test-wave35-mechanics.js: 40/40
- test-sigW5.js: 144/144
- test-multi-move-20261012.js: 139/139
- test-multi-move-w35-20261012.js: 216/216

## Visual verification

CSS and class wiring are in place. Live browser verification at 390×844 needed (Steve's phone) to confirm:
- 9x9 grid renders with smaller cells in titan fight
- Fighters look ant-sized vs the large titan
- Player spotlight square is visible and doesn't obscure

[needs-eyes] — Steve should see the ant-vs-titan visual.
