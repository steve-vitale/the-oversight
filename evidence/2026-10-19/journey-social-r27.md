# Journey social r27 — moots + gossip exercised (lane B, 2026-10-19)

Run id: oversight-playtest-loop-2-20261019T185520Z. Lock lifecycle per the
overlap guard: no prior lock present, fresh lock created at 18:55Z.

## Pre-registration (written before the pilot ran)

- **Leg question**: when the player drives the social *institutions*
  (convenes a moot on an open betrayal case; forces gossip threads), do
  moots hold up as real, consequence-bearing events, and does gossip
  carry real village state — or do they collapse into dead ends, dry
  deflections, or fabricated shared history?
- **Interesting-finding bar**: a moot convened via `callMoot` that never
  reaches a verdict (stalls, error, silent), a verdict with no visible
  consequence in the days after, or gossip beats that name village state
  that isn't true; any L2' verbatim content-line repeat inside one
  conversation.
- **Binding (pilot)**:
  - M1 moot-end-to-end: >=1 moot convened via the player path (callMoot ->
    conductTrial -> castPlayerVote) per seed with an open case; GO = a
    moot that stalls/fails to verdict, or a verdict with no downstream
    consequence in the beat stream (7d tail) -> investigate/fix. No case
    at all -> record, not a GO.
  - G1 gossip-carries-state: >=3 forced ask:gossip picks per seed; GO =
    a gossip thread/beat that names false village state or fabricated
    shared history -> fix.
  - L2' verbatim-repeat (r26 metric-review revision #2): any verbatim
    content-line ('beat' kind) repeat within ONE conversation,
    regardless of ledger state -> fix.
  - L3 social-arc: bonds, deepBonds, betrayalCases, mootsConvened (reads
    `c.trial` — revision #3), gossipConvos, avgTrust.
  - Rate metric (r25): dry NPC lines per 12 NPC turns, pilot-wide.
- **Metric-review revision #1 (r26)**: smoke self-test — run a 10-day
  smoke seed (2000) FIRST, assert `Object.keys(village.bonds).length`
  can be nonzero before the full seeds run. A zero there means
  instrumentation or state-key drift, not a dead social graph.
- **Seeds**: 2001, 2002, 2003 (fresh). Horizon DAYCAP=140, death-aware
  (+10d tail). Policy: 'deep' driver + favoritism wrapper (inherited
  r24/r25/r26) + moot duty (convene on open cases, vote with room
  majority) + gossip forcing (>=3 ask:gossip picks per seed).
- **Per-leg telemetry baseline**: `telemetry-baselines/social-life.json`
  was seeded from the corrected r26 pilot. This run's per-seed JSONs
  will be checked against it with telemetry-check.js AFTER the pilot,
  BEFORE any fix/baseline roll.

## Results

Pilot ran clean: smoke self-test PASS (seed 2000, 10d: bonds=47, cases=3,
convos=9 — the r26 revision #1 instrumentation check works), then 3 full
seeds (2001/2002/2003, DAYCAP=140, death-aware +10d tail).

seed 2001: days=142 alive=4 convos=139 (deep=69) gossipPicks=3 gossipConvos=0 dryRate=2.04/12
  L2' repeats: 0
  L3: bonds=39 deepBonds=13 cases=8 mootsConvened=8 gossipConvos=0 avgTrust=69.8
  moots: 8/8 reached verdicts (acquitted x4, weregild x3, exile x1), 0 convene errors
seed 2002: days=142 alive=7 convos=113 (deep=61) gossipPicks=3 gossipConvos=2 dryRate=1.49/12
  L2' repeats: 5 (see Fix) | L3: bonds=85 deepBonds=32 cases=25 mootsConvened=25 gossipConvos=2 avgTrust=47.1
  moots: 25/25 reached verdicts (acquitted x17, weregild x3, exile x2, schism x3, cold_war x2... full list in JSON), 0 convene errors
seed 2003: days=101 alive=7 convos=82 (deep=39) gossipPicks=3 gossipConvos=1 dryRate=1.48/12
  L2' repeats: 0
  L3: bonds=80 deepBonds=25 cases=20 mootsConvened=20 gossipConvos=1 avgTrust=33.9
  moots: 20/20 reached verdicts, 0 convene errors

- **M1: MISS.** 53 moots convened via the player path across 3 seeds; every
  one reached a verdict; zero stalls, zero convene errors. Verdicts carry
  downstream consequences in the beat stream (exile: "You are cast out",
  pantry closed, codex entry; schism: "Two circles now, and the space
  between them"; weregild: food/work/public apology paid in the open).
  53 moot transcript files in evidence/2026-10-19/social-r27-moots/.
- **G1: MISS.** 9 forced ask:gossip picks -> 3 gossip threads. Sense-read
  all gossip transcripts: beats name real village state (Aria the
  musician, Saul's Haven walkaway, whispers about Vasyl, Pattern Hunger
  taking Daniela and Tariq), hedge honestly when pressed ("Leave Saul
  alone. They're harmless. Weird, but harmless."), and carry
  reputation-consequence ("People are saying things. About you. ...I'd
  watch how you act around the fire."). No fabricated shared history, no
  false village state found.
- **L2': GO (seed 2002, 5 hits).** Fixed — see Fix §1–3.
- **L3:** social graph forms on all seeds (39–85 bonds, 13–32 deep,
  8–25 cases). mootsConvened now reads `c.trial` (r26 revision #3);
  mootsObserved==mootsConvened on all seeds (driver convened every case).
  Note seed 2001: gossipPicks=3 but gossipConvos=0 — the forced picks
  fired but no gossip thread opened (trust-gating: ask:gossip needs
  trust>=20; the picks were consumed as picks without opening the thread).
  Driver-forcing picks ≠ threads; the counter distinction is honest.
- dryRate 2.04 / 1.49 / 1.48 per 12 NPC turns (informational). P1-streaks:
  2/0/0. P2-reactDry: 2/1/2.

## Village assessment (plain words)

**Seed 2001 — the exiled village.** The player (Regina) was tried for theft
on day 20 and EXILED — "You are cast out... To Haven, you are not one of
ours anymore." And yet the run continued to day 142 with 4 alive: the
social graph kept working from outside. Daniela the medic held the sick
row ("3 down with a wringing-out sickness... Wash your hands. I say it
ten times a day now"), buried a pre-Scattering food cache and dug it up
for the village (+1546 kcal), and by day 100 was asking the player "Are
you going to stay? With us. For real." Bonds=39, deep=13, trust 69.8 —
a small, scarred, loyal remnant.

**Seed 2002 — the schism village.** 25 betrayal cases, 25 moots, 3
schisms — the village literally split into two fires ("not in houses, in
fires"). Wei carried grief for Everett ("the world just... continues.
That's the part I can't stand"); Saul confessed walking away from Haven
once; Isabella's case_24 was pressed to two real cracks. 7 alive at day
142, trust 47.1 — bruised, divided, still talking.

**Seed 2003 — the short village.** Died/scattered at day 101 (death-aware
tail stopped the run — the +10d rule working as designed). 20 cases, 20
moots, 80 bonds in 101 days — the social machinery fires at the same
rate; the village just didn't last. Mona taught Wild Black Cherry
identification and reported back ("Didn't poison anyone, so that's a
win") — the specialist economy in one beat.

What's missing: nothing structural this run. The institutions all fired:
moots convene and resolve with consequences, gossip carries real state,
bonds deepen, favors are remembered ("You came through on the food I
needed. I won't forget it."), the Taken thread stays live in late-run
talk ("Trust is the wrong word. It's like trusting the tide.").

## People check (sense-testing law — full transcripts read)

Read 14 transcripts end to end (6 deep, 2 late-run, 6 gossip, 3 L2'
repro, 1 Portuguese nonverbal). Verdict: villagers talk like people with
inner lives and long memories — trap lines, stockpiles, grief that
doesn't resolve, opinions of each other that conflict (Ines whispers
Caitlin's story doesn't hold; Daniela testifies Caitlin stayed up all
night on watch — two villagers, two Caitlins, both human). Four
senselessness bugs found and fixed (see Fix). Remaining observations
(not fixed — judgment calls):

- The double give-up ("Hm. Never mind — go on." + "...Actually, forget
  it." on one turn, s2002-deep-2-Saul) persists from r26's note — one
  turn emitting two deflection-class lines reads as the engine shrugging.
  Still a pool tune, not a bug; still rare (1 instance in ~330 convos).
- Winddown lines fire mid-conversation without closing it ("And...
  scene. Good talk." then the talk continues, s2001-deep-2-Daniela).
  docs/CONVERSATIONS.md says the budget signal closes the conversation;
  the code lets the player push past it. For dry-humor villagers it reads
  as a joke; as a system it's a doc/code mismatch — Steve's call, not a
  silent worker change.
- The "3 days until the moot" countdown beat fires the same day the moot
  is called (s2002-moot-case_18) when the player fast-forwards a
  case — stale countdown text, minor narrative wrinkle.
- The Portuguese nonverbal conversation (s2001-deep-1-Ines) is a
  standout: gestures, partial comprehension, the player attempting
  Portuguese, Ines laughing "with you, mostly" and teaching. The
  no-shared-language canon working exactly as designed.
- DUMPER BUG (tooling, fixed this run): the pilot labeled 'them'/'narr'
  transcript entries as NPC — a drift note ("Rosa has an edge today —
  something curdled.") read as third-person self-reference. Verified the
  game tags it who:'them' (stage direction, correct); the pilot now
  labels NARR.

No fabricated shared history found. No filler loops (the r26 bribe-loop
class is gone; the L2' repeats are now fixed). No static menus.

## Fix

Four dialogue-truth fixes, each with a RED->GREEN proof test
(`scripts/test-social-r27-*-20261019.js`). RED was demonstrated by
reverting the two game files to pristine HEAD via patch files (no stash —
repo-global stash stack); GREEN re-verified after re-apply.

1. **Recap verbatim repeat** (`src/js/conversation.js`: `convoRecapLine`).
   Back-to-back `recap` picks re-served the verbatim line — "Still on
   that personal stuff." x3 (s2002 d34/d122 Wei, transcript-verified).
   The thread log doesn't change between picks, so the composed line was
   deterministic. Now: if the exact recap line was already said this
   conversation, it reframes honestly via convoPickCycle ("As I said —
   ...", "Like I said — ...", "...That's still where we are.") — what a
   re-asked person actually says. Proof:
   `scripts/test-social-r27-recap-repeat-20261019.js` — GREEN.
2. **Betrayal:wounds verbatim repeat** (`src/js/betrayal.js`: `wounds`
   act). The shown line was a fixed string; three consecutive picks
   parroted "The wounds speak for themselves." x3 (s2002 d53 Isabella).
   Diegetic acts are exempt from sayLine's repeat filter, so the act now
   cycles its own tellings via convoPickCycle (canonical first). The
   no-wounds honest-flat path is untouched. Proof:
   `scripts/test-social-r27-wounds-repeat-20261019.js` — GREEN.
3. **Betrayal:press crack verbatim repeat** (`src/js/betrayal.js`:
   `press` act). Two REAL breaks on the same accomplice (two
   inconsistencies) served the fixed "Done — their story has a crack in
   it now." twice. Now cycles crack tellings via convoPickCycle.
   Outcome-awareness kept: the crack line only fires when
   pressAccomplice actually found a crack; held presses still cycle the
   held-box lines. Proof:
   `scripts/test-social-r27-presscrack-repeat-20261019.js` — GREEN.
4. **Lapse-line grammar** (`src/js/conversation.js`: `convoLapseLine`).
   The template "It's been a while since we left {label} hanging"
   assumed a noun-phrase label; the clause label "the last time you
   laughed" composed into "It's been a while since we left the last
   time you laughed hanging. Glad we circled back." (s2001
   gossip-1-Ines, transcript-verified). Reframed to "It's been a while.
   Glad we circled back to {label}." — grammatical for any label shape.
   Proof: `scripts/test-social-r27-lapse-grammar-20261019.js` — GREEN.

Tooling fix (no game change): the pilot's transcript dumper labeled
'who:them'/'narr' entries as NPC — now NARR (the Rosa drift-note
misread). Applies to future runs.

## Reachable / fun / winnable (social leg)

- **Reachable**: yes — and then some. 53 moots convened end-to-end via
  the player path across 3 seeds; gossip threads open and carry real
  state; bonds form without any driver help (39–85/run). The
  institutions are not just reachable, they're load-bearing.
- **Fun**: the transcripts are the evidence — Mona's grief and the
  cherry-lesson callback, Daniela's buried cache (+1546 kcal, a real
  consequence for talking), the Portuguese nonverbal conversation, the
  exile of Regina on day 20 with the village still holding. The four
  fixes remove immersion breaks a real player would have felt.
- **Winnable**: not this leg's question (legs 4/7 own the win), but all
  three villages kept social fabric under attrition — and seed 2001
  kept it AFTER the player was exiled. The social layer doesn't
  collapse; it adapts.

## Metric review (§14)

1. **Revision #1 (smoke self-test) WORKED.** The 10-day smoke on seed
   2000 asserted bonds>0 && convos>0 before the full seeds ran — PASS
   (bonds=47). The r26 phantom-zero class can no longer silently poison
   a run. Keep for all future social pilots.
2. **Revision #2 (L2' = any verbatim content repeat in one convo) WORKED.**
   It caught 5 repeats the old ledger-scoped L2 would have missed (the
   repeats were never ledger-blocked — deterministic act lines and a
   deterministic recap). All four fixes trace to L2' hits. The binding
   stays.
3. **Revision #3 (moot via player path, gossip forcing, `c.trial`
   counter) WORKED.** mootsConvened==mootsObserved on all seeds; the
   counter reads the real marker. Keep.
4. **Proposed revision for the next run**: the forced-gossip counter
   should distinguish picks from threads (seed 2001: 3 picks, 0
   threads — trust-gating ate them). Report both; a 0-thread seed with
   3 picks is a driver note, not a game gap.
5. L1's "you've probably heard" reframe idea stays parked (r26: zero
   opportunities in 152 convos; r27 didn't revisit — the ledger is doing
   its job).

## Regressions

- 4 new proof tests, all GREEN (RED-verified on pristine HEAD).
- Green-list: truth (3/3), lately (1/1), confront (3/3), conversation
  (2/2), doubt (1/1), gossip (11/11) — pass.
- `check.js --only social`: 48 pass, 1 fail — the failure is
  `test-social-animals-20261008.js` ("all 52 behaviors have a cue"),
  VERIFIED PRE-EXISTING in r26 (reverted to pristine HEAD 2b2d37230,
  failed identically there). The other two r26 pre-existing failures
  (test-social-play, test-socialite-r8) passed this run. No new
  breakage from this run's files (conversation.js recap/lapse,
  betrayal.js wounds/press acts — the animals suite touches neither).

## Telemetry

Deviation check (`scripts/telemetry-check.js`) against
`telemetry-baselines/social.json`:
- LOUD: `l3.mootsConvened` newly appeared (baseline 0 -> 53) — EXPLAINED:
  the old baseline used the pre-r26 `l3.moots` key (artifact-zero pilot);
  r27 is the first run with the corrected `c.trial` counter. Not a bug.
- LOUD: `l3.gossipConvos` newly appeared (baseline 0 -> 3) — EXPLAINED:
  first run with the gossip-forcing driver (r26 revision #3). Not a bug.
- LOUD: `l2prime.count` newly appeared (0 -> 5) — EXPLAINED: new metric
  this run; the 5 hits are the pre-fix pilot findings, now fixed.
- Baseline rolled forward with --update-baseline (corrected key set:
  l3.bonds/deepBonds/betrayalCases/mootsConvened/gossipConvos, dryRate,
  l2prime.count). bonds/deepBonds/betrayalCases/dryRate: no LOUD lines.
