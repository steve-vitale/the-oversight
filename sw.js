/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = '47558486c-20261027-052413';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=47558486c-20261027-052413",
  "./src/js/engine/modifiers.js?v=47558486c-20261027-052413",
  "./src/js/engine/calories.js?v=47558486c-20261027-052413",
  "./src/js/engine/day.js?v=47558486c-20261027-052413",
  "./src/js/engine/forage.js?v=47558486c-20261027-052413",
  "./src/js/engine/combat.js?v=47558486c-20261027-052413",
  "./src/js/audio-registry.js?v=47558486c-20261027-052413",
  "./src/js/text.js?v=47558486c-20261027-052413",
  "./src/js/game.js?v=47558486c-20261027-052413",
  "./src/js/encounters.js?v=47558486c-20261027-052413",
  "./src/js/conversation.js?v=47558486c-20261027-052413",
  "./src/js/convo-mood.js?v=47558486c-20261027-052413",
  "./src/js/convoTopics.js?v=47558486c-20261027-052413",
  "./src/js/naming-rite.js?v=47558486c-20261027-052413",
  "./src/js/convo-wants.js?v=47558486c-20261027-052413",
  "./src/js/convo-dialogue.js?v=47558486c-20261027-052413",
  "./src/js/convo-beats.js?v=47558486c-20261027-052413",
  "./src/js/convo-scene.js?v=47558486c-20261027-052413",
  "./src/js/voice-piper.js?v=47558486c-20261027-052413",
  "./src/js/voice-system.js?v=47558486c-20261027-052413",
  "./src/js/examine.js?v=47558486c-20261027-052413",
  "./src/js/equipment.js?v=47558486c-20261027-052413",
  "./src/js/journal.js?v=47558486c-20261027-052413",
  "./src/js/party.js?v=47558486c-20261027-052413",
  "./src/js/favor-water.js?v=47558486c-20261027-052413",
  "./src/js/party-formal.js?v=47558486c-20261027-052413",
  "./src/js/truth.js?v=47558486c-20261027-052413",
  "./src/js/galactic-cast.js?v=47558486c-20261027-052413",
  "./src/js/contests.js?v=47558486c-20261027-052413",
  "./src/js/broadcast.js?v=47558486c-20261027-052413",
  "./src/js/contestEngine.js?v=47558486c-20261027-052413",
  "./src/js/alienPlayers.js?v=47558486c-20261027-052413",
  "./src/js/storage.js?v=47558486c-20261027-052413",
  "./src/js/perceive.js?v=47558486c-20261027-052413",
  "./src/js/carexplore.js?v=47558486c-20261027-052413",
  "./src/js/justice.js?v=47558486c-20261027-052413",
  "./src/js/food.js?v=47558486c-20261027-052413",
  "./src/js/betrayal.js?v=47558486c-20261027-052413",
  "./src/js/corpses.js?v=47558486c-20261027-052413",
  "./src/js/corruption.js?v=47558486c-20261027-052413",
  "./src/js/lifeseed.js?v=47558486c-20261027-052413",
  "./src/js/spawn-knack.js?v=47558486c-20261027-052413",
  "./src/js/trial-deeds.js?v=47558486c-20261027-052413",
  "./src/js/practice-deeds.js?v=47558486c-20261027-052413",
  "./src/js/tracks.js?v=47558486c-20261027-052413",
  "./src/js/villager-build.js?v=47558486c-20261027-052413",
  "./src/js/progression.js?v=47558486c-20261027-052413",
  "./src/js/waveLedger.js?v=47558486c-20261027-052413",
  "./src/js/standing.js?v=47558486c-20261027-052413",
  "./src/js/feastBuff.js?v=47558486c-20261027-052413",
  "./src/js/ledger.js?v=47558486c-20261027-052413",
  "./src/js/exposure.js?v=47558486c-20261027-052413",
  "./src/js/abilityActions.js?v=47558486c-20261027-052413",
  "./src/js/buildarounds.js?v=47558486c-20261027-052413",
  "./src/js/foodPower.js?v=47558486c-20261027-052413",
  "./src/js/monsterBehaviors.js?v=47558486c-20261027-052413",
  "./src/js/partyTactics.js?v=47558486c-20261027-052413",
  "./src/js/sigW3a.js?v=47558486c-20261027-052413",
  "./src/js/statusEffects.js?v=47558486c-20261027-052413",
  "./src/js/sigW3b.js?v=47558486c-20261027-052413",
  "./src/js/metaProgression.js?v=47558486c-20261027-052413",
  "./src/js/sigW3c.js?v=47558486c-20261027-052413",
  "./src/js/sigW4.js?v=47558486c-20261027-052413",
  "./src/js/sigW5.js?v=47558486c-20261027-052413",
  "./src/js/villager-agency.js?v=47558486c-20261027-052413",
  "./src/js/npc-triggers.js?v=47558486c-20261027-052413",
  "./src/js/fieldFights.js?v=47558486c-20261027-052413",
  "./src/js/party-wiring.js?v=47558486c-20261027-052413",
  "./src/js/party-bond.js?v=47558486c-20261027-052413",
  "./src/js/villager-objectives.js?v=47558486c-20261027-052413",
  "./src/js/villager-mapmem.js?v=47558486c-20261027-052413",
  "./src/js/codex-people.js?v=47558486c-20261027-052413",
  "./src/js/fallen-memorial.js?v=47558486c-20261027-052413",
  "./src/js/graves.js?v=47558486c-20261027-052413",
  "./src/js/membership.js?v=47558486c-20261027-052413",
  "./src/js/gardenCultivation.js?v=47558486c-20261027-052413",
  "./src/js/havenGrowth.js?v=47558486c-20261027-052413",
  "./src/js/shelter.js?v=47558486c-20261027-052413",
  "./src/js/hierarchy.js?v=47558486c-20261027-052413",
  "./src/js/scaleDiscovery.js?v=47558486c-20261027-052413",
  "./src/js/comms.js?v=47558486c-20261027-052413",
  "./src/js/table.js?v=47558486c-20261027-052413",
  "./src/js/pods.js?v=47558486c-20261027-052413",
  "./src/js/titans.js?v=47558486c-20261027-052413",
  "./src/js/finale-campaign.js?v=47558486c-20261027-052413",
  "./src/js/godhood.js?v=47558486c-20261027-052413",
  "./src/js/pantheon.js?v=47558486c-20261027-052413",
  "./src/js/records.js?v=47558486c-20261027-052413",
  "./src/js/table-feared.js?v=47558486c-20261027-052413",
  "./src/js/table-indispensable.js?v=47558486c-20261027-052413",
  "./src/js/table-beloved.js?v=47558486c-20261027-052413",
  "./src/js/table-witness.js?v=47558486c-20261027-052413",
  "./src/js/table-assimilated.js?v=47558486c-20261027-052413",
  "./src/js/table-defiant.js?v=47558486c-20261027-052413",
  "./src/js/relay-ext.js?v=47558486c-20261027-052413",
  "./src/js/relay-dialogue.js?v=47558486c-20261027-052413",
  "./src/js/table-relay.js?v=47558486c-20261027-052413",
  "./src/js/safetynets.js?v=47558486c-20261027-052413",
  "./src/js/villageAgency.js?v=47558486c-20261027-052413",
  "./src/js/memdepth.js?v=47558486c-20261027-052413",
  "./src/js/overtime.js?v=47558486c-20261027-052413",
  "./src/js/network-campaign.js?v=47558486c-20261027-052413",
  "./src/js/debug-scenarios.js?v=47558486c-20261027-052413",
  "./src/js/keepsakes.js?v=47558486c-20261027-052413",
  "./src/js/skill-teaching.js?v=47558486c-20261027-052413",
  "./src/js/world.js?v=47558486c-20261027-052413",
  "./src/js/nomad.js?v=47558486c-20261027-052413",
  "./src/js/nomad-wild.js?v=47558486c-20261027-052413",
  "./src/js/nomad-scenes.js?v=47558486c-20261027-052413",
  "./src/js/nomad-drive.js?v=47558486c-20261027-052413",
  "./src/js/temperature.js?v=47558486c-20261027-052413",
  "./src/js/godpath.js?v=47558486c-20261027-052413",
  "./src/js/godverbs.js?v=47558486c-20261027-052413",
  "./src/js/endingKey.js?v=47558486c-20261027-052413",
  "./src/js/telemetry-hooks.js?v=47558486c-20261027-052413",
  "./src/js/feel.js?v=47558486c-20261027-052413",
  "./src/js/build.js?v=47558486c-20261027-052413",
  "./src/js/whereAreWe.js?v=47558486c-20261027-052413",
  "./src/js/drama.js?v=47558486c-20261027-052413",
  "./src/js/move-anim.js?v=47558486c-20261027-052413",
  "./src/js/presentation.js?v=47558486c-20261027-052413",
  "./src/js/sprites.js?v=47558486c-20261027-052413",
  "./src/js/tile-scenes.js?v=47558486c-20261027-052413",
  "./src/js/regional-audio.js?v=47558486c-20261027-052413",
  "./src/js/favor-company.js?v=47558486c-20261027-052413",
  "./src/js/timeSettlement.js?v=47558486c-20261027-052413",
  "./src/js/app.js?v=47558486c-20261027-052413",
  "./src/js/feel-audio.js?v=47558486c-20261027-052413",
  "./manifest.json?v=47558486c-20261027-052413",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=47558486c-20261027-052413",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=47558486c-20261027-052413",
  "./src/data/alienPlayers.json?v=47558486c-20261027-052413",
  "./src/data/animals.json?v=47558486c-20261027-052413",
  "./src/data/arrivalText.json?v=47558486c-20261027-052413",
  "./src/data/background_survivors.json?v=47558486c-20261027-052413",
  "./src/data/biomes.json?v=47558486c-20261027-052413",
  "./src/data/books.json?v=47558486c-20261027-052413",
  "./src/data/build-notes.json?v=47558486c-20261027-052413",
  "./src/data/cell_defs.json?v=47558486c-20261027-052413",
  "./src/data/characterGen.json?v=47558486c-20261027-052413",
  "./src/data/climates.json?v=47558486c-20261027-052413",
  "./src/data/contests.json?v=47558486c-20261027-052413",
  "./src/data/cooking.json?v=47558486c-20261027-052413",
  "./src/data/events.json?v=47558486c-20261027-052413",
  "./src/data/evolutions.json?v=47558486c-20261027-052413",
  "./src/data/favor-rules.json?v=47558486c-20261027-052413",
  "./src/data/feast-surge.json?v=47558486c-20261027-052413",
  "./src/data/foreignSpeech.json?v=47558486c-20261027-052413",
  "./src/data/gardening.json?v=47558486c-20261027-052413",
  "./src/data/godpaths.json?v=47558486c-20261027-052413",
  "./src/data/items.json?v=47558486c-20261027-052413",
  "./src/data/justiceVoice.json?v=47558486c-20261027-052413",
  "./src/data/knowledge.json?v=47558486c-20261027-052413",
  "./src/data/lifeseeds.json?v=47558486c-20261027-052413",
  "./src/data/locations.json?v=47558486c-20261027-052413",
  "./src/data/monsterBehaviors.json?v=47558486c-20261027-052413",
  "./src/data/monsters.json?v=47558486c-20261027-052413",
  "./src/data/nameCultures.json?v=47558486c-20261027-052413",
  "./src/data/originPicker.json?v=47558486c-20261027-052413",
  "./src/data/plants.json?v=47558486c-20261027-052413",
  "./src/data/presentation.json?v=47558486c-20261027-052413",
  "./src/data/recipes.json?v=47558486c-20261027-052413",
  "./src/data/regions.json?v=47558486c-20261027-052413",
  "./src/data/relicEnhancements.json?v=47558486c-20261027-052413",
  "./src/data/reward-economy.json?v=47558486c-20261027-052413",
  "./src/data/schemas.json?v=47558486c-20261027-052413",
  "./src/data/statusEffects.json?v=47558486c-20261027-052413",
  "./src/data/synergies.json?v=47558486c-20261027-052413",
  "./src/data/table-beats.json?v=47558486c-20261027-052413",
  "./src/data/table-endings.json?v=47558486c-20261027-052413",
  "./src/data/titans.json?v=47558486c-20261027-052413",
  "./src/data/tracks.json?v=47558486c-20261027-052413",
  "./src/data/villagers.json?v=47558486c-20261027-052413",
  "./src/data/wave-ledger.json?v=47558486c-20261027-052413"
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
