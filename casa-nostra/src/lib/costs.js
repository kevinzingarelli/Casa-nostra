import { roomArea } from './rooms'

// IMPORTANTE: prezzi INDICATIVI a scopo di stima, non preventivi reali.
// Valori orientativi per il mercato italiano (€/m² sulla superficie, o a corpo/unità).

export const MATERIAL_GROUPS = [
  {
    id: 'fondamenta',
    label: 'Fondamenta',
    icon: 'layers',
    unit: 'm2',
    options: [
      { id: 'platea', name: 'Platea standard', desc: 'Soletta in cemento armato su terreno stabile', price: 130 },
      { id: 'rinforzata', name: 'Platea rinforzata', desc: 'Per terreni meno portanti o zona sismica', price: 175 },
      { id: 'pali', name: 'Pali di fondazione', desc: 'Terreni difficili, massima stabilità', price: 240 },
    ],
  },
  {
    id: 'struttura',
    label: 'Struttura e muri',
    icon: 'box',
    unit: 'm2',
    options: [
      { id: 'laterizio', name: 'Laterizio (mattoni)', desc: 'Soluzione tradizionale, ottimo comfort', price: 360 },
      { id: 'cemento', name: 'Cemento armato', desc: 'Robusto, ideale in zona sismica', price: 430 },
      { id: 'legno', name: 'Legno X-Lam', desc: 'Costruzione rapida e molto isolante', price: 520, eco: 'Il legno X-Lam è rinnovabile e immagazzina CO₂: tra le scelte più sostenibili.' },
      { id: 'acciaio', name: 'Acciaio', desc: 'Strutture leggere e flessibili', price: 470 },
    ],
  },
  {
    id: 'tetto',
    label: 'Tetto',
    icon: 'triangle',
    unit: 'm2',
    options: [
      { id: 'lamiera', name: 'Lamiera coibentata', desc: 'Economico e leggero', price: 75 },
      { id: 'tegole', name: 'Tegole', desc: 'Classico, buon rapporto qualità/prezzo', price: 100 },
      { id: 'coppi', name: 'Coppi in cotto', desc: 'Estetica mediterranea, lunga durata', price: 135 },
      { id: 'verde', name: 'Tetto verde', desc: 'Copertura vegetale, isolante naturale', price: 190, eco: 'Il tetto verde riduce il calore estivo e migliora l\'isolamento: meno consumi per il raffrescamento.' },
    ],
  },
  {
    id: 'isolamento',
    label: 'Isolamento termico',
    icon: 'thermometer',
    unit: 'm2',
    options: [
      { id: 'base', name: 'Base (a norma)', desc: 'Isolamento minimo richiesto', price: 45 },
      { id: 'cappotto', name: 'Cappotto standard', desc: 'Buon comfort tutto l\'anno', price: 85, eco: 'Un buon cappotto può ridurre i consumi di riscaldamento del 25–35%.' },
      { id: 'alta', name: 'Cappotto alta efficienza', desc: 'Classe energetica top, bollette minime', price: 135, eco: 'Spinto verso la classe A: la spesa iniziale rientra negli anni grazie alle bollette ridotte.' },
    ],
  },
  {
    id: 'finestre',
    label: 'Infissi e finestre',
    icon: 'square',
    unit: 'unit',
    options: [
      { id: 'pvc2', name: 'PVC doppio vetro', desc: 'Buon isolamento, ottimo prezzo', price: 380 },
      { id: 'legalu2', name: 'Legno-alluminio', desc: 'Estetica calda, esterno resistente', price: 520 },
      { id: 'triplo', name: 'Triplo vetro premium', desc: 'Massimo isolamento termico e acustico', price: 680, eco: 'Il triplo vetro abbatte le dispersioni dalle finestre, spesso il punto debole della casa.' },
    ],
  },
  {
    id: 'energia',
    label: 'Energia',
    icon: 'sun',
    unit: 'fixed',
    options: [
      { id: 'nessuno', name: 'Nessun impianto', desc: 'Solo allaccio alla rete', price: 0 },
      { id: 'solare3', name: 'Fotovoltaico 3 kW', desc: 'Copre i consumi base di una famiglia', price: 6500, eco: 'Un impianto da 3 kW può coprire gran parte dei consumi e ripagarsi in circa 6–9 anni.' },
      { id: 'solare6', name: 'Fotovoltaico 6 kW + accumulo', desc: 'Con batteria per usare l\'energia di sera', price: 13500, eco: 'Con l\'accumulo usi di sera l\'energia prodotta di giorno: maggiore autonomia dalla rete.' },
    ],
  },
  {
    id: 'riscaldamento',
    label: 'Riscaldamento',
    icon: 'flame',
    unit: 'fixed',
    options: [
      { id: 'gas', name: 'Caldaia a gas', desc: 'Soluzione tradizionale', price: 4500 },
      { id: 'pdc', name: 'Pompa di calore', desc: 'Elettrica, efficiente, no gas', price: 9000, eco: 'La pompa di calore, abbinata al fotovoltaico, può azzerare la bolletta del riscaldamento.' },
      { id: 'radiante', name: 'Pompa di calore + pavimento radiante', desc: 'Comfort uniforme, massima efficienza', price: 16000, eco: 'Il riscaldamento a pavimento lavora a bassa temperatura: ideale con la pompa di calore.' },
    ],
  },
]

export const DEFAULT_MATERIALS = {
  fondamenta: 'platea',
  struttura: 'laterizio',
  tetto: 'tegole',
  isolamento: 'cappotto',
  finestre: 'pvc2',
  energia: 'nessuno',
  riscaldamento: 'gas',
  windows: 8,
}

export function groupById(id) {
  return MATERIAL_GROUPS.find((g) => g.id === id)
}

export function optionById(groupId, optId) {
  const g = groupById(groupId)
  if (!g) return null
  return g.options.find((o) => o.id === optId) || g.options[0]
}

export function totalArea(rooms) {
  return Math.round(rooms.reduce((s, r) => s + roomArea(r), 0) * 10) / 10
}

// Stima quante finestre servono in base alle stanze "abitabili".
export function suggestedWindows(rooms) {
  const livable = rooms.filter(
    (r) => !['corridoio', 'cabina', 'garage', 'ingresso', 'lavanderia'].includes(r.type)
  ).length
  return Math.max(2, Math.round(livable * 1.5))
}

export function computeCost(rooms, materialsRaw) {
  const materials = { ...DEFAULT_MATERIALS, ...(materialsRaw || {}) }
  const area = totalArea(rooms)
  const windows = Math.max(0, materials.windows ?? suggestedWindows(rooms))
  const lines = []

  for (const g of MATERIAL_GROUPS) {
    const opt = optionById(g.id, materials[g.id])
    if (!opt) continue
    let amount = 0
    let detail = ''
    if (g.unit === 'm2') {
      amount = Math.round(opt.price * area)
      detail = `${opt.price} €/m² × ${area} m²`
    } else if (g.unit === 'unit') {
      amount = Math.round(opt.price * windows)
      detail = `${opt.price} €/cad × ${windows} finestre`
    } else {
      amount = Math.round(opt.price)
      detail = 'a corpo'
    }
    lines.push({ groupId: g.id, groupLabel: g.label, optionName: opt.name, amount, detail })
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  // Costi accessori stimati (progettazione, permessi, impianti idrico/elettrico base).
  const accessori = Math.round(subtotal * 0.18)
  lines.push({
    groupId: 'accessori',
    groupLabel: 'Progettazione, permessi e impianti base',
    optionName: 'Stima forfettaria (18%)',
    amount: accessori,
    detail: '~18% sui materiali',
  })

  const total = subtotal + accessori
  return { area, windows, lines, subtotal, accessori, total }
}

export function formatEUR(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0))
}
