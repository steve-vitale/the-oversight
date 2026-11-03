# journey-scale r91 — Lane A, leg 3 SCALE (2026-11-03)

**Run id:** laneA-scale-2026-11-03T07:45CST (scheduled 07:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout (run completed).
**Base:** master@6fb93c5c4bdf8be613f7373d26d080df068e83a9 at branch creation.
**Pre-register:** evidence/2026-11-03/journey-scale-r91-prereg.md
(committed before any scored seed ran).
**Change set at closeout:** ONE src/js narration-only change
(ledger.js playerDeath, +14 lines) + its proof test + r91
driver/analyzer clones + evidence + run note. Zero data changes, zero
gate/threshold/number changes. Gating freeze honored; perception law
honored (all instruments read-only; pickers press offered menu items
only).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 26%,
  `git pull` already up to date at start (master later moved to
  6fb93c5c4 when a sibling merged sim-sortieretry-a — that landing,
  not this run, moved the base; this run's branch was cut at the new
  HEAD).
- **Registration queued ~25 min + checkout ~13 min:** the registry
  lock is serialized across every agent's register/reap/heartbeat,
  and each worktree checkout writes gigabytes (this repo's evidence/
  tree). A sibling's `git reset --hard` (3.9 GB written) held the
  lock ahead of this run; then win-national's checkout, then a reap,
  then this run's checkout. Nothing was stuck — the queue drains in
  order. No action; patience is the correct response, and killing a
  sibling's checkout to jump the queue would corrupt their tree.
- **Heartbeat: EPERM flap + queue (loud, recovered):**
  the first manual beat FAILED with PermissionError writing the
  registry tmp file (the container EPERM flap class, same as the
  2026-10-23/24 incidents) — the `| tail -3` pipe masked its exit
  code, which is how the failure first hid. Retry + 5-minute logged
  loop beats then queued ~30 min behind the flock line (sibling
  checkouts hold it for ~10 min a turn). The recorded heartbeat
  (14:15:20Z, registration time) went stale past the 15-minute
  overlap window — but far under the reaper's 4-hour threshold, so
  the tree was never at risk, and no competing lane-A run was due
  before closeout. A beat finally LANDED 15:22:20Z, verified by
  read-back (not trusted from the loop's existence — r90 lesson).
  The loop is killed at closeout either way; the release, not a
  beat, ends the run.
- **EPERM flap on worktree writes (recovered):** a sed→/tmp→cp chain
  produced 0-byte files twice (prereg + driver clone) and a plain
  `cp` failed with "Operation not permitted". Recovery: muse.write
  for the prereg, retry-until-cmp loop for the copies. All files
  verified byte-identical (cmp) before use.
- **Safe-commit index clobber struck on BOTH commits**, same class
  as r66–r73/r90 — and in two shapes: (1) prereg commit 4704b5df1
  correct, main index showed all 4 files staged-as-deleted +
  untracked; (2) fix commit 66f5d33b5 correct, main index held the
  PRE-fix blob as staged. Repaired both times via HEAD-blob
  cacheinfo, verified: `git status` clean, `git diff HEAD` empty,
  hash-object matches HEAD for every file. The commits themselves
  were always correct.

## Q2 — MANTLE-PASS REACTOR VOICING: LANDED (the delivery)
**The carried r90 proposal is now code, proven, and seen in a real
run.** When the mantle passes from a fusion_reactor bearer to a
successor who does not hold it while the pellet stays installed,
the game now says aloud (ledger.js playerDeath, immediately after
the mantleBecome try/catch):

> "The warm hum behind your ribs is gone. The reactor went with
> [bearer's] body — it does not come out, and it does not pass on.
> Hunger is back on the table. (One reactor per world, and the
> world already spent its one.)"

Guarded by had-reactor-before AND installed AND NOT-has-reactor-
after, so it fires ONLY in the silent-loss case: a successor who
already holds the world's reactor keeps it (mantleBecome's
villager-holder branch) and hears nothing, and a bearer who never
held it triggers nothing. Narration only — no state, number, gate,
or threshold changes; the mechanism (ability per-bearer, flag
per-world, no second reactor) is untouched.
- **Proof test** scripts/test-mantle-reactor-voice-r91-20261103.js:
  RED on base (6 pass / 2 fail — exactly the two voice checks),
  GREEN with the fix (8/8): line fires, online() false after,
  installed flag still true, ability not inherited, and no second
  line at the next death (the next bearer never held it).
- **Panel confirmation (pilot seed 85091, a real run, not the
  test):** pellet installed d25 (bearer Declan, gen_19dh7t0) →
  online true, hasAbility true → bearer dies d30 → successor
  gen_n72fwko: installed STILL true, online false, hasAbility
  false — and the voice line fired exactly once, in capture:
  "The reactor went with Declan's body…" Analyzer: install day
  25, flips 2 (false→true at install, true→false at succession).
  The other three seeds never installed (flips 0), so no line was
  expected there — and none fired. No over-firing anywhere.
- **Fix-gate verdict: ALL THREE CLAUSES HELD** — (a) RED→GREEN
  proof test above; (b) silent-loss-only firing, verified by code
  inspection + the second-death control; (c) check.js --quick
  shows no NEW failure vs the r90-known 6 (see Tests). Landed
  with `[needs-eyes]` — Steve should hear the line on his phone
  at the next succession after a pellet install.
- **Out of scope, named:** the nomad.js road-wipe path also calls
  mantleBecome directly (no playerDeath, no voice line). The road
  death beat is a separate narration context; voicing there is a
  follow-up, not smuggled into this change.

## Q1 — SCALE CONTINUITY: fresh quad 85091–85094 (all on fixed code)
Pilot 85091 ran first, no crash → quad expanded per prereg (the
pilgrimages==0 pilot does NOT stop this run — stated in the
prereg before any seed ran, so this is not a mid-run re-score).
Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=1, DAYCAP
180, death-aware stop (+10d tail max).

| seed | end | day | pop | pantry | rank | seat | arc | waves w1/w2/w3/w4/w5 | contests | crises | trips* | peer props |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 85091 | SCATTERED (hunger, 3rd day) | 94 | 4/4 | 0 | regional | none | 3 | 16/9/5/2/0 | 4 | 4 | 0 | 4 peer + 1 lead |
| 85092 | SCATTERED (hunger, 5th day) | 90 | 5/5 | 0 | regional | none | 3 | 20/6/5/4/0 | 8 | 4 | 4 | 6 peer + 1 lead |
| 85093 | DIED OUT (last bearer died) | 115 | 0/0 | 13842 | regional | lesser (waiting) | 4 | 15/8/6/1/0 | 16 | 3 | 39 | 1 peer + 1 lead |
| 85094 | SCATTERED (hunger, 5th day) | 68 | 5/5 | 0 | regional | none | 3 | 12/8/5/0/0 | 6 | 4 | 4 | 3 peer + 1 lead |

\* "Trips" = ctx.pilgrimages: pilgrimage trips STARTED by the bot
policy (walk to a below-bar candidate to study them — code-read,
scalecourt-nogate.js line 184), NOT completed peer proposals.
r90's "0/4 proposals completed" phrasing conflated the two; this
run separates them. Peer proposals (proposeCovenant/proposeTrade)
are the other column. Neither column is a game-side "completed
pilgrimage" count — that number does not exist in this instrument.

- **National, blocked by a hair in every seed (named precisely):**
  - 85091 COVENANT: 3 covenant links, all trust 35 (need 40+),
    ages 66–68d (seasoned on age). Five trust short on all three.
    LEAD: 1 subordinate (need 3).
  - 85092 COVENANT: trusts 29/27/29, ages 14–16d — short on trust
    AND age (30d). LEAD: 1 seasoned subordinate.
  - 85093: only 1 covenant link (trust 17, age 7d); LEAD 1
    seasoned subordinate (trust 79, age 90d). Far on both roads —
    but the furthest table approach (below).
  - 85094 COVENANT: trusts 39/39/36, ages 30/29/22 — the closest
    miss in the quad: one trust point on the 39s, one more day on
    the 29d link. LEAD: 1 subordinate.
  - **Tended = 0 in all four seeds** (policy counter): no link was
    ever tended in these runs. Trusts sit at 35–39 without any
    tending happening — so the 1–5 point gap to national is not
    being closed by tending, because tending never fires here.
    What closes it — a tend action, time, tribute — is the open
    question, and it is now the sharpest form of the standing
    question: the road stalls one tending short, and tending is
    the thing nobody does. (Scope honesty: these are bot-played
    runs. Whether villagers tend on their own — the world-
    participation track — is NOT observable from this panel; the
    bot is the player here. The zero is a bot-behavior fact, not
    a villager-behavior verdict.)
- **The table approach:** 85093 reached the lesser seat WAITING at
  arc 4 (foodDeeds true — the only seed with food deeds; 16
  contests, 3 crises) — then died out: last bearer David Kim died
  in the wild d115, "No one is left to pick up the Codex", pantry
  still holding 13,842 kcal. Food without people: the village did
  not starve, it ran out of bearers. The other three seeds sit at
  arc 3, seat none, foodDeeds false — lesser blocked on food deeds
  again, same as r90.
- **Wave 5: 0/4, again.** Wave 4 faced in 3/4 seeds (2/4/1/0
  kills-or-facings per seatDetail w4). National 0/4, global 0/4,
  full seat 0/4 — the band shape from r66–r73 holds, and this run
  does not pretend otherwise.
- **Poor courts, corrected:** courtPoorDays 63/12/22/23. Trips
  started while the court was poor (pilgPoor): 0/1/9/4 — trips DO
  start under poor courts, so a poor court is not an absolute trip
  block. 85091's zero trips is the outlier: with 5 links already
  formed and hunger biting late (HP gate >70% for trip starts),
  the likely blockers are no unstudied below-bar candidate or low
  scholar HP — hypothesis, not verdict; the instrument does not
  log which gate refused.
- **Duty counts (Q4, report-only):** weapon-craft lines 0/4 seeds,
  deadfall-duty lines 0/4 seeds; wsplit eligible 0, attempts 0 in
  all four (villager-days 271/379/497/368, knower-days
  181/169/239/86, effectively all armed). The thirteenth+
  consecutive zero band for both duty lines; the count continues,
  it does not re-argue the armed-gate classification.

## Q3 — PEOPLE CHECK (sense law — all transcripts read in full)
3 of 3 sittings fully real. No fabricated shared history, no filler
loops, no static menus. Day-120 sittings: NONE exist — every seed
ended before day 120 (94/90/115/68), so per prereg no substitution
was made; the narrowness is named, not papered over.
- **85091 d90 Yasmin (programmer, mischievous, trust 56, want
  ask_favor stage 2):** opens with the want ("About the food I
  needed — still need hands. Are you in?"), the picker deflects
  to subject then gossip, and Yasmin accommodates gracefully
  ("Sorry — I shouldn't load that on you. What's up?"). Gossip
  names real movements (Nurzhamal the zookeeper, "I left. Walked
  back in like I'd never left"). The want stays open at close —
  the picker's deflection, not a dialogue failure. Real.
- **85092 d90 Zoe (journalist, intense, trust 28, want ask_favor
  stage 1):** opens starving — "I'm past hungry — do you have
  anything to eat? Anything at all? I can't keep going like
  this." — on the very day the village scatters on hunger. The
  picker again deflects to gossip ("Forget I said anything."),
  and the sitting ends warm ("...Thanks for being here. That's
  all."). The sting belongs to the policy, not the game: a
  starving woman's food plea gets gossip instead of food, and the
  village walks the same day. Gossip itself is grounded (Windfall
  talk, Fatima foraging, James snares). Real, and the gossip-
  forcing cost is visible on camera.
- **85093 d90 Jenny (wild food forager, warm, trust 90, want
  ask_favor stage 2, 12 prior conversations):** the strongest
  sitting of the run. The menu offers betrayal:accept/decline
  (not the favor's own buttons — the invitation system overlaps
  the favor label; the sitting still coheres because accepting
  her invitation IS engaging her want), the picker accepts, and
  Jenny delivers: stockpiled "+4 wood, +4 fiber to the village
  stash" plus her vow — "Someone has to be the memory of this
  place... If we don't write it down, it didn't happen. I'm
  writing it all down." Want engaged, resources delivered, warm
  close ("I'm glad we talked. Really."). No invented shared
  past; she speaks from her role. Real.
- **Method note (not a defect):** gossip-forcing (GOSSIP_FIRST)
  systematically leaves wants unengaged in 2 of 3 sittings, so
  forced-gossip people-checks under-observe want RESOLUTION.
  Future runs that want resolution evidence should run at least
  one sitting without gossip-forcing. Gossip exposure itself:
  picks 1/1/0, THEM lines 8/8/7, sittings 1/1/1 (85094: 0
  sittings — ended day 68, before any day-90 sitting).

## Reachable / Fun / Winnable (plain words)
- **Reachable:** yes, in the quad's own shape. Regional in 4/4,
  5–7 links per seed, tribute arriving (3/1/0/1 arrivals), a
  pellet install, a lesser seat waiting, courts, covenants,
  trades — nothing sat behind a door a competent player cannot
  open. The one thing never reached: national (closest miss one
  trust point + one day), global, wave 5, the full seat.
- **Fun:** mostly, and sharper than the census. The pellet story
  is again the leg's best accidental drama — five days of
  "never hungry again" in the pilot (d25 install, d30 death:
  Declan dies and the promise dies with him), now with the game
  saying so out loud instead of leaving the new bearer to
  believe the hum. The
  conversations are genuinely good (Jenny's memory-vow, Zoe's
  starving plea on scatter day). The dull spot is the same one:
  villages that build a network and then scatter hungry (3/4
  seeds) while one trust point short of national — the climb
  stalls where it should crest.
- **Winnable:** not shown this run — and this run doesn't pretend
  otherwise. The lesser seat waited in 1/4 seeds and the village
  then died out with food in the pantry; national stayed one
  tending short; wave 5 untouched. The new information is the
  voiced reactor line + the precise national blockers, not a
  shorter wall.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-03/journey-scale-r91/journey-scale-r91-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ ONE LOUD line, investigated same-run, EXPLAINED:
- `census.pantryKcal newly appeared: baseline 0 -> current 13842
  (n=4 files)`: the entire 13,842 comes from seed 85093, which
  DIED OUT with food in store (last bearer died in the wild;
  pantry untouched). The other three seeds ended at pantry 0
  (scattered). This is a composition difference — a died-out
  band vs an all-scattered baseline band — not a pantry-economy
  regression (nothing inflated pantry income; people died faster
  than food ran out). Baseline NOT rolled: rolling a died-out
  seed's pantry into the baseline would mask future pantry
  regressions in the other direction. Day/popAlive/maxWave/
  pilgrimages tripped no LOUD line.

## Tests
- Proof test (before/after): RED on base 6 pass / 2 fail, GREEN
  with fix 8/8 (see Q2).
- `node --check` clean on the r91 driver, analyzer, proof test,
  and patched ledger.js.
- Analyzer on the quad EVIDIR: all four seed lines as reported
  above (fusion install d25/flips 2 on 85091 only; duty zeros;
  gossip picks 1/1/0/0).
- check.js --quick (on the branch code, `--cacheDirectory=
  /tmp/jest-cache-playtest`): **279 passed, 11 failed in 1272s**.
  The 11 = the r90-known 6 (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20 racks-full gate — same
  files, same assertions, individually confirmed from the log,
  not assumed) PLUS 5 extras, each individually cleared by a
  direct run WITH the fix in place, so none is a new failure
  caused by this change:
  - godpath/test-measurement-cache-flags.js (exit 1 under
    check.js): FAILED once directly with the fix (1 pass / 3
    fail), then PASSED on pristine base (4/4) AND PASSED again
    directly with the fix (4/4) — a flake, not a regression.
    The test never touches playerDeath/mantle/say (grep empty).
    Verdict: flake, cleared.
  - 4 × check.js 120s TIMEOUTs (exit null, killed by the cap, not
    by an assertion — the box was running several agents'
    check.js runs plus giant worktree checkouts concurrently):
    trust-observer-neutrality, synergy-stall, capable-bot-20261014,
    table-endings-20261014 — ALL PASS directly with the fix
    (6/0, exit 0, 40/0, 61/0 respectively). Verdict: load
    artifacts, cleared.
  - Gate clause (c) therefore HOLDS in substance: no failure in
    the suite is attributable to the ledger change.
- Stray-file discipline: the check.js run left docs/ONTOLOGY.md
  modified in the worktree (a regeneration side effect: it added
  the gap-arrears callInArrears/forgiveArrears provides + rules,
  which belong to a sibling's landed work, not this run). It was
  DISCARDED with `git checkout -- docs/ONTOLOGY.md` — never
  committed, never claimed.

## Metric review
- Q1's expansion rule fired exactly as written (pilot 85091 no
  crash → quad expanded; pilgrimages==0 did NOT stop it, per the
  prereg's pre-stated rule — not a mid-run re-score). The
  pilgrimages column was corrected mid-analysis by a code read
  (trips started, not proposals completed) and the run note says
  so plainly; the correction changes a label, not a scored
  threshold, and no threshold was re-scored to rescue any seed.
- Q2's fix gate fired exactly as written (all three clauses held;
  see Q2). The panel-confirmation role stayed opportunistic: the
  pilot's real-run firing is reported as confirmation, and the
  three no-install seeds are reported as no-line-expected, not
  as missing evidence.
- Q3's day-120 absence is narrowness, named: all seeds ended
  before 120, so no day-120 transcript exists and none was
  substituted.
- Carried, still open: the nomad.js road-wipe mantle voicing
  (follow-up to Q2, not smuggled in); the tending question —
  what closes the last 1–5 trust to national when tended=0
  everywhere; the wave-4/5 breadth wall for the full seat
  (unchanged, not re-proven here); the gossip-forcing method
  note (run one sitting unforforced to observe want resolution).

## Closeout (main session, 2026-11-03)
- Lane A run timed out at the 7200s ceiling during closeout; rebase had not started (tree clean on branch tip, no sequencer state).
- Main-session closeout: evidence + run note committed here, branch rebased onto current master, mantle-reactor-voice proof re-run green post-rebase, ff-merged. Rotation-a advanced 3 -> 0; Lane A lock deleted.
