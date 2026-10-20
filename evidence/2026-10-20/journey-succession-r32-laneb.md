# Journey-succession r32 (lane B) — "THE FUNERAL" (2026-10-20)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** the funeral after the mantle passes. The village brings the
body home and digs the grave overnight (r9); the filling of it is the
successor's act — payRespects, the death pack per-item (loot-as-action,
the village watching), buryCorpse with grave goods named. r9 built it,
r22 named the weight and the goods, r24 fixed the trauma number — but NO
run has ever PLAYED the funeral as the successor and assessed it as a
player experience. Does the chain fire and complete? Does it name the
predecessor correctly? Does the village notice?

**Prior art:** r26 (open book), r27 (full close), r28 (silent-thanks fix),
r29 (chains), r30 (replay on tip), r31 (the new bearer's life — the office
is a handoff ceremony, not a social reality; design-call blank with Steve).

**Interesting-finding criteria:**
(a) full chain completes on ≥2/4 seeds with the predecessor named
    correctly throughout → the funeral is reachable and played;
(b) any link broken (no recovery line, corpse unreachable, dead button,
    wrong name, silent trauma/burial) → REAL BUG;
(c) looting the predecessor's death pack fires the designed social weight
    (observe('loot_corpse') trust/rep, "your hands know what they did")
    vs nothing → sense finding;
(d) a second funeral in a chain corrupts nothing.

**Seeds:** 9701–9704 (fresh). **Policy:** competent phase A (d1–9); ONE
scripted kill via the REAL playerDeath ('a hushwolf') ~d13; the successor
performs the funeral through the real player verbs (payRespects /
corpseTakeItem / buryCorpse) exactly as the UI buttons call them (app.js
corpse screen). 9704 additionally kills the SUCCESSOR after the first
burial and performs a second funeral (chain case). Death-aware stop.
**Horizon:** kill ~d13, funeral week, successor to ~d25 (9704: second kill
~d18, end ~d30).

**Binding metrics:**
- M1: ≥3/4 mantles pass cleanly. Kill rule: fails on ≥2/4 → SUBSTRATE-MISSING.
- M2: ≥2/4 full funerals complete (recovery line + payRespects OK +
  buryCorpse OK, predecessor named in all three).
- M3: 0 identity/naming failures.
- M4: death pack reachable on ≥2/4 seeds (≥1 item, per-item take works
  with the named-weight line).

## What happened

**M1: 5/5 GO** — Violet→Camila, Luke→Michelle, Kavya→Seamus, Anthony→Rosa,
Rosa→Arlo (9704 double). Lineage + mantleOf clean on all five. One organic
handoff in the 9703 aftermath (Seamus→?, unburied — outside the
instrument's funeral window, machinery held).

**M2: 5/5 GO.** Every funeral completed the full chain:
- Recovery line fired overnight on all five ("That night, they bring
  Violet home. Nobody asks you to help carry; nobody has to. By morning
  the grave is dug by the fire, and the body is laid out beside it. The
  filling of it is yours.").
- Corpse found at the fire, recovered=true, death pack intact.
- payRespects: "You say a few words for Violet. Not a ceremony — just:
  you were here, and someone noticed you leaving. (-3 trauma)" — trauma
  moved exactly as named (6→3, 4→1, 2→0).
- Per-item take: "You take stick from Violet. Your hands know what they
  did. (+6 trauma)" — the dead named, the weight named, the number the
  one that actually landed (r24's contract holding).
- buryCorpse: "You bury Violet. A marker, of sorts. The village will know
  where. (+4 trauma)" + "What they carried goes into the ground with
  them: stone, stick. The village leaves the dead their things." —
  grave goods named, trauma moved, corpse buried=true (the grave record
  persists by design), fallen roll recorded.

**M3: GO** — 0 naming failures across 5 funerals. The predecessor is named
in every beat; no 'them' when the name is known.

**M4: GO** — 4/5 funerals had a death pack (9701: stick/stone; 9702: vine;
9703: stick/stone knife; 9704-second: fan care package, fire-hardened
spear, skull helm, military vest). 9704-first (Anthony) died with an
empty pack — the bearer <redacted> carrying nothing, plausible in honest
play, not a mechanic failure. Per-item take worked 4/4.

**The chain case (9704):** Rosa buried Anthony, then died herself; Arlo
buried Rosa. Two graves, two corpses, two death packs, two fallen-roll
entries — no corruption, no crossed names. Rosa's pack (fan care package,
spear, skull helm, military vest) shows the death-pack law working at
the top end: "You take fan care package (unopened) from Rosa. Your hands
know what they did."

**Sense finding (c): the burial is socially silent — by design, but worth
naming.** observe('loot_corpse'/'honor_dead'/'bury_dead') are witness-gated
(Steve 2026-10-09 seen-crime rule): with no party witnesses in these sims,
successor trust/rep didn't move on taking or burying (26→26, rep flat).
Nobody attended the funeral; a post-burial driven convo (Berik, trust 49,
proper r31 driver) never mentions the burial — but DOES mourn the death
honestly ("Karl is gone and the world just... continues. That's the part
I can't stand."). The village mourns the PERSON (grief system, r31-proven);
the funeral is the successor's private act. Same class as r31's
office-afterlife blank: coherent as-is, but a design question for Steve
whether funerals should be social scenes.

**Instrument note:** the r32 recovery display regex (`/bring .* home/`)
false-matched a "WORD TRAVELS — riders from Ashford bring talk of Haven"
line on 9704-first. Binding evidence always came from the strict
name-anchored regex; fixed the display and re-ran 9704 deterministically
(same results, honest evidence).

## Village assessment (plain words)

Five villages (four seeds + one double), all alive at the horizon (9–11
living). Every bearer <redacted> cleanly and every successor buried their
predecessor by name, took or left the death pack per item, and kept the
village running. The funerals read like the game understanding what a
burial is: the village carries the body home and digs the grave
unasked, the successor says the words and fills the grave, the earth
keeps what was carried. Nothing about it felt mechanical — the one
flat note is that nobody else comes to the grave.

## People check

The funeral beats themselves are person-honest: "Nobody asks you to help
carry; nobody has to" / "Not a ceremony — just: you were here, and
someone noticed you leaving" / "The village leaves the dead their
things." The post-burial Berik transcript (9706, proper driver) meets
the quality bar — grief specific to the dead bearer, comfort engaged,
ending resolved ("Thanks for... you know. Just listening."). One probe
transcript (9705) was driver garbage (my quick driver looped
dlg:favor_requirements — ported the r31 driver verbatim for 9706 and
discarded the 9705 read). No fabricated history anywhere.

## Blanks filled / documented

**1. PLAYED (no src/js change): the funeral end-to-end, first time.** The
full chain — recovery, respects, per-item take, burial, grave goods,
fallen roll — fires and completes in real play, naming the predecessor
throughout, moving exactly the numbers the text claims. Reachable,
played, sensible.

**2. FIXED (src/js/ledger.js + 2 proof tests): two succession proof tests
rotted by deliberate design changes, plus a real text bug they exposed.**
- `dedc46db7` (2026-10-20, "favor requests connect to real playable
  actions") made water_haul/forage_help/etc. uncommittable — both
  `test-succession-inheritance.js` (fixture used water_haul) and
  `test-succession-open-book-20261018.js` (forced from day-1 forage_help
  needs) failed on master. Per the green-list rule (design changed on
  purpose → update the test), repaired in the worktree:
  - inheritance: favor1 → food_share; the three convoThreadOpen plants
    now pass real-beat 5th-arg snippets (r19 no-ghost-threads contract —
    the 4-arg plants were silently rejected); the stale
    'trust-zero-stays-zero' pin updated to the blitz-succession formula
    (office 0*0.4 + heir's own 90*0.4 = 36 — the old pin predated the
    own-record channel, Steve 2026-10-13);
  - the resume-opener check was dice-hostage (65% no-fire gate) and the
    memory check looked in the opener menu instead of the subject menu —
    both repaired (forced dice with restore; dlg:subject path).
  - open-book: the forcing loop now advances with honest competent play
    until a committable need (food_share/heal_help/sick_help) exists,
    then commits through the real machinery.
- **Real text bug found via the repair:** the open-book line doubled the
  asker's descriptor for unnamed villagers — "the woman in her 40s, with
  a wiry build — help A woman, maybe 40s, with a wiry build with their
  sickness" (firstRef and displayName produce different descriptors;
  the task already embeds ctx.name). Fixed in ledger.js: when the task
  already carries the asker's display name, the task alone is the bit.
  Proof: RED on old code (new no-double assertion fails), GREEN on new
  (line reads "— help A woman, maybe 40s, with a wiry build with their
  sickness — they're achy and wrung out...").
- Post-repair: inheritance 18/18 ALL GREEN; open-book 10/10 + 2/2;
  all other succession suites green (blitz 30, promise-maker 14,
  coalesce 0 failures, opener-coherence green, people-count green,
  proto 12/12, seed-inherit 6/6, exile-docket 21/21, promisee-bearer 14/14,
  grief 22/22, orientation green, ownrecord green).

**3. DOCUMENTED (blank, no game change): the funeral is socially silent.**
Witness-gated observe means the burial moves no trust/rep without
witnesses (designed — seen-crime rule); conversationally nobody
acknowledges the burial itself (the death, yes — Berik). No funeral
attendance system exists. Filed as a design question for Steve, same
class as r31's office-afterlife blank.

## Metric roll-up

- M1: 5/5 GO (4 scripted + 9704 double; 1 organic bonus).
- M2: 5/5 GO.
- M3: GO (0 failures).
- M4: GO (4/5 packs; 4/4 takes).

## Metric review

M2's "predecessor named in all three" held without re-scoring; the
9704-first display-regex false positive was an instrument artifact, not
a metric event — binding evidence came from the strict regex throughout.
M4's ≥2/4 bar was easily cleared (4/5); the empty pack (9704-first) is an
honest play outcome, not a miss. No metric revision proposed.

## Findings for Steve (design calls)

1. **Should funerals be social scenes?** The burial is currently the
   successor's private act — nobody attends, nobody mentions it, no
   trust/rep moves without witnesses. The death itself is mourned
   (grief system working). If the intent is "the village buries its
   own together," that's new content (attendance, words said, a beat);
   if the intent is "the successor's private act," the current state is
   coherent — same question class as r31's office-afterlife blank.
2. **No bugs found in the funeral chain itself.** Recovery, respects,
   take, burial, grave goods, fallen roll — all fire, all name
   correctly, all move the numbers the text claims, including through
   a double death.

## Reachable / fun / winnable

- **Reachable:** the funeral is (5/5 chains complete through the real
  player verbs). The death pack is reachable 4/5 (empty when the bearer
  <redacted> with nothing — honest).
- **Fun:** the funeral beats are among the best-written in the leg —
  quiet, specific, unsentimental. "Nobody asks you to help carry;
  nobody has to" does more work than any ceremony UI would.
- **Winnable:** neutral — continuity machinery, held everywhere.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: **1 LOUD line** —
`chain.mantlesPassed` newly appeared (baseline 0 → current 5). EXPLAINED:
the r32 tele schema added the metric key; the baseline predates it. Not
a game deviation. Baseline NOT rolled (different profile/horizon).

## Regression

- check.js --quick: [PENDING — running at note time]
- Succession suites: all green (listed above).
- Changed: src/js/ledger.js (open-book no-double), 2 proof tests
  (fixture rot repair). New: r32 instrument + funeral-social probe
  (scripts), evidence/2026-10-20/ tele + funeral transcripts.

## Landing

- Commit: r32 script + probe + tele/funeral transcripts + the ledger
  no-double fix + 2 repaired proof tests.
- rotation-b: 7 → 4 (endgame next). Lock deleted.
- Report: "merged locally, pending ship" — no version tag; the ship job
  reports the tag when it goes live.
