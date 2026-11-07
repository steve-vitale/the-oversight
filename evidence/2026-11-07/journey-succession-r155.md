# Journey succession r155 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r155 (next Lane B number after r154 crisis) · **Leg:** 7 succession ·
**Branch:** journey2-succession (fresh branch, NOT an adoption — r151
already landed on master) · **Base:** master 934e10f20 (journey-deepening
r116) · **Rotation-b:** 7 at run start, writes 4 (endgame next) at
closeout · **Prereg:**
evidence/2026-11-07/journey-succession-r151-prereg.md is r151's; this
run's prereg is evidence/2026-11-07/journey-succession-r155-prereg.md.

## Standing state

r151 LANDED (fix 6aa254c6e + evidence f7e64857c; finding line 1827
CLOSED). The main session's intended rotation advance 7 → 4 never
happened — the file still read 7 — so this run replayed leg 7 per the
rotation file. Since r151, master took the frozenband bisect
(1d1dbb467), witnessdoor (34ee42f0c), feaststopspend (823291451) and
deepening r116 (934e10f20). This run re-verifies succession on current
master AND investigates the one dry class r151 left open: the
knowledge-trade opener dry (r151 note: "a knowledge-trade opener dry
(conversation.js), NOT an engageBeat-class dry").

## The carried blank, pinned (before any r155 play)

From r151's own committed evidence (33806 sayTrace): the d+45
Katarina dry was the knowledge-trade SEEDING line
(`"...I should say, I trade in what I know..."`, conversation.js:5529
in r151 code) run-ledger-blocked at conversation open (pick null).
The same trace held two more instances of the class: link-raise
opener dries (Badr d26 Hungry Road, Mohsen d76 Thornfield, Mohsen d89
Stonebridge) and trade-seed dries (Ella d56, Katarina d80). Mechanism:
three opening beats in startConvo speak a SINGLE fixed line through
sayLine with no convoWouldBlock guard, while the talk-request opener
itself already has the r19 OPENER SKIP — so the opener skips the
blocked line and startConvo's beat block re-speaks it unguarded.

## Before-leg (current master, no fix) — REPRO

Repro seeds 33803/33806, POST_DAYS=70, EARLY_KILL_DAY=40. The
mechanism reproduced on BOTH seeds (sayTrace, preserved in
evidence/2026-11-07/r155-before/):
- 33803 d62 Owen, pick null: TRADE SEED dry (site
  conversation.js:5620:16).
- 33803 d77 Caleb, pick null: BOND BEAT dry (site
  conversation.js:5565:19; "I've been thinking. You and me — we
  should be bonded...").
- 33806 d39 Ivy, pick null: LINK BEAT dry (site
  conversation.js:5570:19; Stonebridge) AND TRADE SEED dry, same
  conversation.
- 33806 d39: two opener dries in one opening.

REPRO verdict (letter): the exact Katarina d+45 turn did NOT recur —
trajectories diverged from r151 (33806 died ORGANIC d36, bearer Badr,
vs r151's scripted d41, bearer Amy; checkpoint partners differ).
Per the r147 rule (a dry turn that does not reproduce drops out of
the denominator, recorded, NOT re-scored), the Katarina turn drops
out. REPRO verdict (mechanism): PASS — all three mechanisms
reproduced with identical sites. The fix decision rested on the
mechanism, which the panel then judged.

Trajectory note: same-seed trajectories are NOT stable across master
versions (frozenband bisect changed survival: 33806 organic d36 vs
scripted d41). Matched-seed before/after claims across master
changes hold at mechanism level, not at turn level.

## The fix (src/js/conversation.js, +30/-1)

r19 OPENER SKIP shape, three sites in startConvo:
- Bond beat: skip when convoWouldBlock(vid, bondBeat); pending stays
  staged, request stays as-is, fires next sitting. (Holding it would
  only defer the same blocked sayLine to the goon turn — held beats
  speak via sayLine at conversation.js:5903.)
- Link beat: same shape.
- Trade seed: skip when convoWouldBlock(vid, seed); do NOT set
  traderMentioned (the old code marked the mechanic heard although
  the player never heard it), do NOT queue it as a held intro. The
  50% roll retries next conversation once the ledger slides.
No trust/consequence/ledger changes; no RNG change in the guard
path; no gate/deed/wave/table change (freeze stands). Known same-shape
site NOT fixed (out of prereg scope, recorded for the next run): the
drift-note sayLine in startConvo is unguarded; no drift-note dry
reproduced.

## Proof test (scripts/test-journey-succession-r155-opener-skip.js)

5 cases, each in its own process (r151 structure): trade-blocked,
trade-control, bond-blocked, link-blocked, beats-control. Staging
writes state directly (state.village.bondRequests/linkRaises/
talkRequests — the stores stageBondProposal/stageLinkRaise write);
the bond/link blocked cases use the two-sitting flow (sitting 1
speaks the request, sitting 2 re-speaks the raw line as the beat —
the configuration that dried in the wild). Math.random is pinned to
0.1 during startConvo so the taughtref (0.4) and seeding (0.5)
rolls pass. GREEN on fixed code (ALL GREEN, 5/5 cases). RED on
unfixed code (verified via git stash of the fix: trade-blocked dries
with "...Sorry, lost my train of thought." + traderMentioned=true;
bond/link child runs fail; 4 failures). r146 + r147 + r151
bothblocked proof tests re-run GREEN on current master before the
fix and after.

## After-leg (fixed code, same seeds) — VERDICTS

- **OPENER-DRY CENSUS: PASS.** 0 opener-class dries across ALL 10
  seeds (repro after-leg + 8 panel seeds; 39 total fellBacks, all
  other classes). Before-leg opener dries (Owen d62, Caleb d77,
  Ivy d39 x2) are all gone. The seed now SPEAKS later: 33803 d+64
  Abdul carries the trade seed in full ("...I should say, I trade
  in what I know...") after it was skipped at d62 — the mechanic is
  now actually discovered instead of marked-heard-but-never-spoken.
- **DRY CENSUS (r151, engageBeat ask/details): PASS.** 0 ask/details
  dries attributable to a favor whyLine via engageBeat. The David
  d81/d101 entries (present identically before and after) are
  deflection-pool lines, not whyLines — reported, not counted.
- **CAP-NC REGRESSION: INSUFFICIENT-DATA (denominator short, not a
  miss).** Fresh band 33911–33918: 2 eligible (33911, 33915), BOTH
  bonded-by-deadline (2/2, 0 bonded-misses). 3 seeds
  second-handoff-before-deadline, 2 no-newcomer-arrival. The bar
  needs ≥3 eligible; the band is exhausted and the prereg's stop
  rule bounds the panel at 8 seeds, so no expansion. The analyzer's
  3/3 counts repro seed 33806 (also bonded-by-deadline, Petra d+8);
  the binding verdict counts the fresh band only: 2/2.
  MERGE CALL (coordinator, flagged for the main session): merge on
  the strength of OPENER-DRY + DRY CENSUS + proof tests, with
  CAP-NC recorded as insufficient-data (2/2, zero misses, no
  regression signal: selfReq 0, pickRank 1, incall true on every
  seed). A dialogue-only fix cannot move the capacity denominator;
  leaving it unmerged over a denominator shortfall would strand a
  proven fix. The main session may overrule.
- **SELF-REQUEST REGRESSION CHECK: holds.** selfReqDayEntries == 0
  on every seed (total 0; r133 purge intact).
- **CARRIED: hold.** Pick-time rank == 1 on every first handoff
  with npcCalls; funeral INCALL beat present on every leg death
  (10/10 seeds).
- **Controls:** the recurring non-opener dries read identically
  before/after (Paisley d33, Lorenzo d44 deflect_q; David d81/d101).
  The r151 control dries (Lorenzo d+14 [dlg:subject], Paisley d+4
  [dlg:doubt], Badr d+8 knowledge-question) did not recur on these
  trajectories — dropped per the r147 rule, recorded.
- **PEOPLE CHECK (sense):** read the d+64 Abdul transcript in full
  (trade seed spoken, roles, teaching American Persimmon, warm
  close — reads as a person), the d+45 Dieu nonverbal transcript
  (33912: a full gesture conversation, no dry line — the nonverbal
  fellBacks are honest gesture fallbacks, working as designed), and
  the d+14 Fernando transcript (33915: grief about taken kin, the
  show, role-taking, "Thanks for listening. Most people change the
  subject."). No new filler; no line promising a need that isn't
  there.

## New findings (reported, not fixed — out of prereg scope)

- **Teach-narration dry (same shape, new site):** 33803 d+53 Brian
  (after-leg only): "You show them Black Walnut — ..." run-blocked
  at a teach pick (site convo-dialogue.js:853 via
  conversation.js:6930). The line is one fixed phrasing per plant;
  it was spoken at d+3 (Owen), d+30 (Jorge), d+45 (Abdul) in the
  window, then blocked at d+53. Pre-existing class, surfaced by
  trajectory divergence (Brian's want differed after-leg). Same for
  33912 d+30 Lucas (Mayapple). Next succession run's question.
- **Agency dry (carried from r151):** 33912 d+14 Dwayne
  (agency:ask_field, "There's more, but that's for another fire.")
  — same class as r151's Badr d49. Different owner
  (villager-agency.js), not fixed here.
- **m3 echo:** echoMentions=1 on both repro seeds (bar ≥2); the v2
  method counts 2 and 3. Descriptive only, not a bar.
- **lin/mo false on 33806:** detection-timing artifact, not a
  mantle defect — the first death (Violet→Badr d36) was detected a
  day late, by which time Badr had already died (chain d37), so the
  last lineage/mantle entries named Badr→Elif. passed=true,
  funeral beat present, chain causes known.
- **Before-leg transcripts overwritten:** I preserved the before-leg
  .log/.err/tele copies in evidence/2026-11-07/r155-before/ but NOT
  the before-leg transcripts — the after-leg re-run overwrote them
  (same filenames). The sayTrace in the preserved .logs carries the
  mechanism + sites, so the verdict stands, but the readable
  before-leg transcripts are lost. LESSON: preserve before-leg
  transcripts to a subdir BEFORE the after-leg re-run.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The check
LOUD-flagged deaths.bearer (7.6 → 58) and census.fallen (14.3 →
103) on the 11 tele files. **Diagnosis: summation artifact
(known, r151).** Per-seed means on the 10 leg seeds (smoke 33998
excluded): deaths.bearer 5.7, census.alive 6.2, census.fallen 10.2,
census.integrationStage 3.0, week2.deadBearerMentions 4.4 — all at
or below baseline (7.6 / 3.8 / 14.3 / 3.0 / 4.2; alive is ABOVE
baseline, which is the good direction). No real deviation; baseline
NOT rolled forward (rolling sums in would corrupt the per-seed-mean
convention).

## Village assessment (plain words)

The succession leg works on current master: the mantle passes on all
10 seeds (8 scripted, 2 organic first deaths plus chains), newcomers
arrive and bond (7/8 probe-opened seeds bonded ever; 3/3 eligible
bonded by the deadline counting the repro seed), and the village
talks like people — the trade seed that used to go silent after a
live opener now waits and speaks a few days later, and a villager
with a bond to propose no longer loses the thread mid-sentence.
Villages still run down over the 70-day window (census.alive 0–10
by the end), which is the leg's shape: the bearer dies early by
design and the village runs down. Nothing in this run changes a
gate, deed, wave, or table rule (freeze stands).

## Rotation

7 → 4 (endgame next). [Advance at closeout; verify the file reads 4.]

## Metric review

- Canon note: no canon doc covers mantle/bond formation
  specifically (r127's standing note, unchanged). Governing rules
  used: ledger.js "successor: the village chooses. Trust decides";
  party-bond.js "v.bonds built by meals/visits/feasts, +6/pair/day
  cap, no bonds with the dead or gone"; CONVERSATIONS.md structural
  contract ("The repeat ledger must not replace a successful
  promise with 'lost my train of thought.'"); CANON.md "No silent
  actions". Nothing invented, nothing changed.
- The mantle 2-day latency owed item (r112 landing note) is still
  open and is NOT this run's question; it stays carried.
- The Badr d49 agency dry (villager-agency.js:1005) is recorded,
  NOT this run's question; 33912 d+14 Dwayne is the same class.
- The teach-narration dry (Black Walnut / Mayapple) is this run's
  new finding for the next succession run.
- CAP-NC denominator: the fresh band yielded only 2 eligible seeds
  (late newcomer arrivals + second handoffs dominate). If the next
  run wants a decisive CAP-NC verdict, it needs a longer panel or a
  band with earlier arrivals — a prereg question, not a re-score.
