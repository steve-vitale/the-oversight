# Brawler lived ascension deed (2026-11-08)

## Design

`brawler.god.deed.event = outmatched_kill`

Alone, take a real wound from a foe that opened with more health than your
whole bar, then kill it. Player and villager share the same person-owned
receipt under `village.godpathDeeds[vid].outmatched_kill`.

Distinct from `apex_hunt`: no Pack Hunt route; requires the fighter's own
blood (`_taken` / field `vTaken`); helpers void it. Opening ledger is the
existing `_gpApexHunt` / field `huntOpening` evidence.

Authored `god.deed` replaces class-age and synergy proxies for
`one_person_army` (same gate model as the eight other fitting deeds).

## Proof

- `node scripts/godpath/test-brawler-deed.js` — 36/0 (seed 7): player and NPC
  tactical/field parity, save/Continue, successor isolation, ceremony gifts,
  and two removal controls (finish hook no-op; authored deed cleared restores
  the old age/synergy proxy).
- `node scripts/godpath/validate.js` / `ladder.js` green; ladder books the
  villager fixture like apex.
- `node scripts/proof-godhood-rework-20261013.js` updated to the lived deed.
- `node scripts/check-wired.js src/js/godpath.js` — 0 unwired.
- Apex deed regression still green (shared finish path).

## Muse-overlap risk

Low. No policies, garden/ability numbers, regions, or journey files. Extends
`finishApexHunt` / `finishFieldApexHunt` only; numerical combat calibration
untouched.

## Quick check

`node scripts/check.js --quick`: this work's proofs pass. Remaining quick
failures match pre-existing master (measurement proof freshness, mobile
combat cadence, occupation panels, phone-frame receipts, establishment r20).
`godpaths.json` joins the already-stale phone-frame source set; no layout
change claimed here.
