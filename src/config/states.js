import keralaAcMeta from '../data/acmeta/kerala.json'

export const STATE_REGISTRY = {
  kerala: {
    label:        'Kerala',
    shortLabel:   'KL',
    topoUrl:      '/Kerala_LAC.topojson',
    topoObject:   'layer',
    idProperty:   'AC_NO',
    nameProperty: 'AC_NAME',
    eciUrl:       '/api/results',
    eciCode:      'S11',

    partyAlliance: {
      'CPI(M)': 'LDF', 'CPM':    'LDF', 'CPI':    'LDF',
      'NCP':    'LDF', 'KC(M)':  'LDF', 'KC-M':   'LDF',
      'JD(S)':  'LDF', 'RSP':    'UDF', 'FB':     'LDF', 'LJD': 'LDF', "RJD":"LDF",
      'INC':    'UDF', 'IUML':   'UDF', 'KC':     'UDF',
      'KEC':    'UDF', 'KEC(M)': 'UDF', 'KEC(J)': 'UDF',
      'RMP':    'UDF', 'RMPOI':  'UDF', 'CMC':    'UDF', 'CMPKSC': 'UDF',
      'ISJD':   'UDF',
      'BJP':    'NDA', 'BDJS':   'NDA', 'GHSS':   'NDA',
    },

    alliances: {
      LDF: { label: 'LDF', color: '#FF1D15', textColor: '#fff', description: 'Left Democratic Front' },
      UDF: { label: 'UDF', color: '#19AAED', textColor: '#fff', description: 'United Democratic Front' },
      NDA: { label: 'NDA', color: '#ff944d', textColor: '#fff', description: 'National Democratic Alliance' },
      OTH: { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
    },

    constituencyOverrides: {
      'PALA':         'UDF',
      'AMBALAPPUZHA': 'UDF',
      'PAYYANNUR':    'UDF',
      'TALIPARAMBA':  'UDF',
    },

    totalSeats:   140,
    majority:     71,
    pendingColor: '#e8e8e4',
    acMeta:       keralaAcMeta,
  },

  // westbengal: {
  //   label:        'West Bengal',
  //   shortLabel:   'WB',
  //   topoUrl:      '/WB_LAC.topojson',
  //   topoObject:   'WestBengal',
  //   idProperty:   'AC_NO',
  //   nameProperty: 'AC_NAME',
  //   eciUrl:       '/api/results',
  //   eciCode:      'S25',

  //   partyAlliance: {
  //     'AITC': 'TMC', 'TMC': 'TMC',
  //     'BJP':  'NDA',
  //     'INC':  'INDIA', 'CPI(M)': 'INDIA', 'CPI': 'INDIA',
  //     'AIFB': 'INDIA', 'RSP': 'INDIA',
  //     'SUCI': 'OTH',
  //   },

  //   alliances: {
  //     TMC:   { label: 'TMC',    color: '#20c997', textColor: '#fff', description: 'All India Trinamool Congress' },
  //     NDA:   { label: 'NDA',    color: '#ff944d', textColor: '#fff', description: 'National Democratic Alliance' },
  //     INDIA: { label: 'INDIA',  color: '#19AAED', textColor: '#fff', description: 'INDIA Alliance' },
  //     OTH:   { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
  //   },

  //   totalSeats:   294,
  //   majority:     148,
  //   pendingColor: '#e8e8e4',
  //   acMeta:       null,
  // },

  tamilnadu: {
    label:        'Tamil Nadu',
    shortLabel:   'TN',
    topoUrl:      '/TamilNadu_LAC.topojson',
    topoObject:   'layer',
    idProperty:   'AC_NO',
    nameProperty: 'AC_NAME',
    eciUrl:       '/api/results',
    eciCode:      'S22',

    partyAlliance: {
      'DMK':     'DMK',  'INC':   'DMK',  'CPI(M)': 'DMK',
      'CPI':     'DMK',  'VCK':   'DMK',  'DMDK':   'DMK',
      'MDMK': 'DMK',
      'MMK':     'DMK', 'IUML': 'DMK', 'CPI(ML)': 'DMK',
      'AIADMK':  'AIADMK', 'PMK': 'AIADMK', 'BJP': 'AIADMK',
      'AMMK': 'AIADMK', 'TMC(M)': 'AIADMK',
      'TVK':   'TVK',
      'NTK':   'OTH',
    },

    alliances: {
      DMK:     { label: 'DMK+',            color: '#c0392b', textColor: '#fff', description: 'DMK+' },
      TVK:     { label: 'TVK',             color: '#e72bd9', textColor: '#fff', description: 'TVK' },
      AIADMK:  { label: 'AIADMK+',         color: '#27ae60', textColor: '#fff', description: 'AIADMK' },
      OTH:     { label: 'Others',          color: '#7f8c8d', textColor: '#fff', description: 'Others' },
    },

    totalSeats:   234,
    majority:     118,
    pendingColor: '#e8e8e4',
    acMeta:       null,
  },

  // assam: {
  //   label:        'Assam',
  //   shortLabel:   'AS',
  //   topoUrl:      '/Assam_LAC.topojson',
  //   topoObject:   'layer',
  //   idProperty:   'AC_NO',
  //   nameProperty: 'AC_NAME',
  //   eciUrl:       '/api/results',
  //   eciCode:      'S03',

  //   partyAlliance: {
  //     'BJP':   'NDA', 'AGP':  'NDA', 'UPPL': 'NDA',
  //     'INC':   'INDIA', 'AIUDF': 'INDIA', 'CPI(M)': 'INDIA',
  //     'BPF':   'OTH', 'RD':   'OTH',
  //   },

  //   alliances: {
  //     NDA:   { label: 'NDA',    color: '#ff944d', textColor: '#fff', description: 'National Democratic Alliance' },
  //     INDIA: { label: 'INDIA',  color: '#19AAED', textColor: '#fff', description: 'INDIA Alliance' },
  //     OTH:   { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
  //   },

  //   totalSeats:   126,
  //   majority:     64,
  //   pendingColor: '#e8e8e4',
  //   acMeta:       null,
  // },

  // puducherry: {
  //   label:        'Puducherry',
  //   shortLabel:   'PY',
  //   topoUrl:      '/Puducherry_LAC.topojson',
  //   topoObject:   'layer',
  //   idProperty:   'AC_NO',
  //   nameProperty: 'AC_NAME',
  //   eciUrl:       '/api/results',
  //   eciCode:      'U07',

  //   partyAlliance: {
  //     'AINRC': 'NDA',   'BJP': 'NDA',   'AIADMK': 'NDA',
  //     'DMK':   'INDIA', 'INC': 'INDIA', 'CPI':    'INDIA', 'VCK': 'INDIA',
  //   },

  //   alliances: {
  //     NDA:   { label: 'NDA',    color: '#ff944d', textColor: '#fff', description: 'National Democratic Alliance' },
  //     INDIA: { label: 'INDIA',  color: '#19AAED', textColor: '#fff', description: 'INDIA Alliance' },
  //     OTH:   { label: 'Others', color: '#7f8c8d', textColor: '#fff', description: 'Others' },
  //   },

  //   totalSeats:   30,
  //   majority:     16,
  //   pendingColor: '#e8e8e4',
  //   acMeta:       null,
  // },
}

export const DEFAULT_STATE = 'kerala'
