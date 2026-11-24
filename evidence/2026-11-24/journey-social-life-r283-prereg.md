# Journey social life r283 — PRE-REGISTRATION (Lane B, 2026-11-24) — STAGING COPY

Run ID `playtest-loop-2-20261124T1500Z` (leg 5, r283). Rotation-b read 5 at
run start (social life); this run plays 5 and writes 6 at closeout. Base at
run start: master `003f86c9f` (holdrepeat-fix-a closeout); master moved to
`500d65ea7` during the run — re-pull before registering; the worktree base
is whatever HEAD is at registration time. Prior Lane B social runs: r256,
r260, r261, r265, r266, r268, r277 (NO-GO: M4 25, F6 dry 1, F5W 0;
OUTING/TRAIL/M12 GO).

## Leg question (carried from r238 + r277)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed/answered by character, moots firing, conversations reading
as people, wants surviving across sittings without drying — and do the
r277 NO-GO items get FIXED: M4 teach-frame pool cycling (25 flags), the
F6 post-warning dry line (1), the F5W settled re-ask (0), outing
conversion (14.3% < 25% watch)?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45853–45856**. Backup band **45865–45868**.
- Word-boundary check (`git grep -w -E "4585[3-6]" -- 'evidence/*/*-prereg.md'`):
  0 hits for each seed of the primary band; 45857/45858/45860/45861/
  45862/45864/45865/45866/45867/45868 also 0.
- **45849–45852: RESERVED** (r277 named backup — treat a named band as
  used, even with no judged corpus behind it).
- **45859, 45863: AVOIDED out of caution** (r277 precedent). Each has one
  prereg hit that resolves to a code line number, not a seed naming
  (45859: `tbEnd's 'lost' branch ~45859` in sim-pyrrhic-b-prereg.md;
  45863: `game.js:45863` in sim-ladder-leg2-prereg.md) — skipped anyway
  so the next worker faces no ambiguity.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260),
  45793–45796 (r261), 45801–45804 (r265), 45813–45816 (r266),
  45829–45832 (r268), 45845–45848 (r277).

## Arms

### Arm A: VARIETY POOLS (GAME, binding) — M4 content fix

**Diagnosis correction (this run, verified against the r277 panel
evidence — supersedes the r268 diagnosis).** The r268 note claimed
"per-sitting `teachFramesUsed` does not survive the agency-ask path".
The r277 analyzer log proves the opposite: Ines taught 11 plants in
ONE sitting (Chanterelle, Baobab, Tulsi, Murumuru, Loquat, Maypop,
Lotus, Kapok Seeds, Huckleberry, Wild Amaranth, Chinese Chive) using
ALL FOUR frames — frame 0 x3, frame 1 x3, frame 2 x2, frame 3 x3.
That is the exact signature of pool cycling (4 + 4 + 3), not of a
reset failure. The rotation survives the agency-ask path; the pool is
too small for the sitting's teach density. `teachFramesUsed` /
`teachPlaceFramesUsed` are also NOT in `startConvo`'s reset list
(they persist per villager until the pool cycles) — consistent with
the observed cycling. The fix is pool widening, NOT rotation repair
and NOT analyzer normalization (r277 metric review #1 stands: do NOT
normalize teaching frames away — a player hearing the same frame for
four plants hears real repetition).

- Plant teach frames 4 -> 8 (`convoTeachPlantLine`,
  src/js/villager-agency.js): keep the 4 originals first, add 4 new
  distinct-sensory frames (drafts below).
- Place teach frames 4 -> 8 (`convoTeachPlaceLine`, same file):
  keep the 4 originals first, add 4 new frames (drafts below).
- Mood `up:warm` pool 2 -> 4 (`convoMoodBeat`,
  src/js/convo-mood.js): add 2 new stage directions (drafts below).
- Hunger-plea whyBits/whyTails 3 -> 4 each (`food_share.build`,
  src/js/convo-wants.js): the family did not fire in r277 (no flags),
  so this is variety insurance, not a defect fix; add 1 each (drafts
  below). The ask line already composes 3x3x2 = 18 combinations.

Proof tests: `scripts/test-journey-social-life-r283-variety-pools-20261124.js`
— frame-rotation fixtures: 8 plant lessons in one sitting use 8
distinct frames (no repeat before pool exhaustion); 8 place lessons
likewise; `up:warm` serves 4 distinct beats across 4 mood shifts;
hunger-plea why composition varies. RED before the pool widening
(4-frame pools repeat by lesson 5), GREEN after.

### Arm B: F6 POST-WARNING DRY SITE (GAME, binding)

**The defect, verbatim from the r277 panel (seed 45846, C-friendship,
vid `app_mgpspqw5921`, day 81):**

- NPC: "Listen. I need you to hear this before you go back out there.
  We all learn." (warn_you opener)
- YOU: "Tell me." (dlg:details)
- NPC: "If you see that Big-Eyes again, don't try to be clever. Get
  back inside the palisade." (engageBeat -> convoWantWarning)
- YOU: "I hear you. I'll watch myself." (dlg:heed, stage >= 2)
- NPC: "...Sorry, lost my train of thought." (DRY)

**Root cause (code + transcript, this run).** The warning was
delivered via dlg:details, which marks `c._warnDelivered = true`, so
the dlg:heed handler (`convo-dialogue.js`, heeds < 4 branch) falls to
its 3-line generic pool (`dlg:heed:lines`) with NO pre-check. The
picked generic line was run-ledger-blocked — another villager had
said one of the 3 generic heed lines within the last 48 NPC lines —
and `sayLine` dry-replaces run-blocked lines. The sibling paths
already pre-check (`convoWantWarning` rotates past
`convoWouldBlock`; the DRY3 agency fix pre-checks the lesson line);
the heed generic branch never did. NOTE: Lane A establishment r277
landed TODAY (master, in `startConvo`: `c._warnDelivered = false`
per sitting) fixes the LATCH (every later sitting's first heed fell
back to the generic pool), but does NOT fix this site: within THIS
sitting the warning was already delivered via details, so the heed
still falls to the generic pool and can still dry.

**Fix (convo-dialogue.js, dlg:heed, heeds < 4 branch):** (a) widen
the generic pool 3 -> 6 (drafts below); (b) pre-check each candidate
with `convoWouldBlock` and serve the first unblocked (same pattern
as `convoWantWarning` / DRY3); (c) if ALL generic lines are blocked,
fall back to `convoWantWarning` — a fresh warning variant (contentful,
rotation-guarded, never the just-delivered line since the cursor
advanced past it; the NPC doubling down on a real danger reads as
emphasis, not parroting) — instead of the dry line. The deepen
branch (heeds >= 4, 5 lines) has the same exposure but is rarer;
NOT in scope this run — note as follow-up.

Proof test: `scripts/test-journey-social-life-r283-heed-dry-20261124.js`,
shaped like the r268 resume-fallthrough test (godpath lib): poison
the whole generic heed pool through OTHER villagers' sittings
(cross-villager run ledger, never the test villager's own said
lists), plant a warn_you want, details -> warning, press dlg:heed,
assert the transcript holds a content line (warning variant), never
the dry line. Control: unpoisoned heed speaks a generic line. RED
before the fix (dry), GREEN after.

### Arm C: F5W + OUTING BLOCKERS (report-only this run)

- F5W seed-lifetime design is NOT built this run: the panel
  re-measures the funnel (dawns scanned, askFavor seeds, settled-at-
  last-sight, attempts, reasks, variants) as evidence for the design
  (seed survives sittings until the favor settles, or a
  settlement-triggered re-ask). Bar stays >= 1; do NOT lower it.
- Outing blockers: panel reports blocked-forage /
  blocked-positioning / blocked-depart tallies (r277: 22 / 14 / 3)
  and the `unexpected-action:?` probe if it recurs (r277: 1 case,
  seed 45846 — the dawn arm met a villager state with no action).

## Continuity panel

- Fresh seeds **45853–45856** (see band check above).
- DAYCAP 140. Same M1–M12, B5 split, B6 rows, F5 counter, F6 dry
  hold (bar 0), outing-chain tallies as r277. Arm D PANTRY-DAWN
  snapshot carried verbatim.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs
  diffed identical before judging (r237–r277 precedent).
- Panel runs on the FIXED code (Arms A + B proof-green before launch).

## Metrics (binding, same as r277)

- **OUTING:** attempts >= 4 panel-wide.
- **TRAIL WILD HOLD:** distinct >= 6 panel-wide AND max recurrence
  per seed <= 4.
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5W:** total >= 1 panel-wide.
- **M4-SPLIT-GO:** conversational near-dup flags panel-wide <= 12.
- **M12-NATIVE:** threeTimes maxPerSitting <= 1, sittings2plus = 0,
  exits >= 1.
- **M1–M12, B5, B6:** same bars as r268 (see
  evidence/2026-11-23/journey-social-life-r268.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, outing conversion
  (watch >= 25%), hunger-plea share of M4, teach-frame pairs.

## Metric review (for the NEXT run, not this one)

- If M4 still reads > 12 after the pool widening, the next question
  is teach DENSITY per sitting (11 lessons in one sitting cycles even
  an 8-frame pool once) — a driver-ask cap or a per-sitting lesson
  cap — not more frames.
- If F6 still reads > 0, name the exact site (heed generic branch is
  fixed here; the deepen branch is the known next suspect).
- If F5W still reads 0 with promises flowing, the seed-lifetime
  design is next (funnel from this panel is its evidence).
- If outing conversion stays < 25%, the next question stays the
  depart/forage blockers, not the commit step.
- If TRAIL distinct clears 6 but the pool is still kcal-slot
  variants, the next TRAIL question is new lines (r261 metric
  review), not counting.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r277-20261123.js` ->
  `scripts/journey-social-life-r283-20261124.js` (seeds 45853–45856,
  OUTDIR evidence/2026-11-24, filenames r283, mode string r283;
  PANTRY-DAWN + Arm A pick-helper wiring carried verbatim).
- Analyzer: `scripts/analyze-journey-social-r277-20261123.js` ->
  `scripts/analyze-journey-social-r283-20261124.js` (reads r283
  JSONs; PANTRY-DAWN rollup carried).
- Helpers: `scripts/journey-social-r226-helpers.js` (unchanged —
  pickConversationChoice carried).
- Proof: `scripts/test-journey-social-life-r283-heed-dry-20261124.js`
  (RED before, GREEN after); `scripts/test-journey-social-life-r283-variety-pools-20261124.js`
  (RED before, GREEN after).
- Standing proofs re-run on the worktree: M4-split (extended),
  F5 harness (r238) 50/50, F6 proof (r226) 49/49, TRAILTALK proof
  (r236) 30/30, repay-fallback (r238) 36/36, gossip-dry (r256) 9/9,
  resume-fallthrough (r268) 36/36, driver-commit (r277) 9/9.

## Content drafts (Arm A + Arm B pools — originals stay first)

Plant frames (add 4 after the existing 4 in `convoTeachPlantLine`):
5. `"See how ${plant} grows — low, where the damp holds. That's the first thing to learn about it."`
6. `"${plant} — the root's the honest part. Dig a little and you'll know it anywhere."`
7. `"${plant}. Crush it between your fingers first — the smell tells you before the taste does."`
8. `"This is ${plant}. The leaf tells you the season, the stem tells you the ground. Learn both."`

Place frames (add 4 after the existing 4 in `convoTeachPlaceLine`):
5. `"${place} — I know it by the sound of it, the way the wind moves through. You'll hear it too."`
6. `"When you reach ${place}, look for the high ground first. That's how you find your way back."`
7. `"${place} — it's a half-day's walk when your legs are fresh, longer when they're not. Pace yourself."`
8. `"I stood at ${place} in the rain once. It's real — wet, cold, and worth the walk."`

Mood `up:warm` (add 2 after the existing 2 in `convoMoodBeat`):
3. `'Their hands stop fidgeting. Whatever they were holding back, they're letting it out now.'`
4. `'A laugh escapes them — short, surprised, real. The guard drops a notch.'`

Hunger-plea whyBits (add 1 after the existing 3 in `food_share.build`):
4. `` `My ribs have started showing through my shirt.` ``
Hunger-plea whyTails (add 1 after the existing 3):
4. `` `Even a handful of anything would get me through the day.` ``

Heed generic pool (add 3 after the existing 3 in dlg:heed, `dlg:heed:lines`):
4. `'"Good. That's all I wanted — someone out there who comes back."'` 
5. `'"Alright. I'll stop hovering. Just — come back, yes?"'`
6. `'"Good. The fire's warmer with you beside it, that's all."'` 

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-24 by
  this run; the no-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments). No
  commits to either since 2026-11-18 — verify `git log
  --since=2026-11-18 -- docs/CONVERSATIONS.md docs/CANON.md` empty
  in the worktree at run start.

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `003f86c9f`;
  `git pull` already up to date; disk 52%.
- Lock `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261124T1455Z` (created 14:55:00Z).
- **Write flap window ~15:03Z–ongoing at staging time.** First
  worktree-register attempt failed (~15:0xZ): `git worktree add`
  refused at checkout (`unable to write file tools/mobile-sim.html`,
  `version.json`) and `fatal: Could not reset index file to revision
  'HEAD'` — no tree created, no registry entry, clean failure.
  Probe pattern (this run): shell `>` redirects intermittently
  succeed (including `.lock` names at 15:21:32Z) while `git
  update-ref` lock writes fail seconds later (15:21:55Z) — the flap
  flickers on a sub-minute scale; git's lock-file creation is what's
  refused. Uptime at 15:15Z was 1:45 (machine restarted ~13:30Z);
  the flap started ~90 min after boot — the after-restart timing is
  no longer a reliable lead (Nov 21 precedent). Per the flap skill:
  probe before writing, wait for clear, do not hammer retries.
  **Adoption: re-probe with `git update-ref refs/heads/probe-r283
  HEAD` (delete after); register ONLY when it passes twice ~1 min
  apart, then register immediately in the same call chain.**
- Dead partial tree `journey2-4` (r281 endgame registration, died
  before registering) still on disk, locked, NO registry entry, 7/79
  entries — not mine to remove (registered by another run_id); does
  not consume a cap slot (14/16 registry-active at pre-flight).
  Note for the reaper owner.
- Registry-lock jam NOT observed this run (no register/flock process
  holding REGISTRY.lock at checks; the lock file itself is 0 bytes,
  mtime 15:03Z).

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r277 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r261/r277 precedent). Commit
  via safe-commit.sh in the worktree, ff-merge in main tree, release
  tree, rotation-b 5 -> 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r277 built an ad-hoc /tmp baseline from
  the r268 panel — this run builds the same from the r277 panel and
  does NOT roll a baseline without adjudication).
- Heartbeat the registered worktree before each major phase
  (`bash scripts/worktree-heartbeat.sh journey2-social`).
