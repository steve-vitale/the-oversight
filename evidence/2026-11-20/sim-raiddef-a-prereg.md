# sim-raiddef-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-raiddef-a · **Loop A run:** fleshout-20261120T2015Z
**Axis:** scale-onramp · **Finding:** #2599 (contact — the raid-defender question)
**Type:** BUILD + measure — the RAIDDEF lever
**Frozen:** 2026-11-20 ~15:10 UTC, before any judged sim.
**Branch:** `sim-raiddef-a` (worktree
`~/workspace/worktrees/sim-raiddef-a`). **Base:** master
fca0aa6c3 (verified with `git rev-parse HEAD` before any work;
contains origin/master 4f91af362 — `git log HEAD..origin/master`
empty. Loop B's 9b14b0b93 (sim-dmgcheck-b evidence) lives only on
branch `sim-dmgcheck-b`, not on master — evidence-only, no game
code, so no rebase is owed; the base is current with master.)
**Builds on:** `evidence/2026-11-20/sim-draftmiss-a.md`
(DIAG-NO-GO, 12/21 pairs unclassified) and
`evidence/2026-11-20/sim-lend-a.md` §9 (NO-GO kind PARTICIPATION),
plus `evidence/2026-11-20/sim-presence-a.md` §6/§9.

## The question (finding #2599's named next lever)

The draftmiss verdict, verbatim: the lend "answers a different
question than the misses ask — and a better one — but it needs a
transfer path (0 inter-villager gun transfers in 16 seeds) and its
real question is whether the gun belongs with raid defenders."
The lend §9 names it directly: "the raid picks defenders by
health/proximity and never consults the armed holder standing next
to the fight. The one lend that fired was aid-routed, not a raid.
A raid-defender arm answers the question this arm could not."
Draftmiss §8 files the mechanism: "the raid's defender draft never
consults the presence draft. An armed holder adjacent to a raided
monster is not preferentially drafted as a defender."

The draftmiss corpus also shows the fights in question are
largely RAID fights — home defense at the haven's doorstep (7
proven raid pairs, most of the 12 unresolved leaning the same
way: monsters at/adjacent to the haven, holders whose regions
contain it). The tick draft fired exactly once in the whole
presence corpus, so the tick is not where the gun meets the
fight. The raid is.

## The mechanism (frozen, from code read — not a sim)

`havenRaidTick()` (`src/js/havenGrowth.js` ~521–830): fires when
the pantry smells (≥ 3000 kcal), the woods are thick (≥ 3 living
world monsters), the 7-day cooldown has passed, and the 18% roll
passes (overtime knobs aside). It drafts the 3–5 NEAREST monsters
to the haven (Manhattan, +1 above 12k pantry kcal, +1 above 24k,
cap 5), teleports them onto the haven tile, and drafts defenders:

```js
const defenders = (v.roster || []).filter(id =>
  id !== this.villagerId &&
  !(v.away && v.away[id]) &&
  !(this.isSheltered && this.isSheltered(id)) &&
  ((v.health || {})[id] === undefined || (v.health || {})[id] > 40));
const _sh = (v.shielded || {});
defenders.sort((a, b) => ((_sh[a] ? 1 : 0) - (_sh[b] ? 1 : 0)));
let di = 0;
for (const m of raiders) {
  if (di < defenders.length) {
    const d = defenders[di++];
    rec = this.resolveWildMonsterEncounter(d, m, { raid: true });
  } else { /* nobody met this one — it LINGERS and gorges nightly */ }
}
```

- The defender pick is roster order (shielded pushed back),
  health > 40, present (not away), not sheltered. It never reads
  what anyone carries: an armed searcaster holder is drafted only
  if roster order happens to put them first.
- Each drafted defender fights ONE raider blow-by-blow via
  `resolveWildMonsterEncounter(d, m, {raid: true})` — the
  `{raid:true}` flag is already plumbed (crisis memory
  'defended'), but the fight recorder's origin classifier
  (`fightOrigin` — stack taxonomy in the driver) returns
  'world-tick' for ANY fight routed through
  `resolveWildMonsterEncounter`, including the raid path. That
  mislabel is what left 12 of the draftmiss pairs unresolvable.
- The tick draft (`villagerMonsterTick`, `src/js/game.js`
  ~21090) is untouched by this arm — raid path only, per the
  task. The presence draft itself is NOT on master (reverted
  with the presence arm's NO-GO); this arm does not rebuild it.

## The design (frozen; my call, Steve can overrule)

**RAIDDEF=1** (default OFF). **One small legible rule: the
ARMED-HOLDER RAID DRAFT.** In `havenRaidTick`, after the
defenders list is built and shield-sorted, when RAIDDEF=1: any
living armed searcaster holder who is present and able is moved
to the FRONT of the defender pick (roster order among holders),
so the holder meets the first raider.

An **armed holder** for the draft (deterministic reads, zero
RNG): a roster villager (never the scholar, `villagerId`
excluded) whose equipped ranged weapon —
`S.equipment.rangedWeaponOf(vp, items)`, the same read the
volley block uses — is a `searcaster`, carrying **≥ 1**
`fusion_cell` in `items`, with village health **> 20**, not
away (`v.away[id]`), not sheltered (`isSheltered`), not
post-flee resting (`isPostFleeResting`), and living
(`getPerson` not dead). The helper is
`Game._raidDefArmedHolder(id)` in `havenGrowth.js` next to
`havenRaidTick` (returns the vid or null); the tick calls it
only when RAIDDEF=1.

Two frozen details:

1. **The > 20 bar is the holder's bar, not the generic > 40
   bar.** A holder at health 21–40 is NOT in the base defenders
   list (the > 40 filter), but IS drafted by this rule — added
   to the front of the list. That is the task's frozen
   eligibility, and it is the point: the village's best weapon
   is worth fielding hurt. (Whether it costs lives is what the
   guardrails judge.)
2. **The shield promise wins over the holder priority.**
   `tableFacilitate('shield')` promises "the village's fights
   will spend others first" — shielded villagers stand at the
   BACK of the defender line. A shielded holder stays back:
   holder-priority moves only NON-shielded eligible holders to
   the front. A shielded holder is still in the list and still
   fights when there is no one else.

**No new narration.** The raid's own defense beat names the
defenders (`🛡️ … met them at the door`), so a drafted holder
reads as the defender in the fight record itself. A draft that
needed a special announcement to be legible would be the wrong
shape.

**NOT built here:** any change to the tick/presence draft, any
transfer/lend path, any change to raid frequency, raider count,
palisade damage, or the linger path. Raid path only.

## The fightOrigin fix (instrument, frozen)

The `fightOrigin` mislabel blocked the draftmiss measurement and
would block this one: a raid fight must read as a raid fight.
Fix is driver-side, minimal, tested: the driver wraps
`Game.resolveWildMonsterEncounter` and reads `opts.raid`
directly (the game already passes `{raid: true}`) — when set,
the wrap stamps a raid marker `{day, mid, lead}` that the
`fieldFight` wrap reads to set `row.origin = 'raid'` and
`row.raid = true`, and records a `raidFight` row. No stack
parsing for this: the marker comes from the router's own flag.
No game-code label change (the game-side `{raid:true}` opts
already exist; the mislabel lived in the driver's stack
taxonomy). The proof test asserts a raid-routed fight reads
`origin 'raid'` while a tick-routed fight still reads
`'world-tick'`.

The driver ALSO wraps `Game.havenRaidTick` (returns `true` when
a raid fires): a pre-call pure read snapshots the eligible
holders at draft time (the same eligibility read as the game
rule, recomputed from live state — never trusted from the game
side), and the row is recorded only when the call returns true
(a raid fired). One raid per day at most (7-day cooldown), so
raid events group by day.

## Primary metric (BINDING, §14)

**GO iff ALL hold on the band (8 seeds, two legs, identical
seeds, panel §15):**

1. **Raid-defender draft rate ≥ 50%:** over raid EVENTS
   (havenRaidTick fired) with ≥ 1 eligible holder at draft
   time (denominator D), the holder is drafted as a defender
   (led a raid fight that day) in ≥ 50% of them — AND the arm
   rate is strictly greater than the control rate. The control
   rate is MEASURED, not assumed 0% (a holder can sit first in
   roster order by luck); the arm must beat it, not just clear
   50%. Denominator D ≥ 1 is required to judge: if D = 0 on the
   arm leg, the primary is UNJUDGEABLE → NO-GO kind
   PARTICIPATION (the rule never had a chance to fire — the
   pool was empty, not the rule wrong).
2. **Armed volleys in raid fights ≥ 1 (secondary, supporting
   the GO):** volleys FROM a searcaster in a raid fight (lead
   `rangedId === 'searcaster'` AND `volley.shots > 0` AND
   `origin === 'raid'`, arm leg) ≥ 1. The draft must put the
   gun in front AND the gun must fire there — a drafted holder
   whose volley never sounds is a participation finding, not a
   payoff.
3. **Starvation guardrail, two views (frozen reading of the
   task's "≤ control+2 on totals AND arm-only"):** (a) TOTALS —
   villager starvation deaths (death rows with cause
   `starvation`, arm) ≤ control + 2; (b) ARM-ONLY — starvation
   deaths among villagers drafted as raid defenders by the
   RAIDDEF rule on the arm leg ≤ 2 (the control cohort is empty
   by construction — the rule is off — so control+2 = 2; an
   empty drafted cohort passes vacuously at 0). The draft must
   not starve the village by pulling its fighters (or its
   gun-carrier) into the night fight.
4. **Median-survival guardrail:** median survival days (arm) ≥
   0.80 × control median.

**Verdict ladder (frozen):**
- **GO** = all four hold → the lever lands (one commit:
  game code + instrument + evidence, `[needs-eyes]` — the
  draft changes who leads a fight at the village's own door,
  a feel change Steve should see).
- **NO-GO** = any bar misses → the game code is REVERTED
  before commit (the draft leaves no trace in `src/`);
  instrument + evidence commit only. The kind is recorded
  (PARTICIPATION when the pool is empty or the rate misses,
  GUARDRAIL when a guardrail alone misses) and the
  coordinator decides the next lever.
- A NO-GO on bar 1 with D = 0 is a POOL finding (no raid ever
  had an eligible holder — the next lever is supply-side, not
  a wider draft). A NO-GO on bar 1 with D ≥ 1 is a DRAFT
  finding (holders were there and the rule did not take them
  — investigate the pick, do not just widen eligibility). A
  NO-GO on bar 2 with bar 1 passing is a PAYOFF finding (the
  holder leads but the gun stays quiet — the volley path, not
  the draft, is the binding constraint).

## Secondary metrics (supporting, never re-scored)

- (a) Raid pool: raid events per seed, raiders per event,
  defenders per event, unmet (lingering) raiders; eligible
  holders at draft time per event (0 / 1 / 2+); drafted-holder
  fights' outcomes (vKill / vFlee / vDie) vs undrafted raid
  fights on the control leg. Holder-days on the band (how
  often a village even HAS an armed holder — the supply
  context for bar 1).
- (b) Tick pool (context, not judged): `v4tickPresence` rows
  arm vs ctl — the tick draft is off on both legs, so the
  pool should match; a divergence is a cascade flag, not a
  lever effect.
- (c) Gun transfers + vanishes (`v4transfers` rows): the gun
  must not walk away from the drafted holder mid-raid — any
  transfer/vanish on the arm leg is reported, not judged.
- (d) Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (e) Sense-test notes from transcripts (SENSE-TESTING LAW —
  read the raid defense beats and the fight logs; does the
  drafted holder read as a defender stepping forward with the
  village's best weapon, or as the village shoving its
  gun-carrier at the monster? does the defense beat name them
  honestly when they fall?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the presence/lend
  bands, for comparability). Dead villages stop simulating
  (+10d tail max).
- **Seeds: 107061, 107062, 107063, 107064, 107065, 107066,
  107067, 107068 — FRESH band.** Verified unused: grep for
  `10706` across every `evidence/2026-11-*/sim-*-prereg.md`
  returns nothing (no 10706x seed appears in any November
  prereg). No dedicated forbidden/contaminated band list names
  this band (no such list file exists in the goal
  `hidden_files/`). The two legs of THIS arm differ ONLY by
  RAIDDEF.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` (all seven flags
  verified live on master by grep over `src/js/` before this
  prereg). **GUNRATE, CELLGATE, PRESENCE, SEARSUPPLY,
  BOWCRAFT, FUSIONCELL unset on both legs** (reverted levers —
  0 refs in `src/` on this base). Both legs run current master
  + RAIDDEF only on the arm leg.
- **Instrument:** `scripts/raiddef-driver-a.js` (clone of
  `scripts/presence-driver-a.js` — v4encounters with origin,
  daily ammo/cell census, gun transfers, tick-presence pool,
  dawnbid/launchparty recorders kept verbatim — with the
  GUNRATE/CELLGATE/PRESENCE requirements REMOVED, RAIDDEF in
  their place, PLUS the raid wraps: `resolveWildMonsterEncounter`
  raid marker + `raidFight` rows, `havenRaidTick` raid-event
  rows with draft-time eligibility snapshots, `origin 'raid'`
  on the fieldFight wrap when the marker is set); analyzer
  `scripts/analyze-raiddef-a.js` (clone of
  `scripts/analyze-presence-a.js`, same frozen bars with the
  raid judge in place of the presence judge, PLUS raid pool
  stats); proof test `scripts/test-raiddef-a.js` (the draft
  fixtures + a live drafted-holder raid volley on the
  encounter-gear fixture, failing on old code); panel builder
  `scripts/build-raiddef-panels-a.js` (clone of the presence
  panel builder, two legs) + `node scripts/balance-panel.js
  compare`; the compare .md is attached to the evidence file.
  The panel is the instrument, the pre-registered threshold is
  the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot checklist (§14b)

1. **Contact:** the draftmiss corpus (presence band,
   GUNRATE/CELLGATE/PRESENCE substrate) saw proven raid days on
   3/8 seeds and 7 proven raid pairs — raids happen. The raid
   pool on THIS band, on PLAIN master (no gunrate substrate),
   is UNKNOWN until the pilot measures it: the base searcaster
   grant rate is lower than the gunrate arm's 4/18, so armed
   holders may be rarer than the presence band's 3/8 seeds.
   The `raidEvents` rows are the measurement, and an empty
   eligible pool is a finding, not a metric error (see the
   ladder). The draft-rate bar (≥ 50%) is a ratio, so it is
   powered by whatever eligible pool arrives — but with D = 1
   it is one coin flip, and the evidence will say so plainly.
2. **Pool sizing:** bar 2 (≥ 1 armed raid volley) is a count
   floor sized at the minimum observable payoff; bars 3–4 are
   the guardrails. If the band is quiet (few raids, or no
   holders), bars 1–2 fail honestly as a supply/participation
   finding, not as a metric error — the floors are the power
   guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-raiddef-a.js`, GREEN before the pilot)
   proves the draft on fixtures (holder drafted first,
   low-health holder 21–40 drafted, sheltered holder not
   drafted, post-flee holder not drafted, scholar-holder not
   drafted, shielded holder stays back, RAIDDEF-off identity,
   drafted holder fires an armed raid volley) and the analyzer
   `--selftest` covers the judge shapes (GO, NO-GO per bar,
   incl. the D = 0 PARTICIPATION shape and the starvation
   bars).
4. **Draw-neutrality check (frozen):** the draft adds ZERO
   `Math.random()` calls: the holder scan is deterministic
   reads (`getPerson` / `rangedWeaponOf` / health / sheltered /
   post-flee / away) and a list reorder — verified by grep over
   the diff (`git diff -U0 | grep -c "Math.random"` on added
   lines must be 0, discounting the comment-only mention)
   before the pilot. When the draft fires, the fight that
   follows consumes its own RNG stream with a different lead —
   that divergence is the mechanism, disclosed here, not a
   silent shift. When it does not fire, the pick is exactly as
   before.
5. **Fidelity check (frozen):** the CONTROL leg is plain master
   (no rebuilt substrate to reproduce), so there is no
   historical corpus to match. Instead the control leg is
   checked for sanity before judging: raids fire on the band
   (≥ 1 raid event), the raid defense beat names defenders,
   and the control draft rate is reported (expected 0%, measured).

## Seed-band freshness check (frozen, before any judged sim)

Band 107061–107068 is FRESH (see §Horizon). Searched: every
`evidence/2026-11-*/sim-*-prereg.md` (grep `10706`): no hits.
No dedicated forbidden/contaminated band list names this band
(no such list file exists in the goal `hidden_files/`; the only
"forbidden/contaminated" hits there are generic mentions in
unrelated notes). The band is fresh by design: the control leg
is a fresh run on plain master, and the two legs of THIS arm
differ only by RAIDDEF.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` (wave law,
escalation, tiers; raid-adjacent readiness bars) were consulted
for this arm. **No canon doc covers the searcaster, holder
presence at fights, or the raid defender draft** — said here
rather than inventing canon (same as the presence/cellgate/
gunrate arms). The raid, draft, shelter, muster, volley, and
lead rules are cited from code (`havenGrowth.js`
`havenRaidTick` / defender pick, `game.js`
`resolveWildMonsterEncounter` / `villagerMonsterTick` /
`isPostFleeResting`, `equipment.js` `rangedWeaponOf`,
`fieldFights.js` volley ~975–1060), not from canon. The draft
is a design call (this arm's, Steve can overrule): when the
village's best weapon is standing at home on a raid night, its
carrier meets the raiders at the door — the village does not
draw lots for who defends it.
