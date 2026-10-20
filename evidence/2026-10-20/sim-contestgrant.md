# sim-contestgrant — contest grantWeapon teaches gear L1 (backlog #698, canon repair)

Run: fleshout-20261020T1915Z, axis scale-onramp. Worktree: sim-contestgrant.
Canon: docs/CANON.md — GEAR RECIPE DISCOVERY (Steve 2026-10-09): "handling a
gear item with a recipe (equipping it, looting it from a corpse) teaches L1 —
you've SEEN one up close."

## Pre-registration (MEASUREMENT.md §§9–12, 14–15)

**Bug** (sim-spearfund arm, run fleshout-20261020T1215Z, backlog #698):
`src/js/contests.js` `contestChoose`, the `if (d.grantWeapon)` block (~L4375)
equips the granted weapon directly
(`s2.equipped[wslot] = { itemId: def.id, name: def.name }`) and never calls
the engine's canonical gear-handled hook — a contest-granted spear teaches
recipe L0. A policy-side layer cannot repair this: the scholar already
"owns" the spear. One-line engine fix, no feel change.

**Fix**: after the direct equip, `try { this.noteGearHandled(def.id); } catch (e) {}`
— the exact call shape of the game.js equip path (L12258), which already
carries the canon comment. `noteGearHandled` is idempotent (no downgrade, no
repeat) and early-returns for non-gear / trap recipes. Audit result: the
`_contestArena` / `_contestArenaAfter` paths do no granting/equipping of
their own — all 4 grant sites (pit "Spear", pit "Net and knife", gauntlet
"Take a spear", siege "Take a spear") flow through the single contestChoose
grantWeapon block, so one hunk covers all.

**Design call** (Steve 2026-10-07: make the call, he can overrule): the
backlog item asked whether contest grants SHOULD teach. The canon answers
it: equipping teaches L1, and the System's grant is a real grant ("yours to
keep," Steve 2026-10-08). The grant EQUIPS — so the grant teaches. Call:
**contest grants teach.** Documented here; Steve can overrule.

**Primary metric**: recipe taught on grant. Fixture proof (deterministic,
`scripts/test-contestgrant-20261020.js`): grant hunting_spear →
codex.recipes.hunting_spear L1, `via:'discovery'`; stone_knife likewise;
re-grant at L2+ stays L2+ (no downgrade); the bespoke `do.note` beat fires
exactly once (no doubled beats). Corpus proof: 8 seeds × {leadfeast,
belongfeast} × {before, after} = 32 runs, 180d death-aware, standard
substrate (FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED unset). Each run plants
one deterministic grant beat at day 30 through the REAL contestChoose path
(the actual pit weapon-choice shape) — before-arm: postBeat === preBeat on
all runs; after-arm: postBeat ≥ 1 on all runs conditioned preBeat === 0.

**GO threshold**: 100% RED→GREEN on the fixture (9/9, was 6/9) + corpus
primary met on all 32 runs + det-gate pass (before/after behavior hashes
byte-identical on every day per seed×policy; knowledge may differ only in
hunting_spear after the planted-grant day on the after arm).

**Guardrails**: check.js --quick parity with the pre-existing 4 failures
(documented 2026-10-20, not this change); no new death modes;
starvation/median-survival/wave-4-reach within noise.

**Horizon**: 180d death-aware (dead villages stop; +10d tail max). Seeds
65101–65108 (verified filename-unused in evidence/2026-10-20/perseed-*
before the sweep).

**§14 binding**: a miss is NO-GO, never re-scored. Metric doubts go under
"metric review" and revisions apply to the NEXT run.

## The one-line diff

`src/js/contests.js`, contestChoose d.grantWeapon block, after the direct
equip:
```js
// GEAR DISCOVERY (Steve 2026-10-09; backlog #698, 2026-10-20):
// equipping teaches the recipe L1 — same canonical hook as the
// game.js equip path. The grant is a real grant ("yours to keep,"
// Steve 2026-10-08), so the grant teaches. noteGearHandled is
// idempotent (no downgrade, no repeat).
try { this.noteGearHandled(def.id); } catch (e) {}
```

## Results

**Fixture proof** (`scripts/test-contestgrant-20261020.js`): RED 6/9 →
GREEN 9/9 after the fix. The 3 RED failures were exactly the bug
assertions (spear recipe L0 after grant, knife recipe L0 after grant, no
discovery metadata). Invariants: re-grant at L2+ never downgrades; the
bespoke `do.note` beat fires exactly once.

**Corpus** (32 runs: seeds 65101–65108 × leadfeast/belongfeast × before/after,
180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 / SURPLUSFEED unset):

- PRIMARY: planted day-30 grant beat taught L1 on **13/13** conditioned
  after-arm runs, and taught nothing on **14/14** conditioned before-arm
  runs (5 runs already-known pre-beat — see metric review). PRIMARY: **GO**.
- DET-GATE: **16/16** before/after pairs byte-identical behavior hashes on
  every day. The fix's only trajectory footprint is the intended knowledge
  gain. DET-GATE: **PASS**.
- GUARDRAILS: median survival 130/148 before vs 130/148 after (noise band
  OK); starveDays 1 vs 1; wave-4 reach 16 vs 16; death modes identical
  (village-lost 4 / survived 4 on both). check.js --quick: 253 passed, 4
  failed — parity with the pre-existing 4 failures (see metric review).
- **VERDICT: GO.**

**Wild-beat observation** (unplanned, real mechanism evidence): on seed
65108 leadfeast-after, a NATURAL contest-grant beat fired during day 29
(traj: day-29 row no spear knowledge, day-30 row `hunting_spear:1`) and
taught L1 through the real contest pipeline — the first wild specimen of
the repaired channel. Behavior stayed byte-identical to the before-arm
(both equipped the spear; only the after arm knew the recipe).

## Wall numbers (before → after — identical)

| arm | nat | table | won | w4 | medD | maxD |
|-----|-----|-------|-----|----|------|------|
| leadfeast before | 8/8 | 6/8 | 0 | 8/8 | 130 | 180 |
| leadfeast after  | 8/8 | 6/8 | 0 | 8/8 | 130 | 180 |
| belongfeast before | 4/8 | 7/8 | 0 | 8/8 | 148 | 180 |
| belongfeast after  | 4/8 | 7/8 | 0 | 8/8 | 148 | 180 |

Scale-onramp status unchanged by this repair (as expected — it's a
correctness fix, not a scale lever): national reached on these
courtship-feast policies, zero wins in the corpus, wave-4 universal,
wave-5/wins remain the wall.

## Sense note (SENSE-TESTING LAW)

Fixture 4 captured the grant beat's say-lines: exactly one spear-take beat
("You take a spear. Three waves. No rest.") — no doubled beats, no
second announcement. The fiction reads honestly: the contest already
announces the take in its bespoke note, and the L1 learning lands through
the same `noteGearHandled` path as picking up and wielding any other
weapon, so there is no new "the System explains" beat to read. The
wild-beat run's narrative surface is unchanged (same say-lines as
before-arm); only the codex gained the recipe.

## Metric review

1. **already-known conditioning held**: 5 runs reached the planted beat
   with hunting_spear already L1+ (s65103 both arms both policies — natural
   learning via the loot→equip game.js path, identical on both arms; s65108
   leadfeast-after — the wild contest-grant described above). Conditioning
   on preBeat===0 kept the primary exact; none were re-scored.
2. **Det-gate tolerance vs the wild beat**: the permitted-divergence rule
   (spear-only knowledge diffs at day ≥30, after-arm strictly higher) is a
   proxy for the planted beat. The s65108 wild grant landed on day 29→30
   and was absorbed by the same rule — correctly, since the diff is the
   mechanism's own footprint, but a future sweep should distinguish
   natural vs planted beats (e.g. record the planted beat's day per run)
   so a pre-day-30 natural grant can't silently hide inside the tolerance.
   None occurred this run.
3. **check.js --quick**: the 4 failures match the pre-existing set
   documented 2026-10-20 (253 passed / 4 failed). The phone-frame proof's
   "retained browser input matches current source" lists ~19 stale files
   (index.html, game.js, membership.js, progression.js, …) — verified
   persisting with contests.js reverted to HEAD, i.e. pre-existing
   receipt staleness from sibling landings, not this change. No new
   failures introduced.
4. **Corpus size**: 8 seeds/policy is the screening floor per throughput
   rules; combined with the deterministic fixture proof, it is sufficient
   for this one-line mechanism repair. A 12–16-seed confirm is not
   warranted — the effect is a mechanism presence/absence, not a rate.

## Convergence note

Backlog #698 is **converged (canon-repair, not a lever)**: one surgical
engine hunk restores the gear-discovery canon across all four contest
grant sites; fixture RED→GREEN; 32-run corpus GO with zero behavioral
drift; first wild specimen observed. No [needs-eyes] — no feel/combat/UI
change, just the canon's promised teach firing where equipping already
fired. Landed as one commit; killed nothing else.
