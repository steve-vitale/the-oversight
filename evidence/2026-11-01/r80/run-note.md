# Journey social r80 — RUN NOTE (lane B, 2026-11-01)

Leg 5 (social life), seeds 7001-7004, 140/141d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 3d2fafa1f
at fork (sibling sim-dipslide landing absorbed by fast-forward
before forking; a second sibling landing, sim-wave4leth-a 280b6a89c,
arrived mid-run and is rebased onto at closeout). Driver:
scripts/journey-social-r80-20261101.js (r79 verbatim except fresh
seeds + evidence dir). Wedge: scripts/journey-social-r80-outing-
wedge.js (r79 verbatim, rename only). Proof test
scripts/test-journey-social-r80-outing-wedge.js 56/56 on SEED=42
and SEED=7 BEFORE seeds ran. Smoke 7005 (30d) PASS. Measurement
seeds ran with ZERO src/js changes; this run measures the r79
away-split question and accumulates the acquittal batch, it does
not change the game.

## Pre-flight

- Main tree `git status --short` empty; disk 22%. Reap: nothing
  removed; sibling dirty trees left untouched (including the
  journey2-crisis-r90 and journey2-succession-r86 trees with stale
  heartbeats and uncommitted changes — not mine, left alone, flagged
  for main-session inspection as r79/r90 did). Lock: none held at
  start (no stale-lock recovery needed). Rotation-b read 5 at run
  start (the endgame r95 closeout wrote 4 -> 5); this run plays 5
  and writes 6 at closeout (verified by re-read).
- Worktree journey2-social registered + heartbeated (registry read
  back every time; manual heartbeats at each major step, never a
  background loop — r79's silenced-loop lesson). Two infra notes:
  (1) registration took ~5 min, not stuck: the checkout itself
  writes ~67k files (evidence/ + scripts/ bulk) and the
  `git reset --hard` step progresses visibly; do not kill a slow
  register on this repo. (2) REGISTRY.lock queues: a sibling
  register (sim-shelling-b, 15:22Z) held the lock for its own slow
  checkout, and my heartbeat queued behind it — it landed at
  15:27:51Z, inside the 15-min window, but a heartbeat that only
  prints without a registry read-back proves nothing; every beat
  here was read back.
- Canon: docs/CANON.md + docs/CONVERSATIONS.md + docs/DIRECTIVES.md
  read before judging; the previous-bearer refusal was traced to
  src/js/favor-forage.js:114 (bearer check, cited by file:line).
  No canon doc covers moot convening in full; the code is the
  source. Gating freeze (2026-10-27) untouched.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. Arms differ by
construction (hands-off vs probe), so arm comparisons are
descriptive, NOT a balanced-panel before/after claim against r79
or between arms. This run is a FRESH baseline for the gate era,
not a fold into r79's numbers. The split-run shape is declared:
seeds ran as pilot 7001, then 7002-7004 (smoke re-ran each time,
harmless); the verdicts file from the 7002-7004 invocation was
renamed to r80-verdicts-7002-7004-partial.json so it can never be
mistaken for a pooled verdicts file, and the analyzer read the
four per-seed JSONs directly. No determinism claim is made for
r80 (no re-run was performed).

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers |
| 7001 | handsoff | 140 | 7 | 48 | 6 | 6 | 6 | 5 | 6 | 6 | 6 |
| 7002 | handsoff | 141 | 8 | 12 | 5 | 5 | 1 | 9 | 1 | 1 | 1 |
| 7003 | mootprobe | 141 | 8 | 29 | 8 | 7 | 7 | 6 | 6 | 6 | 6 |
| 7004 | mootprobe | 141 | 2 | 60 | 9 | 9 | 3 | 11 | 2 | 2 | 1 |
| POOLED | — | — | 25 | 149 | 28 | 27 | 17 | 31 | 15 | 15 | 14 |

Starts 17/27 accepts (63%, r79: 75% — descriptive only; different
seeds, and the dip sits in 7002's node-elsewhere wall and 7004's
collapsing village + bearer change, not in the outing mechanic).
Delivers 14/17 starts (82%, r79: 94%). Blocked decomposition:
away 14, no-micro-pos 9, node-elsewhere 7, micro-far 1. All four
villages reached the horizon (7004 with only 2 alive — standing,
not scattered or extinct).

## Q1: AWAY SPLIT (B4) — HOLDS, trips vs leavers separated

14 away blocks, 0 missing computed return (binding holds).
- TRIPS (returning): 12 blocks, gaps +1/+2/+3/+4/+7/+9/+10/+15/+16
  days. The tail is wider than r79's +1..+5 — wider sampling of
  the same mechanism (sinceDay + duration are trip data, not a
  tuned number), not a mechanism change. Reported split, not
  averaged into the leaver sentinel.
- LEAVERS (no-return sentinel): 2 blocks, both Chantal on 7004
  (d23/d24, purpose leave, sinceDay 1, duration 999, computed
  return 1000 — gone since day 1, the same shape r79 found with
  Brian/Aurora). Her favor burned its two dawn attempts (meet day
  + next day) and then stopped — no runaway weekly loop, same as
  r79's leaver shape. Descriptive, not a defect claim.
The unsplit histogram is still printed in the analysis for
continuity with r79 (it mixes the 976/977-day leaver gaps in).

## Q2: acquittal batch (B3) — cumulative 27/29 acquit, AND the conviction replication (with a catch)

r80 trials: 11, of which 10 acquitted and 1 convicted.
Cumulative with r77 (1 acquit, 1 convict), r78 (8 acquit) and r79
(8 acquit): 29 trials, 27 acquitted, 2 convicted.
- THE CONVICTION: 7004 case_2 (ambush of Tom, accused
  Vera/Chantal/Ruby). NPC guilty 4 of 8 present, need 5 of 9 —
  the room alone did NOT reach need. The driver's guilty vote
  (Evelyn, d9, probe arm) tipped it to final 5: convicted=true,
  resolution=cold_war. This is the convicted-room replication r79
  wanted, but it is a PLAYER-TIPPED conviction, not an NPC-room
  conviction: the r77 unanimous-guilty room remains the only
  NPC-only conviction in 29 trials. The new finding is sharper
  than "convictions happen": the player's vote CAN be decisive
  when the room sits 4-4 — the first decisive player vote in the
  probe arm (r79: never decisive; r80 probe trials otherwise:
  guilty votes moved 0->1, 1->2, 0->1, 2->3, never to need).
- Player-vote reading (unchanged): on hands-off trials with
  playerVoter=true and no driver vote, the player's seat went
  unused (the backstop counted without them, as r79 showed).
- All 11 trials carry trialDetail + SAY lines (B1 holds);
  hands-off case-menu picks 0 (arm was hands-off).

## Q3: autonomous convening (B2) — OBSERVED again

- 7001: 2 eligible cases, 2 convened -> AUTONOMOUS CONVENING
  OBSERVED (replication of r78/r79).
- 7002: 3 eligible cases, 3 convened -> OBSERVED (including the
  murder case_6, target August — the ambush victim of d41).
- No accused_died partial this run; no convenable case went
  unconvened.

## Q4: end-blocked (the open question) — FIRST DATUM, bounded not looping

7004 Henry (favor-henry_zhang-123-50): accepted d123, started
d124 ("Two pairs of eyes, twice the ground"), foraged cleanly
(3x Wild Black Cherry each, 210 + 210 kcal), talked — then Henry
died d124 (monster) and delivery blocked d124-d131 (8 attempts,
haul 420 kcal held throughout, reason "Your partner is no longer
available for this outing"), closing ONCE at d132 as
outing-end-blocked with stuckDays 7. The favor released, not
kept. So the end-blocked shape is: daily delivery attempts while
the partner is unavailable, then ONE closure after a 7-day stuck
window — not a weekly loop, not a runaway. The question this
datum opens (not answered here): what happens to the 420 kcal
haul after the closure — kept in packs, returned, or lost? That
is the next run's instrument item, not a defect claim.

## Q5: previous-bearer (succession visible inside the social leg)

7004 Zhomart (favor-gen_0v9hlci-27-14): accepted d27, started
d28, fought through combats, hit barren nodes, broke d30 on its
deadline — and kept foraging to d37, when all 18 remaining cell
attempts refused with "That outing belonged to the previous
bearer. It is not your promise." The mechanism is
src/js/favor-forage.js:114 (outing bearer must equal the current
villagerId; after a succession the new bearer is refused). So a
succession happened on 7004 between d28 and d37 — the social leg
watching the succession leg's event in the wild. Which death was
the scholar's is NOT instrumented in this driver's JSON
(rosterByDay carries living counts only; d37 also holds Evelyn's
alien death and Felipe's expedition death) — reported as an
instrument gap, not guessed. The refusal itself is correct
behavior: a dead bearer's promise is not the new bearer's to
finish by foraging.

## Q6: gate (B7) — HOLDS, strongest panel yet

Pooled: 199 nonverbal convos, ALL without interpreter, ZERO case
offers while thread=nonverbal with no interpreter (badOffers
empty on all four seeds). 7003 alone contributes 87 clean
nonverbal convos. No seed was interpreter-mediated this panel
(r79's 6 interpreter convos are not replicated — absence, not a
gate change). B7 HOLDS.

## Q7: broken-origin (descriptive; CLOSED by r78, consistent here)

Log-trace windows: 7003 Jovan 1 (broken d50 -> later start d58,
gap 8d); other seeds 0. Final-ledger method: 0 windows on all
seeds (same method gap as r79 — the final ledger's broken favors
have no later start). Broken promises still do not brick a
villager's outing future.

## Village assessment (plain words)

- 7001 (140d, standing, 7 alive): the bonded village. 48 deep
  bonds (the panel's deepest), 6/6 outings delivered, 2 autonomous
  trials (both acquitted). Deaths: Amy d68 (monster), Gus d111
  (contest), Ray d117 (the wild), Lorenzo d130 (the wild).
  Ivy asks for the ridge above the creek and means it.
- 7002 (141d, standing, 8 alive): the quiet village. 27 deep
  bonds, only 1/5 outings started (its wall was node-elsewhere,
  partners on the wrong map node — not refusal, distance). 3
  autonomous trials (all acquitted), including the murder trial
  for August, ambushed d41. Deaths: Leah d12 (the wild), Jack d41
  (a stranger), August d41 (ambush).
- 7003 (141d, standing, 8 alive): the grieving village. 24 deep
  bonds, 6/7 outings delivered, 4 probe trials (all acquitted,
  player's guilty vote +1 each, never decisive). Eleven dead:
  Sari d17 (ambush — the case target of all four trials), Dale
  d27 (sickness), Ruben d41 (contest), Yuyun d52 (the night),
  Eli d54 (monster), Zodwa d64 (a wound that wouldn't close),
  Olivia d84 (monster), Zoe d131 (The Audit — cause as recorded),
  Frieda d135 (the wild), Rodrigo d140 (wound_fever), Ethel d14
  (the wild). Its social fabric (24 deep bonds) outlived a third
  of its people.
- 7004 (141d, standing, 2 alive): the village that nearly ended.
  23 deep bonds, 3/9 outings started, 1 convicted trial (the
  player-tipped cold_war verdict above), a succession mid-outing
  (Zhomart), a partner dead mid-outing (Henry), and twenty dead
  overall — monsters 8, the wild 6 (four of them on d140 alone),
  wounds 2, aliens 1, expedition 1, night 1, contest 0. Nikos
  talks tiredly at d100 and dies to a monster d102. Two people
  still stand at the horizon.

## People check (sense reads, full transcripts)

Five reads (binding: 5, >= 2 outing-related — this run: 2
outing-related, 2 moot-probe, 1 late). 0 fabricated-history flags,
0 weak endings. PEOPLE PASS.
- Ivy, 7001 d9 (favor accept, outing-related): pantry-bare ask,
  concrete plan (ridge above the creek, first light, pack and
  knife), gossip with a real warning (Lorenzo eating grey meat
  raw), a grudging invitation accept ("...Fine. This had better
  be worth it."), ends on the plan line. Real.
- Dale, 7003 d9 (favor accept, outing-related): concrete plan
  (meadow edge west of the creek), roster-grounded gossip
  (Olivia the social worker, Pradapdao the locksmith, a nudge
  toward Jovan), warm close. Real.
- Ruben, 7003 d11 (moot probe): 3 turns — a taken/Pietro
  question, then case framing (ambush of Sari — grounded, Sari
  is the trial target), moot called, convo ENDS there. Real —
  and the hygiene proof.
- Henry, 7004 d9 (moot probe): 1 turn — a sleep question, an
  edge line ("something curdled"), case framing (ambush of Tom
  — grounded), moot called, convo ENDS there. Real — and the
  hygiene proof. This is the case that later convicted with the
  player's vote; the probe convo itself claims nothing it does
  not show.
- Nikos, 7004 d100 (late): a question about the kindest thing,
  the player's food-sharing answer reflected back as "quiet
  generosity... holding this whole thing together," gossip (Tom
  out for water, talk about Theo), recall handled, tired-smile
  close. Real — and poignant: Nikos dies to a monster d102,
  two days after this conversation.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (63% of accepts start, 82% of
  starts deliver — the start dip sits in a walled seed and a
  collapsing village, not in the outing mechanic), YES for the
  gate (199/199 clean nonverbal convos), YES for autonomous
  moots (5/5 eligible convened), and now YES for the end-blocked
  shape (one bounded closure, not a loop) and the previous-bearer
  refusal (a succession correctly stops a dead bearer's outing).
- FUN: yes — the justice story still plays without the player
  pulling strings, the player's vote finally mattered in a 4-4
  room, broken promises still don't brick villagers, and the
  transcripts read like people: grudging accepts, tired smiles,
  gossip that names real roster facts. The audible gaps are now
  precise: the end-blocked haul's fate, and which death changed
  the bearer on 7004.
- WINNABLE: not this leg's question to close — social life feeds
  the win (122 deep2 bonds pooled, 14 delivers, 11 trials) and
  all four villages stood at the horizon; the two that thinned
  did so by monsters, the wild, and succession, all with named
  causes.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
LOUD lines, all three the same artifacts as r73-r79, all explained:
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 122 =
  48+27+24+23), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT — current field is top-level mootsConvened (0 on
  all four seeds, itself the v.moots metric artifact fixed by
  B1's trial count of 11). Not a game bug.
- LOUD `alive newly appeared: baseline 0 -> current 25`:
  BASELINE-SHAPE ARTIFACT — pooled alive 25 = 7+8+8+2. Not a bug.
- l3.bonds and dryRate: quiet. Pooled dryPerConvo 0.28 / 0.30 /
  0.31 / 0.38, inside the [0.20, 0.40] guardrail (7004 at 0.38,
  near the top but inside).
Baseline NOT rolled forward: the stored baseline is a
different-era shape, and rolling it would launder the artifacts
into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 280 passed, 10 failed in 1460s — slowed by a
concurrent sibling check (journey-scale, same window), which is
also the adjudication story. The 10 failures:
- The SAME six pre-existing failures as r73-r79, adjudicated by
  name, zero new from r80: measurement-proof-update (stale
  balanced-panel proof), measurement-workflow (retained
  neutrality proof), mobile-combat-cadence (Continue wraps the
  round twice), occupation-panels (real CLI workflow),
  phone-frame-proof (3 fails: retained browser inputs vs current
  source; boot-input coverage; stale phone receipts),
  establishment-r20-fixes (racks-full voice gate).
- FOUR concurrency/starvation artifacts, all proven solo AFTER
  the sibling check finished: measurement-cache-flags (check
  failure 0/4 -> solo 4/4 PASS), trust-observer-neutrality
  (120.1s TIMEOUT -> solo 6/6 PASS), synergy-stall (120.1s
  TIMEOUT -> solo EXIT 0), capable-bot-20261014 (120.2s TIMEOUT
  -> solo 38/38 PASS). The timeout trio shows partial progress
  then `[check.js] TIMEOUT after 120s` — starvation under two
  concurrent 4-parallel check runs, the exact class repo AGENTS.md
  warns about. No failure is attributable to r80: the run is
  instrument-only (zero src/js diff) and no committed test
  references the four new r80 files.
Full output in check-quick.log in this directory; solo re-run
outputs were read from the terminal (cache-flags 4/4,
trust-neutrality 6/6, capable-bot 38/38, synergy-stall exit 0).

## Metric review

- Bindings B1/B2/B3/B4/B6/B7 judged as written. B1 holds
  (caseSnaps + mootSayLines on all four seeds; trials by
  first-trial-appearance = 11). B2 holds as OBSERVED on 7001
  (2/2) and 7002 (3/3). B3 holds as census (11 trials,
  descriptive + cumulative lean at n=29: 27 acquitted,
  2 convicted — with the conviction split into 1 NPC-only
  (r77) and 1 player-tipped (r80) stated explicitly, not folded).
  B4 holds (14/14 away blocks carry the field; trips and leavers
  reported separately). B6 holds (5 reads, 2 outing, 0
  fabricated, 0 weak; probe reads end at convening). B7 holds
  (badOffers 0; no seed UNMEASURED — every seed had nonverbal
  convos, all without interpreter).
- Guardrails: pooled dryPerConvo 0.28 / 0.30 / 0.31 / 0.38 — all
  inside [0.20, 0.40].
- Analysis clarifications, not bar changes: (1) the away gap
  histogram must be read split — the unsplit tail (976/977)
  is the leaver sentinel, not a trip; (2) the funnel's
  completeOutings snapshot (2/0/2/0) vs events (6/1/6/1) gap is
  the known snapshot-vs-events shape, not missing delivers —
  deliver events ok = 14, missed-line-but-kept-true = 0;
  (3) 7004's deliverBlocked count (8) is entirely the Henry
  end-blocked sequence, not eight separate failures;
  (4) 7004's 18 previous-bearer cell blocks are one outing
  (Zhomart d37), not eighteen.
- Instrument hazard, same class as r79/r90: check.js output
  under a concurrent sibling check is not a clean baseline —
  the 4 extra failures all cleared solo. A loop run's
  no-regression verdict must name concurrency before claiming
  a new failure.
- Revisions proposed for the NEXT run (r81), not applied
  retroactively:
  1. END-BLOCKED HAUL: record what happens to the haul after an
     end-blocked closure (packs? pantry? lost?) — Henry's 420
     kcal is the standing example.
  2. ACQUITTAL BATCH: keep accumulating; the wanted replication
     is now specifically an NPC-ROOM conviction (r77's unanimous
     room is still the only one) — player-tipped convictions
     are a separate count.
  3. BEARER IDENTITY: record the scholar's identity across
     succession in the social driver so a previous-bearer
     refusal can name the death that changed the bearer.
  4. TRIP TAIL: keep the split census; trips now span +1..+16.
  5. DORMANT RE-ENTRY: still a design question for Steve, not
     a worker decision.
  6. END-BLOCKED: no longer "no data" — one bounded datum
     exists (Henry); the question narrows to repetition under
     other end causes (partner away? partner exiled?).
- Watch items carried: terse case-action prose ("The ground
  remembers."); final trial states must be read from the LAST
  snap, not the first-trial snap; 7003's "The Audit" death
  cause and 7004's d140 wild cascade are recorded as recorded,
  not investigated here; the r75 target-aware walk fold into
  policies/competent.js is still owed, still not taken here
  (panel re-baseline required).
- Decision note (delivered, not implemented): whether the r75
  target-aware walk + dawn step-first retry fold into
  policies/competent.js — still owed, still not taken here
  for the same reason as r80 (panel re-baseline required).

## Files

- Driver: scripts/journey-social-r80-20261101.js (r79 verbatim +
  fresh seeds + evidence dir; zero game-behavior change).
- Wedge: scripts/journey-social-r80-outing-wedge.js (r79 verbatim,
  rename only).
- Proof tests: scripts/test-journey-social-r80-outing-wedge.js
  (56/56, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r80-outing-20261101.js
  (r79 verbatim + away trip/leaver split + R80 label renames).
- Evidence: evidence/2026-11-01/r80/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/, r80-analysis.txt,
  r80-verdicts-7002-7004-partial.json, run-pilot.log,
  run-rest.log, check-quick.log).

## Closeout

- (filled at closeout)
