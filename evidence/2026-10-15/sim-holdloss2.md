# sim-holdloss2 — national-hold loss-mode census R5 (2026-10-15)

Worktree: `~/workspace/worktrees/sim-holdloss2`. Run: oversight-flesh-out-loop
(run fleshout-a-2026-10-15T151641Z), diagnostic arm on the scale-onramp axis
(standing scale directive). Assignment: re-run the national-hold loss census
on current master after THREE levers landed post-r4: SUCCGRACE (sub-bar-link
answerable renegotiation beat, hierarchy.js), TRIBFLOOR (tribute never below
the 2-day pantry floor, policy layer), RAIDDENSITY (7-day post-raid cooldown
on young nationals, game.js + hierarchy.js + villageAgency.js). Question: what
kills young nationals NOW? Has the r4 loss-mode distribution
{succession-chain 2/3, other-named 1/3} moved?

Canon: docs/CANON.md (read first), docs/SCALE.md (the six roads, beats,
national-as-live-state). No canon doc covers hold-loss attribution — the
taxonomy is this arm's instrument, not canon. Instrument-only assignment:
ZERO src/js changes (verified below).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** on the current tip with all three post-r4 levers armed, when a
national-reaching run loses the hold, HOW? Name every loss: combat / monster /
sickness / starvation / wounds / succession-chain / wave-unlock / other-named-
with-trail. Grace-mediated succession shocks (the SUCCGRACE renegotiation
staging/expiry) count as succession-context; the count of grace-mediated beats
(graceBeats) is reported in the evidence.

**DIAGNOSTIC GO (binding):** ≥90% of national-reaching runs' LOSSES attributed
to one of the 7 specific named modes. "other-named" counts AGAINST the 90%
(it is the honest remainder, not an attribution) — the trail must be
preserved, never silently bucketed. Held-to-end runs have no loss and sit
outside the denominator.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1
asserted up front in proof AND sweep (#312 lesson: assert all four). Policies
imported from scripts/policies/tribfloor.js (same ids as feastscale, layer
delegates byte-identically when off — tribfloor.layerOn() asserted in the
sweep). Trajectories differ from r4 BY CONSTRUCTION (the levers change the
game); the r4 comparison is DIRECTIONAL context only, NOT a GO criterion
(sim-findings #247: cross-run baselines drift).

**Horizon + why:** 180d death-aware. National reaches peak around d77–150
and the hold question needs the post-reach months; a shorter horizon would
truncate the holds being measured.

**Instrument:** scripts/holdloss-lib-20261015.js (r4 classifier, extended in
place r5 for the SUCCGRACE beat text — SUCC_BEAT now also matches "the bond
is fraying", "grief delays the verdict", "the silence answered"; graceBeats
counted separately in succession-chain evidence). Loss window = 20d ending on
the loss day (finalDay+1 for village-death losses). Priority: wave-unlock
(unlock ±10d + combat/monster deaths plural) → succession-chain (≥3
succession beats ±14d) → family plurality (≥40%) → other-named WITH the full
trail. No game-code changes — the lib is a pure classifier on persisted
records.

**Proof:** scripts/test-holdloss2-20261015.js — 19/19 GREEN, including REAL-RED
(the r4 regex demonstrably cannot see a grace-mediated chain; the extended
instrument names it), no-false-positive on silence-adjacent text, r4-fixture
regression (old-style chain still names, graceBeats=0), live-gate assertions
(Game._succGraceGate() and Game._rdOn() true on a real instance), and
trajectory-neutrality (instrument ON vs OFF byte-identical 30d on the r5
substrate). SMOKE green, DETGATE green (D1 gate determinism, D2 ON/OFF
byte-identical 60d).

## Results — the 16-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 (all four
asserted in proof and sweep). Per-seed records:
`evidence/2026-10-15/perseed-holdloss2/`; summary:
`evidence/2026-10-15/sim-holdloss2-runs.json`; sweep log:
`evidence/2026-10-15/sim-holdloss2-sweep.log`.

**DIAGNOSTIC: MISS — 6/7 losses attributed to a specific named mode
(85.7% < 90%).** Per the task's kill protocol for a diagnostic arm and
§14 (a miss is NO-GO, never re-scored): instrument behaved per its
pre-registered spec, evidence only. The single other-named is the
belongfeast-s44 tribute-collapse — fully trailed, mechanism named, and
the most analytically important loss of the run (see narrative 7 and
metric review).

| run | hold | lossDay | loss mode | grace | end |
|---|---|---|---|---|---|
| leadfeast s11 | 34d (d107–140) | 147 | **combat** | 0 | village-lost d147 |
| leadfeast s22 | 77d (d77–153) | 153 | **wave-unlock** | 0 | village-lost d153 |
| leadfeast s33 | 57d (d77–133) | 133 | **succession-chain** | 0 | village-lost d133 |
| leadfeast s44 | 57d (d77–133) | 132 | **combat** | 0 | village-lost d132 |
| leadfeast s55 | 56d (d77–132) | 131 | **succession-chain** | 0 | village-lost d131 |
| belongfeast s44 | 61d (d73–133) | 134 | **other-named** (tribute-collapse, full trail) | 0 | village-lost d146 |
| belongfeast s55 | 33d (d72–104) | 103 | **succession-chain** | 0 | village-lost d103 |

**Loss-mode distribution:** succession-chain 3/7 (43%), combat 2/7 (29%),
wave-unlock 1/7 (14%), other-named 1/7 (14%). vs r4's {succession-chain
2/3 (67%), other-named 1/3 (33%)}: succession-chain is still the modal
NAMED mode but no longer dominant — combat and wave-unlock appear as
plurality modes for the first time (0 in r4). Directional only (#247).

**Hold-duration distribution** (7 national reaches): 61–120d: 2,
31–60d: 5. Median hold ~57d (r4: 72d, n=5).

**Grace beats:** 1 grace beat fired across all 16 runs (leadfeast s11
d101: an unanswered renegotiation beat lapsed aloud — "Seven days of
silence, and the silence answered for Haven" — trust −6, the realm HELD).
Zero grace-mediated beats in any loss window. The three succession-chain
losses all ran on old-style "dead hold no treaties" beats — SUCCGRACE's
staging did not appear in the loss windows (its one firing SAVED the
realm it touched).

**Wall numbers this run:** national 7/16 (leadfeast 5/8, belongfeast 2/8 —
the belong road reached national for the first time on this substrate,
vs 0/8 in r4); table 14/16; wins 0/16; wave-4 14/16, wave-5 7/16; median
survival 130d (max 160d); exiled 0/16.

**Across-suite death vocabulary** (person-kind, all 16 runs, 243 deaths):
combat 126, monster 78, sickness 13, contest 8, wounds 6 ("a wound that
wouldn't close"), ambush 4, lockjaw 2, alien 2, starvation 2, "the
expedition" 1 (→ combat), "Choir Toad" 1 (real monster name → monster).
Starvation collapsed 17 (r4) → 2 — the TRIBFLOOR floor is visibly working:
villages no longer pay themselves into the starvation band.

## Loss narratives (SENSE-TESTING LAW — read, not counted)

All seven attributions were read against their transcript slices. Every one
reads as a real village story — political, specific, consequence-bearing.
Nothing robotic; the beats name people, name the leverage, say the costs
aloud.

**1. leadfeast s11 — combat, village-lost d147 (34d hold, global).**
National d107–140. Wave-5 monsters bled the village white: Nora killed by a
monster d127, three combat deaths d133 (Naran, Ines), Marcus of wounds d132,
roster 3→1, pantry 12d→0. The d127 "dead hold no treaties" beat fired once —
no chain. The village didn't lose its rank to politics; it died fighting with
an empty pantry. The 2/4 combat plurality is honest.

**2. leadfeast s22 — wave-unlock, village-lost d153 (77d hold).**
National d77–153. Wave 5 released d144; nine days later the escalation killed
the village: 11/11 loss-window deaths are combat/monster (4 monster, 7
combat), roster 9→1, pantry 24d→0. The RAIDDENSITY fiction is all over the
transcript — "Watchers at the north treeline see torchlight moving in The
Bloodied II's camp — and it going dark. Whatever was coming, the doubled
watch turned it" — but the cooldown throttles raids, it doesn't stop wave-5
monsters. A real raid still got through d134 (Emberhold, ~1718 kcal). The
unlock gate (±10d + combat/monster plural) fires exactly as designed.

**3. leadfeast s33 — succession-chain, village-lost d133 (57d hold, global).**
National d77–133. Five "dead hold no treaties" beats d115–134 — each funeral
shaking the realm — while the village fought on (8 window deaths: 5 combat,
2 monster, 1 wounds). The polity dissolved on the funerals, not on the war.
The instrument's priority (succession-chain over the combat plurality) is
honest: the rank was lost on the chain.

**4. leadfeast s44 — combat, village-lost d132 (57d hold).**
National d77–133. Wave 5 released d114; d115 took Thabo, Adrian, and Ben in
combat — three in a day — plus Theo to a monster d121 and Raj in combat d122.
Roster 6→3, pantry 17d→0. One succession beat (Thabo), no chain. 4/5 combat
in the window. The village fought the fifth draft and lost the war of
attrition.

**5. leadfeast s55 — succession-chain, village-lost d131 (56d hold, global).**
The purest succession story of the run: the village was WINNING the fights
(killed The Commercial Break and The Anaconda Empress; "WAVE LEDGER — wave
5's bar is full (2/2 — kills only, not near-misses)"), the pantry held 13
days, and the realm still came apart on four funerals d126–132. They could
fight and they could eat; the polity dissolved anyway. 0 grace-mediated —
the old-style beats did it.

**6. belongfeast s55 — succession-chain, village-lost d103 (33d hold).**
National d72–104. Wave 4 unlocked d89 (14d before the loss — outside the
±10d gate, correctly not wave-unlock). Luis dies d86 → "the dead hold no
treaties" → The Hungry Road II installs their own speaker → "Tribute rises
to 11,250 kcal/week. Grief is leverage, and they know it." Vasyl d89, Elif
d99, Xavier d103, Mia d105 — four succession beats, the village dies d103.
The grief-leverage ratchet is the through-line.

**7. belongfeast s44 — other-named (tribute-collapse), village-lost d146
(61d hold).** The run's most important loss. National d73–133, global d125.
Quinn dies d121 → "the dead hold no treaties" → Thornfield installs their
own speaker → "Tribute rises to 25,313 kcal/week. Grief is leverage, and
they know it." d127: TRIBFLOOR fires visibly — "🛡️ The pantry holds about
2 days of food at the current burn — tribute takes 12,645 of 25,313 kcal
and no more. What isn't paid rides as arrears; the village eats first."
Thabo dies d133 → another funeral → "Tribute rises to 37,970 kcal/week"
(×1.5 again — grief compounded). TRIBFLOOR again: "tribute takes 15,520 of
37,970 kcal and no more." Then: "⚠️ Thornfield notices the missing tribute.
Arrears: 37,970 kcal. The air changes." → "◈ The realm came apart." The
village LIVED to d146 (the floor worked — no starvation-by-tribute), but
the polity dissolved on the arrears. The lever moved the failure from
"starve paying" to "dissolve on arrears": a better story, the same lost
rank. The instrument names the mechanism in the evidence
("tribute-collapse: home-link arrears 0 → 37,970 kcal in the 7d before loss
day 134") and keeps the mode other-named per the pre-registered taxonomy.

## Village assessment (plain words)

Seven villages reached national; none held it to the horizon. The leads all
died fighting — wave-5 monsters are the attrition engine now (combat+monster
= 84% of all person-deaths), and the villages that reached national died
with their boots on. The belongs tell the political story: the grief-leverage
tribute ratchet (×1.5 per funeral, compounding: 11,250 → 25,313 → 37,970
kcal/week) is the BELONG road's characteristic killer, and TRIBFLOOR changed
its shape — villages no longer starve paying (starvation 17→2 across the
suite); they survive and lose the polity on arrears instead. SUCCGRACE fired
once in 16 runs and saved the realm it touched; RAIDDENSITY's doubled watch
is everywhere in the transcripts and reads as genuinely political fiction
("Whatever was coming, the doubled watch turned it. The night stays quiet,
and everyone at the fire understands why."). The belong road reached national
2/8 (up from 0/8) — the levers are helping villages survive TO national; the
hold is still the wall. The modal named loss remains succession-chain (3/7),
but combat (2/7) and wave-unlock (1/7) now kill nationals too — the
distribution has genuinely moved from r4's succession-only picture.

## Village assessment (plain words)

(TBD)

## Blanks filled / documented

- **FILLED:** the r5 instrument extension — SUCCGRACE beat recognition in
  scripts/holdloss-lib-20261015.js (extended in place, r4 behavior
  preserved — the r4 proof's 53 checks still pass against the extended lib,
  verified via the F4 regression fixture), scripts/sweep-holdloss2-20261015.js
  (4-flag substrate, tribfloor import, grace/cooldown beat capture for
  narratives), scripts/test-holdloss2-20261015.js (19/19 GREEN).
- **VERIFIED:** zero src/js changes — `git status --short` in the worktree
  shows only scripts/ + evidence/ (checked pre-commit).
- **DOCUMENTED (for the coordinator's findings backlog):** the s44
  tribute-collapse — the BELONG road's grief-leverage ratchet (×1.5/funeral,
  compounding) vs TRIBFLOOR's arrears posting. The village survives (floor
  holds) but the polity dissolves on arrears. Design question, not a bug:
  should compounded grief-leverage have a ceiling, or is the arrears-dissolve
  the intended price? Proposed next-run instrument refinement: promote
  'tribute-collapse' to a named loss mode (clean detector already exists).
- **DOCUMENTED:** the per-seed `-full.json` files persist scaleRows mapped
  to {day, rank, exiled} only — the link-level rows (arrears per link) that
  the arrears-spike detector reads are lost. Next run should persist the
  full scale rows for audit.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply to
the NEXT run)

1. **The MISS is a taxonomy gap, not a bucketing bug.** 6/7 losses named
   (85.7% < 90%); the seventh is the s44 tribute-collapse, which the
   pre-registered B-branch taxonomy deliberately keeps as other-named with
   the mechanism in the evidence ("tribute-collapse: home-link arrears
   0 → 37,970 kcal in the 7d before loss day 134"). The instrument fired
   every detector correctly — no priority was misordered, no beat missed.
   The honest fix is a taxonomy promotion for the NEXT run: 'tribute-
   collapse' as an 8th named mode (detector: the existing arrears-spike;
   it is the BELONG road's characteristic loss in the TRIBFLOOR era).
   Applying it now would be re-scoring against a friendlier rule mid-run —
   refused per §14.
2. **n=7 losses is thin for mode SHARES.** The diagnostic names the
   mechanism on every loss it saw; the distribution {3/7, 2/7, 1/7, 1/7}
   is directional. A follow-up wanting stable shares needs a larger
   national-reaching substrate (leadfeast-heavy seeds, or a design that
   reaches national more often).
3. **The B-branch priority (arrears-spike above deaths-in-3d) is doing
   real work.** In s44, 3 deaths fell within 3d of the loss — the old
   priority would have named succession-chain. The arrears spike is the
   more proximate mechanism (the beats say the realm came apart ON the
   arrears), and the evidence preserves both. Keep the priority; promote
   the mode.
4. **The GO threshold itself is sound.** 90% attribution is achievable —
   the instrument named 6/7 with complete trails on the seventh. No
   revision proposed to the GO.

## Convergence

**DIAGNOSTIC MISS per the letter (85.7% < 90%); instrument extended and
proof-green, evidence only.** The instrument names the loss on 6/7
national-hold losses (3 succession-chain, 2 combat, 1 wave-unlock) plus 1
honest other-named with a complete trail (tribute-collapse). The wall's
hold face has moved since r4: succession-chain is still the modal named
mode (3/7 vs r4's 2/3) but combat and wave-unlock now kill nationals
(0 in r4); the belong road reaches national (2/8 vs 0/8) and loses it to
the grief-leverage→arrears mechanism, not starvation. scale-onramp stays
the blocking axis: wins 0/16, median survival 130d, no hold survived to
the horizon. Named next: (1) promote 'tribute-collapse' to a named mode
in the next run's instrument; (2) the grief-leverage compounding question
(×1.5/funeral with no ceiling) belongs in sim-findings.md as a design
question for the coordinator/Steve — it is the BELONG road's remaining
hold-killer.
