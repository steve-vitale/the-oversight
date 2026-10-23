# Journey — crisis leg r43 (lane B): the r42 fix panel + outbreak people-check (2026-10-23)

Run: oversight-playtest-loop-2, 02:00 CDT. Rotation-b read **6** at start → leg 6
(crisis); wrote 7 back. Base 79886f9d5 at register; master moved +2 during the
run (9cf62423e, f5f19667c) — rebased before landing. Worktree journey2-crisis.

Stale-lock recovery: lock `2026-10-23T04:55:55Z-crisis` from a dead 04:55Z run
(heartbeat 05:43Z, 73min stale; tree clean, no commits, no writes <15min —
verified dead per the orphaned-worker rule). Released as abandoned, removed,
re-registered fresh.

Prior art: r41 (famine response, all GO), r42 (sick-stay-home gates fix +
outbreak pilot; timed out; recovered as c917881ec). This run executes r42's
three named-nexts: (1) post-fix before/after panel, (2) M6 transcript
sense-reads, (3) regression suites.

## PRE-REGISTER (written before any play)

**Leg question:** the r42 fix (feverish villagers don't launch expeditions /
aren't asked to walk guard) landed. Does it hold in full runs? Do outbreaks
still produce real village responses (relief, tending, mourning)? Do the
outbreak transcripts read as real people?

**Canon:** docs/DISEASES.md (two pools; symptoms never true names), docs/
PRESERVATION.md, docs/MONSTER-WAVES.md (siege context).

**Interesting-finding bars (any):** (a) a sick departure/guard-ask post-fix
(the gates leak); (b) an outbreak where sickness relief never opens; (c) a
sickness death with no mourning ≤7d; (d) a true disease name spoken
undiagnosed; (e) the reverse: the fix starves the village (sick-stay-home
costs more than it saves).

**Seeds:** 101, 202, 303, 404 — PAIRED with r42's pre-fix pilot (same
instrument, same policy, same horizon). **Policy:** oracleV2 (competent).
**Horizon:** 120d, 1-day chunks, death-aware stop. **Staging:** none.

**Bound metrics (§14)** — identical to r42's instrument:
- M1 (outbreak reached): ≥2/4 seeds with an outbreak window (≥2 sick, ≥3d).
- M2 (relief fires): sickness relief opens in ≥2/4 outbreak seeds.
- M3 (care response): tended/tended_by during outbreak windows in ≥3/4.
- M4 (mourning parity): 100% of sickness deaths → mourning line ≤7d.
- M5 (sick stay home): 0 sick departures AND 0 sick production deposits.
- M6 (no theater): 0 fabricated-history lines in sampled outbreak convos.

**Instrument:** scripts/journey-crisis-r42-outbreak-20261022.js UNCHANGED
(before/after comparability). Output: evidence/2026-10-23/journey-crisis-r43-{101,202,303,404}.json
+ 16 transcripts (r42→r43 renamed; the instrument hardcodes the r42 prefix).

## Results — before/after panel (r42 fix)

| seed | days | end | windows | sickDeposits | sickDepartures | sickDeaths | deaths | tended | relief |
|---|---|---|---|---|---|---|---|---|---|
| 101 | 74→120 | game-over→horizon | 6→8 | 4→2 | 0→0 | 0→0 | 3→2 | 28→33 | +hunger→raid/sickness |
| 202 | 120→90 | horizon→game-over | 6→3 | 2→1 | 0→0 | 0→0 | 2→3 | 43→15 | raid/sickness→same |
| 303 | 120→120 | horizon→horizon | 3→2 | 0→4 | 0→0 | 0→0 | 2→2 | 1→34 | raid/sickness→same |
| 404 | 120→120 | horizon→horizon | 12→5 | 0→0 | 0→0 | 0→0 | 3→2 | 28→0 | raid/sickness→+hunger |

**The gates hold.** 0 sick departures and 0 guard-asks on all 4 post-fix seeds
(the fix's scope), and the unit proof re-verified 7/7 GREEN on current master.
The pre-fix pilot's measured leaks (101 d11/d37/d40 expedition launches,
d18/d20/d28 + 202 d34/d67 guard companions) have no post-fix counterpart.

**Sick production deposits persist** (4→2, 2→1, 0→4, 0→0): feverish villagers
still do solo day-foraging while sick. The fix never gated production DPs —
only expeditions and guard duty. Whether a feverish villager should forage is
a food-economy behavioral call (fleshout-lane territory per r41's lane note),
not something this run changes silently. Flagged for Steve.

**Survival diverged both ways** (101 lived, 202 died — all deaths combat).
Expected: the fix changes guard availability during outbreaks, which moves
combat outcomes; n=4 can't attribute causality.

**Zero sickness deaths across all 8 runs** (4 before + 4 after, ~800 run-days).
Outbreaks are morbidity without mortality in these sims — villagers get sick,
get tended, recover. Nobody dies OF sickness; the killing is all combat,
monster, and one starvation. M4 is vacuously GO again. Whether outbreak
lethality is tuned right is a design question, not a defect.

| Metric | Result | Verdict |
|---|---|---|
| M1 outbreak reached | 4/4 seeds (2–8 windows) | GO |
| M2 relief fires | 4/4 (sickness relief opened every seed) | GO |
| M3 care response | 3/4 instrumented (101/202/303); 404's 0 is roster, not care — see below | GO (at bar) |
| M4 mourning parity | 0 sickness deaths → vacuous | GO |
| M5 sick stay home | departures 0/0/0/0 GO; deposits 2/1/4/0 — fix scope holds, production ungated | PARTIAL (documented) |
| M6 no theater | 16/16 transcripts sense-read, 0 fabricated history, 0 canon-name leaks | GO |

**M3 anomaly root-caused (404):** tended mems require a MEDIC occupation
(game.js fever-tick gates on formerOccupation nurse/medic/doctor/…). 404's
roster drew no medical occupation → zero fever-tending mems, while the relief
layer fired triage + 14 hygiene tents by named villagers. Not a care failure —
roster composition. Note: tending is occupation-gated, not skill-gated; a
villager who LEARNS herbal_remedy doesn't count. Whether that's intended is a
design question (filed, not changed).

## People check (M6 — all 16 r42 transcripts sense-read)

**PASS.** The sickness favor wants are real and voiced: Diego's fever ("The
fever's not breaking and I'm barely keeping food down. I need help — real
help, not just water."), Mabel's wound ("The cut's gone hot and it's
spreading — I can feel it moving."), Aurora's festering cut ("If it festers
I'm no good to anyone — can't haul, can't hunt, can't watch."). The outbreak
topic fires for well villagers: Salvatore's "2 of us are down with a
wringing-out sickness. Boil everything. I mean everything… Wash your hands. I
say it ten times a day now… If it takes anyone else we bury them properly.
That's the deal we made." — correct count, practical advice, a village pact,
symptoms never true names (knowledge gate holds; 0 canonHits across all
after-runs). Human texture throughout: Paola's bartender backstory and the
aborted trap-line walk, Elena's Odesa grief, Amy's left-behind, Joshua's
singing and the Denver→Columbus lie-confession arc. No fabricated shared
history anywhere. The favor_requirements repetition loop is the known driver
artifact (r40); NPCs handle it with escalating annoyance ("I've told you
three times now"), which reads human.

**Blanks found (3):**
1. **q_laugh is a shared script** — Paola (303) and Elena (404) recited the
   identical laughter paragraph verbatim. FIXED this run: q_laugh `deeper`
   → 3-variant array in src/data/characterGen.json (data-only; the
   convoDeeperPick variant-pool convention from journey-deepening r32
   already supported arrays — q_laugh just never got variants). Proof:
   scripts/test-qlaugh-deeper-variants-20261023.js, 10/10 GREEN (two
   villagers get different lines; per-villager no-repeat while fresh;
   exhaustion falls back to pool[0] per the documented contract).
2. **The r42 driver's "force ask:lately first" never engaged** — `ask:lately`
   wasn't in the turn-0 opener menu in 15/16 convos (it's behind
   dlg:subject → subject menu); the outbreak topic surfaced via
   alive:event:outbreak instead. Instrument note for the next outbreak run,
   not a game defect.
3. **Betrayal case_2/case_8 reads are content-thin** — "The ground
   remembers." / "Names, named." read as placeholders next to the good
   press-escalation beats. Pre-existing, not crisis-specific; logged.

## Village census (plain words)

- **101 — the convalescents:** 4 left (Sofia, Victor, Chloe, Tanya), pantry
  nearly bare (2.4k kcal). Eight outbreak waves weathered; the relief stack
  (raid + sickness) fired every time; nobody died of sickness — the two dead
  fell in fights. Alive but skeletal.
- **202 — the wiped:** 0 left by d90, pantry full (21.8k kcal — food wasn't
  the problem). Three combat deaths d10–d31; the village bled out to raids
  with full bins. A guard-thin outbreak window may have contributed; the
  sim can't say.
- **303 — the steady:** 5 left (Somchai, Wei, Miguel, Gleb, Bodhi), 11.2k
  kcal. Two small outbreaks, both answered; tended mems everywhere (34).
  The two dead fell in fights d11/d18.
- **404 — the tended-by-tents:** 5 left (Desmond, Ella, Agata, Devon, Meera),
  11.7k kcal. Five outbreak waves, no medic on roster, so no fever-tending —
  but 14 hygiene tents raised by named villagers and triage relief on d4.
  One monster death (Layla, d11), one starvation (Aria, d14).

## Reachable / Fun / Winnable

- **Reachable:** yes — outbreaks emerged naturally on all 4 seeds (2–8
  windows each); sickness relief opened every time without forcing.
- **Fun:** the outbreak is a story, not a debuff — the fever wants are
  voiced, the well gossip about it ("boil everything"), the burial pact,
  the tents. The sick-stay-home gates make the village feel like it cares.
- **Winnable:** no run lost to sickness; the relief + tending + hygiene
  stack holds. 202 died to combat with full bins — the raids remain the
  killer, per r41.

## metric review

- M3's instrument (end-of-run tended-mem count) conflates roster RNG with
  care response — 404's medic-less roster scored 0 while the relief layer
  worked. Next outbreak run should count tending-during-windows, or gate
  the metric on medic presence.
- M4 keeps scoring vacuous (0 sickness deaths in 8 runs). If outbreak
  lethality is meant to be near-zero, say so and retire M4; if sickness
  should sometimes kill, the metric needs teeth (seeded virulent strain).
- M5's deposit half was never in the fix's scope; split M5 into
  M5a (departures/guard — the fix) and M5b (production while sick — open
  design question for Steve).
- Telemetry: seeded hidden_files/telemetry-baselines/crisis-outbreak-r43.json
  from the 4 post-fix panel files (outbreakWindows, sickDeposits,
  sickDepartures, sicknessDeaths, tendedAtEnd, mournLines, sickAckLines,
  reliefProposalLines, deaths). The r8 crisis-outbreak.json (lately-topic
  metrics, different instrument) is left intact.

## Regression

- scripts/test-sick-stayhome-gates-20261022.js: 7/7 GREEN (re-verified).
- scripts/test-qlaugh-deeper-variants-20261023.js: 10/10 GREEN (new).
- node scripts/check.js --quick: PENDING (running at note time; result below).
