# Steve's answers — god paths, Table, testing

Direct answers from Steve, in his words. **These outrank every summary,
brief, or proposal**, including `opus-brief-ability-system.md` and both
versions of `opus-godpath-proposal.md`. Add new answers at the top, dated,
verbatim.

---

## 2026-10-14 (evening)

**On abilities vs skills:** "We have a slot for skills. I intended abilities
to be gained from a variety of related XP sources. Things acquired from
events and other meaningful experiences, knowledge learned etc should be
typically ending up in skills, unless it fits the magic power theme. There
should be maybe 8 natural level ups plus a few other gifts or events etc that
compete for those 6 slots. I just want everything in its logical
categorization."

**On waiting at the Table:** "waiting should have a cost- but also an
opportunity for the truly powerful. Waves get truly ridiculous and maybe we
can throw an Easter egg monster in at a certain milestone and enough crazy
punishment. Something else on the scale of titan class but even bigger.
Something that has to be fought across the entire map etc. all working as a
key to unlock the best ending for humans at the table. Should be almost
impossible to get. This will present a final target for our game breaking
builds to conquer."

**On the Table prompt:** "It will get annoying if we ask them about the table
every morning after it's available. Make it an option in haven once
unlocked." (Implemented: Haven panel "Take your seat", 116a8b9d.)

**On the Table method:** "The table method we chose is kinda low drama and it
lets the ending be kinda farmed."

## 2026-10-14 (later)

**On the keepsake beam rule:** "Bonded vests blocks beams was never a rule,
probably just a vague suggestion recorded. Look for evidence of a coherent
system in each feature and correct where necessary as it contributes to the
whole." (Rule removed; full coherence audit in
`evidence/2026-10-14/coherence-audit.md`.)

**Q: Should diplomacy, conquest, titan kills, kind/cruel conversation and detective work count toward the ending?**
**A:** "Yes, all of them." (Implemented: ledger event mapping.)

**Q: What is the one source of truth for "a build"?**
**A:** "Redesign it." (Part of the god-path redesign.)

**Q: Should ability gifts offer a choice?**
**A:** "It's supposed to already pick 1 of 3 are you sure it doesn't do this
already? The first ability is pick 1 of 3." (Verified: arrival, contest and
aid offers were choices; the audience-trial gift was not, and is now 1 of 3.)

**Q: What happens if the Table is reached early?**
**A:** "The table should all be relative until actually entering it when it
locks. Even if they qualify early, there's room for them to change or
influence path until they get to the very end." (Implemented: tableInvite.)

## 2026-10-14

Context: `evidence/2026-10-14/opus-assumption-review.md` §5.

**Q: Is the ability brief yours?**
**A:** "Muse's summary." Treat it as a draft; only Steve's direct quotes are law.

**Q: What should the last hour of a winning run feel like?**
**A:** "Both, linked": the titan finale feeds into the Table, and the
Table also plays your build.

**Q: How should god-path work be tested, given sim bots make zero ability uses?**
**A:** "Build a bot": first invest in a sim player that actually uses
abilities and builds, so sims can measure.

**Q: Should a player be able to change light/dark at the Table?**
**A:** "The ending you can win is set as you enter the table, but that
doesn't mean they play the same table scenario or that they can't lose
their scenario no matter what path, light or dark. Each playstyle and
godhood path, moral choice version should have its own ending."

### What follows directly (no interpretation needed)

- Which ending is on offer is fixed at entry, and that's intended.
- Every Table scenario must be **losable**, light or dark. Today 5 of 7 light walks can't fail; that's a defect.
- Scenarios must **differ by playstyle, godhood path and moral side**. Today six paths share one 3-beat menu shape.
- The Table must **read the build**. Today no `table*.js` file reads abilities, gear or godhood.
- The finale campaign must **connect** to the Table.

### Open (needs Steve)

- How "playstyle × godhood path × moral side" combines into a manageable number of endings (see the assumption review follow-up).
