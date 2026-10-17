# Gap closure: scholar-death instrument blind spot — 2026-10-17

## The blank
The 2026-10-13 deathattr fix made `tele('death')` records carry
`player:true` (boolean) for scholar deaths. Sibling instruments were to be
audited for the same blind spot.

## Finding
`scripts/analyze-attrition.js` classified scholar deaths with `d.scholar`
— a field that **never exists** on tele('death') records. Every scholar
death was silently bucketed as a villager death (`V-combat` etc.), and the
"player deaths by cause" section always printed empty. The other death
readers audited (analyze-fieldfightsrc, analyze-overtimedeath,
intraviol-census, succhain-lib/deathattr) already use the `d.player`
boolean convention — this was the one remaining mismatch.

## The fix
`isScholarDeath(d)`: `d.player === true` first, `/player|scholar/i` kind
fallback (same convention as succhain-lib's `isBearerDeath`). Applied to
both the `cat()` bucket and the player-deaths-by-cause section.

## Proof
`scripts/test-attrition-scholar-20261017.js` — RED→GREEN on a synthetic
shard (1 scholar death player:true/combat + 1 villager sickness death):
- Pre-fix: scholar death → `V-combat`, player deaths `{}`.
- Post-fix: scholar death → `PLAYER-combat`, player deaths `{"combat":1}`;
  villager death still `V-sickness` (no regression).

## Metric review
Instrument-only change (scripts/, zero game code). No sweep metric
applies. Note for future sweeps: shards predating the 2026-10-13
deathattr fix lack the `player` flag and can't be recovered via the kind
fallback (pre-fix scholar deaths carried kind='villager') — re-run, don't
re-analyze, old shards for scholar-death attribution.
