# Journey: succession leg (7) r20 — the mantle passes, and the village names its dead (2026-10-16/17)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 7 — succession, r20. Fresh angle: **THE MANTLE MECHANICS** — never
  journey-tested as a forced, instrumented succession: the real `playerDeath`
  handler at day 14 (post-System), then 13 days of the successor's life.
  r15/r16 covered natural successions; r19's 12 scholar deaths showed the
  mantle passes constantly in sims but never assessed what the successor
  inherits or whether the village treats them as a new person.
- **Leg question:** When the bearer dies and the mantle passes, does the
  village treat the successor as a NEW PERSON with their own life — or as a
  reskinned player? Do villagers mourn the old bearer by name, does the
  successor keep the village's Codex knowledge, and does the new bearer have
  their own kit (Steve 2026-10-14: "You become that villager")?
- **Interesting finding criteria:**
  - (a) mantle mechanics clean: new bearer ≠ old, lineage entry with cause,
    corpse with death pack, burial ≤3d, "you're not X" beat;
  - (b) successor conversations SENSE-verified: mourning by name, or the
    successor treated as a new person;
  - (c) knowledge continuity: village codex plants-known post ≥ pre;
  - (d) any gap: grief-silence, identity confusion, inventory/ability leaks.
- **Seeds:** 2026, 2031, 2042 (fresh; r15 used 731/732/733, r16 used
  48/37/5/71, r19 used 1717/1828/1939). Policy: competent.
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — mantle passes cleanly (new bearer, lineage entry,
    corpse + death pack, burial by day 20, game not over).
  - M2: ≥2/3 seeds — ≥1 of 3 successor convos SENSE-carries the death
    (named mourning) or the successor-as-new-person.
  - M3: ≥2/3 seeds — village codex plants-known post-death ≥ pre-death.
- **Kill rule:** mantle fails to pass (no successor / over / softlock) on
  ≥2/3 seeds → SUBSTRATE-MISSING; document and move on.
- **Horizon:** kill at day ~14 (post-System arrival day 7/8, established
  act-0), successor played to day 27 (+13d). Death-aware: village
  dead/scattered → stop (no seed hit this).
- **Method:** scripts/diag-succession-r20-20261016.js — the REAL playerDeath
  handler mid-run (not a mock), competent policy before/after, per-seed
  census pre/mid/end, mantle-mechanics verification (lineage, corpse, death
  pack, burial, successor kit), 3 driven conversations with FULL transcripts
  (fresh-grief d14, settling d20, two-weeks-on d27), SENSE-read by the
  analyst.

## Metric review (§14)

- **M1: HIT (3/3).** Carmen→Gloria (2026), Esperanza→Pamela (2031),
  Chester→Renee (2042). Lineage entries with cause on all 3; corpses found
  with death packs (4/7/9 items — the body keeps what it carried); burials
  complete by day 20 on all 3 (pendingBurials → 0); no game-overs. Successor
  chosen by trust (highest-trust NPC). Successor abilities 1 each at
  takeover, 0 carried from the old bearer — "you become that villager"
  holds (Steve 2026-10-14).
- **M2: HIT (2/3).** 2026: the day-20 convo carried mourning ("Carmen is
  gone and the world just... continues. That's the part I can't stand.").
  2031: the fresh-grief convo carried NAMED mourning ("Since Esperanza
  died... I keep expecting to see Esperanza at the fire. Stupid." +
  "Nobody says Esperanza's name right yet. We will. Give it a few days." +
  "I sharpen sticks down to nothing for Esperanza, now."). 2042: 0/3 —
  the village was mid naming-debate about "Hummice" (see observation 2).
- **M3: HIT (3/3).** Codex plants-known: 13→15, 15→19, 15→16. The office's
  Codex passes intact; the village keeps teaching (Adaeze taught Goji Berry
  on d26 "without you lifting a finger").
- **Kill rule:** not triggered — the mantle passed cleanly on all 3 seeds.

## Run log

### Seed 2026 — Carmen [plumber] → Gloria [librarian] (d14, the expedition)
12 living pre-death, pantry 41k. Gloria chosen (highest trust). Death pack
4 items. Buried by d20. End d27: 11 living, pantry 104k, plants 15, Gloria
has 3 abilities (grew her own kit from 1). Fresh-grief convo (Dwayne):
want=seek_comfort — he grieves without naming (the want system carries the
grief; the lately topic didn't surface — driver picked comfort 7×, see
observation 3). Settling convo (Landon): mourning by name + the taken-uncle
want resolved as promised ("You'd do that? Ask it? ...Thank you.").

### Seed 2031 — Esperanza [interpreter] → Pamela [glazier] (d14)
12 living, pantry 65.5k. Death pack 7 items. End d27: 11 living, pantry
62k, plants 19, Pamela 4 abilities. Fresh-grief (Giuseppe): the run's best
succession transcript — named mourning, the village self-conscious about
the new bearer ("Nobody says Esperanza's name right yet"), grief-as-action
("I sharpen sticks down to nothing for Esperanza"), and the obligation
transfer ("I asked Esperanza about the pantry run — Esperanza's gone. Still
need hands. Are you in?").

### Seed 2042 — Chester [line_cook] → Renee [fisherman] (d14)
10 living pre-death (Barbara d11 combat; Kennedy HP39 — the bloodied run),
pantry 21k. Death pack 9 items. End d27: 9 living, pantry 11.6k (tight but
alive), plants 16, Renee 3 abilities. All 3 convos missed the death — the
naming debate outranked mourning (observation 2).

### The mantle moment (say-lines, all 3 seeds)
d14: "🕯️ Carmen Peng is dead — the expedition. The village stops. Somebody
screams. Somebody else starts digging." → "The Codex doesn't pause for
grief. Gloria blinks — and it's already there, overlaying everything,
syncing. No pen. No paper. The mantle just... transfers." → "🌟 'MANTLE
TRANSFER DETECTED. ...Oh! New face! Same job! Whole new set of tricks. We
hardly noticed. (That is a lie. We noticed. The audience CRIED.)'" → "📖
The Codex turns a page: Carmen Peng, 14 days. The mantle passes to Gloria
Foley." → "The fire knew Gloria before the Codex did — their name already
carried weight here." The beat is staged, gated by integration (journal vs
sync), and names both bearers. The "You're not Carmen" trust->55 beat did
not fire on any seed (no villager above the threshold) — untested this run.

## The blank: pre-System bearer deaths mourned a descriptor (FIXED)

**Finding:** crisis-r8 (2026-10-12) replaced the r4 bearer-naming
(`String(recorded name).split(' ')[0]`) with knowledge-gated `firstRef()`
in `t2LatelyEvent`'s mourning branches to fix the "Since A died..."
stranger-truncation bug. Side effect: a pre-System bearer death mourned
"the man in his 20s" — hiding the player's own prior incarnation's name
from the player. `test-mantle-memory-20261012` (r4's proof, 9/9 at commit)
had been failing 4 asserts since — flagged in r19 as pre-existing, NOT in
the green list, never caught.

**Root cause (not a re-tune):** the dead bearer isn't a stranger — the
player WAS them — and the lineage is the village's canonical memory of its
mantle-bearers ("the village remembers its own mantle-bearers", ledger.js).
Gating the lineage's own recorded name behind village-knownNames was
over-gating. The r8 stranger fix and r4 bearer-naming only conflicted
because they shared one code path; the lineage branch only ever sees bearer
deaths (true recorded names), so the r8 "A" concern never applied there.

**Fix** (`src/js/convoTopics.js`, `t2LatelyEvent`):
- Mantle-memory branch: resolve from the lineage's recorded name first
  (true name, bearer deaths only), `firstRef` as fallback; the
  `/^(the|a|an)$/` guard keeps the old 'the scholar' fallback from
  rendering "Since the died..." (the r8 bug class, in reverse).
- Acute corpse branch: a fresh corpse matching the lineage's bearer-death
  entry (same villagerId) uses the corpse's recorded true name
  (playerDeath records oldName); all other corpses keep the `firstRef`
  path (r8 intact).

**Proof:** `scripts/test-succession-bearername-20261016.js` — RED→GREEN
verified via patch-file round-trip (no stash): pre-fix 5 FAIL (B1×4, B4;
B2/B3 pass — r8 intact, post-System unchanged), post-fix 11/11 GREEN
(seeds 20261016 default; SEED=7 also run green). `test-mantle-memory`
back to 9/9. Regression sweep: test-mourning-name-r8 7/7, mourning-pools
81/81, lately-pools 243/243, griefgrain 17/17, crisis-outbreak-convo 24/24,
fusion-mantle 9/9, simharness-mantle-wrap 10/10, convo-beats 25/25.
test-mantlebeat-20261014 crashes at require (`./policies/mantlebeat`
never committed) — pre-existing, unrelated, noted for the owner.

## People check (SENSE-TESTING LAW)

9 full transcripts read (3/seed). Verdict: people — the succession fiction
holds in dialogue.
- The village mourns by name when the lately topic fires (Esperanza,
  Carmen — both named, both with grief-voice: "I do push-ups at dawn. It
  doesn't bring anyone back. It just keeps my hands from shaking.", "We
  bury, we grieve, we keep going. There's no step four.").
- Obligations transfer: "I asked Esperanza about the pantry run —
  Esperanza's gone. Still need hands. Are you in?" The new bearer inherits
  the village's open threads, not just its pantry.
- The village is self-conscious about the change: "Nobody says Esperanza's
  name right yet. We will. Give it a few days."
- The want system carries grief even when lately doesn't (Dwayne's
  seek_comfort two days after the death — the comfort loop engaged and
  resolved).
- Day-27 transcripts show the tail expiring honestly (10-day window):
  Giuseppe talks about his own treeline stand and his 13-day-old favor
  thread — the village moved on, but remembers its obligations.
- WART (observation, not this run's blank): the "I just said — did you
  miss it?" deflection fired again (Landon, 2031 settling) when the driver
  re-asked about a want — same filler loop r19 flagged (Zoltan share_news).
  Density unchanged; worth watching.

## Census (plain words)

Three villages, three dead bearers, three successors. Carmen the plumber
died on expedition; Gloria the librarian picked up the Codex and grew from
1 ability to 3 by day 27. Esperanza the interpreter died; Pamela the
glazier took the mantle, and Giuseppe still sharpens sticks "for
Esperanza." Chester the line cook died; Renee the fisherman leads a
bloodied, hungry village (9 living, 11.6k pantry) that hasn't broken. Every
corpse carried a death pack home (4/7/9 items — the body keeps what it
carried); every body was buried within days; the Codex never lost a page
(plants 13→15, 15→19, 15→16). Who leads: trust picks the successor, and
the village knows it ("The fire knew Gloria before the Codex did").
Who was miserable: Dwayne, grieving, asking for comfort. What was missing:
the "You're not Carmen" beat never fired (trust threshold unreached), and
in one village the monster-naming debate talked over the funeral.

## Observations for Steve (design calls, not bugs)

1. **[naming-vs-grief priority]** `t2LatelyEvent` puts the live naming
   debate ABOVE acute grief (Steve 2026-10-07 dialogue rethink). In 2042
   the village debated "Hummice" while Chester lay 2 days dead — the
   mantle beats fired in say-lines, but no sampled conversation carried
   the death. Defensible (a live debate IS the talk of the fire), but the
   mantle is "the run's central fiction" — Steve's call whether a bearer
   death should outrank an active naming debate for the acute window.
2. **[untested]** The "You're not X" close-villager beat (trust > 55)
   didn't fire on any seed — no villager cleared the threshold by day 14.
   Worth a targeted check that the line still renders.
3. **[driver note]** My convo driver looped `dlg:comfort` 7× on Dwayne
   (want=seek_comfort) — the comfort lines are varied enough to survive
   it, but a real player would want the topic to advance. Not a game bug.

## Verdicts

- **Reachable:** yes — the mantle passes through the real playerDeath
  handler on all 3 seeds with zero intervention: successor chosen, corpse
  + death pack, burial, lineage, Codex continuity, staged mantle beats.
- **Fun:** the succession arc plays — the death beat, the sync/journal
  metaphor, named mourning, obligation transfer, the village
  self-conscious about the new face. The successor's first two weeks feel
  like a new life, not a reload.
- **Winnable:** yes — all 3 villages alive at day 27 with growing
  pantries (2/3), growing Codex, and successors building their own kits
  (1→3/4 abilities). 2042's village is hungry but unbroken.
- **Convergence:** blank fixed + proven (bearer naming RED→GREEN, r4 test
  back to 9/9, no regressions); kill rule not triggered; M1/M2/M3 all
  HIT at their binding thresholds.

## Telemetry

New angle seeded: `hidden_files/telemetry-baselines/succession-mantle.json`
(mantle.passed 3, lineageEntry 3, corpseFound 3, buriedByDay20 3,
successorOwnKit 3, m1 3, m2 2, m3 3, deadBearerMentions 2 — aggregates
across the 3 seeds). The check against the old succession.json baseline
(r15/r16 natural-death angle) produced only "newly appeared" LOUD lines —
expected for a first-run angle seed; all explained, none a bug. Next r20
runs compare against succession-mantle.json.

## Files

- Fix: `src/js/convoTopics.js` (t2LatelyEvent mourning name: bearer deaths
  resolve from the recorded true name; strangers keep firstRef)
- Proof: `scripts/test-succession-bearername-20261016.js` (RED→GREEN,
  11/11; r4's test-mantle-memory-20261012 back to 9/9)
- Diag: `scripts/diag-succession-r20-20261016.js` (forced-mantle harness;
  seeds 2026/2031/2042; competent policy)
- Evidence: `evidence/2026-10-17/journey-succession-r20-{2026,2031,2042}.{json,log,tele.json}`,
  `evidence/2026-10-17/journey-succession-r20.md` (this note)
- Baseline: `hidden_files/telemetry-baselines/succession-mantle.json`
- Probe (scratch, not committed): `scripts/probe-bearer-name-20261017.js`
  (deleted after use)

## Metric review (§14, continued)

- M2's binding threshold (≥2/3) was met (2026, 2031). The 2042 miss is
  documented under observations, not re-scored — the naming-debate
  priority is a design call for Steve, and the village was debate-loud,
  not grief-silent (the r4 blank's signature).
- The pre-registered kill day (12) drifted to 14 in practice (runDays
  counting from setup) — cosmetic; the post-System, established-act-0
  intent held on all seeds. Recorded, not corrected.
