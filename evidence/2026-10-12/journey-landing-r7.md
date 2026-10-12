# Journey landing r7 — days 1–14, competent player, 3 seeds (2026-10-12)

Base: `8e18136b` (journey succession r9). Harness: `scripts/journey-landing-r7-20261012.js`
(built from the r6 template on `scripts/sim-harness.js` + `scripts/policies/competent.js`:
real forage trips, pantry sorting, water/wood routines, driveFights/driveContests,
System ability offers taken, one full conversation per observed game day with full
transcript capture; day-2 deliberately sits a comm-level 'none' villager).
Seeds: **777, 888, 999** (fresh; 444/555/666 were r6). Seeded RNG before module eval;
window stub for eval, deleted before play; full src/js list in index.html order
minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js.
Full transcripts: /tmp/journey-landing-r7-transcript-*.txt (32 files); censuses:
 /tmp/journey-landing-r7-census-{777,888,999}.json; run log: /tmp/journey-landing-r7-run.log.

## Village assessment (plain words)

**Seed 777 — Bill (baker, Columbus Ohio).** Twelve people wake up under the wrong
stars; Bill spends the fortnight foraging (36 trips), drinking, staffing the fish
racks and cookfire. Marcus Webb is ambushed and killed on day 8 — the village's
first death, and it lands: the mourning menu fires in conversations the next day.
The System arrives on day 8 with its usual unhinged calibration-fauna speech,
party system, and 2 ability slots; Bill takes 1 trial-deed ability. The village
teaches itself — Sofia teaches everyone Burdock at the fireside without Bill
lifting a finger. Pantry 47,250 → 17,070 kcal. Bill ends day 14 at 100 HP, 1039
kcal, alive. Trust spreads 8–90 (mean 28.7): most villagers still wary, a couple
won. Plant knowledge: Shannon 13, Wanda/Manuel 11. Open wants at end: 5 curious,
4 favors, 1 share_news.

**Seed 888 — Mario (musician).** A bloodier fortnight: wave-1 fauna kill two
villagers outright (days 7 and 9, real blow-by-blow field fights) and the village
kills plenty back (hummice, sunbasker, nightcourt, mirrormoth). System day 8;
Mario takes 4 abilities — the most engaged System arc of the three seeds.
Pantry 47,250 → 20,682. Mario ends at 100 HP, 1144 kcal. Trust 15–42 (mean 30.7),
tighter and flatter — a village that fought together. Plant knowledge: Mario 16,
Sofia/Dante 14. Mario used beast tricks 4 times and closed fights rather than
fleeing blindly.

**Seed 999 — Shannon.** The hard one. Shannon starves on day 11 — the PLAYER
dies, kcal hitting 0 on day 10 while the pantry snapshot showed ~30k. The
succession system fires and the run continues as the successor (pop 12→11, day 14
reached at 100 HP). The starvation branch did not reproduce in two replay
attempts, so the mechanism (caught in the wild on a long forage trip vs a
pantry-take failure) is UNCONFIRMED — flagged as an open question, not a claimed
bug. The rest of the run: System day 8, 1 ability taken, an active betrayal case
with full vote menu by day 13, pantry 47,250 → 18,957, trust 9–70 (mean 36.3).

## People check (SENSE-TESTING LAW)

Read full transcripts across all seeds. Verdict: **the village acts like people.**

- Curiosity-first openings hold; no fabricated people counts; zero "I just said",
  zero phantom names, zero comma-closer stutters across 32 conversations.
- Decline lines acknowledge in-fiction (10/10: "Another time, then.", "Fair
  enough. Rain check.", "Suit yourself.") — the r5 fix holds.
- Favor arcs: Yi-seo (777-day10), sick, tries to be brave — "Never mind the
  sickness I'm fighting — we got it handled. Thanks anyway." — then honest when
  asked: "I'm burning up and there's nothing left in me. Someone who knows
  sickness — please." Deflected kindly, she closes it herself: "Right. I get
  it." A beat — and then the subject is closed. They won't raise it again.
  Favor follow-up heads stay first-person (the establishment-r4 register fix
  holds; thirdPersonFavorHead=0).
- Grief arcs: the mourning menu fires after deaths; probed directly — "Since the
  person in their 50s, with a nervous tic died... I keep expecting to see the
  person in their 50s, with a nervous tic at the fire. Stupid." Knowledge-gated
  naming works (descriptor, never the split-"A" bug). Minor style note: the full
  descriptor twice in one line reads slightly mechanical.
- Spoken lures: 7/10 spoken; the other 3 were the blank below (fixed). NV sit
  never fired — no comm-level 'none' villagers existed in these seeds (r6's NV
  coverage stands).
- Excerpt — Sofia (999-day13), wound favor under an active betrayal case:
  "This wound — I can't clean it properly one-handed. Will you help me clean
  it?" → "It's getting worse, not better. If it festers I'm no good to anyone —
  can't haul, can't hunt, can't watch. Just clean it out and wrap it tight."
  A villager who knows what her injury costs the village, asking plainly.
- Excerpt — Manuel (777-day3), on the hunger question: "The fundamental skill.
  Everything else is decoration."

## The blank: run-ledger-blocked lure beats went silent (fixed)

**Found:** 3 of 10 betrayal-lure offers were "silent" — the betrayal:accept/decline
menu quoted the invitation verbatim while the NPC never spoke it. Root cause:
the spoken-lure beat (startConvo's second opener beat, journey landing r5 fix)
travels through sayLine's no-repeat ledgers. When another villager had spoken the
same invite label recently (only 5 invite defs; lures repeat across a run), the
RUN ledger replaced the beat with the dry non-sequitur "...Sorry, lost my train
of thought." — the player asked to accept an invitation never extended, while a
menu choice quoted it. Armed-plot invites travel the same channel: a blind
walk-in. Additionally, saidLines persists across sittings, so a villager
re-inviting with the same label later was self-blocked into the same silence
(proven in probe). The NV gesture path was immune (bypasses sayLine).

**Fix** (`src/js/conversation.js`, uncommitted): invitation beats are exempt from
both no-repeat blocks via `sayLine(vid, inviteBeat, { inviteBeat: true })` — the
menu quotes the label verbatim regardless, so the spoken beat and the menu can
never disagree; beats still feed the ledgers. A repeated invitation reads as
insistence, not a parrot bug.

**Also fixed** (same file, found in the same run, seed 999 day 6): a
bare-punctuation voice closer ('!', effusive speech-register pool) appended after
the line's own terminal mark produced "? !" stutter — `"What's something you're
good at that nobody here knows about? !"`. voiceLine now folds bare-punctuation
closers: questions keep '?' (closer dropped), other lines swap the terminal mark
(`"We made it!"`, never `"We made it. !"`).

**Proof:** `scripts/test-landing-lure-spoken-20261012.js` — RED on pristine HEAD
(`git show HEAD:src/js/conversation.js` via CONVO_FILE override): 8 fail / 1
pass (the pass is the setup probe); GREEN on the fixed tree: **9/9 pass**.

**Regressions** (sequential, no concurrent jest): test-convo-norepeat-fallback
9/9, test-convo-seed-voice 37/37, test-dialog-coherence 37/37, test-dialog-gating
ALL GREEN, test-dialog-stream 43/43, test-favor-system 30/30,
test-landing-decline-line 7/7, test-convo-deflect-cycle-r6 13/13,
test-landing-deflect-pool 16/16, ontology 85/85. One pre-existing failure:
test-dialog-grammar 38/39 — a static sweep over **game.js** (untouched by this
run); confirmed unrelated to the fix.

## Verdict: REACHABLE / FUN / WINNABLE

- **Reachable:** everything in the leg fired on the current tree — System contact
  day 8 (3/3 seeds), trial-deed ability offers taken (6), favor ask/deflect arcs,
  betrayal invites with spoken lures, a full betrayal case with votes, mourning
  after deaths, village self-teaching (fireside Burdock lesson), rival-village
  runners, monster-naming debates.
- **Fun:** conversations read as real people with real needs; the fortnight has
  texture (act-0 social emergence, first System contact dread, food pressure).
  Pantry declines 47k→17-21k — pressure is real without being a death sentence.
- **Winnable:** 2/3 seeds reach day 14 at full HP with growing knowledge,
  trust, and abilities. Seed 999's player died honestly and succession carried
  the village forward — failure resolves, it doesn't delete.

## Open questions / not completed

- Seed 999's day-11 player starvation with ~30k pantry kcal at the day-10
  snapshot: mechanism unconfirmed (two replay attempts didn't reproduce the
  branch). Plausibly fair expedition-logistics, but not established. Worth a
  telemetry hook on starvation deaths (location, pack, pantry edibility).
- Gossip arcs were not directly observed this run (no gossip menu picks in the
  32 transcripts; the policy favors deepen choices). The gossip system itself is
  covered by other loops' suites.
- No comm-level 'none' villagers in these seeds, so the NV sit didn't fire;
  r6's NV coverage stands unregressed.

## Files changed (uncommitted, pending coordinator landing)

- `src/js/conversation.js` (modified): inviteBeat ledger exemption in sayLine +
  startConvo; bare-punctuation closer fold in voiceLine.
- `scripts/journey-landing-r7-20261012.js` (new): this run's harness.
- `scripts/test-landing-lure-spoken-20261012.js` (new): proof test.
- `evidence/2026-10-12/journey-landing-r7.md` (new): this note.
