# Journey succession r137 — Lane B, leg 7 (succession): strangers DO bond with the bearer — but only 2 seeds could even ask

Leg 7 (succession). Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout, verified by re-read after landing.
Base master e938cda83. Run number r137 follows r136 (social life,
same day); the rotation file, not the number, is the authority.

## Run setup — lock, slow registration, heartbeat lesson applied

- No lock at run start. Fresh lock written (run_id 2026-11-05T09:55:51Z).
- Pre-flight: main tree clean, disk 32%. Reap ran clean except the
  standing sibling noise (other lanes' dirty trees, never touched);
  13/16 active, under cap.
- Registration: the plain body slug journey2-succession is still
  stale-registered (status done-merged, Oct 30; its directory is an
  orphaned non-git copy, NOT deleted — needs a main-session
  disposition, same as r133), so this run used the run-suffixed slug
  journey2-succession-r137, the same deviation prior runs used.
  Checkout took ~9 min under sibling load (not killed, not retried).
- Heartbeat: immediate heartbeat landed after registration
  (10:07:31Z); detached setsid loop (sleep 300) verified alive
  (pid 24849) with ticks landing in the log — the r133 lesson applied
  (a nohup loop spawned from a finished exec session dies silently).

## Pre-registration (binding, written before any scored seed)

Prereg: evidence/2026-11-05/journey-succession-r137-prereg.md.
Question carried from r133 (verdict INSUFFICIENT-DATA): can a bearer
bond with a stranger they talk to? r137 applies r133's metric-review
revision verbatim — judge at relD14, relD30 as confirmation,
no-stranger-pool seeds as saturation findings — plus the required
instrument fix (bondDaily carries bearerId, so chained seeds stop
mixing bearers). Pilot seeds 33501–33504 (fresh band, verified clean),
reserves 33505–33506, POST_DAYS=70, EARLY_KILL_DAY=40, no forced
kills. Smoke seed 33599 (EARLY_KILL_DAY=5, POST_DAYS=10) proved the
instrument before the panel: bondDaily 10/10 entries carry bearerId,
stranger probe opened (Sarah, trust 42, want curious), no anomalies.

## Binding verdict: CAP-D14 = INSUFFICIENT-DATA (not a fail, not a pass)

- CAP-D14 bar: stranger-probe bond by relD14 on >= 3 of 4 pilot
  seeds, counting only seeds where the probe opened AND the village
  survived to d+14 AND the probe bearer still holds at relD14.
  Result: 2 ELIGIBLE seeds out of 6 run (4 pilot + 2 reserves, per
  the prereg's reserve rule, then stop) — and BOTH bonded by d+14.
  - 33503: Jorge↔Petra bonded d+3, the SAME day as the probe
    conversation (probe: Petra trust 44, want ask_favor).
  - 33504: Elijah↔Hugo bonded d+9, six days after the probe
    conversation (probe: Hugo trust 29, want none).
  - 33502, 33505, 33506: no-stranger-pool — the successor was already
    bonded to every living villager at relPost. Saturation findings,
    not capacity misses.
  - 33501: SKIPPED — village over at d27 before any kill.
  - Per §14 the bar is NOT re-scored against a friendlier metric
    mid-run. 2/2 bonded is the descriptive picture; the binding
    verdict is INSUFFICIENT-DATA because the denominator never
    reached 3.
- CAP-D30 confirmation: UNAVAILABLE — both eligible seeds' villages
  ended before d+30 (relD30 absent on 33503 and 33504; their windows
  ran 14 and 16 bond-days). The D14 window is the only reachable
  judgment window in this mortality regime; D30 confirmation cannot
  even be observed on these seeds. A future run that wants D30 needs
  longer-lived villages, not a different bar.
- BONDED-EVER (descriptive): 2/2 probe-opened seeds.

## The mechanism answer (OPP, descriptive): capacity holds, opportunity is the constraint

- Talk requests to the bearer, d+0..d+30, distinct (self excluded):
  19 total across 5 handoff seeds, of which UNBONDED = 2. Deborah
  (33503, filed d16) was an EXISTING villager in the relPost roster —
  an NPC-initiated stranger opportunity from inside the village, not
  a newcomer; she did NOT bond with Jorge in-window (the request did
  not convert). Naran (33504, filed d54) was a newcomer, and DID bond
  with Elijah d+16, three days after filing. So NPC-initiated stranger
  opportunity exists from both directions, but is rare: 2 in 5 seeds'
  windows.
- Bearer new bonds, first bearer only, d+0..d+30 (bondDaily.bearerId
  attribution, new this run): 7 total (33502: 2, 33503: 2, 33504: 3,
  33505: 0, 33506: 0), of which 6 on undriven days and 1 on a driven
  day (the d+3 probe-day bond itself). The probe bonds formed AFTER
  the conversation, through ordinary village life — the conversation
  opens the door, shared life walks through it. LATER-bearer new
  bonds: 4 (Zoe 3× on 33502 after taking the mantle; Natalia 1× on
  33505) — correctly separated from first-bearer counts for the first
  time; r133's counts mixed these.
- NPC-NPC new bonds: 35 across the panel (9/5/18/3/0). The autonomous
  bonding engine runs daily; the bearer is not excluded from it.
- REFRAMING (carried from r133, strengthened): the successor is not
  socially frozen. When a stranger is reachable — a probe partner, a
  newcomer, an unbonded villager who seeks the bearer out — the bond
  forms within days. The binding constraint is that in 3 of 6 seeds
  there was no stranger left to bond with at all. A player who wants
  new bonds as bearer should seek out newcomers and unbonded faces,
  not re-talk old friends.

## Instrument correction (pre-judgment, analyzer-side)

The first analyzer pass read pick-time rank as 9 (33503), 2 (33505),
8 (33506) — a carried-bar miss. That read was WRONG. Root cause, found
in code: npcIds() returns ROSTER order, not trust order
(betrayal.js:98 — filter only, no sort); the core sorts the returned
list by trust itself (ledger.js:846). The pre-r137 analyzer took the
successor's index in the RAW list, i.e. roster position, and called it
"rank". Recomputed against each call's captured trust map (stable
sort, replicating the core exactly): trust-rank is 1 on ALL 28
handoffs in the panel (5 first + 23 chained), and the picked id is the
trust-max in the captured map every time. The analyzer was fixed
(trust-sorted rank) and re-run on the same JSONs — no seeds re-run,
no driver change, no bar change (r117 analyzer-side precedent).
The corrected ranks are 1 on all 5 first handoffs: the carried bar
HOLDS. The fix also validates the instrument: the captured trust maps
are the pick-time inputs (had they been stale, trust-rank would not
come out 1 on 28/28).

## Carried bars (reported, not scored)

- Pick-time rank == 1 on 5/5 first handoffs (corrected instrument;
  see above). The rule "trust decides" holds on every handoff in the
  panel, first or chained.
- Funeral INCALL beat present on 5/5 leg deaths.
- No regression signal on either carried bar.

## Self-request regression check (r133 fix, in the wild)

selfReqDayEntries = 0 on all 5 handoff seeds (and on the smoke seed).
The r133 ledger.js purge (delete v.talkRequests[newId] at handoff)
holds in wild play: no stale self-addressed talk request survives a
handoff on this panel. The r133 selftalk proof test also re-runs
ALL GREEN on this base (scripts/test-journey-succession-r133-selftalk.js).

## People check (sense, not counts) — PASS

Read in full: both stranger-probe transcripts + one d+14 successor
transcript per scored seed (7 transcripts).
- Petra (33503): opens with a real want (a wound needing a second
  pair of hands, with stakes), deflects gracefully, mourns June by
  name ("June always took the burnt piece... I take it now") while
  correctly treating Jorge as the new bearer, refuses the invite with
  character, teaches ginseng, ending resolves. Bond follows the same
  day.
- Hugo (33504): Spanish-only language-barrier conversation; the NPC
  wants something legible (mime-walk, "come with me" to the ridge),
  one proud English word ("No, no."), warm ending. No fabricated
  shared history; bond follows six days later.
- Amina (33502): confides a secret (a photo of someone left behind),
  a trap-line outing that plays out quietly, reports a siege (Duc
  taken — show event, unverified not judged), takes Scout with
  consent. Ending resolves.
- Diego (33503): "uneasy peace" stance, soup-longing exchange, role
  handoff from Mateo handled ("Scout is yours now"), show-event line
  ("They took Farid and Sam — Who Ate It?, on the screens") noted
  unverified, not claimed fabricated (same honesty rule as r133).
- Hannah (33504): wound request, Pawpaw teaching, mourning Lucas by
  name, accepts the invite with terms, a haul outing that pays off
  (+4 wood, +4 fiber), role promise with Ruth stepping back.
- DeAndre (33505): "Just... talk. Like people used to." Belief
  exchange with character ("I believe in breakfast... The big beliefs
  all broke — the small ones held."). Mourns Axel (the FIRST bearer)
  to the second bearer, correctly.
- Chris (33506): a thinking place kept secret, "They took you — Sweet
  Tooth, on the screens" — the "you" is the bearer; the instrument
  cannot audit show events, so noted as unverified, not judged.
  Otherwise coherent, ending plants ("We'll pick this up later").
- One recurring wrinkle, cosmetic: the recap pick renders as "Still
  on what they confided / what you believe in" — third-person where
  first-person would read naturally. Driver-pick phrasing, not an NPC
  failure; noted, not a blank.

## Village assessment (plain words)

Six villages, one died before any death could pass the mantle:
- 33501: the village ended on day 27 before anyone died — it simply
  died out first. Nothing to hand on.
- 33502 (Leroy→Scarlett, scripted d42): the sturdiest village. Seven
  alive at the end, eleven fallen. Scarlett bonded twice, then died;
  Zoe took the mantle and bonded three more times. The village
  survived the whole window.
- 33503 (June→Jorge, organic d12): a small village, ten down to eight.
  Jorge bonded with Petra the day they talked and with Mateo a few
  days later. The village ended about two weeks after the handoff.
- 33504 (Dieter→Elijah, scripted d41): eight down to six, thirteen
  fallen. Elijah bonded with Hugo, Nathan, and the newcomer Naran.
  The village ended about two weeks after the handoff.
- 33505 (Zoey→Axel, organic d37): a churning village — twelve bearers
  in the window, Axel gone before day 14, the mantle passing hand to
  hand on day 63 until no one was left. Nine alive at the last
  checkpoint, zero at the end.
- 33506 (Devon→Jovan, organic d33): a quiet collapse — eight down to
  five, eleven bearers, zero new bonds anywhere, not even between
  villagers. The village wound down.
The pattern across the panel: villages either hold together and keep
bonding, or they churn through bearers and die out. There is little
middle ground, and the churn villages are where the mantle changes
hands fastest — which is exactly why relEnd almost never belongs to
the first bearer.

## Verdicts for the leg

- REACHABLE: yes — succession fires on 5/6 seeds (3 organic, 2
  scripted; the 6th village ended before any death), the pick follows
  trust on every handoff, the funeral arc fires, and the new bearer's
  social life continues through strangers and newcomers. A real
  player reaches this content by surviving to a death, which is the
  ordinary game.
- FUN: yes, with the standing caveat — the successor's second life is
  scholarly and social through newcomers and unbonded faces, but a
  village with no arrivals offers no new faces to befriend; that is a
  property of a small saturated village, not a broken system. The
  conversations themselves read like people.
- WINNABLE: unchanged by this run (no gate, price, or power changed;
  instrument-only run). The winnability chain is untouched, as
  ordered.

## Determinism proof

Seed 33503 re-run to a scratch file: the two stdout JSONs are
BYTE-IDENTICAL (160,484 bytes each) — no `ms` field present in this
driver's output at all, so the proof holds at the byte level, not just
ms-stripped (stronger than r133/r136, which differed only in `ms`).
The read-only wraps are trajectory-neutral.

## Metric review (§14)

- CAP-D14-as-written is the right window (relEnd is unreachable in
  this mortality regime), but its DENOMINATOR is the binding problem,
  not the bar level: 3 of 6 seeds had no stranger pool, so even a
  6-seed panel yields at most 2–3 eligible seeds. Proposed revision
  for the NEXT run (not applied here): pre-screen for stranger-pool
  seeds — e.g. run 6–8 seeds and score CAP-D14 on the eligible subset
  with a stated minimum (≥3 eligible or INSUFFICIENT-DATA), rather
  than fixing the pilot at 4. The saturation rate itself (3/6
  no-stranger-pool) is now a second datapoint for the design question.
- The pick-time rank instrument is fixed (trust-sorted, this run).
  Future runs must use the corrected analyzer; the old raw-list rank
  must never be quoted again — it measures roster position.
- CAP-D30 confirmation should be dropped as an expectation, not kept
  as a hope: both eligible seeds' villages ended before d+30. If a
  future run wants a D30 read, it needs longer-lived villages first.
- r133's bond counts are NOT re-scored here; r137 scores only the new
  decomposition (CAP-D14 + OPP with first-bearer split), per its
  prereg.

## Telemetry deviation check (step 14) — LOUD lines, all EXPLAINED, baseline NOT rolled forward

Command (per-seed, single files — r133's aggregation lesson applied):
node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-05/journey-succession-r137-tele-<seed>.json'
--metrics deaths.bearer,census.alive,census.fallen,
census.integrationStage,week2.deadBearerMentions, per seed.
- LOUD: census.integrationStage -80% (baseline 15 -> current 3) on
  ALL 5 seeds. EXPLAINED — baseline artifact, not a game deviation:
  Game.integrationStage() returns 0–3 (progression.js:132–138), so a
  baseline of 15 is definitionally impossible; the baseline was seeded
  when the metric meant something else. Current 3 is Full Integration,
  the ceiling. The baseline value must be corrected to 3 when it is
  next re-done; it will LOUD on every run until then.
- LOUD: census.alive -84% to -94% (baseline 49 -> current 3–8) and
  "disappeared" (0) on 33505/33506. EXPLAINED — scale + extinction:
  baseline 49 is a large grown village; this panel's villages are
  small (7–11 alive at handoff), and 33505/33506 died out entirely
  (chain mantles cascading d63 / d74–75, livingRoster 0 at end,
  deaths.bearer 12/11). Not a bug.
- LOUD: deaths.bearer -80% (5 -> 1) on 33503/33504; +120–140%
  (5 -> 11/12) on 33505/33506. EXPLAINED — window length + churn:
  the 1s are truncated windows (villages ended at d+14/16 with the
  second bearer alive); the 11/12s are churn villages (12 and 11
  pickCtxs). Both ends are the panel's own mortality regime.
- LOUD: census.fallen -60% (10 -> 4) on 33503; +60% (10 -> 16) on
  33504/33506. EXPLAINED — same regime: fallen tracks window length
  and churn (ledger last-fallen 4 / 13 / 9 vs tele 4 / 16 / 16, the
  tele read is end-of-run).
- No LOUD on week2.deadBearerMentions on any seed (funeral echo
  healthy).
- Baseline NOT updated this run: per-seed values span 0–8 alive and
  4–16 fallen, so no single-seed value represents the panel; and the
  integrationStage baseline needs a definitional correction (15 -> 3),
  not a roll-forward. The next run should re-baseline from a stated
  panel (per-seed means), as r133 concluded.

## Seed-band freshness re-check (AGENTS.md lesson, landed mid-run)

A new AGENTS.md lesson landed during this run (Loop A 0915Z
dmground): a band named in ANY prior prereg is not fresh, and
freshness checks must grep ALL dated preregs plus forbidden-band
lists — not just the current day's evidence. This run's original
check (exact `"seed": 3350` empty across prior succession stdout
JSONs) was the narrow kind the lesson faults, so the band was
re-checked before landing: exact `3350[1-6]` across ALL preregs in
evidence/ (no matches), `335` across all journey-succession preregs
(no matches), and the forbidden-band mentions in Nov 1–2 sim preregs
(none names 3350x). The band 33501–33506 is FRESH. Two old Oct 14–15
sweep JSONs contain 33505/33508 as values (predation, trustcensus —
unrelated drivers, not prereg reservations); they do not contaminate
this panel. No correction commit needed.

## Files

- Prereg: evidence/2026-11-05/journey-succession-r137-prereg.md
- Driver: scripts/journey-succession-r137-20261105.js (r133 +
  BONDDAILY-BEARER, instrument only)
- Analyzer: scripts/analyze-journey-succession-r137-20261105.js
  (CAP-D14 + first/later-bearer split + trust-sorted pick rank)
  + evidence/2026-11-05/journey-succession-r137-analysis.txt
- Panel records: evidence/2026-11-05/journey-succession-r137-{33501..33506,33599}.{stdout.json,stderr.log,saydump.txt,tele-*.json}
  + transcripts journey-succession-r137-transcript-*.txt
- No src/js change this run. [needs-eyes] is NOT attached: instrument
  only, no feel change for Steve to playtest.
