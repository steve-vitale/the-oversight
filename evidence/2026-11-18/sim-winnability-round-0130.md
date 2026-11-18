# sim-winnability-round-0130 — COORDINATOR EVIDENCE (Loop B run fleshout-loop-b-20261118T0130Z, axis winnability-chain)

**Run:** fleshout-loop-b-20261118T0130Z · **Axis:** winnability-chain (converging) · **Loop:** oversight-flesh-out-loop-b
**Arms:** sim-expedroster-rejudge-b + sim-fightgate-scope-b + sim-triodrought-b
**Master at closeout:** (this commit — round evidence only; all three arms LANDED, merged locally pending ship)
**Claim:** `hidden_files/lever-claims/fleshout-loop-b-20261118T0130Z.json` (retired to `.DEAD` at closeout) · **Lock:** deleted at closeout.

## STALE-LOCK RECOVERY / ADOPTION (closeout by adoption)

The 0130Z coordinator delivered an incomplete report at 07:48:55Z
(07:48 UTC): pre-flight clean, expedroster re-judge complete, two cap
slots freed, but registration of the two arm workers failed
('unknown' status, no durable result) — no sims ran, no arm workers
spawned. The adoption coordinator (this run) verified death at
~07:53Z: no registered tree, no heartbeat, no live coordinator
process for the 0130Z run; lock `fleshout-loop-b-20261118T0130Z`
(created 2026-11-18T07:32:17Z) still in place; master at
`90f77c406`, main tree clean. The adoption re-verified the re-judge,
re-registered the arm workers, and closed the round.

Loop A was live the whole adoption (0647Z claim; its adoption
coordinator landed sim-notickexact-a, master `7975f7a08`) — NOT
touched. Lane B endgame r239 adoption (journey2-endgame) landed its
run note (master `62b1e749d`, gate tally 334/7) mid-adoption — NOT
touched; its merge moved master under the expedroster rebase once
(ff-only correctly refused, rebased, re-proved, merged).

## Arm 1 — sim-expedroster-rejudge-b: DIAGNOSTIC/TOOLING GO, LANDED

The 0430Z closeout predicted a re-judge of the expedroster instrument
under the corrected per-expedition gap bar would pass all three bars
with no code change. The 0130Z coordinator's re-judge (commit
`69194fd15`, on top of pilot `cb814633d` + instrument `5d68e7ea5`)
did exactly that. The adoption re-ran the proof (15/15) and analyzer
selftest (16/16) on the branch tip, rebased onto local master
(`b30a6367b`, then `62b1e749d` after the r239 merge), re-ran proofs on
each rebased tip, and ff-only merged. Landed `911c8db0c`.

| Bar | Result |
| --- | --- |
| Primary 1: capture rate ≥95% | **PASS — 16/16 = 1.000** |
| Primary 2: snapshot gaps = 0 | **PASS — 0 gaps** (was 111 under the frozen bar; 111/111 audited as home intervals) |
| Primary 3: join rate = 100% | **PASS — 6/6 = 1.000** |
| Pool floor (≥5 deduped wave-4 launches) | **MET — 16** |
| Proof green | **PASS — `scripts/test-expedroster-b.js` 15/15 (re-run by the adoption on the branch tip and on both rebased tips)** |
| Analyzer selftest green | **PASS — `scripts/analyze-expedroster-b.js --selftest` 16/16** |

The only change is `gapDays` in `scripts/analyze-expedroster-b.js`:
gaps are counted only within one expedition (one `sinceDay` run);
home intervals between expeditions are not gaps; rows without
`sinceDay` fall back to the old rule. Same corpus, no seed re-ran.
The scientific answer stands: launch members DO share tiles en
route — 13/16 together-en-route, 0 destination-only, 3 holder-only.
Tracker blank #4 (finding #2511's unanswered half) is CLOSED; the
instrument needs no further work.

## Arm 2 — sim-fightgate-scope-b: DIAGNOSTIC GO, LANDED

Finding #2506 (aid and world-tick meetings never consult the fight
gate). The worker decided DIAGNOSTIC, not a gate, from the code:
`winPlanFightGate` is called from exactly one place
(`expeditionMonster`) — there is no SEEK decision on the wild paths
to gate; the SEEK gate itself is not on master (held on
sim-seekgate-b); the gateable thing on wild paths would be a *new*
avoid, and whether it matters was unmeasured. Fresh band
104301–104308 (first pick 104201–104208 was caught as a collision
with the expedroster prereg and avoided before any sim ran), 8 seeds,
150d, competent verbatim, substrate `VETREENGAGE=1 + PARTYSIZE4=1 +
FLEEREPAIR2=1`, one census leg. Proof 53/53 + selftest 22/22,
re-run by the adoption on the rebased tip. Landed `5fac3cb71`.
No `src/js` change.

| Bar | Result | Numbers |
| --- | --- | --- |
| D1a (completeness): wild meetings unclassified | **PASS** | 0 unclassified of 113 wild meetings |
| D1b (population): wild wave-4+ meetings | **PASS** | 113 (>= 40) — world-tick 62, aid 51, patrol 0 |
| D2 (Suburb presence): wild Suburb meetings | **PASS** | 8 (>= 3) — all on seed 104307 |
| D3 (classifier validity): replica vs live gate on expedition rows | **PASS** | 47/47 = 1.000 (>= 0.95, n >= 5) |
| Instrument | **CLEAN** | 8/8 files, exact frozen seed list, 0 instrument errors, missingHp 0, recMismatch 0 |

The answer: 113 of 160 wave-4+ meetings arrive by world-tick or aid
against 47 by expedition. The expedition gate would have avoided **18
of the 113 wild meetings (15.9%), all by the outmatched rule**; the
veteran-guard rule fired nowhere (0 wild, 0 of 73 live gate calls).
Cost of the 18: 2 villager deaths (both eulogy) + 10 flees carrying
288 damage; 16/18 are eulogies, trick already known on 14/18. Against
11 wild wave-4 deaths total, the avoid surface covers 2. **The Suburb
slice shows no harm:** all 8 wild Suburb meetings are round-1 flees,
0 damage dealt, 0 deaths — 2 pre-learning morale flees, then 6 wise
leaves once the trick lands. Post-learning, the wild Suburb meeting
is already correct as fought. **The launched-party slice is empty —
honestly unanswered, not answered-no:** 0 wave-4 launches on the band
(131 launches are all wave-3 hunts; standing caps at 199 on 5/8
seeds), so no wave-4 party ever set out to be jumped. Next arm: an
outmatched-avoid on the wild routers, priced at 2 deaths + 288 flee
damage per 113 meetings; the launched-party slice needs a band where
wave-4 parties actually launch; the veteran-guard half is unmeasured
(needs a table-stage veteran to exist first).

## Arm 3 — sim-triodrought-b: BUILD GO, LANDED

Finding #2518 (vetreengage's second-companion pick fired 0/17 wave-4
launches on band 103901–103908). The diagnosis refuted the
Haven-idle-pool hypothesis and found the root cause: `writeCommit`
(`src/js/villager-brain.js:638`) copied `companion` into the stored
dawn commit but never copied `companion2`/`companion3`, so
`vbrainExecuteDepart` always read `undefined` and launched a pair.
The pick itself works (on the frozen launchparty corpora, the dawn
candidate carried a second companion on 16/17 launches; the pool
upper bound was ≥1 on 41/45 snapshots). It is a revert casualty:
`656f4fc3b` (producergate-b, 2026-11-15) added the carry;
`72a6efc99`, 41 seconds later, reverted that arm wholesale including
the carry; vetreengage later re-added the pick and the execute launch
but never restored the serializer. The fix is exactly the reverted
lines (plus a comment naming the revert): `companion2:
chosen.companion2 || null, companion3: chosen.companion3 || null`.
No `needsFull` gate restored, no env flag — the carry is inert unless
a candidate sets the field (`companion2` only under VETREENGAGE;
`companion3` is set by no candidate on this tip). Fresh band
104011–104018, 8 seeds/leg, 150d, competent verbatim, substrate
`VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`. Proof 12/12 +
selftest 13/13, re-run by the adoption on the rebased tip. Gate on
the final tip: `check.js --quick` **334 passed, 7 failed in 936s** —
the 7 are the standing set (measurement-proof staleness pair,
cache-flags load artifact, phone-frame stale receipt, ladder-bundle
control, 3× 120s timeouts under load), 0 attributable to the change.
Landed `7c2ccfabe`. **Game-code change (2 lines, `src/js`); the
ship loop owns the live check.**

| Check | Result |
| --- | --- |
| Primary: trio-launch rate (arm ≥ 50% AND arm−ctl ≥ +30pp) | **PASS** — arm 22/25 = 0.88, ctl 0/18 = 0.00 (+88pp) |
| Pool floor (≥6 wave-4+ launches per leg) | **MET** — ctl 18, arm 25 |
| Secondary: carry rate (candidate c2 → depart c2) | arm 22/22 = 1.00, ctl 0/17 = 0.00 |
| Secondary: companion-slot fill at launch | ctl 17 companions / 18 launches; arm 45 / 25 |
| Cost bar: starvation (arm ≤ ctl+2) | **PASS** — totals arm 0 vs ctl 1; villager arm 0 vs ctl 0 |
| Cost bar: median survival (arm ≥ 0.8× ctl) | **PASS** — arm 150d vs ctl 150d |
| Proof green | **PASS** — `scripts/test-triodrought-b.js` 12/12 |
| Analyzer selftest green | **PASS** — `scripts/analyze-triodrought-b.js --selftest` 13/13 |
| Instrument | **CLEAN** — 0 instrument errors on all 16 per-seed files |

Every launch where the candidate carried a second companion departed
as a trio on the arm (22/22) and as a pair on the ctl (0/17). The 3
arm non-trios are genuine pick misses (candidate c2 null — pool empty
at scoring). The arm launched more wave-4 plans (25 vs 18),
downstream of the trios (villages that launch trios keep holders
alive to re-launch). **Wins are still 0/16** — the launch is fixed,
the road after it is still the same road. Open threads: the
launchparty confirm still needs the sense fix + this fix together
(the LP subset metric was NOT re-judged here); `partyTrios` is still
a broken counter (0 on both legs despite 22 arm trios — only the
win-plan depart path bumps it, and that path fired 0 times on this
band); the win-plan depart path is live code with no measured
exercise. Finding #2518 is FIXED by this landing (coordinator's
call — the worker left it [open] in `sim-findings.md`; see tracker
entry).

## Wall (this run's judged corpora)

| Corpus | National standing | National rank | Table | Wins | Wave 4 | Wave 5 | Median survival | Survived |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| expedroster 104201–104208 | 2/8 | 0 | 0 | 0 | 6/8 | 2/8 | 125d | 4/8 |
| triodrought ctl 104011–104018 | not panelled | 0 | 0 | 0 | 7/8 villages reached wave 4+ | 2 seeds reached wave 5 | 150d | 7/8 |
| triodrought arm | not panelled | 0 | 0 | 0 | 7/8 villages reached wave 4+ | 3 seeds reached wave 5 | 150d | 6/8 |

Fightgate-scope 104301–104308 was a diagnostic census, not a wall
panel (no national/wins/survival table): standing caps at 199 on 5/8
seeds, 11 wild wave-4 deaths on the band, 0 wave-4 launches.

The wall is unchanged: no table, no wins anywhere. The standing-199
stall dominates (5/8 fightgate villages parked at exactly 199; the
triodrought arm climbed past it on two seeds — standing 500 on
104014 — but no seat followed). The launch decision + damage wall
stands (launched parties ≤11–25% of wave-4 HP in prior rounds; this
round fixed the launch itself — trios now depart — but wave-4 kills
and the deed gate after national are still the binding links).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-18/perseed-triodrought-b-ctl/*.json' --metrics
national,table,wins,exiled` and the same against
`perseed-fightgate-scope-b-diag/*.json`: **REFUSED recorder-corpus
input** (all 8 rows carry top-level anchorCommit — sweep recorder
rows, not runs; same documented refusal as prior runs). Baseline NOT
rolled. No LOUD lines beyond the refusal.

## Infrastructure notes

- **Write flap, two windows (cause still unestablished).** 08:00:11Z–
  08:02:21Z (02:00:11–02:02:21 CST, 3 failing cycles, boot
  `158a2ca2`, VM replaced ~07:47Z) and **08:28:20Z–08:34:38Z (7
  consecutive failing cycles, the longest recent window)**. Both
  windows killed an expedroster checkout at its final index write:
  the first left a purged index (every tracked file shown as deleted;
  files byte-identical to HEAD); the second made `git worktree add`
  fail after a ~14-min checkout and git cleaned the directory up.
  The flap-watch log pins both windows (probes A/B/E/G/H EPERM
  errno 1 at the write step; strace EPERM-blocked on its own log).
  Writes recovered 08:03:26Z and ~08:35:39Z; next cycles ALL-OK.
- **Registration interruption (adoption lesson).** The adoption's
  first expedroster re-registration queued ~8 min on REGISTRY.lock,
  then its checkout hit the 08:00Z flap; the adoption killed its own
  backgrounded registration wrapper while it was stuck in a slow
  `git status` — that kill likely prevented the registry entry from
  being written, so the worktree existed unregistered and the reaper
  removed it. Do NOT kill a registration wrapper mid-flight.
- **0230Z supersession scare (resolved).** A scheduled Loop B run
  0230Z did a stale-lock recovery at ~08:32Z: it found the 0130Z run
  dead (no tree/heartbeat/process/evidence — all true, because the
  flap had killed the adoption's registrations), deleted the 0130Z
  lock, retired its claim to `.DEAD`, and started a competing
  expedroster registration. The adoption coordinator was in fact
  alive and registering all three arms; the 0230Z run stood down at
  ~08:46Z, killed its own registration mid-checkout, and restored
  the 0130Z lock + claim byte-identical (its note is in
  `~/memory/2026-11-18.md`). Lesson recorded by that run: check `ps`
  for live coordinator processes before any stale-lock recovery
  during flap windows. The adoption then stood down its own
  in-flight registrations (killed the expedroster retry-3 checkout
  before the registry entry was written; closed both arm workers)
  and re-registered cleanly once the 0230Z run was gone.
- **Registry-lock contention.** The reaper skipped repeatedly on a
  lock held by live registrations (consecutive skips grew through
  the morning); holders were live processes, not stuck ones. The
  register script's self-unblocking reap runs 9–14 min before the
  cap check, so each registration holds the lock ~15–20 min and
  three registrations serialize to ~45 min of wall time.
- **Runtime restart mid-gate.** The first triodrought gate run was
  killed ~2.5 min in by a runtime restart (log showed 125 dots, no
  summary); re-run solo to completion (334/7, 936s).
- **Safe-commit index clobber** hit the arm workers' commits
  (repaired via the `ls-tree -r` pipe each time; commits verified
  correct). No work was lost in any incident: every branch
  (`sim-expedroster-b` 69194fd15, `sim-launchparty-b` f5274f4d6)
  verified intact in git throughout.
