# Journey leg 3 (scale) — run note (2026-10-12)

**Leg**: scale (days 80–140: regional → national → global → table approach) · **Run**: scale3
**Base**: `b98c4a53` (journey deepening r7) · **run_id**: 2026-10-12T19:10:00+00:00 · rotation advanced 3→4.
**Harness**: `scripts/journey-scale3-20261012.js` (new: scalecourt policy + deepening-lineage
fight/contest drivers, scale checkpoints at 40/60/80/100/120/140, scale-beat text capture,
day 85/105/125 conversations, census) + `scripts/probe-link-lifecycle-20261012.js` (link trace tool).
**Canon**: SCALE.md, TABLE.md, CONVERSATIONS.md read. No canon changes.
**Seeds**: 50001 (pilot), 10101, 20202 (deepening-r7's long runners), 50002, 50003.

## The blank filled: peer links forgot broken tables

Observed in seed 20202: Emberhold's subordinate link snapped on day 65 — narrated aloud
and well ("🕯️ David is dead — and the dead hold no treaties... In the chaos, the neglected
link snaps — no tribute, no deeds, no one left who kept it. Nobody meant it. That's how
these things go."). On day 91 the representative walked back in and formed a COVENANT
with Emberhold, and the game said nothing about the break: "The relationship starts at
trust 30" as if the table never broke. The primary/subordinate path remembers broken
links ("DEBTS SURVIVE THE BREAK", hierarchy.js ~553), but `_formPeerLink` formed with
amnesia. Verified via the link-lifecycle probe: the d65 break was real and aloud; the
d91 covenant's "one organization, one link" guard passed only because the old link was
broken — no double-link bug.

**Fix** (`src/js/hierarchy.js`, `_formPeerLink`, +32 lines): after formation, scan for the
latest broken link with the same unordered pair (any kind) and say one memory line aloud
+ a history note: "Nobody says the last table was nothing. It broke 26 days ago — Emma
walks back in anyway. That's the thing about fires: they can be relit." No balance
change — trust still starts at 30. Symmetric follow-up noted (not done): `_formLink`
re-forming after a broken *peer* link has no memory line either.

**Proof**: `scripts/test-peer-rekindle-20261012.js` — 12 checks ×3 seeds, ALL GREEN;
RED-verified against pristine HEAD (the 5 memory-line checks fail without the fix, pass
with it). Regressions: test-hierarchy (40/42), hierarchy-break (crash), national-shapes
(3 fail), scale-ladder (24 fail), scale-pacing (GREEN) — **all failures identical on
pristine HEAD** (pre-existing, not from this fix). Ontology: 85/85 valid.

## What the leg looks like from a competent player's seat

Five seeds, scalecourt policy (courts the ladder aggressively — proposes daily; a real
player would propose less often, so treat proposal counts as a ceiling probe):

| seed | lived | final scale | regional day | national | table seat |
|------|-------|-------------|--------------|----------|------------|
| 50001 | d33 | village | — | — | none |
| 50003 | d12 | village | — | — | none |
| 10101 | d70 | regional | d47 | no | none |
| 50002 | d114 | regional | d47 | no | none |
| 20202 | d117 | regional | d47 | **4 days short** | none (foodDeeds only) |

- **Regional is reachable.** All three surviving runs hit the Regional Dawn at day 47 —
  the 21-day seasoning gate works exactly as designed (first link ~d26, Dawn at +21).
  The Dawn copy is good ("One fire was a village. Two fires is a NETWORK... Try not to
  starve twice as fast.").
- **National is at the edge.** 20202 (the good run) reached 2/3 age-seasoned covenant
  links by death at d117; the third (Emberhold, formed d91) needed until d121. The
  village died 4 days short of the covenant road. Of 49 peer proposals, 45 were refused
  ("barely know" — opinion < 10 gate, canon); 4 formed (3 covenants, 1 trade charter
  with a splinter village, The Bloodied). Courtship is a real climb, not a handshake.
- **Global is gated on national** (never reached) — viewership peaked 27 (20202, d100;
  bar is 32). 10101 hit vw 37 at d40 but without national it's moot.
- **The table's lesser seat was ONE DEED away.** 20202 at d100: waves faced 12/10/5
  (need 4/4/3 ✓), 14 contests survived (✓), 3 crises weathered (breach, the-siege,
  first-grave ✓), regional (✓), integration stage 3 (✓) — but `foodDeeds=false`:
  sentimentTaught + feastSurgeUsed never marked. sentimentTaught fires at integration 60
  (verified firing in a probe run — my harness's flee-heavy fight driver slowed
  integration in this playthrough; policy artifact, not a game bug). feastSurgeUsed
  needs a deliberate feast→fight sequence the competent policy never performs. A real
  player who feasts and fights would mark both. Documented, not retuned.

## Village assessment (plain words) — seed 20202, the run that worked

Three people left at day 117 out of twelve. **Marcus** the electrician (bold, trust 90,
lonely, knew 43 plants) — the one holding the village together, asking for pantry-run
help on day 105 while hungry. **James** the carpenter (steady, trust 1, scared, 42
plants) — alive but terrified, trusted nobody. **David** the plumber (cautious, trust
90, steady, 42 plants) — the quiet anchor. They had fought wave-3 monsters blow-by-blow
(5 distinct faced: focus_group, chorus_line, spool, ad_break, redactor), survived 14
televised contests, weathered 3 crises, and built a 3-covenant league that died four
days before it seasoned. The pantry collapsed 37k→10.5k between days 80–100; the last
deaths were combat, then the village was lost. A village that did almost everything
right and still starved mid-ambition — the food wall is the binding constraint
(longsim-food's lane), not the scale mechanics.

## People check (SENSE-TESTING LAW — full transcripts read)

Two full conversations (days 85, 105), both meaningful:
- **Day 85, Jakob** (veterinarian, gentle, trust 90): opens with a real question — "Are
  you going to stay? With us. For real." The gossip thread is thin ("People are saying
  things. About you.") but reads as genuine paranoia, not filler. Want resolved
  `engaged`. Coherent.
- **Day 105, Marcus** (electrician, bold, trust 90, mood=hungry): opens with a real ask —
  "About the pantry run — I still haven't found anyone. Any chance?" Committing gets
  specifics ("The south slope below the meadow, before the dew dries."). Contextually
  perfect against the collapsing pantry. Want resolved `promised`.
- No verbatim repeats, no fabricated shared history, no static menus. Conversations work
  even with a lone survivor (probed separately — not a bug; 50002's empty convo log was
  the harness's comm filter).

## Verdict: REACHABLE / FUN / WINNABLE

- **Reachable**: regional yes (3/3 surviving runs, day 47 on the nose); national at the
  edge of competent play (4 days short on the best run); the lesser table seat one
  food-thesis deed away. Nothing in the scale mechanics is broken or unreachable — the
  wall is food and survival, which is the game's thesis working as designed.
- **Fun**: the beats read well — the Dawn, the break ("Nobody meant it"), the
  rekindling (now), the "Three bonds... seasons not days" narrator. Courtship has real
  friction (opinion gates, climb verbs, declines that bank +1). The one amnesia found
  is fixed.
- **Winnable**: not by the table path in these runs — but the binding constraint is the
  food economy at scale, not scale gating. Filed as evidence for longsim-food.

## Tooling notes

- `scripts/journey-scale3-20261012.js`: new scale-leg harness (reusable; scalecourt +
  checkpoint/beat/census instrumentation). One harness bug fixed mid-run: checkpoint
  read `state.pg.crises` — progState lives on `state.scholar.prog` (tableSeat's own
  reads were always correct).
- `scripts/probe-link-lifecycle-20261012.js`: link birth/change/break tracer; how the
  Emberhold d65 break was verified aloud.
- `scripts/test-peer-rekindle-20261012.js`: proof test for the fix (12×3, RED-verified).

## For other loops

- longsim-food: the scale-leg food wall confirmed — villages that survive combat die of
  pantry collapse days 80–117; 20202's 37k→10.5k slide is the cleanest specimen.
- scale-lever owners: test-scale-ladder has 24 pre-existing failures on current master
  (identical pristine); worth a look independent of this run.
- The 49-proposal courtship is a harness ceiling probe, not a player model.
