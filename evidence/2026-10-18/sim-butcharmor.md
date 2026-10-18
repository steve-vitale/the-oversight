# sim-butcharmor — KILLED AT PILOT (2026-10-18)

Axis: scale-onramp. Recovery arm of run fleshout-20261018T0715Z (dead run
fleshout-20261018T0515Z committed b6d17631 unmerged, heartbeat 52min stale,
stale-lock recovery; Steve's standing rule: finish orphaned loop work).

## Pre-registered (dead run's claim, 2026-10-18T0515Z)

- **Lever:** butchering→armor L1 depth — the armorbreak named next ("pair
  vetrel veteran work with armor-depth"; deferral census showed the veteran
  bar opens onto a mortality-selected armor bar).
- **Primary (binding §14):** median over paired qualifying pairs of
  (armed.deferralArmorMargin − control.deferralArmorMargin) ≥ +2.0 pieces,
  where deferralArmorMargin = armored − 4 at the LAST wave-4-unready day.
  A pair qualifies when BOTH arms have a non-null margin.
- **Guardrails:** national ≥ control−2; median survival ≥ control−10d;
  no new death mode (cause-canonicalized).
- **Horizon:** 180d death-aware. Seeds: 8 fresh [7001021…7008377] ×
  {leadfeast,belongfeast} × {armed,control} = 32 runs (pilot per §9–12).
- **Layer:** BUTCHARMOR=1 (default OFF, game code):
  villagerHideArmorDay() in src/js/villager-build.js — hides banked off the
  kitchen counter into village stores; villagers sew hide_armor for
  themselves when torsoP < 15 and materials (hide + vine lacing) are
  available; game.js diverts foraged vine to village lacing when the village
  is actively sewing.

## Result — KILL (per protocol, §14)

- PRIMARY: median delta **+0.00 pieces** (n=14 qualifying pairs, bar ≥ +2.0).
- Engagement: the layer barely fired — 7/8 armed seeds show
  banked=0/diverted=0/crafted=0; one seed crafted 1 (s7008377).
- Per-pair margins: 13/14 deltas are +0 or −1/−3; the single +4
  (belongfeast-s7003091) is noise-level on n=14.
- Guardrails: national 0=0; median survival 171d vs 177d (need ≥167d) PASS;
  death modes 13 vs 16, no new-in-armed PASS.

The miss binds — never re-scored against a friendlier metric.

## Mechanism / metric review

SUBSTRATE-MISSING, not concept-dead. The butchering→hide_armor channel
needs a kitchen counter with hides to bank, and on the pre-seat feast
substrate butchering engagement itself is near-zero (armorstock's 16-run
census found 0 crafts/16, 0 tries). The L1 sewing labor pool never forms
because the upstream resource never arrives. This echoes the 0015Z run's
durable-stockpile retry note: the honest re-test is on a substrate where
the butchering channel actually produces hides (e.g. hunt-active
substrates), not more pilot seeds on feast-only.

Second observation (filed to sim-findings): there is no scholar→villager
armor-transfer verb and no villager-held armory concept — canon
INDIVIDUAL OWNERSHIP. Hide-armor depth cannot be banked in a durable
reserve under current canon; any future armor-depth arm needs a Steve
ruling on the armory question first.

## Kill protocol executed

- Game-code layer reverted zero-trace: src/js/villager-build.js,
  src/js/game.js, docs/ONTOLOGY.md all byte-identical to master post-revert
  (verified). ONTOLOGY.md change was a single-line Provides addition, also
  reverted.
- Proof scripts/test-butcharmor-20261018.js kept with KILL header (INFO-SKIP,
  not run post-kill).
- Instruments retained: scripts/sweep-butcharmor-20261018.js,
  scripts/judge-butcharmor-20261018.js, scripts/probe-hideflow*.js,
  scripts/hash-runner-butcharmor.js.
- Per-seed sweep data committed: evidence/2026-10-18/perseed-butcharmor/
  (32 runs). Judge output reproduced by coordinator exactly on the rebased
  tree (median delta +0.00, verdict KILL).

## Convergence state

scale-onramp stays **converging**. The armor-depth answer on the feast
substrate is now measured-dead (armorstock NO-GO + butcharmor NO-GO back
to back): the butchering→armor road needs upstream butchering volume
first, or the armory canon ruling — both steve-calls, not more lever
pilots. The #427 veteran-loosening options remain paired with the armor
fragility note (vetdemand analysis: gate-level 0/4 flip runs release on
the composed win stack; control side 3/5 flips WOULD release 12–19d
pre-win). Directive lift remains a Steve call.
