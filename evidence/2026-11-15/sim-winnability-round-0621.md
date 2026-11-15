# sim-winnability-round-0621 — Loop B run fleshout-loop-b-20261115T0621Z (axis winnability chain)

STALE-LOCK RECOVERY + ADOPTION of the 0411Z run, then two arms: successor-caution
PILOT-NO-GO (killed at pilot) + measurement-proof refresh round 20 GO. Merged
locally, pending ship.

## Stale-lock recovery + adoption (0411Z run)

At run start the Loop B lock belonged to run fleshout-loop-b-20261115T0411Z
(created 04:11:47Z, 2h04m old — past the 90-min fallback). Its tree
sim-funeral-mend-b had a 68-min-stale heartbeat and its worker (agent
a06d8969) was done/cancelled after committing a complete GO arm; the last
tree write was 06:07:41Z, more than 15 minutes before adoption work began.
Arm sim-fighterhold-b (DIAG-NO-GO) was already on master as 5aa0863e2.
The adoption verified the funeral-mend branch (7 commits, clean tree,
evidence + proof test present), rebased it twice — onto 783487438, then
onto 7b3992e75 after the journey-landing lane landed mid-rebase — re-ran
the proof test 7/7 after each rebase, and merged ff-only as b9b226430
(65 files, hierarchy.js + instruments + corpora + evidence). The tree was
released and the branch deleted. The 0411Z claim was retired to .DEAD with
a note; the lock was replaced by this run's. A tracker entry for the 0411Z
run is appended by this run (recovery record — the 0411Z coordinator died
before writing one).

Adopted funeral-mend numbers (confirm, 16 seeds 100201-100216, 150d):
dissolutions ON 0 vs OFF 7, median national held-days 63.5 vs 38.5, cost
clean (starvation 0 vs 6, median survival 130d vs 121.5d), end-state
national 14/16 vs 8/16, table 0, wins 0, wave-4 16/16, wave-5 7/16 vs
8/16. The realm now holds through funerals; villages die holding it.

## Arm 1 — sim-successorcaution-b: PILOT-NO-GO (killed at pilot, no confirm)

Branch sim-successorcaution-b, tip ba84576ba (7 commits, rebased clean
onto 287f740ac, proof 4/4 re-run after the rebase by the coordinator).
Policy variant only — new file scripts/policies/competent-successorcaution-b.js;
no src/js change, default policies untouched. The lever: a fresh successor
does not start a solo forage trip to a tile corner for the first 2 days
after succession; they stay at/near Haven. This is the fighterhold
handoff's door 3 (the only open, permitted door: flee is a Steve call,
combat-play is gated, toughness/gear/ability tuning is forbidden, the
breach is a designed crisis, the cascade-breaker was rejected on canon).

- Mechanism: PASS, strongly — 65 successions detected, 114 caution days,
  113 solo trips suppressed, 65 voiced lines, 0 errors, on all 8 pilot
  seeds.
- P1 (primary, scholar `the wild` deaths per national-day): fresh control
  0.1649 (63/382) → armed 0.1562 (62/397) = 0.947x control. Bar was
  ≤ 0.6x. NO-GO. Total `the wild` deaths identical 88 → 88.
- Why it cannot improve with more seeds: gap-1 deaths fell 22 → 14
  (−36%, the window works) but same-day cascade deaths rose 23 → 32
  (+39%) — a daily-level gate cannot touch a death inside the death
  day's own `daily()` call. The bar would need a ~4σ swing from the
  measured ON rate. No confirm was run, correctly.
- P2 (companion): median national held-days 47.5 → 57 (pass, does not
  override P1).
- Cost bar: PASS — starvation pooled 0 ≤ 2; median survival 125d ≥
  0.8 × 117.5; dissolutions 0 (control 1); total deaths 612 vs 652.
- §15 panel: review_required, no material signals (village deaths/run
  81.5 → 76.5, CI includes zero; national access flat 0.875).
- Telemetry deviation check: three LOUD lines (national/table/wins) are
  the documented scale-wall regime artifact — verified from the
  baseline's own `_regime.note`; not a regression.
- Sense-test: the village does not go silent on caution days (aid grain,
  grave-speaking for the new bearer, "the good seat by the fire"). One
  honest wrinkle: the caution voice line fired 65 times but is not
  retained in the per-seed files (linkLines regex doesn't match it) — a
  recorder gap, not a policy failure.
- Method note: the fresh control leg is harsher than the committed
  funeral-mend numbers on this tip (P1 0.1649 vs 0.1075) due to the r206
  `travelTo`/spawn drift. Judged against the fresh control, correctly —
  before/after must re-run fresh controls on the current tip, never judge
  against a committed corpus from an older tip.
- Evidence: evidence/2026-11-15/sim-successorcaution-b.md (+ prereg,
  panel, corpora perseed-successorcaution-b-control/ and
  perseed-successorcaution-b-on/).

## Arm 2 — sim-proofrefresh-b20: GO on the final tip

Branch sim-proofrefresh-b20, tip 287f740ac (5 commits, rebased clean,
proof 12/12 re-verified by the coordinator before merging). Zero src/js
changes — evidence + panel + test files only.

- Owed-check: OWED. On base b9b226430 the proof test failed exit 1 with
  "Proof source inputs are not current"; workflow 8/9 with exactly the
  staleness leg failing; ontology exit 0 (138 systems). Manifest diff vs
  the retained b19 panel: 0 new keys, 6 differ — hierarchy.js, game.js,
  conversation.js, convo-scene.js (funeral-mend + journey) + build.js and
  index.html (ship version stamps). All five stale negatives (b19, b18,
  b17, b13, b12) fail validate() as required.
- Panel: fresh real neutral panel regenerated in a single attempt
  06:44–07:13Z, 64 cases, 0 cached jobs, sha256
  `d58537cde306ebc9720adccc707a57fda9828fd1a0d9bb594db64164bcce5a4b`,
  sourceHeadStart == sourceHeadEnd == 72c4dda86. Re-pointed via
  scripts/balance-proof-update.js (exit 0, no hand-edited hashes) to
  evidence/2026-11-15/neutral-proofrefresh-b20.json.gz. 0 keys differ vs
  tip manifest, neutrality 4/4, warnings 0, sourcesStable true.
- GO legs on the final tip 3904f2b8f: (a) proof-update 9/9 exit 0;
  (b) workflow 9/9; (c) cache-flags 4/4 outright; (d) neutrality
  reproduces b19 and b18 exactly, warnings 0; (e) test-proofrefresh-b20
  12/12 incl. b19/b18 stale negatives; (f) ontology exit 0.
- Flagged deviation (not a prereg leg, not waived): the brief's "0/64
  rows differ vs the prior panel" does NOT hold — headline rows differ
  64/64 vs b19. Verified cause: determinism proven on this tip
  (capable/seed 7 run twice → byte-identical rows; single-case row ==
  full-panel row), so the movement is the funeral-mend game-code change
  shifting behavior and RNG streams, not panel noise. Aggregates: wins
  14 vs 16, entered 14 vs 16, national 13 vs 11, table 54 vs 56, wave-5
  13 vs 13, wave-4 62 vs 63, median 90d, vests 22 vs 23, vestsVillager
  44 vs 39. Direction is mixed (national up, but two capable rows lose
  their wins to village-lost at d77/d64) — filed in the arm evidence as
  a winnability-chain observation, not chased. Metric review proposes
  scoping the 0/64 check to rounds whose intervening changes are
  panel-invisible.
- Cache-flags load artifact: scored 0/4 under load (avg 25.47) in the
  owed-check, 3/4 mid-run, 4/4 on the same tip once the box quieted
  (avg 2.15) — proven by a 35.4s-wall probe vs the test's 30s spawn cap.
  No code changed between scores.
- Evidence: evidence/2026-11-15/sim-proofrefresh-b20.md (+ prereg,
  panel neutral-proofrefresh-b20.json.gz, test test-proofrefresh-b20.js).

## Wall numbers

- Successorcaution pilot (fresh control vs armed, 8 seeds, 150d):
  national-ever 7/8 both; median held-days 47.5 → 57; dissolutions 1 → 0;
  table 0/16; wins 0/16; median survival 117.5d → 125d.
- Funeral-mend confirm (adopted, 16 seeds): national-ever 14/16 ON vs
  13/16 OFF; end-state national 14/16 vs 8/16; dissolutions 0 vs 7;
  median held-days 63.5 vs 38.5; table 0/16; wins 0/16; wave-4 16/16;
  wave-5 7/16 vs 8/16; median survival 130d vs 121.5d.
- Proof panel rows (not a lever result): wins 14/64, entered 14/64,
  national 13/64, table 54/64, wave-5 13/64, wave-4 62/64, median 90d.
- The wall moves nowhere on table/wins this run: national now holds
  through funerals, but national villages still die holding their realm
  to scholar solo wave-4/5 deaths at full health.

## Infrastructure

- Reaper skipped cleanup at pre-flight (registry lock held by another
  reaper run, consecutive skips 3) — the known lock self-contention; the
  fix needs a Steve nod, so no action taken. No trees were touched.
- Safe-commit index clobber struck worker commits on both arms —
  repaired each time with the documented ls-tree -r pipe, commits
  verified correct, no work lost.
- `git gc` warning at merge time (too many unreachable loose objects) —
  housekeeping for the ship loop, not this run.
- Master moved under the run (journey-landing r135, Loop A 0547Z
  coordinator evidence 96c139d75, then this run's own merges). Loop A
  live on scale-onramp throughout (0547Z ove48 arms, then a new run on
  families 6b/7b) — NOT touched.
- Main tree clean at closeout; both trees released, branches deleted.

## Metric review

- Successorcaution: P1 is the right judge (the fighterhold metric
  review's rule — a lever that does not reduce scholar fight deaths
  cannot move held-days or dissolutions). The pilot gate worked exactly
  as designed: a working mechanism with a non-moving primary was killed
  before confirm spend. The fresh-control-vs-committed-corpus divergence
  (r206 drift) confirms the method rule: before/after must re-run fresh
  controls on the current tip.
- Proofrefresh: the 0/64 row-diff check cannot hold across game-code
  changes that move behavior; scope it to panel-invisible rounds (the
  arm evidence's metric-review proposal).

## Village assessment (plain words)

Two versions of the same eight villages, and a funeral that finally
mends instead of breaking. The realm used to fall apart the day someone
important died; now every funeral feeds the shaken links and the realm
stands — fourteen of sixteen villages end the season still national.
But the people still die the same way: a new bearer picks up the Codex,
walks out alone the same morning, and meets one wave-4 beast too many.
Telling the new bearer to stay home for two days works — the trips stop,
the first-day deaths fall by a third — and it changes nothing, because
the deaths just move to the same day the last bearer died, when the new
one inherits a fight already in progress. The village does not die of
grief anymore. It dies of the next fight, at full health, alone.

## Next blanks (winnability chain), in order

1. answercourt cost call (Steve / main session).
2. competent seat-taking BUILD (Steve-call).
3. Same-day scholar-death cascades — a game/driver-side break (NOT a
   daily-level policy gate; successorcaution proved the gate cannot
   touch deaths inside the death day's own `daily()` call).
4. Gap-3+ established-bearer deaths (37/88) — the deaths a 2-day
   caution window never reaches.
5. Veterans survivorship (design question).
6. Phone-frame receipt refresh.
7. Only-lead-shape second band.
8. Family 2b AMBIGUOUS (Loop A suspect list).

winnability chain stays converging (NOT converged): the hold now survives
funerals (0 dissolutions on 16 seeds) and the measurement proof is
current, but national villages still die holding their realm — scholar
solo wave-4/5 deaths at full health — and table/wins remain 0 on every
winnability band. scale-onramp stays converging (untouched; sibling Loop
A). food-economy stays converging (untouched; parked). Claim deleted;
lock deleted. Evidence: evidence/2026-11-15/sim-winnability-round-0621.md.
