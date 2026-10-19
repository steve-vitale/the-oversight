"use strict";
const K = require("./lib"),
  T = K.reporter("Explorer assigned forage discovery");
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) });
  let s, v, me, id, other, pid, fieldReturn;
  const learn = G.villagerLearnsPlant;
  G.villagerLearnsPlant = function (who, p, via) {
    const r = learn.apply(this, arguments);
    if (who === id && p === pid && via === "fieldwork") fieldReturn = r;
    return r;
  };
  function fresh(system = true) {
    G.over = false;
    G.won = false;
    G.tbfight = null;
    K.newRun(G);
    s = G.state.scholar;
    v = G.state.village;
    me = G.villagerId;
    [id, other] = v.roster.filter((x) => x !== me);
    pid = G.data.plants[0].id;
    v.roster = [me, id, other];
    s.day = system ? 85 : 1;
    s.health = 100;
    s.kcal = 2400;
    G.state.systemArrived = system;
    G.state.codex.plants = {};
    v.taught = {};
    v.familiar = {};
    v.plantKnowledge = {};
    v.sharedKnowledge = {};
    v.wrongAbout = { [id]: {}, [other]: {} };
    v.pantry = [];
    v.health = { [id]: 100, [other]: 100 };
    G.getPerson(id).personality.curiosity = "steady";
    fieldReturn = undefined;
  }
  function forage() {
    const random = Math.random;
    try {
      Math.random = () => 0;
      G.resolveOneAssignment(id, { task: "forage" });
    } finally {
      Math.random = random;
    }
  }
  fresh();
  forage();
  T.ok(
    "actual ordinary forage duty discovers a real catalog plant without curiosity",
    G.plantKnownBy(id, pid) &&
      v.sharedKnowledge[pid]?.discoveredBy === id &&
      G.getPerson(id).personality.curiosity === "steady",
  );
  T.ok(
    "the actual discoverer gets their own unfinished fieldwork record",
    !!v.godpathFieldDiscoveries?.[id]?.[pid] &&
      !v.godpathDeeds?.[id]?.field_truth_shared,
  );
  T.ok(
    "System feed can make the final personal store write redundant without erasing the discovery",
    fieldReturn === false,
  );
  v.homecomingFireside = true;
  G.firesideTeaching(true);
  const deed = v.godpathDeeds?.[id]?.field_truth_shared;
  T.ok(
    "an actual later fireside lesson completes the same personal deed",
    deed?.plant === pid &&
      deed?.recipient === other &&
      deed?.via === "fireside",
  );
  T.ok(
    "ordinary work does not transfer accomplishment to the bearer",
    !v.godpathDeeds?.[me]?.field_truth_shared,
  );
  fresh(false);
  forage();
  T.ok(
    "the same real fieldwork before the System also earns personal discovery",
    fieldReturn === true && !!v.godpathFieldDiscoveries?.[id]?.[pid],
  );
  fresh();
  v.sharedKnowledge[pid] = { discoveredBy: id, day: 1, level: 1 };
  forage();
  G.flowVillageKnowledge();
  T.ok(
    "an old shared map or a direct feed cannot backfill a personal discovery",
    !v.godpathFieldDiscoveries?.[id]?.[pid],
  );
  fresh();
  v.pantry = [
    {
      name: "Prepared stores",
      units: 200,
      kcalEach: 500,
      kg: 0.1,
      safe: true,
      spoilDay: 9999,
    },
  ];
  forage();
  T.ok(
    "actual surplus redirection is ordinary wood work, not an invented forage discovery",
    (v.throttleRedirects || 0) > 0 && !v.godpathFieldDiscoveries?.[id]?.[pid],
  );
  T.done();
})().catch((e) => {
  console.error(e.stack);
  process.exitCode = 1;
});
