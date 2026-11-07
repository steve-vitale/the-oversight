# Journey leg: DEEPENING (days 40–80) R113 — "DO BOND/LINK ASKS REACH THE PLAYER? + THE 'OUT ON THE ROAD' LINE, FIXED" — 2026-11-07

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r113 plays deepening, wrote 2->3
at run start with verified read-back ("3"). (Rotation-stuck note: r110
flagged the rotation stuck at 2 across r107–r110 despite verified 2->3
writes; r111/r112 then played landing, so the stuck value's writer is
still unknown — flagged for the main session, not this run's question.
This run re-verifies the rotation reads 3 at closeout.)
Base: master f043aa772 at worktree creation (r109 establishment merged;
ship-loop version bump 82e550626 is an ancestor — local master is current
with origin/master per `git pull`, "Already up to date").
Run id: laneA-20261107T0845Z (scheduled 02:45 CST 2026-11-07).
Policy: competent (r110 driver lineage, VERBATIM except the pre-registered
instrument additions below + the Q2 game fix; CONVO_DAYS [45, 60, 80],
DAYCAP=100, death-aware stop).
Seeds: fresh 95601–95604. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 95600 (outside the main band) x DAYCAP=45 proves the r113
driver before the main run; smoke outputs deleted after the check.

Freshness check for 95601–95604 + smoke 95600 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + ALL dated .md + evidence filenames + seed-context patterns +
forbidden-band lists, not just today's files): COMPLETED before the panel
ran. Word-boundary .md mentions of 95600–95604 across evidence/ + docs/:
0. Filename hits for 9560*: none. Boundary-aware seed-context patterns
(`"seed": 9560x` / `seed=9560x` / `SEEDS=…9560x` / `s9560x` across
evidence/ + scripts/ + docs/): 0 hits. Forbidden-band lists: 9560x
absent from every tendbelow/forbidden list named in dated preregs.
Rejected bands on the way here, all named in dated preregs (a used band
is not fresh even with no corpus behind it in this leg): 95301–95304
(sim-vet2mfg-a, 2026-11-01, corpora in evidence/2026-11-01/perseed-
vet2mfg-a/), 95401–95404 (sim-heraldarr2/heraldkill/heraldsteer arms,
2026-11-01/02, corpora exist), 95504 (in the sim-sumconfirm-a 2026-11-02
scan band 95447–95512; 95501–95503 were judged clean by journey-scale
r104/r105 but were not used there — this run takes the next clean range
instead of splitting a band), 95201–95204 (r110, just used), 96101–96104
(sim-awayration2-b, 2026-11-03, corpora exist). Band 95601–95604 + smoke
95600 verified fresh.

## The questions

### Q1 (PRIMARY) — SCHOLAR-FACING BOND/LINK REQUESTS: POLICY GAP OR GAME GAP?
(r110's named follow-up.)

**Basis.** r110 proved the merged bond system fires NPC→NPC in the wild
(110 `bond_proposed` tele events, 9 person-bond decisions, 6 accepted,
6 initiated bonds at end) — but the scholar-facing half is a dead letter:
9 staged bond proposals to the scholar → 9 expired, 0 decisions; 42
link ideas raised → 41 expired, 1 pending at scatter, 0 accepted; 0 bond
sittings in 20 transcripts. The game side is wired end-to-end (verified
in source this run, not assumed): a staged proposal writes
`v.talkRequests[vid]` with `bondProposal: true` (bond-initiation.js
stageBondProposal), the talk-request opener has priority #1 in
convoOpening (conversation.js:2905), `convoChoices` is wrapped to
PREPEND `bond:accept` / `bond:decline` (and `link:`) choices while a
proposal is pending (bond-initiation.js:789), and `convoTurn` routes
them to `bondTurn` → `acceptBondProposal` / `declineBondProposal`.
The sim side has TWO gaps, found in code this run:
(a) target selection — neither the policy's daily talk
(`pickTalkTargets` in scripts/policies/competent.js, scores by
least-talked-to/trust) nor the driver's convo-day sittings
(`orderSittingCandidates`, by convo count) ever looks at
`state.village.talkRequests`; a request-holder is talked to only by
coincidence, and a request lives 3 days;
(b) choice selection — the driver's `pickChoice` never picks `bond:` /
`link:` ids (they appear in none of ENGAGE / ENGAGE2 / DEFLECT), so
even a sitting opened BY a bond talk request never answers it.
The r110 panel is consistent with both gaps and cannot separate them
from a game-side surfacing failure — that is what this run's
before-panel measures.

**Instrument (driver-only, zero src/js).** The r113 driver adds a daily
`talkReqSnap`: the staged maps read live each day — `v.bondRequests`
(vid → staged day, kind), `v.linkRaises` (vid → staged day, village),
`v.talkRequests` (vid → {day, bondProposal, linkRaise, delivered}) —
plus, joined at analysis time, the bond instrument's `convoEvents`
(every `talkTo`/`endConvo` with day + target) and `bondTeleEvents`
(staged/accepted/refused with initiator/target/kind/day) and the
`acceptBondProposal` / `declineBondProposal` / `acceptLinkRaise` /
`declineLinkRaise` wraps (scholar decisions). Per staged scholar-targeted
request the analyzer reports: staged day, holder, kind, holder talkable
on the staging day (alive, on roster, npcComm != 'none'), whether the
scholar talked to the holder on any day while the request was live (and
which day), whether a `bond:`/`link:` choice was ever OFFERED in a
sitting with the holder (transcript `(offered=...)` scan), what
pickChoice picked instead, and the outcome (decided accept/decline +
day, or expired — last-seen staged day + 3 with no decision).

**Pre-registered verdict (binding, judged on the BEFORE-panel):**
- **REACHED** if ≥1 scholar-targeted bond/link request is DECIDED
  (accepted or declined) across the panel — the mechanism reaches the
  player when the sim talks to the holder; the question becomes rate,
  not reach.
- **POLICY-GAP** if ≥1 staged scholar request expires while its holder
  was talkable on the staging day AND the scholar never talked to the
  holder on any day the request was live. (The game staged the ask;
  the sim never went to answer it.)
- **GAME-GAP** if 0 requests are staged across the panel, OR every
  expired request's holder was untalkable (dead / off-roster /
  npcComm 'none') for the whole live window. (Nothing to answer, or
  nothing answerable.)
- **INTERESTING** if a `bond:`/`link:` choice is offered in a sitting
  and pickChoice takes something else or leaves — the choice-selection
  gap firing live — or if a request is decided by coincidence (a
  REACHED case with a 0-day talk lag the policy did not intend).
A miss is NO-GO, never re-scored. The verdict classes are exclusive
and checked in the order REACHED → POLICY-GAP → GAME-GAP.

**Fix (conditional, driver-only, AFTER the before-panel — only if the
verdict is POLICY-GAP, or REACHED with the choice-selection gap firing
live).** The r113 driver gains request-priority talk, in the same
shape as the driver's existing betrayal alternation:
(1) the daily wrapper answers live bond/link requests FIRST: if a
live request-holder is talkable and the scholar has not yet talked
today, the driver opens a real sitting with the holder before
policy.daily runs (the sitting is played by runConversation, so the
transcript is captured);
(2) `pickChoice` gains `bond:`/`link:` handling at ENGAGE priority
(after betrayal, before generic engage): `bond:accept` /
`bond:decline` and `link:accept` / `link:decline` alternate by
sitting index (accept, decline, accept, … — the betrayal pattern:
the panel measures that BOTH paths work, not a preference);
(3) convo-day sitting order puts live request-holders first.
The AFTER-panel re-runs the SAME seeds 95601–95604 on the SAME game
code (Q2 fix included in both panels, so the comparison is purely
the driver change). **After-panel binding:** ≥1 scholar-targeted
bond/link decision across the after-panel = REACHED (the fix works);
0 = fix failed (name why: requests not staged, holders untalkable,
or the sitting never offered the choice).
If the before-panel verdict is GAME-GAP, no driver fix is built: the
finding is reported with proof and the fix belongs in the game, not
here.

### Q2 — "OUT ON THE ROAD" FIRES IN FACE-TO-FACE SITTINGS (r110 nit #1 — game-code fix)

**Basis.** r110 transcripts prove it twice (Ellis + Jessica, day 80):
an away-flagged villager in a LIVE sitting refuses a dawn-meet commit
with `"Wait — I'm out on the road. I can't ask you to meet me at dawn
when I'm miles away. Find me when I'm back, and we'll set it then."`
— spoken to the scholar sitting across from them. Proven in source
this run: the line fires iff `state.village.away[vid]` is set
(convo-wants.js `convoFavorCommit`, R72 guard, kinds forage_help /
water_haul / stay_close); the sitting proves presence (the
conversation record is active, `convoGet(vid).active`). The `away`
flag means away from HAVEN — an expedition/objective departure, the
villager moving node-by-node on the board (villager-agency.js,
villager-objectives.js) — not absent from the scholar: a real player
can walk up and talk to them. The contradiction is the WORDING, and
(checked this run) the same presence-blindness sits in the second
away check, `convoFavorAction`'s away block (convo-wants.js:1802):
it tells a player IN a sitting that the villager is "miles from
here", and blocks favor actions (food share, wound care) that are
performable face-to-face.

**Fix (src/js, convo-wants.js — pre-registered, exact):**
(a) COMMIT SITE — keep the R72 refusal (the dawn meet still cannot
be promised while out: the keep path needs the partner at Haven at
dawn, and removing the guard reintroduces the R72 rot — promise made
day 10, partner absent at the meet dawn, promise rots, −15 trust).
Reword ONLY the line so it is true face-to-face:
`"Wait — I'm away from Haven, out on the road. I can't promise a dawn
meet while I'm out — find me when I'm back, and we'll set it then."`
Claims checked true: away from Haven (the flag), out on the road
(the away state, whatever its purpose — forage / water /
expedition), cannot promise a dawn meet while out (the keep needs
Haven-at-dawn presence). No claim about present absence remains.
(b) ACTION SITE — `convoFavorAction`'s away block fires ONLY when
the villager is NOT currently in an active conversation with the
scholar (presence read from the conv map, `((state.village||{}).
conv||{})[vid].active`, without creating a record — the function is
documented read-only). In a sitting the away block is skipped and
the adjacency check below governs (the real gate: the player must
actually be next to them). Outside a sitting — the journal path
(journal.js:235) — no active convo exists, so the away block still
fires and the line stays true from the journal's perspective.
The game.js:5870 caller reads only `.unsupported`, which the away
branch does not set: unaffected.

**Proof test (BEFORE the panel):**
scripts/test-journey-deepening-r113-awayline-20261107.js (synthetic
Game scenes, runs the REAL `convoFavorCommit` / `convoFavorAction`):
(1) away villager IN an active conversation, forage_help commit →
ok:false, away:true, line contains "away from Haven" and does NOT
contain "miles away"; (2) away villager NOT in a conversation →
same refusal, same new line (mechanics unchanged outside a sitting);
(3) non-away villager in a conversation → commit proceeds ok:true
(the guard does not over-fire); (4) away villager IN an active
conversation, food_share → the away reason is NOT returned (the
action is not away-blocked); (5) away villager NOT in a conversation,
food_share → the away reason IS returned (journal path unchanged).
All cases pass BEFORE the panel runs. A miss is NO-GO, never
re-scored. Panel check: transcripts adjudicated — the new line fires
in sittings (if any away-commit occurs), never the old "miles away"
line spoken by a villager in a sitting.

## Secondary (carried, r110 verdicts re-judged fresh)

- **SURV-CONTROL-4 (5th control point):** lineage r107 2/4, r108 3/4,
  r109 2/4, r110 2/4 survived on successive bases. This panel is the
  fifth control point on the current base (bond-initiate + drive +
  practice + Q2 fix since r110's base — the Q2 fix is a wording +
  narrow action-gating change; any survival move is reported, not
  attributed to it without a bisect). Verdict rule as r110's: >=2/4
  survive -> funnel unchanged; 0/4 -> base moved (bisect job, no
  claim about which change); 1/4 -> ambiguous. Cause split reported
  exactly as r107–r110 reported it.
- **P-KEEP (revised, minus bare "forgot"):** same rule as r110
  (NAMED >= 1 among revisited-alive -> PRESENT).
- **RE-ASK (4 variants + origin split):** same as r110; orphans split
  origin-outside-panel vs true no-thread.
- **DEBRIEF-CAPTURE:** every village-lost seed attributed (debrief
  lines + loss-trigger flags captured in-run); unattributed ones named
  as a live instrument gap.
- **B-SIT / B-FOLLOW / B-LEAD, FIZZLE-WATCH, S-TRACE:** same scans as
  r110.
- **D-THING (revised per r110 metric review):** "mentioned" now
  requires the thing to be NAMED or RETURNED in dialogue, not just
  the `pocketed` want label persisting.
- **G-STICK (revised per r110 metric review):** top-goal stability
  reported as a DISTRIBUTION across seeds/days, not a stuck-count
  (goals are lasting pursuits by design; the count misleads).
- **RAJ-PHOTO (widened):** same as r110.
- **G-SENSE:** all transcripts read in full; senseless sittings
  counted (expectation from r110: 0) and named, not just counted.

## Carried context (reported, not re-judged)

- r110 nits #2–#6 stay documented, not fixed this run: Christian's
  bond line with no decision (the bondTurn choice now answers it —
  watch whether a Q1 sitting produces it); a Swahili-only speaker
  staging a bond proposal (bond proposals do not gate on shared
  language); Nathan's betrayal-accept fortune-cookie drift; stray
  lines (Denise "It'll pass.", Irving "Could be wrong, though.");
  D-THING's pocketed thing never named (now a revised metric above).
- All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS): the
  village assessment carries a descriptive all-tracks read
  (goal-top distribution per seed, mapped to tracks).
- STANDING CONTEXT (Steve 2026-11-06 11:48 CST): roles differentiate
  by personality; measure by role formation across ALL five tracks,
  not kill counts alone.
- One-brain order (Steve 2026-11-06 17:12 CST): noted as context.
  Bond proposals and link raises are a second decision channel that
  never reaches the one scorer — a later-phase fold-in, per the
  order. This run's Q1 finding (whether the scholar-facing half is
  even answerable) feeds it.
- Gating freeze (2026-10-27 16:53) stands — no threshold, bar,
  price, or gate change in this run. Perception law (2026-10-28)
  stands — all instruments read-only; pickers press offered menu
  items only. DELIVER OVER MEASURE (2026-11-01): a code change lands
  ONLY if a defect is proven in game code with a before/after proof
  test; the Q2 fix is that case (r110 transcripts + code read). The
  Q1 fix, if built, is driver-only (zero src/js).

## What this run does NOT do

- Does not build a new bond system. The system is merged; this run
  measures whether its scholar-facing half is answerable, and fixes
  the SIM's side of the answer if the verdict is POLICY-GAP.
- Does not remove the R72 away guard (see Q2: removing it
  reintroduces the promise-rot trust loss the guard exists to
  prevent). The guard stays; its words become true.
- Does not change succession release, seed priority, or the
  question-first-openings design question (Steve's call).
- Does not re-judge wave 4 (r90), beast-trick teaching (r92),
  standing/scale two-rulers (r93), villager goals, or the
  standing/scale question. Carried as context only.
- Does not touch win prices, deed gates, or any balance number.
- Does not re-score the r110 panel. r110 stands as computed.

## Seeds, pilot, shape

- Panel: fresh seeds 95601–95604, DAYS=100 (DAYCAP), OUTDIR
  deepening-r113 (goal hidden_files evidence/2026-11-07/).
- PILOT FIRST: smoke 95600 x DAYCAP=45 proves the r113 driver +
  Q1 instrument before the main run (seeds run, snapshots present,
  talkReqSnaps present, transcripts written). Then 2-seed pilot
  (95601–95602) before expanding to 4 — the pilot validates the Q1
  instrument on real output (staged requests visible in tele events
  + talkReqSnaps; convoEvents joining) before the panel expands.
- Shape: prereg commit → Q2 fix + proof test (green) → smoke →
  pilot (2 seeds) → before-panel (4 seeds) → Q1 driver fix + proof
  (only if verdict POLICY-GAP or REACHED-with-choice-gap) →
  after-panel (same 4 seeds) → analyzer → run note → merge.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
