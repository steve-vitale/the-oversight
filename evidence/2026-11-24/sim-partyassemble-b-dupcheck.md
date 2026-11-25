# sim-partyassemble-b — NON-DUPLICATION CHECK: DUPLICATE FOUND, ARM NOT BUILT

**Arm:** sim-partyassemble-b · **Loop B run:** fleshout-loop-b-20261125T0130Z
(axis winnability-chain) · **Type:** BUILD worker — stopped at the
pre-pilot substrate checklist (MEASUREMENT.md §14b) before any lever
code, prereg, or sims. **No lever built. No prereg frozen. No sims run.**

## Verdict: DUPLICATE — do not build

The assigned arm — a default-OFF lever making launched field fights
start with the full party on the field (allies present from round 1
instead of trickling in via the hopeless-shout ladder) — was already
built, piloted, and judged three hours earlier as **sim-allystart-b**.

| Item | Assigned arm (this brief) | sim-allystart-b (already done) |
|---|---|---|
| Finding | basedmg #2600, "ALLIES NEVER START IN THE FIGHT" | same finding #2600 (`evidence/2026-11-24/sim-basedmg-b.md`, DIAG-GO) |
| Lever shape | default-OFF env flag, full party from round 1 | `ALLYSTART=1`, `allyStartAtDoor()` in `src/js/villager-agency.js`, passes `allyFromStart: true` for any sensed allies (commit `15ff9f030`) |
| Mechanism | `fieldFight` door block (`src/js/fieldFights.js:1503`) | same door block — the lever only changes WHEN sensed allies enter, never how many can (third seat stays `ALLYSLOT3`-gated) |
| Band | 109501–109508, 150d death-aware | same band 109501–109508, 150d death-aware |
| Substrate | SENSEEXPED/PARTYSIZE4/VETREENGAGE/FLEEREPAIR2/FIGHTALLY2/FLEEGUARD on; FIELDCAPDMG/RAGEFREE/FREESTRIKE off | same substrate family (pre-fleeguard landing; fleeguard is a staying lever, not an arrival lever — no interaction with the arrival mechanism) |
| Prereg | `evidence/2026-11-24/sim-partyassemble-b-prereg.md` (not written) | `evidence/2026-11-24/sim-allystart-b-prereg.md` (commit `ba7ce0b09`) |

The only difference between the two briefs is the flag name
(`PARTYASSEMBLE` vs `ALLYSTART`). A rebuild under a new name would
re-spend a pilot on an identical lever on an identical band and
re-judge an already-judged concept. Per the brief's own instruction
("check the existing party branches' evidence for non-duplication")
and the loop's never-duplicate rule, the build stops here.

## What sim-allystart-b already proved (adopted, not re-run)

Evidence: `evidence/2026-11-24/sim-allystart-b.md`; adoption closeout
`ebc163fe8` ("allystart NO-GO evidence-only"); branch
`sim-allystart-b`, tip `ceb47d001`. **Branch is not to be merged on
this verdict (coordinator's call).** The lever lives only on that
branch — `grep ALLYSTART src/js/` on this worktree's master base
returns nothing.

**Verdict: NO-GO — kill-share bar missed (0.040 vs ≥ 0.15).**
§14a kill classification: **CONCEPT-DEAD (as a kill lever).**

| Bar | Ctl (ALLYSTART off) | Arm (ALLYSTART=1) | Bar | Result |
|---|---|---|---|---|
| Pool floor (engaged launched wave-4+ meetings) | n=27 | n=25 | n ≥ 10 | PASS |
| Kill share | 0.000 (0/27) | **0.040 (1/25)** | arm ≥ 0.15 | **FAIL** |
| Median damage/round | 25.7 | **80** | arm ≥ 60 | PASS |
| Starvation deaths (total / villager) | 1 / 0 | 0 / 0 | arm ≤ ctl+2 | PASS |
| Median survival | 142.5d | 150d | arm ≥ 0.8× ctl | PASS |
| Proof test / analyzer selftest | 31/31 / 10/10 green | — | green | PASS |

The mechanism fired perfectly (allies in from round 1 in 25/25
meetings, damage/round more than tripled, party deaths 7 → 1,
villages surviving to 150d 3/8 → 6/8) and still produced 1 kill in
25 meetings: fights end by the party fleeing with the monster at
~24% HP, because the party's HP runs out first. The binding
constraint moved to damage-per-survived-round vs monster HP and to
staying power — arm-2 toggle / flee-repair territory, not entry
timing. The allystart metric review says: if this lever is ever
re-judged, the primary bar should be damage/round (or wins incl.
monster flees), with kill share secondary — a coordinator/Steve
call, not a re-score of this run.

## Distinction record for the other named party branches (as the brief asked)

- **sim-launchparty-b** — `LAUNCHPARTY=1`: the meeting sense prefers
  the win-plan launch party. Formation/launch *choice* (which party
  launches), not fight-start arrival. Pilot NO-GO METRIC-BROKEN
  (zero trio launches on the band). Distinct.
- **sim-partyfunnel-a** — `PARTYFUNNEL` in `src/js/win-plan.js`:
  a seeded wave-4 hunt plan survives its holder's death via
  reassignment (party member / Haven successor) and a retarget holds
  a staged party. Plan *survival*, not fight-start arrival. Pilot
  NO-GO (launch-with-party 0.421 vs bar ≥ 0.50 and ≥ 2× ctl).
  Distinct.
- **sim-partysize-b** (allycap/recorder) — party *size*: how many
  fighters a launched party can hold (PARTYSIZE4 substrate, size-4
  share bars). NO-GO on B2 (size-4 mean share n=1 < 3 / 0.0574 <
  0.10). Size, not arrival timing. Distinct.
- **sim-tileparty-a** — tile-joining: party formation on tiles
  (`tileJoined` fields). Formation, not fight-start arrival.
  Distinct.
- **sim-allystart-b** — the fight-start arrival lever itself. **NOT
  distinct. This is the assigned arm, already built and judged.**

## Substrate checklist (§14b, pre-pilot — verified, then stopped)

- Ally-arrival mechanism confirmed addressable: `fieldFight`
  (`src/js/fieldFights.js:1503`, door block) already brings all
  sensed allies in from round 1 when `opts.allyFromStart` is true
  (AID, comms 2026-10-10); the shout ladder
  (`fieldFights.js:2957–3014`) is the trickle-in path it replaces;
  the launch call site is `villager-agency.js:916`
  (`allyFromStart: _pinDoor`, PINQUAD-gated). The lever's only job
  is widening that `true` from pinned trios to any sensed allies —
  exactly what `allyStartAtDoor()` does.
- No `PARTYASSEMBLE` code exists anywhere in this worktree
  (`grep -r` over `src/js scripts docs/MEASUREMENT.md`: zero hits),
  so nothing partial was left behind.
- Worktree base: `d6678e929` (Loop B 2230Z round record; includes the
  fleeguard landing the brief's substrate lists).

## Recommendation (coordinator's call, not this worker's)

- Strike this arm from the queue as duplicate of sim-allystart-b;
  the 2230Z queue entry predates or missed the 2130Z adoption
  closeout (`ebc163fe8`).
- The queue's next item stands: (2) flee-repair build / arm-2
  toggle — the allystart evidence names staying power and
  damage-per-survived-round as the moved binding constraint, which
  is that territory.
- If the entry-timing lever is ever revisited, re-prereg it from
  the allystart branch (damage/round primary, per its metric
  review) — do not re-issue it as a fresh build arm.

## Worktree state

- Branch `sim-partyassemble-b`, base `d6678e929`. Only new file:
  this note. No game code touched, no sims run, no prereg frozen.
- No claim file was written by this worker (the coordinator's run
  claim `fleshout-loop-b-20261125T0130Z.json` is the coordinator's,
  untouched). No lock touched.
- Infrastructure: write-flap probe (`git update-ref
  refs/heads/probe HEAD`) passed at run start (PROBE-OK); no flap
  recurrence during this run.
