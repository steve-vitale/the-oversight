# sim-voicejoins-b — CHECK-FIRST: wild ally-joins are ALREADY VOICED

Run `fleshout-loop-b-20261113T1430Z`, Loop B, axis winnability chain,
arm sim-voicejoins-b. Check-first arm on finding #2290 (sim-findings.md):
VOICELESS JOINS — four wanderers join seed 190392 d78–81 with no arrival
line in the d76–83 say sample.

**Verdict: ALREADY-VOICED. No build.** Every roster-join path in the game
voices the join, exactly once, by name — proven staged (3 seeds) and in
the field (the finding's own seed, full say capture). The finding's
evidence cannot see the voice: the vetphantom corpus's `vetSays` capture
is filtered by a veteran/kill regex that matches NONE of the arrival
lines. The "silence" is a sampling artifact, not a silence in the game.

No prereg was written: the prereg binds judged sims for a build, and
the check-first branch resolved before any build existed — the probe
below is a diagnostic check (the same standing as the voiceless-a
probes, which preceded that arm's prereg), not a judged sim. No
`src/js` changed; no balance panel (§15) applies — there is no
before/after to compare.

## 1. The finding's evidence, re-read

Finding #2290 rests on one corpus:
`evidence/2026-11-11/perseed-vetphantom-b/vetphantom-s190392-vetphantom-pilot-fix.json`,
`vetSays` 47 lines. The driver that produced it
(`scripts/vetphantom-driver-20261111.js:106`) captures say lines through:

```js
const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;
```

The corpus's `sayCount` is **13,745**; `vetSays` keeps 47. The filter
keeps veteran/kill lines only. Every arrival line in the game fails it:

| Arrival line (verbatim from code) | Matches SAY_RE? |
|---|---|
| `🚶 Maya Singh walks in — pack light, eyes wide. Haven grows by one. (8 souls.)` (membership.js `arrivalTick`) | No |
| `📨 Word came: Maya Singh wants to join Haven. "Heard about this place three valleys over. Had to try."` (membership.js `considerApplications`) | No |
| `📨 The village didn't wait for you. Maya Singh was vouched for around the fire — they're walking.` (membership.js `villageAutoRecruit`) | No |
| `A curious wanderer grins wide. Haven grows by one.` (betrayal.js `visitorInteract` invite) | No |
| `👋 The village didn't wait for you — a curious wanderer was taken in around the fire.` (membership.js `villageAutoRecruit`) | No |
| `The fire makes room. Test One, Test Two — said aloud, so the village learns the names.` (villageAgency.js `_vaAdmitPetitioners`) | No |

So "no line in the d76–83 say sample announces any arrival" is true of
the sample and false of the game: the sample was built to exclude
exactly these lines. The proof test (§4) replays the verbatim filter
against the arrival lines and scores 0 matches.

## 2. The join paths, found in code (check-first search)

Four paths grow the roster, all voiced:

1. **Membership application** (membership.js `considerApplications` →
   `acceptApplication` → `arrivalTick`): the application is announced
   (`📨 Word came: X wants to join Haven…`), the auto-accept is
   announced (`📨 The village didn't wait for you. X was vouched for
   around the fire — they're walking.`), and the arrival is announced
   (`🚶 X walks in — pack light, eyes wide. Haven grows by one.
   (N souls.)`). The four corpus joiners are all this path:
   Daniyar/Nina/Mia are `background_survivors` picks (`genApplicant`,
   id = the survivor id), Akai is a generated drifter (`app_` id).
2. **Visitor invite** (betrayal.js `visitorInteract` 'invite', reached
   directly or via `villageAutoRecruit`): `X cries — relief, mostly.
   Haven grows by one.` / `X grins wide. Haven grows by one.`, plus
   the auto-recruit line `👋 The village didn't wait for you — X was
   taken in around the fire.`
3. **Petition admission** (villageAgency.js `_vaAdmitPetitioners`):
   `The fire makes room. X, Y — said aloud, so the village learns
   the names. They're Haven's now, for better or worse.` (plus a
   no-room line for petitioners left out, and a cannibal-cause line).
4. **Dead-arrival refusal** (membership.js `arrivalTick`): an
   application accepted before the applicant died is refused aloud,
   not silently — `Word came too late: X never made it — they're
   already gone.`

The coordinator's sniff (no "joins the village" / "has joined" /
"joins us" lines in `src/js`) is consistent with this: the game says
"walks in", "Haven grows by one", "The fire makes room" — it never
uses the word "joins" for arrivals. The sniff searched for the wrong
words.

## 3. Proof — scripts/test-voicejoins-b.js: 57/57 green (seeds 7, 42, 99 staged; field 190392)

- **§1 staged arrivalTick:** an accepted background-survivor
  application arriving today voices exactly one walks-in line naming
  the joiner (`🚶 Lena Ruiz walks in — pack light, eyes wide. Haven
  grows by one. (13 souls.)`), roster +1; a second tick repeats
  nothing for the same join.
- **§2 staged visitor invite:** a curious visitor invited in voices
  exactly one `Haven grows by one` line, roster +1 as a `visjoin_`
  id.
- **§3 staged petition admission:** two petitioners admitted with
  housing room voice exactly one `The fire makes room. Test One,
  Test Two — said aloud…` line naming both, roster +2, petition
  clears. (Fixture note: the staged roster is trimmed to 10 first —
  `havenRoom()` is cap 12 minus roster, and the fresh game starts
  full. See §7 for what the zero-room case does.)
- **§4 the filter:** the verbatim vetphantom `SAY_RE` matches 0 of
  the arrival lines (staged lines plus the application and
  auto-accept lines quoted from code).
- **§5 field leg** (seed 190392, 150d, competent, FULL say capture,
  joins tracked at the call site — see §4 note on why snapshots
  cannot do this): **7/7 real joins voiced exactly once, 0 phantom
  arrival lines** (every walks-in / grows-by-one / fire-makes-room
  line in the 13,226-line run belongs to a recorded join):

  | day | path | joiner | line |
  |---|---|---|---|
  | 86 | arrival | Maya Singh | `🚶 Maya Singh walks in — pack light, eyes wide. Haven grows by one. (8 souls.)` |
  | 86 | arrival | a quiet farmer | `🚶 a quiet farmer walks in — pack light, eyes wide. Haven grows by one. (7 souls.)` |
  | 89 | arrival | James Okonkwo | `🚶 James Okonkwo walks in — pack light, eyes wide. Haven grows by one. (9 souls.)` |
  | 105 | arrival | Theo Lindqvist | `🚶 Theo Lindqvist walks in — pack light, eyes wide. Haven grows by one. (7 souls.)` |
  | 106 | arrival | Ingrid Vik | `🚶 Ingrid Vik walks in — pack light, eyes wide. Haven grows by one. (8 souls.)` |
  | 127 | visitor | a frightened family | `A frightened family cries — relief, mostly. Haven grows by one.` |
  | 137 | visitor | a curious wanderer | `A curious wanderer grins wide. Haven grows by one.` |

  Two naming notes, both read as honest rather than silent: generated
  drifters are voiced by their application descriptor ("a quiet
  farmer") while the hydrated roster person carries a real name
  ("Da-hye") — the line names the arrival the village was told
  about, not the name the roster later assigns. Visitor joins are
  voiced by descriptor ("a curious wanderer", "a frightened family")
  because visitors have descriptor names by design.

Closest suite on this tree: `scripts/test-membership-20261007.js`
**43/43 green**. No `src/js` changed, so no regression surface exists
for this arm; `check.js --quick` was not re-run (nothing to regress).

## 4. The probe band (check evidence, 8 seeds, 150d, competent)

Driver `scripts/voicejoins-probe-20261113.js` (committed with this
arm): full `Game.say` capture (no filter) + daily roster tracking.
Corpora in `~/workspace/scratch-loopb-1430/voicejoins-probe-s<seed>.json`
(~13 MB total, kept in scratch — the proof test re-proves the field
leg self-contained, so the corpora are not committed).

| seed | days | end | scale | maxWave | standing | snapshot joins | arrival lines |
|---|---|---|---|---|---|---|---|
| 190391 | 65 | village-lost | regional | 4 | 145 | 0 | 0 |
| 190392 | 143 | village-lost | regional | 4 | 199 | 6 | 14 |
| 190393 | 126 | village-lost | regional | 4 | 199 | 13 | 28 |
| 190394 | 128 | village-lost | regional | 4 | 199 | 6 | 12 |
| 190395 | 150 | survived | regional | 4 | 199 | 6 | 13 |
| 190396 | 140 | village-lost | regional | 4 | 199 | 7 | 14 |
| 190397 | 135 | village-lost | regional | 4 | 199 | 4 | 8 |
| 190398 | 139 | village-lost | regional | 5 | 370 | 8 | 19 |

**50 snapshot-detected joins, 0 unvoiced** by the window test (every
join day has ≥1 arrival-type line on the join day or the day before;
the one-day lag is the snapshot's, not the voice's — the call-site
leg in §5 pins the line to the join call itself). The band also shows
the corpus's exact joins do NOT reproduce on current master: the
vetphantom corpus has 190392 surviving 150d with Daniyar/Akai/Nina/
Mia joining d78–81; on this master (7ffbecad4, after the r131
phantom-veteran fix and the combatdedup / applystatus / inffight
landings) the same seed loses d143 with different joiners on
different days. Same standing (199), maxWave (4), scale (regional) —
different people, different days. The finding's dates are stale on
this tree; the mechanism it questions is voiced on every join that
does occur.

## 5. Wall numbers

Band (8 seeds, 150d, competent): national **0**, table **0**, wins
**0**. Wave-5 unlocks **1/8** (190398 only), wave-4 unlocks **8/8**.
Survived **1/8**, village-lost 7/8. Median survival **137d**. The
scale wall stands unchanged — this arm built nothing and moved
nothing (and was never scoped to).

## 6. Metric review

No prereg, no GO bar, no re-scoring: the check-first branch resolved
the arm before any judged sim existed. The metric that would have
bound a build (voice firings under the join condition, per the task
brief) is answered directly by §5's call-site leg instead — 7/7
joins, exactly one line each, 0 phantoms. One metric-review note for
the NEXT run: a finding whose evidence is a regex-filtered sample
must be re-checked against the FULL say stream before it becomes a
build arm — the vetSays filter is a veteran/kill instrument, and
reading it as a transcript manufactured this finding. The proof
test's §4 (replay the capture filter against the claimed-missing
lines) is the cheap guard; use it whenever a finding cites a
filtered corpus.

## 7. Blanks filled and findings (surfaced, not chased)

- **Blank (finding #2290): ANSWERED, not fixed.** Wild ally-joins
  are voiced on current master — the finding's premise fails on the
  full say stream. No code changed. Finding annotated [ANSWERED] in
  sim-findings.md with this evidence citation.
- **Finding (new, filed as [open] in sim-findings.md): VOICED JOIN,
  SILENT VANISHING.** On seed 190392 d137, the curious wanderer is
  taken in — both lines fire, the roster grows 3→4 (`visjoin_136`,
  instrument-proven) — yet the daily roster snapshots show 3 again
  by d138, and no say line in d137–139 mentions the newcomer leaving
  or dying (Ximena's d139 death is said aloud; the wanderer's exit
  is not). A newcomer can join voiced and vanish within a day
  without a word. Which removal path takes them — death in an
  unsaid path, a cleanup pass, or something else — is unproven and
  out of this arm's scope; it is a roster-stickiness question for a
  future arm, and it matters to the winnability chain's first link
  (a join that doesn't stick is not a join). Instrument scripts:
  `~/workspace/scratch-loopb-1430/voicejoins-d137-instr.js`,
  `voicejoins-d137-track.js`, `voicejoins-d137-check.js`.
- **Finding (new, filed as [open] in sim-findings.md): NAMELESS
  ADMISSION LINE.** When `_vaAdmitPetitioners` runs with zero
  housing room, it still says `The fire makes room.  — said aloud,
  so the village learns the names.` — with blank names, admitting
  nobody. Found while staging §3 (fresh game starts with a full
  roster, room 0). Whether the moot can accept with room 0 in live
  play is unproven — the staged call bypassed the moot — so this is
  filed as a copy wart to verify, not a defect claim.

## 8. Convergence

**Converged for this arm's question:** the check is decisive —
joins are voiced, proven staged and in the field, with the finding's
own evidence explained as a filter artifact. The winnability-chain
axis itself remains open (wall numbers §5). The arm leaves no
branch work behind: the probe driver and proof test are the
deliverables; nothing awaits landing except the coordinator's merge
of those two files plus this evidence file.
