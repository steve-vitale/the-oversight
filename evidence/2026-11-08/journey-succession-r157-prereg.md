# Journey succession r157 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r157 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r157 = next Lane B number after r156 endgame
(2026-11-07 18:00 CST) and r155 crisis (2026-11-08 02:53 CST).

## Standing state (why this run replays leg 7)

r155-succession LANDED on master (opener-skip fix + evidence; adopted
by the main session 2026-11-07 ~17:10 CST; gate 284/6 standing).
Since r155, master has taken endgame r156, crisis r155 (recap-prefix
fix in conversation.js — the same file this run touches), the
healerbisect landings, and the sim-winnability rounds. This run
re-verifies the succession leg on current master AND investigates the
one dry class r155 left open as "this run's new finding for the next
succession run": the teach-narration dry.

## The carried blank: teach-narration dry (pinned pre-play, no new play yet)

r155's run note records, from its own committed evidence:
- 33803 d+53 Brian (after-leg): "You show them Black Walnut — ..."
  run-blocked at a teach pick (site convo-dialogue.js:853 via
  conversation.js:6930 in r155 code). The line is one fixed phrasing
  per plant; spoken at d+3 (Owen), d+30 (Jorge), d+45 (Abdul) in the
  window, then blocked at d+53.
- 33912 d+30 Lucas (Mayapple): same class.

Mechanism (pinned from current-master code, read before play):
- Plant-teach is choiceId === 'teach' (conversation.js:6596): the
  lesson lands FIRST — villagerLearnsPlant + taughtByPlayer +
  resolveConsequence trust +2 + socialTick/convoDeepTick all fire
  before done() — and the narration is emitted at 6966 through
  sayLine with `{ fallback, structural, diegeticAct:
  inviteOutcome || lessonOutcome }`.
- `lessonOutcome` (6965) covers ONLY `skill_learn:` /
  `skill_teach:` — the r86 skill-lesson exemption. The plant-teach
  'teach' choice is NOT covered, although the comment at 6944-6963
  explicitly notes "teach / tell-me drops share the ledger but ride
  different handlers and are not touched here".
- sayLine (877-941): without diegeticAct/structural, a composed
  teach narration whose exact string (same plant + same teachreact
  cycle slot — the cycle is per-villager, so two villagers can land
  on the same slot) sits in the 48-entry run ledger is RUN-BLOCKED
  and replaced by the dry line "...Sorry, lost my train of thought."
  while the lesson has already landed. The narration contradicts
  the action: the player showed them, the villager learned, trust
  moved — and the screen says the speaker lost their train of
  thought. A "No silent actions" (CANON.md) violation in the same
  diegetic-act class as the r86 skill-lesson defect (Stella/Bark
  armor, seed 42254 day 80).
- Fix shape if the repro confirms it: extend `lessonOutcome` to
  include `choiceId === 'teach'` — one line, transcript/copy class,
  same exemption the skill lessons already carry. No ledger,
  trust, RNG, gate, deed, wave, or table change. A repeated teach
  of the same plant to the same villager in one sitting cannot
  happen (teachable filters out plants they already know); a
  same-plant teach to another villager reads as the same lesson
  from another person, not a parrot bug — the r86 justification,
  verbatim.

## Question

On current master: (a) do the teach-narration dries reproduce on the
before-leg (repro seeds, no fix)? (b) is the teach dry the
diegetic-act defect pinned above (fix = extend lessonOutcome to
' teach'), with its own proof test — or is it documented for the
owning lane? (c) do the r155 bars still hold (OPENER-DRY CENSUS,
DRY CENSUS, CAP-NC) after the crisis-r155 recap-prefix fix landed
in the same file?

## Instrument (r155 driver/analyzer verbatim + renames only)

- Driver: scripts/journey-succession-r157-20261108.js = r155 driver
  with ONLY r155->r157 renames (filename, transcript/tele filename
  patterns, EVID_DIR evidence/2026-11-08). No logic change. The r155
  after-leg files stay intact under their r155 names.
- Analyzer: scripts/analyze-journey-succession-r157-20261108.js =
  r155 analyzer with ONLY r155->r157 renames (CAP-NC scoring
  unchanged).
- POST_DAYS=70, EARLY_KILL_DAY=40, CONVO_DAYS unchanged. Controls:
  no forced kills.

## Seeds

- Repro (DELIBERATE REUSE for same-seed before/after on current
  master): 33803 + 33806 (r146 panel band) + 33912 (r155 CAP-NC
  panel seed; carries the Mayapple dry). Not a fresh-band claim.
- Smoke: 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r157
  driver first. Deliberate reuse (r151/r155 smoke seed).
- CAP-NC panel (fresh band): 33921–33928, r143 stop rule (run in
  order, stop at 3 eligible or after 33928).
- Order: smoke → repro before-leg → (fix decision) → repro
  after-leg → CAP-NC panel.

## Seed-band freshness (skill: local_seed_band_freshness)

- Band 33921–33928: searched ALL dated preregs
  (evidence/*/sim-*-prereg.md + evidence/*/journey-*-prereg.md,
  grep for 3392[1-8]) — ZERO matches (one false positive: digits
  inside a float in evidence/2026-11-05/journey-deepening-r105-prereg.md).
  Forbidden bands named in Nov preregs (73641–73648, 73671–73678,
  78201–78208, 99351–99358, 99401–99412) and the r112 contaminated
  list (897–906, 1301–1304, 917–926, 1001–1010, 1101–1110,
  1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062) do not intersect.
- Full-evidence grep for each seed 33921–33928 (per-seed file
  counts): COMPLETED 2026-11-08 ~09:35Z. Raw substring counts are
  noise: the matches are pantry-kcal values (e.g. pantryFresh
  33922/33923/33927 in evidence/2026-10-16/crumbdefault-sweep
  census JSONs) and digits inside floats. Seed-VALUE grep
  (`"seed": 3392x` / `seed=` / `SEED=` / range mentions, git grep
  over all of evidence/) — ZERO matches. November preregs: only
  the deepening-r105 float false positive above. Band 33921–33928
  is FRESH. No collision; no fallback needed.
- Repro seeds 33803/33806/33912 + smoke 33998: deliberate reuse
  (above).

## Bars (binding, §14)

- REPRO (binding): on the before-leg (current master, no fix), at
  least one teach-narration dry reproduces on 33803/33912 — a
  "You show them <plant> — ..." narration run/self-blocked at a
  teach pick (SAYTRACE preRun/preSelf on the teach-narration key
  at a teach turn, lesson recorded as landed in the same turn).
  A non-repro drops out of the denominator, recorded, NOT
  re-scored (r147 prereg rule).
- TEACH-DRY CENSUS (binding, new): after the fix, across ALL driven
  transcripts on the after-leg + panel seeds, ZERO dry lines at
  'teach' turns attributable to the teach-narration line
  (SAYTRACE preRun/preSelf on the teach-narration key at a teach
  turn). A dry at a teach turn through any other mechanism is
  reported with its attribution, not counted against this bar —
  but a new teach-narration dry anywhere FAILS it.
- OPENER-DRY CENSUS (binding, carried from r155): ZERO dry lines
  at conversation open (pick null) attributable to the trade-seed
  line or a link-raise opener line.
- DRY CENSUS (binding, carried from r151): ZERO dry lines at
  ask/details turns attributable to a favor whyLine via engageBeat.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3
  eligible seeds AND ≥3 bonded by the deadline AND bonded/eligible
  ≥ 2/3.
- PROOF TESTS (binding for any fix claim): r146 + r147 + r151 +
  r155 proof tests re-run GREEN on the final tip; any new fix
  carries its own proof test, verified RED on unfixed code and
  GREEN after.
- SELF-REQUEST REGRESSION CHECK (reported, not scored):
  selfReqDayEntries == 0 on every seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every
  first handoff with npcCalls; funeral INCALL beat present on every
  leg death. Controls (r151): the three control dries (33803 d+14
  Lorenzo [dlg:subject], 33803 d+4 Paisley [dlg:doubt], 33806 d+8
  Badr knowledge-question) must read identically on the after-leg.
- PEOPLE CHECK (sense, not a count): read the fixed teach
  transcript in full plus one d+14 successor transcript per CAP-NC
  panel seed. Bar: conversations have meaning per the sense-testing
  law; the fix must not introduce filler or a line promising a need
  that isn't there.

## What would count as an interesting finding

- A teach-narration dry NOT reproducing on current master (already
  fixed by a later landing — check git blame before claiming).
- A NEW teach-dry mechanism (a third single-fixed-line teach beat).
- A drift-note dry (the unguarded drift-note sayLine in startConvo,
  r155 known site, no dry reproduced there yet).
- The agency dry recurring (33912 d+14 Dwayne class, r151 Badr
  d49) — different owner (villager-agency.js), reported not fixed.
- A control dry changing (the fix leaking into unrelated paths).
- A CAP-NC regression from a dialogue-only fix.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r151 precedent:
per-seed means, n=9 panel). KNOWN WART (r151): the checker sums
across files while the baseline holds per-seed means — LOUD lines
on deaths.bearer <redacted> census.fallen are the summation artifact unless
per-seed means actually move. Run the check, investigate any LOUD
line, do NOT roll sums into the baseline.

## Fix policy

No new game change is pre-planned. If the before-leg reproduces
the teach-narration dry, the fix is attempted same-run ONLY if
small, safe, and provably a defect in the diegetic-act class
(transcript/copy only: extend the lessonOutcome exemption to the
' teach' choice; no trust/consequence/ledger changes; no RNG change
in the guard path) with its own proof test; otherwise the finding
is documented with evidence for the owning builder lane and the
branch merges only if the binding bars pass. No gate, deed, wave,
nor table change under any reading of a finding (freeze stands).

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty
on a seed with a recorded handoff, bondDaily entries missing
bearerId, newcomer detection never recording _newcomerSeen, or
SAYTRACE recording no fellBack on a seed whose transcript shows a
dry line (fix instrument, re-run that seed once). A CAP-NC miss, a
no-newcomer-arrival seed, a village ending before the deadline, or
a skipped seed never triggers expansion alone — the stop rule
bounds the panel at 8 seeds.

## Metric review (to be filled after the panel)

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
- The Badr d49 / Dwayne d+14 agency dry (villager-agency.js) is
  recorded, NOT this run's question.
- CAP-NC denominator: r155's fresh band yielded only 2 eligible
  seeds (late newcomer arrivals + second handoffs dominate). This
  run keeps the 8-seed stop rule; a decisive CAP-NC verdict may
  need a longer panel — a prereg question for the NEXT run, not a
  re-score here.
