/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'cc0e9bb38-20261106-052413';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=cc0e9bb38-20261106-052413",
  "./src/js/engine/modifiers.js?v=cc0e9bb38-20261106-052413",
  "./src/js/engine/calories.js?v=cc0e9bb38-20261106-052413",
  "./src/js/engine/day.js?v=cc0e9bb38-20261106-052413",
  "./src/js/engine/forage.js?v=cc0e9bb38-20261106-052413",
  "./src/js/engine/combat.js?v=cc0e9bb38-20261106-052413",
  "./src/js/audio-registry.js?v=cc0e9bb38-20261106-052413",
  "./src/js/text.js?v=cc0e9bb38-20261106-052413",
  "./src/js/game.js?v=cc0e9bb38-20261106-052413",
  "./src/js/encounters.js?v=cc0e9bb38-20261106-052413",
  "./src/js/conversation.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convo-mood.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convoTopics.js?v=cc0e9bb38-20261106-052413",
  "./src/js/naming-rite.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convo-wants.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convo-dialogue.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convo-beats.js?v=cc0e9bb38-20261106-052413",
  "./src/js/convo-scene.js?v=cc0e9bb38-20261106-052413",
  "./src/js/voice-piper.js?v=cc0e9bb38-20261106-052413",
  "./src/js/voice-system.js?v=cc0e9bb38-20261106-052413",
  "./src/js/examine.js?v=cc0e9bb38-20261106-052413",
  "./src/js/equipment.js?v=cc0e9bb38-20261106-052413",
  "./src/js/journal.js?v=cc0e9bb38-20261106-052413",
  "./src/js/party.js?v=cc0e9bb38-20261106-052413",
  "./src/js/favor-water.js?v=cc0e9bb38-20261106-052413",
  "./src/js/favor-forage.js?v=cc0e9bb38-20261106-052413",
  "./src/js/favor-outing.js?v=cc0e9bb38-20261106-052413",
  "./src/js/party-formal.js?v=cc0e9bb38-20261106-052413",
  "./src/js/truth.js?v=cc0e9bb38-20261106-052413",
  "./src/js/galactic-cast.js?v=cc0e9bb38-20261106-052413",
  "./src/js/contests.js?v=cc0e9bb38-20261106-052413",
  "./src/js/broadcast.js?v=cc0e9bb38-20261106-052413",
  "./src/js/contestEngine.js?v=cc0e9bb38-20261106-052413",
  "./src/js/alienPlayers.js?v=cc0e9bb38-20261106-052413",
  "./src/js/storage.js?v=cc0e9bb38-20261106-052413",
  "./src/js/perceive.js?v=cc0e9bb38-20261106-052413",
  "./src/js/carexplore.js?v=cc0e9bb38-20261106-052413",
  "./src/js/justice.js?v=cc0e9bb38-20261106-052413",
  "./src/js/food.js?v=cc0e9bb38-20261106-052413",
  "./src/js/betrayal.js?v=cc0e9bb38-20261106-052413",
  "./src/js/corpses.js?v=cc0e9bb38-20261106-052413",
  "./src/js/corruption.js?v=cc0e9bb38-20261106-052413",
  "./src/js/lifeseed.js?v=cc0e9bb38-20261106-052413",
  "./src/js/spawn-knack.js?v=cc0e9bb38-20261106-052413",
  "./src/js/trial-deeds.js?v=cc0e9bb38-20261106-052413",
  "./src/js/practice-deeds.js?v=cc0e9bb38-20261106-052413",
  "./src/js/tracks.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villager-build.js?v=cc0e9bb38-20261106-052413",
  "./src/js/progression.js?v=cc0e9bb38-20261106-052413",
  "./src/js/waveLedger.js?v=cc0e9bb38-20261106-052413",
  "./src/js/standing.js?v=cc0e9bb38-20261106-052413",
  "./src/js/feastBuff.js?v=cc0e9bb38-20261106-052413",
  "./src/js/ledger.js?v=cc0e9bb38-20261106-052413",
  "./src/js/exposure.js?v=cc0e9bb38-20261106-052413",
  "./src/js/abilityActions.js?v=cc0e9bb38-20261106-052413",
  "./src/js/buildarounds.js?v=cc0e9bb38-20261106-052413",
  "./src/js/foodPower.js?v=cc0e9bb38-20261106-052413",
  "./src/js/monsterBehaviors.js?v=cc0e9bb38-20261106-052413",
  "./src/js/partyTactics.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sigW3a.js?v=cc0e9bb38-20261106-052413",
  "./src/js/statusEffects.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sigW3b.js?v=cc0e9bb38-20261106-052413",
  "./src/js/metaProgression.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sigW3c.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sigW4.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sigW5.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villager-agency.js?v=cc0e9bb38-20261106-052413",
  "./src/js/win-plan.js?v=cc0e9bb38-20261106-052413",
  "./src/js/npc-triggers.js?v=cc0e9bb38-20261106-052413",
  "./src/js/fieldFights.js?v=cc0e9bb38-20261106-052413",
  "./src/js/party-wiring.js?v=cc0e9bb38-20261106-052413",
  "./src/js/party-bond.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villager-objectives.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villager-goals.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villager-mapmem.js?v=cc0e9bb38-20261106-052413",
  "./src/js/codex-people.js?v=cc0e9bb38-20261106-052413",
  "./src/js/fallen-memorial.js?v=cc0e9bb38-20261106-052413",
  "./src/js/graves.js?v=cc0e9bb38-20261106-052413",
  "./src/js/membership.js?v=cc0e9bb38-20261106-052413",
  "./src/js/gardenCultivation.js?v=cc0e9bb38-20261106-052413",
  "./src/js/havenGrowth.js?v=cc0e9bb38-20261106-052413",
  "./src/js/shelter.js?v=cc0e9bb38-20261106-052413",
  "./src/js/hierarchy.js?v=cc0e9bb38-20261106-052413",
  "./src/js/scaleDiscovery.js?v=cc0e9bb38-20261106-052413",
  "./src/js/comms.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table.js?v=cc0e9bb38-20261106-052413",
  "./src/js/pods.js?v=cc0e9bb38-20261106-052413",
  "./src/js/titans.js?v=cc0e9bb38-20261106-052413",
  "./src/js/finale-campaign.js?v=cc0e9bb38-20261106-052413",
  "./src/js/godhood.js?v=cc0e9bb38-20261106-052413",
  "./src/js/pantheon.js?v=cc0e9bb38-20261106-052413",
  "./src/js/records.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-feared.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-indispensable.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-beloved.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-witness.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-assimilated.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-defiant.js?v=cc0e9bb38-20261106-052413",
  "./src/js/relay-ext.js?v=cc0e9bb38-20261106-052413",
  "./src/js/relay-dialogue.js?v=cc0e9bb38-20261106-052413",
  "./src/js/table-relay.js?v=cc0e9bb38-20261106-052413",
  "./src/js/safetynets.js?v=cc0e9bb38-20261106-052413",
  "./src/js/villageAgency.js?v=cc0e9bb38-20261106-052413",
  "./src/js/memdepth.js?v=cc0e9bb38-20261106-052413",
  "./src/js/overtime.js?v=cc0e9bb38-20261106-052413",
  "./src/js/network-campaign.js?v=cc0e9bb38-20261106-052413",
  "./src/js/debug-scenarios.js?v=cc0e9bb38-20261106-052413",
  "./src/js/keepsakes.js?v=cc0e9bb38-20261106-052413",
  "./src/js/skill-teaching.js?v=cc0e9bb38-20261106-052413",
  "./src/js/world.js?v=cc0e9bb38-20261106-052413",
  "./src/js/nomad.js?v=cc0e9bb38-20261106-052413",
  "./src/js/nomad-wild.js?v=cc0e9bb38-20261106-052413",
  "./src/js/nomad-scenes.js?v=cc0e9bb38-20261106-052413",
  "./src/js/nomad-drive.js?v=cc0e9bb38-20261106-052413",
  "./src/js/temperature.js?v=cc0e9bb38-20261106-052413",
  "./src/js/godpath.js?v=cc0e9bb38-20261106-052413",
  "./src/js/godverbs.js?v=cc0e9bb38-20261106-052413",
  "./src/js/endingKey.js?v=cc0e9bb38-20261106-052413",
  "./src/js/telemetry-hooks.js?v=cc0e9bb38-20261106-052413",
  "./src/js/feel.js?v=cc0e9bb38-20261106-052413",
  "./src/js/build.js?v=cc0e9bb38-20261106-052413",
  "./src/js/whereAreWe.js?v=cc0e9bb38-20261106-052413",
  "./src/js/drama.js?v=cc0e9bb38-20261106-052413",
  "./src/js/move-anim.js?v=cc0e9bb38-20261106-052413",
  "./src/js/presentation.js?v=cc0e9bb38-20261106-052413",
  "./src/js/sprites.js?v=cc0e9bb38-20261106-052413",
  "./src/js/tile-scenes.js?v=cc0e9bb38-20261106-052413",
  "./src/js/regional-audio.js?v=cc0e9bb38-20261106-052413",
  "./src/js/favor-company.js?v=cc0e9bb38-20261106-052413",
  "./src/js/timeSettlement.js?v=cc0e9bb38-20261106-052413",
  "./src/js/app.js?v=cc0e9bb38-20261106-052413",
  "./src/js/feel-audio.js?v=cc0e9bb38-20261106-052413",
  "./manifest.json?v=cc0e9bb38-20261106-052413",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=cc0e9bb38-20261106-052413",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=cc0e9bb38-20261106-052413",
  "./src/data/alienPlayers.json?v=cc0e9bb38-20261106-052413",
  "./src/data/animals.json?v=cc0e9bb38-20261106-052413",
  "./src/data/arrivalText.json?v=cc0e9bb38-20261106-052413",
  "./src/data/background_survivors.json?v=cc0e9bb38-20261106-052413",
  "./src/data/biomes.json?v=cc0e9bb38-20261106-052413",
  "./src/data/books.json?v=cc0e9bb38-20261106-052413",
  "./src/data/build-notes.json?v=cc0e9bb38-20261106-052413",
  "./src/data/cell_defs.json?v=cc0e9bb38-20261106-052413",
  "./src/data/characterGen.json?v=cc0e9bb38-20261106-052413",
  "./src/data/climates.json?v=cc0e9bb38-20261106-052413",
  "./src/data/contests.json?v=cc0e9bb38-20261106-052413",
  "./src/data/cooking.json?v=cc0e9bb38-20261106-052413",
  "./src/data/events.json?v=cc0e9bb38-20261106-052413",
  "./src/data/evolutions.json?v=cc0e9bb38-20261106-052413",
  "./src/data/favor-rules.json?v=cc0e9bb38-20261106-052413",
  "./src/data/feast-surge.json?v=cc0e9bb38-20261106-052413",
  "./src/data/foreignSpeech.json?v=cc0e9bb38-20261106-052413",
  "./src/data/gardening.json?v=cc0e9bb38-20261106-052413",
  "./src/data/godpaths.json?v=cc0e9bb38-20261106-052413",
  "./src/data/items.json?v=cc0e9bb38-20261106-052413",
  "./src/data/justiceVoice.json?v=cc0e9bb38-20261106-052413",
  "./src/data/knowledge.json?v=cc0e9bb38-20261106-052413",
  "./src/data/lifeseeds.json?v=cc0e9bb38-20261106-052413",
  "./src/data/locations.json?v=cc0e9bb38-20261106-052413",
  "./src/data/monsterBehaviors.json?v=cc0e9bb38-20261106-052413",
  "./src/data/monsters.json?v=cc0e9bb38-20261106-052413",
  "./src/data/nameCultures.json?v=cc0e9bb38-20261106-052413",
  "./src/data/originPicker.json?v=cc0e9bb38-20261106-052413",
  "./src/data/plants.json?v=cc0e9bb38-20261106-052413",
  "./src/data/presentation.json?v=cc0e9bb38-20261106-052413",
  "./src/data/recipes.json?v=cc0e9bb38-20261106-052413",
  "./src/data/regions.json?v=cc0e9bb38-20261106-052413",
  "./src/data/relicEnhancements.json?v=cc0e9bb38-20261106-052413",
  "./src/data/reward-economy.json?v=cc0e9bb38-20261106-052413",
  "./src/data/schemas.json?v=cc0e9bb38-20261106-052413",
  "./src/data/statusEffects.json?v=cc0e9bb38-20261106-052413",
  "./src/data/synergies.json?v=cc0e9bb38-20261106-052413",
  "./src/data/table-beats.json?v=cc0e9bb38-20261106-052413",
  "./src/data/table-endings.json?v=cc0e9bb38-20261106-052413",
  "./src/data/titans.json?v=cc0e9bb38-20261106-052413",
  "./src/data/tracks.json?v=cc0e9bb38-20261106-052413",
  "./src/data/villagers.json?v=cc0e9bb38-20261106-052413",
  "./src/data/wave-ledger.json?v=cc0e9bb38-20261106-052413"
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
