# Journey succession r161 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r161 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r161 = next Lane B number after r160 crisis
(adopted as r156, 2026-11-08 ~23:57 CST) and r159 social. Base: master
ba21ca026 (journey-landing r120 in base).

## Standing state (why this run replays leg 7)

r157-succession LANDED on master (teach-narration dry fix in
conversation.js + evidence; adopted by the main session 2026-11-08
~06:57 CST; gate 284/6 standing). r160's Phase B (leg 7 succession)
never started; the agency dry fix and its instruments remain pending
for a future Lane B run — this run is that run. Since r157, master has
taken landing r120 and the sim-winnability rounds. This run re-verifies
the succession leg on current master AND fixes the one dry class r157
left open as "the next succession run's question": the agency dry.

## The carried blank: agency dry (pinned pre-play, no new play yet)

r157's run note records, from its own committed evidence, three
instances — all agency:ask_field/ask_expedition, all the same fixed
phrasing per place, all player-visible in full transcripts:

- 33912 d52 Priya ("an old trapline"): ask_expedition spoke a plant
  lesson (Wild Garlic); ask_field ("What places have you found out
  there?") → "...Sorry, lost my train of thought."
- 33925 d31 Marvin ("a cellar full of jars"): ask_expedition ("What
  did you see out there?") → dry.
- 33927 d52 Marcus ("a spring that runs clear"): ask_expedition spoke
  a plant lesson (Banyan Fig); ask_field → dry.

Mechanism (pinned from current-master code, read before play, plus
r157's committed SAYTRACE):
- Agency place-sharing is villager-agency.js agencyTurn (~942-1010):
  the place is SPENT FIRST — `taughtPlace = k.places.pop()` — and the
  line is one fixed phrasing per place:
  `"${taughtPlace} — I'll show you on the map sometime. It's real."`
  The place pool is five shared strings (villager-agency.js:613:
  'a burned farmhouse', 'an old trapline', 'a spring that runs
  clear', 'a ridge with a view for miles', 'a cellar full of jars')
  — every villager draws from the same five, so two villagers who
  both learned places collide on the identical composed line.
- The line is emitted through sayLine with NO options
  (villager-agency.js: ~1015: `this.sayLine(vid, lineText)`). sayLine
  (conversation.js:877+) run-blocks an identical line spoken by
  another villager inside the 48-entry window and substitutes the dry
  line — and RETURNS the dry text (truthy; sayLine returns `first`,
  the first spoken chunk). agencyTurn therefore sets
  `spokenText = lineText` (the place line, not what was spoken) and
  never tries the closers. The transcript holds the dry line; the
  returned turn claims the place line spoke.
- The place is already popped — LOST, never re-offerable — and the
  'taught' deed + trust +2 fire anyway (`actuallyTaught` is computed
  BEFORE speaking). The village's book records a lesson the player
  never heard. Same diegetic-act class as the r86 skill-lesson and
  r157 teach defects: a promise/consequence landed, narration
  contradicts it. CONVERSATIONS.md structural contract ("The repeat
  ledger must not replace a successful promise with 'lost my train of
  thought.'") and CANON.md "No silent actions" govern.
- SAYTRACE confirmation (r157 committed evidence, not just code):
  33912 stdout JSON carries the trapline place-line entry with
  `"preRun": true, "diegeticAct": false`.
- The Naomi d+14 control (33921) shows the mechanic working: two
  DIFFERENT places shared in one sitting both speak — the collision
  needs the SAME place string.
- Fix shape if the repro confirms it: pass `{ diegeticAct: true }`
  when speaking the agency PLACE line — the r86/r157 exemption, in
  the owner file (villager-agency.js). Two villagers telling you
  about the same real trapline is the same lesson from another
  person, not a parrot bug (the r86 justification, verbatim). The
  monster and plant lines cannot collide (codex-deduped: taught
  monsters become 'observed', taught plants reach level 1, so the
  same line can never be composed twice), so the exemption applies
  to the place branch only. No ledger, trust, RNG, gate, deed, wave,
  or table change. The generic fallback line ("Saw things with too
  many joints...") is NOT exempted: no consequence rides on it, so
  a dry there falls honestly to the closers.

## Question

On current master: (a) do the agency-narration dries reproduce on the
before-leg (repro seeds, no fix)? (b) is the agency dry the
diegetic-act defect pinned above (fix = diegeticAct on the agency
place line), with its own proof test — or is it documented for the
owning lane? (c) do the r157 bars still hold (OPENER-DRY CENSUS, DRY
CENSUS under its revised reading, CAP-NC, TEACH-DRY CENSUS) after the
landing-r120 changes?

## Instrument (r157 driver/analyzer verbatim + renames only)

- Driver: scripts/journey-succession-r161-20261109.js = r157 driver
  with ONLY r157->r161 renames (filename, transcript/tele filename
  patterns, EVID_DIR evidence/2026-11-09) + header title. No logic
  change. The r157 after-leg files stay intact under their r157 names.
- Analyzer: scripts/analyze-journey-succession-r161-20261109.js =
  r157 analyzer with ONLY r157->r161 renames (CAP-NC scoring
  unchanged).
- POST_DAYS=70, EARLY_KILL_DAY=40, CONVO_DAYS unchanged. Controls:
  no forced kills.

## Seeds

- Repro (DELIBERATE REUSE for same-seed before/after on current
  master): 33803 + 33806 (r146 panel band) + 33912 (r155 CAP-NC
  panel seed; carries the Priya agency dry). Not a fresh-band claim.
- Smoke: 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r161
  driver first. Deliberate reuse (r151/r155/r157 smoke seed).
- CAP-NC panel (fresh band): 33931–33938, r143 stop rule (run in
  order, stop at 3 eligible or after 33938).
- Order: smoke → repro before-leg → (fix decision) → repro
  after-leg → CAP-NC panel.

## Seed-band freshness (skill: local_seed_band_freshness)

- Band 33931–33938: searched ALL dated preregs
  (evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md,
  grep for 3393[1-8]) — ZERO matches. Forbidden bands named in
  November preregs (73641–73648, 73671–73678, 78201–78208,
  99351–99358, 99401–99412, 99001–99008, 99009–99024, 99041–99052,
  99101, 99201–99208, 99209–99216) do not intersect. The r157
  contaminated list (897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062) does not intersect.
- Full-evidence substring hits for 33931–33938 are metric values,
  not seeds: `"pantryKcal": 33937` in
  evidence/2026-10-13/sim-courtkill-b.json and `"arrears": 33938`
  in evidence/2026-10-14/wave5posture-sweep.json (same noise class
  as r157's check). No `"seed": 3393x` / `SEED=` / `seed=` use
  anywhere in evidence. Band 33931–33938 is FRESH. No collision;
  no fallback needed.
- Repro seeds 33803/33806/33912 + smoke 33998: deliberate reuse
  (above).

## Bars (binding, §14)

- REPRO (binding): on the before-leg (current master, no fix), at
  least one agency-narration dry reproduces on 33803/33806/33912 —
  an agency place line run/self-blocked at an agency:ask_field or
  agency:ask_expedition turn (SAYTRACE preRun/preSelf on the
  place-line key at an agency turn, place popped in the same turn).
  A non-repro drops out of the denominator, recorded, NOT
  re-scored (r147 prereg rule); the fix decision then rests on the
  mechanism proof test (r155 precedent).
- AGENCY-DRY CENSUS (binding, new): after the fix, across ALL driven
  transcripts on the after-leg + panel seeds, ZERO dry lines at
  agency turns attributable to the agency place line (SAYTRACE
  preRun/preSelf on the place-line key at an agency turn). A dry at
  an agency turn through any other mechanism is reported with its
  attribution, not counted against this bar — but a new agency
  place-line dry anywhere FAILS it.
- TEACH-DRY CENSUS (binding, carried from r157): ZERO dry lines at
  'teach' turns attributable to the teach-narration line (r157 fix
  regression check).
- OPENER-DRY CENSUS (binding, carried from r155): ZERO dry lines
  at conversation open attributable to the trade-seed line or a
  link-raise opener line. Classification (r157 metric review, ADOPTED
  this run): a sayTrace fellBack with pick null is not itself a dry
  line — the returned text decides (nonverbal gesture fallbacks read
  as fellBack but return gesture narration).
- DRY CENSUS (binding, carried from r151, REVISED per r157 metric
  review, ADOPTED this run): ZERO dry lines at ask/details turns
  attributable to a favor whyLine, however delivered — via
  engageBeat OR via the dialogue layer's dlg:details handler
  (convo-dialogue.js:733). The r157 letter ("via engageBeat") missed
  the Manaia d86 water whyLine dry delivered through dlg:details;
  the bar now counts the player-visible shape, not the delivery
  path.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3
  eligible seeds AND ≥3 bonded by the deadline AND bonded/eligible
  ≥ 2/3. (r157 note: the dialogue-only fix cannot move the capacity
  denominator; a denominator shortfall is INSUFFICIENT-DATA, not a
  miss — the r155 merge call, same shape.)
- PROOF TESTS (binding for any fix claim): r146 + r147 + r151 +
  r155 + r157 proof tests re-run GREEN on the final tip; any new fix
  carries its own proof test, verified RED on unfixed code and
  GREEN after.
- SELF-REQUEST REGRESSION CHECK (reported, not scored):
  selfReqDayEntries == 0 on every seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls; funeral INCALL beat present on every leg
  death. Controls (r157): the recurring non-opener dries read
  identically before/after (Paisley d33, Lorenzo d44 deflect_q;
  David d81/d101).
- PEOPLE CHECK (sense, not a count): read the fixed agency
  transcript in full plus one d+14 successor transcript per CAP-NC
  panel seed. Bar: conversations have meaning per the sense-testing
  law; the fix must not introduce filler or a line promising a need
  that isn't there.

## What would count as an interesting finding

- An agency-narration dry NOT reproducing on current master (already
  fixed by a later landing — check git blame before claiming).
- A NEW agency-dry mechanism (a third single-fixed-line agency beat,
  e.g. the generic "too many joints" line drying with a closer
  behind it).
- The water whyLine dry recurring (33923 d86 Manaia class: single
  fixed string in convo-wants.js:169, delivered via dlg:details) —
  measured under the revised DRY CENSUS; fix-or-document decided
  after the panel (the r146 variant treatment is a bigger change
  than this run's fix shape; it is NOT pre-planned).
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

No new game change is pre-planned. If the before-leg reproduces the
agency-narration dry, the fix is attempted same-run ONLY if small,
safe, and provably a defect in the diegetic-act class
(transcript/copy only: diegeticAct on the agency place-line
emission; no trust/consequence/ledger changes; no RNG change in the
guard path) with its own proof test; otherwise the finding is
documented with evidence for the owning builder lane and the branch
merges only if the binding bars pass. No gate, deed, wave, nor table
change under any reading of a finding (freeze stands).

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
- CAP-NC denominator: r157's fresh band yielded only 2 eligible
  seeds (second handoffs dominate: 5/8 panel seeds). This run keeps
  the 8-seed stop rule; a decisive CAP-NC verdict may need a longer
  panel — a prereg question for the NEXT run, not a re-score here.
