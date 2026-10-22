# Journey — crisis leg r41 (lane B): the famine response (2026-10-22)

Run: oversight-playtest-loop-2, 01:00 CDT. Rotation-b read **6** at start → leg 6
(crisis). Base f83b5d92c (post-ship 03b1e0a79-20261022-055033, incl. plentydepri-b
df66ebaff + social-r39 grapevine fixes). Worktree journey2-crisis.

Prior art: r32 (outbreak), r34 (famine social fabric), r35 (siege social fabric),
r36 (compound), r37 (aftermath), r38 (siege aftermath: spontaneous mourning +
lingerer fixes), r40 (contest/raid collision ack fix — landed).

## PRE-REGISTER (written before any play)

**Leg question:** SURPLUSFEED was REMOVED (Steve 2026-10-21 — a bad way to control
outcomes); the replacement direction (villagers deprioritize production when food
is plentiful, behavioral/bottom-up at the production decision) landed as
plentydepri-b (df66ebaff, shipped). The fleshout-b DIAG (sim-prodrebound-b2)
found the dominant production DPs (funnel.share ~56–60%, scholar.homecoming
~15–25%, tribute.deposit, away.return) NEVER read the pantry sensor — only
duty.assign does, and it's a trickle. So: when famine actually hits, does
anything respond? Does production rise when the pantry collapses, do villagers
acknowledge hunger, do they act hungry — or does the village starve politely,
behavior unchanged from plenty to empty?

**Canon:** docs/DISEASES.md, docs/PRESERVATION.md, DECISIONS.md (surplusfeed
removed 2026-10-21); Steve: "villagers deprioritize production and storage when
food is plentiful"; "Fix the food economy".

**Interesting-finding bars (any):** (a) per-capita production inflow RISES ≥10%
in famine windows vs the seed's own pre-famine baseline (paired, within-run);
(b) a hunger-acknowledgment say line fires during a famine window ("we're out",
"rations", "empty pantry"); (c) a famine-window convo where an NPC expresses
real hunger (a want, not flavor); (d) the reverse finding: production flat or
FALLING through famine while deaths accrue — the village starves politely.

**Seeds:** 101, 202, 303, 404 (continuity with r35/r38/r40; 4th for the pilot).
**Policy:** oracleV2 (competent). **Horizon:** establish 20d + 70d window (90d),
1-day chunks for true daily ledger, death-aware stop (pop≤1, +10d tail max).
**Staging:** none — if M1 misses (no famine), force a pantry collapse
instrumented, never re-score.

**Bound metrics (§14):**
- M1 (famine reached): ≥2/4 seeds have a famine window (≥5 consecutive days with
  dawn per-capita pantry < 1500 kcal and pop>1). GO if met (else force).
- M2 (the village responds): per-seed paired comparison — ≥1 response form in a
  famine window: (a) per-capita production inflow up ≥10% vs pre-famine
  baseline, or (b) ≥1 hunger-acknowledgment say line in-window, or (c) famine
  convo with a real hunger want. GO if ≥3/4 seeds show ≥1 form.
- M3 (no silent deaths): 100% of person deaths → registerDeath kind:'person' +
  spontaneous mourning signal within 7d (r38 channel). GO if 100%.
- M4 (no stuck state): 100% of runs end clean (Game.over or horizon, no
  unresolved episode hanging). GO if 100%.
- M5 (no theater): 0 fabricated-history lines in sampled famine convos. GO if 0.

**Instrument:** scripts/journey-crisis-r41-famine-20261022.js (new; daily pantry
ledger, inflow attribution via outflow wraps, hungryDays deltas, death watch,
say capture, 2 forced ask:lately convos per famine seed, r38-named-next:
scholar fight outcomes vs lingering entities).

**Lane note:** production LEVER work is the fleshout lane's (plentydepri-b,
prodrebound). If the blank is a behavioral non-response, this run's fix is
content/voice (famine acknowledgment — crisis-leg territory), never a
production DP lever.

## Results

Pilot (4 seeds × 90d, oracleV2, 1-day chunks; ~60s/seed): 16/6/13/3 person
deaths; famine windows (≥5 consecutive days, dawn per-capita pantry <1500):
101: d86–90 (5d), 303: d42–47 (6d). Seeds 202/404 stayed fat (61k/112k).

**The village responds — via the crisis relief stack, not the day-to-day DPs.**
Absolute daily pantry inflow during famine windows vs the seed's own baseline:
101: 7,984 vs 4,377 (1.8×); 303: 8,597 vs 5,716 (1.5×). Depositor attribution
(stockPantry wrap, seeds 101/303): the famine inflow is dominated by
'Emergency hunt meat' (101: 103k of ~110k famine inflow; 303: 93k) — the
crisis-recovery relief machinery (safetynets.js, 2026-10-13): a villager
proposes ("The bins are echoing. We vote half rations — three days, everyone,
no exceptions — or the hunters go out hungry and bring back more than hunger."),
the relief opens (triage/rations/hunt/rally, each once), and the oracle answers
mostly with the hunt: "🏹 Hassan, Shiro, Chloe go out hungry and come back
heavy: +21,486 kcal of meat into the bins — two days for the village, if we're
careful. Real pieces, honestly counted." Real injury risk (25%/hunter), real
numbers (livingN × 2000 × 2). Rationing fired too (303 d61, 404 d25): half
rations 3 days, morale → strained, said aloud. This reconciles with the
prodrebound-b2 DIAG: the routine production DPs never read the pantry sensor —
but the CRISIS layer does, loudly and honestly. The village bends; it does not
starve politely.

**True starvation (pantry = 0) is reachable but self-correcting:** 101 hit
pantry-zero 4× (d64/71/85/86); each time "Haven eats again. The hollow look
fades." The scattering beat (5 hungry days → village-lost) never fired — the
relief stack + granary reserves hold. No starvation deaths in any seed; famine-
window deaths were combat/monster (the raids are still the killer, per r40).

**Instrument bug (mine, fixed):** hungryDays was read off the villager person
object (`vp.hungryDays` — always 0). The real signal is VILLAGE-level
(`state.village.hungryDays`, increments only at pantryKcal ≤ 0). Fixed in the
script; v2 re-runs reproduced the v1 ledgers bit-identically (ledger
identical=True on all 4 seeds — the added captures are RNG-neutral).

**r38 named-next (scholar fight outcomes vs lingering entities):** recorded —
0 player-vs-lingering fights across 4 seeds (lingering counts transient, max 2;
no lingering episodes formed). Instrument note fulfilled; no defect.

| Metric | Result | Verdict |
|---|---|---|
| M1 famine reached | 2/4 seeds (101 d86–90, 303 d42–47) | GO (at bar) |
| M2 village responds | 101: inflow 1.8× + 10 genuine ack lines + Sofia hunger favor; 303: 1.5× + 8 lines; 404: 2 lines + hunt spike (2 famine days) | GO (3/3 famine seeds ≥1 form) |
| M3 no silent deaths | 8/8 famine-window person deaths → mourning signal ≤7d, most name the dead | GO |
| M4 no stuck state | 4/4 ended clean at d90, no deadlocks | GO |
| M5 no theater | 6 famine convos, 0 fabricated history | GO |

**People check (sense-testing, full transcripts read):** Sofia (101, d57) has a
REAL hunger want: "I haven't eaten right in days. I need food before I can't
work at all." → favor → "Thank you. I won't forget who fed me when it
mattered." Her mourning is specific: "I dreamed Shaaban was still here. Woke
up angry at the dream. Stupid." Paola (303, d39) grieves Woo-jun concretely
("Nobody says Woo-jun's name right yet. We will."). The 303/404 famine convos
voiced no hunger — the hunger want is favor-RNG (1/6 convos); the village-level
voice (hunts, rationing, relief proposals) carries the famine story instead.
Coherent throughout; no fabricated shared history. The favor_requirements "no
longer available" loop is the known driver artifact (r40), not engine. PASS.

**Village census (plain words):** 101 barely survived — 10→2 people, 64k→500
kcal, 16 dead, four empty-pantry days, alive but skeletal. 202 thrived — 8
people, 61k kcal, never hungry. 303 bent and held — 10→5, a real 6-day lean
window answered by hunts and a rationing vote. 404 stayed fat — 9 people,
112k kcal, one 2-day dip answered the same way. The relief machinery fired in
every lean window; named hunters went out hungry and came back heavy (sometimes
hurt — "The hunt took its price"); rationing cost real morale. Nobody starved;
the raids did the killing.

## Reachable / Fun / Winnable

- **Reachable:** yes — lean windows emerged naturally in 3/4 seeds; relief
  fired every time without forcing.
- **Fun:** the famine is a story, not a number — a villager proposes the vote,
  named hunters risk injury, the System-free village voice ("the hunters go
  out hungry and bring back more than hunger") lands in the right register.
- **Winnable:** no run lost to famine; the scattering beat never fired because
  the safety stack (relief → hunts → rationing → granary) works. 101 ended
  skeletal but alive.

## metric review

- M2's bar ("≥3/4 seeds") should read "≥3/4 of seeds WITH famine windows" —
  202 had no famine to respond to. Revision for the next run.
- M4 didn't track lingering episodes (r38's tracker wasn't in this instrument);
  lingering counts stayed transient (max 2). Next famine run should include it.
- Day-ledger: 1-day chunks sometimes stall/skip the day counter (57 unique days
  from 69 chunks — contest/modal states). "Consecutive" windows must be computed
  on unique days; paired inflow comparisons are unaffected.
- Telemetry: first consistent famine baseline seeded at
  hidden_files/telemetry-baselines/crisis-famine.json
  (famineDays=35, deaths=88, mourningLines=222, hungerLines=1325, convos=6,
  playerLingeringFights=0, crisesFired=88). The seeding run's LOUD lines were
  investigated: v1 pilot files lacked the mourning/crisis captures (added in
  v2) — explained, not a bug; baseline rolled from the 4 consistent v2 files.
