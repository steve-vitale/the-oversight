# Journey social life r179 — RUN NOTE (lane B, leg 5, 2026-11-11 04:00 CST run)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Base: master c3d89858f
(journey-endgame r178 landed). Seeds 43501–43504 (fresh band),
DAY CAP 140, policy journey. Driver
scripts/journey-social-life-r179-20261111.js, analyzer
scripts/analyze-journey-social-r179-20261111.js, helpers
scripts/journey-social-r179-helpers.js (all r172 verbatim except seeds,
OUTDIR, filenames). Prereg:
evidence/2026-11-11/journey-social-life-r179-prereg.md.

## Run-start incidents — READ THIS BEFORE ADOPTING

- **Stale-lock recovery, then stood down on a LIVE adoption.** This
  run's lock replaced r178's adoption lock (2026-11-11T07:57:15Z;
  registry heartbeat 76 min stale at 09:55Z, no live procs found).
  The adoption was in fact ALIVE behind a host EPERM write flap (its
  heartbeat writes were refused, so it looked dead). It committed
  c3d89858f at 09:58:42Z, merged, wrote rotation 5, removed its tree
  ~10:06Z. This run stood down, killed its own redundant gate, stopped
  heartbeating the removed tree, and did NOT touch the adoption's
  branch (fully merged, tip = master HEAD; branch journey2-endgame
  still exists — the adoption never ran `git branch -d`; a later
  closeout may delete it, it is fully merged so the delete is safe).
  LESSON (again): during an active flap, a stale heartbeat is NOT
  proof of death — check for live processes before retiring a run.
- **EPERM write flap active intermittently all morning** (O_EXCL
  refused 09:57–09:58, window 09:59–10:01, refused again ~10:08,
  window opened 10:10:15). Registry atomic writes failing; one fleet
  register (sim-dutyfirst-b2) produced no entry after ~9 min.
  Registration of journey2-social succeeded on the 10:10:15 window
  (register exit=0 at 10:17:44Z). No git writes attempted until a
  probe succeeds; single-success trigger.
- `git pull --ff-only` FAILED (diverging — local master ahead 547 /
  behind 156 of origin; ship loop owns reconciliation). No origin
  merge attempted; landing is local-master only.
- Main tree CLEAN at pre-flight, disk 38%.

## Pre-panel proofs (green on the new base)

- All 8 carried r172 proof tests re-run green in-tree: r172 (M6
  divergence + tallies), narr, coach, coachrepeat, agree, confess,
  confessguard 17/17, confesswrap 4/4.
- Smoke SEED=43501 DAYS=5: exit 0, no errors, wraps installed
  (confrontDoubt + confrontTheft both true), village survived d6
  with 12 alive. confrontEvents 0 at d5 (doubts accumulate over
  days — the panel is the real test).

## Panel — COMPLETE (seeds 43501–43504, DAYCAP 140)

- 43501: village-lost d116, 0 alive, 21 fallen. 43502: lost d54, 0 alive,
  13 fallen. 43503: lost d111, 0 alive, 19 fallen. 43504: lost d68,
  3 alive (scattered), 12 fallen.
- 313 full conversations, 308 transcripts read, 108 villager-initiated
  bond proposals (107 villager / 1 scholar), 39 accepted. Full tallies
  in evidence/2026-11-11/journey-social-life-r179-analysis.txt.

## Verdicts (binding prereg)

- M1 arming motive: GO — 7 plots armed, 7 grievance-linked at arming;
  2 with grievanceTargetToLeader > 0; 1 grievance-holder later leads
  a plot (Doly, 43502: ambushed Gunther d7 sev60, led plot_3 d10).
  NOT a second zero — the B1 trigger investigation is NOT triggered;
  r172's 0-plot panel was a dry panel, not a broken trigger. All 7
  plots armed d7–d16, 0 late (d30+). Accomplices stayed cold
  (ambition/prove motives, grievance 0 — e.g. Benoit ambition 25 on
  two plots); leaders are grievance-driven. The cold-accomplice
  pattern holds.
- M2 villager-initiated bonds: ANSWERED — 108 bond_proposed
  (villager 107 / scholar 1), person 56 (23 accepted), link 52
  (16 accepted), per-initiator person max 4 (cap 8). End bonds
  107 / 49 / 90 / 83. Eighth datapoint with the build live. Engine
  still records NO initiator on end bonds (known).
- M3 invite refusal: REPORTED — party accept 19 / decline 18;
  lure accept 7 / decline 9; bond accept 5 / decline 7.
  Invitations sometimes taken, sometimes refused, both ways.
- M4 sense: GO — 4/4 candidates read as real people. Emma (43501):
  forage pact, pantry nearly bare, gift of an oiled tool. Amina
  (43502): "I wasn't an EMT. I was a Midwife. … I was selling a
  better version of me," then the naming debate. Wanjiru (43503):
  grief for Ursula — "The fire feels smaller without Ursula," reties
  every loose knot for her. Nadia (43504): bond proposal accepted,
  grief for Onni — "Onni always took the burnt piece. Said someone
  had to. I take it now." React shape holds: reactOffered 2173,
  agree 0 / joke 0 / silence 2173; longest 'more' continuer run 4
  (<5). Note: Emma's candidate has the player asking "Why can't I
  do this now?" 5× and getting the same deflection with escalating
  prefixes — player-driven repetition; the "I've told you three
  times now" prefix repeats identically on presses 4–5 (a
  pool-exhaustion nit, not a sense failure; see metric review).
- M5 census guardrail: MET — 2/4 past d100 (d116, d111). Sequence
  now …, 2/4 (r172), 2/4 (r179). A standing survival fact, not
  re-scored.
- M6 gossip-position: GO (gate definition) — 0 naming-beat lines
  emitted beyond radius-1 of Haven; 134 debates kicked, 132 settled.
  Strict on-tile away total 39, reported as the known metric/gate
  definition discrepancy, does NOT fail M6 (prereg).
- M7 dedupe: HOLDS — 47 near-dup flags, all pool-cycle ("we're still
  on X" continuers with different nod suffixes); 0 verbatim-identical
  pairs across the 47 printed flags.
- M8 counter-settle: SETTLED (aligned definition) — 2 links formed
  via a driver settle (43501 d10, 43502 d24), 0 BLOCKED re-raises,
  0 fresh re-links after a settle. 16 proposeLink calls: 2 counter,
  14 direct.
- M9 recap cap: HOLDS — maxPresses 5, 208 presses, 0 offered after
  cap, 0 cap failures.
- M10 coach variation: HOLDS (corrected — see metric review) — 0
  coach-line repeats in the panel (15 coach lines total, verified by
  direct scan of social.transcripts). The analyzer prints FAILS
  because tallyNarrDup counts ALL NARR lines; the 15 verbatim
  repeats are accuseFace lines, not coach lines. The face repeats
  are the B4 job, fixed this run.
- Q11 scattering capture: CONFIRMED — all 4 seeds record scattered /
  hungryDays / aliveEnd; 43504 scattered=true with 3 alive (hungryDays 3).

### Jobs

- B1 M1 SECOND ZERO: NOT TRIGGERED — 7 plots armed. No investigation.
- B2 DOUBLE-CONFESSION GUARD RE-CONFIRMATION: HOLDS — 0 double
  sittings (63 confront events, 11 confessed, 11 single sittings).
  Second panel clean on the guarded base; the item CLOSES.
- B3 MOOTS: 2 across the panel (0/0/1/1) — watch only, not 0.
- B4 FACE-BEAT RECYCLE: REPRODUCED + FIXED — 15 verbatim
  accuseFace repeats, all on seed 43503 (gen_ffww7mv: 'The easy
  manner evaporates' x3 in one sitting; 52 face lines, 15 dup
  sittings). GUARD LANDED: one-face-line-per-sitting in
  src/js/truth.js (confrontWindup: a face line already heard in this
  sitting is suppressed, the r167 coach-guard pattern). Proof:
  scripts/test-journey-social-r179-faceguard.js 9/9 (RED first:
  presses 7–8 recycled faces verbatim, then GREEN). CONFIRM re-run
  on seed 43503 with the guard: 0 face-dup sittings, 0 coach dups,
  0 double confessions; village fate d111 → d104 (guard changes
  outcomes; noted, not claimed as an improvement).

## Village assessment (plain words)

Four villages, all lost. 65 fallen: the wild took 36, monsters 6,
sickness 5, strangers 4, wounds 3, ambush 3, arena 3, starvation 2
(43504), contest 1, combat 1. The social layer is dense and alive —
313 real conversations, bonds passing hand to hand as bearers die
(43501: eleven bearers in 116 days; 43503: eleven in 111 days),
villagers raising village links themselves (52 raises, 16 accepted),
2 moots, 46 feasts, 7 plots armed and sprung (3 escaped, 3 killed,
1 hurt) with the murder cases heard and surfaced. 43504 scattered
with 3 alive after sickness and wounds thinned it — the one village
that didn't die to the wild first. What the villages lack is not
social life but survival: the people talk, bond, grieve, confess —
and then the wild kills them anyway. The social layer does not move
survival, same as r172. The one senseless shape the panel caught —
a villager's face doing the same thing three times in one
interrogation — is now guarded: one face line per sitting, the
second press stays silent.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — conversations, bonds, confessions, moots, feasts
  and plots all fire in wild play on fresh seeds, no harness-only paths.
- FUN: yes — the transcripts read as people (grief for Ursula and
  Onni, lies told for love, naming debates, "Onni always took the
  burnt piece"), and the one joke-breaking shape (face line x3 in
  one sitting) is fixed.
- WINNABLE: UNCHANGED — the social layer does not move survival;
  0/4 villages survived the leg window. Winnability stays with the
  survival chain, not this leg.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- **M10 analyzer conflation**: tallyNarrDup counts every NARR line,
  so its M10 verdict fails on face-beat repeats that are not coach
  lines. Proposal: the analyzer reports coach-verbatim and
  face-verbatim separately; M10 judges coach lines only (its binding
  definition). Judged here on the binding definition, verified by a
  direct scan (15 coach lines, 0 repeats) — HOLDS.
- **M1**: r172's zero was a dry panel (7 arms this run, all early
  d7–d16). No revision; the second-zero trigger investigation stands
  for a future double-zero.
- **M4 Emma candidate**: the "Why can't I do this now?" 5× repeat is
  player-driven, but the "I've told you three times now" prefix
  repeats identically on presses 4–5 — the repeat-prefix pool
  exhausts. Watch item for a future run, not a job: the deflection
  is honest about the repetition, and the sitting still resolves.
- **Telemetry**: l3.* LOUD-disappeared lines explained (the social
  driver never emits l3.* fields; verified 0 occurrences in all 4
  per-seed JSONs). Baseline NOT rolled on a single 4-seed panel.

## Telemetry

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/social.json --current
'evidence/2026-11-11/journey-social-life-r179-4350*.json' --metrics
l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
— 5 LOUD-disappeared lines, all explained (see metric review),
exit 1 on the explained drift only. Baseline NOT rolled.

## Gate

check.js --quick on the worktree tip: **294 passed, 6 failed in 546s**
(log evidence/2026-11-11/journey-social-life-r179-gate.log). All 6
are STANDING failures from the r178 base (r178 gate1 288/12, gate2
292/8): test-measurement-proof-update.js, test-measurement-workflow.js
(retained neutrality proof — the src manifest moved; the
measurement-proof refresh is OWED, see below),
test-mobile-combat-cadence.js, test-occupation-panels.js,
test-phone-frame-proof.js, test-establishment-r20-fixes-20261020.js.
Zero new failures from the truth.js guard; no truth/conversation
test fails. GO on the standing-failures basis.

## Closeout

- Measurement-proof refresh OWED (r175 precedent): the face guard
  changes the src manifest, so the retained neutrality proof does not
  cover this tree. Follow-up: `node scripts/balance-proof-update.js`
  on a fresh neutral panel (balance-panel on the rebased tree) —
  for the next occurrence or the ship loop's adoption, NOT done in
  this run (a balance panel is a 30+ min job; this run's budget was
  spent on the panel + gate).
- Landing: panel + guard + proof test + evidence; one src/js file
  (truth.js, the face guard only).
- Rotation: file read 5 at run start; this run writes 6 (crisis next)
  at closeout.
- Merged locally, pending ship.
