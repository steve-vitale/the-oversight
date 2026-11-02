# Loop B 1030Z round — scale-onramp: the muster gap audit

Run: fleshout-20261102T1030Z, arm sim-mustergap-b, axis scale-onramp.
Worktree branch: sim-mustergap-b. POLICY/INSTRUMENT ONLY — zero `src/js`
changes (verified: `git diff <base>..HEAD -- src/` empty). Sibling trees/
branches NOT touched. Tracker/claim/lock/rotation files NOT touched
(coordinator's).

Prereg: evidence/2026-11-02/sim-mustergap-b-prereg.md (commit 38924e187,
BEFORE any judged sim) + addendum evidence/2026-11-02/sim-mustergap-b-
prereg-addendum.md (commit f40022280, BEFORE any gap2 run).
Policy: scripts/policies/mustergap.js. Driver:
scripts/mustergap-driver-20261102.js. Unit proof:
scripts/test-mustergap-b.js (17/17 green, gap2 semantics; titanroute
proof re-green alongside). Per-seed records:
evidence/2026-11-02/perseed-mustergap-b/mg-{route,gap,gap2}-s<seed>.json.

## Verdict: DIAG-GO (both prereg bars met)

- GO (a) COMPOSITION — PASS: exact muster composition + shortfall named
  for 5/5 sounded calls (not just the required 4/5), from call-day
  link/muster/volunteer snapshots the pilot records lacked.
- GO (b) CLOSING LEVER — PASS: one concrete, perception-lawful lever
  named that closes the gap on all three short seeds (below). The
  commit-own leg was prototyped and measured on identical seeds: it is
  necessary support on two seeds and worthless on the third — it is
  NOT the closer by itself on any seed.

## The answer, in plain words

The task brief's shorthand ("calls brought only ~6 blades") needs a
correction: only three of the five sounded calls stopped at 6. Two
calls met the gate outright (10 and 11 blades) and fought. The three
that stopped at 6 share one shape: exactly three linked villages, each
answering at the base quota of 2, because none of them is trusted
enough (or, on one seed, two of them are in arrears). Committing
Haven's own blades — the obvious fix, and a real player verb — lifts
two of those calls from 6 to 9, still one short, and lifts the third
not at all, because on that seed nobody in Haven is free to march.
The thing that actually closes all three is older and slower than a
button: one linked village, deepened before the call until it is
trusted and current (trust 70+, opinion 10+, arrears zero). That one
deepened link sends 6 instead of 2 (or answers at all, where arrears
silenced it), and 6 + 2 + 2 clears the gate of 10 with Haven's blades
still in reserve. The muster gap is a relationship gap, not a button
gap — which is why the call that sounds too early, to shallow links,
cannot be rescued at the herald's tile.

## Who counts toward the muster (gate math, read from code)

titanMusterReady (src/js/titans.js): unique LIVING allied blades +
unique valid Haven blades >= def.minAllies (10 for the herald).
- Allied blades: one per answered face, deduplicated by
  villageId:vid, dead faces filtered (titanUniqueAllies).
- Haven blades: only via the explicit two-tap titanCommitOwn, cap 3;
  they count toward the gate (2026-10-13 HAVEN COUNTS), leave the
  workforce, eat 1000 kcal/day each from muster upkeep, and can die.
- Per-link call math (soundTitanCall): refuse iff trust < 25 OR
  opinion < -10 OR arrears > 0 (refusal costs trust -8, said aloud);
  else quota = 6 iff trust >= 70 AND opinion >= 10, else 2; the
  contribution is further capped by free living adults in that
  village's roster (a trusted fire with 3 adults sends 3, not 6).
- A re-call sends nobody new: faces already marching are excluded
  ("already march, no new blades join"). There is no second harvest
  from the same links.

## Per-call composition table (route arm, call-day snapshot)

All five seeds have exactly 3 active links at call time — there is no
fourth LINKED village anywhere in this pilot. "A fourth village" would
mean forming a new link before the call, not activating an existing one.

| seed | call day | links answered (quota) | allied | Haven vols at call | total | gate | outcome |
|------|----------|------------------------|--------|--------------------|-------|------|---------|
| 97301 | 59 | Thornfield 6 (trusted 84/13), Ashford 2 (67/9), Emberhold 2 (54/5) | 10 | 0 | 10 | MET | FOUGHT d60, LOST; muster spent (have 0 after) |
| 97310 | 84 | Emberhold 3 (trusted 87/26, 3 adults), Stonebridge 4 (trusted 91/26, 4 adults), Thornfield 4 (trusted 75/22, 4 adults) | 11 | 2 (unused) | 11 | MET | FOUGHT d85, HERALD SLAIN, wave 5 |
| 97330 | 85 | Emberhold 2 (55/21), Stonebridge 2 (55/8), Thornfield 2 (38/13) | 6 | 3 (Nora, Vera, Omar) | 6 | SHORT 4 | 7 MUSTER-GATE refusals; village-lost d122 |
| 97338 | 90 | Thornfield 6 (trusted 87/22); Emberhold REFUSES (arrears 8628, opinion -1); Stonebridge REFUSES (arrears 7000) | 6 | 3 (Jovan, Sanne, Zoltan) | 6 | SHORT 4 | 72 MUSTER-GATE refusals; village-lost d125 |
| 97342 | 61 | Emberhold 2 (48/17), Stonebridge 2 (64/17), Thornfield 2 (35/17) | 6 | 0 | 6 | SHORT 4 | 0 attempts (stance window never coincided); village-lost d64 |

Trust/opinion shown are call-day snapshot values (post-refusal on
97338: the two refusals each cost -8 during the call itself, so
pre-call trust was 88/74 — the arrears, not the trust, refused them).

## What Haven blades add, measured (gap2, button-faithful)

Gap2 = one commit episode on the call day: titanCommitOwn twice in the
same daily (tap + confirm, as the button offers), then stop. Route vs
gap2 on identical seeds:

| seed | route total | gap2 total | gap2 commit line | fights | end route -> gap2 | deaths |
|------|-------------|------------|------------------|--------|-------------------|--------|
| 97301 | 10 | 10 (leg idle: gate met) | — | 1 (lost) | 90 -> 90, won 1 -> 1 | 42 -> 42 |
| 97310 | 11 | 11 (leg idle: gate met) | — | 1 (slain) | 96 -> 96, won 1 -> 1 | 35 -> 35 |
| 97330 | 6 | 9 ("counts 9 blades ... needs 10") | d85: Nora, Vera, Omar | 0 | 122 village-lost -> 134 over-other, won 0 -> 1, table 0 -> 1 | 42 -> 58 |
| 97338 | 6 | 9 ("counts 9 blades ... needs 10") | d90: Jovan, Sanne, Zoltan | 0 | 125 -> 116 village-lost, won 0 -> 0 | 46 -> 41 |
| 97342 | 6 | 6 ("No one is free to march") | none (0 vols) | 0 | 64 -> 64, identical | 42 -> 42 |

Read the 97330 win flip honestly: it is NOT a titan victory. The
herald was never fought (maxWave still 4); committing three
volunteers changed the village's downstream trajectory enough to
reach the table and win by another road, at +16 deaths. The mechanism
is not isolated — this arm does not claim "commit wins games," and
the 97338 national flip under gap1 (0 -> 1, back to 0 under gap2)
shows the same trajectory-sensitivity. Commit-own moves fate; it does
not close the fight gate on any short seed.

## The closing lever: deepen ONE link to trusted-and-current before the call

Perception-lawful because it uses only relationships the village
already has: its own linked fires, named at the war council, tended
through the ordinary trade/aid/tribute flows that built them — no
roster read, no list-fed decision, no new system. Exact numbers:

- 97330: Emberhold trust 55 -> 70 (opinion 21 already >= 10, arrears
  0) -> 6 + 2 + 2 = 10. Single closest climb in the pilot (+15).
  Alternatives: Stonebridge needs +15 trust AND +2 opinion; Thornfield
  needs +32 trust.
- 97338: Stonebridge arrears 7000 paid + trust 66 -> 70 (opinion 13)
  -> 6 + 6 = 12. Cheaper variant: arrears paid alone -> 6 + 2 = 8,
  plus Haven 3 = 11 (the commit leg as support, not closer).
  Emberhold's arrears (8628) hide an ungenerated roster — paying them
  buys up to +2, uncounted until the fire is generated; Stonebridge is
  the certain leg (4 free adults counted).
- 97342: Stonebridge trust 64 -> 70 (opinion 17) -> 6 + 2 + 2 = 10.
  This seed's ONLY single-lever closer: Haven has 0 volunteers, so
  commit-own adds nothing, and a fourth link at base 2 would give only
  8 (still short, with nobody to commit).
- Why not a fourth link: on all three short seeds a new base-quota
  link gives 8 without Haven — short everywhere — and 11 with Haven
  only where volunteers exist (97330, 97338), not 97342. Deepening one
  link is the only single lever closing 3/3.
- Why not re-call: already-marching faces are excluded; a re-call
  adds zero blades from the same links (code, not conjecture).

Follow-up arm owed (not built here): a policy prototype that deepens
one link pre-call (tending + tribute currency) and measures the
trusted-link close on these seeds. This arm names the lever with exact
numbers; it does not pretend to have built it.

## Gap1 finding (preserved, not hidden): the two-tap confirm is fragile

Gap1 (commit 1413fdc19: one tap per daily) is a different, weaker
action than the button, and its numbers must NOT be cited as "what
Haven adds": titanCommitOwn re-keys its pending confirm to the exact
volunteer set on every call, so when the pool churns between daily
taps, the second tap resets pending instead of committing. 97338
gap1 stuttered 13 days (confirm, confirm, confirm, null, null,
confirm...) and committed only 1 blade (Salsabil, d103, "counts 7
blades"); 97330 gap1 took 3 confirms over 4 days before committing 3
(d88). A player double-tapping in one sitting never sees this churn
— but a player who taps once, leaves, and taps again later would:
the second tap silently restarts the offer with different names.
That delayed-second-tap behavior is a UX question for the voice/UX
queue (is a re-keyed offer honest, or should pending name its
volunteers until answered?), recorded not decided here. Gap1 also
showed committed blades attritting without a fight (97330: 3 -> 1 ->
0 over days 108-115, mechanism not isolated — hardship deaths and
roster churn are candidates) and daily "No one is free" spam from
re-tapping; gap2's one-episode design ends both.

## Sense-testing (lines judged for meaning)

- The commit lines price the cost honestly and by name: "Nora, Vera,
  Omar march with the muster. Not loaned. Not asked-for. Ours. The
  coalition counts 9 blades against THE HERALD — it needs 10." A
  player reading that knows exactly how short they are and what they
  staked. The step-forward line likewise states 1000 kcal/day each
  and "They can die — Haven does not get them back."
- "No one is free to march — every able body is away, engaged, or
  already committed" (97342, one episode, one line on the call day) is
  an honest empty-handed answer, and the run's identical trajectory
  after it (same shares, end day, deaths as route) shows the answer
  costs nothing but the words.
- Voice inaccuracy, code-grounded: the MUSTER-GATE refusal line
  (titans.js) computes its "you have N" from allies.length ONLY, so
  after a 9-blade commit the game still tells the player "you have
  6." The coalition counts 9; the refusal counts 6. The line should
  name the full coalition (allied + Haven) or the arithmetic lies
  about the gap it refuses. (This line was not in this driver's
  anchored capture — the claim rests on the code read, stated here
  so it is not mistaken for a transcript quote.)
- Standing with an unmet muster bleeds trust: 97330 route trust fell
  within two days of the call (Emberhold and Stonebridge 55 -> 43,
  Thornfield 38 -> 26). Known
  drains are muster hunger (-2/link/day while the muster stands
  hungry, titanMusterUpkeep) and herald night strikes (-5 to a struck
  link); the full -12 over two days is not isolated to one cause, so
  no single drain is claimed. The consequence matters for the lever:
  every day spent standing short makes the trusted climb longer.
- 97338's refusals name real reasons (debts unpaid, with amounts
  8628/7000 in the snapshot) and cost trust visibly (-8 each). The
  arrears figures are tribute arrears in kcal (hierarchy.js: paid
  tribute clears them) — "pay the arrears" means keeping tribute
  current, an engine flow, not a button this arm found.

## Before/after on identical seeds (DAYS=180, frozen stack)

Route arm reproduces the titanroute pilot EXACTLY on all 5 seeds
(shares, attempts, maxWave, national, table, won, end day, deaths all
match) — the audit's baseline is the pilot, not a lookalike. Gap2
deltas are in the table above; wall totals, 5 sounded seeds:
national 1/5 route -> 1/5 gap2 (97310 both; the gap1 97338 flip did not
reproduce under gap2); table 2/5 -> 3/5 (97330 flips); won 2/5 -> 3/5
(97330 flips, via table, not via titan); wave-5 unlock 1/5 both
(97310). No seed fought a titan under gap2 that route did not fight:
the fight gate moved on zero seeds, which is the point — commit-own
is support, deepening is the closer.

## Balanced panel (docs/MEASUREMENT.md §15 — limitation reported)

No panel compare .md is attached, deliberately, for the same reason
titanroute gave: the panel runs named registry policies only
(scripts/sweep-compare.js POLICY_REGISTRY: capable, livelihoods,
market builds, leadfeast — no titanroute, mustergap, or windefer/
seatdrive/fullseat composition), so it cannot express this
prototype's before/after comparison, and running it on a different
policy would measure something else and present it as this arm. The
panel is the instrument and this prereg's thresholds are the judge;
where the instrument cannot express the comparison, the instrumented
driver records (attached per-seed JSON) are the measurement, and the
wall metrics above are reported from them.

## Metric review (for the NEXT run, not this verdict)

- The 180 cap truncates post-window survival (pilot's note, inherited).
- The refusal line's "you have N" counts allies only (above) — a
  future audit's transcript capture should include the refusal line
  pattern so the misreport is transcript-proven, not code-read.
- titanCallReadiness (sim-sumdeploy-a) was NOT used by the policy:
  it is a player decision-point read (war council), and this arm's
  commit leg keys off the gate itself instead. Whether a future
  deepening policy may sit the council to choose WHICH link to deepen
  is a design question, recorded not decided here.
- The two-tap pending key (volunteer set) makes delayed confirmation
  silently restart the offer — a mechanic the follow-up deepening arm
  should not trip over if it ever commits (use the one-episode
  pattern, or double-tap in one sitting).
- 97342's zero-volunteer state at call time (and +2 days) is itself a
  finding: a village that marches with nobody free at home cannot be
  rescued by its own blades at any price. Workforce availability at
  call time belongs in future muster audits as a first-class field.

## Blanks filled / documented

FILLED (this arm, policy prototype + audit, committed):
- Exact muster composition + shortfall for 5/5 sounded calls, with
  call-day link/muster/volunteer snapshots (this file + per-seed JSON).
- Commit-own prototype measured button-faithfully (gap2): 9 blades on
  97330/97338, 0 on 97342, idle on the two met calls; unit proof
  asserts 0 roster/monster/link reads by the policy.
- Two-tap fragility under churn (gap1 stutter) + one-episode fix.
DOCUMENTED (evidence, not built — next arms):
- (1) Pre-call link deepening to trusted-and-current: the closer, with
  exact per-seed numbers (above). Policy prototype owed.
- (2) Refusal-line undercount (allies only, Haven invisible).
- (3) Delayed-second-tap re-keying of the commit offer (UX question).
- (4) Committed-blade attrition without a fight (97330 gap1).
- (5) 97330 gap2 win flip via table (trajectory side-effect, mechanism
  unisolated) + gap1/gap2 national instability on 97338 — commit-own
  moves fate without moving the fight gate; neither flip is claimed
  as a commit effect.

## Commits (worktree branch sim-mustergap-b; coordinator merges --ff-only)

- 38924e187 — prereg (before any judged sim) + proof skeleton.
- 1413fdc19 — gap1 commit-own prototype (daily-tap) + unit proof.
- 0648aee4e — audit driver (route/gap arms, call-day snapshots).
- f40022280 — gap2 button-faithful commit episode + prereg addendum
  (before any gap2 run).
- (this file + per-seed records — next commit.)

Report: ready to merge locally, pending ship. Do NOT push, do NOT
bump versions, do NOT verify live (ship loop owns deploys).
