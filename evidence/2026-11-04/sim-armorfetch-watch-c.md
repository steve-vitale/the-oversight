# sim-armorfetch-watch-c — tier-3+ watch re-check on current master

Run: oversight-flesh-out-loop (Loop A), run fleshout-20261104T1220Z,
arm sim-armorfetch-watch-c, axis food-economy. Scripts/panel work
ONLY: no game-code change was made or wanted here. Any fix candidate
is documented, not landed.

Prereg (binding, committed BEFORE the judged panel run):
evidence/2026-11-04/sim-armorfetch-watch-c-prereg.md, commit
701059d09. Panel spec pinned there; judged against it, §14.

## Verdict — WATCH CLOSED on both metrics, no further regression

Fresh panel on current master (16 competent cases, seeds 16101–16116,
60d, 0 cached jobs, sources stable, neutrality proof matched):

| Metric | Armorfetch-b after (watch value) | Fresh point | Fresh Wilson 95% CI (n=16) | Verdict per prereg rule |
|---|---|---|---|---|
| Earned player tier-3+ weapon/armor access (goodGear) | 0.3125 (5/16) | 1.0 (16/16) | 0.7135 to 1.0 | watch closed — point >= watch value AND interval includes it |
| Player tier-3+ contest/show weapon/armor (contestShowGear) | 0.125 (2/16) | 1.0 (16/16) | 0.7135 to 1.0 | watch closed — point >= watch value AND interval includes it |

Neither metric meets the "regression confirmed" bar (interval entirely
below the watch value) — not close: the fresh lower bound (0.7135)
sits far above both watch values. The watch from armorfetch-b is
closed and needs no further re-check on this band. This is a
descriptive watch verdict only; per §15 and the prereg it overrides
no GO.

## Why the jump is believed, not an instrument artifact

The fresh panel was checked against armorfetch-b's own after-panel
(evidence/2026-10-30/sim-armorfetch-b-panel-after/panel.json.gz) on
the instrument, not just the numbers:

- Observer digest IDENTICAL (c5f9dc9f...), metric contract digest
  identical, simulation flags identical, days/policies/seeds
  identical. The metric definition is unchanged: a case counts when
  the player gains a tier-3+ gear item on an instrumented route
  (contest/show counts when that grant's source is contest/show).
- Re-extracting the old after-panel's per-seed metrics reproduces
  armorfetch-b exactly: goodGear 1 on 16102, 16106, 16109, 16110,
  16111 (5/16); contestShowGear 1 on 16110, 16111 (2/16).
- Fresh per-seed grants are concrete, not a counting quirk: every
  seed has at least one contest-source tier-3+ grant (e.g. 16102's
  single grant is a contest stormcloak; 16106 has 11 tier-3+ grants
  across contest, fan-package, and corpse sources). Craft/trade
  tier-3+ stays 0/16; corpse tier-3+ is 9/16.

What changed between 2026-10-30 and now is the GAME, not the ruler:
contest tier-3+ grants went from rare (2/16 seeds) to universal
(16/16) on this band, consistent with the loot/contest-prize landings
shipped since armorfetch-b. Naming that as the likely cause is
inference, not a traced mechanism — no mechanism hunt was run here,
because the watch question ("did it regress further?") is answered
no, and the brief forbids landing a game change on this arm. If a
future arm wants the mechanism, the per-seed grant table in the
fresh panel (gear.grants) is the starting point. No paired compare
against the old after-panel was interpreted: the prereg anticipated
it would come back INVALID on moved sources, and it is unnecessary
given the identical observer/contract/flags — the fresh point
estimates plus Wilson intervals already decide the watch.

## Spawn drift (re-probed before the prereg, disclosed)

scripts/probe-armorfetch-spawn.js on current master: 16103's stashed
armor is now bloodplate torso P40 (was swat_vest P35); 16109 holds NO
stashed armor (was farstrider_boots shoes P12). No further drift
beyond those two brief-named changes; the other 14 seeds each hold
exactly one stashed armor piece beating the empty slot. Comparability
effect, stated plainly: the panel measures EARNED tier-3+ gear, not
spawn armor, so the panel population (same seeds/policies/days) is
comparable; the spawn drift is a small starting-gear trajectory
change (16103 starts P40 not P35, 16109 starts with no stashed armor
not P12 boots). The acceptance test (spawn armor fetched/worn in 7
days) was NOT re-run and is NOT claimed here.

## Wall numbers (panel band, descriptive, not gated)

- Wins 0/16, national 0/16, table win/entry/sitting 0/16, vests 1/16
  (16109 only).
- Wave reach (panel row.waveReach): wave 4 on 8/16 seeds, wave 3 on
  the other 8, wave 5 on 0/16. (Armorfetch-b's recorder band reported
  max wave 3; the panel's waveReach counts waves reached in the
  panel's own observation, so the two are not directly comparable —
  reported here as the panel's own number, not as wall movement.)
- Max Arc 3 on 16/16; max rank village on 16/16.
- Community loss 3/16 (16102, 16111, 16112); end reasons survived
  13/16, village-lost 3/16; median gameDays 60.5 (range 32–62;
  gameDays above 60 reflect the panel's observation-cap tail).
- Same wall as armorfetch-b in the respects that matter: no wins,
  no national, no table. Tier-3+ gear access recovered (indeed
  saturated) without moving the scale wall — the wall is not a
  tier-3+ gear-access wall on this band.

## Sense-test (law — read, judged for meaning)

No villager transcripts were judged on this arm: it re-measures two
panel rates, and the panel's grant table is the sense check. The
grants read as earned contest/show prizes (stormcloaks, starfall
bows, phase blades, wardens' cloaks) plus fan packages and corpse
loot — the named tier-3+ items arriving through the routes their
names imply, not through an invented grant. Nothing in the grant
table reads as a freebie or a mislabeled source. PASS, narrowly
scoped to this arm's question.

## Village assessment (plain words)

On this band the village's gear story has flipped since October 30:
where a player used to finish 60 days with a tier-3+ prize only
about a third of the time (and almost never from a contest or show),
now every village's player walks away with at least one — usually
several, usually won in a contest. But the village itself is in the
same place: nobody wins, nobody reaches national, nobody sits at
the table, and three villages in sixteen still lose the community.
Better prizes did not open the scale on-ramp. That split — gear
access saturated, wall unmoved — is the finding to carry forward,
not a reason to tune gear further on this evidence.

## Blanks filled / documented

- CLOSED (this arm): the armorfetch-b tier-3+ watch, both metrics —
  no further re-check owed on this band.
- DOCUMENTED (not chased, no game change landed): the mechanism
  behind contest tier-3+ grants going 2/16 -> 16/16 since
  2026-10-30 is inferred (loot/contest-prize landings), not traced;
  a future arm may trace it from the fresh panel's per-seed grant
  table if it matters.
- DOCUMENTED (not chased): panel waveReach 4 on 8/16 vs the
  recorder band's max wave 3 at armorfetch-b — different
  instruments, not a claimed wall movement.

## Proof

- Panel: evidence/2026-11-04/sim-armorfetch-watch-c-panel/panel.json.gz
  (16 competent cases, seeds 16101–16116, 60d, 0 cached jobs,
  source head 701059d09 at start and end, sources stable, neutrality
  proof matched, no observer errors). cases/ cache deleted before
  commit, never committed.
- Prereg: evidence/2026-11-04/sim-armorfetch-watch-c-prereg.md,
  commit 701059d09, committed BEFORE the judged panel run.
- Proof script (unchanged, scripts/panel work only):
  scripts/test-armorfetch-b.js 38/38 GREEN Parts A+B on current
  master; Part C SKIPs (no after-corpus built by this arm, as
  designed — the panel, not a corpus, is this arm's instrument).
- Spawn probe: scripts/probe-armorfetch-spawn.js, band 16101–16116
  (results in the spawn-drift section above).

## Metric review

Pre-registered metrics bound this run and were honored: both watch
metrics were judged only against the prereg's decision rule (fresh
point >= watch value OR Wilson interval includes it -> closed;
interval entirely below -> regression confirmed), and no
friendlier metric was substituted mid-run. One instrument note for
the NEXT watch-style run, not applied here: when a fresh point
estimate saturates at 16/16, the Wilson interval's upper end must be
clamped to 1.0 (raw Wilson gives 1.0929); the verdict is unaffected
either way here. The paired-compare-against-an-old-panel route
should stay off the table for watch re-checks — identical
observer/contract/flags plus a fresh Wilson interval decides the
watch without risking an INVALID compare.
