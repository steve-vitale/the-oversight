# Journey succession r202 — Lane B, leg 7 (succession) — RUN NOTE

Run: Lane B r202, scheduled 09:00 CST 2026-11-14. Run id
2026-11-14T14:55:51Z. Base master e500f1956 (H1 transplant round
coordinator evidence). Rotation-b read 7 at run start; this run
writes 4 at closeout (VERIFY by re-read).
Pre-registration: evidence/2026-11-14/journey-succession-r202-prereg.md.
Panel ran 15:29–15:39Z (~10 min — a loaded box; r197's panel took
~80s on a quiet box).

## Pre-flight

- Lock: none present at run start. Own lock created
  (2026-11-14T14:55:51Z).
- Main tree clean; disk 39% (41% by registration end — the new
  worktree copy); pull already up to date at e500f1956.
- Reaper: exit 0, 12/16 active, removed nothing. LOUD lines all
  other owners' uncommitted trees (never auto-removed, not mine
  to touch).
- Registration: journey2-succession registered clean (plain slug
  free — no registry entry, no branch, no dir; r197 had released
  it). Registration took ~16 min (multi-GB evidence copy) and the
  first heartbeat queued ~7 min behind sibling registrations on
  REGISTRY.lock (the known lock-contention hazard); heartbeat
  landed 15:23:08Z. A 7-min hbloop runs for the rest of the run.
  Sibling Loop A registrations (sim-transplant15e-1412-a,
  sim-transplant15a-fresh-a) ran concurrently — the r197 metric
  review follow-ups (15E-on-14+12, 15A fresh-band confirm).
- Canon: docs/CANON.md re-read; zero mentions of mantle /
  succession / successor / inherit (grep empty, same as r54/r91/
  r94). No canon doc covers succession/mantle — none invented.
  This run is instrument-only, zero src/js changes.

## Panel

- Driver scripts/journey-succession-r202-20261114.js (r197 driver,
  rename only), analyzer
  scripts/analyze-journey-succession-r202-20261114.js (r197
  analyzer, rename only), runner
  scripts/run-journey-succession-r202-panel.sh (r197 runner,
  rename only).
- Seeds: FRESH BAND 34261–34264 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25). Pilot 34261 ran
  clean in the foreground first (exit 0, 590,607 bytes, valid
  JSON, all S-metrics true), then the full panel via nohup: all 5
  seeds exit 0, analyzer exit 0. Pilot re-run byte-identical
  (590,607). Smoke byte-identical to r197 (428,408).
- Seed-band freshness: 34261–34264 searched 0 hits in all
  evidence preregs; fresh.

## Panel verdicts

- **MANTLE-FINE (binding): PASS.** 19 deaths observed (34261: 2,
  34262: 4, 34263: 10, 34264: 2, 33998: 1) — 0
  flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
  0 unexplained fineLatency==1, 0 day-skips (tenth straight panel
  at zero). Three held-briefly same-day cascade bearers (34262 d72
  ×2, 34263 d69) — correctly classed SAMPLING-or-CLEAN. Two
  fineLatency==1 rows (34263 d73, d81; 34264 d49) are the explained
  sleep-roll class (firstNewTag=sleep, rollCover=true), same as
  r197. The mantle 2-day latency item stays CLOSED.
- **DRY CENSUS (binding, extended): FAIL — 1 dry hit, other-class.**
  0 ask:lately fellBack; 0 warn_you, 0 confront, 0 deflect_q,
  0 dlg:doubt dry-replacements; 0 dry lines on the carried
  same-class sites; 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY; 0
  null-return silences. The one hit: seed 34262, day 85, Logan,
  pick dlg:help, key "The cistern's nearly dry — 0 liters left. I
  need someone to haul water with me at first light. Two of us,
  half the trips. Will you come?" — sites
  src/js/convo-dialogue.js:572:27, 1002:27, 1047:31. See Blanks
  for the full filing. Per §14 the miss is scored as a miss, not
  re-scored against a friendlier metric.
- **R192/R193/R131/R191/R201/R132 WILD CHECK (binding): PASS on
  the named regressions.** 0 deflect_q, 0 dlg:doubt, 0
  agency-closer, 0 warn_you dry hits; 0 fresh-favor phantom
  re-asks; 0 nod-loop repeats (the nonverbal sittings thin and
  end — see People check). The single dry hit is the NEW dlg:help
  surface, not a regression of any landed fix.
- **CONTROLS (binding, r193 REVISED smoke bar): PASS.** Smoke
  33998 at-death snapshot d6 Heinrich→Sofia, alive 11, fallen 1,
  newTrust 21 — byte-identical file to r197, snapshot identical.
  Machinery holds on every seed: pick rank 1, funeral INCALL
  true, selfReq 0.
- **CAP-NC (binding, r187 newcomer-channel bar): PASS.** bonded-
  by-deadline 3/3 eligible seeds (34261 Sanne d+35, 34262 Yanina
  d+39, 34264 Priya d+54) — the first succession panel with a full
  denominator, and it passes outright. bondedEver 3/4
  probe-opened seeds. CAP-D14 descriptive: not-bonded ×2,
  no-stranger-pool ×2, bonded-d14 ×1 (smoke).
- **OPP (descriptive):** unbonded talk-requests 2 (Maya d59
  34262; Esteban d5 33998 — the smoke's standing one, same as
  r187/r193/r197); FIRST-bearer bonds on undriven days 2; NPC-NPC
  new bonds 30; newcomer arrivals 19; FIRST-bearer bonds 2 vs
  pre-existing 2; selfReqDayEntries 0 (r133 purge regression
  check holds).
- **Day-skips:** 0 across the panel (sleep rolls 110/100/110/83/
  30) — tenth straight panel at zero; the watch stays a watch.

## Village assessment (plain words)

Five villages, nineteen bearer deaths, and the mantle never
dropped once — every handoff synchronous, every successor living,
every pick trust-rank 1. What differed was how much village was
left standing around the new bearer.

- **34261 — the steady one.** Bridget died on day 41 as scripted;
  Bill took over at trust 61 and held it until the arena took him
  on day 100; Dale took it from there. 6 alive, 12 fallen at the
  end, pantry over 20,000 kcal. The successor's trust climbed at
  the office (61→94) and the village warmed with it (65→91). Bonds
  62 by the end. Succession as it should be: uneventful, and
  uneventful is fine.
- **34262 — the same-day triple.** Walt died on day 31 in the
  arena, before the scripted kill; Jason took over at trust 58 and
  died in the wild on day 72 — and the mantle ran three bearers in
  a single day (Jason→Ella→Yara→Sari), each handoff clean. 5 alive,
  13 fallen, pantry thin (6,457). Bonds 83 — the most bonded village
  on the panel, still losing people.
- **34263 — the chain.** Roberto died day 41; Deborah took over at
  trust 59 and died in the wild on day 69. Then the mantle ran nine
  more bearers in 26 days (Deborah→Adrian→Tsuyoshi→Mateo→Elena→
  Albina→Farid→Aroha→Raj→Paraska) — ten bearer deaths on one seed,
  every handoff synchronous, every pick rank 1. 7 alive, 12 fallen,
  pantry 14,180, bonds 90. A village that keeps burying its leaders
  and keeps going — the mantle doing its job while the wild eats
  the bearers one by one.
- **34264 — the early death.** Kayden died on day 14 in the wild,
  before any scripted kill; Esteban took over at trust 50 and died
  in the wild on day 49; Wei took it. 8 alive, 6 fallen, pantry
  8,998 — the healthiest village on the panel by the death count,
  and still the mantle had to move twice in 70 days.
- **33998 (smoke) — the young village.** Heinrich died day 6;
  Sofia took over at trust 21 and held it. 11 alive, 1 fallen,
  pantry 10,760. The control behaves exactly as it did in r193
  and r197 — byte-identical.

Across the panel: the dead are remembered (week-2 dead-bearer
mentions 4–5 per seed on the fresh band), the living keep bonding
(bonds at relEnd 47–90 per seed), and no successor ate a half
ration or heard a word the ledger had refused — except the one
dlg:help deflection (see Blanks). The survival collapse underneath
(34262: 5 alive; 34263: ten bearer deaths) is the known structural
hunt, not a succession defect — the mantle did its job while the
village bled.

## People check (read in full — 6 transcripts, all 34261)

- **Olivia d+3, stranger probe (trust 26)** — opens on a small
  real want ("A full night's sleep. Just one."), invite deflect
  with character ("You want me to follow you into the dark? Earn
  that first."), grief that names the dead ("I dreamed Bridget was
  still here."), a complete Wood Sorrel teach narration. PASS.
- **Vito d+3 (trust 91)** — grief naming Bridget twice with a
  real detail ("I keep turning over the last thing Bridget said to
  me"), party naming with consequence ("It has a name, which means
  it can be lost"), role as promise ("Roles. Not ranks —
  promises"), ending "The fire feels smaller without Bridget."
  PASS, strongly.
- **Sanne d+21, newcomer probe (trust 20)** — German-only; whole
  scene in gesture and glosses, the r132 nod-loop fix visible:
  "Their gestures slow — the conversation thinning like light at
  dusk," then silence, then a warm close. PASS.
- **Sanne d+45 (trust 94)** — the same relationship 24 days
  later, deepened without shared language ("I'll never forget you
  for this"), a real ask inside the gesture scene ("Do you have
  something to eat? Anything?"), thinning gracefully ("A final
  shared look — you both feel the talk running its course"). PASS.
- **Dale d+30 (trust 92)** — NPC wants company/comfort, options
  engage (stay, empathize), a small scene with consequence
  (torn-up ground at the tree line, "Dale's hand finds your
  sleeve"), invite accepted. PASS.
- **Heritier d+64 (trust 91)** — French-only; mime-walk to the
  tree line, "They glance toward their own thoughts; the exchange
  is winding down" — the sitting thins and ends instead of looping
  (r132 fix holding in the wild). PASS.

## Blanks filled / documented

**NEW — dlg:help dry (next fix item, FILED, not fixed this run).**
Seed 34262, day 85 (d+53), Logan (trust 89), pick dlg:help.
sayTrace: key "The cistern's nearly dry — 0 liters left. I need
someone to haul water with me at first light. Two of us, half the
trips. Will you come?" — preSelf=false, preRun=true, fellBack=true,
returned "...Sorry, lost my train of thought." Sites:
src/js/convo-dialogue.js:572:27, 1002:27, 1047:31. Transcript:
evidence/2026-11-14/journey-succession-r202-transcript-34262-dplus54-Logan.txt.

What the player saw: the sitting OPENS with the NPC calling back
an unfinished water haul — "We never did finish talking about that
water haul — that was 9 days back. Still on your mind?" — the player
asks "How can I help?", and the NPC answers "...Sorry, lost my train
of thought." The engine HAD the right line (the cistern ask — a real,
specific, actionable want, matching the opener's callback) and dropped
it for a deflection that contradicts the scene: the NPC plainly has
something to ask, the player asked exactly the right question, and
the answer is that he lost his train of thought.

Mechanism (from the code sites, not yet traced to the blocking rule):
the dlg:help handler composes the favor line, sayLine's ledger
blocks it (line ~572: `if (!said)` — the BLOCKED REPEAT path), and
the handler substitutes `convoSelfRepeatLine(vid)` / the deflection
instead of an honest "nothing right now" line. The dlg:help:nowant
pool ("Honestly? I'm alright right now...") already exists at the
same site for the no-want case — the blocked-line case never reaches
it. Fix direction for the next arm (not implemented here): when
sayLine blocks the composed favor line, fall back to the nowant pool
(the ledger-aware shape r192 F1–F3 used), never to the deflection.
The blocking rule itself (which ledger rule refused the cistern line
— repeat, favor-engaged, or other) is UNTRACED this run; the fix arm
traces it first. Same class as r192 F1–F3 (ledger-aware pool), new
surface (dlg:help blocked-repeat path). Proof test owed by the fix
arm (dlg:help blocked-line case), following the r192/r193 proof
pattern.

**SECOND SEAM (flagged, not counted, not a verdict).** The same
sitting's opener splices a second voice into the NPC's line: "We
never did finish talking about that water haul — that was 9 days
back. Still on your mind? 'Your partner is inside the Haven hall.
Go through the door to meet them.'" The quoted Haven-hall direction
reads like a stage/location line leaking into dialogue. Needs a
look (which composer emits the opener, and whether the quoted bit is
a separate line or part of the callback) — filed here, not chased
this run.

No src/js change this run — the panel's job was verification, and
the verification found exactly one new surface. The fix is the next
arm's, with its own proof test.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json --current 'evidence/2026-11-14/journey-succession-r202-tele-*.json' --metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`

- **LOUD: deaths.bearer 150%: baseline 7.6 -> current 19 (n=5).**
  Verdict: KNOWN COMPARISON ARTIFACT, not a regression (r193/r197
  metric review). The baseline stores per-seed MEANS; the tool SUMS
  the current files (19 across 5 seeds). Honest mean: 3.8 bearer
  deaths/seed. The count is high because 34263 ran a 10-death chain
  cascade — and the mantle held on every one of the 19, which is
  the panel's MANTLE-FINE PASS, not a telemetry regression.
- **LOUD: census.fallen swung 208%: baseline 14.3 -> current 44
  (n=5).** Verdict: same KNOWN ARTIFACT. Honest mean: 8.8
  fallen/seed — LOWER than the baseline describes, i.e. a healthier
  regime, not a worse one.
- **Baseline NOT rolled** — the means-vs-sum mismatch is still
  unsettled, same as r193/r197. Standing item for the next run that
  touches it: either re-derive the baseline from a current panel or
  make the check compare means.

## Metric review

- **DRY CENSUS:** the bar held as written — a miss is a miss. The
  one hit is other-class (dlg:help), not one of the named binding
  classes, and the analyzer still scores the census FAIL on any dry
  hit. No re-scoring: the verdict stands as FAIL with 1 other-class
  hit. Proposed revision for the NEXT run's prereg (not this one):
  state explicitly whether other-class hits fail the census or are
  filed as next-fix items while the named classes bind — the
  analyzer and the prereg currently answer that differently (the
  analyzer fails on any hit; the prereg's bar text names only the
  binding classes). The finding itself doesn't change either way.
- **CAP-NC:** the denominator finally filled (3/3 eligible) and
  passed outright. No revision — but note the streak: bondedEver
  3/4 probe-opened this panel vs 1/3 in r197; the capacity signal
  is strengthening.
- **TELEMETRY BASELINE:** still not rolled (means-vs-sum mismatch,
  see above).
- **Proof refresh rounds 11 + 12:** still owed (r192 + r194 + r195 +
  r193 + r131 + r132 + r191 + r201 changed src/js since b10's panel;
  proofrefresh-b16 closed round 16 on a different manifest line).
  This run does not own that refresh; it reports its own gate only.
- **Day-skip watch:** tenth straight zero; the watch stays a watch.

## Reachable / fun / winnable (leg 7, succession)

- **Reachable: YES.** Deaths happen organically (34262 day-31
  arena death, 34264 day-14 wild death, both before any scripted
  kill) and by script; the mantle passes to a living successor
  every time, synchronously, with the funeral arc firing on all 5
  seeds. A real player will meet this content by dying — which is
  to say, by playing.
- **Fun: YES, in the quiet way this leg is fun — with one sour
  note.** The successor's second life has real voice: grief that
  names the dead, roles that are promises and change hands, a
  newcomer scene played entirely in gesture across no shared
  language, a 24-day nonverbal friendship that deepens. The sour
  note is the Logan sitting: the player asks the right question at
  exactly the right moment and gets "lost my train of thought"
  instead of the water haul the NPC plainly wants help with. One
  deflection in ~70 driven sittings — small, but it is the one the
  player remembers.
- **Winnable: NOT JUDGED by this leg.** Succession is continuity,
  not a win path — its job is that the story continues after death,
  and it does, on all 5 seeds, through 19 bearer deaths. Whether
  the village then wins belongs to the endgame leg; note 34263,
  where the mantle held through ten bearers while the village
  around it kept burying them.

## Gate

NOT RUN this run — the run's clock ran out (registration took
~16 min on the loaded box; panel finished 15:39Z; the gate needs
10–18 min and the cron times out ~15:56Z). Adoption runs
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
on the final tip and adjudicates. This run changed no src/js
(tooling + evidence only), so no failure can be attributed to it;
the standing known failures from r197's gate are expected
(measurement-staleness pair, phone-frame stale receipt, load
timeouts). NOTE: proofrefresh-b17 LANDED during this run (master
e500f1956 → c8211b756 includes 76e741f5f + 39aad0e4c, GO 12/12,
panel eadc86c3) — the measurement-staleness pair may now be
resolved on the final tip; adoption's gate will show it.

## Landing

PARTIAL — committed, not merged. Commit 7bb3a809b on branch
journey2-succession (93 files: prereg, run note, driver/analyzer/
runner, panel evidence). Safe-commit index clobber struck (all 93
files showed staged-deleted); repaired via `git ls-tree -r HEAD |
git update-index --add --index-info`, verified status empty +
diff HEAD empty + commit intact.
Master moved during the run (e500f1956 → c8211b756: proofrefresh-b17
×2 + sim-standing99107-b ×4). The range holds NO src/ or
scripts/policies/ change (verified empty diff) — the panel's inputs
are identical, so the byte-identical proof carries by determinism
(r197 second-rebase precedent); adoption rebases cleanly, re-runs
the gate on the final tip, then --ff-only merges, releases the
worktree, writes rotation-b 7→4 (VERIFY by re-read), and deletes
the lock. Rotation-b is LEFT AT 7 for adoption (this run did not
merge, so it does not advance the rotation). The lock is DELETED at
closeout per the body rule; the hbloop was killed at closeout so the
registry heartbeat goes stale and no later run mistakes this run for
alive. Adoption must heartbeat FIRST before any work in the tree
(long-idle-tree rule) and should release promptly — the
journey2-succession slug/branch is still held by this run until
release, so a fresh Lane B run before adoption would collide on it.
