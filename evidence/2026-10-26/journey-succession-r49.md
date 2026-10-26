# Journey succession r49 — MIXED REGIME + C1v3 TRANSITION RULE + MG2v2 MEAL-LINE + ARMOR HOLDER IDENTITY + OVER-CAUSE (lane B, 2026-10-26)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26041–26045
(fresh band), competent policy, mixed regime: 26041–26042 scripted day-5
kills, 26043–26045 mature (EARLY_KILL_DAY=40). Instrument only, zero
src/js changes. Base master@edbfeda03 at run start (crisis r51 landing).
Merged locally, pending ship (no bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-26/journey-succession-r49-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r49-20261026.js
+ analyzer + proof test, all new files in this commit.

## HEADLINE

This band closes a thread and opens a new one. The armor handoff-loss
thread is CLOSED, not by finding the lost piece but by proving there
never was one: holder maps name every bark holder before and after
every mantle pass (James, Darius, Owen, James — each holding one piece
in both views), bark totals sit flat 2→2 on all four bark seeds, and the
successor's own gear is proven to merge into the scholar pack at the
handoff on all five seeds (Kai's skull_helm, Dmitri's canvas_pants +
flannel_shirt, Jaxon's work_gloves, Ernesto's flannel_shirt, Martine's
work_gloves). The r48 "1–2 items lost at the handoff" was the
instrument double-counting villager gear: every villager's worn and
pack lists are the same multiset, so a piece counts twice while held
by a villager and once in the scholar pack after the merge — the
armorTotal drop of exactly 1 per merged item (26041: 29→28) is the
collapse, not a loss. The r48 bark-loss class (26032: bark 2→1 with
scholarPack+1) is the same collapse with the successor as bark holder.
And the run's new thread is the trust-move writer: 17 of 50 trust
moves (34%) land on days with ZERO trapped deed calls, so the writer
sits at least partly outside the five trapped deed APIs — the next
instrument must trap at the mutation, not by day. The run's loudest
content line is a second instance of a known blank: Darius's
joint-foraging ask ends in the game's own admission ("There is no
playable joint foraging outing yet") — a real game line, not a driver
artifact.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26041 d6 Pamela→Kai, 26042 d6 Carmine→Dmitri).
- MATURE seeds: 3/3 scripted at d40–41 (26043 d41 Juan→Jaxon,
  26044 d40 Colleen→Ernesto, 26045 d41 Ethan→Martine), ZERO organic
  pre-emptions. Contrast r48 (2/3 organic at d12/d18): arena
  pre-emption timing varies widely by band — "the arena is the
  succession engine on mature seeds" did not reproduce here, so it is
  a band effect, not a law. Scripted-or-organic honored on all seeds.
- V1 (vouch snapshot): GO with the best coverage yet — 3/3 mature seeds
  PASS-fired (26044: 9 eligible, 26045: 6, 26043: 5; all alive
  post-death, 1 vouch line each). Young seeds n/a-none-eligible
  (expected). No FAIL-alive-silent anywhere. Died-between still empty
  (rare-branch watch, not a gap).
- C1v3 (transition rule): GO 5/5 — 54 daily transitions, 0 missing.
  26042 contributes the byConvoPrev proof (1 transition covered by a
  convo-window move on the previous entry's day). C1v2 same-day ALSO
  passes 5/5 this band, so the transition rule is confirmed as a
  superset of the same-day rule, not merely a fix for a failing band.
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo. The solo-office class is now POPULATED for the first
  time (r47/r48: 0): 11 solo-office calls, all +1 (26043: 2, 26044: 1,
  26045: 8) — office creep via solo calls, all within the |delta|<=2
  bound, so no instrument contradiction. Single-mover others remain
  sub-threshold (+2/+1).
- MG2v2 (meal-line only): GO 5/5, 0 violations. Old MG2 also 0 this
  band — the r48 safetynet-advice false-positive class did not recur,
  so the old-vs-new discrimination still rests on r48's proof case
  (Leah's full day-30 meal vs the advice beat), not on a fresh one.
- A1v2 (holder accounting): GO, THREAD CLOSED (see Headline). Every
  pre-death bark piece carries a holder+location pre-death and the
  same holder post-handoff (James 26041, Darius 26043, Owen 26044,
  James 26045 — each worn 1 + pack 1, i.e. one distinct piece in both
  views). Bark totals flat on all bark seeds; 26042 had no bark.
  DeadBearerAccess: found=true, dead=true, worn=[], pack=[] on all 5
  — the dead bearer's vp record is reachable post-handoff but carries
  no gear (their gear was scholar inventory, merged or corpsed).
  Caveat, stated plainly: worn==pack multisets for every villager on
  every snapshot, so armorTotals double-count villager gear by
  construction and must be read as 2x distinct pieces for villagers.
- M3v2b (social echo, carried): GO 5/5 — (3, 5, 4, 5, 4), no
  dying-village miss this band (contrast r48's 26031).
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk).
- OVER-CAUSE: instrument present on 5/5, but the over=true branch is
  UNEXERCISED — no seed ended over (all over=false, villages rich).
  overCause is recorded with alive/pantry/lastSay on every seed, but a
  silent-end-screen case still awaits a collapsing band. Same caveat
  class as r48's convo-window branch: present, not proven.
- WRITER-SITE SPIKE (exploratory, not binding): 17/50 trust moves
  (26041: 4/11, 26042: 2/12, 26043: 2/9, 26044: 3/5, 26045: 6/13) land
  on days with zero trapped deedLedger entries; the post-window deed
  names are only donateToPantry + teachPlant (no giveFood /
  treatVillager / comfort calls in this window at all). The writer is
  at least partly outside the five trapped APIs, or outside day
  granularity (a deed recorded on another day than the runDays call
  that moved the office). Next instrument: trap at the trust-mutation
  site, or join by call window — day-join has hit its limit.
- E1b (continuity, retired): diffuse moves still all mover-named,
  solos unnamed (26045: 8 solo unnamed) — consistent with retirement.
- Chain deaths: 2, both cause-known (26043 Jaxon→Khuong "the night"
  d59; 26044 Ernesto→Diana "the arena" d51).
- M5 (people check): GO with warts — 5 transcripts sense-read in full
  (below), 0 real identity failures (identityTrips=0 all seeds).

## Village assessment in plain words

- 26041: Pamela dies to a hushwolf on day 6; Kai takes the mantle at
  trust 24 and barely moves (office 24→29) while the village warms to
  65.3 — the office-lags / village-warms split in miniature, but no
  collapse follows: pantry ends at 76,059, 11 alive. A village that
  steadies socially and stays fed while its bearer stalls.
- 26042: Carmine dies day 6; Dmitri takes over at 17 and climbs to 57
  (office 17→57, village 64.3), pantry 55,293, 11 alive. The busy
  village again (12 trust moves, 2 convo-window moves including a
  0→8 jump at d+7) — and the only seed where the convo window moved
  the office this band.
- 26043: Juan dies day 41 at the height of a mature village; Jaxon
  inherits at 56 with five villagers over 60 speaking at the grave,
  climbs to 95 (office 56→95, village 89.6) — the strongest succession
  of the band — then dies "the night" on day 59 and Khuong inherits.
  Pantry ends thinner (16,641) but not empty, 10 alive. Two mantles,
  village still warm.
- 26044: Colleen dies day 40; Ernesto inherits at 74 with nine
  villagers over 60, climbs to 90 (village 81.1, pantry 52,327), then
  dies in the arena day 51 and Diana inherits. The well-established
  succession, twice over.
- 26045: Ethan dies day 41; Martine inherits at 60 with six over 60,
  climbs to 81 (village 73.3, pantry 105,043 — the richest village of
  the band), 10 alive. The office creep here is the solo-call story:
  8 solo +1s, no big moves, steady climb.

Who leads: the bearer <redacted> every village, and trust is broad by
month's end (4–9 villagers over 60 on mature seeds). Who is miserable:
nobody the census can see — no village starved, no office crashed
(Kai's stall is the only flat line, and his village fed him anyway).
What is missing: nothing structural on this band — the missing piece
is content (the foraging outing), not machinery.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full: 26041 d+7 Ji (secret want — "lying about my age" —
stated then dropped; ridge outing "learn the shape of them"; stall
"lost my train of thought"; double-invite tell; favor plant "Pamela
owed me a favor" with no resolution — weak, want evaporates);
26042 d+7 Nathan (PASS, strong — grief continuity "I dreamed Carmine
was still here. Woke up angry at the dream"; picks up "Carmine's
share of the work"; teaching accepted, American Persimmon); 26043 d+4
Darius (the blank — forage-tomorrow ask ends in the game's own
admission, see below; plus favor-debt "Juan owed me a favor" and a
teaching accepted, Groundnut; double-invite tell again); 26044 d+7
Owen (thin — "stolen laugh" callback, teaching accepted, then drifts
+ "lost my train of thought" ending; no want pursued); 26045 d+7
Jaxon (PASS — spooked-by-treeline want engaged, walk together, teach
both ways, warm resolve "This was good. They mean it."; the dream
question gets a real answer: "History isn't what happened. It's what
we refuse to let go of. I refuse."). No fabricated shared history, no
filler loops. Driver artifacts, not game bugs: the double-invite
tell ("Want to come with us?" then "Want to come with me?") in 2/5
transcripts, same as r44–r48. PASS with the Darius dead end + two
stall endings noted.

## Blanks filled or documented

- FILLED (instrument): C1v3 transition rule — 54/54 transitions covered,
  byConvoPrev proof on 26042.
- FILLED (instrument): MG2v2 meal-line regex — clean on 5/5; the old
  regex also clean this band, so no fresh discrimination case.
- FILLED (instrument): armor holder identity + pack-merge rule — the
  successor's gear merges into the scholar pack at every handoff
  (5/5), named per seed above.
- CLOSED (thread): the succession handoff-loss thread — r48's loss was
  the worn/pack double-count collapsing to a single scholar-pack count
  at the merge. No distinct piece is lost on this band. If the thread
  is ever reopened, count distinct pieces (dedupe worn/pack per
  villager) instead of location totals.
- DOCUMENTED (content blank, second instance): the joint-foraging
  outing is unplayable — Darius's forage-tomorrow ask resolves to the
  real game line at src/js/convo-wants.js:1607 ("There is no playable
  joint foraging outing yet. Giving food does not perform the promised
  outing."). r48 carried this as Blanca's blank; this run proves it
  is not Blanca-specific. A player-facing dead end, not a silent bug —
  but a dead end the player hits when an NPC asks for help. Building
  the outing is a design-sized job, not an instrument fix: Steve's
  call, not this run's.
- DOCUMENTED (content warts): Ji's evaporating secret want; Owen's
  stall ending ("lost my train of thought" as the last line);
  double-invite tell persists (2/5).
- DOCUMENTED (instrument limit): day-join writer-site trapping has hit
  its limit — 34% of trust moves have no same-day deed call. Next
  instrument traps at the mutation site or joins by call window.
- DOCUMENTED (instrument caveat): over=true over-cause branch still
  unexercised (no collapsing band this run); worn==pack double-count
  caveat on all armor totals.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): exactly TWO LOUD lines, both
EXPLAINED, baseline NOT rolled (same call as r46–r48: rolling on a
regime-changed band would launder the regime effect into the baseline):
- "succession.echoV2b newly appeared: baseline 0 → current 21 (n=5)":
  baseline predates the echoV2b key (added r46); current total 21 =
  3+5+4+5+4, exactly the analyzer's M3v2b sum.
- "succession.callMovesSoloOffice newly appeared: baseline 0 → current
  11 (n=5)": the solo-office class opened this band (r47/r48: 0);
  current total 11 = 0+0+2+1+8, all +1 deltas, all within bound — a
  newly populated class, not a bug.

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 121s (same as r47/r48).

## Metric review (for the NEXT run, never re-scored here)

- C1v3: bar stands (54/54 this run). Keep reporting C1v2 for continuity
  one more run, then drop it — the transition rule has now passed on
  a band where the same-day rule also passed, so it is the superset.
- MG2v2: bar stands. The old MG2 regex can be dropped next run — its
  only discrimination case remains r48's proof, and keeping both
  costs nothing, but the old regex's retirement was already decided
  in r48's review; this run adds no new case either way.
- A1: RETIRED as a loss detector. The distinct-piece question is
  answered (no loss; merge proven). If armor is ever re-examined,
  count distinct pieces per holder, not location totals.
- V1: keep the mixed regime — mature seeds are what make V1
  non-vacuous (3/3 PASS-fired this run, the strongest yet).
- Writer-site: next instrument traps at the trust-mutation site (or
  joins by call window). Day-join is retired as a discriminator —
  34% no-deed is the finding, not a gap to re-measure by day.
- Over-cause: keep — the over=true branch still awaits a collapsing
  band; do not claim it proven until one fires.
- Died-between: still empty; keep as a rare-branch watch.
- Next for succession (r50): mixed regime again; writer-site trapping
  at the mutation (the trust-move trap's next step); re-test the
  foraging-outing blank only if Steve rules it in scope (it is a
  design-sized build, not a measurement); keep the solo-office watch
  (26045's 8 solo +1s — is solo creep bounded, or does it run away
  on longer windows?).

## Infrastructure

- Worktree registration took ~7 min (internal reap + worktree add;
  no EPERM flap this run, unlike r48's 22-min flap). A concurrent
  heartbeat probe I ran during registration blocked on the registry
  flock and was killed before it did anything — lesson recorded:
  never run registry-touching commands concurrently with registration.
- Heartbeat loop kept journey2-succession fresh throughout; heartbeat
  verified landed after loop start (13:02:49 UTC) per the 2026-10-25
  lesson (loop logs to the goal hidden_files heartbeat log, not
  /dev/null).
- Proof test ALL GREEN first try (RED on the r48 driver lacking all
  r49 fields, GREEN on the r49 driver; proof-seed 24999 tele +
  transcripts deleted after GREEN).
- No sibling landed mid-run (master stayed edbfeda03 from registration
  through the seed batch); no rebase needed at landing.
- Safe-commit index clobber: STRUCK on the 57-file commit (all files
  shown staged-as-deleted after commit a669375e, worktree files
  byte-identical to HEAD). Repaired per the standing lesson
  (update-index --add --cacheinfo from HEAD blobs for each affected
  file), verified clean (status 0 lines, diff HEAD empty, commit
  intact: 57 files).

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted
  mantles, chain mantles, and the strongest vouch coverage yet.
- FUN: yes, with warts — the social texture is the run's strength
  (grief continuity, name-right beats, warm resolves), and the main
  drags are the foraging-outing dead end and the stall endings
  (Ji, Owen).
- WINNABLE: yes on this band — every village ended fed (16,641 to
  105,043 pantry kcal) with the bearer climbing or holding. The
  r48 starvation collapses did not recur; winnability still rides on
  the food economy, but competent play on this band keeps the village
  fed through two mantles.
