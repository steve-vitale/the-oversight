# Journey succession r209 — Lane B, leg 7 (2026-11-15)

Run: `oversight-playtest-loop-2`, r209. Lock `journey2-succession-20261115T055546Z` (created 05:55:46Z).
Rotation read `7` at start; this run writes `4` at closeout.
Base master `783487438` ("journey-crisis r208"). Branch `journey2-succession`.
Worktree `~/workspace/worktrees/journey2-succession`.

## Pre-registration (summary; full text in `journey-succession-r209-prereg.md`)
- **Leg question:** when the player character dies, does the mantle pass cleanly to a new
  bearer, does that bearer's life read as a real life, and do conversations stay dry-free?
- **Fix brief (from r202):** F1 — deferred favor asks could return a ledger-blocked ask dry
  (`dlg:help` hit, seed 34262 d85 Logan); F2 — a blocked-favor direction line could be
  quoted in a resume opener as if it were a memory.
- **Seeds:** probe 34281–34284 (EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998
  (EARLY_KILL_DAY=5, POST_DAYS=25). Seed band 34271–34274 was REJECTED: 34274 is named
  in `evidence/2026-11-05/sim-grindfinish-b-prereg.md` as a `:34274` tile reference;
  34281–34284 have 0 hits in journey/sim preregs (3428x hits in Oct measurement JSONs
  are pantryKcal values, not seed reservations).
- **Metric amendment adopted (r202 proposal):** any dry hit fails the DRY CENSUS, named-class
  or other-class; the analyzer is the judge.
- **Telemetry baseline NOT rolled** (known means-vs-sum mismatch, carried from r202).

## Pre-flight
- Main tree clean; `git pull` already up to date; disk 37%.
- `worktree-reap.sh` skipped — registry lock held by a sibling reaper run (consecutive skips: 1).
- **Registration incident:** first `worktree-register.sh` exec was SIGTERM'd after ~272s
  (VM replacement/drain class, same as r202's adoption coordinator kill). It left a partial
  dir (only `evidence/`, 2.1G, no `.git`) and an un-checked-out branch. Deleted the partial
  dir, re-launched registration detached via `setsid nohup`
  (log `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey2-succession-r209-register.log`).
  It queued on REGISTRY.lock behind sibling sim-ove48 registrations, then completed.
  Worktree verified: branch `journey2-succession`, HEAD 783487438, `src/js/game.js` present.
  Heartbeat landed immediately; a 7-min heartbeat loop runs detached (PID 9901).
- Canon: `docs/CANON.md` read — zero mentions of mantle/succession/successor/inherit; no
  canon doc covers succession; none invented. Repo `AGENTS.md` read.

## Fixes landed (worktree only, commit 45bb70dba)
- **F1 — deferred-ask ledger guard** (`src/js/convo-wants.js`, `ask_favor.engageBeat`
  deferred-opener branch): if the deferred ask `convoWouldBlock`s, try the 3
  `convoFavorNeedLine` phrasings in order; return null when all blocked (caller falls to
  its graceful line, e.g. dlg:help's nowant pool). No RNG. Root cause: the water_haul
  favor line is templated (3 openers × 3 asks over village-wide cistern liters = 9 combos),
  so another villager's identical ask sat in the 48-entry run ledger; the DEFERRED OPENER
  branch returned the ask with NO ledger guard while the whyLine branch above it has the
  r147/r151/r166 guard.
- **F2 — favor-block lines never become thread memory** (`src/js/conversation.js` sayLine
  accepts opt-in `opts.noBeat`; `src/js/convo-dialogue.js:267` favor handler passes
  `noBeat:!result.ok` — blocked favor lines only, successful performances unchanged).
  Deliberately did NOT add reasonKey to the line-92 block (would change the spoken line;
  the raw line is more informative). Possible same-class surface, left alone: the
  dlg:commit gate reason spoken at convo-dialogue.js:617.
- **Proof tests (both ALL GREEN pre-panel, in worktree `scripts/`):**
  - `test-journey-succession-r209-deferred-ask-block-20261115.js` (engage/allblocked/control/
    ledger, seeds 5521–5524): engage returns "I still need help with the creek water run."
    when all 9 ask combos poisoned; allblocked returns null; control returns the deferred
    ask verbatim; ledger case proves sayLine itself untouched.
  - `test-journey-succession-r209-favorblock-nobeat-20261115.js` (handler/direct/control,
    seeds 5531–5533): handler case reproduces Logan's exact spoken line with thread memory
    staying the favor ask; direct case proves the flag both ways; control speaks the cycled
    pool variant with snippet staying the ask.
  - Red-case reasoning (not re-run): on unfixed code engageBeat returns the blocked ask
    verbatim, so the engage assertions fail by construction; same for test 2.

## Panel (06:29:27Z–06:31:03Z, all 5 seeds exit 0)
- 34281: 399,144 bytes (byte-identical to the foreground pilot); 34282: 577,685;
  34283: 726,621; 34284: 305,891; smoke 33998: 428,408 (same size as r197/r202 smoke).
- Analyzer exit 0 (`journey-succession-r209-analyzer.txt`).

## Verdicts
- **MANTLE-FINE: PASS.** 33 deaths observed (3 village-over excluded; 0
  flippedImmediate=false; 0 fineLatency>=2; 0 unexplained fineLatency==1; 6 held-briefly
  same-day cascade bearers, all SAMPLING-or-CLEAN; 0 day-skips — eleventh straight panel
  at zero). Seed 34282 ran a 15-death chain (Theo→Nathan→Shaker→…→Bridget); 34283 a
  14-death chain; 34281: Silas→Penelope d41 then village-over d81 betrayal; 34284: single
  handoff d42 Carolina→Elijah. Pick rank 1, funeral INCALL true on every seed.
- **DRY-CENSUS: PASS, 0 dry hits** (binding 0, other-class 0, honest fallbacks 0,
  null-return silences 0) — the r202 dlg:help hit does NOT recur; F1 verified in the wild,
  under the stricter any-hit-fails rule.
- **Wild check: PASS** — deflect_q 0, dlg:doubt 0, other-class 0; 0 fresh-favor phantom
  re-asks; selfReqDayEntries 0.
- **CONTROLS: PASS** — smoke 33998 at-death snapshot d6 Heinrich→Sofia, alive 11,
  fallen 1, newTrust 21 (matches the r193 revised bar; file size identical to r197/r202).
- **CAP-NC: INSUFFICIENT-DATA** (bonded-by-deadline 1/1 eligible — 34284 Somkiat d+2,
  deadline d+16; denominator <3). bondedEver 3/3 probe-opened seeds. OPP: unbonded
  talk-requests 2 (Gaston d42 34284; Esteban d5 smoke — the standing one); FIRST-bearer
  bonds on undriven days 2; NPC-NPC new bonds 40; newcomer arrivals 15.
- **F2 descriptive check (prereg-required):** 10 of 47 transcripts contain a favor-block
  direction line ("Haven hall" / "Go through the door" / "same side of the Haven door").
  ALL 10 are spoken in place as answers to the player's "Why can't I do this now?" —
  the line doing its job. ZERO resume openers quote a favor-block direction
  (grep for "never did finish talking about" + haven/door: no hits). The r202 second
  seam does not recur on this panel.

## Village assessment (plain words)
- **34281 — Silas hands the mantle to Penelope on day 41** (trust 58, 9 alive, 3 fallen at
  the handoff; 8 villagers were eligible to vouch). The village kept going for 40 more
  days and then fell apart in a betrayal on day 81 — the pantry was still full (24,273),
  so this was people turning on each other, not hunger. 57 bonds formed after the handoff.
- **34282 — Theo to Nathan on day 41** (trust 55, 10 alive). Then the mantle changed hands
  15 times in a cascade — the village kept burying bearers and picking up the mantle,
  and by the end nobody was left alive (20 fallen). Pantry 12,767: again, not starvation.
  49 bonds after the handoff.
- **34283 — Cormac to Devon on day 41** (trust 59, 9 alive). A 14-death chain followed;
  the village died out (16 fallen) with the pantry nearly empty (252) — the one seed
  where food ran out alongside the fighting. 61 bonds after the handoff.
- **34284 — Carolina to Elijah on day 42** (trust 57, 7 alive, 8 fallen). One clean
  handoff, no cascade. The village survived the window: 8 alive, 10 fallen, but the
  pantry hit 0. 64 bonds after the handoff — the most social of the four.
- **Smoke 33998 — Heinrich to Sofia on day 6** (trust 21, 11 alive, 1 fallen). The
  village stayed healthy to the end of its short window (11 alive, pantry 10,760).
- **The pattern:** the mantle itself passed cleanly every time — pick rank 1, funerals
  held, new bearers trusted. What failed on three of four probe seeds was the village
  surviving the 70 days after: they died fighting each other and the world, mostly with
  food in the pantry. That is the known survival-collapse problem, not a succession
  defect. The one village that held together (34284) did so while running its pantry
  dry — a quiet warning that the survivors' food problem is still waiting behind the
  fighting problem.

## People check (SENSE-TESTING LAW — 6 full transcripts read)
All six PASS — the NPC wants something, options engage or deflect it, endings
resolve/plant/owe. No fabricated shared history, no filler loops, no static menus.
- **Xavier d+3 (34281, trust 73):** opens with a real secret ("I can't read, and I'm
  scared it matters now"), a walk to a private thinking place, a kept promise, a guarded
  invite accept ("...Fine. This had better be worth it."), a sincere deflection
  ("I should go before I say something sincere"), comfortable silence, warm close.
- **Maya d+31 (34281, trust 92):** grief ("At night I talk to someone who isn't there
  anymore"), the kindness question answered honestly, and a living village detail — the
  whole fire arguing over what to call The Focus Group ("'The Ugly Bastard' got shouted
  down. What's your vote?"). Minor seam: "Let me be straight — Still on that question."
  — the recap reframe splices two fragments; readable, slightly stilted. Not a verdict item.
- **Victor, newcomer d+15 (34282, trust 20):** shy newcomer, honest invite refusal
  grounded in the relationship ("We've barely spoken. Ask me after we've bled together."),
  a real worldview ("It's like weather. You don't argue with weather. You build a roof.").
- **Somkiat, newcomer d+2 (34284, trust 20):** "Do you still count the days? I lost
  track days ago." — grief and witness-keeping; invite refusal "Alone's how I stay alive.
  Don't take it personal."; the naming debate (Naran pushing 'The Ugly Beast' for The
  Redactor); teaching Wild Onion lands ("They nod slowly, committing it to memory.").
- **Giulia, newcomer d+41 (34283, trust 20):** mourning by name — "We lost Jenny and
  Hassan. I do the headcount without thinking. Then I think." "Nobody says Hassan's name
  right yet. We will. Give it a few days." Teaching Black Walnut lands.
- **Nancy, stranger d+3 (34282, trust 10):** the pantry-run favor ask with real stakes,
  the favor-block direction line spoken as an answer, the naming debate about Buffering
  (Sofia pushing 'Big Ugly'), invite refusal "You want me to follow you into the dark?
  Earn that first."

## Blanks filled / documented
- F1 (deferred-ask dry) — FIXED, proof-tested, and verified in the wild (0 dry hits).
- F2 (favor-block line quoted as memory) — FIXED via noBeat, proof-tested, and verified
  in the wild (0 opener quotes across 47 transcripts).
- Documented, not fixed: dlg:commit gate reason at convo-dialogue.js:617 is a possible
  same-class noBeat surface (unverified, no transcript evidence this panel). The
  Maya d+31 recap splice is a small seam for a future pass.
- CAP-NC denominator starved by design (only 1 eligible bearer-bond case this panel).

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-11-15/journey-succession-r209-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
- LOUD: `deaths.bearer` +295% (baseline 7.6 → current 30, n=5 files).
- LOUD: `census.fallen` +313% (baseline 14.3 → current 59, n=5 files).
- **Verdict: explained, no investigation item.** Both LOUD lines are the KNOWN
  means-vs-sum artifact: the baseline holds per-seed MEANS while the checker sums
  across the 5 tele files. Per-seed means: deaths.bearer 6.0 vs 7.6 (down 21%),
  census.fallen 11.8 vs 14.3 (down 17%), census.alive 3.8 = baseline exactly,
  week2.deadBearerMentions 4.0 vs 4.2 (flat), integrationStage 3.0 flat.
  Baseline NOT rolled, per prereg.

## Metric review
- The stricter DRY CENSUS (any dry hit fails) held and passed — the r202 amendment
  works as intended and should stay.
- CAP-NC's <3 denominator rule correctly returned INSUFFICIENT-DATA on a 1/1 pass;
  the one eligible case bonded on time, which is encouraging but not a verdict.
  No metric revision proposed; the starvation is by design (bond-by-deadline cases
  are rare), and the OPP numbers (40 NPC-NPC bonds, 15 newcomer arrivals) show the
  social machinery is alive around the mantle.

## Reachable / fun / winnable
- **Reachable:** yes — the mantle passed on every seed, funerals held, new bearers
  trusted and playable; the content fires without special setup.
- **Fun:** the people check says yes — secrets, grief by name, naming debates, refusals
  that name a real condition ("Ask me after we've bled together"). The succession
  moments themselves read as story, not bookkeeping.
- **Winnable:** not by this leg alone — three of four probe villages died out in the
  70 days after a clean handoff. Succession is no longer the blocker; the village
  surviving what comes after is. That is the standing survival-collapse hunt, not a
  new finding.

## Gate
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2` launched
06:36:09Z in the background (PID 21778), log
`evidence/2026-11-15/journey-succession-r209-gate.log`. Result recorded below at
closeout / by adoption if the run clock runs out first.

## Landing
- Commits on `journey2-succession` (on top of master 783487438):
  - `45bb70dba` — F1/F2 fixes + proof tests + prereg + panel tooling.
  - `608d9efc2` — panel evidence (stdout/stderr/tele/analyzer/panel log).
  - `f7ee732f1` — 47 panel transcripts.
- **Index-clobber note:** the safe-commit clobber struck on ALL THREE commits this run
  (6 files, then 18, then 47 staged-deleted; worktree files byte-identical to HEAD).
  Repaired each time via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`,
  verified with `git status` clean + `git diff HEAD` empty + blob hash-match. All three
  commits are intact. The clobber is now a 4-sighting pattern (Oct 22, Oct 23 ×2, today ×3)
  — after EVERY safe-commit, run `git status --short` before anything else.
- Merge / release / rotation / lock cleanup: recorded at closeout below.

## Closeout
- Gate result: **KILLED MID-RUN — no verdict.** `check.js --quick` launched 06:36:09Z (PID
  21778); the run died ~06:55Z with the gate still in flight. Its log
  (`journey-succession-r209-gate.log`) holds one partial line (340 scripts, F's visible
  mid-stream, no summary, no failing-test identities) — NOT adjudicable. The gate is
  re-run during adoption (see adoption note below); the re-run is authoritative.
- Merge: (filled by adoption — see below)
- Rotation: `7` → `4` (written by adoption at closeout)
- Lock deleted: the r209 lock (`journey2-succession-20261115T055546Z`) was stale-recovered
  by the 02:00 CST Lane B occurrence; the new lock
  `oversight-playtest-loop-2-20261115T080000Z` covers adoption + the leg-4 run.

## Adoption (02:00 CST occurrence, same loop — stale-lock recovery)
- Previous run DEAD by the overlap guard: registry heartbeat 06:55:06Z, 60 min stale at
  07:55Z; no file writes in the tree in the last ~55 min; no live r209 processes.
  Lock deleted, new lock created, heartbeat re-landed 07:57:40Z (verified by readback)
  + detached 7-min heartbeat loop (PID 64706).
- Commits verified on recovery: the 3 branch commits match the run note above
  (fix commit 45bb70dba src diff read in full — F1/F2 exactly as described; both
  proof tests re-run ALL GREEN on the branch as committed). Untracked evidence
  (this note + the killed gate log) committed as the adoption's first commit.
- Gate re-run + rebase + merge: recorded below as adoption steps complete.
