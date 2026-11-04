/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = '23726c6cb-20261104-174841';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=23726c6cb-20261104-174841",
  "./src/js/engine/modifiers.js?v=23726c6cb-20261104-174841",
  "./src/js/engine/calories.js?v=23726c6cb-20261104-174841",
  "./src/js/engine/day.js?v=23726c6cb-20261104-174841",
  "./src/js/engine/forage.js?v=23726c6cb-20261104-174841",
  "./src/js/engine/combat.js?v=23726c6cb-20261104-174841",
  "./src/js/audio-registry.js?v=23726c6cb-20261104-174841",
  "./src/js/text.js?v=23726c6cb-20261104-174841",
  "./src/js/game.js?v=23726c6cb-20261104-174841",
  "./src/js/encounters.js?v=23726c6cb-20261104-174841",
  "./src/js/conversation.js?v=23726c6cb-20261104-174841",
  "./src/js/convo-mood.js?v=23726c6cb-20261104-174841",
  "./src/js/convoTopics.js?v=23726c6cb-20261104-174841",
  "./src/js/naming-rite.js?v=23726c6cb-20261104-174841",
  "./src/js/convo-wants.js?v=23726c6cb-20261104-174841",
  "./src/js/convo-dialogue.js?v=23726c6cb-20261104-174841",
  "./src/js/convo-beats.js?v=23726c6cb-20261104-174841",
  "./src/js/convo-scene.js?v=23726c6cb-20261104-174841",
  "./src/js/voice-piper.js?v=23726c6cb-20261104-174841",
  "./src/js/voice-system.js?v=23726c6cb-20261104-174841",
  "./src/js/examine.js?v=23726c6cb-20261104-174841",
  "./src/js/equipment.js?v=23726c6cb-20261104-174841",
  "./src/js/journal.js?v=23726c6cb-20261104-174841",
  "./src/js/party.js?v=23726c6cb-20261104-174841",
  "./src/js/favor-water.js?v=23726c6cb-20261104-174841",
  "./src/js/favor-forage.js?v=23726c6cb-20261104-174841",
  "./src/js/favor-outing.js?v=23726c6cb-20261104-174841",
  "./src/js/party-formal.js?v=23726c6cb-20261104-174841",
  "./src/js/truth.js?v=23726c6cb-20261104-174841",
  "./src/js/galactic-cast.js?v=23726c6cb-20261104-174841",
  "./src/js/contests.js?v=23726c6cb-20261104-174841",
  "./src/js/broadcast.js?v=23726c6cb-20261104-174841",
  "./src/js/contestEngine.js?v=23726c6cb-20261104-174841",
  "./src/js/alienPlayers.js?v=23726c6cb-20261104-174841",
  "./src/js/storage.js?v=23726c6cb-20261104-174841",
  "./src/js/perceive.js?v=23726c6cb-20261104-174841",
  "./src/js/carexplore.js?v=23726c6cb-20261104-174841",
  "./src/js/justice.js?v=23726c6cb-20261104-174841",
  "./src/js/food.js?v=23726c6cb-20261104-174841",
  "./src/js/betrayal.js?v=23726c6cb-20261104-174841",
  "./src/js/corpses.js?v=23726c6cb-20261104-174841",
  "./src/js/corruption.js?v=23726c6cb-20261104-174841",
  "./src/js/lifeseed.js?v=23726c6cb-20261104-174841",
  "./src/js/spawn-knack.js?v=23726c6cb-20261104-174841",
  "./src/js/trial-deeds.js?v=23726c6cb-20261104-174841",
  "./src/js/practice-deeds.js?v=23726c6cb-20261104-174841",
  "./src/js/tracks.js?v=23726c6cb-20261104-174841",
  "./src/js/villager-build.js?v=23726c6cb-20261104-174841",
  "./src/js/progression.js?v=23726c6cb-20261104-174841",
  "./src/js/waveLedger.js?v=23726c6cb-20261104-174841",
  "./src/js/standing.js?v=23726c6cb-20261104-174841",
  "./src/js/feastBuff.js?v=23726c6cb-20261104-174841",
  "./src/js/ledger.js?v=23726c6cb-20261104-174841",
  "./src/js/exposure.js?v=23726c6cb-20261104-174841",
  "./src/js/abilityActions.js?v=23726c6cb-20261104-174841",
  "./src/js/buildarounds.js?v=23726c6cb-20261104-174841",
  "./src/js/foodPower.js?v=23726c6cb-20261104-174841",
  "./src/js/monsterBehaviors.js?v=23726c6cb-20261104-174841",
  "./src/js/partyTactics.js?v=23726c6cb-20261104-174841",
  "./src/js/sigW3a.js?v=23726c6cb-20261104-174841",
  "./src/js/statusEffects.js?v=23726c6cb-20261104-174841",
  "./src/js/sigW3b.js?v=23726c6cb-20261104-174841",
  "./src/js/metaProgression.js?v=23726c6cb-20261104-174841",
  "./src/js/sigW3c.js?v=23726c6cb-20261104-174841",
  "./src/js/sigW4.js?v=23726c6cb-20261104-174841",
  "./src/js/sigW5.js?v=23726c6cb-20261104-174841",
  "./src/js/villager-agency.js?v=23726c6cb-20261104-174841",
  "./src/js/win-plan.js?v=23726c6cb-20261104-174841",
  "./src/js/npc-triggers.js?v=23726c6cb-20261104-174841",
  "./src/js/fieldFights.js?v=23726c6cb-20261104-174841",
  "./src/js/party-wiring.js?v=23726c6cb-20261104-174841",
  "./src/js/party-bond.js?v=23726c6cb-20261104-174841",
  "./src/js/villager-objectives.js?v=23726c6cb-20261104-174841",
  "./src/js/villager-goals.js?v=23726c6cb-20261104-174841",
  "./src/js/villager-mapmem.js?v=23726c6cb-20261104-174841",
  "./src/js/codex-people.js?v=23726c6cb-20261104-174841",
  "./src/js/fallen-memorial.js?v=23726c6cb-20261104-174841",
  "./src/js/graves.js?v=23726c6cb-20261104-174841",
  "./src/js/membership.js?v=23726c6cb-20261104-174841",
  "./src/js/gardenCultivation.js?v=23726c6cb-20261104-174841",
  "./src/js/havenGrowth.js?v=23726c6cb-20261104-174841",
  "./src/js/shelter.js?v=23726c6cb-20261104-174841",
  "./src/js/hierarchy.js?v=23726c6cb-20261104-174841",
  "./src/js/scaleDiscovery.js?v=23726c6cb-20261104-174841",
  "./src/js/comms.js?v=23726c6cb-20261104-174841",
  "./src/js/table.js?v=23726c6cb-20261104-174841",
  "./src/js/pods.js?v=23726c6cb-20261104-174841",
  "./src/js/titans.js?v=23726c6cb-20261104-174841",
  "./src/js/finale-campaign.js?v=23726c6cb-20261104-174841",
  "./src/js/godhood.js?v=23726c6cb-20261104-174841",
  "./src/js/pantheon.js?v=23726c6cb-20261104-174841",
  "./src/js/records.js?v=23726c6cb-20261104-174841",
  "./src/js/table-feared.js?v=23726c6cb-20261104-174841",
  "./src/js/table-indispensable.js?v=23726c6cb-20261104-174841",
  "./src/js/table-beloved.js?v=23726c6cb-20261104-174841",
  "./src/js/table-witness.js?v=23726c6cb-20261104-174841",
  "./src/js/table-assimilated.js?v=23726c6cb-20261104-174841",
  "./src/js/table-defiant.js?v=23726c6cb-20261104-174841",
  "./src/js/relay-ext.js?v=23726c6cb-20261104-174841",
  "./src/js/relay-dialogue.js?v=23726c6cb-20261104-174841",
  "./src/js/table-relay.js?v=23726c6cb-20261104-174841",
  "./src/js/safetynets.js?v=23726c6cb-20261104-174841",
  "./src/js/villageAgency.js?v=23726c6cb-20261104-174841",
  "./src/js/memdepth.js?v=23726c6cb-20261104-174841",
  "./src/js/overtime.js?v=23726c6cb-20261104-174841",
  "./src/js/network-campaign.js?v=23726c6cb-20261104-174841",
  "./src/js/debug-scenarios.js?v=23726c6cb-20261104-174841",
  "./src/js/keepsakes.js?v=23726c6cb-20261104-174841",
  "./src/js/skill-teaching.js?v=23726c6cb-20261104-174841",
  "./src/js/world.js?v=23726c6cb-20261104-174841",
  "./src/js/nomad.js?v=23726c6cb-20261104-174841",
  "./src/js/nomad-wild.js?v=23726c6cb-20261104-174841",
  "./src/js/nomad-scenes.js?v=23726c6cb-20261104-174841",
  "./src/js/nomad-drive.js?v=23726c6cb-20261104-174841",
  "./src/js/temperature.js?v=23726c6cb-20261104-174841",
  "./src/js/godpath.js?v=23726c6cb-20261104-174841",
  "./src/js/godverbs.js?v=23726c6cb-20261104-174841",
  "./src/js/endingKey.js?v=23726c6cb-20261104-174841",
  "./src/js/telemetry-hooks.js?v=23726c6cb-20261104-174841",
  "./src/js/feel.js?v=23726c6cb-20261104-174841",
  "./src/js/build.js?v=23726c6cb-20261104-174841",
  "./src/js/whereAreWe.js?v=23726c6cb-20261104-174841",
  "./src/js/drama.js?v=23726c6cb-20261104-174841",
  "./src/js/move-anim.js?v=23726c6cb-20261104-174841",
  "./src/js/presentation.js?v=23726c6cb-20261104-174841",
  "./src/js/sprites.js?v=23726c6cb-20261104-174841",
  "./src/js/tile-scenes.js?v=23726c6cb-20261104-174841",
  "./src/js/regional-audio.js?v=23726c6cb-20261104-174841",
  "./src/js/favor-company.js?v=23726c6cb-20261104-174841",
  "./src/js/timeSettlement.js?v=23726c6cb-20261104-174841",
  "./src/js/app.js?v=23726c6cb-20261104-174841",
  "./src/js/feel-audio.js?v=23726c6cb-20261104-174841",
  "./manifest.json?v=23726c6cb-20261104-174841",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=23726c6cb-20261104-174841",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=23726c6cb-20261104-174841",
  "./src/data/alienPlayers.json?v=23726c6cb-20261104-174841",
  "./src/data/animals.json?v=23726c6cb-20261104-174841",
  "./src/data/arrivalText.json?v=23726c6cb-20261104-174841",
  "./src/data/background_survivors.json?v=23726c6cb-20261104-174841",
  "./src/data/biomes.json?v=23726c6cb-20261104-174841",
  "./src/data/books.json?v=23726c6cb-20261104-174841",
  "./src/data/build-notes.json?v=23726c6cb-20261104-174841",
  "./src/data/cell_defs.json?v=23726c6cb-20261104-174841",
  "./src/data/characterGen.json?v=23726c6cb-20261104-174841",
  "./src/data/climates.json?v=23726c6cb-20261104-174841",
  "./src/data/contests.json?v=23726c6cb-20261104-174841",
  "./src/data/cooking.json?v=23726c6cb-20261104-174841",
  "./src/data/events.json?v=23726c6cb-20261104-174841",
  "./src/data/evolutions.json?v=23726c6cb-20261104-174841",
  "./src/data/favor-rules.json?v=23726c6cb-20261104-174841",
  "./src/data/feast-surge.json?v=23726c6cb-20261104-174841",
  "./src/data/foreignSpeech.json?v=23726c6cb-20261104-174841",
  "./src/data/gardening.json?v=23726c6cb-20261104-174841",
  "./src/data/godpaths.json?v=23726c6cb-20261104-174841",
  "./src/data/items.json?v=23726c6cb-20261104-174841",
  "./src/data/justiceVoice.json?v=23726c6cb-20261104-174841",
  "./src/data/knowledge.json?v=23726c6cb-20261104-174841",
  "./src/data/lifeseeds.json?v=23726c6cb-20261104-174841",
  "./src/data/locations.json?v=23726c6cb-20261104-174841",
  "./src/data/monsterBehaviors.json?v=23726c6cb-20261104-174841",
  "./src/data/monsters.json?v=23726c6cb-20261104-174841",
  "./src/data/nameCultures.json?v=23726c6cb-20261104-174841",
  "./src/data/originPicker.json?v=23726c6cb-20261104-174841",
  "./src/data/plants.json?v=23726c6cb-20261104-174841",
  "./src/data/presentation.json?v=23726c6cb-20261104-174841",
  "./src/data/recipes.json?v=23726c6cb-20261104-174841",
  "./src/data/regions.json?v=23726c6cb-20261104-174841",
  "./src/data/relicEnhancements.json?v=23726c6cb-20261104-174841",
  "./src/data/reward-economy.json?v=23726c6cb-20261104-174841",
  "./src/data/schemas.json?v=23726c6cb-20261104-174841",
  "./src/data/statusEffects.json?v=23726c6cb-20261104-174841",
  "./src/data/synergies.json?v=23726c6cb-20261104-174841",
  "./src/data/table-beats.json?v=23726c6cb-20261104-174841",
  "./src/data/table-endings.json?v=23726c6cb-20261104-174841",
  "./src/data/titans.json?v=23726c6cb-20261104-174841",
  "./src/data/tracks.json?v=23726c6cb-20261104-174841",
  "./src/data/villagers.json?v=23726c6cb-20261104-174841",
  "./src/data/wave-ledger.json?v=23726c6cb-20261104-174841"
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
