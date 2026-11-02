# sim-titanghost-a — preregistration: TITAN GHOST STOP + MUSTER-HUNGER LEGIBILITY (GAME CODE, titans.js only)

- Run: fleshout-loop-a-20261102T0250Z (Loop A, axis scale-onramp).
- Worker branch: sim-titanghost-a. Base at prereg commit: master tip
  9da23adc5 (docs: Loop A 0045Z coordinator evidence). The worktree
  was cut at 56a8172f0; master moved by exactly that one docs-only
  commit before work started, so the branch was fast-forwarded to
  9da23adc5 (no local commits to replay, no conflicts, tree clean).
  This file is committed BEFORE any judged sim in this arm. Judged
  exactly against this header; a miss is NO-GO, never re-scored
  against a friendlier metric mid-run (MEASUREMENT.md §14). Every
  evidence file carries a "metric review" section.
- Scope: src/js/titans.js ONLY, plus tests/instruments/evidence.
  EXPLICITLY OUT OF SCOPE — NOT BUILT: heraldkill Layer 2
  (re-placement rule, kill-gating, slain credit — a design call for
  Steve, not a worker default). No gates, stages, deed bars, win
  prices, or anything from the #1538 steve-call queue touched.
- Both game-code commits carry [needs-eyes] (player-visible
  behavior/narration changes).

## Canon read before sims

- docs/CANON.md (manifest) + docs/SCALE.md + docs/SCALE-DISCOVERY.md
  (scale ladder; the titan road is the scale ladder's threat side).
- NO titan-specific canon doc exists in docs/. Governing source is
  the in-code design header of src/js/titans.js (titan class,
  no-solo-titans hard gate, coalition warfare, "an army marches on
  its stomach") plus the two delivery specs that motivate this arm:
  evidence/2026-11-01/sim-heraldkill-a.md ("Delivery spec", Layer 1
  ONLY) and evidence/2026-11-01/sim-trustbleed-a.md ("Delivery spec
  for a future arm", items 1–2 — item 1 is built here as B2; item 2,
  pantry-fed upkeep, is NOT built here). Nothing here invents canon.

## B1 — LAYER-1 GHOST STOP (pure correctness)

Change (titans.js only): a new presence helper — a titan counts as
present when any world monster carries its def.monster id, or (for
campaign titans) any of its def.campaign.nodes ids. Then:
(a) titanEscalate returns early when the titan is absent (no pantry
feed, no allied strike); (b) soundTitanCall says the nothing-located
line — exactly "There is nothing located to march against — the sky
is quiet. You commit no one into the dark." (the line titanCommitOwn
already uses for stage < 2) — and returns null WITHOUT creating a
muster, when the titan is absent; (c) titanCommitOwn refuses with
that same line when the titan is absent (slain-first ordering kept:
a slain titan still says "already dead"; a pending commit for an
absent titan lapses, not sends).

Stack (named exactly; numbers NEVER pooled across stacks/bases):
substrate scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1) + recorders reused UNMODIFIED: fullseat-diag
(FULLSEAT=1), wavegate-diag (WAVEGATE=1). Instrument: new
scripts/sim-titanghost-a-probe.js (same policy chain as the
heraldkill probe, NO heraldarr2 capture; throwaway processes that
never continue a run after calling — probe calls cannot contaminate
any judged timeline). Horizon: DAYS=180, death-aware. Kill seeds
(from the heraldkill arm, kill day in parens): 95402 (d169),
95433 (d133), 95438 (d155), 95439 (d147), 95440 (d143).
Baseline expectation (heraldkill evidence, to be re-measured, not
assumed): 26 phantom Herald escalation lines total (per seed
2 / 4 / 6 / 6 / 8), call forms a muster on 5/5, commit passes on
4/5 (95439: empty volunteer pool, not gated).

B1 GO bars (ALL must hold; pilot = this band, no separate confirm —
the band IS the heraldkill kill band, and a killed sub-change leaves
no trace):
1. Phantom Herald escalation lines post-kill (say lines naming THE
   HERALD with "fed in the night" / "struck … in the night", day >
   kill day): before 26 total → after 0 total AND 0 on every seed.
2. Musters formed against the absent titan (probe call + both commit
   taps after the full run): after 0/5 — call returns null, no
   muster object created, commit returns null on both taps, Haven
   blades 0 on all 5 seeds.
3. Upkeep charged after the probe call/commit (pack-kcal delta across
   one fresh-day titanMusterUpkeep call, herald muster only): after
   0 kcal on all 5 seeds (before: >0 wherever a muster formed).
4. GUARDRAIL — present-titan controls (Herald alive at end, omen
   stage 2, per heraldkill evidence): 95423 (Herald present (3,4),
   killed villagers d174–175) and 95413 (present (4,4)). Same probe
   script, same seeds: call return, commit returns, muster blades,
   and upkeep charged must be BYTE-IDENTICAL before vs after. Any
   difference is a B1 NO-GO until explained — the presence check
   must be neutral when the titan is present.
5. Unit proof test green: scripts/test-titanghost-a.js B1 cases
   (absent-titan escalation silent, call null + no muster, commit
   null + no blades; present-titan escalation/call/commit unchanged).
B1 verdict: GO iff bars 1–5 all hold. Otherwise NO-GO, sub-change
reverted before commit, nothing to merge for B1.

## B2 — MUSTER-HUNGER LEGIBILITY (narration only, NO balance change)

Change (titans.js only, on top of B1): (a) the hunger say line
states the trust price — the exact phrase "trust −2 per fire per
day" — on hunger days where allied links are charged; (b)
titanMusterUpkeep writes one link.history entry per charged link
per hunger day: kind `muster-hunger`, amount −2, note naming the
hunger. The −2/link/day itself MUST NOT change (direct assignment
kept, same loop, same guard, same cap).

Stack (named exactly): the trustbleed intervened twin — script
scripts/trustbleed-replay-20261101.js reused UNMODIFIED, env
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1, MODE=intervene, SEEDS=90111,
DAYS=180. Before run on B1 code, after run on B1+B2 code (identical
seeds/stack isolate B2). Trustbleed evidence baseline (to be
re-measured, not assumed): call sounded day 72, hunger days 73–107
(35 days), 55 link-days × −2 = −110, all links broken day 103,
village lost day 107.

B2 GO bars (ALL must hold):
1. Hunger-day set identical before vs after (same call day, same
   hunger days; the before run defines the set).
2. History attribution from the daily history stream (the replay
   captures each day's new entries; the end-state 40-entry cap is
   a display limit, so the stream — not the final window — is the
   judge): on the after run, for EVERY hunger day, EVERY mustered
   link gains exactly one new entry that day with kind
   `muster-hunger` and amount −2; total hunger deltas = −2 ×
   entry count; 0 hunger days with a missing entry; 0
   muster-hunger entries on non-hunger days. Before run: 0
   muster-hunger entries (the channel is blank, as documented).
3. Price line: on the after run, every hunger day's hunger say
   line contains "trust −2 per fire per day".
4. NO balance change: per-link daily trust series (replay census)
   BYTE-IDENTICAL before vs after; end fields identical (village
   lost day, links-broken day, end rank/wave). The only deltas
   between runs may be say text and link.history entries.
5. Unit proof test green: test-titanghost-a.js B2 cases (hunger
   day writes one −2 entry per charged link; fed day writes none;
   trust math identical with/without the entry write).
B2 verdict: GO iff bars 1–5 all hold. Otherwise NO-GO, reverted
before commit.

## Balanced panel (§15) — guardrail context, never verdict

One panel campaign per code state (base = prereg-commit code, lever
= B1 code), single policy `competent`, seeds 95423,95413, days 180:
`node scripts/balance-panel.js --out <dir> --policies competent
--seeds 95423,95413 --days 180 --par 4`, then the documented
compare; the compare .md is attached to the evidence file. Panel
numbers are CONTEXT (its substrate differs from both judged stacks)
and never override the prereg bars above. If the panel refuses or
fails, that refusal is reported honestly and the probe byte-compare
(guardrail bar 4) stands as the neutrality evidence — no compare is
fabricated. B2 needs no panel: bar 4 (byte-identical trust series)
is its neutrality proof.

## Loop metrics reported (where the instruments can see them)

From the probe runs: endReason, scholar day, scale rank, wave reach
per seed; won/national/table from end fields where the probe can
read them. Death-cause shares are NOT in the probe instrument and
are reported from the heraldkill corpus (before) with that limit
stated, not invented for the after runs. Panel totals (if built)
add the panel's death/won/national counts as context.

## Sense test (SENSE-TESTING LAW)

Probe call-window lines and hunger lines are read in the evidence
file for meaning (does the nothing-located line read as an honest
refusal? does the hunger line now state its price in words a
player can act on?), not just counted.

## Metric review

(To be filled at evidence time. Doubts about any bar go here and
apply to the NEXT run, never to this run's verdict.)
