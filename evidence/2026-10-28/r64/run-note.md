# Journey social r64 — WILD OUTING SCORING RUN (lane B, 2026-10-28)

Leg 5 (social life). Prereg: `evidence/2026-10-28/r64/prereg.md` (written
by the timed-out r64 attempt before any r64 seed ran; this run executes
that prereg unchanged — seeds 5901–5904, smoke 5905, DAYCAP=140,
death-aware, all linger, seeded-speaker steering ON, zero src/js).
Recovery note: the previous Lane B run (lock 2026-10-28T17:56:55Z,
worktree `journey2-social`, heartbeat last 18:49:57Z) timed out with
only the prereg, the outing wedge, and its 14/14 proof test written.
This run re-ran the proof (14/14 green, again), ran the smoke + 4
seeds, and completes r64. No seed, policy, or bar changed from prereg.

## Pre-flight / infrastructure (loud)

- Overlap guard: previous run's heartbeat was 66 min stale at run start
  (>15 min), so per the guard it was DEAD no matter how fresh the lock
  looked. Stale-lock recovery: old lock deleted, new lock written
  (run 2026-10-28T20:01:00Z), `journey2-social` heartbeated immediately
  and re-heartbeated through the run. The existing worktree was REUSED
  (not deleted, not re-registered) — it holds r64's uncommitted work
  and the duplicate-slug tripwire is doing its job.
- Main tree pre-flight deviation, documented not hidden: `git status`
  showed exactly one dirty file, `docs/ONTOLOGY.md` truncated to 0
  bytes at 18:55Z (container EPERM flap class; HEAD blob 8cafd691…,
  2016 lines, byte-identical to the worktree's intact copy — verified
  by hash). This run did NOT touch, restore, or commit that file
  (main tree is sacred; no git writes there). It was left alone per
  the 2026-10-28 fleet precedent (the same transient was left alone
  through the sim-scale-onramp-round-1736 merge earlier today). Final
  merge must be verified to leave main dirt at exactly that one
  pre-existing file.
- `git pull --ff-only` in main: already up to date (894d86451).
  Disk 19%. No worktree-cap problem (reaper not needed; tree reused).

## VERDICTS (pre-registered bars bind; see Metric review)

- DRY REPLICATION GO — F1 pooled dry-family 0.290/convo (bar < 1.0;
  r63: 0.282), F2 end-on-dry 0.0% (bar < 20%; r63: 0.0%). Every seed
  passes alone (0.291 / 0.315 / 0.284 / 0.270). All remaining dry is
  dry9 (515/515); self3 is 0, as in r62/r63.
- OUTING-PLAYS-IN-WILD — 5 complete outings by the funnel's
  end-state-matched counter, 9 by the deliver log (see counting note
  below). Either count clears the prereg rule (>= 1 complete outing).
  The joint-foraging outing joins dry and invitations as
  scored-in-the-wild. The social leg's next question becomes the
  residual dry9 burden (r63's named-next, still open).
- COLD quiet — cold-open 7/1775 = 0.39% pooled (r62 baseline 0.56%,
  r63 0.06%), far below the carried 10% wart rule.
- M5 PEOPLE PASS — 5 sense-reads (below), 0 fabricated-history flags,
  0 weak endings (bar <= 1), 3 of 5 outing-adjacent.
- D1/D2 census completeness PASS — dry census + mechanism split +
  favor census + outing census reported for all 4 seeds (443–444
  conversations each); no seed with zero instrumented conversations.
- NO-REGRESSION — see CHECK-QUICK section below (filled before commit).

## The outing funnel (the finding)

Pooled, distinct favors (funnel event counts in parentheses where they
differ): 158 favor offers seen, 44 forage_help offers, 44 distinct
accepts (funnel accepts 45 — one duplicate accept event on 5903; the
driver accepts every forage offer it is shown, so the offer→accept
step is driver-driven, NOT a natural acceptance rate and must not be
quoted as one). Of 44 accepted favors: 10 started (22.7%), 9 foraged,
9 talked on the trail, 9 delivered with both shares > 0 and
promiseKept at delivery. Delivered hauls: 990 (Molly), 585 (Thabo),
1640 (Chloe), 2000 + 250 (Stan ×2), 375 + 2610 (Petra ×2), 1255 (Aki),
450 (Rabia) kcal — 9 deliveries, 10,150 kcal into pantries, every one
split about half and half between player and partner.

The funnel thins at exactly one stage: the dawn start. 62
start-blocked attempts, all but 2 with the single reason "Move next to
your partner, on the same side of the Haven door." (the other 2:
"Finish your current outing before starting another" — a legitimate
one-outing-at-a-time guard on 5903). Once started, 9 of 10 outings
reach delivery; the one that didn't (5903, Elif) started, then hit
combat and expired. Seed 5902 is the stark case: 5 accepts, 0 starts,
8 start-blocked attempts — a village where every promised outing died
at dawn.

Honest limit on that number: the dawn wedge crosses the Haven door
once toward the partner's side and re-reads, but it does NOT walk to
the partner's tile. A real player at dawn can walk to their partner;
the wedge cannot, so 22.7% is a wedge-measured start rate, a lower
bound on human playability — not proof the outing is unreachable.
The named next question is partner location at dawn (where do
promised partners actually stand at first light?) and whether a
walk-to-partner step converts the blocked attempts. Do NOT call the
dawn meeting a game wart on this evidence alone.

Forage-leg friction (secondary, not blocking): 16 forage-cell-blocked
attempts on 5903/5904 ("You carry 0 kcal; your partner carries 0
kcal…") plus 4 forage-node-barren — the wedge retries across days
and still delivers, so this is retry noise, not a wall.

## Village assessment (plain words)

All four villages were still standing at day ~142 — none scattered,
none extinct, the scholar alive in all four. But they are thin and
grieving places by then:

- Seed 5901: 5 alive, 12 dead. Two early ambushes (Miguel d18,
  Natnael d20), then the arena took Lucas, Sigrun, and Debbie, aliens
  took Sanne, Molly, Ava, Petra, sickness took Pavel and Stan, and
  Werner died of dehydration. The survivors are close: 36 pairs at
  depth 2+, average trust 90%.
- Seed 5902: 10 alive, 1 dead (Malik, in a contest, d44). The lucky
  village — and the one where no outing ever started. Plenty of
  people, 40 deep pairs, trust 91%, and every promised forage trip
  missed at dawn.
- Seed 5903: 7 alive, 7 dead. The arena dominates here (4 of 7:
  Aubrey, Dale, Diana, Aki — Aki died d134, days after bringing home
  a 1,255-kcal outing). One monster kill (Noah d94), one Sunback
  (Valentin d77), one night death (Mario d136). 43 deep pairs, the
  deepest village of the four.
- Seed 5904: 4 alive, 11 dead — the thinnest. Arena, contests, and
  aliens split the deaths; two villagers died of wounds that
  wouldn't close (Wanjiru, Dante), one of dehydration (Ruby). Rabia,
  who foraged with the player on d36, died in a contest on d121.
  Only 22 deep pairs, trust 81%, the lowest of the four.

Across all four: 141 deep (depth-2+) pairs (r63: 84) — survivors bond
deeper even as villages thin. No cracks anywhere (0 cracks, 0
villager-cracks, 0 friend grievances on all seeds): the social
fabric shows grief in words (see sense reads) but no mechanical
fractures. Moots convened: 0 on all four seeds — under this
all-linger policy nobody seeks a moot, so that is a policy note,
not a moot-system finding.

## People check (M5, full transcripts read)

1. s5901-favoraccept-3-Molly (outing-adjacent, ask+accept): specific
   and warm — "The creek bend, past the treeline, morning, early.
   Bring your pack and your knife." Closes "First light. The pantry's
   counting on us." — and the outing really happened the next day
   (990 kcal, split 450/540). Molly's "Sanne… older than the
   scattering" names a real villager, not invented shared history.
2. s5901-dry-1-Ksenia (dry-bearing, 3 dry9 in 11 turns): the dry
   lines read as human hesitation inside a conversation that still
   works — gossip deflects, then a walk beat ("Fresh tracks — big.
   We go back now. Quietly.") and a warm close ("This was good.
   They mean it."). End-on-dry false.
3. s5901-coldopen-Debbie (cold-open): opens ON a dry line ("lost my
   train of thought") and recovers into real gossip (Sigrun talk,
   "Werner is back") — both named villagers are real on this seed.
   Close plants rather than resolves ("Think about it? I'll be
   around") — loose, not weak.
4. s5902-favoraccept-1-Tomas (outing-adjacent, the 0-start seed):
   the crispest accept in the set ("The meadow edge, west of the
   creek, before the dew dries. Pack light — we move fast") — and
   the outing never started. The promise reads real; the dawn
   meeting is where it dies. No in-game line tells the player why
   Tomas wasn't there; the wedge just records blocked.
5. s5904-favoraccept-1-Rabia (outing-adjacent): "The meadow edge,
   west of the creek, at sunup. Two packs between us." Self-history
   ("Nobody taught me. I watched, I failed, I watched closer") is
   about herself, not an invented past with the player. Warm close.
   (This day-4 favor itself never started; Rabia's completed outing
   came from a later, day-35 favor.)

M5: 5 reads, 0 fabricated-history flags, 0 weak endings. PASS.

Outing lines themselves (Molly d14, verbatim from the log): start
"Molly falls in beside you. 'Two pairs of eyes, twice the ground.
Let us go find the green.'"; forage "Molly holds up their share.
'Look at that — 6× Muscadine Grapes for me, 5× Muscadine Grapes
for you. Same patch, both packs. (540 kcal theirs, 450 kcal
yours.)'"; talk "'This is the part I like. Just us and the
green.'"; deliver "You unload both shares… 990 kcal into the
pantry. You both made the trip and brought the food home." That is
a complete little story in four lines.

## Blanks filled / documented

- FILLED (measured): wild joint-foraging outing — playable on
  pinned fixtures (tackle-outing) now scored in natural runs: it
  plays, end to end, with split hauls and kept promises; bottleneck
  named (dawn adjacency, wedge-measured).
- FILLED (doc blank): docs/CONVERSATIONS.md said joint foraging
  "remains unavailable" in three places — stale since tackle-outing
  (7f0e1dc41). Corrected in this run's commit set (all three
  sentences now exempt joint foraging and cite tackle-outing +
  this r64 wild scoring; snare repair / watch shift / watch handover
  / overnight company stay listed as unimplemented, untouched).
- DOCUMENTED (instrument gap, not a game finding): favorEndStates
  is lossy — only 10 of 44 accepted favors appear in it, including
  only 3 of 5901's 7 delivered outings (Thabo, Stan ×2, Petra-117
  delivered with kept=true but have no end-state record). Any
  completion count built on end-state matching undercounts.

## Metric review (§14 — binds the NEXT run, not this one)

1. completeOutings must be counted from the deliver log, not from
   end-state matching: funnel says 5, deliver log says 9, both with
   split shares and kept=true at delivery. The verdict is unchanged
   either way (>= 1), but the next run must not quote 5 as "outings
   completed" — 9 delivered.
2. Report distinct favors, not accept events: funnel accepts 45
   counts one duplicate event (5903); distinct accepts = 44 =
   forage offers. Offer→accept is driver behavior (accept on sight),
   never a natural rate.
3. Start rate needs a walk-to-partner instrument before any wart
   call: add partner-at-dawn location + an adjacency walk to the
   dawn wedge (or a dedicated dawn probe), then re-measure start
   conversion. Until then, 22.7% is a lower bound.
4. Counter cross-check delta: transcript dry 515 vs engine counter
   516 (seed 5904: 120 vs 121). One line. Bars use the transcript
   census; no verdict impact; watch whether it recurs.
5. Telemetry baseline: NOT rolled (see Telemetry section).

## Guardrails vs r63

noOffer 10.6% (r63 9.8%), latePicks 410 (r63 413), deep2 141
(r63 84), alive 5/10/7/4 (r63 7/7/5/6). Invite census (descriptive,
probe removed): lure 20 decisions / 5 takes (25.0%; r63 16 / 37.5%),
party census 82 / 38 (46.3%; r63 64 / 54.7%). Character-decides
holds in direction on both.

## CHECK-QUICK

`node scripts/check.js --quick` in this worktree at the r64 base:
284 passed, 6 failed in 1884s (log: check-quick-r64.log).
Failures: godpath/test-measurement-proof-update.js ("Proof source
inputs are not current"), godpath/test-measurement-workflow.js
(retained neutrality proof), godpath/test-mobile-combat-cadence.js
(2 sub-assertions), godpath/test-occupation-panels.js (CLI workflow),
godpath/test-phone-frame-proof.js (3 sub-assertions, stale receipt),
test-establishment-r20-fixes-20261020.js (1 racks-voice sub-assertion).
Adjudication: NONE is caused by r64. Zero src/js, zero index.html /
app.js, zero godpath, zero scripts/policies changes in this set.
The proof failures cannot be r64-caused: balance-proof-update's
observerFiles are a fixed list (balance-panel, gear-usage-audit,
lib/*) and its manifest covers src/, scripts/policies/, index.html,
sim-harness, sweep-compare — none in the r64 set — so the proof was
stale at base. The other four are game/UI/proof-staleness areas
r64 never touched. Verdict: 6 pre-existing failures at base, no
regression from r64 (same additions-only precedent as
sim-insideevening-b's 283/7 note).

## CLOSEOUT ADDENDUM (landing run, 2026-10-28 ~22:0x UTC)

The r64 run died after check-quick, before commit: run-note complete
except this section, worktree left dirty. This landing run recovered
it: stale-lock recovery (old lock run 2026-10-28T20:01:00Z had no
registry tree; journey2-social heartbeat 60 min stale at check),
lock replaced 2026-10-28T22:06:44Z, existing journey2-social tree
reused (duplicate-slug tripwire) and heartbeated, wedge proof
re-run 14/14 green, evidence JSONs re-validated (all parse;
verdicts match run-note: 5901 alive 5 / deep2 36 / dry 0.2905).
Telemetry tool re-run: exactly one LOUD line, l3.deep2 baseline 0
-> current 144 (n=5 files incl. smoke) — the same baseline-predates-
key artifact r63 already classified; baseline NOT rolled.
Main-tree deviation unchanged from r64's run: docs/ONTOLOGY.md
still truncated to 0 bytes (EPERM-flap transient, HEAD blob intact,
worktree copy intact); untouched by this run, merge verification
recorded in the run log. This closeout advances rotation-b 5 -> 6,
executing r64's prereg intent.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate) after evidence written. The tool accepts
one current file per invocation, so a single-file run misleads
(baseline 318 is pooled; one seed's bonds = 68). Pooled current
values from the analyzer: l3.bonds 327 (108+65+86+68) vs baseline
318 (+3%, quiet); l3.deep2 141 vs baseline key deepBonds 168 —
different key, the same schema artifact r63 already classified
(baseline predates the deep2 key; r63's LOUD line, not rolled);
dryRate 0.290 vs baseline 0 (stale placeholder; r62/r63 pooled dry
was 0.27–0.28, so the baseline never reflected dry reality).
Verdict: no real deviation; baseline NOT rolled. The deep2
cross-run rise (84 → 141) is plausibly policy-caused (favor accepts
+ shared outings build bonds) and is reported, not chased — if the
next social run holds deep2 high on a no-outing policy, revisit.

## Run inventory

- Driver: scripts/journey-social-r64-20261028.js (r64 attempt's
  fork, unchanged by this run) + wedge
  scripts/journey-social-r64-outing-wedge.js + proof
  scripts/test-journey-social-r64-outing-wedge.js (14/14, re-run
  this run).
- Analyzer: scripts/analyze-journey-social-r64-funnel-20261028.js.
- Evidence: evidence/2026-10-28/r64/ (prereg, run-note, 4 per-seed
  JSONs + smoke 5905 JSON, r64-verdicts.json, summaries/,
  transcripts/). Smoke 5905 (30d) is NOT in pooled bars; it passed
  its self-test and itself completed an outing (Austin, 320 kcal
  split 160/160) — consistent with, not counted toward, the verdict.
- Zero src/js changes. Zero game changes. This run is measurement.
