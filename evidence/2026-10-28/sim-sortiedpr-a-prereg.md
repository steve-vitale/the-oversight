# sim-sortiedpr-a — PREREGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T2236Z (loop A). Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-sortiedpr-a.
Task: the SORTIE-DPR measurement — the second-ranked next blank from run
fleshout-20261028T2115Z (evidence/2026-10-28/sim-scale-onramp-round-2115.md).
Question: mustered parties may already be the killers — measure, before
building anything, what mustered/sortie parties actually achieve in real
sims on CURRENT MASTER. MEASUREMENT ONLY: zero src/js, zero policy-default
changes, zero use of the sibling tileparty arm's branch (this measurement
must describe the game as it ships today).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law, wave-4 bands 850-1500
HP). No canon doc covers sortie DPR — the definition below is derived
from code mechanisms, stated exactly so it can be checked:

- havenGrowth.js lingererSortie (via answerLingerer('sortie')) is the
  DELIBERATE muster: _musterAway(3, 'defense') picks up to 3 roster
  members (never the player), leader = muster[0], allies = the rest,
  a day's rations per fighter paid from the pantry (2000 kcal each),
  one played fieldFight per lingerer at the home treeline with
  opts = { allies, allyVids, cornered: true }. No other caller sets
  cornered.
- fieldFights.js fieldFight fights leader + at most ONE joined ally:
  allyFromStart is NOT set by lingererSortie (it is set only by
  aidFight), so a sortie ally joins only via the hopeless shout
  (one ally, shift once, only when intent !== 'learn'). Sortie
  intent is 'engage' at creation (opts.allies > 0), so the shout
  CAN fire — but only from a hopeless round onward. MUSTERED 3
  therefore does NOT mean 3 damage dealers: mustered size and
  joined-fighter count are reported separately, always.
- mDealt accumulates ALL party damage (leader strikes + joined-ally
  strikes + volley + ability damage); allyDealt is the joined-ally
  strike subset. Volley damage is inside mDealt with no recorder
  split — stated, not hidden.
- villageAgency raid-defense musters are flat rolls (15% dead /
  30% wounded), not fieldFights — excluded by construction, never
  counted as DPR. Scholar TB finishes use a different engine path
  — excluded. Aid fights (caller 'aid', allyFromStart) are a
  separate class — contrast only, never pooled with sorties.

## Definition (fixed BEFORE counting)

- MUSTERED/SORTIE PARTY: a fieldFight whose stack caller class is
  'sortie' (fieldparty-form-diag classifier: lingererSortie in the
  stack), on base code. MUSTERED SIZE = engineAllies + 1.
  JOINED FIGHTERS = 1 + (joinedAllyVid non-null ? 1 : 0).
- SUSTAINED PARTY DPR per fight = mDealt / rounds, for fights with
  rounds >= 1. Ally share = allyDealt / rounds. Leader share =
  (mDealt - allyDealt) / rounds (volley inside leader share).
- ROUND-0 fights (volley kill / volley drive-off before round 1)
  are one-shot events: counted in kills/drive-offs, EXCLUDED
  from the sustained-DPR distribution, listed separately.
- KILL vs DRIVE-OFF frame (stated explicitly, per the 2115Z metric
  review): drive-off does NOT count as a kill. Outcomes reported
  separately always: KILL (vKill), DRIVE-OFF (mFlee), FLED (vFlee),
  DIED (vDie), EVADE (evade), OTHER (anything else, must be 0).
- SURVIVAL ROUNDS: the rounds distribution by outcome; leader
  survival = outcome !== vDie; ally survival from allyTaken /
  allyHpLeft where an ally joined.
- CAP-FIT: at the measured median sustained DPR, rounds to kill a
  fresh 850-HP and 1100-HP beast vs the 15-round cap; and per
  sortie fight, rounds-needed at that fight's own DPR for its
  actual mHpStart vs rounds actually fought.

## Bands (identical seeds, same substrate, base code)

Substrate (both bands, VERBATIM): scripts/policies/tableseat-nowait.js,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware (runDays stops
on death/win; +10d tail max), scripts/policies/fieldparty-form-diag.js
reused VERBATIM (never edited) + this arm's sortie/opportunity
counters (say-line + answerLingerer wraps modeled on the r50 journey
script; recorder-only, no game-state writes, no RNG draws).

- Band AUTO (autonomous): NO sortie-answering layer. Measures whether
  sorties ever happen on their own + opportunity counts: lingerer
  episodes (r50 object-identity tracking), lingerer-days, gorge
  nights, answerLingerer calls. Expectation (stated, not a gate):
  0 sorties — no beat-answering policy exists on this substrate.
  If sorties are 0 AND opportunities are 0, that is a SUBSTRATE
  note (no lingerers on this band), not a kill result. If sorties
  are 0 WITH opportunities present, that absence IS the finding.
- Band PLAYED (played sorties): tableseat-nowait + a sortie-driver
  layer living ONLY in this arm's sweep script (never a policy
  default, never committed as one): once per lingerer episode
  (r50 tracking), when a gorge line has been seen for the episode,
  call answerLingerer('sortie'). NO HP GATE — unlike partyfinish's
  risk-gated driver (min HP <= 80, sum <= 300), this arm measures
  DPR against the REAL lingerer population, including healthy
  beasts. The engine's own gates still apply (no-fighters return;
  rations paid from the pantry). One sortie per episode; episodes
  close when the lingerer leaves the lingerers list.
- Seeds: PILOT 75101-75108, both bands. CONFIRM 75101-75116 (PLAYED
  band; AUTO too only if pilot AUTO shows any sortie) ONLY if the
  pilot shows the measurement populated (PLAYED pilot has >= 1
  sortie fight). Confirm extends the DPR distribution; it does not
  re-judge the pilot.
- Pre-pilot substrate checklist (§14b): CONTACT — partyfinish-a on
  this substrate saw 65 lingerer-days and 12 sorties; POOL — 29
  gated sortie fights / 8 seeds, ungated driver should meet or
  exceed that; VERB — answerLingerer('sortie') exists in code;
  HORIZON — partyfinish sorties fell on d68-d112, inside the 180d
  cap. No checklist leg fails; the pilot proceeds.

## Secondary analysis (NOT the judged corpus, never pooled)

The same analyzer, same definition, run over the committed
partyfinish armed corpus (evidence/2026-10-28/perseed-partyfinish-a/
armed/, caller='sortie' rows of the partyfinish recorder):
its sorties were risk-gated to weak treelines, so its DPR
distribution is a gated-driver contrast, not a second judged band.
Partyfinish's verdict (GO, 18 counted finishes) is NOT re-judged;
only DPR is computed from its rows. Fieldability's ceiling
(48.25 wild best, 57-80 kill band) and chainkill's census (21
chains, 0 kills) are NOT re-judged either.

## Sense-testing law (transcripts read + quoted)

- S1 (corpus-derived): one full played sortie from the PLAYED
  band — its SORTIE say line, its fight summaries, and its
  fieldparty meeting rows — quoted and judged: does the sortie
  read as people deciding, and does the fight read as a party
  fight (mustered size vs joined fighters vs damage shares)?
- SENSE VERDICT categories: COHERENT (sortie + fight read as a
  deliberate party action with honest damage shares) / MIXED /
  DISCONNECTED (the muster and the fight do not read as one
  action, e.g. solo credit for party effort — the partyfinish
  pre-fix blank, now fixed in code).
- If no played sortie exists to quote, the sense leg FAILS and
  the verdict is DIAG-NO-GO with the failing leg named — a
  measurement arm with no transcript is not credible.

## Bars (judge against this header; a miss is DIAG-NO-GO, no re-scoring)

- CORPUS-VALIDITY: 8/8 rows per pilot band, recorder errs 0,
  overflow 0, per-seed days > 0.
- OPPORTUNITY-REPORTED: AUTO band reports episodes, lingerer-days,
  gorge nights, answerLingerer calls — absence stated with its
  opportunity counts, never as a bare zero.
- DISTRIBUTION-COMPLETE: PLAYED corpus reports, for rounds >= 1
  sortie fights: sustained-DPR distribution (median, quartiles,
  range, n), leader/ally shares, mustered-size distribution,
  joined-ally rate, survival-rounds distribution by outcome,
  kills and drive-offs separately, round-0 fights listed
  separately, cap-fit numbers for 850/1100 HP.
- DIAG-GO: corpus valid AND opportunity reported AND >= 10
  rounds >= 1 sortie fights in the judged PLAYED corpus
  (pilot, or pilot+confirm if confirm ran) AND >= 1 sortie
  transcript read + quoted AND one ranked next step named with
  numbers. Fewer than 10 fought sorties with > 0 present ->
  DIAG-PARTIAL (distribution reported, explicitly not claimed
  as publishable). Zero sortie fights even when played ->
  verdict follows the opportunity counts: episodes present but
  sorties unfireable = absence finding (DIAG-GO on the absence
  leg only, distribution legs marked N/A with reason); zero
  episodes = SUBSTRATE-EMPTY (not a kill, not a GO — reported
  as an empty measurement). Any other leg missed -> DIAG-NO-GO
  with the failing leg named.
- WALL NUMBERS per band (reported, never claimed as movement):
  national ever/final, table invited/entered, wins (lesser/full),
  wave 4-5 reach, median survival, death-cause shares, starvation
  count. The PLAYED band differs from AUTO by the driver layer
  only — its wall numbers are a driver-effect observation, not a
  game-change claim.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no fight
routing, no roster read, no push, no bump, no live verification.
No use, import, or build on the sibling tileparty arm's branch.
No re-judgment of predecessor verdicts (partyfinish GO,
fieldability DIAG-GO, chainkill DIAG-GO all stand). No wall
movement claimed from measurement alone. No panel artifact
(standing exception: the panel has no census-ingest mode;
identical-seed paired tables are the §15 substitute, as in prior
rounds). Instruments: scripts/test-sortiedpr-a-sweep.js (AUTO +
PLAYED bands), scripts/test-sortiedpr-a.js (analyzer + judge),
scripts/test-sortiedpr-a-sense.js (sortie transcript replay).
Each must pass `node --check`; analyzer must print its verdict
after every rebase. Never run concurrent jest; cache dir
/tmp/jest-cache-sim-sortiedpr-a (no jest expected — node scripts
only; the rule is recorded, not waived). Never touch
docs/ONTOLOGY.md (known sibling transient — left alone). Never
touch sibling loop-B trees/branches or their claims.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
