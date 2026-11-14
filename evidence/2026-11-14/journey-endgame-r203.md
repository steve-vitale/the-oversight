# Journey endgame r203 — run note (Lane B, 2026-11-14)

Leg 4 (endgame). Rotation-b read 4 at run start (r202 succession landed
f524932d6, rotation 7->4). This run plays leg 4 and writes 5, social life,
at closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Substrate: master 723c53571 EXACTLY (worktree HEAD at registration).
Probe: scripts/probe-endgame-r203-20261114.js (r198 probe verbatim EXCEPT
renames r198->r203, evidence dir, header). Analyzer:
scripts/analyze-endgame-r203-20261114.js (r198 analyzer verbatim EXCEPT
input dir, r198->r203 — INCLUDING the r199 one-line M23 fix,
`capNoRefusal` without `&& x.delivered`). Dark probe:
scripts/probe-darktable-r203-20261114.js (r198 dark probe verbatim EXCEPT
renames + outdir). COMPETENT_PIN=r127 support already in the tree. NO
A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

Full prereg: evidence/2026-11-14/journey-endgame-r203-prereg.md (written
before any scored seed; questions Q1–Q13, bindings, metric review stubs).

## Run history — three attempts, one run

- **Attempt 1 (11:00 CST run, lock 1655Z): TIMED OUT at 3600s.** Pass A
  5/5 RC0, analyzer ALL GO. Pass B ~3/5 done, pass C not started. Branch
  commits 7169eb383 (prereg + instruments + proof tests) + 8f4b4863d
  (mixed-proof rename fix). Registration attempt #1 killed by `timeout
  600` mid-checkout (box load ~20); retry #2 detached, heartbeat loop
  started. Flap ongoing during the run (registration timeout + clobber
  repaired, tmp+mv used); flap watcher showed ALL-OK 17:54–17:56Z.
- **Attempt 2 (12:00 CST run, lock 1810Z): TIMED OUT at 3600s.**
  Stale-lock recovery, chain2 launched (journey-endgame-r203-chain2.sh):
  pass B remainder (89705), pass C (5 seeds), pass C-wide (8 fresh seeds
  89714–89721), dark probe, analyzers B/C/C-wide. Chain2 log ends
  "CHAIN2 END 2026-11-14T18:55:47Z" — all sim work COMPLETE. Died before
  dark verification, telemetry check, run note, commit/merge, rotation,
  lock deletion. Heartbeat last 18:53:19Z.
- **Attempt 3 (THIS run, 14:00 CST occurrence, lock 1957Z): adoption
  closeout.** Stale-lock recovery: old lock
  `oversight-playtest-loop-2-20261114T1810Z` (created 18:09:07Z) deleted —
  registry heartbeat for journey2-endgame 18:53:19Z, 62 min stale at the
  19:55Z check (>15 min = dead per the guard), no file writes under 15
  min old in the adopted tree, no live process. Own lock
  `oversight-playtest-loop-2-20261114T1957Z` created; heartbeat loop
  journey2-endgame-hbloop-r203-adopt3.sh started, readback verified
  20:01:23Z. Main tree clean at pre-flight (HEAD 62dd6d36f), disk 41%.
  No sims re-run — all passes were already on disk; this run verified,
  adjudicated, and closed out.

## Verdicts by pass (analyzer headline)

| Pass | Analyzer | Headline |
|---|---|---|
| A (matched, no capstone/buyout) | RC0 | PRIMARY-BINDINGS GO \| PRIMARY GO \| ALL GO |
| B (capstone + buyout) | RC1 | PRIMARY-BINDINGS NO-GO — sole failure M23 VACUOUS |
| C (capstone + buyout + early) | RC0 | PRIMARY-BINDINGS GO \| PRIMARY GO \| ALL GO |
| C-wide (8 fresh seeds, early) | RC1 | PRIMARY-BINDINGS NO-GO — M3b/M4/W5/M5/M23 |
| Dark (7 variants) | — | bit-identical to r198 (see below) |

## Pass A — reproduces r198 in shape (ALL GO)

Per-seed vs r198 pass A (same seeds, same probe policy, only the game
code changed — deltas (a)–(i) in the prereg):

| Seed | r198 sat/seat | r203 sat/seat | w4/w5 r198 | w4/w5 r203 | peakVet |
|---|---|---|---|---|---|
| 89701 waves | d92 lesser | d98 lesser | 8/0 | 5/0 | 1 → 1 |
| 89702 waves | d100 lesser | d100 lesser | 8/0 | 8/0 | 1 → 1 |
| 89703 waves | d90 lesser | d90 lesser | 6/0 | 6/0 | 1 → 1 |
| 89704 forcedrift | d90 lesser | d91 lesser | 8/3 | 8/1 | 2 → 2 |
| 89705 wavesnw | d90 lesser | d90 lesser | 6/5 | 5/0 | 2 → 3 |

Lesser 5/5, full 0/5, won 5/5, all announced d90 — the r198 shape
reproduces exactly. 89702 and 89703 are bit-identical trajectories
(same sat day, same wave counts, same longest fight: 89703's 18-turn
Algorithm d54 vKill). 89701/89704/89705 diverged on wave-5 kill counts
(89705: 5→0, 89704: 3→1) — a spawn-lottery divergence from the
RNG-stream shift under the deltas, not a defect: every binding passes,
and the deed-gate gaps are named per seed (w5 shortfall + capstone
none). No headline difference other than the named deltas. Q1: yes,
modulo the deltas.

## Pass B — NO-GO on M23 VACUOUS only

All bindings GO except M23-capstone, which prints VACUOUS: no pass-B
seed reached deedGateReady().ok && peak>=3. Deed-gate ends: 89701 no
(0w5/global), 89702 no (0w5/global), 89703 no (0w5/global), 89704 no
(1w5/global), 89705 no (0w5/global). The blocking bar on every seed is
wave-5 kills. Per the prereg, VACUOUS means the full-seat question
stays unanswered on this pass — it is not a capstone/table failure: the
capstone was never attempted because the deed gate never opened.
M24/M24b vacuous (no tribute delivery, no scholar+1 seed). M25c
disabled on pass B by design.

**The lost 89705 full seat (Q5, interesting finding).** In r198 pass B,
89705 sat a FULL seat (w5=4, capstone feast_embassy delivered). In r203
pass B it sits lesser with w5=0 and ZERO wave-5 face events — the wave-5
door opened (releaseSnap d57, rd5 ready, 2 living veterans) but no
wave-5 monster ever arrived before the d90 sit. 89704's single wave-5
face came d87 (Cancellation), three days before the sit — too late for
a second kill. This is spawn timing, not wiring: the capstone, the
table, and the deed gate all behave correctly on the seeds that reach
them (see pass C). The matched panel is noisy at n=5 on wave-5 spawns;
the wide band (below) is the better read on reachability.

## Pass C — ALL GO; M23 fix confirmed LIVE on real seeds

M23-capstone GO: 3 eligible, delivered 3/3, none-ready 0, exempt-refused
0, NON-EXEMPT-refused-despite-ready 0, pricedFull 3/3 —
89703:feast_embassy@d87/FULL, 89704:feast_embassy@d69/FULL,
89705:feast_embassy@d76/FULL. **This is the first fresh-panel
confirmation of the r199 M23 fix on live seeds** (prereg Q2) — via pass
C, not pass B as the prereg expected, because pass B never opened the
deed gate. The fix holds: delivered capstones price full, zero
non-exempt refusals.

Full seats SAT 2/5 (89703 d88, 89705 d77); lesser 2/5 (89701, 89702);
89704 is the third delivery — and the finding:

**A full seat that never got sat (Q5, interesting finding).** 89704
earned the full seat d70 (firstFullSeatDay 70, capstone delivered d69)
and then the village DIED d82 — "No one is left to pick up the Codex.
The village dies out — quietly, the way villages do." The last bearer,
Poran Fakir, died in the arena d83. The d53–65 crunch (Jorge/Nikos/
Henrik/Roberto thirst, Rosa Mendez/Omar Farouk starvation, Owen
sickness, Yuki Mori a wound that wouldn't close) is the SAME thirst-led
crunch as r198-c, not buyout-caused (bought d30, pantry 19,837 kcal
after). M23 counts delivery + pricing, which is correct per its
definition — but the "3 full seats on pass C" headline overstates what
a player experiences: only 2/5 actually sat a full seat. A delivered
seat is not a save. (Metric review: ROAD-TALLY should distinguish
earned vs sat.)

Per-seed pass C vs r198 pass C: 89703 bit-identical full (sat d92,
w4=6 w5=2, same 80-turn Rerun d76 vDie); 89705 flipped lesser→full
(r198 w5=0, r203 w5=2, capstone d76); 89704 flipped full-sat→full-then-
lost; 89701 sat d99→d127 lesser; 89702 sat d100→d91 lesser, peakVet
1→3. M25c GO: 5 eligible early-days, 0 skipped, 24 early attempts, 5
bought (d30–42, ~8,000 kcal each). 89703's buyout left the pantry at
1,188 kcal — thin, but the village recovered with zero deaths after.
No 'over' attempts anywhere (§NO-OVER-ATTEMPT holds).

## Pass C-wide — NO-GO; the road stays closed on fresh seeds

Fresh band 89714–89721 (verified fresh per the seed-band skill; named
only in the r198/r199 preregs as reserved, CUT/unused). 0/8 reached
wave 5, 0/8 full seats, all lesser, won 8/8. Peak living veterans 0–1
(spread-peak ≥1: 4/8). M3b-peak NO-GO (peak ≥2: 0/8), M4 NO-GO (0/8
wave-5-or-full), W5-question NO-GO (no uw=5 seed — question unanswered),
M23 VACUOUS (deed gate never ok on any seed; blocking bar wave-5 kills
on all 8). M25c GO: 10 eligible early-days, 0 skipped, 100 early
attempts, 8 bought (d27–90) — the bundle road works on unseen seeds;
the wave-5 bar blocks the full seat on every one. M5 NO-GO is a metric
artifact (see metric review): the fresh band has no forcedrift control
seed, so voicing-canonical cannot be measured there. Everything else GO
(corpus purity 8/8, census, anatomy 76/76, audit crosscheck 8/8).

The wide band is the honest reachability read: a fresh village reaches
wave 5 only rarely, and the wave-4→veterans→wave-5 chain remains the
binding constraint — same regime as r194/r198, not a new collapse.

## Dark probe — bit-identical to r198 (Q7: holds)

All 7 variants re-run (perseed-endgame-r203-dark/). Failed steps r203
vs r198, compared step-for-step: IDENTICAL. v1a-loss:D2-twist-fired is
the ONLY failure ("curdled instead (see curdle step)", curdle documented,
horror hit 5) — the same known step as r171/r178/r182/r185/r188/r194/
r198. v1b/v1c/v2/v3/v4/v5 all pass. v3 names Amelia Moon as sitter
("sitter=Amelia Moon", "walk-out names the sitter: Amelia Moon").
D1–D4/D6 hold. No dark regression from deltas (a)–(i).

## Other prereg questions

- **Q3 §NO-OVER-ATTEMPT:** zero 'over' attempts on every pass. Holds.
- **Q4 §REFUSAL-WINDOW:** no refusals to window on any pass (deed gate
  never opened on pass B; pass C deliveries clean). The
  capstoneRefusalVoicing slice is empty honestly — nothing refused.
  Holds (vacuous).
- **Q6 C-wide:** answered above — bundle road holds, wave-5 bar blocks.
- **Q8 people check:** below.
- **Q9 159-turn Algorithm fight:** did NOT recur. Longest fight in the
  whole r203 corpus: 80 turns (Rerun d76, pass C 89703, vDie) —
  bit-identical to r198's 80-turn Rerun. No fight ≥100 turns anywhere.
  The (b) rage re-press refusal produced no long-fight shape change
  observable in this panel.
- **Q10 fastW4 diedInFight gap:** not recurred (no fastW4 scholar-death
  fight in the corpus). The carried r171 gap stays unobserved.
- **Q11 starvation watch:** ZERO buyout-caused starvation deaths on all
  13 bought seeds (5 pass C + 8 C-wide). 89704-c's 6 thirst/starvation
  deaths are the r198 crunch, not the buyout. 89718-cwide's single
  starvation death (Oscar d74) predates its d90 buyout. The Joja price
  in lives is zero this run.
- **Q12 r198 findings (a)–(d):** (a) SAY repetition, (b) Indispensable
  middle-beats linearization, (d) unmerged Blackberry stacks — not
  re-observed in the sampled windows, still documented/carried. (c)
  doubled quotes RECURS: 89703-c transcript has `📺 SYSTEM: ""Your
  showbiz fans voted you "most watchable human"...` — doubled opening
  quotes. Same artifact as r198; still a carried finding, no fix
  attempted in this run.
- **Q13 fusion-offer delta (d):** ZERO fusion-offer events in the whole
  r203 corpus (telemetry + grantLog searched, all 4 passes + dark).
  The pellet-possession gate and sheet-pending deferral never fired —
  unobserved, not a failure. The delta is unexercised by this panel.

## People check (transcripts read in full)

- **89705 pass C — full seat, feared/pledge (53 SAY lines).** Reads as
  people. The audit names the run ("On day 76, Diana put down Big Big.
  On day 71, Sanne put down Big Ugly — and 4 more teeth after."),
  "The table notes 3 ascensions from one village — its terms improve
  accordingly. Nobody has ever seen that before." The feared pledge
  resolves with a real stance ("humanity's fear is a standing shield,
  never a sword"), the pantheon names Ethan Hunt, Diana Osei, Zoe Adams
  with politics, and the ending is earned: "You won. Say it plainly:
  you won." Personal items (Search locket, Dad's Thermos) frame it.
- **89703 pass C — full seat, indispensable (147 SAY lines).** The
  strongest transcript this run. Looting the dead carries trauma ("Your
  hands know what they did. (+14 trauma)"), "Zoe waits two days at your
  fire, getting thinner. Nobody answers. They walk back to Stonebridge
  with nothing. They'll remember the silence." — an unanswered thread
  with a real consequence. "That night, they bring Grace home... the
  grave is dug by the fire." The war path names real kills (day 75 you
  put down The Big Thing; day 54 Guizhen put down Loud-Eyes). The
  indispensable negotiation is a real bargain ("You lowball. The table
  blinks — nobody lowballs *them*."). Final choice "Name your price"
  resolves with the ramp intact. "You wait. The light changes. Nothing
  asks anything of you." appears 3× — the game's own ambient wait line,
  flat as a stuck record when it repeats, but a deliberate
  nothing-happens beat, not a dialogue failure.
- **89705 pass B — lesser seat, beloved (61 SAY lines).** The audit
  names the gap in plain words, exactly as M10 requires: "For a full
  seat, the ledger still wants: only 0 of 2 different wave-5 monsters
  faced; no capstone deed delivered (military tribute, trade charter,
  or feast embassy)." The beloved finale lands ("You spend it all — the
  love, the light, the finale slot — on people the cameras never found.
  You name the unfilmed villages. You name the dead."). Minor: Zoe and
  Sanne both say "Huh. Never been this way before." — the same generic
  travel bark from two villagers.
- **Dialogue deltas (a)/(c)/(f)/(g):** not exercised in these windows —
  no HEED warning, no favor thread, no nod-loop in the sampled
  transcripts. Nothing reads broken; the deltas are unproven here, not
  failed. No transcript passage was senseless, robotic, or
  self-contradictory. No stuck helper, no withdrawn offer, no
  roster-fed bond proposal, no verbatim refusal repeat in the sampled
  windows.

## Village assessment (plain words)

Five matched villages, all announced d90, all survived to sit — nobody
died before the table on the matched band. They are strong villages
that stall at the same wall: plenty of food, standing at National,
veterans in the bank (peak 1–3), but wave-5 monsters mostly never show
up. On pass C the early bundle buys them time and three of five get the
full seat offered — and two sit in it. The third (89704) gets the seat
and then dies anyway, because the village was already down to its last
people and the last one fell in the arena. On eight fresh villages the
picture is harsher: half never bank even one living veteran, none sees
a wave-5 monster, and the table offers them all a lesser seat and
nothing more. The villages are alive and competent; the endgame road
past wave 4 is a lottery they mostly lose.

## Telemetry check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
endgame.json --current 'evidence/2026-11-14/perseed-endgame-r203/
*.json' --metrics veterans.unlockedWave,won,peakLivingVeterans`:
**QUIET** (5 files, 3 metrics, no large deviations). Sums: uw 22, won 5,
peakVet 8 vs r188 baseline uw 22, won 4, peakVet 8 — won +1, rest exact.
Same regime. Baseline NOT rolled (same call as r198, whose sums were
uw 22, won 5, peakVet 7).

## Proof tests

All green, RC:0 (evidence/2026-11-14/journey-endgame-r203-proof-tests.log):
test-m23-mixed-r203 9/9, test-m2c-adopted-refs-r203 ALL PASS,
test-corpus-purity-r203 ALL PASS (clean GO + dirty NO-GO with the right
diagnoses), test-competent-pin-r203 6/6, test-m23-revision-r203 (in the
same log run). Re-run after the rebase onto master 62dd6d36f: all 5
green again, RC:0 each (evidence/2026-11-14/journey-endgame-r203-proof-
tests-postrebase.log, POST-REBASE PROOFS END 2026-11-14T20:16:34Z,
42 PASS lines, zero failures).

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- **M23 (REVISED r198, FIXED r199): confirmed live.** Pass C prints GO
  on real seeds (3/3 delivered, priced full). The prereg expected the
  confirmation via pass B; pass B was vacuous instead. No revision to
  the metric — the fix is proven. Note for the next run: pass B alone
  cannot confirm the fix when the deed gate stays shut; the C leg is
  the confirmation vehicle.
- **M23-VACUOUS prints as NO-GO.** The analyzer's PRIMARY line goes
  NO-GO when M23 is vacuous, but the prereg defines vacuous as
  "unanswered", not "failed". Pass B and C-wide are recorded NO-GO per
  the analyzer (binding), but the substance is "question unanswered".
  Propose: the analyzer should print VACUOUS-UNANSWERED distinctly from
  NO-GO-failed in the headline for the next run (analyzer change, not a
  re-score of this run).
- **M5-voicing-canonical on C-wide: artifact.** The fresh band has no
  forcedrift control seed, so M5 cannot be measured there; the analyzer
  prints NO-GO. Propose: M5 vacuous (not NO-GO) on bands without a
  control seed, for the next run.
- **ROAD-TALLY: earned vs sat.** M23 counts delivery + pricing; 89704-c
  shows a delivered full seat can die before the sit. Propose a tally
  line distinguishing full seats earned vs sat, for the next run.
- **§NO-OVER-ATTEMPT + §REFUSAL-WINDOW:** HOLD (both held).
- **M2c adoptedRefs:** HOLD. **CORPUS-PURITY:** HOLD (GO on every pass:
  A 5/5, B 5/5, C 5/5, C-wide 8/8). **M25c buyout-early:** HOLD (GO on
  matched and wide). **M24b:** HOLD (vacuous on every pass — no
  scholar+1 seed fired).

## Verdicts

- **REACHABLE: yes.** The table, the audit, the capstone deliveries, and
  the full seat all fire on live seeds. Three capstones delivered on
  pass C, two sat. The wide band says a fresh village reaches wave 5
  rarely — reachable, not common.
- **FUN: yes.** The finales read as earned, specific, and human — the
  indispensable negotiation, the beloved pledge, the war path naming
  real kills and real dead. The doubled-quotes artifact and the flat
  wait line are blemishes, not breaks.
- **WINNABLE: yes-rarely — same regime as r194/r198.** Matched band:
  2/5 sat a full seat on pass C. Fresh band: 0/8 reach wave 5. The
  wave-4→veterans→wave-5 chain is still the wall; nothing in this run
  moves it. No game change is licensed by this run (evidence-only;
  zero src/js changes on the branch).

## Blanks filled / documented

- Filled: the r203 closeout itself — third adoption completes a run
  that timed out twice. Dark verification, telemetry, and the run note
  are now on disk and landed (see closeout).
- Documented, not fixed: doubled-quotes artifact (r198 finding c,
  recurs); M5-on-wide-band artifact (metric review); the earned-vs-sat
  full-seat gap (metric review); the flat "You wait. The light
  changes." wait line (observation, not a defect claim).

## Closeout (this run)

- Stale-lock recovery + own lock + heartbeat loop: see run history.
  Heartbeat loop journey2-endgame-hbloop-r203-adopt3.sh (pid 3093),
  readback verified 20:01:23Z, re-heartbeating every 5 min.
- Report written: this file.
- Evidence commit: e53021fa4 (pre-rebase; 71 files, 363,414 insertions),
  rebased onto master 62dd6d36f as 5e944dca9 (rebase clean, 3/3 picks,
  no quirk, tree clean).
- Proof tests re-run post-rebase: all 5 green, RC:0 (see Proof tests).
- Closeout commit (this section + post-rebase proof log): see log below;
  branch tip at merge is the merge hash (ff-only, no merge commit).
- `git merge --ff-only journey2-endgame` in the main tree: merged locally,
  pending ship (no bump, no push, no live verification — the ship loop
  owns those). Final merged hash recorded in the memory log 2026-11-14.
- `bash scripts/worktree-release.sh journey2-endgame merged`, worktree
  removed, branch deleted, final reaper sweep: done at closeout.
- Rotation file written 4 -> 5 (social life next): done at closeout.
- Lock deleted at closeout; heartbeat loop killed.
- Main tree verified clean after the merge.

## Files

- evidence/2026-11-14/journey-endgame-r203-prereg.md
- evidence/2026-11-14/journey-endgame-r203.md (this file)
- evidence/2026-11-14/journey-endgame-r203-proof-tests.log
- evidence/2026-11-14/journey-endgame-r203-proof-tests-postrebase.log
  (post-rebase re-run, all 5 green)
- evidence/2026-11-14/journey-endgame-r203-chain.log (attempt 1: pass A
  + pass B partial)
- evidence/2026-11-14/journey-endgame-r203-chain2.log (attempt 2: pass B
  remainder + pass C + C-wide + dark + analyzers; CHAIN2 END
  2026-11-14T18:55:47Z)
- evidence/2026-11-14/journey-endgame-r203-a-analyzer.log (+ .err)
- evidence/2026-11-14/journey-endgame-r203-b-analyzer.log
- evidence/2026-11-14/journey-endgame-r203-c-analyzer.log
- evidence/2026-11-14/journey-endgame-r203-cwide-analyzer.log
- evidence/2026-11-14/journey-endgame-r203-hb.log
- evidence/2026-11-14/perseed-endgame-r203/ (pass A, 5 seeds × json +
  transcript)
- evidence/2026-11-14/perseed-endgame-r203-b/ (pass B, 5 seeds)
- evidence/2026-11-14/perseed-endgame-r203-c/ (pass C, 5 seeds)
- evidence/2026-11-14/perseed-endgame-r203-cwide/ (8 fresh seeds)
- evidence/2026-11-14/perseed-endgame-r203-dark/ (7 variants × json +
  transcript)
- scripts/probe-endgame-r203-20261114.js, scripts/analyze-endgame-r203-
  20261114.js, scripts/probe-darktable-r203-20261114.js
- scripts/test-m23-mixed-r203.js, scripts/test-m23-revision-r203.js,
  scripts/test-m2c-adopted-refs-r203.js, scripts/test-corpus-purity-
  r203.js, scripts/test-competent-pin-r203.js
- journey-endgame-r203-chain.sh, journey-endgame-r203-chain2.sh,
  journey2-endgame-hbloop-r203.sh
