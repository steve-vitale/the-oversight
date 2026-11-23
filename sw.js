/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'db2e9a3df-20261123-112449';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=db2e9a3df-20261123-112449",
  "./src/js/engine/modifiers.js?v=db2e9a3df-20261123-112449",
  "./src/js/engine/calories.js?v=db2e9a3df-20261123-112449",
  "./src/js/engine/day.js?v=db2e9a3df-20261123-112449",
  "./src/js/engine/forage.js?v=db2e9a3df-20261123-112449",
  "./src/js/engine/combat.js?v=db2e9a3df-20261123-112449",
  "./src/js/audio-registry.js?v=db2e9a3df-20261123-112449",
  "./src/js/text.js?v=db2e9a3df-20261123-112449",
  "./src/js/game.js?v=db2e9a3df-20261123-112449",
  "./src/js/encounters.js?v=db2e9a3df-20261123-112449",
  "./src/js/conversation.js?v=db2e9a3df-20261123-112449",
  "./src/js/convo-mood.js?v=db2e9a3df-20261123-112449",
  "./src/js/convoTopics.js?v=db2e9a3df-20261123-112449",
  "./src/js/naming-rite.js?v=db2e9a3df-20261123-112449",
  "./src/js/convo-wants.js?v=db2e9a3df-20261123-112449",
  "./src/js/convo-dialogue.js?v=db2e9a3df-20261123-112449",
  "./src/js/convo-beats.js?v=db2e9a3df-20261123-112449",
  "./src/js/convo-scene.js?v=db2e9a3df-20261123-112449",
  "./src/js/voice-piper.js?v=db2e9a3df-20261123-112449",
  "./src/js/voice-system.js?v=db2e9a3df-20261123-112449",
  "./src/js/examine.js?v=db2e9a3df-20261123-112449",
  "./src/js/equipment.js?v=db2e9a3df-20261123-112449",
  "./src/js/journal.js?v=db2e9a3df-20261123-112449",
  "./src/js/party.js?v=db2e9a3df-20261123-112449",
  "./src/js/favor-water.js?v=db2e9a3df-20261123-112449",
  "./src/js/favor-forage.js?v=db2e9a3df-20261123-112449",
  "./src/js/favor-outing.js?v=db2e9a3df-20261123-112449",
  "./src/js/party-formal.js?v=db2e9a3df-20261123-112449",
  "./src/js/truth.js?v=db2e9a3df-20261123-112449",
  "./src/js/galactic-cast.js?v=db2e9a3df-20261123-112449",
  "./src/js/contests.js?v=db2e9a3df-20261123-112449",
  "./src/js/broadcast.js?v=db2e9a3df-20261123-112449",
  "./src/js/contestEngine.js?v=db2e9a3df-20261123-112449",
  "./src/js/alienPlayers.js?v=db2e9a3df-20261123-112449",
  "./src/js/storage.js?v=db2e9a3df-20261123-112449",
  "./src/js/perceive.js?v=db2e9a3df-20261123-112449",
  "./src/js/carexplore.js?v=db2e9a3df-20261123-112449",
  "./src/js/justice.js?v=db2e9a3df-20261123-112449",
  "./src/js/food.js?v=db2e9a3df-20261123-112449",
  "./src/js/betrayal.js?v=db2e9a3df-20261123-112449",
  "./src/js/corpses.js?v=db2e9a3df-20261123-112449",
  "./src/js/corruption.js?v=db2e9a3df-20261123-112449",
  "./src/js/lifeseed.js?v=db2e9a3df-20261123-112449",
  "./src/js/spawn-knack.js?v=db2e9a3df-20261123-112449",
  "./src/js/trial-deeds.js?v=db2e9a3df-20261123-112449",
  "./src/js/practice-deeds.js?v=db2e9a3df-20261123-112449",
  "./src/js/tracks.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-build.js?v=db2e9a3df-20261123-112449",
  "./src/js/progression.js?v=db2e9a3df-20261123-112449",
  "./src/js/waveLedger.js?v=db2e9a3df-20261123-112449",
  "./src/js/standing.js?v=db2e9a3df-20261123-112449",
  "./src/js/ladder.js?v=db2e9a3df-20261123-112449",
  "./src/js/feastBuff.js?v=db2e9a3df-20261123-112449",
  "./src/js/ledger.js?v=db2e9a3df-20261123-112449",
  "./src/js/exposure.js?v=db2e9a3df-20261123-112449",
  "./src/js/abilityActions.js?v=db2e9a3df-20261123-112449",
  "./src/js/buildarounds.js?v=db2e9a3df-20261123-112449",
  "./src/js/foodPower.js?v=db2e9a3df-20261123-112449",
  "./src/js/monsterBehaviors.js?v=db2e9a3df-20261123-112449",
  "./src/js/partyTactics.js?v=db2e9a3df-20261123-112449",
  "./src/js/sigW3a.js?v=db2e9a3df-20261123-112449",
  "./src/js/statusEffects.js?v=db2e9a3df-20261123-112449",
  "./src/js/sigW3b.js?v=db2e9a3df-20261123-112449",
  "./src/js/metaProgression.js?v=db2e9a3df-20261123-112449",
  "./src/js/sigW3c.js?v=db2e9a3df-20261123-112449",
  "./src/js/sigW4.js?v=db2e9a3df-20261123-112449",
  "./src/js/sigW5.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-agency.js?v=db2e9a3df-20261123-112449",
  "./src/js/win-plan.js?v=db2e9a3df-20261123-112449",
  "./src/js/npc-triggers.js?v=db2e9a3df-20261123-112449",
  "./src/js/fieldFights.js?v=db2e9a3df-20261123-112449",
  "./src/js/party-wiring.js?v=db2e9a3df-20261123-112449",
  "./src/js/party-bond.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-objectives.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-goals.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-brain.js?v=db2e9a3df-20261123-112449",
  "./src/js/bond-initiation.js?v=db2e9a3df-20261123-112449",
  "./src/js/villager-mapmem.js?v=db2e9a3df-20261123-112449",
  "./src/js/codex-people.js?v=db2e9a3df-20261123-112449",
  "./src/js/fallen-memorial.js?v=db2e9a3df-20261123-112449",
  "./src/js/graves.js?v=db2e9a3df-20261123-112449",
  "./src/js/membership.js?v=db2e9a3df-20261123-112449",
  "./src/js/gardenCultivation.js?v=db2e9a3df-20261123-112449",
  "./src/js/havenGrowth.js?v=db2e9a3df-20261123-112449",
  "./src/js/shelter.js?v=db2e9a3df-20261123-112449",
  "./src/js/hierarchy.js?v=db2e9a3df-20261123-112449",
  "./src/js/scaleDiscovery.js?v=db2e9a3df-20261123-112449",
  "./src/js/comms.js?v=db2e9a3df-20261123-112449",
  "./src/js/table.js?v=db2e9a3df-20261123-112449",
  "./src/js/pods.js?v=db2e9a3df-20261123-112449",
  "./src/js/titans.js?v=db2e9a3df-20261123-112449",
  "./src/js/finale-campaign.js?v=db2e9a3df-20261123-112449",
  "./src/js/godhood.js?v=db2e9a3df-20261123-112449",
  "./src/js/pantheon.js?v=db2e9a3df-20261123-112449",
  "./src/js/records.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-feared.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-indispensable.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-beloved.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-witness.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-assimilated.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-defiant.js?v=db2e9a3df-20261123-112449",
  "./src/js/relay-ext.js?v=db2e9a3df-20261123-112449",
  "./src/js/relay-dialogue.js?v=db2e9a3df-20261123-112449",
  "./src/js/table-relay.js?v=db2e9a3df-20261123-112449",
  "./src/js/safetynets.js?v=db2e9a3df-20261123-112449",
  "./src/js/villageAgency.js?v=db2e9a3df-20261123-112449",
  "./src/js/memdepth.js?v=db2e9a3df-20261123-112449",
  "./src/js/overtime.js?v=db2e9a3df-20261123-112449",
  "./src/js/network-campaign.js?v=db2e9a3df-20261123-112449",
  "./src/js/debug-scenarios.js?v=db2e9a3df-20261123-112449",
  "./src/js/keepsakes.js?v=db2e9a3df-20261123-112449",
  "./src/js/skill-teaching.js?v=db2e9a3df-20261123-112449",
  "./src/js/person-trust.js?v=db2e9a3df-20261123-112449",
  "./src/js/companion-score.js?v=db2e9a3df-20261123-112449",
  "./src/js/world.js?v=db2e9a3df-20261123-112449",
  "./src/js/nomad.js?v=db2e9a3df-20261123-112449",
  "./src/js/nomad-wild.js?v=db2e9a3df-20261123-112449",
  "./src/js/nomad-scenes.js?v=db2e9a3df-20261123-112449",
  "./src/js/nomad-drive.js?v=db2e9a3df-20261123-112449",
  "./src/js/temperature.js?v=db2e9a3df-20261123-112449",
  "./src/js/godpath.js?v=db2e9a3df-20261123-112449",
  "./src/js/godverbs.js?v=db2e9a3df-20261123-112449",
  "./src/js/endingKey.js?v=db2e9a3df-20261123-112449",
  "./src/js/telemetry-hooks.js?v=db2e9a3df-20261123-112449",
  "./src/js/finishLog.js?v=db2e9a3df-20261123-112449",
  "./src/js/feel.js?v=db2e9a3df-20261123-112449",
  "./src/js/build.js?v=db2e9a3df-20261123-112449",
  "./src/js/whereAreWe.js?v=db2e9a3df-20261123-112449",
  "./src/js/drama.js?v=db2e9a3df-20261123-112449",
  "./src/js/move-anim.js?v=db2e9a3df-20261123-112449",
  "./src/js/presentation.js?v=db2e9a3df-20261123-112449",
  "./src/js/sprites.js?v=db2e9a3df-20261123-112449",
  "./src/js/tile-scenes.js?v=db2e9a3df-20261123-112449",
  "./src/js/regional-audio.js?v=db2e9a3df-20261123-112449",
  "./src/js/favor-company.js?v=db2e9a3df-20261123-112449",
  "./src/js/timeSettlement.js?v=db2e9a3df-20261123-112449",
  "./src/js/app.js?v=db2e9a3df-20261123-112449",
  "./src/js/feel-audio.js?v=db2e9a3df-20261123-112449",
  "./manifest.json?v=db2e9a3df-20261123-112449",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=db2e9a3df-20261123-112449",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=db2e9a3df-20261123-112449",
  "./src/data/alienPlayers.json?v=db2e9a3df-20261123-112449",
  "./src/data/animals.json?v=db2e9a3df-20261123-112449",
  "./src/data/arrivalText.json?v=db2e9a3df-20261123-112449",
  "./src/data/background_survivors.json?v=db2e9a3df-20261123-112449",
  "./src/data/biomes.json?v=db2e9a3df-20261123-112449",
  "./src/data/books.json?v=db2e9a3df-20261123-112449",
  "./src/data/build-notes.json?v=db2e9a3df-20261123-112449",
  "./src/data/cell_defs.json?v=db2e9a3df-20261123-112449",
  "./src/data/characterGen.json?v=db2e9a3df-20261123-112449",
  "./src/data/climates.json?v=db2e9a3df-20261123-112449",
  "./src/data/contests.json?v=db2e9a3df-20261123-112449",
  "./src/data/cooking.json?v=db2e9a3df-20261123-112449",
  "./src/data/events.json?v=db2e9a3df-20261123-112449",
  "./src/data/evolutions.json?v=db2e9a3df-20261123-112449",
  "./src/data/favor-rules.json?v=db2e9a3df-20261123-112449",
  "./src/data/feast-surge.json?v=db2e9a3df-20261123-112449",
  "./src/data/foreignSpeech.json?v=db2e9a3df-20261123-112449",
  "./src/data/gardening.json?v=db2e9a3df-20261123-112449",
  "./src/data/godpaths.json?v=db2e9a3df-20261123-112449",
  "./src/data/items.json?v=db2e9a3df-20261123-112449",
  "./src/data/justiceVoice.json?v=db2e9a3df-20261123-112449",
  "./src/data/knowledge.json?v=db2e9a3df-20261123-112449",
  "./src/data/ladder-capstones.json?v=db2e9a3df-20261123-112449",
  "./src/data/lifeseeds.json?v=db2e9a3df-20261123-112449",
  "./src/data/locations.json?v=db2e9a3df-20261123-112449",
  "./src/data/monsterBehaviors.json?v=db2e9a3df-20261123-112449",
  "./src/data/monsters.json?v=db2e9a3df-20261123-112449",
  "./src/data/nameCultures.json?v=db2e9a3df-20261123-112449",
  "./src/data/originPicker.json?v=db2e9a3df-20261123-112449",
  "./src/data/pellet-boost.json?v=db2e9a3df-20261123-112449",
  "./src/data/plants.json?v=db2e9a3df-20261123-112449",
  "./src/data/presentation.json?v=db2e9a3df-20261123-112449",
  "./src/data/recipes.json?v=db2e9a3df-20261123-112449",
  "./src/data/regions.json?v=db2e9a3df-20261123-112449",
  "./src/data/relicEnhancements.json?v=db2e9a3df-20261123-112449",
  "./src/data/reward-economy.json?v=db2e9a3df-20261123-112449",
  "./src/data/schemas.json?v=db2e9a3df-20261123-112449",
  "./src/data/statusEffects.json?v=db2e9a3df-20261123-112449",
  "./src/data/synergies.json?v=db2e9a3df-20261123-112449",
  "./src/data/table-beats.json?v=db2e9a3df-20261123-112449",
  "./src/data/table-endings.json?v=db2e9a3df-20261123-112449",
  "./src/data/titans.json?v=db2e9a3df-20261123-112449",
  "./src/data/tracks.json?v=db2e9a3df-20261123-112449",
  "./src/data/villagers.json?v=db2e9a3df-20261123-112449",
  "./src/data/wave-ledger.json?v=db2e9a3df-20261123-112449"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
