# journey-scale r227 — the muster lever (Lane A, leg 3 SCALE)

Run: r227, Mon 2026-11-16. Base master `a71857271`. Worktree `journey-scale`
(branch `journey-scale`), lock `loop-a-20261116T172016Z`. Rotation read `3`
(SCALE, days 80–140), write `3→0` at closeout on success only.

## Prereg (frozen, committed before the panel)

`evidence/2026-11-16/journey-scale-r227-prereg.md` — the full frozen design.
Short version: r223 left a blank — the Herald lived at the treeline for
months, 151 meetings, 0 fights, 104 refusal lines ("muster 10 allied blades
(you have 0)"), and the competent policy never drove a muster. This run tests
the driver-side muster step the blank owed: once per policy day after base
daily, sit the war council once per titan, read the projection daily, sound
the call ONLY when the projection reaches the need (never burn trust on a
hopeless call), commit Haven's own, stand down a muster whose titan is gone.
Matched A/B panel on r223's own band, seeds 135613–135616, DAYCAP=140,
policy `scalecourt-traderoad-r113-linkraise-sit`. Arm A: r223 policy verbatim.
Arm B: r223 policy + muster step. The only policy difference. Sortie inert
in both arms. No src/js change (policy-only lever).

Q1 interesting-finding rule (binding): GO iff arm B slays ≥1 titan AND
wave-4 kills B > A; NO-GO iff 0 titans slain on B with a named per-seed
reason; a muster that completes but loses the coalition fight is itself the
finding. Cost bar: lived-days B within ±25% of A; no B-only collapse without
an attributed cause; starvation B ≤ A+1; committed Haven blades who die count
against the kill gain. A wave-5 kill on either arm overturns the "fought,
never killed" shape. A titan slain on arm A overturns the r223/r226 blank
itself.

## What happened — the pilot caught a real bug

The first pilot (arm B, 135613) came back with muster rows=0 even though the
Herald was located from d85. A debug probe showed the step SAW the titan
(stage 2, defs present) and still wrote nothing: every hold-path in
`musterStep` was written `if (cond) hold('...'); continue;` — the bare
`continue` after the `if` fired unconditionally, skipping the rest of the
per-titan loop on the first titan of every day. The step never reached
readiness, the council, or the call. (The sortie step uses the correct
`return hold(...)` pattern; the muster step diverged from it.) Fixed by
bracing all eight holds; re-piloted clean. The analyzer proof (90/90, run
before the panel) could not have caught this — it tests the analyzer against
synthetic corpora, never executes the driver. The pilot gates are the
driver's proof, and they earned their keep.

## The panel (8 sims, all exit 0)

| seed | A: survived / rank / national | B: survived / rank / national | B muster |
|------|-------------------------------|-------------------------------|----------|
| 135613 | lived d140, regional | lived d140, **global (national d139)**, trade_charter delivered d140 | called d85 (11/10), ready 29d, committed Benoit Lambert, 0 slain |
| 135614 | COLLAPSED d137, regional | lived d137, regional | called once, ready 8d, committed 1, 0 slain |
| 135615 | lived d141, regional | lived d140, regional | never called (held short all run), 0 slain |
| 135616 | lived d141, regional | lived d139, regional | never called (held short all run), 0 slain |

Band totals: lived-days A 559, B 556 (−0.5%). Lesser seat 4/4 both arms.
National A 0/4, B 1/4. Tribute ready A 0/4, B 2/4 (both READY-UNPAYABLE —
veterans-short on all 27 attempts). Living-veteran peak 5 both arms.
Wave-4 kills (ladder count): A 194, B 142 (delta −52). Committed Haven
blades who died on B: 1 — gen_3omrvmu, d88, in a contest (not a titan
fight). Starvation deaths 0 both arms. No B-only collapse.

## Q1 MUSTER verdict: NO-GO on the lever — the call sounded but no titan died

The muster step works as a mechanism and fails as a lever:

- **The call completes.** On 135613 the projection reached 11/10 on the
  first located day and the call sounded the same day; on 135614 it
  completed after weeks short (short by 7 for 22 days). The council, the
  call, and the commit all fire, with 0 verb-wrap errors. The voice is
  strong (see People check).
- **The coalition fight never starts.** 0 titan fights started on either
  arm (outcomes log, authoritative). A complete muster sat ready for 29
  days on 135613 and 8 days on 135614 while nothing marched: the driver
  has no march step — nobody walks to the lair — and the engine's meeting
  flow never engaged the coalition either. The muster is half a lever; the
  march is the missing half. In real play the player IS the march step,
  so the sim understates a real player — but the muster alone, as
  pre-registered, slays nothing.
- **The Herald's ends, per seed:** 135613 — field-killed by villager
  Nino Kapanadze on d114 (vKill, 4 rounds) while the muster sat ready; the
  engine does NOT count a field kill as a titan slain (slain stays 0, the
  muster stands down). This overturns the r226 "villagers cannot finish
  it" reading on this trajectory — they can, by mauling. 135614 — still
  present at end, refused 109 meetings on B (151 on A). 135615/135616 —
  the muster never completed: the projection stayed short (short by 3–6
  all run) and the Herald spent 47/29 days absent (not in the world at
  all), so there was nothing to call against most days.
- **The price, with no kill gain:** one committed blade died (a contest,
  d88) and the muster stood hungry — 11,000 kcal/day against a ~9,000
  kcal pantry, so it was fed ~0 most days while the lines warned of
  trust bleeding −2 per fire per day. The cost is real; the gain is zero.
- **No kill gain anywhere else either:** wave-4 kills fell on B (142 vs
  194), living-veteran peak is identical (5 vs 5), and B's one national
  (135613, via trade charter) is trajectory noise from the RNG divergence
  after the muster fired — not a lever effect, since no titan died and no
  veteran was added by the muster.

## The wave-5 kill (shape overturn, NOT a lever effect)

First wave-5 kill on this band: arm B, seed 135616, d136 — the scholar
(Ursula Weber) killed the `timeslot` in a player-channel fight, no trick.
Per the prereg this overturns the "fought, never killed" shape. But it is
NOT attributable to the muster: the muster never called on 135616 (held
short every day; the step only ever sat the council once). The kill came
from the scholar fighting a wave-5 monster in the field, on a trajectory
that diverged after the council sitting consumed RNG. Noted as a real
first, credited to the scholar, not the lever. (Also on B 135614: 7 field
fights with wave-5 entities, the network_note ground 1000→298 HP over
five meetings — all villager flees, never a kill.)

## Q1 NATIONAL: A 0/4, B 1/4 — the wall stands

Arm A blockers, per seed: 135613 LEAD 2/3 seasoned (3rd sub 12d old);
135614 COLLAPSE d137; 135615 LEAD 2/3 (no 3rd sub); 135616 LEAD 1/3
seasoned. Same shape as r223 (national 0/4). B's single national came
through the trade road (trade 3/3 seasoned, charter delivered d140), not
through the titan. The veteran link is still the binding constraint:
tribute was READY-UNPAYABLE on B 135614/135616 (ready d112/d127, every
attempt refused veterans-short) and NEVER-READY on all four A seeds.

## Village assessment (plain words)

Both arms' villages are the same kind of place r223 found: alive, fed,
linked, and stuck one seasoned link short of national. They survive to
d140 (7 of 8 seeds; one collapse on A 135614, which survived on B with
11 people), they take the lesser seat every time (d34–d50), they fight
wave-4 beasts in the field (142–194 kills band-wide, mostly the scholar
and villagers together), and they cannot close the veteran gap — the
living-veteran peak is 5 on both arms and the tribute stays unpaid because
there are never enough living veterans at once. The muster did not change
that story: it added a coalition that waited, a blade that died in a
contest, and a hungry muster the pantry could not feed. The villages feel
alive in the transcripts (below) and stalled at the same wall in the
numbers.

## People check (read in full: 16 transcripts, 16 raise talks, both arms)

Villagers act like people. The best lines this run: Nikos the aquarium
keeper, grieving — "I keep expecting to see them by the fire. Then I
remember." / "I used to be an aquarium keeper who worried about being on
time. Now I worry about being alive. Same worry, bigger font." Safae the
bartender — "Pain shared is pain halved. That's not science. It's better
than science." / "Hurt people hurt people. Somebody has to break the
chain. Might as well be me." Harper the HVAC tech — "I'd rather be the
cook than the hero. Heroes get songs. Cooks get everyone through winter."
Riley, on regrets — "I regret the ordinary days I rushed through. All
those Columbus, Ohio mornings I spent annoyed at small things." Yassine's
trap line — "the ground is torn up. Something was here, recently, and it
wasn't careful. Yassine's hand finds your sleeve." Sanne the German
vintner mimes a walk and shows you where they go to think: "Don't tell
the others. Everyone needs one place." Daniyar the Russian paramedic
holds two nonverbal sittings with different Russian lines each time. Gifts
land with reasons: Gianna presses an oiled tool into your hand; Caio
shares half his hidden stockpile (+4 wood, +4 fiber to the stash).

Raise talks: 16, properly answered (14) or correctly held (2
not-offered-unspoken: Zoe's talk about origins and fear, Sanne's German
sitting). 0 not-offered-spoken defects. The accepted raises are formulaic
in shape ("I've heard good things about X — we'd be stronger together")
with the village name swapped, but the surrounding talk varies (Nathan
asking for the funniest thing seen since the world ended, then laughing
for real). Stutter watch: no Rufina-stutter recurrence ("About X — <the
same X as a question>"). One shared closing line recurs across two
villagers ("Talking helps. Then it hurts. Then it helps again. It's a
cycle." — Nikos and Yassine): a closing-line pool, not a stutter. Nod-loop
guard HOLD (worst 3x on A, 0x on B). Trap-line HOLD on A (Sanne's mime
answered); SILENT on B (no mime sitting in the band). Betrayal sibling
HOLD (0 defects; two turn-0 offers on B both carry the invite label).
Daily-play mime: read-only, recorded — daily mimes 11 (A) / 5 (B),
daily accepts proven 0 by the capture lower bound; lane decision still
owed (teach the shared chooser or keep proving only where the driver
looks).

Muster voice check: the call/commit/council lines read as a village
answering a threat, with the cost named, not hidden. "Scouts found its
lair — tile 7,4. THE HERALD — the sky, getting bigger. It is WAITING.
You cannot face it alone. Sound the call." / "WAR COUNCIL — THE HERALD.
The leaders sit as faces, not pieces." / "The call, sounded now, would
bring 11 blades — 10 from allied fires and 1 of Haven's own — against
the 10 THE HERALD demands. The coalition is ready; the cost is named,
not hidden." / "Benoit steps forward. They will march with the muster,
eat from your stores (1000 kcal/day each), and stand in front of THE
HERALD. They can die — Haven does not get them back, and the fire will
be quieter." / "Haven commits its own: Benoit marches with the muster.
Not loaned. Not asked-for. Ours." Two wrinkles: the deliberation line
("It eats while we deliberate. The Herald feeds on our stores and we're
supposed to just... wait?") repeats verbatim with different speakers
(Benoit, then Nadia) — a refrain, not a defect; and the muster-hunger
line repeats daily, mostly "0 of 11,000 kcal fed", because the muster's
appetite exceeds the whole pantry — the coalition stands hungry while it
waits, which is a real cost the player sees every day.

## Q5 census + spotter

Survived A 3/4, B 4/4. Deaths A 34, B 37 band-wide (the wild dominates).
Spotter stays thin: 1–2 villagers per village with any spotter XP at d90
or end; skill ≥1 in 0–4. Wave-5 entities appear on B 135614 (5/day max,
17 days) and B 135616 (2/day, 10 days) and are fled from, not fought,
except the one scholar kill above. Sortie inert both arms (0 lingerer
days) as pre-registered.

## Metric review

- The prereg's Q1 rule judged the lever correctly: the muster completed
  twice and slain 0, so NO-GO is the honest verdict — but the rule's GO
  branch (slay ≥1 titan AND wave-4 kills B > A) would have missed the
  real shape: even a slain titan would not have proven the lever if the
  kill came from a field mauling, as 135613's Herald nearly did. The
  next prereg should count ENGINE-slain titans only (the outcomes log),
  which this run's analyzer already does — the rule text should say so
  explicitly.
- The wave-4 kill delta (B −52) is a noisy ladder count (refused
  meetings included) and moved against the lever; it should not be read
  as the lever costing kills — the trajectories diverge after the first
  muster RNG draw, and A 135614's 165 wave-4 fights (a collapse seed)
  dominate the band. Keep the delta as measurement, not as a second
  verdict.
- The cost bar held (lived-days −0.5%, no B-only collapse, starvation
  0=0), but the committed-blade death is under-counted by the bar as
  written: it counts deaths, not the trust and pantry cost of a hungry
  muster standing 29 days. A future cost bar should include muster
  hunger days and the trust movement while it stands.
- The muster step's fidelity caveat (driver sounds/commits from anywhere;
  real play needs the player at camp) stands, and the pilot adds a second
  one: the sim has no march step, so a completed muster can never fight.
  Any future muster panel needs a march step in the lever (or a
  player-at-the-lair driver) before it can return anything but NO-GO.
  That is the next blank: muster + march, with its own prereg.

## Telemetry

`maxGameDay` only vs `telemetry-baselines/scale.json` (468), per arm:
quiet on both arms (4 files each, no large deviations). Baseline NOT
rolled.

## Gate

Re-run (`journey-scale-r227-gate-rerun.log`, the first run's log was
truncated at one line): **`node scripts/check.js --quick`: 333 passed,
7 failed in 913s — 0 attributable.**

- measurement cache flag isolation (3 failed): standalone 4/4 green on
  a quiet box — box-load artifact, same as the r226 A/B (pristine base
  3/4, fix branch 4/4). Do not roll the baseline on a load artifact.
- Phone frame proof (3 failed): standing stale-receipt failure.
- one-person-army (1 failed, exit null at 120.1s in the gate):
  standalone exits 0 in ~65s — a gate timeout, not an assertion.
- test-ladder-bundle-20261108 (1 failed, "control: 200 monster turns
  WITHOUT delivery fire the ambient raid"): reproduces standalone, but
  the same failure is in the r226 deepening gate log — a standing
  failure on base, not from this run.
- The first run (329 passed / 11 failed) is superseded; its log is
  truncated and its failure list was incomplete.

This branch changes no `src/js` (driver + analyzer + proof only), so no
gate failure can be caused by it. Gate GO.

## Blanks filled / documented

- FILLED (instrument): the muster step + ledger + analyzer MUSTER section
  + 90-assertion proof (70 carried, 20 new). The step fires, completes,
  and logs; the analyzer reads the engine's own outcomes log.
- DOCUMENTED (not filled): the march — a completed muster never fights
  because nothing walks to the lair. Owed as the next lever (muster +
  march) with its own prereg. Not a src change this run.
- DOCUMENTED: the muster's appetite (11,000 kcal/day) exceeds a
  scale-stage pantry (~9,000), so a standing muster is always hungry and
  bleeds trust. Whether the trust bleed is actually applied (vs only
  voiced) is a code question for the next round, not this run's claim.
- DOCUMENTED: a field kill of a titan does not count as a titan slain —
  the engine only logs the coalition path. A village can kill the Herald
  by mauling and get no credit toward anything.

## Reachable / fun / winnable (leg 3 SCALE)

- Reachable: yes — the scale content (regional links, the table approach,
  the lesser seat, the titan omen) all fired on this band. The muster
  itself is reachable in the fiction (council, call, commit all voiced).
- Fun: the muster voice is the best new writing on the leg — the council
  and the commit read like a village deciding, not a menu. But a muster
  that completes and then waits 29 days while the Herald eats the pantry
  is a dead beat in play: the player does the hard thing (the call) and
  gets no fight. Fun needs the march.
- Winnable: NO — not by this lever. National 0/4 on A, 1/4 on B via the
  trade road, not the titan; the veteran link still binds (tribute
  READY-UNPAYABLE where it is ready at all, NEVER-READY elsewhere); the
  full seat was never approached. The wave-5 kill on B 135616 is a real
  first, but it is one scholar killing one timeslot, not a path to a win.

## Closeout

- Analyzer exit 0. Telemetry quiet both arms. Gate: 333/7, 0 attributable (GO).
- Commits on `journey-scale`: `329723283` (prereg + instruments),
  `cd19158b7` (muster hold-bracing fix).
- Merged locally, pending ship. No version bump, no push, no live check
  (ship loop owns those).
