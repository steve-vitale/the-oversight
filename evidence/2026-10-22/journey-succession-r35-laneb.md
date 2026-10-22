# Journey-succession r35 (lane B) — "THE SUCCESSOR'S OWN LIFE" (2026-10-22)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** r34 proved the handoff MACHINERY passes clean (promises
released, codex persists, identity holds, 4/4 mantles). Now the player-facing
question: is the successor's own life worth playing? After the +21d horizon
where r34 stopped, does the second life become its OWN story — new promises,
new bonds, an advancing arc — or does it coast on the predecessor's engine
while the social fabric keeps orbiting the dead?

**Seeds:** 9901–9904 (same as r34: deterministic reproduction of the pre-death
trajectory under the merged base + extension to +45d). **Policy:** competent.
**Horizon:** phase A d1–9, scripted kill via the REAL playerDeath
('a hushwolf') ~d10, post-death +45d (~d55). Death-aware stop.

**Binding metrics:**
- M1: >=3/4 scripted mantles pass (newId != oldId, linOk, moOk). Kill rule:
  >=2/4 fail -> SUBSTRATE-MISSING.
- M2 (own story): on >=3/4 seeds, the scripted successor accumulates >=1 of:
  (a) a promise THEY made (maker===newId, day>deathDay), kept or open;
  (b) a NEW bond (day>deathDay) or DEEPENED bond involving them.
- M3 (arc continuity): progState arc at d+45 >= arc at death-day, >=3/4.
- M4 (the village holds): >=3/4 seeds alive at d+45 with >=3 living AND
  successor trust at end-of-tenure >= trust at death.
- M5 (people check): 0 identity failures across sense-read transcripts
  (manual verdict, SENSE-TESTING LAW).

**Interesting-finding criteria:** (a) second-life stall (breadth flat AND no
new bonds AND no kept promises d+21..d+45) -> REAL content blank; (b) M3 miss
while village thrives -> office/business mismatch BUG; (c) social fabric
orbiting the dead at d+35/d+45 reads -> design note.

**Instrument:** scripts/journey-succession-r35-20261022.js (new; r34-derived:
same phase-A/kill/harness, +45d horizon, promise/bond/arc/trust ledger,
convos at d+28/d+35/d+45, identity tripwire, NO_KILL=1 counterfactual mode,
DUMP_SAY).

## What happened

| Seed | Scripted death | Successor | Tenure end | Village end | M1 | M2 | M3 | M4 |
|------|---------------|-----------|------------|-------------|----|----|----|----|
| 9901 | Lorenzo→Marcus d10 | Marcus | d21 (village scattered) | DIED d21 (4 alive) | GO | MISS | GO (2→3) | MISS |
| 9902 | Cameron→Landon d9 | Landon→Sean d14 | Landon STARVED d14 | SURVIVED (9 alive) | GO | MISS | GO (2→3) | GO |
| 9903 | Carmen→Hugo d10 | Hugo→Hunter d23 →Stan d53 | Hugo contest d23 | SURVIVED (8 alive) | GO | MISS | GO (2→3) | GO |
| 9904 | Jenny→Greta d10 | Greta→Wyatt d19 →Terry d25 | Greta STARVED d19 | SURVIVED (8 alive) | GO | MISS | GO (2→3) | GO |

**M1: 4/4 GO.** Every scripted mantle passes clean (linOk + moOk).
**M3: 4/4 GO.** Arc 2→3 on every seed — the office advances under each
successor; no arc stall.
**M4: 3/4 GO.** 9901 scattered; the other three held 8–9 alive.
**M5: GO (manual).** 12 succession transcripts sense-read (9902/9903/9904;
9901's transcripts are from the NO_KILL counterfactual — excluded, see
instrument note). Villagers address each bearer as themselves; the dead are
mourned by true name; the 3-handoff chain (9904: Jenny→Greta→Wyatt→Terry)
ends with Tyrone calling Terry "family now. Chosen family." No identity
failures. The social fabric re-weaves around each new face.
**M2: 0/4 MISS** — see metric review.

## THE FINDING: the succession trust trap (2/4 successors starved)

**Landon (9902) starved d14, five days after taking the mantle. Greta (9904)
starved d19, nine days after.** Root-caused end to end:

1. The trust inheritance (blitz-succession 2026-10-13) lands the successor at
   18–24: Landon 24, Greta 23, Marcus 18, Hugo 22.
2. The village meal gates on ABSOLUTE trust (game.js:27964): trust < 30 →
   half ration (1000 kcal vs the ~2000 a bearer needs). All four successors
   were below the line.
3. The 1000 kcal/day deficit compounds. Landon ate beans + foraged unknown
   plants (inedible) — the competent policy TRIED — and died in 5 days.
4. **The pantry was NOT empty.** 9902's meals were +1126/+1298/+1171 kcal on
   the days Landon starved. The SAME DAY Landon died (d13), Sean (trust 30)
   took the mantle and got **+2000 kcal full rations**. 9904: Greta starved
   d18; Wyatt (trust 30) got **+2014 kcal** that same day.
5. The trust chain shows the system "fixing" it by letting them die: each
   subsequent bearer has HIGHER trust (24→30, 22→49→60, 23→30→37) — the
   vouching + own-record machinery works, but the first successor pays with
   their life.

**The incoherence:** the village CHOOSES the successor (highest trust —
"the village chooses. Trust decides.") and hands them the Codex, then the
meal system says "we don't trust you yet" and feeds them half rations while
the pantry holds food. The #1 most trusted villager is simultaneously
"most trusted" (relative, chosen) and "untrusted" (absolute, <30). The
fiction ("you'll have to earn this face") is coherent; the OUTCOME
(starvation in 5–9 days while the pantry is stocked) is a death spiral with
no on-ramp — a starving bearer can't earn the trust that would feed them.

**Disposition: DOCUMENTED as a design call for Steve (not fixed in-worktree).**
The "earn this face" intent is deliberate (blitz-succession comment: "The
office gets a floor of 10 (a hearing); the person earns the rest"). The bug
is the INTERACTION between two separately-designed systems (trust
inheritance × trust-gated meals), not either system alone. Candidate
directions (Steve's call): (a) the office feeds its bearer (full rations for
the Codex-bearer; trust-earning moves to pantry access/vouching); (b) the
inheritance lands ≥30 when the predecessor was well-trusted; (c) a 7-day
grace period ("the village feeds its chosen while they find their feet").
Per KILL DISCIPLINE (2026-10-21): the lever (trust-gated rations) isn't wrong
in itself — it's wrong in combination with succession. Root-caused; lever
confirmed as the wrong INTERACTION, not the wrong system.

## The 9901 scatter (observation, not a bug claim)

9901's village scattered d21 under Marcus ("Haven couldn't hold... The
scattering, again"); the NO_KILL counterfactual (same seed, Lorenzo lives)
survived to d55 (7 alive, breadth 24→64, trust 17→65). BUT the RNG stream
diverges after d10 (different code paths consume Math.random differently),
so the bearer is NOT proven causal. The famine itself was organic — BOTH runs
hit the hunger winter d14 (crisis leg's territory; r41 studied famine
response this morning). Documented as a trajectory observation. Notably,
Marcus held a 13,500 kcal unprepared burdock harvest in his pack on d21
while the pantry sat empty — the scatter check reads pantryKcal only.

## Village assessment (plain words)

Four villages, three alive. 9901: Lorenzo fell to the scripted hushwolf d10
→ Marcus (trust 18); the hunger winter came d14; villagers starved one by
one (Øystein, Jae, Farid, Hunter); the village scattered d21 with 4 left
standing. 9902: Cameron → Landon d9; Landon starved d14 on half rations;
Sean (30) steadied the village; 9 alive at d55. 9903: Carmen → Hugo d10;
Hugo fell in a contest d23 → Hunter (49) → Stan (60) after "the night" d53;
8 alive, the trust chain climbing with each handoff. 9904: Jenny → Greta
d10; Greta starved d19; Wyatt (30) fell in combat d25 → Terry (37); 8 alive,
Terry "family now." The Codex kept growing everywhere (breadth +37 to +49);
the arc advanced under every bearer. The villages that survived did so with
rising trust and a deepening Codex — the office outlives every bearer.

## People check

12 transcripts read in full (SENSE-TESTING LAW). Verdict: villagers act like
people, and the re-weaving works. Deon (trust 90) talks regrets with Sean —
real Cape Town mornings, a real Sunback defense, teaching Purslane, ending
"This was good." They mean it. Tyrone tells Terry (third bearer) "You're
family now. Chosen family — the kind that actually counts" and "Trust is slow
out here. It's the one thing the System can't grant us." Wei mourns Hunter
("Hunter owed me a favor. I keep thinking about collecting. Stupid." — the
grief cadence r34 noted, true name, true loss) while engaging Stan. No
fabricated history; no identity failures; the dead stay dead and the living
are met as themselves. The 9901 transcripts are excluded (NO_KILL
counterfactual — Lorenzo's village, not a succession).

## Blanks filled / documented

**1. DOCUMENTED (design call for Steve): the succession trust trap** — 2/4
successors starved on half rations while the pantry held food; the trust
inheritance systematically lands below the meal's <30 full-ration threshold.
Mechanically proven (same-day ration flip on successor death). Not fixed:
the "earn this face" intent is deliberate; the fix is at the interaction
point, Steve's call.
**2. DOCUMENTED (metric review): M2 misfit** — see below.
**3. FIXED (scripts): transcript filename collision** — the NO_KILL
counterfactual overwrote the kill run's transcript filenames; now suffixed
`-nokill`.
**4. BUILT (scripts): NO_KILL counterfactual mode** — SEED=9901 NO_KILL=1
replays the run without the scripted death; the 9901 kill/no-kill pair is
the instrument that separated the organic famine from the succession
trajectory.

## Metric review

**M2 as defined does not fit this leg.** It demanded promises/bonds from
successors whose tenures were 3–12 days (cut short by organic deaths),
while favor asks are ask-frequency-rare (r34: "no eligible need in 4 days")
and bonds need time. The successors DID act as bearers — duty assignments
(📋), garden coaxing, fights — on every seed; they just didn't live long
enough for the social ledger. **Proposed revision for the next run:** M2
measures *bearer agency* (duties assigned, abilities used, deeds logged)
rather than *social ledger* (promises/bonds), OR restricts the social-ledger
bar to successors surviving ≥14 days. No metric was re-scored mid-run; M2
stands as MISS under its registered definition.

M1/M3/M4 held. No other metric proved wrong.

## Reachable / fun / winnable

- **Reachable:** the full chain (death → handoff → second life → second
  handoff) fires in real play, including 3-deep chains (9904) and
  starvation/contest/combat successor deaths.
- **Fun:** the second lives read as lives — Deon's regrets, Tyrone's chosen
  family, Wei's grief. But the trust trap poisons it: 2/4 successors starved
  before their story started, and 9901's village scattered. A successor who
  dies in 5 days isn't a second life, it's a footnote.
- **Winnable:** conditional — 3/4 villages survived to d55 with advancing arcs
  and climbing trust, but the trap makes succession a coin flip on the
  successor's starting trust. If Steve keeps "earn this face," the early
  days need an on-ramp or the village keeps burying its chosen.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json (schema mismatch on
paths — r35 JSON uses end.* not census.*; compared manually):
- `deaths.bearer`: baseline 5 -> current 10 — LOUD, EXPLAINED: +45d horizon
  (vs r34's +21d) captures 6 organic bearer deaths; 2 were the trust-trap
  starvations. Not a code bug.
- `census.fallen`: baseline 10 -> current 19 — LOUD, EXPLAINED: longer
  horizon + r34's wound-fix (structurally higher fallen, per r34's own
  metric-review note) + 9901's 8-fallen scatter.
- `census.alive`: 49 -> 29 — quiet (0.59×, just under the 0.6 band);
  driven by 9901's scatter.
**Baseline NOT rolled** (different horizon profile; both LOUDs explained).

## Regression

- scripts/journey-succession-r35-20261022.js: 4/4 seeds complete, deterministic
  (9901 reproduced byte-identical across 3 runs).
- `node scripts/check.js --quick` on the worktree (tooling-only change; result
  in run log below).

## Design calls for Steve

1. **The succession trust trap** (above): the village's chosen bearer
   starves on half rations while the pantry holds food. Directions: (a) the
   office feeds its bearer; (b) inheritance lands ≥30; (c) 7-day grace
   period. 2/4 successors starved; mechanically proven.
2. (Carried from r34) Joint foraging invitations: NPCs invite the bearer on
   outings the engine can't play — make playable or stop inviting.
3. (Carried from r34) Grief template cadence: true names, true losses, one
   rhythm — voice-pass candidate.
4. (Carried from r33) The office after the funeral is conversational, not
   titular; funerals remain socially silent.
