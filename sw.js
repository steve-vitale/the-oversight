/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'df768b9b3-20261116-112434';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=df768b9b3-20261116-112434",
  "./src/js/engine/modifiers.js?v=df768b9b3-20261116-112434",
  "./src/js/engine/calories.js?v=df768b9b3-20261116-112434",
  "./src/js/engine/day.js?v=df768b9b3-20261116-112434",
  "./src/js/engine/forage.js?v=df768b9b3-20261116-112434",
  "./src/js/engine/combat.js?v=df768b9b3-20261116-112434",
  "./src/js/audio-registry.js?v=df768b9b3-20261116-112434",
  "./src/js/text.js?v=df768b9b3-20261116-112434",
  "./src/js/game.js?v=df768b9b3-20261116-112434",
  "./src/js/encounters.js?v=df768b9b3-20261116-112434",
  "./src/js/conversation.js?v=df768b9b3-20261116-112434",
  "./src/js/convo-mood.js?v=df768b9b3-20261116-112434",
  "./src/js/convoTopics.js?v=df768b9b3-20261116-112434",
  "./src/js/naming-rite.js?v=df768b9b3-20261116-112434",
  "./src/js/convo-wants.js?v=df768b9b3-20261116-112434",
  "./src/js/convo-dialogue.js?v=df768b9b3-20261116-112434",
  "./src/js/convo-beats.js?v=df768b9b3-20261116-112434",
  "./src/js/convo-scene.js?v=df768b9b3-20261116-112434",
  "./src/js/voice-piper.js?v=df768b9b3-20261116-112434",
  "./src/js/voice-system.js?v=df768b9b3-20261116-112434",
  "./src/js/examine.js?v=df768b9b3-20261116-112434",
  "./src/js/equipment.js?v=df768b9b3-20261116-112434",
  "./src/js/journal.js?v=df768b9b3-20261116-112434",
  "./src/js/party.js?v=df768b9b3-20261116-112434",
  "./src/js/favor-water.js?v=df768b9b3-20261116-112434",
  "./src/js/favor-forage.js?v=df768b9b3-20261116-112434",
  "./src/js/favor-outing.js?v=df768b9b3-20261116-112434",
  "./src/js/party-formal.js?v=df768b9b3-20261116-112434",
  "./src/js/truth.js?v=df768b9b3-20261116-112434",
  "./src/js/galactic-cast.js?v=df768b9b3-20261116-112434",
  "./src/js/contests.js?v=df768b9b3-20261116-112434",
  "./src/js/broadcast.js?v=df768b9b3-20261116-112434",
  "./src/js/contestEngine.js?v=df768b9b3-20261116-112434",
  "./src/js/alienPlayers.js?v=df768b9b3-20261116-112434",
  "./src/js/storage.js?v=df768b9b3-20261116-112434",
  "./src/js/perceive.js?v=df768b9b3-20261116-112434",
  "./src/js/carexplore.js?v=df768b9b3-20261116-112434",
  "./src/js/justice.js?v=df768b9b3-20261116-112434",
  "./src/js/food.js?v=df768b9b3-20261116-112434",
  "./src/js/betrayal.js?v=df768b9b3-20261116-112434",
  "./src/js/corpses.js?v=df768b9b3-20261116-112434",
  "./src/js/corruption.js?v=df768b9b3-20261116-112434",
  "./src/js/lifeseed.js?v=df768b9b3-20261116-112434",
  "./src/js/spawn-knack.js?v=df768b9b3-20261116-112434",
  "./src/js/trial-deeds.js?v=df768b9b3-20261116-112434",
  "./src/js/practice-deeds.js?v=df768b9b3-20261116-112434",
  "./src/js/tracks.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-build.js?v=df768b9b3-20261116-112434",
  "./src/js/progression.js?v=df768b9b3-20261116-112434",
  "./src/js/waveLedger.js?v=df768b9b3-20261116-112434",
  "./src/js/standing.js?v=df768b9b3-20261116-112434",
  "./src/js/ladder.js?v=df768b9b3-20261116-112434",
  "./src/js/feastBuff.js?v=df768b9b3-20261116-112434",
  "./src/js/ledger.js?v=df768b9b3-20261116-112434",
  "./src/js/exposure.js?v=df768b9b3-20261116-112434",
  "./src/js/abilityActions.js?v=df768b9b3-20261116-112434",
  "./src/js/buildarounds.js?v=df768b9b3-20261116-112434",
  "./src/js/foodPower.js?v=df768b9b3-20261116-112434",
  "./src/js/monsterBehaviors.js?v=df768b9b3-20261116-112434",
  "./src/js/partyTactics.js?v=df768b9b3-20261116-112434",
  "./src/js/sigW3a.js?v=df768b9b3-20261116-112434",
  "./src/js/statusEffects.js?v=df768b9b3-20261116-112434",
  "./src/js/sigW3b.js?v=df768b9b3-20261116-112434",
  "./src/js/metaProgression.js?v=df768b9b3-20261116-112434",
  "./src/js/sigW3c.js?v=df768b9b3-20261116-112434",
  "./src/js/sigW4.js?v=df768b9b3-20261116-112434",
  "./src/js/sigW5.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-agency.js?v=df768b9b3-20261116-112434",
  "./src/js/win-plan.js?v=df768b9b3-20261116-112434",
  "./src/js/npc-triggers.js?v=df768b9b3-20261116-112434",
  "./src/js/fieldFights.js?v=df768b9b3-20261116-112434",
  "./src/js/party-wiring.js?v=df768b9b3-20261116-112434",
  "./src/js/party-bond.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-objectives.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-goals.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-brain.js?v=df768b9b3-20261116-112434",
  "./src/js/bond-initiation.js?v=df768b9b3-20261116-112434",
  "./src/js/villager-mapmem.js?v=df768b9b3-20261116-112434",
  "./src/js/codex-people.js?v=df768b9b3-20261116-112434",
  "./src/js/fallen-memorial.js?v=df768b9b3-20261116-112434",
  "./src/js/graves.js?v=df768b9b3-20261116-112434",
  "./src/js/membership.js?v=df768b9b3-20261116-112434",
  "./src/js/gardenCultivation.js?v=df768b9b3-20261116-112434",
  "./src/js/havenGrowth.js?v=df768b9b3-20261116-112434",
  "./src/js/shelter.js?v=df768b9b3-20261116-112434",
  "./src/js/hierarchy.js?v=df768b9b3-20261116-112434",
  "./src/js/scaleDiscovery.js?v=df768b9b3-20261116-112434",
  "./src/js/comms.js?v=df768b9b3-20261116-112434",
  "./src/js/table.js?v=df768b9b3-20261116-112434",
  "./src/js/pods.js?v=df768b9b3-20261116-112434",
  "./src/js/titans.js?v=df768b9b3-20261116-112434",
  "./src/js/finale-campaign.js?v=df768b9b3-20261116-112434",
  "./src/js/godhood.js?v=df768b9b3-20261116-112434",
  "./src/js/pantheon.js?v=df768b9b3-20261116-112434",
  "./src/js/records.js?v=df768b9b3-20261116-112434",
  "./src/js/table-feared.js?v=df768b9b3-20261116-112434",
  "./src/js/table-indispensable.js?v=df768b9b3-20261116-112434",
  "./src/js/table-beloved.js?v=df768b9b3-20261116-112434",
  "./src/js/table-witness.js?v=df768b9b3-20261116-112434",
  "./src/js/table-assimilated.js?v=df768b9b3-20261116-112434",
  "./src/js/table-defiant.js?v=df768b9b3-20261116-112434",
  "./src/js/relay-ext.js?v=df768b9b3-20261116-112434",
  "./src/js/relay-dialogue.js?v=df768b9b3-20261116-112434",
  "./src/js/table-relay.js?v=df768b9b3-20261116-112434",
  "./src/js/safetynets.js?v=df768b9b3-20261116-112434",
  "./src/js/villageAgency.js?v=df768b9b3-20261116-112434",
  "./src/js/memdepth.js?v=df768b9b3-20261116-112434",
  "./src/js/overtime.js?v=df768b9b3-20261116-112434",
  "./src/js/network-campaign.js?v=df768b9b3-20261116-112434",
  "./src/js/debug-scenarios.js?v=df768b9b3-20261116-112434",
  "./src/js/keepsakes.js?v=df768b9b3-20261116-112434",
  "./src/js/skill-teaching.js?v=df768b9b3-20261116-112434",
  "./src/js/person-trust.js?v=df768b9b3-20261116-112434",
  "./src/js/companion-score.js?v=df768b9b3-20261116-112434",
  "./src/js/world.js?v=df768b9b3-20261116-112434",
  "./src/js/nomad.js?v=df768b9b3-20261116-112434",
  "./src/js/nomad-wild.js?v=df768b9b3-20261116-112434",
  "./src/js/nomad-scenes.js?v=df768b9b3-20261116-112434",
  "./src/js/nomad-drive.js?v=df768b9b3-20261116-112434",
  "./src/js/temperature.js?v=df768b9b3-20261116-112434",
  "./src/js/godpath.js?v=df768b9b3-20261116-112434",
  "./src/js/godverbs.js?v=df768b9b3-20261116-112434",
  "./src/js/endingKey.js?v=df768b9b3-20261116-112434",
  "./src/js/telemetry-hooks.js?v=df768b9b3-20261116-112434",
  "./src/js/finishLog.js?v=df768b9b3-20261116-112434",
  "./src/js/feel.js?v=df768b9b3-20261116-112434",
  "./src/js/build.js?v=df768b9b3-20261116-112434",
  "./src/js/whereAreWe.js?v=df768b9b3-20261116-112434",
  "./src/js/drama.js?v=df768b9b3-20261116-112434",
  "./src/js/move-anim.js?v=df768b9b3-20261116-112434",
  "./src/js/presentation.js?v=df768b9b3-20261116-112434",
  "./src/js/sprites.js?v=df768b9b3-20261116-112434",
  "./src/js/tile-scenes.js?v=df768b9b3-20261116-112434",
  "./src/js/regional-audio.js?v=df768b9b3-20261116-112434",
  "./src/js/favor-company.js?v=df768b9b3-20261116-112434",
  "./src/js/timeSettlement.js?v=df768b9b3-20261116-112434",
  "./src/js/app.js?v=df768b9b3-20261116-112434",
  "./src/js/feel-audio.js?v=df768b9b3-20261116-112434",
  "./manifest.json?v=df768b9b3-20261116-112434",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=df768b9b3-20261116-112434",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=df768b9b3-20261116-112434",
  "./src/data/alienPlayers.json?v=df768b9b3-20261116-112434",
  "./src/data/animals.json?v=df768b9b3-20261116-112434",
  "./src/data/arrivalText.json?v=df768b9b3-20261116-112434",
  "./src/data/background_survivors.json?v=df768b9b3-20261116-112434",
  "./src/data/biomes.json?v=df768b9b3-20261116-112434",
  "./src/data/books.json?v=df768b9b3-20261116-112434",
  "./src/data/build-notes.json?v=df768b9b3-20261116-112434",
  "./src/data/cell_defs.json?v=df768b9b3-20261116-112434",
  "./src/data/characterGen.json?v=df768b9b3-20261116-112434",
  "./src/data/climates.json?v=df768b9b3-20261116-112434",
  "./src/data/contests.json?v=df768b9b3-20261116-112434",
  "./src/data/cooking.json?v=df768b9b3-20261116-112434",
  "./src/data/events.json?v=df768b9b3-20261116-112434",
  "./src/data/evolutions.json?v=df768b9b3-20261116-112434",
  "./src/data/favor-rules.json?v=df768b9b3-20261116-112434",
  "./src/data/feast-surge.json?v=df768b9b3-20261116-112434",
  "./src/data/foreignSpeech.json?v=df768b9b3-20261116-112434",
  "./src/data/gardening.json?v=df768b9b3-20261116-112434",
  "./src/data/godpaths.json?v=df768b9b3-20261116-112434",
  "./src/data/items.json?v=df768b9b3-20261116-112434",
  "./src/data/justiceVoice.json?v=df768b9b3-20261116-112434",
  "./src/data/knowledge.json?v=df768b9b3-20261116-112434",
  "./src/data/ladder-capstones.json?v=df768b9b3-20261116-112434",
  "./src/data/lifeseeds.json?v=df768b9b3-20261116-112434",
  "./src/data/locations.json?v=df768b9b3-20261116-112434",
  "./src/data/monsterBehaviors.json?v=df768b9b3-20261116-112434",
  "./src/data/monsters.json?v=df768b9b3-20261116-112434",
  "./src/data/nameCultures.json?v=df768b9b3-20261116-112434",
  "./src/data/originPicker.json?v=df768b9b3-20261116-112434",
  "./src/data/pellet-boost.json?v=df768b9b3-20261116-112434",
  "./src/data/plants.json?v=df768b9b3-20261116-112434",
  "./src/data/presentation.json?v=df768b9b3-20261116-112434",
  "./src/data/recipes.json?v=df768b9b3-20261116-112434",
  "./src/data/regions.json?v=df768b9b3-20261116-112434",
  "./src/data/relicEnhancements.json?v=df768b9b3-20261116-112434",
  "./src/data/reward-economy.json?v=df768b9b3-20261116-112434",
  "./src/data/schemas.json?v=df768b9b3-20261116-112434",
  "./src/data/statusEffects.json?v=df768b9b3-20261116-112434",
  "./src/data/synergies.json?v=df768b9b3-20261116-112434",
  "./src/data/table-beats.json?v=df768b9b3-20261116-112434",
  "./src/data/table-endings.json?v=df768b9b3-20261116-112434",
  "./src/data/titans.json?v=df768b9b3-20261116-112434",
  "./src/data/tracks.json?v=df768b9b3-20261116-112434",
  "./src/data/villagers.json?v=df768b9b3-20261116-112434",
  "./src/data/wave-ledger.json?v=df768b9b3-20261116-112434"
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
