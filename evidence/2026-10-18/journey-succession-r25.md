# Journey-succession r25 — "the ledger across the grave" (2026-10-18)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** when the bearer <redacted> with an open PROMISED favor, `playerDeath`
(ledger.js) releases the promise (`kept='released'`, `inherited=true`) and
reverts the favor instance to `'asked'` (r13 proved the release as CHAIN5;
its F-REASK finding — does the NPC actually re-ask the successor, naming the
predecessor? — was documented-not-gated, no note survives). Does the soul
ledger survive the grave HONESTLY? When the successor commits to the re-ask,
is the new obligation THEIRS (`maker=newId`), not a zombie of the dead
bearer's word?

**Prior art:** r20 (village names its dead; codex continuity), r21 (double
mantle, "you're not X", abilities don't carry), r22 (death-pack voice), r23
(successor's own grief), r24 (the sentence dies with the bearer — exile
docket reset). None sense-tested the favor ledger end-to-end.

**Interesting-finding criteria:**
(a) M2 fails anywhere → the release machinery REGRESSED (r13 CHAIN5) — REAL BUG.
(b) re-ask fires with the inherited line → sense-read: honest or robotic?
(c) re-ask never fires → WHY: need died (moot path), kind changed (moot),
    want never selected (ask_favor starved), NPC dead/gone. Each cause has a
    different fix.
(d) successor commits → new promise `maker === newId`, deadline refreshed
    from the re-ask day. `maker === oldId` → ZOMBIE OBLIGATION bug.
(e) successor ignores the re-ask (asked, never promised) → no decay blame on
    the successor for the predecessor's ask (document either way).

**Seeds:** 7101, 7102, 7103, 7104 (fresh). **Policy:** competent
(COMPETENT_TALK unset — the policy doesn't talk; the script drives one convo
with the asker per day). **Horizon:** promise forced d14, kill d14, successor
plays to d26. Death-aware: village dead/scattered → stop (no seed hit this).
**Method:** scripts/journey-succession-r25-20261018.js — force a real favor
(`convoFindFavorNeed` → `convoBuildFavor` → `convoFavorCommit`) with a
mid-trust NPC (top-2 trust skipped: the successor IS the top-trust NPC, and
an asker-turned-successor makes the ask self-referential — the re-ask is
structurally undefined there), kill via the real `playerDeath`, verify the
release, then drive daily convos with the asker chasing the favor want.
**Binding metrics:**
- M1: ≥3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
- M2 (mechanism): all seeds — post-mantle promise `kept==='released'` +
  `inherited===true`, favor back to `'asked'`, `inhFrom` stamped. <3/4 → REGRESSION.
- M3 (people): ≥2/4 — the NPC re-asks the successor within d26 AND names the
  predecessor. Misses documented with cause, never re-scored.
- M4 (sense): ≥2/4 — a full re-ask transcript meets the quality bar.
**Kill rule:** mantle fails on ≥2/4 → SUBSTRATE-MISSING.

## What happened

**M1: 4/4 GO** — Kurt→Wei, Sanjay→Gladys, Sanjay→Anh, Carolina→Lamar.
Lineage entries with cause on all 4; all villages alive at d26 (10–11 living).

**M2: 4/4 GO** — the release machinery is intact on this base: every forced
promise came out `kept='released'`, `inherited=true`, its favor reverted to
`'asked'` with `inhFrom` stamped with the dead bearer's name. No regression
of r13's CHAIN5.

**M3: 1/4 — MISS.** The re-ask fired once (7104, d15). The three misses each
have a different, documented mechanical cause:
- **7101** (Omar, water_haul): by the first post-mantle convo the need kind
  had changed (water_haul → forage_help). The opener's kind-change branch
  SILENTLY mooted the released favor (`oldF.state='moot'`, no line) and built
  a fresh unstamped favor — the successor never learned Kurt owed Omar
  anything. The village later fulfilled the new favor → 'thanked'.
- **7102** (Wanjiru, forage_help): same silent-moot shape (forage_help →
  stay_close); then Wanjiru died d20. The ask died with the asker.
- **7103** (Donna, forage_help): the need stayed live and the kind matched
  for all 12 days — but `ask_favor` was NEVER selected in 12 driven convos
  (curious / seek_taken won every time). The favor sat `'asked'`, need live,
  and the want economy never surfaced it. The inherited ask gets no pick
  boost; it competes as a brand-new ask of the same urgency.
- **7104** (Jorge, heal_help): HIT. Jorge's wound stayed live for days
  (heal_help: health<80) and ask_favor won on the first post-mantle convo.

**M4: 1/4 — MISS** (only one re-ask transcript exists to sense-read). The one
we have is the designed beat working exactly as written:

> NPC: "I asked Carolina about this wound — Carolina's gone. Still need
> hands. Are you in?"

The same convo carried named mourning ("Leo is gone and Carolina is gone and
the world just... continues. That's the part I can't stand."). The NPC wanted
something real, the options engaged, the ending resolved. When the beat
fires, it reads honest — the problem is reachability, not the line.

**Finding (d): CLEAN.** Verified directly: after the mantle, the successor's
commit (`dlg:commit` path, fired d17 on 7104) creates a brand-new promise —
`maker === newId`, `kept=false`, `inherited=false`, favor back to
`'promised'`. No zombie obligation; the released record is deleted by
`convoFavorCommit` as designed.

**Finding (e):** on the miss seeds the favor sat `'asked'` — never promised,
never decayed, no blame anywhere. The decay path only touches `'promised'`
favors, so a successor who ignores the re-ask is never penalized for the
predecessor's ask. Documented, no change needed.

## Village assessment (plain words)

Four villages, all alive at day 26. The successions worked — new bearers
stepped into functioning villages and kept them functioning. What the villages
don't do: tell the new bearer <redacted> the old one owed. On three of four seeds the
dead bearer's open promise vanished without a word — not broken, not kept,
just gone from every surface the successor can see. The ledger is honest in
the database (`released`, `inherited`, stamped) and silent in the fiction.
The one seed where the re-ask fired shows the system as designed: Jorge
asked, named Carolina, and Lamar took up the wound as his own promise.

## People check

12 driven convos per seed with the asker, full transcripts on the first two
days per seed plus the re-ask. Best: 7104 d15 (above). The miss seeds' convos
are ordinary good-quality chats (curious/seek_comfort wants) — no fabricated
history, no filler loops; the failure mode is absence, not invention. One
driver artifact worth noting: on the first 7101 run the asker (top-trust)
became the successor and the driver's `startConvo(self)` "opened" a
conversation with the player's own id — the engine doesn't guard self-talk
(the UI never offers it; unreachable in real play). The script now skips the
top-2 trust NPCs when choosing the asker.

## Blank filled

**THE OPEN BOOK (src/js/ledger.js, +38, fiction-led, one beat):** in
`playerDeath`'s MANTLE HANDOFF RECORD block, when open promises are released,
name them once — asker (knowledge-gated `firstRef`, never a split
descriptor) + task — "the promises died with their maker; the needs didn't."
The office inherits the KNOWLEDGE even though the obligation is released.
Fires only when ≥1 open promise existed; clean books stay silent (old
behavior preserved).

Wild: "📜 Carolina's book stays open on the table: one promise unkept —
Jorge — help Jorge with their injury. The promises died with their maker;
the needs didn't. What you do about them is yours to decide." It lands in
the handoff after the orientation beat and reads as the ledger it is.

**Proof:** scripts/test-succession-open-book-20261018.js — RED 2 fails
pre-fix (the line absent; all release-machinery assertions held — the
machinery was never broken), GREEN 13/13 post-fix. Covers: one promise →
one line naming task + dead bearer + "died with" (no broken-word stigma);
clean book → silence; two promises → one line carrying both tasks.
**Wild confirmation:** re-ran 7104 post-fix — M1/M2/M3 all GO, the open-book
line fires once in the handoff, the d15 re-ask still fires, the d17 commit
still creates the successor's own promise.
**Regression:** test-succession-exile-docket 21/21, test-succession-grief
22/22, test-promise-maker-succession 14/14, test-deathpack-voice 16/16;
check.js --quick: 96 passed, 1 failed — the failure is
test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/cliffhanger),
the same pre-existing sprite failure as r21/r22/r23/r24, untouched by this
change (src/js/ledger.js only).

## Metric roll-up

- M1: 4/4 GO.
- M2: 4/4 GO (no regression).
- M3: 1/4 MISS → BLANK CONFIRMED → fix implemented + proven (the fix attacks
  the knowledge gap, not the want economy — the re-ask keeps its natural
  cadence, but the successor now knows regardless).
- M4: 1/4 MISS (single transcript, meets the bar).

## Metric review

M3's ≥2/4 bar did its job — 1/4 is a miss, and the miss is the finding. No
revision proposed: the bar correctly distinguished "machinery works" (M2)
from "fiction reaches the player" (M3). For the next succession run: M3
should bind on the open-book line firing whenever open promises existed at
death (the new guaranteed-delivery beat), with the NPC re-ask as the
documented-not-gated follow-up.

## Findings for Steve (design calls)

1. **The opener's silent moot** (convo-wants.js): when a released favor's need
   kind changes, the old favor goes `'moot'` with no line — the code comment
   promises "the follow-up says so honestly" but the opener moots silently.
   The open-book beat now covers the knowledge, so this is a minor wart, not
   a blank. Left alone deliberately; flagging in case you want the moot
   spoken.
2. **The inherited re-ask gets no want-economy boost.** It competes as a
   brand-new ask. Deliberately not changed — with the open-book beat the
   player knows, and can seek the asker out. If you want the re-ask to chase
   the player instead, that's a one-line urgency boost in `ask_favor.pick`
   for un-acked inherited favors.
3. **`lifeDebts` is write-only** (game.js:42501): "owes your mantle a
   life-debt — recorded, remembered" — nothing ever reads `v.lifeDebts`.
   The phoenix-gift debt is a dead record. Not this run's leg to fix
   (phoenix lane), but it's the same class as this run's blank: the fiction
   promises a memory the code doesn't keep.

## Reachable / fun / winnable

- **Reachable:** the mantle is (4/4 clean passes); the re-ask was 1/4 — the
  open-book beat is now the reachable surface (fires whenever the book is
  non-empty).
- **Fun:** strictly better — the successor used to inherit a silent ledger;
  now they inherit the knowledge and the choice ("What you do about them is
  yours to decide").
- **Winnable:** neutral — the beat is knowledge-only; no obligation transfers,
  no trust moves. The successor's social game is unchanged.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: **1 LOUD line** —
`census.fallen` 6 → 10 (+67%). Investigated same-run: EXPLAINED, not a
regression. Per-seed fallen: 1, 5, 1, 3 (avg 2.5) — r24's runs on the same
code family had 4, 2, 4, 3 (avg 3.25). The r25 diff is a single `say` line;
no mechanism in it touches mortality. The delta vs the r23-era baseline is
seed-driven variance in the d14–d26 window (7102 alone accounts for half:
the asker died d20 of ordinary causes). Baseline NOT rolled forward — 4
seeds of variance is noise, not signal.
