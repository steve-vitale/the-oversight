"use strict";
const K = require("./lib"),
  T = K.reporter("Explorer discover-and-share deed");
(async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  const G = await K.load({ seed: Number(process.env.SEED || 7) }),
    GH = globalThis.Scattering.Godhood;
  let s, v, me, npc, other, pid, roster;
  const kit = ["prophecy", "foresight", "echo_location", "dowsing"];
  function fresh() {
    G.over = false;
    G.won = false;
    G.tbfight = null;
    K.newRun(G);
    s = G.state.scholar;
    v = G.state.village;
    me = G.villagerId;
    [npc, other] = v.roster.filter((id) => id !== me);
    roster = [me, npc, other];
    v.roster = roster.slice();
    s.day = 85;
    s.health = 100;
    s.kcal = 6000;
    s.integration = 50;
    s.abilities = kit.map((id) => ({ id, level: 1 }));
    s.backgroundAbilities = [];
    s.activeSynergies = [];
    s.godhood = { active: [], recognized: {} };
    G.state.systemArrived = true;
    G.state.codex.plants = {};
    G.state.codex.encounters = {};
    pid =
      G.data.plants.find((p) => p.id === "chickweed")?.id ||
      G.data.plants[0].id;
    v.sharedKnowledge = {};
    v.fieldNotes = {};
    v.familiar = {};
    v.taught = {};
    v.plantKnowledge = {};
    v.wrongAbout = {};
    v.away = {};
    v.health = { [npc]: 100, [other]: 100 };
    v.pantry = [
      {
        name: "Prepared stores",
        units: 200,
        kcalEach: 500,
        safe: true,
        spoilDay: 9999,
      },
    ];
    for (const id of roster) v.wrongAbout[id] = {};
    G.recognizeClass("player");
  }
  const status = (who = "player") =>
      G.godpathDeedStatus(who, "all_seeing") || {
        observed: false,
        complete: false,
      },
    book = (id = G.villagerId) => v.godpathDeeds?.[id]?.field_truth_shared,
    pending = (id = me) => v.godpathFieldDiscoveries?.[id]?.[pid];
  function discover() {
    v.roster = [me];
    G.state.codex.encounters[pid] = 99;
    s.prepStash = [
      {
        name: "Unknown shoots",
        lump: { [pid]: { units: 6 } },
        units: 6,
        foodState: "unknown",
        edible: false,
        spoilDay: 100,
      },
    ];
    G.sortBag(null, 0, s.prepStash);
    v.roster = roster.slice();
  }
  // One explicit successful rumor settlement, not repeated chance rolls.
  function spreadOnce() {
    const random = Math.random;
    try { Math.random = () => 0.01; G.spreadPlantKnowledge(); }
    finally { Math.random = random; }
  }
  function teach(id = npc) {
    G.startConvo(id);
    return G.convoTurn(id, "teach");
  }
  function npcDiscover() {
    v.familiar[npc] = G.data.plants
      .filter((p) => p.id !== pid)
      .map((p) => p.id);
    G.getPerson(npc).personality.curiosity = "curious";
    for (let i = 0; i < 3; i++) G.villagerCuriousExamine(npc);
  }
  fresh();
  T.ok(
    "prepared four-magic build fits the actual slot capacity",
    G.abilitySlots() >= s.abilities.length,
  );
  s.godpath.since = 1;
  s.activeSynergies = GH.byId("all_seeing").requires.synergies.slice();
  const state = JSON.stringify(G.state);
  T.ok(
    "class age and old synergies cannot replace personal knowledge work",
    !GH.godhoodCloseness(s, GH.byId("all_seeing"), 85).synergy &&
      !status().observed,
  );
  T.ok(
    "missing-history reads stay pure",
    JSON.stringify(G.state) === state &&
      !v.godpathDeeds &&
      !v.godpathFieldDiscoveries,
  );
  fresh();
  discover();
  T.ok(
    "actual field-click sorting identifies the unknown carried plant",
    G.plantKnown(pid) && s.prepStash.some((i) => i.plantId === pid),
  );
  T.ok(
    "fieldwork belongs to its actual discoverer but is not the completed deed",
    !!pending() && !status().complete,
  );
  teach();
  T.ok(
    "actual conversation teaches a distinct new knower and completes the outcome",
    G.plantKnownBy(npc, pid) &&
      status().complete &&
      book()?.recipient === npc &&
      book()?.plant === pid &&
      book()?.via === "player-taught",
  );
  T.ok(
    "the ordinary full-build/day80 gate stays real",
    GH.godhoodCloseness(s, GH.byId("all_seeing"), 85).complete &&
      !GH.godhoodCloseness(s, GH.byId("all_seeing"), 79).complete,
  );
  fresh();
  G.villagerLearnsPlant(me, pid, "fieldwork");
  T.ok(
    "the generic knowledge primitive cannot invent a field discovery",
    !pending() && !status().observed,
  );
  fresh();
  G.identifyPlant(pid, "taught");
  teach();
  T.ok(
    "teaching inherited or externally supplied knowledge is not personal discovery",
    !status().observed,
  );
  fresh();
  discover();
  s.godpath.since = 1;
  G.checkPlayerGodhoodAscension();
  T.ok(
    "discovery without a landed new lesson cannot ascend",
    !s.godhood.active.includes("all_seeing"),
  );
  fresh();
  npcDiscover();
  T.ok(
    "actual three-look NPC observation earns that person pending fieldwork",
    G.plantKnownBy(npc, pid) &&
      !!pending(npc) &&
      !status(npc).observed &&
      !pending(me),
  );
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  T.ok(
    "actual fireside settlement gives the NPC teacher the same outcome",
    status(npc).complete &&
      book(npc)?.plant === pid &&
      book(npc)?.via === "fireside" &&
      !status().observed,
  );
  fresh();
  npcDiscover();
  v.wrongAbout[npc][pid] = {
    wrongPid: G.data.plants.find((p) => p.id !== pid).id,
    deliberate: true,
  };
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  T.ok(
    "a false-name lesson cannot complete true knowledge sharing",
    !status(npc).observed,
  );
  fresh();
  discover();
  G.save();
  const key = G.state.runKey;
  v.godpathFieldDiscoveries = {};
  G.load(key);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "explicit load restores the personal unfinished discovery",
    !!pending() && !status().complete,
  );
  teach();
  const receipt = JSON.stringify(book());
  G.save();
  const key2 = G.state.runKey;
  v.godpathDeeds = {};
  G.load(key2);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "explicit load restores the completed recipient-bound deed",
    status().complete && JSON.stringify(book()) === receipt,
  );
  fresh();
  discover();
  T.ok(
    "known Explorer objective distinguishes pending discovery from completion",
    status().pending && /Discovery made/.test(G.godpathDeedHint("player")),
  );
  teach();
  const first = JSON.stringify(book());
  teach(other);
  T.ok(
    "a second real learner cannot replace the first accomplishment",
    G.plantKnownBy(other, pid) && JSON.stringify(book()) === first,
  );
  fresh();
  discover();
  G.villagerLearnsPlant(npc, pid, "taught");
  teach();
  T.ok(
    "an already-known recipient and repeated dialogue cannot invent new teaching",
    !status().observed,
  );
  fresh();
  discover();
  v.away[npc] = true;
  teach();
  T.ok(
    "an absent recipient cannot count as a real listener",
    !status().observed,
  );
  fresh();
  discover();
  G.getPerson(npc).dead = true;
  teach();
  T.ok(
    "a dead recipient cannot complete the personal lesson",
    !status().observed,
  );
  fresh();
  discover();
  v.health[npc] = 0;
  teach();
  T.ok(
    "a zero-health recipient cannot complete the personal lesson",
    !status().observed,
  );
  fresh();
  discover();
  G.state.codex.plants[pid].wrongAs = "A false name";
  G.state.codex.plants[pid].wrongPid = G.data.plants.find(
    (p) => p.id !== pid,
  ).id;
  teach();
  T.ok(
    "a later false belief cannot be promoted as true field knowledge",
    !status().observed,
  );
  fresh();
  discover();
  v.wrongAbout[npc][pid] = {
    wrongPid: G.data.plants.find((p) => p.id !== pid).id,
    deliberate: false,
  };
  teach();
  T.ok(
    "a learner retaining the wrong identity cannot count as a correct new knower",
    !status().observed,
  );
  fresh();
  npcDiscover();
  v.taught[npc] = [];
  v.plantKnowledge[npc] = [];
  G.getPerson(npc).dead = true;
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  T.ok(
    "a stale dead discoverer cannot earn a posthumous lesson",
    !status(npc).observed,
  );
  fresh();
  npcDiscover();
  v.away[npc] = true;
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  T.ok(
    "a departed discoverer cannot claim a fireside lesson",
    !status(npc).observed,
  );
  fresh();
  discover();
  v.trust = { [npc]: 10000 };
  G.playerDeath("prepared Explorer succession");
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "a successor cannot borrow the predecessor unfinished fieldwork",
    G.villagerId === npc &&
      !status().complete &&
      !pending(npc) &&
      !!pending(me),
  );
  fresh();
  npcDiscover();
  v.trust = { [npc]: 10000 };
  G.playerDeath("prepared discoverer succession");
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "an NPC discoverer retains their own unfinished work as bearer",
    G.villagerId === npc && status().pending && G.plantKnown(pid),
  );
  v.familiar[other] = G.data.plants
    .filter((p) => p.id !== pid)
    .map((p) => p.id);
  teach(other);
  T.ok(
    "that same person can finish their own real lesson after the mantle",
    status().complete && book()?.recipient === other,
  );
  fresh();
  discover();
  teach();
  G.checkPlayerGodhoodAscension();
  T.ok(
    "the actual personal outcome and prepared full build reach ceremony",
    s.godhood.active.includes("all_seeing") &&
      s.godhood.recognized.all_seeing === 85 &&
      s.inventory.some((i) => i.itemId === "truth_lenses"),
  );
  fresh();
  npcDiscover();
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  v.npcAbilities = { [npc]: kit };
  G.recognizeClass(npc);
  G.checkVillagerGodhoodAscension(npc);
  T.ok(
    "the same actual NPC outcome and full build reach NPC ceremony",
    v.npcGodhood?.[npc]?.active.includes("all_seeing") &&
      v.npcGodhood[npc].recognized.all_seeing === 85 &&
      G.vpOf(npc).items.some(i => (typeof i === "string" ? i : i.itemId || i.id) === "truth_lenses"),
  );
  fresh();
  s.godhood = { active: ["all_seeing"], recognized: { all_seeing: 84 } };
  G.checkPlayerGodhoodAscension();
  T.ok(
    "existing active gods need no retroactive fieldwork",
    s.godhood.active.includes("all_seeing") &&
      !status().observed &&
      G.godpathDeedHint("player") === null,
  );
  fresh();
  npcDiscover();
  s.prepStash = [
    {
      name: "Unknown shoots",
      lump: { [pid]: { units: 6 } },
      units: 6,
      foodState: "unknown",
      edible: false,
      spoilDay: 100,
    },
  ];
  G.sortBag(npc, 0, s.prepStash);
  T.ok(
    "an NPC discoverer can complete a real sorting lesson to the player",
    G.plantKnown(pid) &&
      status(npc).complete &&
      book(npc)?.recipient === me &&
      book(npc)?.via === "taught",
  );
  fresh();
  npcDiscover();
  G.getPerson(npc).formerOccupation = "Chef";
  G.getPerson(npc).languages = { native: "english", levels: { english: 2 } };
  G.getPerson(me).languages = { native: "english", levels: { english: 2 } };
  v.trust[npc] = 100;
  G.teachPlant(npc, pid);
  T.ok(
    "a real successful direct NPC lesson can finish their own discovery",
    G.plantKnown(pid) && status(npc).complete && book(npc)?.recipient === me,
  );
  fresh();
  npcDiscover();
  v.trust[npc] = 0;
  G.getPerson(npc).formerOccupation = "Mechanic";
  G.teachPlant(npc, pid);
  T.ok(
    "a partial lesson without a learned identity cannot complete the deed",
    !G.plantKnown(pid) && !status(npc).complete,
  );
  fresh();
  npcDiscover();
  spreadOnce();
  T.ok(
    "actual word-of-mouth settlement credits the named discoverer who taught it",
    status(npc).complete &&
      book(npc)?.via === "word of mouth" &&
      book(npc)?.recipient === other,
  );
  fresh();
  discover();
  spreadOnce();
  T.ok(
    "the player same knowledge-sharing process has the same outcome",
    status().complete &&
      book()?.via === "word of mouth" &&
      [npc, other].includes(book()?.recipient),
  );
  fresh();
  s.abilities = [
    "cartographers_eye",
    "echo_location",
    "dowsing",
    "water_breathing",
  ].map((id) => ({ id, level: 1 }));
  G.recognizeClass("player");
  discover();
  teach();
  G.checkPlayerGodhoodAscension();
  T.ok(
    "Cartographer can earn the same fieldwork outcome without a Seer kit",
    G.godpathClass("player")?.subclass === "cartographer" &&
      s.godhood.active.includes("all_seeing"),
  );
  fresh();
  G.villagerLearnsPlant(npc, pid, "fieldwork");
  v.sharedKnowledge[pid] = { discoveredBy: npc, day: 1, level: 1 };
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  T.ok(
    "old shared counters cannot backfill missing personal discovery history",
    !pending(npc) && !status(npc).observed,
  );
  T.done();
})().catch((e) => {
  console.error(e.stack);
  process.exitCode = 1;
});
