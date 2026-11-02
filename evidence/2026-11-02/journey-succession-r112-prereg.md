# Journey succession r112 — SCOUT-HANDOVER PROBE + FRESH-SEED PANEL (lane B, pre-registration 2026-11-02, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last numbered Lane B succession run is r108
(landed; keepsake-per-handoff verified 6/6, Tom-recap bug fixed).
Last Lane B run overall is r111 (crisis, wrote rotation 6 → 7).
This run is r112. Slug deviation, documented: the body slug
journey2-succession is unusable (done-merged registry entry +
orphan directory on disk, same class as r83/r87/r89/r91/r94/
r97/r100/r104/r108). This run uses journey2-succession-r112.

Base: local master at worktree rebase (b6deca172 at pre-flight;
branch was cut at 2c119dde3 by the first registration attempt and
rebased onto master before any work — zero unique commits at
rebase, so no content moved). No push, no bump, no live check —
ship loop owns those. Gating freeze (2026-10-27) stands; no gate,
deed-bar, standing, wave, or table-price change is in scope.
Perception law untouched. No canon doc covers succession/mantle
(CANON.md manifest) — none invented here. docs/CONVERSATIONS.md
is the canon doc for the dialogue areas touched (role picks,
invite wording) — read before any dialogue fix, not just the
code comment.

## Why this run

Steve 2026-11-01: deliver real changes, stop re-proving
already-proven constraints. r108 closed its two open items, but
left two carried wrinkles that this run spends its panel on,
plus the per-run people check:

(1) SCOUT-HANDOVER (r108 wrinkle 2, display gap): on r108's
panel, a villager re-picked scout while another held it, and no
handover line appeared in the transcripts — yet the code-read
said assignRole transfers with a spoken handover. This run
probes the channel split to a verdict instead of carrying it
a third time. Code-read before play (party-formal.js):
assignRole DOES say() a handover line ("<holder> nods,
stepping back. '<role> is yours now.'") plus an assignment
line, while the party_rolepick handler returns line:null on
success — and driven transcripts are built ONLY from
convo.transcript, never from the say log. The probe settles
whether the line reaches the player at all, and through which
channel.

(2) INVITE WORDING (r108 wrinkle 1, recurring): menu label
"Want to come with us?" (convo-beats dlg:invite) vs spoken
ask "Want to come with me?" (conversation.js invite pools /
done call). This run re-checks it on the fresh panel's
transcripts and, if still present, attempts the alignment fix
same-run (spoken ask follows the menu label — the player's
actual choice), flagged [needs-eyes] because spoken lines
change. If the fix proves messy (multiple pools, gesture
paths), it falls back to carried-with-exact-sites, not a
silent partial edit.

The panel itself is a fresh-seed re-confirmation of r108's
bars (not a re-proof for its own sake: the base moved since
r108, including the npcdeadfilter succession fix — "succession
can no longer pick a dead roster id" — which this panel
exercises in real succession selection on 4 seeds).

## The questions

1. SCOUT-HANDOVER PROBE: construct the shape with real
   machinery — a party in which A holds scout, then a real
   conversation in which B picks scout from the role menu —
   and capture (a) the sayLog lines emitted during the pick
   and (b) the convo transcript entries after the pick.
   - BUG if: no handover line in EITHER channel (a silent
     transfer — violates no-silent-actions). Fix attempted
     same-run, proof-covered.
   - CLOSED-as-channel if: the line fires into the sayLog
     (narration) but not convo.transcript. The transfer IS
     narrated, consistent with the nameParty pattern
     (line:null + say()); the r108 transcript gap is then a
     capture-channel limit of dialogue-transcript-only
     sense-reads, documented, not a game defect. No mid-run
     change to the panel's sense-read inputs.
   - NO-DATA if the shape cannot be constructed (party/role
     menu unreachable in the probe), with the exact blocker.
2. PANEL: fresh seeds, r108 bars unchanged (see below).
3. PEOPLE CHECK: full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something,
   options engage / deflect, endings resolve / plant / owe),
   no fabricated shared history, no filler loops, no static
   menus.
4. INVITE WORDING (descriptive + fix criterion): mismatch
   present on ≥1 panel transcript → alignment fix attempted
   same-run ([needs-eyes], proof-covered); absent → CLOSED.

## Instrument (r108 files + renames, no logic change)

- Driver: scripts/journey-succession-r108-20261102.js cloned
  with ONLY r108→r112 renames (filename, mode succession-r112,
  probe strings, tele/transcript filename patterns), EVID dir
  2026-11-02, date 20261102. POST_DAYS=70, EARLY_KILL_DAY=40
  (r108 values). CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r108's 20/20/10/10).
  Controls: all four 0. Keepsake capture carried verbatim.
- Main analyzer: r108 analyzer cloned with ONLY renames +
  seed list changes (SEEDS [30507..30510], forced [30507,30508],
  young [30507,30508], mature [30509,30510]).
- Naming analyzer: r108 file cloned with ONLY renames
  (defaults seeds 30507..30510, tag r112).
- Proof tests: r108 files cloned with ONLY renames (driver
  path, scratch patterns r112-) + keepsake-line check carried.
  NO edit to (e)'s old r91-split expectations UNLESS a genuine
  same-iteration double is observed on this panel — in that
  case, and only then, (e) is re-baselined on that seed's
  trajectory with the split asserted structurally, and the
  re-baseline is documented as its own commit section.
- Handover probe: NEW script scripts/probe-scout-handover.js
  (harness-level, throwaway seed only, writes its own
  evidence/2026-11-02/journey-succession-r112-handover-probe.*
  files, never the panel's). It forms a party through real
  conversation invites, assigns scout to A through the real
  role menu, then has B pick scout through the real role
  menu, capturing sayLog-during-pick + transcript-after-pick.
  No game-code change inside the probe; state writes are
  limited to the probe's own harness village and are reported
  as such. If the invite path cannot be driven to a party,
  the probe reports NO-DATA with the exact blocker rather
  than forcing membership through a back door.
- Diff verification: strip r108/r112 tokens, old/new seeds,
  and the handover-probe addition (new file, no r108
  counterpart); the remaining cloned files must be identical.
  Any other diff is a stop-and-explain item.
- Pilot seeds: 30507, 30508 (chain-forced), 30509, 30510
  (controls). Fresh numbers, never used by a succession panel
  (verified by succession-file grep before launch; 30511 forced
  / 30512 control reserved for expansion).
- Smoke tests first, throwaway seeds, files deleted before the
  panel: SEED=30997 5d/5d proves the doAction wrap runs;
  SEED=30996 5d/25d SECOND_KILL_DPLUS=3 proves iteration
  stamps + keepsake flags on chain entries.
- Determinism leg: seed 30507 re-run TRAJECTORY-IDENTICAL
  apart from recorded source line numbers (r108 metric-review
  proposal, adopted: a game fix landing mid-run shifts stack
  line numbers without moving game state; the leg judges
  drift, not line shifts). Any game-state byte difference is
  a stop-and-explain item.
- Expansion trigger (pre-declared, same shape as r108):
  pilot expands to 6 (adding 30511 chain-forced, 30512 control)
  if ANY pilot seed shows a same-iteration double handoff OR
  scores silent under BOTH naming metrics. A keepsake
  regression is investigated same-run, not an expansion
  trigger; a week-1 second death alone does NOT trigger
  expansion.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer deaths on 4/4
  pilot seeds (true count from game records; a collapse on any
  seed is a NO-GO for the recorder, not re-scored).
- CHAIN5-READABLE: full fifth handoff recorded on every forced
  seed that reaches its fifth-kill window; a recorder miss on
  such a seed is NO-GO (a seed that ends before the window is
  not a recorder miss — reported as such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- V1 (vanish mechanism, re-confirmation): every vanished id at
  a handoff snapshot has class 'sentimental' in
  src/data/items.json. A vanished non-sentimental id (or
  UNKNOWN class) is a BUG finding: investigate the
  gearPack/corpse path same-run.
- V2 (vanish mechanism, re-confirmation): no sentimental id
  shows corpseN > 0 at any handoff snapshot.
- KEEPSAKE-PER-HANDOFF: on every disposition record with ≥1
  vanished sentimental, keepsakeLineFired == true. A vanish
  without the line is a REGRESSION finding, investigated
  same-run. Fired-with-0-vanished is descriptive (see r108).
- HANDOVER-PROBE: verdict per Q1 criteria above — BUG,
  CLOSED-as-channel, or NO-DATA with blocker. No bar is staked
  on the probe finding a bug; a CLOSED verdict is a complete
  outcome.
- INVITE-WORDING: verdict per Q4 criteria above.
- M3v2b ≥3/4 on the pilot panel (≥4/6 if expanded), same
  allowance shape as r108.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- PROOF: (a)–(d) and (f) must pass; (e2) must pass; (e) is
  EXPECTED to fail on its stale r91 expectation (carried debt,
  not re-scored, not edited) UNLESS a genuine same-iteration
  double is observed on this panel, in which case (e) is
  re-baselined as declared above. A NEW failure in
  (a)–(d)/(f)/(e2) is a stop-and-explain item.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-02/journey-succession-r112-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94/r97/r100/r104/r108 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Baseline NOT rolled on LOUD lines without a
same-run investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r108: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; re-observe the
capable-bot food-deed proof status here and report it. Any NEW
failure is a stop-and-explain item. The run's own proof tests
are run standalone (see PROOF bars above).
