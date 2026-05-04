import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const POLL_INTERVAL = 60_000

export function useResults(stateConfig) {
  const constituencies = ref([])
  const updatedAt = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const lastPollAt = ref(null)

  const constituencyMap = computed(() => {
    const map = {}
    constituencies.value.forEach(c => {
      map[c.id] = c
    })
    return map
  })

  const tally = computed(() => {
    const cfg = stateConfig.value
    if (!cfg) return {}

    const counts = {}
    Object.keys(cfg.alliances).forEach(k => {
      counts[k] = 0
    })

    counts.pending = 0

    constituencies.value.forEach(c => {
      if (c.status === 'pending') {
        counts.pending++
      } else if (c.leadingAlliance && counts[c.leadingAlliance] !== undefined) {
        counts[c.leadingAlliance]++
      } else {
        counts.OTH = (counts.OTH ?? 0) + 1
      }
    })

    return counts
  })

  const declared = computed(() =>
    constituencies.value.filter(c => c.status === 'declared').length
  )

  const counting = computed(() =>
    constituencies.value.filter(c => c.status === 'counting').length
  )

  async function fetchResults() {
    const cfg = stateConfig.value
    if (!cfg?.eciUrl || !cfg?.eciCode) return

    try {
      const url = `${cfg.eciUrl}?state=${cfg.eciCode}`
      console.log("Fetching:", url)

      const res = await fetch(url, {
        cache: 'no-store'
      })

      console.log("STATUS:", res.status)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      console.log("DATA RECEIVED:", data)

      const enriched = (data.constituencies || []).map(c => {
        const alliance = cfg.partyAlliance?.[c.leadingParty] ?? 'OTH'

        return {
          id: c.id,
          name: c.constituency,
          district: c.district ?? '—',

          status: c.status || 'counting',

          leadingAlliance: alliance,
          leadMargin: c.margin ?? null,

          roundsComplete: c.round ? Number(String(c.round).split('/')[0]) : 0,
          totalRounds: c.round ? Number(String(c.round).split('/')[1]) : 0,

          candidates: [
            {
              name: c.leadingCandidate,
              party: c.leadingParty,
              alliance,
              votes: null,
            },
            ...(c.trailingCandidate
              ? [{
                  name: c.trailingCandidate,
                  party: c.trailingParty,
                  alliance: cfg.partyAlliance?.[c.trailingParty] ?? 'OTH',
                  votes: null,
                }]
              : [])
          ],

          totalCounted: c.totalCounted ?? 0,
        }
      })

      constituencies.value = enriched
      updatedAt.value = data.updatedAt || null

      error.value = null

    } catch (e) {
      console.error("POLL ERROR FULL:", e)
      error.value = e?.message || String(e)
    } finally {
      loading.value = false
      lastPollAt.value = new Date()
    }
  }
  let timer = null



  function stopPolling() {
    if (timer) clearInterval(timer)
  }

  function startPolling() {
    stopPolling()
    const cfg = stateConfig.value
    if (!cfg?.eciUrl) return

    fetchResults()
    timer = setInterval(fetchResults, POLL_INTERVAL)
  }

  watch(
    stateConfig,
    (cfg) => {
      if (!cfg?.eciUrl || !cfg?.eciCode) return

      loading.value = true
      constituencies.value = []
      updatedAt.value = null
      error.value = null

      stopPolling()
      startPolling()
    },
    { immediate: true }
  )

  return {
    constituencies,
    constituencyMap,
    updatedAt,
    loading,
    error,
    lastPollAt,
    tally,
    declared,
    counting,
    refetch: fetchResults,
  }
}