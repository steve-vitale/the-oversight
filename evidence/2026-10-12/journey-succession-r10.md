# Playtest loop 2026-10-12 — journey leg 7: SUCCESSION r10 ("the successor's first week")

Rotation said 7; played it; writing 0 back. r9 (this morning) lived the
week AFTER a death — funeral, mourning. r5/r7/r8 proved the mantle
invariants. This run plays the NEW BEARER'S first week as a different
person, plus the leg's other bookend: the WIPE (last-survivor death).

## Blanks FILLED (worktree, proof-tested RED→GREEN before/after)

### F1 — the death pack silently destroyed duplicate items (ledger.js)
The pack deduped on itemId: a Bearer <redacted> a stone knife in hand AND a
stone knife in the pack left only ONE on the corpse — the second was
destroyed. The body didn't keep what it carried (Steve 2026-10-09
loot-as-action law). Fix (design call, in code): dedupe by object
identity — the same object listed twice (worn AND carried) still packs
once; two distinct copies both ride home.
Proof: `scripts/test-deathpack-dupe-20261012.js` — 4/4 GREEN (RED on
pristine: 2 knives → 1 corpse slot; the same-object-twice case packs once
on both). A same-named-item false positive in the first r10 probe
("Dispatcher's headset" in both the dead bearer's and the successor's
personal pools) was investigated and cleared — two different physical
items, no leak.

### F2 — the end-of-run screen was a slice-1 fossil that lied on a wipe (app.js, game.js)
`ending()` still showed "SEVEN DAYS", "Days: X / 7", and a "New expedition"
button that just went to the title screen. On a village WIPE it lied
twice: "The village remembers" (the village is dead) and "Someone else
will carry the journal next time" (nobody will). Table victories (day
100+) got the same "SEVEN DAYS" card. Steve's law: failure RESOLVES the
story, never deletes it.
Fix (design call, in code): `Game.status()` now exposes `villageLost`,
`lineage`, `endingFrame`; the screen renders the lineage — every Bearer <redacted>
the mantle, in order, names/days/causes — as the resolution.
- Won → the ending frame's name as the title ("THE BELOVED"), real day count.
- villageLost → "THE VILLAGE DIES OUT": "No one is left to pick up the
  Codex… The Codex closes. Nobody will carry it." The chain is the memorial.
- One honest button: "Begin a new village" → title.
Proof: `scripts/test-ending-screen-20261012.js` — 17/17 GREEN (RED on
pristine: 16 fail; engine-level wipe flags pass on both). ending() needs
DOM so the rendering proof is source-text assertions on the copy it
renders, stated plainly in the test header. `[needs-eyes]` — Steve should
see this screen on his phone.
Build-notes entry added (player-facing landing; pruned to 15).

## The successor's first week (3 seeds × post-System death → 8 days)
- 601: Morgan Velasquez (social_worker) d18 → Dorothy Fisher (army_medic,
  granted [triage, steady_hands]) → Dorothy died d23 (combat) → Polina
  Lebid (lawyer, trust 1). The chain holds across rapid deaths.
- 602: Marcus Webb d18 → Carmela Jordan (fisherman) → d18 combat →
  … → Sara Furuli by d26. 603: Miles Fuentes d18 → Sharmila Kisku
  (esl_teacher) → d22 combat → … → Marcus Webb (namesake) by d26.
- Inheritance audit (all seeds): integration stage carries (2→2, the
  office's); all System abilities pass (4/4 seed 601); background kit
  granted and `hasAbility`-visible (break-it r6 fix holds); trust
  discounted 60% exactly (15→9); successor's inventory is their own kit
  (≤5, bonded, owner=newId); death pack on the corpse, nothing
  auto-transferred; new body fresh (statuses 0, kcal 1500, wound 0); no
  second System arrival (systemArrived stays true, zero arrival beats);
  the MANTLE TRANSFER DETECTED beat fires once, addressing the office.
- Background USE (closes the r10 probe FAIL honestly): the probe searched
  `Game.actions()` for a triage-gated action — too narrow, triage gates
  `canDiagnose()`/`examineSick`, not an action card. Direct check:
  successor with triage → `canDiagnose()` true, `diagnoseOdds()` 0.7.
  The successor's past genuinely works — a medic Bearer <redacted> diagnose,
  a fisherman Bearer <redacted> fish. (Probe artifact, not a game bug.)
- Phantom-name scan: every post-death line mentioning the dead bearer's
  first name is a death/mantle line or the honest "you're not her" beat —
  nothing addresses the new Bearer <redacted> the dead name.

## The wipe (seed 604)
Last-survivor death through the real path: over=true, villageLost=true,
the beat ("No one is left to pick up the Codex. The village dies out —
quietly, the way villages do. The season ends here."), `wipe()` called
once, legend recorded `{outcome: 'village-lost', epithet: 'the
Assimilated', frame: 'assimilated'}`. The ending is resolved, not deleted.
(One probe artifact: my "roster-emptied" check ran before playerDeath
removed the bearer — fixed in the script, all 5 wipe checks green.)

## Village assessment (plain words)
Three villages, three-plus successions each, all still villages. The
mantle chain is mechanically unbreakable: bearers die fast (hushwolves,
boars, combat — the sim loop's lever question, flagged again), and each
new face steps up with their own past, their own kit, discounted trust,
and the village's full progression. Pantries stayed full, the codex kept
growing. The office persists; the person changes. That's the design, and
it works.

## People check (SENSE-TESTING LAW — full transcripts read raw)
- Eduardo Ramos (trail_crew, seed 601): opens on the Taken — his father
  Larry in the pods — teaches slope-reading for water "how their
  grandmother did it," asks the new Bearer <redacted> ask the System about
  the pods. No fabricated history with the new face.
- Emma Larsen (veterinarian, lowest trust): opens with her own want ("I'm
  not okay"), mourns Chloe by name ("Chloe is gone and the world just…
  continues"), closes honestly ("That's the whole of it. Sorry.").
- Zainabu Arday (esl_teacher): "Since Chloe died… I keep expecting to see
  Chloe at the fire. Stupid." Real names, the 10-day mantle tail working.
- James Okonkwo (carpenter): opens with his wound ("I still haven't found
  anyone"), the player commits to cleaning it, the naming debate has
  texture ("Kofi is pushing 'Big Ugly'"), closer earned: "This was good.
  They mean it."
- Villagers act like people: wants first, grief by name, honest endings.

## Reachable / fun / winnable
- Reachable: yes — death, inheritance, wipe, and the ending screen all
  fire through real paths (two natural mid-run successions exercised the
  chain with no script).
- Fun: yes — the successor's first week is a real new life: a medic
  Bearer <redacted> diagnose where a social worker couldn't, trust must be
  re-earned, and the village keeps your dead on its tongue.
- Winnable: yes for the leg — progression survives every death; the wipe
  is now an honest, resolved ending rather than a deleted story.

## Regressions (sequential, in worktree)
- New proofs: test-deathpack-dupe-20261012 4/4 (RED→GREEN),
  test-ending-screen-20261012 17/17 (RED→GREEN)
- test-ledger 93 passed, 2 failed — identical on pristine (pre-existing:
  you-are-not-her beat, keepsake-on-corpse; verified via stash swap)
- test-corpses 37/37 · test-bearer-recovery-20261012 19/19 ·
  test-mourning-name-r8 7/7 · validate-ontology 85/85 ("Release permitted")
- test-succession-inheritance 2 fails — identical on pristine
  (pre-existing) · test-mantle-memory-20261012 5/4 — matches r9 baseline

## Flags for other loops
- Sim loop: Bearer <redacted> still high (601: 2 bearers in 5 days; 602:
  3 in 8 days; 603: 3 in 8 days) — the chain holds, the rate is the lever
  question (re-flagged from r9).
- Break-it loop: test-ledger's "keepsake left with the corpse" fail
  encodes the OLD design (keepsake on corpse as loot) vs the current
  "sentimentals die with the owner" canon — test rot, worth a look.

Merged locally — "merged locally, pending ship" (ship loop owns pushes;
[needs-eyes] — player-facing ending screen + death-pack fix). Worktree
released; main tree clean; rotation → 0; lock deleted.
