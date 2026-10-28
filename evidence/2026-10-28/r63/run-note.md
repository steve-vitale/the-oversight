# Journey social r63 — THE WILD INVITATION SCORING RUN (lane B, 2026-10-28)

Leg 5 (social life), cycle r63. Follows r62 (B7 fix-scoring GO:
dry 0.266/convo, endDry 0.0%, cold-open baseline 0.56%).

Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout: leg 5's named-next question from r62's metric review
is the wild invitation scoring run, which this run carries.
(Rotation note: r62 advanced 5 -> 6, but the file read 5 again at
this run's start — a later sibling write landed after r62's, the
same clobber class as r59/r60/r61/r62. The file is the authority
and leg 5 carries the named-next question, so this run plays
social again and writes 6 itself at closeout.)

## PRE-REGISTER (written before any r63 seed ran — see prereg.md)

**Leg questions:** (Q1) do the landed tackle-invite character
decisions fire in natural full runs — lure-take rate + character
split, party-probe decision rate? (Q2) dry replication vs r62?
(Q3) cold open vs r62's 0.56%? (Q4) people: 0 fabricated flags,
weak endings <= 1?
**Arms (fresh seeds 5801-5804, smoke 5805 30d, DAYCAP=140,
death-aware):** ALL linger, seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56-r62). Policy is r62's
verbatim EXCEPT two declared driver-only additions (zero src/js):
(a) an npcInviteDecision recording wrap (calls through unchanged,
records every decision, consumes no RNG); (b) a once-a-day party
probe (invite_party picked if offered in a non-seeded deep convo,
after gossip + ans + linger, before the others-steer; probe convos
stay in the dry census, same definition as r62).
**Bindings:** F1 dry-family < 1.0/convo pooled (r62: 0.266);
F2 end-on-dry < 20% pooled (r62: 0.0%); M5 5 sense-reads, 0
fabricated flags, weak <= 1, >= 2 dry-bearing/cold-open, >= 1
party-probe or lure-adjacent read when such material exists;
LURE report-only + interesting-finding rules (>= 10 pooled
decisions AND rate in (0,100) AND visible character split =>
CHARACTER-DECIDES-IN-WILD; 0%/100% on >= 10 => WART; < 10 =>
INSUFFICIENT DATA); PARTY-PROBE report-only (< 5 probe decisions
=> INSUFFICIENT DATA for a probe-only rate); COLD report-only vs
r62's 0.56% (>= 10% => wart, r62's rule carried); D1/D2 census
completeness; G guardrails report-only vs r62; NO-REGRESSION
check.js --quick at the CURRENT base profile (r62's 278/9 not
assumed current).

## VERDICT: CHARACTER-DECIDES-IN-WILD + DRY REPLICATION GO

Both dry bars pass by wide margins on all four seeds individually
as well as pooled, and the wild lure census fires the
pre-registered CHARACTER-DECIDES-IN-WILD rule. The pinned-fixture
win from tackle-invite transfers to plots in natural runs.

- F1: pooled dry-family 0.282/convo (r62: 0.266) — 0.718 under
  the 1.0 bar. Per seed: 0.376 / 0.313 / 0.266 / 0.171 — every
  seed passes F1 alone. The replication holds, not just pooled.
- F2: pooled end-on-dry 0.0% (r62: 0.0%) — ZERO of 1776
  conversations end on a dry line, on any seed. Two consecutive
  blocks, zero dry endings.
- Pool split: ALL remaining dry is dry9 (500/500, 100.0%);
  self3 is 0 again. The residual dry burden is unchanged in
  shape: about one conversation in five still stalls once
  (share with dry 22.6%, r62: 20.0%), always from the run-ledger
  pool, never a self-repeat, never at the end.
- Train-line rate: 0.221/convo (r62: 0.191) — same band.
- LURE: pooled 16 decisions, 6 takes = 37.5% — inside (0,100),
  on >= 10 decisions, with a visible character split (below).
  The pre-registered rule FIRES: CHARACTER-DECIDES-IN-WILD.
- COLD OPEN: pooled 1/1776 = 0.06% (r62: 0.56%) — no wart; the
  single cold open is 5803's Aki d127 (see M5).
- Counter cross-check: transcript dry 500 vs engine counters
  523 (+23, +4.6%). Same class as r62's +3.9% gap
  (closing-sequence lines outside the driver transcript slice);
  named here for the fixing lane, not a verdict input — both
  counts agree on the order of magnitude and neither bar moves
  (engine rate 523/1776 = 0.294/convo, still far under 1.0).

## Lure census: character decides, plots cluster, veto holds

16 lure decisions across just 5 plots (seed, inviter, invitee) —
decisions cluster by plot, so the story unit is smaller than 16:

| plot | asks | takes | vetoes | shape |
|------|------|-------|--------|-------|
| 5801 Violeta -> Adaeze | 7 | 1 (d9) | 5 (d12-16, sick) | took a walk, then fell sick; the veto held her home 5 days running |
| 5803 Aki -> Omar | 3 | 1 (d8) | 0 | dry/escape target, chance 35 |
| 5803 Ivy -> Howard | 1 | 1 (d8) | 0 | dry/lead, affinity 8, chance 57 |
| 5804 Khe -> Nino | 4 | 2 (d11, d12) | 0 | prickly target, chance 25 — still went twice |
| 5804 Willie -> Caroline | 1 | 1 (d25) | 0 | gentle/belong, affinity 60, chance 70 |

- Non-veto rate: 6/11 = 54.5%. With vetoes counted (the veto IS
  a decision): 6/16 = 37.5%.
- Character split, affinity: affinity >= 8 targets 2/2 takes
  (Howard, Caroline); affinity < 8 targets 4/9 takes (Adaeze 1/2,
  Omar 1/3, Nino 2/4). Split in the expected direction, thin at
  the top (only 2 high-affinity decisions) — stated, not hidden.
- Character split, chance band: chance <= 35: 3/7 takes; 36-60:
  2/3; > 60: 1/1. Monotone rising with the character score, as
  a probability should — and the same character at the same
  chance still varies by roll (Adaeze 46: refuse d8, take d9;
  Nino 25: refuse, refuse, take, take). Character sets the odds,
  the roll settles the day. That is the design working, not a
  wall and not a flat roll.
- Sick veto: 5/5 vetoes are one plot re-asking daily while the
  target is feverish. The veto is not a one-off: it holds across
  days until the sickness passes or the plot lapses.
- Zero-plot seed: 5802 ran 141 days with ZERO lure decisions
  despite 45 grievance serves. Grievances do not automatically
  become plots; plot formation is the sparse step, and a seed
  with no plots is data, not a broken instrument (the wrap
  recorded normally on the other three seeds and in smoke).

## Party census: 64 decisions, 54.7% — measured, not barred

The wrap records ALL party decisions, not just probe ones, and
they fire abundantly in the wild: 64 decisions, 35 accepts
(54.7%). No bar was pre-registered for the full party census
(the prereg's party rule covers the probe subset only), so this
is reported descriptively — but the shape corroborates the lure
verdict with a much larger n:

- Chance bands rise monotonically: < 20: 1/5 takes (20%);
  20-49: 10/25 (40%); 50-69: 18/27 (67%); >= 70: 6/7 (86%).
- Temperament: warm/bold 6/10 takes (60%) vs
  prickly/withdrawn 2/9 (22%). Goal 'alone' 1/5 (20%). Bond
  depth >= 1: 3/4. Sick-flagged (-20, not a veto for party):
  3/7.
- The floor holds: the lowest bands still sometimes say yes
  (Zulfadli chance 5 refuses twice, but a chance-16.4 sick
  cautious villager accepts; Nino prickly 33.8 accepts) and the
  highest bands still sometimes say no (Juan warm 70 refuses).
  No band is always or never — the 5-95 clamp is visible in
  the wild, not just the fixture.
- Per seed: 19 / 6 / 18 / 21 decisions. 5802's 6 decisions were
  all accepts (small n, high-trust late run: trust 83/91 on the
  last two) — seed variance, not a band.

## Party probe: INSUFFICIENT DATA for a probe-only rate (design note)

Probe subset: 2 decisions, 1 accept (5801 only: Adaeze d15
decline at chance 37.6 while sick-flagged; Grace d31 accept at
chance 66.2, warm +15). Per the prereg, < 5 probe decisions =>
INSUFFICIENT DATA for a probe-only party rate. The reason is
probe design, not game sparsity: invite_party was offered in
20 conversations across the run, but the probe sits AFTER
gossip + ans + linger in pick priority, so earlier picks
consumed the offer on 18 of those 20 turns — and the 62
non-probe party decisions came through ordinary fallback picks.
The next run that wants a clean probe subset must raise the
probe's priority (or run it as its own conversation); the
current probe is too polite to measure itself. The full party
census above is unaffected — it counts every decision
regardless of which pick issued the invite.

## Full-run results (4 seeds, full horizon, death-aware)

| seed | days | alive | deep2 | convos | dry | dry/convo | shareWith | dry9 | self3 | endDry | coldOpen | train/convo |
|------|------|-------|-------|--------|-----|-----------|-----------|------|-------|--------|----------|-------------|
| 5801 | 141 | 7 | 22 | 444 | 167 | 0.376 | 29.5% | 167 | 0 | 0 | 0/444 | 0.282 |
| 5802 | 141 | 7 | 25 | 444 | 139 | 0.313 | 27.0% | 139 | 0 | 0 | 0/444 | 0.270 |
| 5803 | 142 | 5 | 18 | 444 | 118 | 0.266 | 20.3% | 118 | 0 | 0 | 1/444 | 0.194 |
| 5804 | 142 | 6 | 19 | 444 | 76 | 0.171 | 13.7% | 76 | 0 | 0 | 0/443 | 0.137 |
| POOLED | | 25 | 84 | 1776 | 500 | 0.282 | 22.6% | 500 | 0 | 0 | 1/1776 | 0.221 |

Seeded cracks (all seeds, as r56-r62): 5801 Adaeze<>Somchai
(crack7 false, serve30 true), 5802 Desmond<>Jude (false, true),
5803 pair served within 30d, 5804 Willie<>Caroline (false,
true) — the seeded-crack surface is alive on all seeds. Note:
5804's seeded pair IS the Willie->Caroline lure plot — the
seeded crack and a live lure plot coincide on that seed, which
is why Caroline's affinity (60) is the run's highest.
Same-speaker knack repeats: 0 on all seeds (cross-speaker
retells 2/3/2/2 — circulation only, as r57-r62).

## Village assessment (plain words)

Four villages, same warm player, and this time the invitations
have character. 5801's seven survivors talked cleanly and
watched Violeta ask Adaeze out seven times: Adaeze took one
walk, then fell sick, and the fever held her home for five
straight asks — the veto is not a line, it is a week of staying
by the fire. 5802 is the quiet village: seven survivors, 25 deep
friendships, 45 grievances served, and not one betrayal plot in
141 days — people grumbled without ever luring anyone out.
5803's five survivors carry two plots: Aki asked Omar three
times before Omar went, and Ivy asked Howard once and he went.
5804 is the cleanest-talking village (0.17 dry/convo) and the
most plotted: prickly Nino went twice at a 1-in-4 chance, and
bonded Caroline went at the first ask. What did not change:
on roughly one conversation in five the NPC still stalls once,
always from the run-ledger pool, and one conversation in ~1800
still opens by losing a train of thought nobody offered.

## M5 people: PASS on flags and floor (0 fabricated, 0 weak endings)

5 distinct sense-reads, all endings strong. >= 2 dry-bearing or
cold-open: 4 of 5. >= 1 party-probe or lure-adjacent: 2 probe
reads (the probe material that exists).

- Strong, probe decline: s5801-partyprobe-1-Adaeze d15 — gossip
  about Esmeralda, an honest deflection ("Some doors stay
  closed"), one dry line mid-convo, then the invite ("Come with
  me. I could use you.") refused with a reason ("Not right now.
  I've got my own things to handle."), ending on a recap ("Still
  on the others") and "Catch you later." The refusal engages
  the conversation instead of walling it. This is the same
  Adaeze who later vetoes Violeta's lures while sick — the
  character is continuous across systems.
- Strong, probe accept: s5801-partyprobe-2-Grace d31 — Nino
  gossip, a trade offer, an Esmeralda close-read ("keeps me
  sane... notice if they stopped showing up"), then the invite
  ("I need you on this one. Come on.") accepted in character
  ("...Fine. This had better be worth it."), ending planted
  ("We'll pick this up later."). Substance first, decision
  second, on both probe reads.
- Cold-open wart, strong ending: s5803-coldopen-Aki d127 —
  opens on the train line (senseless, as r62 found), recovers
  via the bridge, then a nonverbal-heavy exchange across a
  language gap (Japanese line, honest partial comprehension,
  "you're fairly sure"), two more dry lines mid-convo, ends
  "This was good. They mean it." Aki is also the villager who
  lured Omar — the cold-open speaker is a plot actor, not a
  random voice.
- Dry-top, strong in character: s5804-dry-1-Zulfadli d137 —
  3 dry9 lines, but the spine is coherent: a flat-voiced
  withdrawn villager invites the player out ("Come get air with
  me. I need to think out loud."), the player accepts, the ridge
  stays quiet ("Sometimes that's the whole point."), and he ends
  it the way he is ("I need to go be quiet for a while."). The
  stalls sit inside a character, not instead of one. This is
  also a player-side ordinary-invitation accept observed in the
  wild (driver fallback pick, not a deliberate accept policy —
  reported as an instance, not a rate).
- Dry-top, strong: s5801-dry-1-Adaeze d41 — 3 dry9 lines around
  real content: an unforgiven Somchai grievance (the seeded
  crack's material, not fabricated history) and the sick row
  ("2 down with a hot angry fever. Nobody says it out loud but
  everyone's counting."), ending "Come back anytime" over a
  comfortable quiet. The dry lines interrupt; they do not
  replace.

0 fabricated-shared-history flags across all 5 reads. Weak
endings 0 (r62: 0) — the floor (weak <= 1) PASSES again.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' still converts, better than r62 —
  unsteered late picks 413 pooled (r62: 297; r61: 399), no-offer
  9.8% (r62: 12.4%). Invitations are reachable too: the invite
  choice surfaced in 20 conversations and produced 64 party
  decisions through ordinary play — the neutral-probe sparsity
  note from tackle-invite's after.md does not survive contact
  with a talkative driver.
- **Fun:** the transcripts are the evidence — Grace's
  reluctant yes, Adaeze's week by the fire, Zulfadli's quiet
  ridge walk all read like people making choices. The fun tax
  is now small: one stall in five conversations, one senseless
  opener in ~1800.
- **Winnable:** not this leg's question; 4/4 villages survived
  to the horizon with social fabric intact (deep2 84 pooled),
  and the villages that talked most (5801/5802, 7 alive each)
  are the ones that lived.

## Guardrails (report-only, vs r62)

no-offer 163/1656 = 9.8% (r62 12.4% — in range, slightly
better); late picks 413 (r62 297 — higher, not a regression:
'others' converts late more often here); deep2 84 (r62 127 —
LOWER, noted not barred: r62's 5702/5704 were 40/47 outliers
and r63's 18-25 range sits inside r62's own per-seed range
(15-47); all four r63 villages survived, so the deep2 gap is
not a survival artifact on this band, but it is the one
guardrail that moved down and the next social run should watch
whether it stays in the 18-25 range); alive 7/7/5/6 (r62
7/8/0/0 — all four villages reach the horizon this block).
No guardrail regression attributable to the probe: convos per
seed are still exactly 444 on three seeds (443 on 5804, one
short on a death-aware tail), and late picks rose.

## Metric review (§14)

- F1: PASS (0.282 < 1.0, pooled and per-seed).
- F2: PASS (0.0% < 20%, pooled and per-seed).
- M5: PASS (0 fabricated flags; weak endings 0 <= 1; 4 of 5
  reads dry-bearing/cold-open, above the >= 2 requirement; 2
  probe reads, meeting the probe-material clause).
- LURE: rule FIRES — CHARACTER-DECIDES-IN-WILD (16 pooled
  decisions >= 10; 37.5% strictly between 0% and 100%; affinity
  split 2/2 vs 4/9 and chance-band monotonicity 3/7, 2/3, 1/1).
  Caveat carried, not hidden: decisions cluster by plot (5
  plots), so the story-level n is 5, and the high-affinity band
  holds only 2 decisions. The rule as written is a
  decision-level rule and it fires; the clustering is the
  reason the next run should not over-read the rate.
- PARTY-PROBE: INSUFFICIENT DATA for a probe-only rate (2
  decisions < 5), exactly as the prereg defines. The full party
  census (64 decisions, 54.7%) is reported descriptively with
  NO bar claimed — the prereg's party rule covers the probe
  subset only, and this run does not retroactively promote the
  full census into a barred verdict. Probe-design note for the
  next run: raise the probe's pick priority or run it as its
  own conversation.
- COLD: reported (pooled 0.06%, per-seed 0/0/1/0); no wart
  (>= 10% rule not fired). r63 becomes the new cold-open
  low-water mark, not a new baseline by declaration — r62's
  0.56% remains the baseline; this block simply sits under it.
- D1/D2: PASS (census + mechanism split + invite census for all
  4 seeds; 5802's zero lure decisions is a complete census of
  an empty set, not a missing seed).
- G: report-only as specified; the deep2 move (127 -> 84) is
  reported as a guardrail observation, not re-scored as a bar.
- NO-REGRESSION: check.js --quick (see CHECK-QUICK section
  below; filled after the suite finishes).
- No bar was re-scored mid-run. The pre-registered
  interesting-finding rules: dry replication GO + lure
  CHARACTER-DECIDES-IN-WILD both fired; cold-open >= 10% did
  NOT fire (0.06%); lure WART (0%/100%) did NOT fire.
- One method note, not a revision: the engine-counter gap is
  +4.6% this block (r62: +3.9%), same direction, same class
  (closing-sequence lines outside the driver transcript slice).
  A future run that needs an exact counter census should
  capture closing-sequence lines in the driver transcript, as
  r62's metric review already noted.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r62's exact set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 84, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates (same
  practice as r57-r62: baseline NOT rolled). l3.bonds and
  dryRate quiet. r63's deep2 (84) sits below r62's (127) but
  inside r62's per-seed range, so the LOUD line is the
  baseline's age, not a movement.

## Regressions

- NO src/js change in this run (driver + analyzer + proof test
  + evidence only), so no game regression is possible from this
  run's files. Tackle-invite itself is a landed fix, scored
  here, not changed here.
- check.js --quick (see CHECK-QUICK section below).

## Files landed (tooling + evidence, zero src/js)

- `scripts/journey-social-r63-20261028.js` (driver: r62 fork +
  npcInviteDecision recording wrap + once-a-day party probe +
  invite census in per-seed JSON + party-probe transcript saves)
- `scripts/analyze-journey-social-r63-funnel-20261028.js`
  (pooled census + invite lines + r62-baseline guardrail lines)
- `scripts/test-journey-social-r63-invite-wrap.js` (wrap proof:
  passthrough + recording + no wrapper RNG, 8/8 PASS before
  seeds ran)
- `evidence/2026-10-28/r63/` (prereg, 4 per-seed JSONs,
  r63-verdicts.json, summaries incl. per-seed invite-decision
  lists, transcripts incl. both party-probe reads, run-note.md)

## Infra notes (for the next run)

- Heartbeat: nohup loop (sleep 540) alive and ticking; registry
  read-backs at 10:08, 10:17, 10:26 UTC all fresh (next tick due
  ~10:35). The 10:08 timestamp at the 10:15 check was the loop's
  first tick still within the 15-min freshness line, not a
  stall — second tick landed 10:17:16 as scheduled.
- Worktree registration was slow (git worktree add + reset
  --hard checkout of the 3.3G tree took ~7 min, sleeping on
  checkout) — not an EPERM flap, just a big tree; the register
  script completed and the registry entry verified by read-back
  before any play.
- Driver: smoke PASS, 4 seeds, flush 0 lost to EPERM flap on
  all flushes. Driver log: goal hidden_files
  journey2-social-r63-driver.log.
- Safe-commit index clobber hit the prereg commit (aed353b30)
  — the known class: commit correct, index showing bogus
  staged deletions after. Repaired via HEAD-blob cacheinfo,
  verified with `git status --short` empty + `git diff HEAD`
  empty + hash-object matches, before any further work. Same
  repair to be verified after the final commit below.
- Rotation-b advanced 5 -> 6 at closeout (crisis next).

## CHECK-QUICK (filled by the recovery run — see recovery note below)

- Command: `node scripts/check.js --quick` (default jobs) on the
  r63 worktree, pre-rebase tree (r63 changes zero src/js).
- Result: 276 passed, 14 failed in 727s. Slowest:
  test-capable-bot-20261014.js 59s,
  godpath/test-trust-observer-neutrality.js 54s,
  test-synergy-stall.js 37s.
- Failures visible in the captured tail: test-sw-audio-cache-20261012.js
  (EPERM copyfile to /tmp — container write-flap artifact, not a
  code failure); an offline-assets copyfile failure (EPERM copying
  sw.js to /tmp — same flap class); test-establishment-r20-fixes-20261020.js
  (a real assertion: racks-full voice gate, next day expected 2
  lines, got 1); plus one further EPERM write failure whose job
  name was cut off by output truncation. The remaining failures
  were not individually captured (output tail only).
- Baseline confirmation (recovery run): the establishment-r20
  failure reproduces IDENTICALLY on pristine main-tree master
  (same assertion, expected 2 got 1) — pre-existing base state,
  not an r63 regression.
- r63 non-execution: r63's committed files (driver, analyzer,
  wrap proof) are not in scripts/green-list.txt (grep 0 hits)
  and not in scripts/godpath/, and r63 changes zero src/js —
  check.js never executes an r63 file, so no check failure is
  attributable to r63 by construction.
- Profile movement vs r62 (278 passed / 9 failed, 287 scripts):
  276/14 over 290 scripts. The base moved 58 commits since
  r62's profile; the increase is base drift + flap artifacts,
  not an r63 regression.
- Post-rebase: the wrap proof re-ran PASS (8/8) on the rebased
  tree. A second full --quick (8 jobs) started post-rebase was
  passing 109/290 with 0 failures when stopped for time under
  contention — interim only, not the recorded profile.
- NO-REGRESSION verdict: HOLDS for r63. The base profile itself
  (14 failures including 1 confirmed pre-existing assertion and
  flap artifacts) is a base-health note for the fixing lane,
  not a run failure.
