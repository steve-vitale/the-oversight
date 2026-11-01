# Delegated design calls — 2026-10-25

Status: six verified repository questions decided; implementation and release
proof remain separate. Author: Codex, under Steve's explicit delegation:

> "Try to make executive calls for me in the remaining decision items according to our principles laid out in architecture."

These are delegated decisions, not Steve's verbatim design answers. His actual
words in godpath/STEVE-ANSWERS.md and later corrections outrank this document.

## Source and coverage

The verified list is DECISIONS.md's 2026-10-17 batch: five unanswered defaults
plus NPC seat competition #448's explicitly open mechanism. Original mechanisms
were inspected in the source/evidence linked below. OPEN-QUESTIONS.md saying
"none" did not establish that these entries were resolved.

At the time of this first pass, the separate build packet had not been located.
It subsequently appeared in public commit `4b6d4c8eb` on2026-10-25. The full
ID-by-ID disposition is now [BUILD-PACKET-RULINGS-20261025.md](BUILD-PACKET-RULINGS-20261025.md).
These six historical calls do not exhaust that packet; #340 and #495 overlap.
The original packet and its recommendations remain intact for comparison.

## Governing principles

- ARCHITECTURE.md: data declares content; canonical IDs/state and shared engine
  rules resolve it; validators reject invalid references and inputs.
- COHERENCE-SPINE.md and STEVE-ANSWERS.md: people keep their own builds; NPCs
  and players have the same progression rules; the village persists through
  succession. Attribute personal credit to the actual body.
- CANON.md/DIRECTIVES.md: knowledge is earned, actions explain outcomes, trust
  differs from reputation, decisions matter, and core play uses one phone screen.
- TABLE.md: prices real accomplishments, never requires godhood, offers earned
  played challenges and honest losses. NPC heroes can outshine the bearer.
- DECISIONS.md, 2026-10-21: solve food abundance through people's production
  decisions; do not trim outcomes to manufacture a desired result.
- STEVE-ANSWERS.md: investigate wins moving either way. Day150 is already meant
  to be intolerably hard; day180 is exceptionally long. No pity or target-win
  compensation. Numerical values remain hypotheses to measure.

## DC-20261025-01 — Pantry fairness (#340)

**Call:** retain cumulative accounts as history, but judge current unfair taking
from dated, recent net withdrawals and actual need/opportunity. Ordinary meals,
long tenure, disability and honest low-yield learning are not theft. Apply the
same interpretation to the actual person before and after succession. Separate
entitled meals from discretionary withdrawals; preserve theft and sustained
excess as real, legible social choices with warnings and consequences.

This supersedes treating "ledger stays cumulative" as permission to use lifetime
gross eating as current culpability. It does not erase accounts, guarantee food,
make the pantry remote, remove scarcity or install a stock/output governor.
Access, capacity and newcomer ration rules retain their established contracts.
Contribution must reflect real work/opportunity, including care and knowledge;
missing observation is unknown, not automatically zero effort.

Evidence: evidence/2026-10-15/sim-bowldecline-b.md; game.js takeFromPantry,
takeRate7/giveRate7 and freeloaderTick's fair-share logic. The existing seven-day
rate and warning/grace numbers are starting values, not newly mandated canon.

Done when: same actual consumption/effort produces the same judgment for NPC
and bearer; long normal eating cannot alone create a charge; actual sustained
excess still can; injury/absence/newcomer and real theft contrasts are exercised.
Retain full accounting and all policy watches; no numerical tune is approved by
this document without matched measurement and the tradeoff record.

## DC-20261025-02 — Muster versus grief

**Call:** distinguish an urgent present decision from retrospective conversation.
An active lethal threat/escape/defense choice owns the controls. Once immediate
safety is settled, recent personal grief may precede an account of an earlier
muster. Being bereaved must not hide RUN or defense, and danger must not erase
the person who died. Preserve the displaced topic for later, without repeated
interruptions or two competing message surfaces.

This retains grief-first for ordinary memory selection; it removes a blanket
interpretation that grief outranks immediate playable safety.

Evidence: convoTopics.js t2LatelyEvent's care/muster ordering; convo-scene.js
EV_LABELS; party-decision-audit-r1.md's actual urgent-scene ownership contrast.

Done when: threat-plus-grief exposes the actual urgent controls on the phone;
post-threat talk can address the named loss and the muster independently; no
choice charges twice, loses its reply or creates a false unfinished favor.

## DC-20261025-03 — Grief leverage cap

**Call:** retain the existing limit of two grief-based tribute escalations per
canonical link. This is a limit on repeated diplomatic leverage, not on grief,
remembered people, sympathy or the number of funerals. Deaths inside one mourning
window form one crisis. Refusal of a further grab must be explicit; unrelated
neglect and genuine agreement changes can still have consequences.

Evidence: hierarchy.js _griefLeverage/successionCrisis. The old uncapped sequence
compounded tribute across repeated deaths. Keep the cap2 starting value and its
existing multiplier while calibrating; do not change them to force wins. A new
bearer or a cosmetic link rename does not reset an existing contract's history.

Done when: a third grab changes no tribute; every actual death is still recorded;
burst deaths cannot replay the same crisis; save/Continue/succession cannot
reset the counter; real neglect remains actionable. Numerical changes require
separate policy/cohort evidence.

## DC-20261025-04 — Pyrrhic kills and village deeds

**Call:** an actual killed monster counts in the village's historical kill/deed
record even when the bearer dies and the fight result is a loss. Credit the real
killer and only the deed actually performed, once per resolved kill. A death
must not rewrite the event as "nothing happened." Count the genuine kill toward
applicable shared wave-kill requirements; keep living-veteran and present
readiness requirements distinct.

A pyrrhic loss remains a loss. This grants no survived-fight/victory credential,
no XP or ability to the successor for another body's work, no synthetic loot
payment, and no kill credit for a fleeing/despawning enemy. Existing loss/loot
rules are not changed by this deed decision. Knowledge may be taught only from
an actually available witness, recorded Codex or other established source;
unknown cause/attribution stays unknown. Hidden event telemetry is not itself
an NPC's knowledge.

This supersedes the provisional blanket forfeit of wave-unlock deeds. It follows
the village-as-protagonist and actual-attribution rules rather than making death
profitable through an extra reward.

Evidence: evidence/2026-10-17/sim-attrcensus.md and sim-pyrrhic.md; game.js
recordPyrrhicKill currently records history/counter discovery but deliberately
omits scoreLedgerKill while awaiting this call.

Done when: real kill-plus-loss counts the shared kill exactly once, while an
identical loss without a kill does not; reward/body/veteran/knowledge contrasts
remain honest; replay/Continue cannot duplicate credit. Run balanced and native
loss/succession verification before shipping the changed grant boundary.

## DC-20261025-05 — Ending-door tie-breaking

**Call:** a human chooses among actually earned doors with readable stakes. A bot
chooses from its character's known build, preferences and current goals; no
universal beloved-first preference and no hidden-information win maximizer.
Keep beloved-first as an explicitly named historical/control policy where needed
for comparable experiments, not as a law of the game or every playstyle.

This question concerns the modalplay/policy chooser. It does not rewrite
ledger.js endingFrame scores, moral branches or already fixed Table entry state.
A reproducible tie may use a declared stable preference/seeded policy, never
reroll until a win. Unavailable doors must not become executable choices.

Evidence: evidence/2026-10-17/sim-modalplay.md (real100/100ties) and
2026-10-18/journey-endgame-r17.md (explicit community door ordering); TABLE.md.

Done when: every selected door was genuinely offered/earned, choices reflect
named policy/build intent, same seed reproduces, and distinct playstyle/moral
cohorts get their actual endings without quietly replacing difficult losses.
Muse owns controller changes and common-controller recalibration.

## DC-20261025-06 — NPC competition for the seat (#448)

**Call:** NPCs can earn the right to represent the village and outshine the
bearer using the same actual progression/deed standards. A numerical threshold
alone cannot award an offscreen finale win or end the run. Representation and
Table entry must be legible village events under the existing leadership rules;
the resulting Table challenge must actually be played/resolved and remain
losable. The player can support, contend for or refuse a proposal with honest
political consequences, rather than silently reserving every victory for the
controlled body. Do not add a separate cheaper NPC win system.

Declining/postponing the Table does not pause calendar pressure or erase the
optional long-survival/Easter-egg route. NPC heroism and that route therefore
coexist: no hidden NPC threshold abruptly skips the played ending, and no
unmet Table prerequisite creates an indefinite survival shelter.

Evidence: DECISIONS.md's #448 entry, TABLE.md core laws8/9, STEVE-ANSWERS.md's
NPC parity and day150/180 instructions, COHERENCE-SPINE.md's shared ladder.

Done when: a known living NPC earns their own qualifications, real attribution
survives succession, the representation/entry event exposes honest choices,
NPC success and failure use actual Table rules, and a deferred run continues to
face increasing calendar danger. Do not force an NPC win to fix a long sim.

## Work and status discipline

All six are **design decided / implementation to audit**, not claims of live
behavior or Steve's personal approval of every detail. Existing correct behavior
may already satisfy parts; inspect before changing it. Values and readiness bars
not explicitly changed here stay as measured hypotheses. Use JSON/content data
and existing canonical resolvers, not new parallel ledgers or ad hoc outcomes.

Next: execute the linked build-packet rulings by bounded task, distinguish
already implemented from blocked and untested, and put each required change into
one bounded branch with its own negative controls, native action/save proof and
balanced measurement where survival/progression/grants change. Preserve losses,
all watch domains and unknowns. Owner review and ship-loop publication still
apply; this decision record does not deploy gameplay.
