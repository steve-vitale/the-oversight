# sim-scale-onramp-round-1702-a — coordinator evidence (Loop A, run fleshout-20261031T1702Z)

Axis: scale-onramp (converging, NOT converged). Loop B live on food-economy
for the whole run (1630Z claim, then its closeout tree — NOT touched).
Claim filed before any sims; rotation file untouched (convergence-directed
axis work supersedes rotation).

Base: f536e3ad3 (1535Z coordinator evidence). Mid-run, Loop B landed
sim-corpsehome-b on master (0c123fdc8); all three arms rebased clean onto
it before merging, proofs re-run green where a proof survived (see below).
No game-code default flipped in this round: zero src/js changes across all
three arms; the one game-adjacent lever built (dangerfit) was reverted on
its NO-GO verdict, leaving no trace (delegate.js byte-identical to base).

Pre-flight: main tree clean, disk 18%, reaper removed nothing (sibling
dirty journey trees refused, left alone). Lock + claim filed 17:02Z;
both retired at closeout (claim -> .DEAD, lock deleted).

## Arm 1 — sim-dangerfit-a: BUILD danger-before-fit when kills > 0 — NO-GO (pilot only, confirm deliberately not run)

Prereg committed before judged sims (69bcde1c3 after rebase). Lever:
kills-earned holders (raw monsterKills > 0 only) roll danger (35% patrol /
25% hunt, hp >= 60) before the fit branches in delegate.js pickTask;
non-killers take the identical path (zero new RNG draws, proven by unit
test). Baseline pilot leg on this base reproduced killscred's pilot
numbers exactly (no base drift); lever pilot leg on identical seeds/stack.

Before/after, pilot 8 seeds:
- 85111 mechanic: patrol 0 -> 10, hunt 0 -> 3, mend 271 -> 85. He died on
  patrol day 140 (cause 'monster') after a day 133-139 patrol-combat kill
  streak; village mend total = his alone on both legs.
- 85114 farmer: patrol 0 -> 28, hunt 0 -> 26, cook 257 -> 166 (floor 100 passed).
- Band coverage (seeds with a patrolling kills-holder): 2 -> 4.
  No-killer seeds (85101/85103/85104/85107) trajectory-identical,
  confirming non-killer routing unchanged. Bonus flip: 85108 fisherman
  patrol 0 -> 29.
- Proof: unit cases 19/19 green; corpus checks 34/35 — the single failure
  is the binding guardrail.
- Panel (§15, pilot-only, official CLI compare, decision
  `review_required`): wins 0.75 -> 0.875, national 0.625 -> 0.875 —
  divergence artifacts, not efficacy; the prereg judge overrules them.

Verdict NO-GO, judged exactly against the prereg: guardrail 4a (mechanic
all-beats mend >= 100) failed deterministically at 85 < 100. The failure
is mortality, not diversion rate (post-kill mend share was 50%, near
prediction). Per §14 the miss was not re-scored. Confirm deliberately not
run: the flagship-seed floor is final on a deterministic leg, so two more
legs could not change the verdict. Lever reverted — killed arm leaves no
trace. Commits (rebased): 69bcde1c3 prereg, e65606c40 stdout-runner +
idle splitter tooling, 69a5c6223 NO-GO evidence + pilot corpora + panel.
Note: these commits carry [needs-eyes] from the worker, but they ship no
player-facing change (lever reverted, tooling + evidence only), so the
flag is moot for the ship loop. check.js --quick produced no output for
~9 min in the worker and was stopped; --only delegate finds 0 scripts —
do NOT cite this arm as check.js-green.

Metric review (carried forward): the guardrail should split diversion
rate from death-truncation next time — the lever moved routing exactly as
designed and the village lost its sole mender to the danger it was sent
into. Next arm on this finding is a mortality/capacity question (what
protects a sole specialist sent to danger), NOT a reorder retry.

## Arm 2 — sim-fieldkill-a: why wave-3 field fights never kill — DIAG-GO (with two strict-reading notes)

Replacement worker: the first worker died on a transport error (sqlx pool
timeout), not a verdict. Coordinator verified before re-dispatch: prereg
commit intact, five uncommitted instrument files present, no judged corpus
yet. The replacement re-verified the prereg and instruments (2 misleading
comments fixed), committed them before any judged sims, then ran the
census. Commits (rebased): 33d39f142 prereg, 202667899 recovered
instruments, 9d52d1d9a census + analyzer + proof. Proof re-run green
after rebase: scripts/test-fieldkill-20261031.js 173/173 (21 synthetic +
152 corpus legs). Recorder errors 0 on all 19 seeds. Its diag policy file
(scripts/policies/fieldkill-diag.js) is required only by its own sweep
(env-gated FIELDKILL=1); src/js does not load it — no game change.

Mechanism, in plain words: field fights never kill wave-3 monsters
because the fight exits before death, on both sides. The main exit is the
monster's break line: a wave-3 monster below 15% of max HP (36-63 HP)
runs away instead of dying, and a monster met already below that line
runs away on contact before any blow lands — so a killing blow would
have to jump from above the break line to zero in one strike, which a
lone villager's strike almost never does. Fights DO reach killable state
(11 times) — and 10 of those 11 ended with the monster fleeing at 16-44
HP, one strike from death. Sense-read fight: on 87140 day 183, Babatunde
(titled apex-stalker, Rage-doubled, Aim-multiplied) dealt 196 damage,
took the Redactor from 212 to 16 HP, announced "Committing to the kill" —
and the Redactor left, because the last strike dealt 46 and needed 62.
On the villager's side the exits are learn-withdrawal (leave at round 3+
when not winning), hopeless-trajectory flight (typical villager ~10/round
vs 20-55 incoming), the HP floor, and trick exits (villager performs the
trick instead of striking, monster leaves at full HP). Wild fights are
always solo — 202/202 with no ally starting or joining — so the
same-round ally finish, one of the only kill paths, is structurally
unavailable where 87% of field fights happen. The scholar's turn-based
fights, which have no break-line exit, are the only channel that kills
(19/19 ledger events: 17 'won' + 2 'routed' joins, 0 orphans, 0 field
vKills, 0 pyrrhic). Consequence: villager field fights cannot
manufacture wave-3+ killers, so the veterans bar is scholar-shaped on
this stack by construction.

Band numbers (19 seeds): 293 meetings (233 field + 60 TB); field outcomes
vFlee 131, mFlee 90, evade 10, vDie 2, vKill 0; TB lost 34, won 17, routed 9.
Flee triggers (221 flights): learn 64, mBreak-driveoff 58, hopeless 52,
trick-exit 17, unclassified 13 (all trick-completion, see strict note 1),
floor 11, round-cap 5, volley-driveoff 1. Killable-at-flee 11 (5.0%),
near-killable 24, below-break 61, zero-damage flights 98; pooled median
rounds-to-kill at flee 12.6 (finite n=123). Det gate byte-identical on
87104/87127; judged 87104 byte-identical to its det-ON run (241,645
bytes, cmp clean). Net src/ diff vs wave3enc's base is empty, so this
band reproduces wave3enc's totals exactly — re-derived on this base,
not transferred.

Strict-reading notes (same precedent as wave3enc-a; verdict stands, but
recorded so a literal reader can flip it without changing any census
value): (1) 13/221 flights are class-8 unclassified, but ALL 13 are
verified trick-completion exits the prereg's class 2 didn't list (8
focus_group bore-outs, 3 rounds, 0 damage; 5 terms_of_service loophole
dismissals, 2 rounds, 0 damage; code points in fieldFights.js trick
branches). The prereg's NO-GO clause names "unclassified > 0
unexplained"; these are explained, so GO stands — a literal
"unclassified == 0" reading flips it to NO-GO with zero census values
changed. (2) Cross-check (iii) equality fails literally on one seed —
87128 day 74 has 2 kill events but 1 log entry, because recordWaveKill
dedupes the log on identical (day, mid, by, via, trick) while still
scoring both points. Coverage direction holds everywhere (every log
entry has an event); both events join cleanly to the two 'won' rows.

Metric review (in the arm evidence): class-2 broadening, log-dedupe
wording fix, TB death-flag gap.

## Arm 3 — sim-fullseat-a: full-seat bars reachability — DIAG-GO

Commits (rebased): 59935c34c prereg, 77c9fdbcb combined regtable+vet2
sweep/splitter/analyzer/det-compare (instruments only), aaac95fd3 prereg
addendum (interim-holder cc3 rule, before confirm) + analyzer
closest-day field, 14b42d0f7 census. Proof re-run green after rebase:
scripts/test-fullseat-20261031.js 180/180. 19/19 usable seeds; recorder
errors 0 everywhere; cc1/cc2/cc4 pass 19/19; all 16 cc3 mismatches
explained under the prereg's addendum rule (both capture scholar reads
agree; prior-row or interim-holder succession shape — the
interim-holder variant on 87109 day 81 prompted the addendum, written
before confirm spend and before any verdict); det-gate passed (ON vs OFF
hashes byte-identical on 87109/87135); determinism passed literally on
87107 (byte-identical, 208,300 bytes) and trajectory-identical modulo
the anchor stamp on 87115/87138 (the stamp moved on the arm's own
instruments-only commit between runs — documented in the evidence).
No simultaneity gap anywhere: closest-day vector equals max vector on
all 19 seeds. Corpus carries two anchor stamps (pilot seeds 77c9fdbcb,
confirm seeds aaac95fd3) for one trajectory base — the only difference
between them is the arm's own instruments-only commit.

Verdict: the full seat is NOT reachable on any seed on this stack: 0/19
hold a full seat on any day, while 16/19 reach the table and all 16 sit
in the lesser seat.

The binding bar, in plain words: the village is one living wave-4 hero
short. The two closest villages (87132, 87138) meet every other
full-seat bar on a single day — waves 1-4, contests, crises, stage, food
deeds, national/global scale — and are blocked by exactly one thing:
they hold 1 living wave-4+ killer against a demand of 2. That one
missing veteran is also the missing wave-5 unlock (standing held at 199,
one point under the 200 bar, by the wave-5 readiness deferral, whose
only short bar on those seeds is veterans), which is also the missing w5
deed bar (0/2 everywhere, because wave 5 never unlocks on 0/19 seeds).
One veteran short, three ways of saying it. The second veteran was never
made, not lost: only 4 wave-4+ kills in 19 runs (3 scholar, 1 companion,
kill-time-keyed), 0 wave-5 kills, 0 seeds ever holding 2 living vet5s,
and the longest vet5 tenure (Nino, 87132, days 69-90) ends in a win with
just him.

87109/87135 reproduce but are NOT full-seat near misses: 87109 is a
no-seat story (w3 2/4 at best — one short of even the lesser bar —
despite touching global rank, dying day 146); 87135 is a no-seat story
(food deeds false alone blocks the lesser seat, w4 0/3 further, dying
day 144). Neither was assumed — both re-measured on this base.

Sense test (87138, scratch say-probe, end fields identical to judged):
the day-90 audit is honest about what was faced — "A lesser seat —
global standing, waves 1-3 faced (17/5/5), with 4 wave-4 fought, 9
contests survived, 3 crises weathered. The table does not rise. It
prices." — matching the judged vector exactly, but it never names the
full seat's price. A village that wins lesser never learns it was one
veteran short of full. Noted as a voicing gap (Steve-call if the audit
should name it), not a verdict-changer.

## Wall (per-band, never pooled)

Fieldkill band + fullseat band (same 19-seed shape, same totals):
national 14/19, table 16/19 (all lesser), wins 15/19 (all lesser),
wave 4 unlocked 12/19, wave 5 0/19, full seat 0/19, median survival 90d,
max 197d. Fullseat's own count: ever-national 15/19. Dangerfit pilot
(8 seeds, strand-free pilot band): no wall claim — pilot only, and its
panel wins/national moves are declared divergence artifacts above.

Overall wall UNCHANGED: full seat 0, wave 5 reached 0 stands. What
changed is the explanation: the wall is now one veteran short, and the
veteran shortage is now mechanistically explained (field fights cannot
manufacture wave-3+ killers; the danger branch that would send
kills-earned villagers to danger kills the sole mender when it works).

## Village assessment (plain words)

The village climbs: it reaches the table on most seeds and wins the
lesser seat on most of those. It does not climb to the full seat because
it cannot grow a second wave-4 hero. Heroes are made almost entirely by
the scholar in turn-based fights; ordinary villagers fighting monsters
in the field never land the kill — the monster walks away one strike
from death, or the villager walks away first — and when the one lever
that would send proven killers out on patrol finally worked, it sent the
village's only mender out and he died on patrol, leaving the village
worse at the job he alone did. The village is competent at surviving
and winning small; it has no second hero because nothing in the field
makes one.

## Telemetry deviation check

Ran node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/perseed-fullseat/leadfeast/*.json' --metrics
national,table,wins,exiled: REFUSED by the tool itself (all 19 rows
carry top-level anchorCommit — sweep recorder rows, not runs; recorder
corpora are compared with sweep-compare tables, never against a run
baseline here). No LOUD lines, baseline NOT rolled. Same class as the
1415Z and 1535Z refusals.

## Infrastructure

- EPERM flap intermittent all run (registry heartbeat writes, safe-commit
  index clobber on every arm commit — commit correct, repaired via
  --add --cacheinfo, verified status + diff HEAD empty before each
  merge). No ref surgery forced, all retried clean.
- Registry lock contention with Loop B's concurrent landing slowed
  registration, heartbeat, and release (minutes per call); no action
  taken beyond retries.
- Fieldkill first worker lost to a transport error mid-run; recovered
  via replacement worker on the same worktree (see arm 2). Nothing
  re-run from scratch; prereg + instruments preserved.
- check.js --quick ATTEMPTED on merged master by the coordinator (repo
  AGENTS.md asks for it after every change): it did NOT finish — `timeout
  240` killed it mid-run (290 scripts, 4 parallel; output cut off with
  some F marks visible but the run incomplete, so it can be cited neither
  as a pass nor as a specific failure). This corroborates the dangerfit
  worker's ~9 min no-output observation: --quick does not complete
  promptly on this box under concurrent loop load. It left no stray
  changes (status shows only this evidence file). Arm proofs green on
  rebased branches stand as the landing verification; --quick is NOT
  claimed green here.
- Landing: all three rebased clean onto master (incl. Loop B's
  mid-run corpsehome landing), proofs re-run green after rebase for
  fieldkill (173/173) and fullseat (180/180); dangerfit has no surviving
  proof file (lever test deleted with the lever — disclosed, not
  claimed green). Trees released as merged, branches deleted, main tree
  clean at closeout (14b42d0f7 + this coordinator commit).

## Metric review (round level)

- Dangerfit: split guardrails into diversion rate vs death-truncation.
- Fieldkill: broaden class 2 to trick-completion exits; fix the
  log-dedupe wording in cross-check (iii); TB death-flag gap noted.
- Fullseat: interim-holder cc3 rule (addendum) is now the standing rule
  for this census family; closest-day field added to the analyzer.
- Panel (§15): applied to dangerfit (pilot-only, review_required);
  NOT APPLICABLE to the two DIAG censuses, none fabricated.

## Next blanks, in order

1. Engine-cap decision (steve-call) — still the highest-value open call
   from 1415Z; untouched by this round.
2. Danger-before-fit mortality/capacity arm: what protects a sole
   specialist sent to danger (dangerfit metric review) — NOT a reorder
   retry.
3. Field-kill conversion lever WITH a survivability companion (fieldkill
   mechanism + the 978 lesson: HOLD/NOFLEE raised kills at pilot and
   collapsed villages) — needs its own pre-registration; the break line
   is load-bearing villager protection.
4. Second-veteran manufacture: field fights cannot make wave-3+ killers
   (fieldkill) — the veterans-2 gap is a manufacture gap, not a counting
   gap; any vet2 arm must address manufacture.
5. Full-seat price voicing gap (steve-call if the day-90 audit should
   name the full seat's price).
6. Roster-lottery census (patrolsilent open item: how often a village
   starts with zero combat occupations AND no kills pathway) — still owed.
7. 87109/87135 single-bar stories — CLOSED as near-miss questions
   (both no-seat stories, re-measured); do not re-open as near misses.

scale-onramp stays converging (NOT converged): no wave-5 or full-seat
reachability has been shown and no game change landed. food-economy
untouched (sibling Loop B lane). Claim retired to .DEAD; lock deleted.
Merged locally, pending ship.
