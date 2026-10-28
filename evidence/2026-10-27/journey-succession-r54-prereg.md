# Journey succession r54 — SUCCESSOR INHERITANCE BASELINE (lane B, pre-registration 2026-10-27, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes the tackle-all item 5 question — "the taken-over villager must
feel purpose-made and intentional: the items they would have, the choices
they have made, their build — not a blank or reset character" — and measures
it on master BEFORE tackle-succession lands its build. Instrument only,
zero src/js changes. If blanks are found, they are documented for
tackle-succession, not fixed here: a competing Lane B succession change
would collide with the workstream that owns this item.

## The question

At the moment the mantle passes, what does the new bearer actually carry?
Three sub-questions, each answered from snapshots, never inferred:

1. ITEMS: where do the dead bearer's pack/worn items go — into the
   successor's possession, onto the corpse, into the pantry, to another
   villager, into the prep stash, or nowhere (vanished)?
2. KNOWLEDGE + BUILD: does the successor's scholar state at takeover equal
   their own pre-death NPC record (their lived life: their items, their
   plant knowledge, their skills, their abilities), the dead bearer's
   scholar state (inheritance), neither (blank/reset), or a mix?
3. TRUST: what is the successor's own trust entry before death, what is the
   office entry at takeover, and what was the dead bearer's trust at death
   (the r43 formula — 40% old office + 40% successor's own record + vouch
   bonus, floor 10 — is the reference, not the verdict)?

## Instrument (r53 driver + inheritance additions)

- snapshotVillagers extended per villager: pack item ids, worn item ids,
  plantKnowledge list, trust entry — so every mantle candidate's lived
  life is on record before the death, not just abilities/skills/know.
- Scripted path captures the dead bearer's full pre-death scholar state:
  pack/worn item ids, codex plant list, codex skill list, abilities,
  trust. Organic path cannot (death already happened at detection):
  organic seeds score successor-side only and are named, never failed
  for the missing dead-bearer side.
- Post-handoff + d+3 disposition maps: every dead-bearer pre-death item
  id located among successor pack/worn, bearer corpse items, pantry,
  other living villagers' pack/worn, prep stash — or VANISHED.
- Knowledge comparison: dead-bearer codex plants vs successor NPC
  plantKnowledge pre-death vs successor scholar codex plants post-handoff;
  same for skills (NPC skills pre vs scholar codex skills post) and
  abilities (existing r42 parity block).

## Seeds, regime, policy

Fresh band 26101–26105, competent policy, POST_DAYS=45, same mixed regime
as r53: 26101–26102 EARLY_KILL_DAY=5 (scripted day-5 kills), 26103–26105
EARLY_KILL_DAY=40 (mature staging aspiration; organic pre-emption
honored, per r50–r53).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- INH-READABLE (binds): a full handoff inheritance snapshot (dead-bearer
  side + successor side) on ≥4/5 seeds, OR successor-side readable on
  every seed with organic partiality named. A seed with neither side
  readable is a NO-GO on the instrument, not on the game.
- INH-BLANK (reported, NOT scored): per-seed classification — own-life,
  inherited, blank/reset, or mixed — with the counts that support it
  (items kept/transferred/vanished, plants kept/inherited, skills,
  abilities, trust pre vs post). This run is a BASELINE for
  tackle-succession; no pass/fail on the game follows from it.
- INH-ITEMS (reported): per-seed dead-bearer item disposition at
  handoff and d+3. Any VANISHED item is named with its id and seed —
  a vanished distinctive item (tool, armor, relic) is a finding for
  tackle-succession, not a silent gap.
- CARRIED REGRESSION (binds, r53 bars unchanged): SCRIPT 2/2 young;
  MATURE staging scripted-or-organic honored; V1 snapshot PASS-fired
  on snapshot seeds; C1v3 0 missing; W1d-tightened pooled ≥ 1/2;
  S1 0 missing bearerDeltaExact; MG2v2 0 violations; M3v2b ≥ 2 on
  ≥ 4/5 seeds; M1/M4 hold; chain mantles all cause-known.

## What would count as an interesting finding

- A successor arriving with an empty pack and zero plant knowledge
  despite a lived NPC life with items and knowledge (blank/reset class).
- A dead bearer's distinctive item vanishing from every scanned location
  at handoff (succession-loss class, cf. r48 armor thread).
- A successor knowing plants post-handoff they never knew as an NPC and
  the dead bearer did know (inheritance class — knowledge passing with
  the mantle, not with the person).
- A successor whose scholar state matches NEITHER their own NPC record
  nor the dead bearer's (a third state — e.g. fresh-start scholar
  defaults — which would mean takeover resets the person).

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's
manifest lists none); the mantle mechanics reference is the r43 trust
formula note in the driver header and ledger.js playerDeath. No canon
is invented here: the run reports what the machinery does.
