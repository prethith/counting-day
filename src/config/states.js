/**
 * STATE REGISTRY
 * ──────────────
 * To add a new state:
 *   1. Drop its TopoJSON into /public/topojson/<state_id>.json
 *   2. Add an entry below.
 *   3. That's it — the map, sidebar, and polling all adapt automatically.
 *
 * topoObject  → the key inside topojson.objects that holds constituency features
 * idProperty  → the feature property that matches results.json constituency "id"
 * nameProperty→ the feature property used as a display label fallback
 * resultsUrl  → where to poll for live results.json
 * totalSeats  → total assembly seats (for majority line)
 * majority    → seats needed for majority
 * alliances   → display config for each party/alliance colour
 */

import keralaAcMeta from '../data/acmeta/kerala.json'

export const STATE_REGISTRY = {
  kerala: {
    label:       'Kerala',
    shortLabel:  'KL',
    topoUrl:     '/Kerala_LAC.topojson',
    topoObject:  'layer',
    idProperty:  'AC_NO',
    nameProperty:'AC_NAME',
    eciUrl: 'http://localhost:3000/api/results',
    eciCode: 'S11',

    partyAlliance: {
      'CPI(M)': 'LDF', 'CPM':     'LDF', 'CPI':    'LDF',
      'NCP':    'LDF', 'KC(M)':   'LDF', 'KC-M':   'LDF',
      'JD(S)':  'LDF', 'RSP':     'LDF', 'FB':     'LDF', 'LJD': 'LDF',
      'INC':    'UDF', 'IUML':    'UDF', 'KC':     'UDF',
      'KEC':    'UDF', 'KEC(M)':  'UDF', 'KEC(J)': 'UDF',
      'RMP':    'UDF', 'RMPOI':   'UDF', 'CMC':    'UDF', 'CMPKSC': 'UDF',
      'ISJD':   'UDF',
      'BJP':    'NDA', 'BDJS':    'NDA', 'GHSS':   'NDA',
    },

    alliances: {
      LDF: { label: 'LDF', color: '#FF1D15', textColor: '#fff', description: 'Left Democratic Front' },
      UDF: { label: 'UDF', color: '#19AAED', textColor: '#fff', description: 'United Democratic Front' },
      NDA: { label: 'NDA', color: '#ff944d', textColor: '#fff', description: 'National Democratic Alliance' },
      OTH: { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
    },

    totalSeats:   140,
    majority:     71,
    pendingColor: '#e8e8e4',

    acMeta: keralaAcMeta
  },
}

export const DEFAULT_STATE = 'kerala'
  // ── Template for next state ────────────────────────────────────────────────
  // andhra: {
  //   label: 'Andhra Pradesh',
  //   shortLabel: 'AP',
  //   topoUrl: '/topojson/andhra.json',
  //   topoObject: 'andhra_ac',
  //   idProperty: 'AC_NO',
  //   nameProperty: 'AC_NAME',
  //   resultsUrl: import.meta.env.VITE_ANDHRA_RESULTS_URL || '/mock/andhra-results.json',
  //   totalSeats: 175,
  //   majority: 88,
  //   alliances: {
  //     YSRCP: { label: 'YSRCP', color: '#1a5276', textColor: '#fff', description: 'YSR Congress Party' },
  //     TDP:   { label: 'TDP',   color: '#f39c12', textColor: '#fff', description: 'Telugu Desam Party' },
  //     OTH:   { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
  //   },
  //   pendingColor: '#e8e8e4',
  //   countingColor: '#f0e6c8',
  // },

