# Journey-succession r34 (lane B) — "THE SUCCESSOR'S LEDGER" (2026-10-22)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** after the mantle passes mid-run, does the successor inherit
a CONTINUOUS game — or a ledger of orphaned obligations, phantom intents, and
evaporated knowledge? The machinery under audit (each with prior fix notes in
ledger.js / villager-build.js): open promises released at death; camp claim
lapsed; join released; feast-draw/rage/feastBuff/blood-price cleared; door-flee
monsters tagged to the dead bearer; the Codex passing whole (Steve 2026-10-14
"codex rule": the dead bearer's skills stay as the office's written
knowledge); the successor taking THEIR OWN abilities/XP/skills/knowledge
(Steve 2026-10-14: "You become that villager" — the dead bearer's abilities
die with them).

**Prior art:** r29 (chain machinery end to end); r30 (the close); r31/r33
(the office as social reality — answered); r32 (the funeral — silent by
design). r33 left one instrument fix (office-ack scan) and the design calls
for Steve (office visibility, funeral silence).

**Interesting-finding criteria:**
(a) orphaned promises / phantom intents -> REAL BUG (fix if small, else file).
(b) codex evaporation or ability/XP transfer -> REAL BUG.
(c) identity failures or fabrications -> REAL BUG.
(d) M1 fails on >=2/4 -> SUBSTRATE-MISSING, abort.

**Seeds:** 9901–9904 (fresh; r33 used 9801–9804). **Policy:** competent.
**Horizon:** phase A d1–9, thread plant, one forced favor+promise (real
machinery), pre-death ledger snapshot, scripted kill via the REAL playerDeath
('a hushwolf') ~d12–14, post-death +21d of REAL competent play as the
successor + sense-read convos d+7/d+14/d+21. Death-aware stop.

**Binding metrics:**
- M1: >=3/4 mantles pass (newId != oldId, linOk, moOk). Kill rule: >=2/4 fail -> SUBSTRATE-MISSING.
- M2: >=3/4 seeds — every pre-death open promise RELEASED by d+7
  (kept='released', inherited flag); no live promise/favor/seed pointing at
  the dead bearer.
- M3: 0 phantom-intent cases on all seeds (camp, join, pendingEncounter,
  feastDraw, rageActive, feastBuff, bloodPriceWound, door-flee bearing dead id).
- M4: 0 identity failures in post-death say log + full transcript reads
  (SENSE-TESTING LAW).
- M5: >=3/4 seeds — all pre-death codex entries persist (codex rule); the
  successor's abilities come from their own npcAbilities (no dead-bearer
  transfer); the successor's own knowledge is taught into the Codex.

## What happened

**M1: 4/4 GO.** Mantles pass clean with linOk + moOk everywhere, including
through ORGANIC bonus handoffs: 9901 Deirdre→Lorenzo d9 (combat) then
Lorenzo→Øystein d13 (scripted); 9903 Carmen→Hugo d12 (combat) then Hugo→Ray
d14 (scripted); 9904 Jenny→Greta d11 (dehydration), Greta→Terry d13
(scripted), Terry→Lorenzo d28 (lockjaw — a DISEASE death of a bearer,
mantle passed clean). 9902: Cameron→Landon, no organic handoffs. All
villages alive at horizon (6–8 living).

**M2: 4/4 GO** (9902 vacuous — forcing found no eligible need in 4 days;
ask-frequency, not a failure). 9901: the forced promise went to Øystein,
who THEN inherited the mantle — the r27 promisee-bearer edge case firing
in the wild: promise released + inherited=true, favor went 'moot' (not a
zombie 'asked' against himself). 9903/9904: promises released, favors
reverted to 'asked', repay seeds deleted. Zero orphans at d+7 and at end.

**M3: 4/4 GO.** No phantom projects on any seed at d+1, d+7, or end:
camps lapsed, joins released, no pending encounters/monsters, no feastDraw,
no rage, no feastBuff, blood-price zeroed, door-flee monsters correctly
tagged. The successor is never acted-upon by the dead body's intents.

**M4: GO** — 0 identity failures across 19 sense-read transcripts. The dead
are mourned by name (Deon on Cameron: "Cameron owed me a favor. I keep
thinking about collecting. Stupid." / Lorenzo on Greta: "The fire feels
smaller without Greta. The rest of us will have to be bigger."); the new
bearer is addressed as a new person ("You're one of the good ones. Don't
make me regret saying that out loud."). No fabricated shared history.

**M5: 4/4 GO** (one instrument fix, see below). All pre-death codex entries
persist on all seeds (30/30, 34/34, ...); breadth kept climbing post-death
(23→41, 25→45, 26→49, 29→48). The successor's own skills were taught into
the Codex at every mantle (2 skills each on 9901/9904); mantle-imported
plants recorded. Dead-bearer abilities died with them on 9901
(green_whisper), 9903 (beast_calm) — non-vacuous checks, both clean.

## The two instrument fixes

**1. m5 false positive -> grant-attribution fix (scripts only).** 9904
flagged no-ability-transfer at end: the dead bearer Greta held
`lucky_rock`; the successor held `lucky_rock` at d34. Root-caused via the
say dump: Greta earned it d13 (pre-death), TERRY independently earned it
d23 via the real System grant narration ("Ability gained: Lucky Rock"),
10 days after the mantle; LORENZO (third bearer after Terry's d28
lockjaw death) earned it again d30. Track pools are shared — ability-id
identity is not transfer. The instrument now attributes via grant
narration: a leaked id with a post-death "Ability gained" line is an
independent earn; FAIL only if it arrived with the mantle (present at
d+1) or appears with no grant line. Re-ran 9904 deterministically: m5
revised to GO, same trajectory. (Same class as r33's office-ack blind
spot: the instrument couldn't see the mechanism.)

**2. Identity tripwire exclusions (scripts only).** Two designed beats
tripped the naive name+you regex: the death-pack loot line ("You take ...
from Lorenzo" — honest corpse attribution) and the successor-grief beat
("You knew Hugo — not the office, the person"). Both are honest namings
of the dead, not identity failures. Excluded; the manual full read
remains the verdict per SENSE-TESTING LAW.

## The real bug: wound deaths missing from the memorial roll

**FOUND (r34, fixed in-worktree):** villagers who die of wounds in the
foraging-attrition path (game.js villageLives) got corpse + gossip + grief
line + Codex page — but were never pushed to `v.fallen`, the village's
memorial roll. 9902's Leo died d34 ("The wound was too much"); two
villagers mourned him by name on d35; the census read fallen=1. The
path's own comment claims "corpse, gossip, dead mark" — the dead mark
never landed. The hurtVillager path and playerDeath both push fallen;
the wound path was missed.

**FIX (src/js/game.js):** the same one-line guarded push, mirroring the
hurtVillager pattern, in all four death paths that had the gap:
- wound death (villageLives foraging attrition) — EMPIRICALLY OBSERVED
  (9902's Leo)
- thirst death (villageDrinks, non-bearer) — same gap by inspection
  (bearer dehydration routes through playerDeath, which already pushes)
- phoenix link (broken) and (released) — same gap by inspection (the
  'ash' variant already pushed; broken/released were missed)
**Proof:** scripts/test-wound-death-fallen-20261022.js — two scenarios:
(1) pins a villager's health to 1, ticks villageLives() to the wound
death (corpse-cause asserted to prove the path), asserts the fallen
entry — pre-fix: FAIL (reproduced); post-fix: green. (2) dries the
cistern, calls villageDrinks() with a 3-health villager, asserts the
thirst corpse + fallen entry — green post-fix. Re-ran 9902's journey:
census now fallen=2 (Leo counted), all metrics still green.

## Village assessment (plain words)

Four villages, all alive at the horizon. 9901: Deirdre fell in combat d9
→ Lorenzo → killed by a hushwolf d13 → Øystein (trust 18→22, the "you're
not her" beat territory); Carlos grieves the thread-plant NPC Jae, who
died mid-run — the village mourns its own, not just bearers. 9902:
Cameron → Landon d14; Leo the trapper works the pit line all run, dies of
his wounds d34; Ella and Deon both mourn him d35 ("Leo is gone and the
world just... continues"). 9903: Carmen → Hugo → Ray; Nadia (trust 59)
asks the new bearer to clean a festering wound, teaches back Mayapple,
grieves Zoltan the NPC dead. 9904: Jenny (dehydration) → Greta → Terry →
Lorenzo (lockjaw d28); three handoffs, the chain never wobbled; Tyrone
(trust 86) grieves Terry honestly. Codex breadth rose on every seed —
the Codex spans the village, not the individual.

## People check

19 transcripts read in full (SENSE-TESTING LAW). Verdict: villagers act
like people. Wants have meaning (Deon's "Are you going to stay? With us.
For real." — the new bearer is asked to commit; Nadia's festering wound
needing hands); options engage or deflect; endings resolve ("This was
good." They mean it.) or plant ("Walk my trap line with me?" / "I wish
we had longer. Soon, yeah?"). The grief template family is recognizable
across speakers ("X owed me a favor. I keep thinking about collecting.
Stupid." / "I keep setting out extra portions. Stupid.") — each instance
fires with TRUE names and TRUE losses (verified against corpses), but the
cadence is identical enough that a phone player will hear the template.
Not a bug; a style note for a future voice pass. No fabricated shared
history; no identity failures; the dead stay dead in every line.

## Blanks filled / documented

**1. FIXED (src/js): wound deaths missing from v.fallen** — proof test
green pre/post, journey re-run confirms census. Commit: this run.
**2. FIXED (scripts): m5 grant-attribution** — ability-id identity is not
transfer; grant narration attributes independent earns.
**3. FIXED (scripts): identity tripwire exclusions** — death-pack loot and
successor-grief beats are honest namings.
**4. DOCUMENTED (design call for Steve): "no playable joint foraging
outing yet."** Ella (9902 d35) invites the bearer on a pantry-run outing
("come with me and we'll fill packs before dark"); the engine honestly
refuses via the forage_help cant ("There is no playable joint foraging
outing yet. Giving food does not perform the promised outing."). Honest
per the no-silent-actions rule, but the INVITATION is an unfireable beat
— either the outing becomes playable or NPCs should stop inviting. Not
in DEAD-LEDGER; filing as a design call.
**5. DOCUMENTED (standing): the grief template cadence** — true names,
true losses, identical rhythm. A future voice pass could vary it; not a
correctness issue.

## Metric review

M2's bar held (9902 vacuous by ask-frequency — recorded, not re-scored).
M5's bar held after the instrument fix; the fix is documented above, no
metric revision proposed. No metric proved wrong. The wound-death fallen
gap was found THROUGH the leg's own census instrument — the ledger audit
works.

## Reachable / fun / winnable

- **Reachable:** the full chain (promise → death → release → re-ask;
  mantle → own-kit → knowledge import) fires in real play, including
  through organic disease/dehydration/combat bearer deaths.
- **Fun:** the successor's weeks read as a living village — grief beats
  with true names, redistributed work ("I'm picking up Leo's share"),
  confessions, teaching. The quiet after a death is the point, and the
  machinery doesn't break it.
- **Winnable:** neutral-to-positive — continuity machinery held on 4/4
  seeds across 7 total handoffs (3 scripted + 4 organic); Codex breadth
  rose everywhere; no run stranded.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json (4 per-seed sidecars,
metrics deaths.bearer, census.alive, census.fallen, census.integrationStage):
**2 LOUD lines, both investigated same-run:**
- `deaths.bearer swung 60%: baseline 5 -> current 8` — EXPLAINED: 4 scripted
  + 4 organic bearer deaths on these seeds (combat d9/d12, dehydration d11,
  lockjaw d28); every handoff passed M1 (linOk/moOk). RNG mortality variance,
  not a bug. (r33 saw 2 organic on its 4 seeds.)
- `census.fallen swung 90%: baseline 10 -> current 19` — EXPLAINED: (a) the
  r34 fix correctly adds wound deaths to the memorial roll (9902's Leo;
  the baseline was gathered under the undercounting code), (b) higher
  organic NPC mortality on these seeds — all villages survived (6–8 alive).
  Not a bug.
**Baseline NOT rolled** (r33 precedent: profile differs — 21d horizon here;
both LOUDs explained). Metric-review note for the next run: the
succession.json fallen baseline was gathered under the undercounting code;
expect structurally higher fallen henceforth.

## Regression

- New proof: scripts/test-wound-death-fallen-20261022.js — green post-fix.
- scripts/check.js --quick on the worktree (result in run log).
- Succession proof suites (inheritance, seed-inherit, grief) re-run on the
  new base (result in run log).

## Design calls for Steve

1. Joint foraging outings: NPCs invite the bearer ("come with me and
   we'll fill packs before dark") but the engine has no playable outing —
   the invitation is an unfireable beat. Make it playable, or stop the
   invitations.
2. Grief template cadence: true names, true losses, but one rhythm across
   speakers — a voice-pass candidate, not a bug.
3. (Carried from r33) The office after the funeral is conversational, not
   titular; funerals remain socially silent — both still your call.
