# Journey succession r117 — ROLEPICK-HANDOVER SWALLOW + INVITE-SEAM RE-CHECK (lane B, pre-registration 2026-11-03, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last Lane B run overall is r116 (crisis,
recovery closeout landed 2026-11-03 05:00 run, rotation 6 → 7).
Last Lane B succession run is r108 (landed; keepsake-per-handoff
PASS, Tom-recap bug fixed). This run is r117.
Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97/r100/r104/r108). This run
uses journey2-succession-r117.

Base: local master at registration (621c71f95 at pre-flight).
No push, no bump, no live check — ship loop owns those. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched.
No canon doc covers succession/mantle (CANON.md manifest;
DEAD-LEDGER.md mentions succession only in passing) — none
invented here. docs/CONVERSATIONS.md is the canon doc for the
conversation-transcript area and was read before any fix, not
just the code comment.

## Why this run

Steve 2026-11-01: deliver real changes, stop re-proving
already-proven constraints. r108 left exactly three carried
wrinkles, and this run spends its panel on the two that are
checkable with fresh data, plus the per-run people check:

1. SCOUT-HANDOVER (r104 #2, r108 wrinkle 2): scout re-picks
   read as two people holding scout because no handover line
   appears in transcripts. Code-read done BEFORE play (not
   mid-run speculation): src/js/party-formal.js assignRole
   DOES say a handover line ("X nods, stepping back. 'Scout
   is yours now.'") plus an assignment line — but
   partyConvoTurn's rolepick branch returns
   `{ line: r.ok ? null : r.msg }`, and the convoTurn wrapper
   only pushes res.line into c.transcript. The spoken lines
   go to Game.say (main log) only, never the conversation
   transcript. The same swallow hits namepick: nameParty's
   say line is likewise discarded (line null on ok). So the
   wrinkle is NOT a transcript-capture gap in the driver —
   the driver's transcripts are c.transcript verbatim — it
   is a real game/UI gap: during a conversation, the player
   never sees the role handover they just caused. Q1 below
   proves it on a focused probe and fixes it same-run if
   the probe confirms.
2. INVITE WORDING (r104 #3, r108 wrinkle 1): menu label
   "Want to come with us?" vs handler's spoken "Want to
   come with me?". Since r108, journey-succession r112
   landed the INVITE-ASK fix (convo-dialogue.js dlg:invite
   speaks "us" once and suppresses the handler's "me" via
   _inviteSpoken). r108's 20/20 us/me counts predate that
   fix and are consistent with 20 pre-fix double lines, not
   with a surviving label-vs-spoken mismatch. Q2 re-judges
   the seam on fresh panel transcripts: if every invite now
   yields exactly one YOU line, the wrinkle is CLOSED by
   r112 and is not re-carried; if the direct (non-dlg)
   menu path still speaks "me" against an "us" label, that
   leftover is fixed same-run to the r112 canonical "us"
   (the dlg path already chose it), flagged [needs-eyes]
   as spoken-copy change.
3. HELD-WORK INSPECTION (standing INSPECT HELD WORK):
   the orphan journey2-succession dir still holds an
   uncommitted +3/-3 aimed-shot dodge fix (noted 2026-11-03
   01:04). This run checked: the orphan dir is not a git
   repo, its files differ from current master across ~19
   src/js files (stale since 2026-10-30, swamped by drift),
   and no aimedShot identifier exists on current master,
   so the +3/-3 hunk cannot be isolated from the orphan
   copy. Verdict: NOT recoverable from that dir; if the
   dodge-default defect still exists on master it needs a
   fresh probe, not an orphan rescue. Carried as an open
   item for a combat-focused run, not chased here.

## The questions

1. ROLEPICK-HANDOVER: on a focused probe (party named,
   member A holding scout, player re-picks scout for
   member B in a real conversation), does c.transcript
   contain the handover line? BEFORE-fix expectation from
   the code-read: NO — transcript holds only youSaid
   '"scout."', while the main say log holds both spoken
   lines. If the probe confirms, the fix is attempted
   same-run in party-formal.js only: partyConvoTurn
   captures the say lines emitted by assignRole /
   nameParty during the pick and returns them joined as
   the turn line, so the beat enters the transcript (the
   r67 principle: the beat must ENTER the transcript).
   assignRole's own say calls stay (main log unchanged).
   If the probe shows the handover IS in the transcript,
   Q1 is CLOSED as a driver artifact with the mechanism
   explained, and no game change is made.
2. INVITE-SEAM: on the fresh panel transcripts, does
   every invite outcome yield exactly one YOU invite line,
   and does its wording match the menu label ("us")?
   Bar: 0 double-line invites (us immediately followed
   by me for the same invite), 0 label-vs-spoken
   mismatches on the direct path. A mismatch is fixed
   same-run to "us" (r112 canonical) with [needs-eyes].
3. PEOPLE CHECK: full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something,
   options engage / deflect, endings resolve / plant /
   owe), no fabricated shared history, no filler loops,
   no static menus.

## Instrument (r108 files + renames + two declared additions)

- Driver: scripts/journey-succession-r108-20261102.js cloned
  with ONLY r108→r117 renames (filename, mode
  succession-r117, probe strings, tele/transcript filename
  patterns), EVID dir 2026-11-03, date 20261103.
  POST_DAYS=70, EARLY_KILL_DAY=40 (r108 values).
  CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r108's
  20/20/10/10). Controls: all four 0.
- Declared addition A (driver): SCOUT/INVITE seam capture.
  The driver already files full c.transcript texts; the
  analyzer gains a SEAM section counting, per panel:
  party_rolepick picks, handover lines ("stepping back")
  in transcripts, assignment lines ("is ... now") in
  transcripts, invite YOU lines by wording ("us" vs "me"),
  and double-line invites (us followed by me within one
  transcript). No game-state write, no RNG touch.
- Main analyzer: r108 analyzer cloned with ONLY renames
  + seed list changes (SEEDS [31201..31204], forced
  [31201,31202], young [31201,31202], mature [31203,31204])
  + the SEAM section above.
- Naming analyzer: r108 file cloned with ONLY renames
  (defaults seeds 31201..31204, tag r117).
- Proof tests: r108 files cloned with ONLY renames (driver
  path, scratch patterns r117-) + NEW proof
  scripts/test-party-rolepick-transcript.js (Q1 probe as a
  test: re-pick case asserts the handover + assignment
  lines are in c.transcript; first-pick case asserts the
  assignment line is in c.transcript; name-pick case
  asserts the naming line is in c.transcript). NO edit to
  (e)'s old r91-split expectations UNLESS a genuine
  same-iteration double is observed on this panel — in
  that case, and only then, (e) is re-baselined on that
  seed's trajectory with the split asserted structurally,
  and the re-baseline is documented as its own commit
  section.
- Diff verification: strip r108/r117 tokens, old/new seeds,
  and the SEAM block; the remaining files must be
  identical. Any other diff is a stop-and-explain item.
- Pilot seeds: 31201, 31202 (chain-forced), 31203, 31204
  (controls). Fresh numbers, never used by a succession
  panel (verified by succession-file grep before launch;
  31205/31206 reserved for expansion).
- Determinism leg: seed 31201 re-run trajectory-identical
  apart from recorded source line numbers (r108 metric
  review proposal, adopted here: a game fix landing
  between panel and re-run shifts stack-trace line numbers
  without changing game state; the leg judges drift, not
  line shifts).
- Expansion trigger (pre-declared, same shape as r108):
  pilot expands to 6 (adding 31205 chain-forced, 31206
  control) if ANY pilot seed shows a same-iteration double
  handoff OR scores silent under BOTH naming metrics. A
  keepsake regression is investigated same-run, not an
  expansion trigger; a week-1 second death alone does NOT
  trigger expansion.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer <redacted> on 4/4
  pilot seeds (true count from game records; a collapse on
  any seed is a NO-GO for the recorder, not re-scored).
- CHAIN5-READABLE: full fifth handoff recorded on every
  forced seed that reaches its fifth-kill window; a
  recorder miss on such a seed is NO-GO (a seed that ends
  before the window is not a recorder miss — reported as
  such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on
  every recorded fifth handoff; affinityDiff5 = 0 on every
  one.
- V1: every vanished id at a handoff snapshot has class
  'sentimental' in src/data/items.json. A vanished
  non-sentimental id (or UNKNOWN class) is a BUG finding:
  investigate the gearPack/corpse path same-run.
- V2: no sentimental id shows corpseN > 0 at any handoff
  snapshot.
- KEEPSAKE-PER-HANDOFF: on every disposition record with
  ≥1 vanished sentimental, keepsakeLineFired == true. A
  vanish without the line is a REGRESSION finding,
  investigated same-run. Fired-with-0-vanished is
  descriptive (r108 mechanism: the type survives via
  another copy).
- SEAM-ROLEPICK (Q1, post-fix bar): every transcript
  party_rolepick pick has its assignment line in the same
  transcript; every re-pick (role previously held by
  another member) has its handover line in the same
  transcript. Pre-fix, this bar is EXPECTED to fail on the
  probe (that failure is the finding, not a regression).
- SEAM-INVITE (Q2): 0 double-line invites; 0 direct-path
  label-vs-spoken mismatches across the panel.
- M3v2b ≥3/4 on the pilot panel (≥4/6 if expanded), same
  allowance shape as r108.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM (r108 form): every invite outcome
  spoken.
- PROOF: (a)–(d) and (f) must pass; (e2) must pass; (e) is
  EXPECTED to fail on its stale r91 expectation (carried
  debt, not re-scored, not edited) UNLESS a genuine
  same-iteration double is observed on this panel. A NEW
  failure in (a)–(d)/(f)/(e2) is a stop-and-explain item.
- A miss is NO-GO, never re-scored against a friendlier
  metric mid-run. Metric doubts go under "metric review"
  for the NEXT run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-03/journey-succession-r117-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94/r97/r100/r104/r108 precedent): a
forced-chain panel must NOT roll the unforced baseline
forward — LOUD lines from forced deaths are regime, not
drift, unless investigation shows a real bug. Baseline NOT
rolled on LOUD lines without a same-run explanation.
