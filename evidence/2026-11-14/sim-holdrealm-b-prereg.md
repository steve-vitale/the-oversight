# sim-holdrealm-b — PRE-REGISTRATION ("the hold")

Run: `oversight-flesh-out-loop-b` 2130Z, run id `fleshout-loop-b-20261114T2230Z`
Arm: sim-holdrealm-b — DIAG arm, "the hold": why do realms dissolve after the court,
and why do two never re-climb? Next blank #2 of the 2130Z run; findings-backlog item
"REALMS DISSOLVE AFTER THE COURT".
Branch: `sim-holdrealm-b` (worktree `~/workspace/worktrees/sim-holdrealm-b`).
Date: 2026-11-14. Coordinator: Loop B 2130Z run.

## Source evidence

`evidence/2026-11-14/sim-answercourt-confirm-b.md`, section "Holding after the court".
Confirm band seeds 100201–100216, 150d death-aware, armed policy
`competent-answercourt-b` vs baseline `competent-scaleclimb-b`. 13/16 armed villages
reached national; 8 held it at the end; **5 dissolved**:

| seed | reached national | dissolved | village end |
|------|------------------|-----------|-------------|
| 100203 | day 62 | day 89/90 | lived to day 150, never re-climbed |
| 100212 | day 65 | ~day 142 | lived to day 150, never re-climbed |
| 100204 | day 68 | day 139 | village fell day 140 |
| 100206 | day 62 | day 134 | village fell day 137 |
| 100216 | day 63 | day 97 | village fell day 105 |

Corpus on master: `evidence/2026-11-14/perseed-answercourt-confirm-b/` (32 per-seed
JSONs, both policies) plus pilot corpus `evidence/2026-11-14/perseed-answercourt-b/`.

Known instrument limit: the recorder caps `linkLines` at 600 lines. Seed 100212's
dissolution (~day 142) left no captured dissolution line because the cap was already
hit — instrument limit, not evidence of silence. Seed 100203's dissolution HAS a
played line (day 89: "Emberhold's fire is drifting from ours…").

Known sense gap: no villager ever says what Haven did wrong when trust slides —
drift warnings name the symptom, never the cause.

## Primary metric — dissolution classification (BINDING, MEASUREMENT.md §14)

**GO = every one of the 5 confirm-band dissolutions gets a named mechanism drawn
from the recorded per-day series (trust trajectory, link breaks, speaker deaths,
feast/mourning, pending beats), 0 UNCLASSIFIED; AND the re-climb blocker is named
for 100203 and 100212 (what is missing that a re-climb would need: links? trust?
beats re-staging?).**

A miss is NO-GO, never re-scored against a friendlier metric mid-run. If the metric
proves wrong, write it under "metric review" and propose the revision for the NEXT run.

Classification vocabulary (mechanisms, from the recorded series — extend only with
evidence from the series, never by invention):
- `trust-slide` — a subordinate's trust falls below the holding bar before the break
- `link-break` — a link is lost/broken (verbEvents / links count drop) before the break
- `speaker-death` — the polity's speaker (or Haven's speaker) dies shortly before
- `feast/mourning` — a feast/mourning event in the window
- `pending-beat-stall` — the national beat was pending/unanswered long enough that
  the polity lapsed (pendingNational / pendingCounter / pendingAccord / pendingGlobal)
- `UNCLASSIFIED` — none of the above is visible in the recorded series

## Horizon, seeds, policies

- Horizon: the confirm corpus (150d, death-aware). No new horizon is invented.
- Seeds: confirm band 100201–100216. Policies: `competent-answercourt-b` (armed),
  `competent-scaleclimb-b` (baseline). The dissolutions under classification are
  the 5 armed-policy ones above.
- The pilot corpus (100101–100108) is a secondary check only: any dissolution
  there is classified the same way and reported alongside, but it does not enter
  the GO bar.

## Method (staged)

1. **Analyze the existing corpus FIRST.** Build the analyzer as a script under
   `scripts/` (not a one-off): per dissolution, dump the per-day series window
   (scale, polity, havenPolity, links, linksRoll, nationalLive, pending* beats,
   trust samples, pop, pantry, feasts), the verbEvents and linkLines in the window,
   and deaths of speakers/linked villagers. Classify each dissolution from that
   window. SENSE-TESTING LAW: read the dissolution lines; judge meaning, coherence,
   consequences — never just counts. Name what is voiced and what is silent.
2. **Fresh band ONLY if the corpus cannot answer a dissolution** (e.g. the 600-line
   cap hid it). Then: extend the recorder first (segmented capture / higher cap /
   dissolution-episode capture — an instrument change, judged by whether the new
   capture shows the dissolution lines), then run a FRESH band, freshness-checked
   per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` (grep ALL
   preregs under `evidence/` for the band before using it), 8 seeds pilot, same two
   policies, 150d death-aware. Confirm 16 only if the pilot stages ≥2 dissolutions
   to classify AND the recorder still leaves one unclassified. Do NOT run a fresh
   band if the corpus already answers everything — that would be a wasted
   measurement batch.
3. Write `scripts/test-holdrealm-b-*.js` proving the instrument (classification +
   negative cases: a held realm must not classify as dissolved; a village-fall
   dissolution must not be misread as a trust-slide).
4. Evidence file `evidence/2026-11-14/sim-holdrealm-b.md`: prereg header, a
   per-dissolution table, wall numbers (national/table/wins, wave 4–5 reach,
   median survival on any fresh band run), a "metric review" section, and a
   plain-words village assessment.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — on the confirm corpus
and on any fresh band run.

## Canon

`docs/CANON.md` read first; area docs: `docs/COHERENCE-SPINE.md`,
`docs/godpath/STEVE-ANSWERS.md`, plus links/diplomacy/realms canon found by grep
(`docs/MAP.md` region registry, `docs/CONVERSATIONS.md`, `docs/TABLE.md` as needed).
If no doc covers the dissolution/holding mechanics, say so in the evidence file
instead of inventing canon.
