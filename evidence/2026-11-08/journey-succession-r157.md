# Journey succession r157 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r157 (next Lane B number after r156 endgame, r155 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession (fresh branch) ·
**Base:** master 7afad4702 (journey-crisis r155 in base) · **Rotation-b:**
7 at run start, writes 4 (endgame next) at closeout · **Prereg:**
evidence/2026-11-08/journey-succession-r157-prereg.md.

## Standing state

r155-succession LANDED (opener-skip fix + evidence; adopted by the
main session 2026-11-07 ~17:10 CST; gate 284/6 standing). Since r155,
master has taken endgame r156, crisis r155 (recap-prefix fix in
conversation.js — the same file this run touches), the healerbisect
landings, and the sim-winnability rounds. This run re-verifies the
succession leg on current master AND investigates the one dry class
r155 left open as "this run's new finding for the next succession
run": the teach-narration dry.

## The carried blank, pinned (before any r157 play)

From r155's own committed evidence: 33803 d+53 Brian — "You show them
Black Walnut — ..." run-blocked at a teach pick (site
convo-dialogue.js:853 via conversation.js:6930 in r155 code). The line
is one fixed phrasing per plant; spoken at d+3 (Owen), d+30 (Jorge),
d+45 (Abdul) in the window, then blocked at d+53. Also 33912 d+30
Lucas (Mayapple). Mechanism pinned from current-master code, read
before play: the plant-teach 'teach' choice lands its consequences
FIRST (villagerLearnsPlant + taughtByPlayer + trust +2) and emits at
conversation.js:6966 through sayLine with diegeticAct only for
skill_learn:/skill_teach: (the r86 skill-lesson exemption) — the
plant-teach 'teach' choice is NOT covered, although the comment at
6944-6963 explicitly notes "teach / tell-me drops share the ledger
but ride different handlers and are not touched here". When the same
composed teach narration (same plant + same teachreact variant)
sits in the 48-entry run ledger, sayLine substitutes the dry line
while the lesson has already landed — the narration contradicts the
action. Same diegetic-act class as the r86 skill-lesson defect.

## Before-leg (current master, no fix) — REPRO

Repro seeds 33803/33806/33912, POST_DAYS=70, EARLY_KILL_DAY=40.
Smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r157 driver
first (exit 0). Before-leg files preserved in
evidence/2026-11-08/r157-before/ (57 files, md5-verified) BEFORE the
after-leg re-run — the r155 lesson (before-leg transcripts were lost
to overwriting there).

- Teach turns fired PLENTY: 25 "You show them <plant>" narrations
  SPOKE across the 3 repro seeds + smoke (33803 alone: Black Walnut
  at d+3 Owen, d+30 Jorge, d+37 Brian, d+64 Abdul, d+64 Omar).
  **Teach dries: 0.** The r155 dries did NOT recur — the exact turns
  diverged (33803's d+53 is now Jorge/Owen, not Abdul/Brian; 33912's
  d+30 is Rewi/Somchai, and the Mayapple teach there SPOKE with the
  "Their eyes widen" variant).
- Why no collision: the repeats were spaced beyond the 48-entry
  window AND the teachreact variants differed. The ledger key is the
  FULL composed line (convoSplitBeats returns it as one chunk, ≤260
  chars), so the collision needs same plant + same variant inside
  the window — and convoPick's villageLineFresh filter steers the
  second villager to a DIFFERENT variant (the first villager's
  variant is noted village-wide). The collision happens only when
  the village-freshness window slides and both draw the same
  variant — rare, which matches the wild rate (1 dry in 100+
  teach turns across the r151/r155 panels).
- REPRO verdict (letter): the exact r155 turns did NOT recur —
  trajectories diverged from r155 (33803's d+45 checkpoint moved
  to d+46, partners differ after d+37). Per the r147 rule the turns
  drop out of the denominator, recorded, NOT re-scored.
- REPRO verdict (mechanism): PASS — reproduced deterministically
  by the proof test (below): RED on unfixed code, 3 failures, B's
  narration drying while taughtByPlayer[B] records the lesson. The
  fix decision rested on the mechanism (the r155 precedent).
- Before-leg dries (all 6, identical after-leg): 33803 d33 Paisley
  + d44 Lorenzo deflect_q ("Okay." Something shutters...); 33806
  d81/d101 David deflection-pool lines; 33912 d52 Priya
  agency:ask_field ("an old trapline — I'll show you on the map
  sometime. It's real.") + d68 Rewi ask_favor ("No, really — it's
  handled."). The Paisley/Lorenzo + David entries are the r155
  controls, reading identically. The Priya agency dry is the
  carried agency class (r151 Badr d49, r155 Dwayne d+14) — see New
  findings.

## The fix (src/js/conversation.js, +12/-3)

One line + comment, the r86 shape: extend `lessonOutcome` to include
`choiceId === 'teach'` — the plant-teach narration joins the
diegeticAct exemption the skill lessons already carry. Also updates
the stale comment ("teach / tell-me drops ... are not touched here")
to name tell-me only. No ledger, trust, RNG, gate, deed, wave, or
table change. A repeated teach of the same plant to the same
villager in one sitting cannot happen (teachable filters out plants
they already know); a same-plant teach to another villager reads as
the same lesson from another person, not a parrot bug — the r86
justification, verbatim.

## Proof test (scripts/test-journey-succession-r157-teach-dry.js)

3 cases, each in its own process (r155 structure): teach-blocked,
teach-control, teach-window. Staging writes state directly (scholar
knows exactly one plant at L1+, villagers know none of it, trust
50); the teachreact collision is forced by pre-seeding B's cycle
with every variant EXCEPT the one A drew (in the wild the variant
draw is chance, and villageLineFresh normally steers villagers to
different variants — the staging controls which variant B draws,
not the defect under test). Math.random is pinned to 0.1 during
startConvo/convoTurn.
- GREEN on fixed code (ALL GREEN, 3/3 cases, full run).
- RED on unfixed code (verified twice: once before the fix was
  written, once via git stash of the fix — teach-blocked fails 3/3
  defect-sensitive assertions: B's narration dries with "...Sorry,
  lost my train of thought." while taughtByPlayer[B] records the
  lesson; controls pass on both).
- r146 + r147 + r151 + r155 proof tests re-run GREEN on the final
  tip (ALL GREEN each).

## After-leg (fixed code, same seeds) — VERDICTS

- **TEACH-DRY CENSUS: PASS.** 0 teach-narration dries across ALL
  driven transcripts on the after-leg + panel seeds (11 seeds,
  49 fellBacks total, none a teach turn). The proof test is the
  positive evidence (the wild panel never produced the collision
  this run — see REPRO above).
- **OPENER-DRY CENSUS: PASS.** 0 dry lines at conversation open
  attributable to the trade-seed line or a link-raise opener line.
  The 44 pick-null fellBacks on the panel are ALL nonverbal
  foreign-language opens ("They speak. You understand none of
  it.") whose RETURNED text is the gesture fallback ("They spread
  their hands, smiling — the words are missing, but the meaning
  lands anyway.") — the r81 designed fallback, working as
  designed, not a dry line. Zero "lost my train of thought" lines
  in the Chantal/Yuki transcripts. (Classification note: a
  sayTrace fellBack with pick null is not itself a dry line — the
  returned text decides. The r157 analyzer counts fellBacks; the
  census reads transcripts + returned text.)
- **DRY CENSUS (r151): PASS on its letter.** 0 dry lines at
  ask/details turns attributable to a favor whyLine via engageBeat.
  BUT see Metric review: the Manaia d86 details dry is the same
  player-visible shape through the dlg:details path.
- **CAP-NC REGRESSION: INSUFFICIENT-DATA (denominator short, not a
  miss).** Fresh band 33921–33928: 2 eligible (33922 Hind,
  33928 Onni), BOTH bonded-by-deadline (2/2, 0 bonded-misses).
  Non-denominator: 5× second-handoff-before-deadline, 1×
  no-newcomer-arrival. Repro seeds (not the panel): 2/2 eligible
  bonded (33803 Brian, 33806 Petra), 33912 second-handoff. The
  dialogue-only fix cannot move the capacity denominator; leaving
  it unmerged over a denominator shortfall would strand a proven
  fix (the r155 merge call, same shape). Descriptive bondedEver:
  5/7 probe-opened panel seeds.
- **SELF-REQUEST REGRESSION CHECK: holds.** selfReqDayEntries == 0
  on every seed (total 0; r133 purge intact).
- **CARRIED: hold.** Pick-time rank == 1 on every first handoff
  with npcCalls (11/11 seeds); funeral INCALL beat present on
  every leg death (11/11).
- **Controls:** the recurring non-opener dries read identically
  before/after (Paisley d33, Lorenzo d44 deflect_q; David d81/d101).
  The r151 control dries did not recur — dropped per the r147 rule,
  recorded. After-leg JSONs differ from before-leg ONLY in
  sayTrace/poolDraws `sites` line numbers (6966→6975, 8033→8042 —
  the fix's added comment lines); tele JSONs byte-identical;
  transcripts byte-identical. The fix changes zero trajectories on
  these seeds.
- **PEOPLE CHECK (sense):** 8 d+14/d+15 transcripts read in full
  (one per panel seed) + the repro teach transcripts + the
  agency/details dry transcripts. Conversations have meaning: real
  wants (water hauls with live counts, wound care with stakes,
  "I've never really had people"), real grief (Pattern Hunger took
  Yara; the Lottery took the speaker; Siege took Lena), real
  consequences ("Forget I asked. They won't forget. They'll just
  stop asking."), the party naming ("The Company" — Priya's "The
  Second Try" vs the System's "THE PROTAGONISTS"). The teach turns
  all speak. The dead spots are the three agency dries + the one
  details dry, reported below — no new filler, no line promising a
  need that isn't there.

## New findings (reported, not fixed — out of prereg scope)

- **Agency dry, now 3 instances this run (the next succession
  run's question):** 33912 d52 Priya ("an old trapline"), 33925
  d31 Marvin ("a cellar full of jars"), 33927 d52 Marcus ("a
  spring that runs clear") — all agency:ask_field/ask_expedition,
  all the same fixed phrasing per place ("a <place> — I'll show
  you on the map sometime. It's real."), all player-visible in
  full transcripts ("What places have you found out there?" →
  "...Sorry, lost my train of thought."). The villager HAS a place
  to share and the answer dries because the same place-line sat in
  the run window. Same diegetic-act shape as teach (a promise +
  dry narration), different owner (villager-agency.js). Naomi
  d+14 (33921) shows the mechanic working: two DIFFERENT places
  shared in one sitting ("a ridge with a view for miles", "a
  burned farmhouse") both speak. NOT fixed here: out of the prereg
  fix scope (teach exemption only), different owner file.
- **Water whyLine dry via dlg:details (metric-review item):**
  33923 d86 Manaia — "Tell me why you need this." → "...Sorry,
  lost my train of thought." The water-haul whyLine ("Do the math
  with me: 0 liters, 8 people...") is a SINGLE fixed string while
  the crisis persists (convo-wants.js:169 — the r146 variant
  treatment covers other wants, not this one); it spoke at d+45
  and dried at d+64 with the counts unchanged. Delivery path is
  the dialogue details handler (convo-dialogue.js:733), not
  engageBeat — so the DRY CENSUS bar passes on its letter while
  the player sees the r151 defect shape. See Metric review.
- **Nonverbal gesture fallback repeats verbatim:** one fixed line
  ("They spread their hands, smiling...") opens every repeat
  sitting for a foreign villager (Chantal 20×, Yuki 23× on this
  panel). Working as designed (r81), but the identical sentence
  20+ times is the fallback's own repetition, not the villager's.
  Descriptive only.
- **m3 echo:** not re-measured this run (no m3 bar in the prereg);
  the r155 note (echoMentions=1, bar ≥2) stands as descriptive.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The check
LOUD-flagged deaths.bearer <redacted> census.fallen (10 files).
**Diagnosis: summation artifact (known, r151/r155).** Per-seed
means on the 11 leg seeds (smoke 33998 excluded): deaths.bearer
6.27, census.alive 6.18, census.fallen 11.18,
census.integrationStage 3.00, week2.deadBearerMentions 4.45 — all
at or below baseline (7.6 / 3.8 / 14.3 / 3.0 / 4.2; alive is ABOVE
baseline, which is the good direction; mentions +6%, noise). No
real deviation; baseline NOT rolled forward.

## Village assessment (plain words)

The succession leg works on current master: the mantle passes on
all 11 seeds (7 organic first deaths, 4 scripted; chains up to 12
bearer deaths on 33926), newcomers arrive (44 across the panel)
and bond (5/7 probe-opened panel pairs bonded ever; 2/2 eligible
bonded by the deadline), and the village talks like people — the
teach narration that used to go silent after a live lesson now
speaks, and a villager with a place to show you still sometimes
loses the thread (the agency dry, next run's question). 8/11
villages reached the horizon with 7–8 people alive; 3 were lost
(33921 scattered with 4 left, 33924 with 2 left, 33927 died out
with 0 left). The villages run down over the 70-day window, which
is the leg's shape: the bearer <redacted> early by design and the
village runs down. Nothing in this run changes a gate, deed, wave,
or table rule (freeze stands).

## Gate

`node scripts/check.js --quick` in the worktree → **284 passed, 6
failed in 419s** (gate log
evidence/2026-11-08/journey-succession-r157-checkquick.log). The 6
failures are ALL standing, none from this fix: measurement-proof-update
+ measurement-workflow (retained neutrality proof stale — refresh
owed at ship), mobile-combat-cadence (2 standing),
occupation-panels (CLI workflow), phone-frame-proof (retained
receipt stale), establishment-r20 (voices gate). Same 284/6 shape as
r155/r154/r116/feveranat/tendsick. Proof test
scripts/test-journey-succession-r157-teach-dry.js re-run standalone
on the tip: ALL GREEN (exit 0).

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
- The Badr d49 / Dwayne d+14 / Priya d52 / Marvin d31 / Marcus
  d52 agency dry (villager-agency.js) is recorded, NOT this run's
  question; it is the next succession run's question.
- **DRY CENSUS revision proposed for the next run:** the bar's
  "via engageBeat" qualifier misses the same defect delivered
  through the dialogue layer's details handler (Manaia d86: a
  favor whyLine built in convo-wants.js, delivered by
  convo-dialogue.js:733, drying on "Tell me why you need this.").
  Proposed revision: count favor-why answers however delivered
  (engageBeat OR dlg:details), and consider the r146 variant
  treatment for the water-haul whyLine (single fixed string while
  the counts persist). NOT re-scored this run (§14 binding).
- **OPENER-DRY CENSUS classification note for the next run:** a
  sayTrace fellBack with pick null is not itself a dry line — the
  returned text decides (nonverbal gesture fallbacks read as
  fellBack but return gesture narration). The census should read
  returned text, not the fellBack flag alone.
- CAP-NC denominator: the fresh band yielded only 2 eligible seeds
  again (second handoffs dominate: 5/8 panel seeds). If the next
  run wants a decisive CAP-NC verdict, it needs a longer panel or
  a band with earlier arrivals — a prereg question, not a re-score.
