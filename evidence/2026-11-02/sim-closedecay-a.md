# sim-closedecay-a — closecommit coalition decay trace (Loop A 20261102)

Arm: blank (4) from Loop A 1155Z review, axis scale-onramp. Coordinator
claim fleshout-loop-a-20261102T1254Z (this arm + sim-creekwide-a; sibling
Loop B live on food-economy — NOT touched; sibling trees NOT touched).
Prereg: evidence/2026-11-02/sim-closedecay-a-prereg.md, written BEFORE
any judged sim in this arm. Instrument/diagnosis arm + one measured
policy prototype. Zero src/js changes. Ready for coordinator merge,
pending ship (NOT pushed, NOT bumped, NOT live-verified — ship loop owns
deploys).

## Verdict: DECAY ISOLATED — and it is NOT the coalition decaying

1155Z's mystery reproduces EXACTLY under the closecommit arm on 97330
(call day 97, gate 11, 12 MUSTER-GATE refusals on day 110, 0 fights) —
and the daily trace shows the decay is entirely on Haven's side, via a
mechanism nobody named in 1155Z: **the bearer succession chain eats the
committed blades**. The allied coalition does not decay at all.

- Allied component: CONSTANT 8 living blades, every traced day d97–d122.
  All 8 faces stay alive and healthy in their rosters throughout.
  Hypothesis H1 (allied face loss) is KILLED by the trace.
- Haven component: 3 → 2 between d102/d103 → 0 between d105/d106.
  Judged gate (titanMusterReady's rule, replicated driver-side AND read
  from the engine flag): 11 (ready) d97–d102 → 10 (ready) d103–d105 →
  8 (NOT ready) d106 onward. The 12 refusals on d110 all snapshot at
  gate 8, ready False.
- Hypothesis H3 (the gate was never really 11) is KILLED: at call day
  the gate is 11 by raw count, by living-unique count, and by the
  engine's own ready flag. The 11 was real, and it was lost.
- Hypothesis H4 (trust drains move the gate) is EXCLUDED as a cause:
  muster hunger (-2/link/day, 0 kcal fed every day from d98 — the
  scholar marches with an empty pack) and night strikes (-5) bleed
  trust visibly (Emberhold 96 → 28 by d122; Stonebridge opinion 1 →
  -3; arrears appear d106), but the muster list is fixed at call: trust
  and quota recomputation after the call cannot remove blades. The
  Emberhold quota falling 6 → 2 by d109 is post-call arithmetic, not
  a muster change — the 4 Emberhold faces still march.

## The mechanism, day by day (97330, closecommit)

Call d97: Emberhold answers 4 (Priya Osei, Ruth Santos, Fatima Sato,
Tariq Dubois — quota 6 capped by 4 free adults), Stonebridge 2 (Kira
Sato, Kenji Kim), Thornfield 2 (Alba Olsen, Rosa Ortiz) = 8 allied.
Haven commits 3 the same day (Aroha Ngata, Vera Bhatt, Nora Wilson):
"The coalition counts 11 blades against THE HERALD — it needs 10."

- d103, 3 → 2: the bearer Patrick Castillo dies in the wild, and the
  mantle passes to Vera Bhatt — a committed blade. titanReconcileBearer
  (dawn tick + mantleBecome) sets muster.haven through
  titanHavenBlades, which excludes Game.villagerId: the new bearer is
  no longer "one of Haven's committed" but the player herself. Vera is
  still alive and still in Haven's roster on d103 — she stops counting
  by becoming you, not by dying. (Code: titans.js titanReconcileBearer
  + titanHavenBlades bearer exclusion; transcript: "The mantle passes
  to Vera Bhatt" / "You wake up somebody else. Vera Bhatt, 31 — a
  Chef.")
- d106, 2 → 0: Vera (now bearer) dies in the wild → mantle passes to
  Nora Wilson (committed blade #2) → Nora dies in the wild the same
  day → mantle passes to Aroha Ngata (committed blade #3) → Aroha dies
  in the wild the same day → mantle passes to Lamar Epstein. Fallen
  list d106: Vera, Nora, Aroha, all cause 'the wild'. Three bearer
  deaths in one day, each mantle pass consuming the next committed
  blade. By end of d106 the muster is 8 + 0, and the one-episode commit
  leg (episodeDone) never re-taps, so it never recovers.
- d109–d110, contact: scholar reaches the lair tile d109 (sameTile at
  daily-post), attempts fire d110 — 12 MUSTER-GATE refusals, every one
  at judged gate 8. (Why 12 attempts in one day vs 3–4 on route-arm
  contact days is an instrument observation, not isolated here; the
  gate at every attempt is identical, so the count does not change
  the verdict.)

GO threshold (prereg): MET. The component whose movement drops the gate
below 10 is named — Haven valid blades, 3 → 0 — with dated values on
call day (d97: 11), a mid-window day (d103: 10; d105: 10), and refusal
day (d110: 8), and the full daily gate series reproduces identically
on a second run of 97330 under the identical arm (r1 == r2 on gate
series, attempts, anchored lines, deaths, end day). Proof test:
scripts/test-closedecay-a.js, 29/29 green.

## Second seed check: 97338 shows the same chain, on a gate that was
## already short

Closecommit on 97338: call d113, gate 9 (already short — no decay
needed to explain no fight here). Only Thornfield answers (6);
Emberhold and Stonebridge refuse on arrears (4508 / 4000) despite
trust 84 — the primary-arrears trap, unchanged by close. Commit adds 3
(Dmitri, Elif, Clinton) → 9. Then the same succession chain:
d115 bearer Sanne dies in the arena → mantle passes to committed blade
Dmitri → Dmitri drops from the muster (bearer exclusion): 9 → 8.
d117 Dmitri, Clinton, and Elif all fall in the wild (Elif after a brief
stint as bearer): 8 → 6. Refusals d118 (6 attempts) all at gate 6.
Allies constant 6 throughout. So the succession-eats-commitment
pattern generalizes: on both seeds, every committed blade is gone
before contact, and on 97338 the gate could never have closed anyway
(6 allied + 3 Haven cap = 9 < 10 — a ceiling, not a decay).

## Policy prototype: commit-own refresh — measured, NO-GO as a closer

Prototype: scripts/policies/commitrefresh.js — when the sounded
coalition still stands, the gate is unmet, and Haven's committed count
has dropped below its last-seen value, run one fresh two-tap commit
episode in the same daily (the player noticing blades missing and
sending replacements). Perception-lawful: decides only from the call
record, its own muster record, the slain flag, and the titanCommitOwn
verb — no roster, monster, or link-list reads (asserted in the proof
test). Measured on 97330 against closecommit on identical seeds:

- v1 NEVER FIRED (bug, disclosed): it returned early while the gate
  was met without recording the seen count, so the 3 → 2 drop was
  never recorded and 0 became its baseline. Fixed in v2 (seen count
  recorded every day the muster stands; action only when gate unmet).
  The v1 run record is kept (cd-refresh-s97330-r1.json) so the bug
  leaves a trace, not a silent rerun.
- v2 on 97330: d106 refresh commits exactly 1 blade (Ivy) — only 1
  volunteer was free; gate 8 → 9, still short. d107 Ivy becomes bearer
  (Lamar dies) → Ivy drops from the muster by the same bearer
  exclusion; refresh re-tries and finds "No one is free to march"
  (pool empty). Contact d113: 1 refusal at gate 8. Still 0 fights;
  village-lost d116 (vs d122 closecommit — trajectory shifted, not
  improved).
- Verdict: refresh is NOT a closer on 97330 (it restores 1 blade for
  1 day, then the succession chain eats the replacement and the pool
  is empty), and it CANNOT close 97338 at all (ceiling 9 < 10). It is
  committed as a measured prototype, not landed as a fix. No policy
  claim is made beyond what these runs show.

Refresh on 97338 was deliberately NOT run: with allies fixed at 6 and
the Haven cap at 3, no refresh sequence can reach 10, so the run could
not change the fight verdict (the 97330 run already demonstrates the
succession-eats-refresh dynamic).

## Sense-testing (transcript judged for meaning)

- The commit line prices the cost honestly and by name — "They can
  die — Haven does not get them back" — and they do die, but not as
  the line implies (standing in front of the herald). They die as the
  player, one after another, in ordinary wild fights the marching
  scholar keeps walking into, while the herald is never fought. The
  line's warning is true; its picture of how they die is wrong.
- The succession lines are the story of the decay: "You're not
  Patrick." / "You wake up somebody else." Each mantle pass is a
  funeral and a promotion in the same breath — and each promotion
  quietly un-commits a blade from the muster, with no line ever saying
  "the coalition lost a blade." A player watching only the muster
  would see the count fall and never be told why.
- The refusal line on d110 ("you have 8") happens to be accurate —
  but only because Haven is 0 by then. The known allies-only undercount
  (mustergap evidence) would have lied on any day Haven blades stood;
  no attempts fired on those days, so the lie never sounded here.
- The muster-hunger line is the run's other honest price: 0 of 11,000
  kcal fed every day from d98, because the scholar marches with an
  empty pack while the muster stands. It bleeds trust daily, but it
  never removes a blade — a slow bleed the trace separates cleanly
  from the succession guillotine.

## Per-seed records (all under evidence/2026-11-02/perseed-closedecay-a/)

- cd-closecommit-s97330-r1.json — judged trace (call d97, gate 11 →
  8, 12 refusals d110, village-lost d122, deaths 49)
- cd-closecommit-s97330-r2.json — determinism re-run, gate series
  identical to r1
- cd-closecommit-s97330-diag.json — diag run (rosterWatch + death
  lines), gate series identical to r1; the succession-day deaths
  are dated from this file's fallen list
- cd-closecommit-s97338-diag.json — second-seed check (call d113,
  gate 9 → 6, 6 refusals d118, village-lost d122)
- cd-refresh-s97330-r1.json — refresh v1 (never fired; bug record)
- cd-refresh-s97330-r2.json — refresh v2 (d106 +1 Ivy, d107 0 free,
  1 refusal d113, village-lost d116)

## Files committed (this arm)

- scripts/closedecay-driver-20261102.js — daily muster trace driver
  (closecommit + refresh arms; driver-side reads only)
- scripts/policies/musterclose.js — RECOVERED VERBATIM from the deleted
  musterclose branch (commit ef378b534) so the closecommit leg can be
  re-run for diagnosis. Its killed verdict from 1155Z stands; this
  file's presence is reproduction scaffolding, not a re-landing.
- scripts/policies/commitrefresh.js — refresh prototype (v2 measured)
- scripts/test-closedecay-a.js — proof test, 29/29 green (read-only)
- evidence/2026-11-02/sim-closedecay-a-prereg.md (pre-sim prereg)
- evidence/2026-11-02/sim-closedecay-a.md (this file)
- evidence/2026-11-02/perseed-closedecay-a/*.json (6 run records)

## Metric review (for the NEXT run, not this verdict)

- Audit drivers should record the judged gate (living-unique +
  valid Haven + ready flag) daily, not just raw allies+haven: the raw
  and judged counts coincide here until d103, but only the judged
  count explains the refusals.
- The refusal line's allies-only "you have N" undercount (mustergap
  evidence) did not distort this run's d110 line (Haven 0), but it
  will lie on any future run where attempts fire while Haven blades
  stand — a voice fix, not a gate fix.
- The musterclose policy's closest-climb rule and the commit-own
  one-episode design are both reproduced here as scaffolding; neither
  is re-judged by this arm.
- The 12-attempts-on-one-day count (vs 3–4 on route-arm contact days)
  is recorded but not mechanistically isolated; a future contact
  audit should say why attempts cluster.

## Instrument observations (not verdicts)

- Game.state.village.titanCommitted reads {} on every traced day in
  the diag run, including d97 after the commit episode recorded
  havenAfter 3. The muster.haven list (the gate's actual input) is
  authoritative and fully traced, so this does not affect the verdict
  — but where titanCommitted lives after commit, or what clears it,
  is unexplained and worth one look before anyone builds on that map.
- The succession order itself (why the mantle passes to Vera, then
  Nora, then Aroha — exactly the commit order — on 97330, and to
  Dmitri, then Elif on 97338) is NOT isolated by this trace. Whether
  it follows party order, standing order, or something else decides
  whether the chain always eats committed blades first or only did so
  on these seeds.

## Next blanks, in order

1. STEVE-CALL CANDIDATE — should a committed blade be allowed to
   become the bearer (and thereby leave the muster)? The succession
   chain eating the muster is arguably the village's story working as
   designed (the mantle passes to someone present and trusted) — or
   arguably a leak (the muster should hold its blades through a
   succession). This arm proves the mechanism; it does not rule which
   reading is right. Until ruled, no src/js fix is proposed.
2. Succession-order rule: why the mantle passes through committed
   blades first (party order? standing?) — decides whether the chain
   is systematic or seed luck. Needs a trace that records the mantle
   candidate order, not just the outcome.
3. Muster-hunger feeding from the village pantry vs the scholar's
   pack: 0 kcal fed every day while the village pantry holds thousands
   — the muster starves because upkeep draws playerPackSpend, not
   village stores. Separate blank (trust bleed, not gate), but it is
   why the trust collapse accompanies every long stand.
4. Why 12 contact attempts fire on one day (d110) vs 3–4 on route-arm
   contact days — contact cadence audit.
5. titanCommitted map reading {} post-commit (instrument observation
   above) — one look, before building on it.

## Village assessment (plain words)

The village did everything the plan asked: it deepened its friendships
until Emberhold answered with four, it sounded the call, and three of
its own — Aroha, Vera, Nora — stepped forward knowing they could die.
They never got to face the herald. The scholar leading them kept dying
on the road instead, and each time the village's mantle fell, it fell
on one of the three who had volunteered — and the moment one of them
became the leader, she stopped counting as a volunteer. By the time
the scholar finally stood in front of the herald, all three were dead
in the wild, the coalition was eight blades short of its promise, and
the herald refused twelve times in a single day. The coalition didn't
rot. It was spent, one funeral at a time, on the march to the fight.
