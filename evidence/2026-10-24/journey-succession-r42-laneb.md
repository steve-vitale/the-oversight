# Journey succession r42 — THE SUCCESSOR'S LIFE (lane B, 2026-10-24)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
Seeds 23001–23004 (fresh band), competent policy, phase A 40d, scripted kill
via the REAL playerDeath ('a hushwolf') unless the mantle passed organically
in phase A, then 30d competent play as the successor. Death-aware stop.
Pre-registration: evidence/2026-10-24/journey-succession-r42-prereg.md
(written before any run). Instrument: scripts/journey-succession-r42-20261024.js
(adapts r41: 30d window, checkpoint done-sets so day-jumps cannot skip a
convo/ledger checkpoint, pre-death villager snapshot for parity, scholar
snapshots for function). Proof test:
scripts/test-journey-succession-r42-instruments-20261024.js (throwaway seed
23999, 5d+3d — ALL GREEN before the run; pilot showed parity equal, no
inherited abilities, machinery true).

## Headline
The successor LIVES as the scholar. On all 4 seeds the mantle passed cleanly,
the successor kept exactly their own build (parity equal, zero inherited
abilities), and over 30 days they earned: level-up progress, System voice,
Codex growth (plants +6..+14, skills +3..+8, abilities +4..+6), track XP
(+45..+74), and new abilities (1→4, 2→5 on the two tracked rosters). No
chain mantles, no village overs, all four successors alive at +30d. The
village protagonist survives its hero's death — this is the leg working.

## Verdicts (pre-registered, never re-scored)
- S1 scholar continuity: GO 4/4 (living successor at +30d, scholar day +30).
- S2 build parity: GO 4/4 (post-death scholar.abilities == successor's
  pre-death npcAbilities, sorted-equal; inherited list empty on all seeds).
  Note: 23001's successor later earned fusion_reactor + adrenaline_surge +
  lucky_rock as scholar — fresh earnings, not inheritance (the dead bearer's
  pre-death set was green_thumb/echo_location/cornered_rat/translator, no
  reactor; the reactor flag was never violated).
- S3 scholar function: GO 4/4 (levelUp true, System voice 29–37 lines,
  offer/grant lines 24–39, Codex growth on every axis, XP gain — on every
  seed, above the ≥3/4 bar).
- S4 continuity: GO 4/4 (living successor at +30d all seeds; chain mantles 0).
- S5 stay-green: GO (M1 funeral 4/4, M4 machinery 4/4, MG2 meal gate 0
  violations on 4/4 seeds / 120 audited successor meal-days).
- S6 people: GO (0 identity failures across 32 sense-read transcripts;
  wire trips 2, both grief false positives — see below; 1 weak transcript
  named, not hidden).
- S7 guardrail: GO (no fabricated-history hard failures; the office-voice
  class below is disclosed, not counted, because the instrument cannot
  verify the successor's own show history).

## Village assessment, in plain words
- 23001 — Stanley (d41, hushwolf) → Wanjiru (trust 62→70). 10 alive, 2
  fallen at d71. Pantry 20k→21.9k. Wanjiru earned her way from 2 abilities
  to 5. A steady village: the new bearer is more trusted at +30d than at
  the funeral.
- 23002 — Vivian (d16, organic combat death) → Marvin (trust 41→42).
  8 alive, 2 fallen at d46. Pantry dipped to 9.1k at d+14, recovered to
  20.5k. No voucher was eligible at the funeral (all trusts <60) — the
  vouch line correctly stayed silent; the funeral still beat, recovered,
  and buried cleanly.
- 23003 — Caitlin (d10, organic) → Addison (trust 28→20→21). 10 alive, 1
  fallen at d40. The discriminating case: a below-30 established successor
  ate full throughout (0 half-ration voices) — the r41 meal-gate ruling
  holds for the lowest-trust successor in the sample. But Addison did NOT
  climb: trust fell 28→20 by d+14 and flatlined. The village tolerates a
  low-trust bearer (full meals, no gating) without warming to them on its
  own in 30d. Social-design observation, not a bug — trust is earned
  through deeds, and this policy's deeds didn't earn it.
- 23004 — Moshe (d41, hushwolf) → Catalina (trust 60→66). 10 alive, 1
  fallen at d71. Pantry 41k→37k, the richest village. 6 vouchers eligible,
  vouch line fired. The cleanest funeral in the run.

## Meal audit nuance (not a gate)
Draw sizes vary wildly by seed (23001: all small, 131–500 kcal; 23002:
all full, 2000–2400; 23003: mixed, 111–2233; 23004: all full, 2200–2575)
with ZERO voices and ZERO violations everywhere, including trust-28
Addison. lastPlayerMeal is a per-draw figure, not daily intake — a small
draw is a nearly-full bearer at the meal (daytime eating), not a ration.
Future meal audits should not treat small draws as gating signal; the
voice is the gate, and it never fired for an established successor.

## People check (32 transcripts sense-read, 0 refused)
Meaningful: 30. Weak: 1 — 23001 d+15 Atlas: a stale-thread callback ("we
never did finish talking… 8 days back") that circles into deflections and
"forget it" without landing a want. Borderline-office-voice: the taken-you
lines (23002 d+14 Lucia / Sam: "They took you — The Guest, on the screens")
address show history to the successor that the instrument cannot verify
as theirs; and Atlas's recurring "I told you about the pods" speaks to
the office (the predecessor heard it), not the person. Disclosed as the
office-vs-person tension, not counted as fabricated history: the village
protagonist is the office, and the office did hear these things.
Strongest material: grief with behavior change (Lucia: "I sit apart to
eat at odd hours now"; Sam: "Nobody says Vivian's name right yet. We
will."); the uncollectible-favor motif ("X owed me a favor. I keep
thinking about collecting. Stupid." — Atlas, Sam, Austin, Donna across
seeds); secrets that push back when poked (Christian the veterinarian,
Bodhi the pottery instructor: "I confessed that already. I'm not
confessing it twice for dramatic effect."); real favors with honest
gates (Liam's wound: "Move next to them, on the same side of the Haven
door, to help"); gifts with consequence (Kurt's +4 wood/+4 fiber stash,
Donna's oiled tool); the successor as teacher (Pawpaw, Wild Strawberry,
Wild Onion, Elderberry, Maypop, Cattail, Rosary Pea taught across seeds).
Recurring pool tells (not failures): the "air before a storm" line spoken
verbatim by two villagers; the three-beat mourning template (burnt
piece / owed favor / name-not-right-yet); the "lost my train of thought"
scaffolding showing at conversation seams.

## Blank filled or documented
- DOCUMENTED (dialogue/social lane's, not fixed here): joint-foraging
  favors are offered but not playable. 23003 d+4 Austin: the engine
  honestly refuses instead of faking ("There is no playable joint
  foraging outing yet. Giving food does not perform the promised
  outing."). Honesty is correct per the no-fake-workarounds rule; the
  outing itself is unbuilt content. Building it is out of scope for a
  journey run — no code change, kill discipline applies.
- FIXED (test rot, not game code): check.js --only succession failed 1
  check on arrival (test-arena-cotaken-succession: expected arena-death
  cause 'combat', engine reports 'the arena'). The 'the arena' cause is
  the documented contract (gap #107, proven by
  scripts/test-gap-w4narr-engine.js); the cotaken mechanism itself
  (one death, right bearer, co-taken never bearer) was intact — all
  other 7 checks passed. Updated the one pinned string in
  scripts/godpath/test-arena-succession.js with a comment. After the
  fix: cotaken 8/8, check.js --only succession 11/11, gap-w4narr-engine
  ALL PASS (11), meal-gate proof 12/12. No src/js changed by this run.
- NOT fixed, instrument notes for the next run (diagnostic-only; verdicts
  rest on sense-reading + the meal audit, unaffected): (a) the identity
  tripwire false-positives on grief lines ("Vivian is gone and the world
  just… continues", "Stanley always took the burnt piece") — reminiscence
  about the dead is not misaddressing; the wire needs a grief exclusion.
  (b) The halfRationLines scan over-matches sickness-policy text
  (23004 d56 "half rations till it passes" is a triage choice, not a
  meal voice). (c) organicBurial was false on all seeds — the competent
  policy never buries organically; burial is completable (m1 true via
  the d+3 scripted burial), so this is a policy gap, not a game gap.
- BLOODRESTRAINT note (for the record, not re-litigated): the hook is
  dead on master (reverted by coordinator commit fa10e1ca8 per kill
  discipline). This run used default settings and did not touch it.

## Reachable / fun / winnable (leg 7)
- Reachable: yes — mantles pass through real deaths (2 organic, 2
  scripted-via-real-playerDeath) and the 30d successor life plays end to
  end on all seeds.
- Fun: yes — the successor's month reads as a life, not a caretaker
  stint: earning abilities, teaching plants, fielding grief, keeping
  secrets, holding the village together. The one weak transcript and the
  office-voice wrinkle are the exceptions in 32 reads.
- Winnable: yes for the leg — no successor died, no village scattered,
  pantries held, trust held or climbed except Addison's flatline (which
  is survivable, not a spiral).

## Metric review (for the NEXT run, not this one)
- S3's "any signal" bar was met 4/4 with room to spare; a future run
  could raise it (e.g. require a new ability earned, not just XP) now
  that the figurehead hypothesis is dead.
- The meal audit's smallDraw tally should be dropped or redefined —
  it measures fullness, not gating. The voice is the gate.
- The identity wire needs the grief exclusion before its count is
  quoted again; S6 stays a sense-read verdict until then.
- Addison's trust flatline (28→21) is the named next social question:
  what deeds, if any, climb a low-trust successor's trust in 30d?

## Telemetry
Telemetry check QUIET vs succession baseline (4 files, 5 metrics, no
large deviations). Baseline NOT rolled (quiet needs no roll).

## Infrastructure
Worktree journey2-succession, branch journey2-succession. Registration
took ~7 min (slow worktree checkout, same restat class as before — not
a failure). No EPERM flap observed this run. Heartbeat loop held
throughout (background loop, killed at closeout).
