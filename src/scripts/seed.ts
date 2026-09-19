import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

/**
 * A small, real slice of the 2026 catalogue — enough to see every template
 * working. The owner adds the rest through the admin panel, which doubles as
 * the test of whether the admin is actually usable without a developer.
 *
 * Safe to re-run: it skips anything already present.
 */

const categories = [
  { name: 'SpO2 Sensors & Probes', description: 'Reusable and disposable pulse oximetry sensors for adult, paediatric and neonatal use.' },
  { name: 'ECG Cables & Leads', description: 'Trunk cables and lead wires for bedside monitors and diagnostic ECG machines.' },
  { name: 'Patient Plates', description: 'Disposable and reusable electrosurgical return electrodes, plus connecting cables.' },
  { name: 'Fetal Monitoring', description: 'TOCO and ultrasound transducers, event markers and CTG belts.' },
  { name: 'Respiratory & Airway', description: 'Supraglottic airways, CPAP circuits, masks and resuscitators.' },
  { name: 'Oxygen Sensors', description: 'Galvanic oxygen cells for ventilators and anaesthesia workstations.' },
  { name: 'Electrosurgery', description: 'Erbe generators, accessories, foot switches and connecting cables.' },
  { name: 'Laryngoscopes', description: 'Conventional, fibre optic and video laryngoscopes with Macintosh and Miller blades.' },
  { name: 'Compatible Batteries', description: 'Replacement batteries for defibrillators, monitors, ventilators and pumps.' },
  { name: 'Patient Monitors', description: 'Bedside and portable multiparameter monitors.' },
]

const brands = [
  { name: 'Masimo' },
  { name: 'Medtronic' },
  { name: 'Philips' },
  { name: 'Erbe' },
  { name: 'Valleylab' },
  { name: 'GE Healthcare' },
  { name: 'Mindray' },
  { name: 'Zoll' },
  { name: 'Nihon Kohden' },
  { name: 'Dräger' },
]

type SeedProduct = {
  name: string
  partNumber: string
  category: string
  brand?: string
  shortDescription: string
  availability?: 'in-stock' | 'made-to-order' | 'discontinued'
  featured?: boolean
  specifications?: { label: string; value: string }[]
  variants?: { label: string; partNumber?: string }[]
  compatibleWith?: { manufacturer: string; model: string }[]
}

const products: SeedProduct[] = [
  {
    name: 'Nellcor DS100A Adult Reusable SpO2 Sensor',
    partNumber: 'DS100A',
    category: 'SpO2 Sensors & Probes',
    brand: 'Medtronic',
    shortDescription: 'Durable finger clip sensor for adult patients over 40 kg. Reusable, autoclave-free cleaning.',
    featured: true,
    specifications: [
      { label: 'Patient size', value: 'Adult, >40 kg' },
      { label: 'Site', value: 'Finger' },
      { label: 'Cable length', value: '0.9 m' },
      { label: 'Connector', value: '9-pin D-sub' },
    ],
    compatibleWith: [
      { manufacturer: 'Medtronic', model: 'Nellcor PM10N' },
      { manufacturer: 'Medtronic', model: 'Nellcor N-600x' },
      { manufacturer: 'Philips', model: 'IntelliVue MP20' },
    ],
  },
  {
    name: 'Philips HeartStart MRx Defibrillator Battery',
    partNumber: 'M3538A',
    category: 'Compatible Batteries',
    brand: 'Philips',
    shortDescription: 'Lithium-ion replacement battery for the HeartStart MRx monitor/defibrillator.',
    featured: true,
    specifications: [
      { label: 'Chemistry', value: 'Lithium-ion' },
      { label: 'Voltage', value: '11.1 V' },
      { label: 'Capacity', value: '5.0 Ah' },
    ],
    compatibleWith: [{ manufacturer: 'Philips', model: 'HeartStart MRx' }],
  },
  {
    name: 'Philips HeartStart HS1 AED Battery',
    partNumber: 'M5070A',
    category: 'Compatible Batteries',
    brand: 'Philips',
    shortDescription: 'Long-life primary battery for the HeartStart HS1 / FRx automated external defibrillator.',
    specifications: [
      { label: 'Chemistry', value: 'Lithium manganese dioxide' },
      { label: 'Standby life', value: '4 years typical' },
    ],
    compatibleWith: [
      { manufacturer: 'Philips', model: 'HeartStart HS1' },
      { manufacturer: 'Philips', model: 'HeartStart FRx' },
    ],
  },
  {
    name: 'Valleylab Disposable Adult Patient Plate',
    partNumber: 'F7320W/V',
    category: 'Patient Plates',
    brand: 'Valleylab',
    shortDescription: 'Split return electrode with adhesive hydrogel, for adult monopolar electrosurgery.',
    featured: true,
    specifications: [
      { label: 'Type', value: 'Split, dual-section' },
      { label: 'Patient size', value: 'Adult' },
      { label: 'Packing', value: '50 pieces per box' },
    ],
    variants: [
      { label: 'Adult', partNumber: 'F7820PW/V' },
      { label: 'Neonate', partNumber: 'F7820NW/V' },
    ],
    compatibleWith: [
      { manufacturer: 'Valleylab', model: 'Force FX' },
      { manufacturer: 'Valleylab', model: 'ForceTriad' },
    ],
  },
  {
    name: 'Compatible Fetal TOCO Transducer for Philips',
    partNumber: 'M2735A',
    category: 'Fetal Monitoring',
    brand: 'Philips',
    shortDescription: 'Replacement toco transducer for Philips fetal monitors. Direct fit, no adapter required.',
    featured: true,
    specifications: [
      { label: 'Type', value: 'Tocodynamometer' },
      { label: 'Cable length', value: '2.5 m' },
      { label: 'Connector', value: '12-pin round' },
    ],
    compatibleWith: [
      { manufacturer: 'Philips', model: 'Avalon FM20' },
      { manufacturer: 'Philips', model: 'Avalon FM30' },
      { manufacturer: 'Philips', model: 'Series 50 XM' },
    ],
  },
  {
    name: 'Galvanic Oxygen Sensor PSR-11-75-KE7',
    partNumber: 'PSR-11-75-KE7',
    category: 'Oxygen Sensors',
    shortDescription: 'Galvanic fuel cell oxygen sensor for ventilators and anaesthesia machines.',
    specifications: [
      { label: 'Measuring range', value: '0–100% O₂' },
      { label: 'Response time', value: '< 13 seconds' },
      { label: 'Expected life', value: '~1,000,000 % O₂ hours' },
    ],
    variants: [
      { label: 'KE-4 (Vela)', partNumber: 'PSR-11-75-KE4' },
      { label: 'KE-8', partNumber: 'PSR-11-75-KE8' },
      { label: 'KE-10', partNumber: 'PSR-11-75-KE10' },
    ],
  },
  {
    name: 'Fibre Optic Laryngoscope Set — Macintosh',
    partNumber: 'LAR-FO-MAC',
    category: 'Laryngoscopes',
    shortDescription: 'Stainless steel fibre optic blades with matching handle. Cold light, autoclavable.',
    availability: 'made-to-order',
    specifications: [
      { label: 'Finish', value: 'Satin stainless steel' },
      { label: 'Light', value: 'Fibre optic, cold light' },
      { label: 'Sterilisation', value: 'Autoclavable to 134°C' },
    ],
    variants: [
      { label: 'Mac 1', partNumber: 'LAR-FO-MAC-1' },
      { label: 'Mac 2', partNumber: 'LAR-FO-MAC-2' },
      { label: 'Mac 3', partNumber: 'LAR-FO-MAC-3' },
      { label: 'Mac 4', partNumber: 'LAR-FO-MAC-4' },
    ],
  },
  {
    name: '10 Lead ECG Trunk Cable',
    partNumber: 'ECG-10L-TRK',
    category: 'ECG Cables & Leads',
    shortDescription: 'Ten lead diagnostic ECG trunk cable with moulded strain relief.',
    specifications: [
      { label: 'Leads', value: '10' },
      { label: 'Length', value: '3.0 m' },
      { label: 'Termination', value: 'Banana / snap available' },
    ],
    compatibleWith: [
      { manufacturer: 'Nihon Kohden', model: 'Cardiofax' },
      { manufacturer: 'Zoll', model: 'M Series' },
      { manufacturer: 'Philips', model: 'PageWriter TC30' },
    ],
  },
  {
    name: 'Masimo LNCS DCI Adult Reusable SpO2 Sensor',
    partNumber: 'LNCS-DCI',
    category: 'SpO2 Sensors & Probes',
    brand: 'Masimo',
    shortDescription: 'Reusable adult finger sensor for Masimo SET pulse oximetry. Soft shell, 3 ft cable.',
    specifications: [
      { label: 'Patient size', value: 'Adult, >30 kg' },
      { label: 'Cable length', value: '0.9 m' },
      { label: 'Technology', value: 'Masimo SET' },
    ],
    compatibleWith: [
      { manufacturer: 'Masimo', model: 'Rad-97' },
      { manufacturer: 'Masimo', model: 'Radical-7' },
    ],
  },
  {
    name: 'Nellcor D-YS Multisite Reusable Y Sensor',
    partNumber: 'D-YS',
    category: 'SpO2 Sensors & Probes',
    brand: 'Medtronic',
    shortDescription: 'Wrap-style Y sensor for neonatal, paediatric and adult use across multiple sites.',
    specifications: [
      { label: 'Patient size', value: 'Neonate to adult' },
      { label: 'Site', value: 'Foot, hand, finger, toe' },
    ],
    compatibleWith: [{ manufacturer: 'Medtronic', model: 'Nellcor PM10N' }],
  },
  {
    name: 'Nellcor MAX-N Disposable Neonatal Sensor',
    partNumber: 'MAX-N',
    category: 'SpO2 Sensors & Probes',
    brand: 'Medtronic',
    shortDescription: 'Single-use adhesive sensor for neonates under 3 kg and adults over 40 kg.',
    specifications: [{ label: 'Packing', value: '24 pieces per box' }],
    compatibleWith: [{ manufacturer: 'Medtronic', model: 'Nellcor N-600x' }],
  },
  {
    name: 'Nellcor DOC-10 SpO2 Extension Cable',
    partNumber: 'DOC-10',
    category: 'SpO2 Sensors & Probes',
    brand: 'Medtronic',
    shortDescription: 'Ten-foot extension between a Nellcor sensor and the monitor.',
    specifications: [{ label: 'Length', value: '3.0 m' }],
  },
  {
    name: '5 Lead ECG Trunk Cable',
    partNumber: 'ECG-5L-TRK',
    category: 'ECG Cables & Leads',
    shortDescription: 'Five lead monitoring trunk cable with moulded yoke.',
    specifications: [
      { label: 'Leads', value: '5' },
      { label: 'Length', value: '2.7 m' },
    ],
    compatibleWith: [
      { manufacturer: 'Philips', model: 'IntelliVue MP40' },
      { manufacturer: 'Mindray', model: 'iMEC 12' },
    ],
  },
  {
    name: '3 Lead ECG Cable, Snap Type',
    partNumber: 'ECG-3L-SNP',
    category: 'ECG Cables & Leads',
    shortDescription: 'Three lead patient cable with snap terminations for bedside monitoring.',
    specifications: [{ label: 'Termination', value: 'Snap' }],
    compatibleWith: [{ manufacturer: 'Nihon Kohden', model: 'BSM-2300' }],
  },
  {
    name: 'ECG Lead Wire Set, Banana Type',
    partNumber: 'ECG-LW-BAN',
    category: 'ECG Cables & Leads',
    shortDescription: 'Replacement lead wires for diagnostic ECG carts. Sold as a set of ten.',
    availability: 'made-to-order',
  },
  {
    name: 'L&T and Erbe Disposable Patient Plate',
    partNumber: 'PP-LT-ERB',
    category: 'Patient Plates',
    brand: 'Erbe',
    shortDescription: 'Split return electrode sized for L&T and Erbe electrosurgical generators.',
    specifications: [{ label: 'Packing', value: '50 pieces per box' }],
    compatibleWith: [
      { manufacturer: 'Erbe', model: 'VIO 300 D' },
      { manufacturer: 'L&T', model: 'Surgix' },
    ],
  },
  {
    name: 'Reusable Silicon Patient Plate with Wire',
    partNumber: 'PP-SIL-WIRE',
    category: 'Patient Plates',
    shortDescription: 'Autoclavable silicone return electrode with integral cable.',
    specifications: [
      { label: 'Material', value: 'Medical grade silicone' },
      { label: 'Sterilisation', value: 'Autoclavable' },
    ],
    variants: [
      { label: 'Adult, 2 pin' },
      { label: 'Paediatric, 2 pin' },
    ],
  },
  {
    name: 'Erbe NESSY Omega Split Plate',
    partNumber: 'NESSY-OMEGA',
    category: 'Patient Plates',
    brand: 'Erbe',
    shortDescription: 'Ring-shaped split neutral electrode with direction-independent placement.',
    compatibleWith: [{ manufacturer: 'Erbe', model: 'VIO 3' }],
  },
  {
    name: 'GE Corometrics 5700HAX Ultrasound Transducer',
    partNumber: '5700HAX',
    category: 'Fetal Monitoring',
    brand: 'GE Healthcare',
    shortDescription: 'Replacement ultrasound transducer for Corometrics fetal monitors.',
    compatibleWith: [{ manufacturer: 'GE Healthcare', model: 'Corometrics 170' }],
  },
  {
    name: 'NST and CTG Monitoring Belt',
    partNumber: 'CTG-BELT',
    category: 'Fetal Monitoring',
    shortDescription: 'Knitted elastic belt with button fixing for fetal transducers.',
    specifications: [{ label: 'Length', value: '120 cm' }],
    variants: [{ label: 'Button type' }, { label: 'Buckle type' }],
  },
  {
    name: 'Bistos Fetal FHR and TOCO Transducer',
    partNumber: 'BT-FHR-TOCO',
    category: 'Fetal Monitoring',
    shortDescription: 'Paired heart rate and contraction transducers for Bistos fetal monitors.',
    availability: 'made-to-order',
    compatibleWith: [{ manufacturer: 'Bistos', model: 'BT-350' }],
  },
  {
    name: 'PCGel Supraglottic Airway Device',
    partNumber: 'PCGEL',
    category: 'Respiratory & Airway',
    shortDescription: 'Second generation non-inflatable supraglottic airway with gastric access.',
    featured: true,
    specifications: [{ label: 'Type', value: 'Non-inflatable, second generation' }],
    variants: [
      { label: 'Size 1', partNumber: 'PCGEL-1' },
      { label: 'Size 1.5', partNumber: 'PCGEL-15' },
      { label: 'Size 2', partNumber: 'PCGEL-2' },
      { label: 'Size 2.5', partNumber: 'PCGEL-25' },
      { label: 'Size 3', partNumber: 'PCGEL-3' },
      { label: 'Size 4', partNumber: 'PCGEL-4' },
      { label: 'Size 5', partNumber: 'PCGEL-5' },
    ],
  },
  {
    name: 'Guedel Oropharyngeal Airway',
    partNumber: 'AW-GUEDEL',
    category: 'Respiratory & Airway',
    shortDescription: 'Colour-coded oropharyngeal airway with reinforced bite block.',
    variants: [
      { label: 'Size 000' },
      { label: 'Size 00' },
      { label: 'Size 0' },
      { label: 'Size 1' },
      { label: 'Size 2' },
      { label: 'Size 3' },
      { label: 'Size 4' },
    ],
  },
  {
    name: 'Silicone Resuscitator (Ambu Bag)',
    partNumber: 'RESUS-SIL',
    category: 'Respiratory & Airway',
    shortDescription: 'Autoclavable silicone resuscitator with reservoir bag and mask.',
    variants: [{ label: 'Adult' }, { label: 'Paediatric' }, { label: 'Neonate' }],
  },
  {
    name: 'Bubble CPAP Nasal Prong Set',
    partNumber: 'BCPAP-PRONG',
    category: 'Respiratory & Airway',
    shortDescription: 'Nasal prongs and bonnet for neonatal bubble CPAP circuits.',
    availability: 'made-to-order',
  },
  {
    name: 'City Technology MOX-4 Oxygen Sensor',
    partNumber: 'CITY-MOX-4',
    category: 'Oxygen Sensors',
    shortDescription: 'Galvanic oxygen cell used across anaesthesia and ventilator platforms.',
    specifications: [{ label: 'Measuring range', value: '0–100% O₂' }],
  },
  {
    name: 'Envitec OOM202 Oxygen Sensor',
    partNumber: 'OOM202',
    category: 'Oxygen Sensors',
    shortDescription: 'Replacement oxygen cell for Envitec-equipped ventilators.',
    compatibleWith: [{ manufacturer: 'Dräger', model: 'Evita 4' }],
  },
  {
    name: 'Maquet Servo-s Oxygen Cell',
    partNumber: 'MAQ-SERVO-O2',
    category: 'Oxygen Sensors',
    shortDescription: 'Oxygen sensor for Maquet Servo-i and Servo-s ventilators.',
    compatibleWith: [
      { manufacturer: 'Maquet', model: 'Servo-i' },
      { manufacturer: 'Maquet', model: 'Servo-s' },
    ],
  },
  {
    name: 'Erbe ESU Pencil with Two Buttons',
    partNumber: 'ERB-PENCIL-2B',
    category: 'Electrosurgery',
    brand: 'Erbe',
    shortDescription: 'Hand-controlled monopolar pencil with cut and coagulation buttons.',
    specifications: [{ label: 'Cable length', value: '3.0 m' }],
    compatibleWith: [{ manufacturer: 'Erbe', model: 'VIO 300 D' }],
  },
  {
    name: 'Erbe Bipolar Bayonet Forceps',
    partNumber: 'ERB-BIP-BAY',
    category: 'Electrosurgery',
    brand: 'Erbe',
    shortDescription: 'Bayonet-shaped bipolar forceps, autoclavable, with connecting cable.',
    variants: [{ label: '1.0 mm tip' }, { label: '2.0 mm tip' }],
  },
  {
    name: 'Erbe Monopolar Connecting Cable',
    partNumber: 'ERB-MONO-CBL',
    category: 'Electrosurgery',
    brand: 'Erbe',
    shortDescription: 'Connecting cable between Erbe generators and monopolar instruments.',
    specifications: [{ label: 'Length', value: '4.0 m' }],
  },
  {
    name: 'Fibre Optic Laryngoscope Set — Miller',
    partNumber: 'LAR-FO-MIL',
    category: 'Laryngoscopes',
    shortDescription: 'Straight blade fibre optic laryngoscope set for paediatric intubation.',
    variants: [
      { label: 'Miller 0', partNumber: 'LAR-FO-MIL-0' },
      { label: 'Miller 1', partNumber: 'LAR-FO-MIL-1' },
      { label: 'Miller 2', partNumber: 'LAR-FO-MIL-2' },
      { label: 'Miller 3', partNumber: 'LAR-FO-MIL-3' },
    ],
  },
  {
    name: 'Video Laryngoscope with Reusable Blade',
    partNumber: 'LAR-VID-RB',
    category: 'Laryngoscopes',
    shortDescription: 'Portable video laryngoscope, 3.2 inch touchscreen, Mac and Miller blades.',
    featured: true,
    specifications: [
      { label: 'Display', value: '3.2 inch touchscreen, 800 × 480' },
      { label: 'Battery', value: '2500 mAh, over 6.5 hours' },
      { label: 'Storage', value: '16 GB internal' },
    ],
    variants: [{ label: 'Mac 1–4' }, { label: 'Miller 00–0' }, { label: 'D-Blade' }],
  },
  {
    name: 'Zoll R Series Defibrillator Battery',
    partNumber: '8019-0535-01',
    category: 'Compatible Batteries',
    brand: 'Zoll',
    shortDescription: 'Replacement SurePower battery pack for the Zoll R Series.',
    compatibleWith: [{ manufacturer: 'Zoll', model: 'R Series' }],
  },
  {
    name: 'Mindray T5 Patient Monitor Battery',
    partNumber: 'LI23S002A',
    category: 'Compatible Batteries',
    brand: 'Mindray',
    shortDescription: 'Lithium-ion battery for Mindray BeneView T5 and T8 monitors.',
    compatibleWith: [
      { manufacturer: 'Mindray', model: 'BeneView T5' },
      { manufacturer: 'Mindray', model: 'BeneView T8' },
    ],
  },
  {
    name: 'GE MAC 2000 ECG Battery',
    partNumber: '88881342',
    category: 'Compatible Batteries',
    brand: 'GE Healthcare',
    shortDescription: 'Replacement battery for the GE MAC 2000 resting ECG system.',
    compatibleWith: [{ manufacturer: 'GE Healthcare', model: 'MAC 2000' }],
  },
  {
    name: 'Philips IntelliVue X3 Battery',
    partNumber: '989803196521',
    category: 'Compatible Batteries',
    brand: 'Philips',
    shortDescription: 'Lithium-ion battery for IntelliVue X3 and MX100 transport monitors.',
    compatibleWith: [
      { manufacturer: 'Philips', model: 'IntelliVue X3' },
      { manufacturer: 'Philips', model: 'IntelliVue MX100' },
    ],
  },
  {
    name: 'Medtronic Nellcor PM10N Patient Monitoring System',
    partNumber: 'PM10N',
    category: 'Patient Monitors',
    brand: 'Medtronic',
    shortDescription: 'Portable bedside pulse oximetry monitor with Nellcor SpO2.',
    availability: 'made-to-order',
  },
  {
    name: 'Promptcare M80 Patient Monitor',
    partNumber: 'PC-M80',
    category: 'Patient Monitors',
    shortDescription: 'Multiparameter bedside monitor — ECG, SpO2, NIBP, temperature and respiration.',
    availability: 'made-to-order',
  },
  {
    name: 'Bionet Cardio7 12 Channel ECG',
    partNumber: 'CARDIO7',
    category: 'Patient Monitors',
    shortDescription: 'Twelve channel interpretive ECG with 7 inch colour display.',
    availability: 'made-to-order',
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  /**
   * Adds only what is missing, matching categories and brands by name and
   * products by part number. Re-running after the catalogue has grown tops it
   * up instead of refusing outright, and never duplicates or overwrites
   * anything the owner has edited.
   */
  const findOrCreate = async (
    collection: 'categories' | 'brands' | 'products',
    where: Where,
    data: Record<string, unknown>,
  ): Promise<{ id: number; created: boolean }> => {
    const { docs } = await payload.find({ collection, where, limit: 1, depth: 0 })
    if (docs[0]) return { id: docs[0].id as number, created: false }
    const created = await payload.create({ collection, data: data as never })
    return { id: created.id as number, created: true }
  }

  payload.logger.info('Categories…')
  const categoryIds = new Map<string, number>()
  let newCategories = 0
  for (const [index, category] of categories.entries()) {
    const { id, created } = await findOrCreate(
      'categories',
      { name: { equals: category.name } },
      { ...category, displayOrder: index },
    )
    categoryIds.set(category.name, id)
    if (created) newCategories += 1
  }

  payload.logger.info('Brands…')
  const brandIds = new Map<string, number>()
  let newBrands = 0
  for (const brand of brands) {
    const { id, created } = await findOrCreate(
      'brands',
      { name: { equals: brand.name } },
      brand,
    )
    brandIds.set(brand.name, id)
    if (created) newBrands += 1
  }

  payload.logger.info('Products…')
  let newProducts = 0
  for (const product of products) {
    const { category, brand, ...rest } = product
    const { created } = await findOrCreate(
      'products',
      { partNumber: { equals: product.partNumber } },
      {
        ...rest,
        availability: rest.availability ?? 'in-stock',
        category: categoryIds.get(category)!,
        brand: brand ? brandIds.get(brand) : undefined,
        showPrice: false,
      },
    )
    if (created) newProducts += 1
  }

  payload.logger.info(
    `Added ${newCategories} categories, ${newBrands} brands, ${newProducts} products. ` +
      `Anything already present was left untouched.`,
  )
  process.exit(0)
}

try {
  await run()
} catch (error) {
  console.error('Seed failed:', error)
  process.exit(1)
}
