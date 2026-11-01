# journey-scale r66 — Lane A, leg 3 SCALE (2026-11-01)

**Run id:** oversight-playtest-loop-20261101T0445Z (scheduled 04:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
This run's 3 follows the deepening leg's 2→3 write (HEAD is the
deepening r79 commit), so it is queue-correct, not the r61–r64
"still reads 3" anomaly. The write is verified by reading the file
back at closeout.
**Base:** master@7c8745741 at branch creation. **Zero src/js changed
by this run at closeout** — measurement plus one driver, one analyzer
(plus one amendment), one classifier proof test, and evidence.
**Pre-register:** evidence/2026-11-01/journey-scale-r66-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; the instrument reads each villager's own gear /
knowledge / materials plus the camp pile, as the duty itself does).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Heartbeat:** manual heartbeat at registration verified landed
  (registry read-back) plus a 10-minute background heartbeat loop
  for the whole run (log at
  goal hidden_files/journey-scale-r66-heartbeat.log; never stale
  past the 15-minute threshold).
- **Safe-commit index clobber struck on both tooling commits**, same
  class as r56–r65: after each correct private-index commit, the
  worktree's main index showed the committed files staged-as-deleted
  (prereg commit) or staged+worktree-modified (analyzer commit).
  Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` clean apart from expected untracked evidence, `git diff
  HEAD` empty, hash-object matches HEAD. Both commits themselves
  were correct.
- **The r65 duty-file wart is fixed in this driver:** dutyWatch AND
  wsplitWatch are reset per seed in playSeed, so r66's per-seed files
  hold only that seed's rows (r65's duty files were cumulative).

## Why this run is not a parity re-run
`git diff b47d2dc4c..HEAD -- src/js src/data` is EMPTY: zero game
code or data changed since r65's final landing. A straight parity
re-run would be trivially identical, so per the staged methodology
this run's question is the diagnostic r65 explicitly queued (Q1),
with parity checked cheaply as the purity gate. One wrinkle the
prereg did not foresee: r65's committed captures are from its
MEASUREMENT base (pre-rebase), while master now carries the landed
contact-finish rule from r65's rebase — so 85003 was always going to
differ from its committed r65 capture. See the purity-gate section:
the gate fired on 85003, was investigated, and was resolved by a
same-base control run, not by re-scoring.

## Verdicts (binding questions, answered)

### 1. WEAPONLESS-SPLIT: ARMED GATE, IN ITS STRONG FORM — eligible 0/4
Quad totals (pre-tick daily snapshots, home roster only):
villager-days 2,279; knower-days 1,020; armed knowers 1,019;
weaponless days 2 (both seeds below); eligible days 0; attempts
(Cd advances) 0; unexplained non-attempts 0; stick-only knower-days
0; stick-blocked counterfactual days 0.

| seed | villager-days | knower-days | armed knowers | weaponless days | eligible | attempts |
|---|---|---|---|---|---|---|
| 85001 | 164 | 73 | 73 (58 real + 15 both) | 0 | 0 | 0 |
| 85002 | 1,205 | 756 | 756 (all real) | 0 | 0 | 0 |
| 85003 | 423 | 101 | 100 (98 real + 2 both) | 1 (knower) | 0 | 0 |
| 85004 | 487 | 90 | 90 (80 real + 10 both) | 1 (non-knower) | 0 | 0 |

- **The stick hypothesis is REFUTED on this band:** zero
  stick-only knower-days on any seed, zero stick-blocked days. The
  whittled stick does not explain the missing attempts — no knower
  is stick-only-armed in 2,279 villager-days.
- **The armed-knower hypothesis is CONFIRMED in its strong form:**
  1,019 of 1,020 knower-days are armed with a REAL weapon, and
  nearly all of those (929) are armed in BOTH senses at once —
  equipped and carrying a spare in the pack. Knowledge and armament
  coincide by construction: the seeding rule teaches a villager
  from a finished weapon they wear, carry, or stash, and they keep
  what taught them (greedy gear day + armory + departure whittle
  keep the village armed — 85001 and 85002 have ZERO weaponless
  days at all).
- **The single weaponless-knower day is blocked by MATERIALS, not
  by armament:** 85003 day 4, a villager whose hunting_spear sits
  in their own stash (so they know the rung) but who carries no
  weapon, with the camp pile at 0 branch / 0 stone / 0 vine and
  cooldown clear. Early-game empty pile, one day, no attempt —
  exactly what the duty's own gates predict.
- **No bug signal:** with eligible-days 0 and unexplained
  non-attempts 0, there is nothing for the transition rule to
  flag. The duty is not broken and not mis-gated; its eligible
  population is structurally ~empty on the competent scalecourt
  path. A weapon-craft attempt would require a villager to lose a
  weapon they learned from WITHOUT replacing it, while materials
  sit in reach — a sequence this band never produces.
- **Classification (refining r65):** weapon-craft = PRECONDITION,
  armed gate dominant (materials second, exactly one day).
  Deadfall stays POLICY (never staffed here), unre-tested beyond
  the Q3 counts below.

### PURITY GATE (fired on 85003, investigated, resolved)
- 85001, 85002, 85004: capture diff vs r65's committed capture =
  0 lines, census scalars identical (scalar-only comparison; the
  naive whole-object comparison false-positives on trustSetLog /
  convoFiles, which carry driver paths and stack traces — the
  analyzer was amended to compare scalars only, proof re-run to
  13 checks).
- 85003: capture diff 11,613 lines, census scalars differ (day
  154→125, pop 0/0→5/5, pilgrimages 56→41, deaths 51→48,
  abilities beast_calm/echo_location →
  beast_calm/lucky_rock/live_broadcast). This is EXACTLY r65's
  landing-section rebased re-run for 85003 (DEAD d125, 5/5,
  deaths 48, pilg 41, same abilities) — the landed contact-finish
  rule's footprint, not instrument impurity.
- **Same-base control (decisive):** the unmodified r65-duty driver
  run on 85003 on THIS base into a scratch dir gives a capture
  BYTE-IDENTICAL to the r66 capture (diff empty) and the same
  census line (d125, 5/5, lesser arc4). The instrument is pure;
  the gate's 85003 firing is explained by the landed base change.
  The scratch dir was removed in the same command after diffing.
- Quad end states on the current base: 85001 SCATTERED d28,
  85002 ALIVE d181, 85003 DEAD d125 lesser arc4 waiting+announced,
  85004 DEAD d169 lesser arc4 waiting+announced. Lesser seat 2/4;
  full seat 0/4; wave 5 reached 0/4 — same band shape as r65, with
  85003's fate moved by the contact-finish rule as audited there.

### 2. PEOPLE CHECK (sense law — all 6 quad transcripts read in full)
5 of 6 fully real, 1 partial blemish (a gossip-tail recurrence,
new instance — see below). No fabricated shared history, no static
menus. 85001 has no transcripts (scattered d28, before day 90).
- **85002 d90 Luis (favor, sickness):** identical in kind to r65 —
  need owns the opener, commits ("I'll come back to help"),
  stage 2→3, ends resolved ("Thank you. Whatever you can do —
  thank you"). Real.
- **85002 d120 Luis (dream question):** identical to r65 — answer
  lands ("Then it's not gone. Not really"), goon thins
  friendliness. Stage 1→2. Real.
- **85003 d90 Samuel (song question):** NEW partner vs r65's Olivia
  — expected downstream of the contact-finish divergence (the
  driver picks the first low-convo-count villager; 85003's story
  differs from d52 onward on this base). Question real, answer
  engages ("Ha! The creek concerts. I've heard those"), goon
  chill, stage 1→2. Real.
- **85003 d120 Henrique (grief → gossip):** opener real ("It's
  quiet today. Wrong kind of quiet"), comfort engages ("Nobody's
  asked me that in a while"), gossip serves two real facts
  (Dulat the dentist; Chloe out hauling) — then the PARTIAL
  BLEMISH: the reputation line is served twice in one sitting
  ("The way I read it — Word is you're doing right by people.
  Keep it up." then "Word is you're doing right by people. Keep
  it up. That's my read."). Near-verbatim repeat, same content,
  re-framed — the gossip-tail class seen with Meera/Dale in
  earlier runs, new instance (Henrique). Mild, not a break;
  documented as a next-run item, not fixed here.
- **85004 d90 Rowan (alone-time question):** identical to r65 —
  answer engages ("Solitude's a resource too"), goon pulls back
  half a step. Stage 1→2. Real.
- **85004 d120 Regina (old-life skill question):** identical to
  r65 — patience answer lands ("You're an asset"), goon gives
  crossing-guard people-reading. Stage 1→2. Real.
- **Olivia post-accept adjudication: DOES NOT FIRE this run.**
  No betrayal:accept occurred in any quad talk (betray files hold
  zero accept events), so the prereg's adjudication rule has no
  evidence either way. The r64/r65 Olivia blemish STANDS
  UNRE-TESTED (like r65's standing items below), not refuted and
  not confirmed. The absence is itself explained: on this base
  85003's d90 partner is Samuel, not Olivia, and no other talk
  carried a pending invitation.

### 3. DUTY REACHABILITY (counts, report-only)
Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
SIXTH consecutive 0/4 for both duties (r61–r66). Non-duty deadfall
mentions (narration, not the duty line): 85001: 5, 85002: 3,
85003: 0, 85004: 1. Continuity, not a finding.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires
  (courts, covenants, pilgrimages, lesser seats waiting on 2/4
  quad seeds), but the self-craft duty now has a complete
  explanation for never firing: there is almost nobody for it to
  serve. A villager who knows a weapon recipe is armed with that
  weapon, by the same fact that taught them. The duty is reachable
  only through weapon loss without replacement — a path the
  competent village never walks, because gear day, the armory,
  and the whittle keep everyone armed.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing. The thin spot this run
  is the Henrique gossip repeat, mild and familiar, not a new
  break class.
- WINNABLE: not shown, again. The lesser seat waits on 2/4 quad
  seeds; the full seat stays unwon (wave 5 reached 0 everywhere).
  The band says the same thing r65's did, with 85003's fate moved
  by the contact-finish rule exactly as r65's landing audit
  predicted.

## TABLE-APPROACH (standing, report-only)
Quad, end state: 85001 seat none arc3; 85002 seat none arc3;
85003 seat lesser arc4 waiting+announced (then wiped d125);
85004 seat lesser arc4 waiting+announced (then wiped d169).
Full seat 0 everywhere; wave 5 reached 0 everywhere.

## BARRIER PIN (standing instrument)
Barrier-dump line counts per Q1 seed: 85001: 0, 85002: 0, 85003: 0,
85004: 0 (r66 barrier files are empty on all four seeds — no
sayOncePerFight calls captured on this leg's policy path). No new
guard-break signal. The pin stands in its r55 form; it does not
overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  weapon-craft-line and deadfall-duty-line counts.
- No metric was re-scored mid-run. The prereg's pilot gate did not
  fire (85002 ran clean, capture 1,467,625 bytes). The prereg's
  purity gate fired on 85003 and was resolved by investigation +
  same-base control (see above) — the gate's intent (catch
  instrument impurity) was served, not bypassed: the control
  proves the instrument pure, and the divergence is the landed
  base change r65 already audited.
- The prereg's Olivia adjudication rule did not fire (no accept
  arose); the blemish is carried as unre-tested, not re-scored.
- r65's bank-trace finding STANDS (not re-tested; the bank
  instrument was not re-run). r63's mantle-pass proof STANDS (not
  re-tested; the pellet story is closed). r58's Irving-displacement
  answer STANDS unre-tested (no Irving transcript arose). r58's
  subject-menu correction STANDS unre-tested (no subject-first arm
  here). r58's Boris nod-loop stands UNRE-TESTED (no Boris
  transcript arose). r56's chooseAbility-unguarded note stands (no
  duplicate ability id in any control seed's abilitiesHeld — all
  lists distinct). r52's barrier pin stands in its r55 form (see
  above). r65's duty-gate classification is REFINED, not overturned
  (see Q1).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-11-01/journey-scale-r66/journey-scale-r66-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 92669 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r62's/r63's/r64's/r65's verdict: the
baseline is the old-base quad's SUMS (day 579, popAlive 1, pantry 0,
maxWave 16, pilgrimages 69 — the r60/r61 lineage where all four
villages ended dead/scattered with empty pantries). The r66 quad
sums are day 503, popAlive 16, pantry 92,669, maxWave 12,
pilgrimages 95 — the pantry is 85002's alone (identical to r65's
85002; the other three seeds hold 0). A cap-surviving village
holding a pantry is not a telemetry or game defect. The baseline
is NOT rolled on this run's numbers (prereg decision stands).

## Tests
- `node --check` clean on the r66 driver, the analyzer (both
  versions), and the classifier proof test (at creation).
- Classifier proof: `node scripts/test-wsplit-r66.js` — 13 checks
  passed (eligible, seeded-armed, stick-only, no-mats, cooldown,
  cooldown-edge, non-knower, dead/away exclusion, ladder order,
  pack-mats, armed-equipped, armed-pack).
- Wsplit instrument purity: 0-line capture diffs vs r65's committed
  captures on 85001/85002/85004, identical census scalars; 85003
  identical to the same-base r65-duty control capture (see purity
  gate section).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **280 passed, 10 failed in 1151s** (290 scripts). The 10 split
  exactly into 6 pre-existing assertion failures (identical to
  r65's 6, same names, fast exits: godpath/test-measurement-
  proof-update, godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence, godpath/test-occupation-
  panels, godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same racks-full
  "next day voices once more" gate assertion) plus 4 TIMEOUTs at
  the 120s cap (godpath/test-trust-observer-neutrality,
  test-synergy-stall, test-capable-bot-20261014,
  test-table-endings-20261014). The full run took 1151s vs r65's
  495–564s because a sibling lane-B suite ran concurrently for
  most of it (sibling's own suite also slowed to 1147s) — the
  timeouts are concurrent-load flakes, proven by solo re-runs
  AFTER the sibling suite finished (log in goal hidden_files,
  journey-scale-r66-rerun.log): all four PASS solo, well under
  the cap (57s, 40s, 46s, 48s). Effective verdict: 288/290 with
  only r65's 6 pre-existing assertion failures. No quick-list test
  imports this run's scripts, and this run's change set is drivers
  + analyzers + evidence with ZERO src/js, so it cannot have
  caused any of the 6.
- Suite side effect, checked not assumed: `git status` after the
  suite run shows only this run's evidence paths untracked — no
  stray modifications, nothing to discard.
- **Service restart mid-closeout (loud):** the runtime restarted
  while the solo re-run loop was executing (first attempt's output
  lost — the loop had no log redirect). Recovery verified before
  retrying: lock intact, worktree intact, both tooling commits
  intact, evidence intact; the background heartbeat loop had died
  with the restart (heartbeat age 11.4 min, still under the
  15-minute threshold), so the loop was restarted and a manual
  heartbeat verified landed in the registry before the re-run was
  repeated with a log redirect. The repeated solo re-runs above
  are the second attempt's results. One heartbeat-log line shows
  a PermissionError (the intermittent .git-write EPERM flap class)
  from a loop iteration; the manual heartbeat succeeded
  immediately after, so this is flap noise, not an outage.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 7c8745741. At closeout master had moved
to 1a5174abc (11 commits: lane-B coordinator evidence, sim-seathes-a
prereg + evidence, sim-supplyleg-b, sim-detourclear-b, journey-social
r79 — ZERO src/js + src/data in the range, verified by diff). The
branch was rebased cleanly onto 1a5174abc (3/3 picks, no conflicts,
no stop-at-pick quirk), resynced with `git read-tree HEAD`, and
proofs were re-run after the rebase as the body requires: node
--check clean on driver + analyzer, classifier proof 13/13. NO quad
re-run after the rebase: unlike r65 (where a src/js change landed
mid-run), this rebase range holds zero game code, so the measured
quad stands unchanged on the new base.
Merged locally via `git merge --ff-only journey-scale` → master
(verified: master tip equals the branch tip after merge), pending
ship (no bump, no push, no live verify — ship loop owns those).
Branch commits: 88695cb11 (prereg + driver + analyzer + proof),
95cef9f20 (analyzer amendment + 13-check proof),
d6d61ec26 (quad + wsplit analysis + run note), plus this landing
section as the final branch commit, merged by a second fast-forward.
Worktree released + branch deleted at closeout; final main-tree
status clean. Rotation file written 3→0 at closeout and verified by
reading it back. Playtest lock deleted at closeout. Heartbeat loop
stopped at closeout.
