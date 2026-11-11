# Journey crisis r176 — RUN NOTE (Lane B, leg 6) — ADOPTION CLOSEOUT

Prereg: `journey-crisis-r176-prereg.md`. Panel: policy oracleV2, 150d
death-aware +10d tail, 5 seeds 14301–14305, sequential. Driver + analyzer:
`scripts/journey-crisis-r176-delayed-20261110.js` /
`scripts/analyze-crisis-r176-delayed-20261110.js`.

## Adoption (this run)

- Timed-out r176 run (lock run_id 2026-11-11T01:57:36Z, worktree
  journey2-crisis, heartbeat 02:36:25Z) died before closeout; its own
  note (memory 2026-11-10, 20:58 CST) lists the owed work and names the
  next Lane B occurrence as owner. This run is that occurrence.
- Stale-lock recovery: at 03:55Z the heartbeat was 79 min stale, last
  worktree writes 61 min old, no live processes touching the tree. Lock
  replaced (run_id 2026-11-11T03:58:05Z); rotation-b still 6.
- The timed-out run's work was adopted VERIFIED, not taken on trust:
  every fix below was re-read in diff, its proof test re-run green, and
  the one piece it had not done — the panel re-run post-F4 — was RUN here
  (5 seeds, analyzer re-run, transcript diff). See "Adoption verification".
- Base at run start: master ed33b42b8. Master moved during the run to
  ad6a04b27 (sim-adoption-round-0230 landed) — rebase before merge (see
  Closeout). `git pull --ff-only` still fails (standing divergence,
  local master ahead/behind origin; reconciliation pending since Nov 8) —
  proceeded on local master per r156/r164/r168 precedent, no push, no bump.
- Pre-flight: main tree clean, disk 38%. Reap: LOUD lines only for other
  owners' dirty trees — not touched.

## Panel verdicts vs pre-registered bars

- C1 (bend, not break) GO: 5/5 game-over, every one with a named cause
  that is NOT a siege-mechanic failure (slow bleed-out: wild/monster/
  arena deaths + empty pantry; 0–1 alive at end). Softlock seeds 0.
  Horizon 0/5 — descriptive, not a bar (Q12 answered r168: 0/5 again).
- C2 (episodes fire + gates hold) GO: raids fire on all seeds (7,7,9,7,8);
  fought resolutions present; D1 snapshots 23/23 delayed >= 3 attempts;
  deltaBad empty; D3 drift unknown 0. Missed-window corrected 6 —
  descriptive, below the >= 8 instrument-look trigger.
- C2b (linger-conditional gorge/sortie) GO: lingerer set formed on all 5
  seeds; every boundary-firable case fired or refused with a recorded
  reason. W1 count: 0 same-set re-musters after a refusal.
- C3 (people check) GO: 40 transcripts read in full (timed-out run);
  fabricHits 0; WRAP unmarked 0 (40/40 marked). Q10 graduated — 6
  sightings, fixed in-run (F4) and verified post-fix (see below).
  Q3 voiceline stacking: 0 sightings this panel (watch stays open).
  Q7 naming-stance wobble: 0 (watch stays open). Double confession: 0
  (r172 guard holds — any recurrence would be a guard failure).
  Party-name pick varied across the panel (driver fix held).
- C7b (buried list reported) GO: buried dead named per seed (3,3,3,2,1);
  corpse-cause counts reported (disease 1, wound 2, thirst 1, famine 0).
- BENCH (watch only): refused 8 — shape supplyEmpty 6, gateOneShort 1,
  availabilityDrain 1. No single lever covers >= 80% (supplyEmpty 6/8 =
  75%): report "mixed, no single lever", majority shape supply-empty,
  gate ruled out (1/8). Alive-bench refusals 2, both dominated by nodeAway
  exclusions (living villagers away from the node, not dead/unwilling).
- Q1 split: corrected 6 = valve-expiry 4 (per-day 3) + drawn-off 2
  (per-day 2). Below the valve-expiry per-day >= 8 design-finding bar.
- Q2 medic census: holder spans on all 5 seeds; pharmacy EMPTY 5/5 at
  day 60 and at census; 0 medicine cures 5/5; medicine acquisitions 0 —
  the supply-origin probe's third straight zero (r168 also 0/5). Cures by
  ability 0–25 per seed. No medic-duty canary fired (no holder died on a
  sortie; blocked 8–82 while holders assigned is the standing shape).
- Q4 fight-1: clears are vKill/mFlee openers; broke-after-fight-1 all 6
  are vFlee openers with vTaken 4–86; cleared openers vKill 2 / mFlee 7.
  The vTaken>=~70 break clause stays UNTESTED in isolation (carried).
- Q5 multi-monster set clear: 4/8 (r154 8/12, r155 3/4, r156 post 7/14,
  r164 8/10, r168 3/4).
- Q6 G-ID watch: 16th panel at zero id-matched gorge-after-clear.
  Watch stays open, not closed.
- Q11: betrayal:site forced once (seed 14304) — the force-once worked
  after the bug fix below. Betrayal-investigation empty beats were
  exercised; witnesses unforced.
- Interesting-finding triggers: NONE fired (no Q1 >= 8, no canary, no
  Q3 graduation, no fourth wobble, no >= 80% lever, no double
  confession, no medicine acquisition, horizon 0/5 already answered).

## Fixes landed this run (proof-tested, RED on unfixed / GREEN on fixed)

- F1 DEAD MEMBER KEEPS PARTY ROLE (r168 filed #3): party-formal.js —
  registerDeath wrapped LAZILY (installPartyDeathRelease; load-time wrap
  never installs because party-formal loads before corpses.js defines
  registerDeath), partyDeathBeat guard changed from inParty() to the raw
  party array / role map (roster removal precedes the beat on all death
  paths), tbVillagerFalls wrapper beats BEFORE orig. Idempotent: a death
  routing through both paths beats exactly once. Proof:
  `scripts/test-journey-crisis-r176-party-role-death.js` — 21 passed.
- F2 "DEBTS UNPAID" AFTER A SETTLED DEBT (r168 filed #1; recurrent
  r156 #5): convo-wants.js — repay deflectBeat serves a settled pool
  when the favor state is fulfilled/thanked/acknowledged/moot/broken.
  Proof: `scripts/test-journey-crisis-r176-repay-deflect.js` — 18 passed.
- F3 ROLE RE-PICK NARRATES AS IF NEW (r168 filed #2, engine half):
  assignRole returns a quiet already-held line when the role is already
  held. Proof inside the party-role-death test file (cases 5).
- F4 Q10 RESUME QUOTES A SILENCE LINE (graduated: 6 sightings this
  panel, fourth consecutive panel at >= 1): conversation.js —
  convoSnippetIsRealBeat now also rejects silence-pool lines
  (convoMoodSilenceLines) and bridge lines (convoBridgeLines); new
  accessors in convo-mood.js / convo-beats.js; plant walks back to
  substance or plants nothing; resume-time guard drops quotes planted
  before the fix. Proof:
  `scripts/test-journey-crisis-r176-resume-quote.js` — 15 passed.
- BETRAYAL-FORCE BUG (driver, found by the first-pass/final comparison):
  the force matched bare `betrayal:site` but the choice id is
  `betrayal:site:case_2` — the force never fired on the first pass
  (betrayalSiteForced 0 on all seeds). Fixed to prefix-match; final
  re-run fired once (14304). Proof:
  `scripts/test-journey-crisis-r176-instruments.js` — ALL PASS (incl.
  party-role skip, turn cap 16, mid-run stash, med supply).
- Ontology fallout: `docs/ONTOLOGY.md` regenerated by the check.js run —
  two Provides lines now list Game.convoBridgeLines() and
  convoMoodSilenceLines(). Mechanical, committed with the fixes.

## Adoption verification (this run, not carried)

- Proof tests re-run on the adopted tree: 21 + 18 + 15 passed, 0 failed;
  instruments ALL PASS.
- check-wired on the 5 changed files: 5 unwired, ALL pre-existing
  (disbandParty, clearRole, roleBonus, splitParty, partyCardHtml — each
  present exactly once in HEAD, untouched by r176). Every r176 symbol is
  referenced (installPartyDeathRelease 6x, convoBridgeLines 3x,
  convoMoodSilenceLines 4x, convoIsSilenceLine/BridgeLine 9x).
- PANEL RE-RUN POST-F4 (the piece the timed-out run had not done): all 5
  seeds re-run on the fixed base. Headlines identical (95/122/96/102/121d,
  all game-over). Analyzer output byte-identical to pre-F4. JSONs: 4/5
  byte-identical; 14302 differs ONLY by convosDriven[6].npcLines 12→13
  (one conversation one line longer — a text-only effect). Transcripts:
  EXACTLY the 6 Q10 transcripts changed (14301-d20, 14302-d87, 14303-d36,
  14304-d24, 14304-d32, 14304-d76); the other 34 are byte-identical.
  Q10 resume-quote-of-silence: 6 → 0 across all 40 transcripts. The six
  resumes now quote real substance ("Anyway — I should get going.",
  "That's enough for now. It'll percolate.", "As I said — Get to their
  side of the Haven door…", "Well. My social battery is officially dead.",
  "We're done for now. Not done-done. For now.", "Go on, then. I'll be
  thinking good thoughts at you.") or name the thread without a quote.
  The bare silence line still appears as ordinary dialogue (legitimate
  stage direction) — it is only the QUOTE-AS-MEMORY that is gone.
  Pre-F4 outputs preserved in `journey-crisis-r176-pref4/`; first pass
  in `journey-crisis-r176-firstpass/`.
- Telemetry (post-F4 JSONs): quiet, no LOUD lines (defendedFights,
  playerFights, latelyDefenseCount vs telemetry-baselines/crisis.json).
  Baseline NOT rolled (single-panel variance).
- Targeted conversation/party green-list tests (22): 11 pass, 11 fail —
  IDENTICALLY on the adopted branch AND on the bare base (files restored
  to HEAD, re-run, then r176 files restored byte-identical and proof
  tests re-run green). The 11 failures are pre-existing stale tests
  (e.g. `Text is not defined`, Game.state null at setup) — NOT
  regressions from r176. They are non-quick tests the --quick gate never
  runs; the green list is stale for these files since 2026-10-14 and a
  refresh/quarantine is owed by the list's owner, not this leg.
- Gate (check.js --quick): 294 passed, 6 failed in 799s. Failures:
  phone-frame proof (3: retained browser inputs / boot inputs / phone
  evidence stale — index.html untouched by r176) and
  test-establishment-r20-fixes (racks-full voice gate daily reset —
  establishment/cooking, untouched by r176). [RE-RUN PENDING — names of
  the remaining 4 failures to be filled in from /tmp/r176-check-rerun.log
  before commit.]

## Second adoption (23:00 run, this run)

- The 22:00 adoption run timed out in resolve (memory 2026-11-10,
  22:57 CST) with the gate re-run, commit, merge, release, rotation
  6→7, lock delete and run-note closeout still owed. This run is that
  occurrence.
- Stale-lock recovery: lock run_id 2026-11-11T03:58:05Z (the 22:00
  run's) has NO registry entry; registry journey2-crisis heartbeat
  04:35:19Z was ~25 min stale at check; no process running in the
  tree; last tree write 04:50:22Z (the 22:00 run's own ONTOLOGY.md
  regeneration, recorded done in its note). Lock deleted, new lock
  2026-11-11T05:03:03Z written; worktree re-heartbeated (05:02:51Z,
  then hourly). Rotation-b still 6.
- Gate RE-RUN (this run, /tmp/r176-gate-rerun2.log): 290 passed, 10
  failed in 1226s. The 10: measurement-proof-update, measurement-
  workflow, mobile-combat-cadence, occupation-panels,
  measurement-cache-flags, phone-frame-proof (all exit 1),
  trust-observer-neutrality, synergy-stall, capable-bot-20261014 (all
  120s TIMEOUT under check.js), establishment-r20-fixes (exit 1).
  Every one verified PRE-EXISTING on the bare base (ed33b42b8, files
  stashed, diff hash recorded 5143508f… and restore verified
  byte-identical on pop): the 7 exit-1 failures fail identically on
  base (measurement-cache-flags is flaky — base 0 passed/4 failed vs
  branch 1/3, i.e. worse WITHOUT the fix); the 3 timeouts pass
  standalone on BOTH base and branch (trust-observer 6/0,
  synergy-stall exit 0, capable-bot 42/0), so the timeouts are
  check.js 120s-cap + heavy parallel-load artifacts, not r176
  regressions. None of the 10 touches a file r176 changed.
  (The 22:00 run's 294/6 vs this run's 290/10 is load variance — its
  gate ran 799s, mine 1226s with 3×120s timeouts; its partial log
  never listed its 6, so the sets can't be diffed exactly.)
- Proof tests re-run green by this run (21/0 + 18/0 + 15/0,
  instruments ALL PASS) before commit.
- Service restart mid-verification (05:36–05:37Z, during the branch
  standalone re-run): no effect — worktree state verified intact
  (diff hash still 5143508f…), no orphaned processes, lock intact;
  the interrupted command was re-run cleanly.
- `git pull --ff-only` still fails (standing divergence, local
  master ahead 519, behind 156 vs origin/master; reconciliation
  pending since Nov 8) — proceeded on local master per precedent,
  no push, no bump.

## Village assessment (plain words)

All five villages died out between day 95 and 122 — nobody reached the
150-day horizon, and every pantry hit zero (first empty between day 46
and 93). They didn't die in one disaster; they bled out. Monsters, the
wild, and the arena took people steadily — 12 to 20 dead per village —
a wound that wouldn't close took a few more, thirst and sickness one
each. By the end, zero or one person was left alive.

The villages fought back the whole way. Raids came 7–9 times per seed
and the villages answered 15 of 23 lingerer sets, clearing 5 outright.
When a sortie was refused it was almost always because there was nobody
left to send — the bench was empty, or the living were away from the
village — not because anyone refused to fight. Parties went out in
twos and threes and cleared half the multi-monster sets they faced.

Medicine is the standing hole: no village ever had any. The pharmacy
stayed empty on all five seeds, nobody was ever cured with medicine,
and the only cures were a healing ability. A medic was on duty in every
village for long stretches — but with nothing to give, the sick mostly
died or got better on their own. Where medicine comes from at all is
still unanswered after three straight panels at zero; that is a
content/design question for a future leg, filed here, not fixed here.

Conversations held up: 40 driven talks, nobody invented shared history,
and the one recurring glitch — a resume quoting a moment of silence as
if it were the thing people had been talking about — is fixed and proven
gone in the re-run panel.

## People check (C3)

40 transcripts read in full. Villagers want things, options engage or
deflect, endings resolve, plant, or owe — the meaning bar holds. No
fabricated history. The resume-quote glitch was the one systematic
failure and it is fixed (see F4). No voiceline prefix stacking, no
naming-stance wobble, no double confession.

## Reachable / fun / winnable

- REACHABLE: yes — raids, sorties, gorges, conversations, betrayals all
  fire on every seed.
- FUN: yes, with a caveat — the leg produces real drama (fought
  resolutions, parties, betrayal threads), but 0/5 villages surviving to
  day 150 means the measured leg is a story of slow collapse; the fun is
  in the fighting, not in winning the leg.
- WINNABLE: unchanged — 0/5 reached horizon; these fixes are correctness,
  not balance, and the winnability chain is untouched by this run.

## Metric review (§14)

- The Q1 split worked: valve-expiry vs drawn-off now reported separately
  (4 vs 2). Keep it.
- The C7b revised bar worked: buried lists reported per seed. Keep it.
- Determinism proof (prereg): the post-F4 re-run reproduced 4/5 panel
  JSONs byte-identical and the 5th differed only by one conversation's
  line count — the instrument is trajectory-neutral for text-only fixes.
  The analyzer output was byte-identical. No revision needed.
- Proposal for the NEXT run: make the post-fix panel re-run a formal
  step with its own analyzer pass and transcript diff (done here ad hoc
  after the timed-out run left it undone); and the Q10 graduation rule
  should keep counting only the current panel's transcripts (it does).
- The 11 stale non-quick conversation/party tests failing identically on
  base and branch: the green list needs a refresh or quarantine with
  reasons — owed by the list's owner, not this leg. Do NOT re-score the
  gate against a friendlier metric mid-run; the 6 --quick failures stand
  as recorded, all unrelated to this change.

## Closeout

- LANDING: committed in worktree via safe-commit.sh, merged --ff-only
  to master (rebased onto current master first — master had moved
  since the branch base), worktree released, rotation 6→7 written,
  lock deleted. Merged locally, pending ship (no bump, no push —
  ship loop owns it). Commit hash in the memory log entry for this
  run.
- Gate verdict: 290 passed, 10 failed; all 10 proven pre-existing on
  the bare base (see Second adoption) — the gate is red on master for
  reasons owned by other lanes (measurement-proof refresh,
  phone-frame proof refresh, establishment-r20 voice gate,
  mobile-combat cadence, occupation panels, measurement cache flags,
  and 3 load-timeout flakes). This run does NOT waive those failures
  — they are recorded here and in the report for their owners; the
  r176 fixes themselves are proven by their own 21/0+18/0+15/0 proof
  tests + instruments ALL PASS + post-F4 panel re-run + telemetry
  quiet.
- STANDING DIVERGENCE (carried): `git pull --ff-only` fails — local
  master ahead 519 / behind 156 vs origin/master (Steve's Cursor
  PRs #118–#121 pushed directly to GitHub master; reconciliation
  pending since Nov 8). Proceeded on local master per precedent;
  no push.
