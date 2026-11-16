# Journey succession r218 — Lane B, leg 7 (2026-11-16)

Run: `oversight-playtest-loop-2`, r218. Lock `oversight-playtest-loop-2-20261116T005726Z` (created 00:57:26Z).
Rotation read `7` at start; this run writes `4` at closeout.
Base master `5e0bba6e5` ("sim-courtship-confirm-b"). Branch `journey2-succession`.
Worktree `~/workspace/worktrees/journey2-succession`.

## Pre-registration (summary; full text in `journey-succession-r218-prereg.md`)
- **Leg question:** when the player character dies, does the mantle pass cleanly to a new
  bearer, does that bearer's life read as a real life, and do conversations stay dry-free?
- **Fix brief (from r209's unverified surface):** F3 — commit-refusal lines could become
  thread memory (dlg:commit handler, convo-dialogue.js): site C menu-reachable (away
  refusal on a water_haul 'asked' favor), sites A/B menu-hidden defense-in-depth
  (stay_close gate reason, unsupported-action reason).
- **Seeds:** fresh band 34291–34294 (EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998
  (EARLY_KILL_DAY=5, POST_DAYS=25). Band verified FRESH: 0 hits in any journey/sim
  prereg; full-evidence hits only Oct 13/15 measurement-JSON values (pantry kcal).
- **Metric amendment carried:** any dry hit fails the DRY CENSUS, named-class or
  other-class; the analyzer is the judge.
- **Telemetry baseline NOT rolled** (known means-vs-sum mismatch, carried from r202/r209).

## Pre-flight
- Main tree clean; `git pull` already up to date; disk 41%.
- `worktree-reap.sh` ran clean (11/16 active, dirty sibling trees held, nothing removed).
- Registration launched detached via `setsid nohup` (log
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey2-succession-r218-register.log`).
  Worktree verified: branch `journey2-succession`, HEAD 5e0bba6e5, `src/js/game.js` present.
  Heartbeat landed 01:03:18Z; a 7-min heartbeat loop runs detached.
- Canon: `docs/CANON.md` read — zero mentions of mantle/succession/successor/inherit; no
  canon doc covers succession; none invented. Repo `AGENTS.md` read.

## Fixes landed (worktree only, commit e028c5920)
- **F3 — commit-refusal lines never become thread memory** (`src/js/convo-dialogue.js`,
  dlg:commit handler only, 13 insertions / 3 deletions): noBeat on the two early-return
  refusal sites (stay_close gate reason; unsupported-action reason) and conditional
  `noBeat: !committed` on the main-path sayLine — a refused commit's beat is a refusal
  reason, not NPC speech; a real commitment's thank-you beat still becomes thread
  content. Spoken lines unchanged on all three sites.
- **Proof test (ALL GREEN post-fix, in worktree `scripts/`):**
  - `test-journey-succession-r218-commit-refusal-nobeat-20261116.js` (commit-away /
    commit-gate / commit-unsupported / control, seeds 5541–5544): on UNFIXED code the
    three refusal cases FAIL (the away line, the gate reason, and the unsupported
    reason each BECAME the thread snippet — the seam reproduced exactly as traced,
    including the menu-reachable site C: dlg:commit offered, away line spoken, snippet
    became the refusal); on FIXED code all 24 checks PASS, and the control proves a
    successful commit's thank-you beat still becomes thread content.
  - Staging note (for the next worker): `npcNeeds(vid)` is the live readings source
    (`v.needs[rid]`); setting `v.fear`/`v.energy` maps does nothing — fear>70 stages
    stay_close, energy<30 stages watch_shift.
- **r209 proof tests re-run on the fixed code: BOTH ALL GREEN**
  (deferred-ask-block, favorblock-nobeat) — no regression in the F1/F2 area.
- **Index-clobber note:** the safe-commit clobber struck on the fix commit (5 files
  staged-deleted + 1 MM, worktree files byte-identical to HEAD). Repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified
  with `git status` clean + `git diff HEAD` empty. Fifth sighting of the pattern
  (Oct 22, Oct 23 ×2, Nov 15 ×3, today) — after EVERY safe-commit, run
  `git status --short` before anything else.

## Panel (01:22:10Z–01:34:51Z, all 5 seeds exit 0, analyzer exit 0)
- 34291: 619,890 bytes; 34292: 635,144; 34293: 642,199; 34294: 674,171; smoke 33998: 293,188.
- Analyzer exit 0 (`journey-succession-r218-analyzer.txt`).

## Verdicts
- **MANTLE-FINE: PASS.** 18 deaths observed (0 village-over excluded; 0
  flippedImmediate=false; 0 fineLatency>=2; 0 unexplained fineLatency==1; 0 held-briefly
  same-day cascade bearers; 0 day-skips — twelfth straight panel at zero). Seed 34292
  ran a 7-death chain (Sal→Elif→Pamela→Ekin→Aki→Jayden→Valeria); 34291 a 4-death chain;
  34294 a 4-death chain from an ORGANIC d15 handoff (Irving→Keisha); 34293 a 2-death
  chain. Pick rank 1, funeral INCALL true on every seed.
- **DRY-CENSUS: FAIL — 3 other-class hits** (binding 0, other-class 3, honest fallbacks 0,
  null-return silences 0). All three are `preRun:true` run-ledger blocks on the exact
  dry line `"...Sorry, lost my train of thought."` — NEW surfaces, filed below as the
  next fix items (F4a/F4c), NOT fixed in this run per the prereg:
  - **F4a — curious singleton (2 hits):** seed 34291 d71, Benjamin + Carolina, pick
    `alive:want:curious`, key `"Teach me something. Anything you know that I don't."`
    (`characterGen.json:6022`, `q_teach_me`). The question is a SINGLETON — one `q`
    line in the def. It was asked in an unsampled sitting earlier in the run (no
    sayTrace entry with fellBack=false exists for it on this seed), consuming the
    line; both sampled d71 sittings then drew the same question and went dry. Fix
    shape (next run): give q_teach_me variants, or make the curious-question pick
    ledger-aware (skip an already-spoken question and pick another).
  - **F4c — dlg:help re-speaks the opener's quote (1 hit):** seed 34293 d105, Carl,
    pick `dlg:help`, key the Saad/pods line. The resume opener quoted the Saad line
    as the thread snippet, then dlg:help's engageBeat returned the SAME line and
    sayLine ledger-blocked it → dry. Fix shape (next run): the help handler must
    not re-speak the thread's snippet line — fall to the nowant pool when the
    want's line is the just-quoted snippet (same guard-at-the-source class as
    r209 F1).
- **WILD CHECK: PASS on landed fixes** — deflect_q 0, dlg:doubt 0, 0 fresh-favor
  phantom re-asks, 0 dlg:help water_haul hits (the r202 F1 hit does not recur);
  0 agency-closer / warn_you / refusal dry hits. The 3 census hits are NEW
  surfaces, not regressions of any landed fix.
- **F3 WILD CHECK: PASS** — 0 resume-opener quotes of a commit-refusal line across
  71 transcripts (away/dawn-meet/new-meeting-night/night-is-over/no-playable:
  0). F3 verified in the wild.
- **F2 DESCRIPTIVE CHECK: PASS** — 0 resume-opener quotes of a favor-block direction
  line; the direction lines that fired (Aki d+30 "same side of the Haven door",
  Valeria d+45 "Your partner is inside the Haven hall") were spoken in place as
  answers to "Why can't I do this now?" — the line doing its job.
- **CONTROLS: FAIL — snapshot moved, FIX EXONERATED (base drift).** Smoke 33998:
  handoff d7 Heinrich→Ashanti, alive 10, fallen 2, newTrust 33 — vs the r193
  revised bar d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21. Investigation
  BEFORE adopting (per prereg Q6): (a) master moved 348 src lines since the r209
  base (game.js +120, conversation.js +98, hierarchy.js +86, convo-wants.js +27,
  convo-mood.js +16, convo-scene.js +11, alienPlayers/sigW3c/build.js, plus the
  r211 endgame fix); (b) the smoke stdout's sayTrace has ZERO entries at day ≤7
  — no commit turn fired in the window; (c) DECISIVE A/B: the smoke seed re-run
  on the PRISTINE base (convo-dialogue.js at HEAD~1) produced a FULLY IDENTICAL
  stdout.json (death record and every key equal) — the fix moves nothing on this
  seed. The bar moved by drift, not by the fix. The smoke bar needs
  re-baselining on current master — filed as measurement maintenance, NOT
  re-baselined silently mid-run. (A/B hygiene: the pristine run overwrote the
  panel's smoke transcripts with byte-identical content — full JSON identical,
  same seed, deterministic driver — and the panel stdout.json was restored from
  backup and verified identical.)
- **CAP-NC: INSUFFICIENT-DATA** (bonded-by-deadline 0/0 eligible — no newcomer
  arrived in time on any probe seed; 34292's Wanjiru arrived d+33 but a second
  handoff came first). bondedEver 1/1 probe-opened seeds. OPP: unbonded
  talk-requests 1 (Ursula d5 smoke — the standing one, same as r209); FIRST-bearer
  bonds on undriven days 2; NPC-NPC new bonds 12; newcomer arrivals 6; selfReqDayEntries 0.
- **C3c watch (r216): still UNMEASURED.** 5 resume openers on the panel, all quote
  real beats with labels matching the quoted content; 0 cases of a favor changing
  within 14 days of planting followed by a resume opener naming it. Watch stays open.
- **Q10 (r216 follow-up): NO second sighting.** 0 "Nothing important" recaps on
  the panel. Stays filed, not promoted.
- **Q11 (recap splice): SECOND SIGHTING — promoted to a fix item.** Benjamin d+14
  (34291): "Between us — Still on what's been happening." — the same reframe-prefix
  + "Still on <topic>" splice as r209's Maya ("Let me be straight — Still on that
  question."). 1 of 19 "Still on" recap lines on the panel carries the splice;
  the other 18 are clean. Filed as F4b (next fix item, wording seam, not a dry line).

## Village assessment (plain words)
- **34291 — Jian hands the mantle to Peyton on day 41** (trust 62, 11 alive, 1 fallen
  at the handoff). Then the mantle changed hands 4 times (Peyton→Aki d71→Benjamin
  d90→Fatima d95), and the village STILL held together: 8 alive at day 111, pantry
  8,485. 53 bonds after the handoff.
- **34292 — Arturo to Sal on day 41** (trust 62, 10 alive, 2 fallen). A 7-death chain
  followed — the longest this panel — and the village still stood at day 111: 6 alive,
  but the pantry hit 0. The fighting didn't kill them; the food ran out behind it.
  66 bonds by the end — the most social of the four.
- **34293 — Gilberto to Milo on day 41** (trust 58, 11 alive, 1 fallen). One more
  handoff (Milo→Aria d83) and then quiet: 9 alive at day 110, pantry 13,381. 57 bonds.
- **34294 — Irving to Keisha on day 15, ORGANIC** (trust 32, 11 alive, 1 fallen — the
  only non-scripted first handoff). A 4-death chain followed (Keisha→June d18→Brian
  d39→Ellie d82); the village held: 8 alive at day 84, pantry 13,237. 57 bonds.
- **Smoke 33998 — Heinrich to Ashanti on day 7** (trust 33, 10 alive, 2 fallen). The
  village stayed healthy to the end of its short window (10 alive, pantry 13,206).
- **The pattern (and the change from r209):** the mantle passed cleanly every time,
  and this time ALL FOUR probe villages survived the 70 days after the handoff —
  r209 lost three of four to fighting and betrayal. The villages still bury bearers
  in chains (7 deaths on 34292), but they no longer fall apart afterwards. Whether
  that is the fresh band or the drifted base, it is a fresh-band descriptive, not a
  lever claim — the F3 fix spends no RNG and touches no survival mechanic.

## People check (SENSE-TESTING LAW — 8 full transcripts read)
All eight PASS — the NPC wants something, options engage or deflect it, endings
resolve/plant/owe. No fabricated shared history, no filler loops, no static menus.
- **Carolina d+3 (34291, trust 90):** "What do YOU think actually happened to us?"
  grief over Jian ("I dreamed Jian was still here. Woke up angry at the dream."),
  fire-tending as coping, the scout role promised, teaching Maypop lands.
- **Benjamin d+14 (34291, trust 90):** resume opener quotes a real departure beat;
  the trust question answered honestly ("The wrong one would've been 'yes' too
  fast."); comfortable silence. Seam: the recap splice "Between us — Still on
  what's been happening." (F4b, second sighting).
- **Elif d+3 (34292, trust 100):** the fear question, a secret (ate something that
  wasn't hers), a double-confront that holds the line ("I confessed that already.
  I'm not confessing it twice"), party naming ("The Company"), a trap-line favor
  that pays real goods (+4 wood, +4 fiber).
- **Pamela d+14 (34292, trust 95):** the belief question ("That's not naive. That's
  load-bearing."), grief over Sal by name, a village-link proposal to Thornfield,
  teaching lands.
- **Aki d+30 (34292, trust 100):** the water-haul ask with real numbers (8 liters),
  the favor-block direction spoken in place, grief over Elif ("Elif always took the
  burnt piece"), the role promise, teaching lands.
- **Valeria d+45 (34292, trust 90):** the door direction spoken in place, grief over
  Ekin, an invite accepted a little too quickly, teaching lands.
- **Ellie d+14 (34294, trust 90):** a secret with real stakes ("I'm not from Denver.
  I'm from Columbus, Ohio."), a second confrontation that holds ("I told you the
  truth. You can keep poking it, but it's told."), a private thinking place, party
  naming, teaching lands.
- **Aria d+30 (34293, trust 91):** a callback to a taught lesson ("I tried the Wild
  Onion like you showed me. Didn't poison anyone, so that's a win."), the trap-line
  walk, the Iron Pantry abduction remembered.
- The dry-hit sittings (Benjamin d+30, Carolina d+30, Carl d+64) read as people
  everywhere except the one dry line — the defect is the line, not the person.

## Blanks filled / documented
- F3 (commit-refusal lines as thread memory) — FIXED, proof-tested RED-then-GREEN,
  and verified in the wild (0 opener quotes across 71 transcripts).
- F4a (curious singleton q_teach_me) — FILED as the next fix item, traced to the
  singleton `q` in characterGen.json:6022 + run-ledger block.
- F4b (recap reframe splice) — FILED as the next fix item, second sighting
  (Maya r209 + Benjamin r218).
- F4c (dlg:help re-speaks the opener's quote) — FILED as the next fix item, traced
  to the engageBeat line colliding with the opener's snippet quote on the run ledger.
- Documented, not fixed: the smoke control bar moved by base drift (d6 Sofia 11/1/21
  → d7 Ashanti 10/2/33) and needs re-baselining on current master; CAP-NC denominator
  starved by design (0 eligible this panel).

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-11-16/journey-succession-r218-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
- LOUD: `deaths.bearer` +137% (baseline 7.6 → current 18, n=5 files).
- LOUD: `census.fallen` +75% (baseline 14.3 → current 25, n=5 files).
- **Verdict: explained, no investigation item.** Both LOUD lines are the KNOWN
  means-vs-sum artifact: the baseline holds per-seed MEANS while the checker sums
  across the 5 tele files. Per-seed means: deaths.bearer 3.6 vs 7.6 (down 53%),
  census.fallen 5.0 vs 14.3 (down 65%), census.alive 8.2 vs 3.8 (up — villages
  survived better this panel, see village assessment), week2.deadBearerMentions
  3.8 vs 4.2 (flat), integrationStage 3.0 flat. Baseline NOT rolled, per prereg.

## Metric review
- The stricter DRY CENSUS (any dry hit fails) did its job: it caught 3 NEW
  other-class hits that the old named-class-only rule would have passed. The
  amendment stays.
- The census FAIL is a finding, not a fix failure: F3's own verification (proof
  test + wild grep) is green; the 3 hits are unpooled surfaces the census exists
  to surface. No metric revision proposed — the next run's fix brief is F4a/F4b/F4c.
- CONTROLS: the frozen smoke bar is now stale on current master (drift-proven by
  the pristine A/B). Proposal for the NEXT run: re-baseline the smoke bar to the
  current-master snapshot (d7 Ashanti 10/2/33) as a measurement-maintenance step
  with its own prereg note — do not silently roll it.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: twelfth straight panel at zero.

## Reachable / fun / winnable
- **Reachable:** yes — the mantle passed on every seed (including an organic d15
  handoff), funerals held, new bearers trusted and playable; the content fires
  without special setup.
- **Fun:** the people check says yes — secrets with stakes, grief by name,
  callbacks to taught lessons, refusals that name a real condition, party naming
  that sticks. The succession moments read as story, not bookkeeping.
- **Winnable:** not by this leg alone — no village reached the table or national
  standing, and the win chain is still blocked upstream. But this panel's villages
  all survived their 70 days, which r209's did not — the survival picture after a
  clean handoff looks better than it did a run ago, on a fresh band.

## Gate
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2` launched
in the background (see closeout); log `evidence/2026-11-16/journey-succession-r218-gate.log`.
Result recorded at closeout / by adoption if the run clock runs out first.

## Landing
- Commits on `journey2-succession` (on top of master 5e0bba6e5):
  - `e028c5920` — F3 fix + proof test + prereg + panel tooling.
  - (evidence commit — see closeout)
- Merge / release / rotation / lock cleanup: recorded at closeout below.

## Closeout
- Gate result: (filled at closeout)
- Merge: (filled at closeout)
- Rotation: `7` → `4` (written at closeout, verified after)
- Lock deleted: (filled at closeout)
