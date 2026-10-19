"use strict";
const K = require("./lib"),
  T = K.reporter("Personal plant knowledge at the mantle");
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
  const G = await K.load({ seed: Number(process.env.SEED || 7) });
  let s, v, me, id, pid, other;
  function fresh() {
    G.over = false;
    G.won = false;
    G.tbfight = null;
    K.newRun(G);
    s = G.state.scholar;
    v = G.state.village;
    me = G.villagerId;
    [id, other] = v.roster.filter((x) => x !== me);
    v.roster = [me, id, other];
    v.health = { [id]: 100, [other]: 100 };
    s.day = 40;
    s.health = 100;
    s.kcal = 2400;
    G.state.codex.plants = {};
    pid =
      G.data.plants.find((p) => p.id === "chickweed")?.id ||
      G.data.plants[0].id;
    v.familiar = { [id]: [] };
    v.taught = { [id]: [] };
    v.plantKnowledge = { [id]: [] };
    v.wrongAbout = { [id]: {} };
    v.trust = { [id]: 10000 };
  }
  function mantle() {
    G.playerDeath("prepared plant-knowledge succession");
    s = G.state.scholar;
    v = G.state.village;
    return G.state.codex.plants[pid];
  }
  fresh();
  G.villagerLearnsPlant(id, pid, "fieldwork");
  let e = mantle();
  T.ok(
    "actual learned plant identity follows the person into bearer knowledge",
    G.villagerId === id && e?.level === 1 && !e.wrongAs,
  );
  T.ok(
    "remembered knowledge is attributed to the actual successor",
    e?.by === "mantle" && e?.rememberedBy === id,
  );
  T.ok(
    "remembering does not fabricate an Explorer discovery or completed deed",
    !v.godpathFieldDiscoveries && !v.godpathDeeds,
  );
  fresh();
  v.familiar[id] = [pid];
  e = mantle();
  T.ok(
    "background familiarity also belongs to the actual person",
    e?.level === 1 && !e.wrongAs,
  );
  fresh();
  v.plantKnowledge[id] = [pid];
  e = mantle();
  T.ok(
    "the legacy personal knowledge store uses the same union",
    e?.level === 1 && !e.wrongAs,
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  G.state.codex.plants[pid] = {
    level: 0,
    harvests: 3,
    tastings: 2,
    prepKnown: ["boil"],
  };
  e = mantle();
  T.ok(
    "personal memory preserves the office existing observations and preparation",
    e?.level === 1 &&
      e.harvests === 3 &&
      e.tastings === 2 &&
      e.prepKnown[0] === "boil",
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  G.state.codex.plants[pid] = { level: 3, harvests: 8, by: "fieldwork" };
  const known = JSON.stringify(G.state.codex.plants[pid]);
  e = mantle();
  T.ok(
    "existing deeper correct written knowledge is never lowered or rewritten",
    JSON.stringify(e) === known,
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  const wrong = G.data.plants.find((p) => p.id !== pid);
  v.wrongAbout[id][pid] = { wrongPid: wrong.id, deliberate: false };
  e = mantle();
  T.ok(
    "an honest mistaken memory does not become secretly correct knowledge",
    e?.level === 1 && e.wrongPid === wrong.id && e.wrongAs === wrong.name,
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  v.wrongAbout[id][pid] = { wrongPid: wrong.id, deliberate: true };
  e = mantle();
  T.ok(
    "a deliberate liar remembers the identity they knowingly concealed",
    e?.level === 1 && !e.wrongAs && !e.wrongPid,
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  v.wrongAbout[id][pid] = { wrongPid: wrong.id, deliberate: false };
  G.state.codex.plants[pid] = { level: 2, by: "tested", tested: "safe" };
  const correct = JSON.stringify(G.state.codex.plants[pid]);
  e = mantle();
  T.ok(
    "a mistaken successor cannot overwrite a correct written record",
    JSON.stringify(e) === correct,
  );
  fresh();
  G.villagerLearnsPlant(other, pid, "taught");
  e = mantle();
  T.ok("someone else knowledge does not transfer with this successor", !e);
  fresh();
  G.villagerLearnsPlant(id, pid, "taught");
  G.state.codex.plants[pid] = {
    level: 2,
    harvests: 4,
    wrongAs: wrong.name,
    wrongPid: wrong.id,
    taughtBy: other,
    taughtByName: "Prepared mistaken teacher",
  };
  e = mantle();
  T.ok(
    "actual correct personal memory clears a false written label without losing depth",
    e?.level === 2 &&
      e.harvests === 4 &&
      !e.wrongAs &&
      !e.wrongPid &&
      e.contested?.by === other,
  );
  fresh();
  v.taught[id] = ["missing_memory_plant"];
  e = mantle();
  T.ok(
    "unknown legacy plant IDs cannot invent named content",
    !G.state.codex.plants.missing_memory_plant,
  );
  fresh();
  G.villagerLearnsPlant(id, pid, "fieldwork");
  mantle();
  G.startConvo(other);
  G.convoTurn(other, "teach");
  T.ok(
    "the successor can actually teach their own remembered identity",
    G.plantKnownBy(other, pid) && !v.godpathDeeds && !v.godpathFieldDiscoveries,
  );
  G.save();
  const key = G.state.runKey;
  G.state.codex.plants = {};
  const loaded = G.load(key);
  s = G.state.scholar;
  v = G.state.village;
  T.ok(
    "real save/load restores the successor remembered identity and owner",
    loaded &&
      G.plantKnown(pid) &&
      G.state.codex.plants[pid].rememberedBy === id,
  );
  T.done();
})().catch((e) => {
  console.error(e.stack);
  process.exitCode = 1;
});
