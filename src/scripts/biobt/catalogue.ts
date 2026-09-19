import { bullets, heading, paragraph, richText } from './lexical'

/**
 * The BioBT range, rewritten for this site.
 *
 * Specifications and claims are taken faithfully from BioBT's own product
 * pages, but every sentence is rewritten. Two sites carrying identical copy
 * compete with each other in search and Google generally keeps the original,
 * so republishing their text verbatim would have worked against the ranking
 * this import is meant to improve. Each entry also carries its own meta title
 * and description aimed at what buyers actually type — "portable ECG machine",
 * "spirometer price", "CPET system India" — rather than the product name alone.
 */

export type BiobtCategory = {
  name: string
  slug: string
  description: string
  metaTitle: string
  metaDescription: string
}

export const categories: BiobtCategory[] = [
  {
    name: 'Cardiac Diagnostics',
    slug: 'cardiac-diagnostics',
    description:
      'ECG recorders, Holter monitors and rhythm-analysis systems for hospitals, clinics and home cardiac screening.',
    metaTitle: 'Cardiac Diagnostic Equipment — ECG & Holter Monitors',
    metaDescription:
      'Portable ECG recorders, Holter monitors and rhythm analysis software supplied across India by GR Enterprises, Mohali. Request a quote.',
  },
  {
    name: 'Pulmonary Function Testing',
    slug: 'pulmonary-function-testing',
    description:
      'Spirometers and cardiopulmonary exercise testing systems for COPD and asthma diagnosis and exercise capacity assessment.',
    metaTitle: 'Spirometers & CPET Systems — Pulmonary Function Testing',
    metaDescription:
      'Spirometry and cardiopulmonary exercise testing equipment for hospitals, clinics and research. Supplied across India from Mohali.',
  },
  {
    name: 'EEG & Neurofeedback',
    slug: 'eeg-neurofeedback',
    description:
      'EEG acquisition and neurofeedback platforms for clinical neuroscience, therapy and cognitive training.',
    metaTitle: 'EEG & Neurofeedback Systems for Clinics and Research',
    metaDescription:
      'EEG acquisition and neurofeedback equipment for neurotherapy, ADHD programmes, cognitive training and clinical research. Quote on request.',
  },
]

export type BiobtProduct = {
  name: string
  slug: string
  partNumber: string
  categorySlug: string
  shortDescription: string
  metaTitle: string
  metaDescription: string
  specifications: { label: string; value: string }[]
  images: string[]
  featured?: boolean
  description: ReturnType<typeof richText>
}

const closing = (what: string) =>
  paragraph(
    `GR Enterprises is an authorised distributor for BioBT and supplies the ${what} to hospitals, ` +
      'diagnostic centres, clinics and research institutions across India, from our base in Mohali ' +
      'serving Chandigarh, Mohali and Panchkula. Request a quote for current pricing, delivery ' +
      'timelines and installation.',
  )

export const products: BiobtProduct[] = [
  {
    name: 'ECG BlueBT',
    slug: 'ecg-bluebt',
    partNumber: 'BLUEBT',
    categorySlug: 'cardiac-diagnostics',
    featured: true,
    shortDescription:
      'Single-channel Bluetooth ECG that records a medical-grade trace directly to a smartphone or tablet.',
    metaTitle: 'ECG BlueBT — Portable Bluetooth ECG Monitor',
    metaDescription:
      'Single-channel smartphone ECG recorder with HRV analysis and atrial fibrillation detection. Authorised BioBT distributor in Mohali. Request a quote.',
    images: ['ecgbluebt.png', 'app_ss-portrait.png', '2150456090.jpg', '38501.jpg'],
    specifications: [
      { label: 'Channels', value: 'Single channel' },
      { label: 'Connectivity', value: 'Bluetooth to smartphone or tablet' },
      { label: 'Recording length', value: '30 seconds or 5 minutes' },
      { label: 'Electrodes', value: 'Two-way — touch and snap' },
      { label: 'Power', value: 'Rechargeable, with power-saving mode' },
      { label: 'Analysis', value: 'HRV, SDNN, LF/HF ratio, Baevsky stress index' },
    ],
    description: richText([
      paragraph(
        'ECG BlueBT is a compact single-channel electrocardiograph that captures a medical-grade ' +
          'trace and sends it straight to a paired smartphone or tablet over Bluetooth. It is light ' +
          'enough to carry in a pocket, which makes it suited to bedside checks, home monitoring ' +
          'and field screening camps where a full twelve-lead cart is impractical.',
      ),
      heading('Rhythms it helps identify'),
      paragraph(
        'The device records the heart’s electrical activity in real time and the resulting trace ' +
          'can be shared with a clinician for review. It is used to look for:',
      ),
      bullets([
        'Normal sinus rhythm',
        'Atrial fibrillation',
        'Atrial flutter',
        'Bradycardia',
        'Tachycardia',
        'Sinus rhythm with premature ventricular contractions',
      ]),
      heading('Heart rate variability'),
      paragraph(
        'Heart rate variability is a useful marker of autonomic function and cardiac stress. ' +
          'ECG BlueBT reports SDNN — the standard deviation of RR intervals — alongside the LF/HF ' +
          'ratio and Baevsky stress index. An SDNN reading falling below roughly 30 milliseconds is ' +
          'commonly treated as a signal worth investigating further.',
      ),
      closing('ECG BlueBT'),
    ]),
  },
  {
    name: 'HolterSync',
    slug: 'holtersync',
    partNumber: 'HOLTERSYNC',
    categorySlug: 'cardiac-diagnostics',
    featured: true,
    shortDescription:
      'Portable single-lead ECG recorder with AI-assisted analysis — a clinical-grade reading in about a minute.',
    metaTitle: 'HolterSync — Portable Single-Lead ECG Recorder',
    metaDescription:
      'Handheld AI-driven ECG for atrial fibrillation, bradycardia and tachycardia screening. Standalone or Bluetooth to Android. BioBT distributor, Mohali.',
    images: ['holtersync2.png', 'holtersynclady.png'],
    specifications: [
      { label: 'Leads', value: 'Single lead' },
      { label: 'Test duration', value: 'Approximately one minute' },
      { label: 'Operation', value: 'Standalone, or paired to Android over Bluetooth' },
      { label: 'Analysis', value: 'AI-assisted rhythm interpretation' },
      { label: 'Reporting', value: 'On-device and in-app reports' },
    ],
    description: richText([
      paragraph(
        'HolterSync is a portable single-lead ECG recorder built for quick, repeatable heart ' +
          'rhythm checks. A reading takes about a minute and returns results to clinical standards, ' +
          'which makes it practical for routine screening rather than only for investigation after ' +
          'symptoms appear.',
      ),
      heading('Where it is used'),
      bullets([
        'Routine cardiac checks in clinics and general practice',
        'Atrial fibrillation screening and stroke risk assessment',
        'Monitoring bradycardia and tachycardia over time',
        'Patient self-monitoring between appointments',
      ]),
      heading('Standalone or connected'),
      paragraph(
        'The recorder works on its own, so no phone is required at the point of use. Paired over ' +
          'Bluetooth to an Android device it displays detailed reports immediately, which is useful ' +
          'when the reading needs to be discussed with the patient in the room.',
      ),
      closing('HolterSync recorder'),
    ]),
  },
  {
    name: 'Holter 3ch',
    slug: 'holter-3ch',
    partNumber: 'DL3',
    categorySlug: 'cardiac-diagnostics',
    shortDescription:
      'Three-channel Holter recorder with Windows analysis software, 24-hour reporting and AFib detection.',
    metaTitle: 'Holter 3ch — 3-Channel Holter Monitor with Software',
    metaDescription:
      'Clinical-quality 3-channel Holter ECG recorder with 7-lead placement, 24-hour reports, AFib detection and HRV analysis. Supplied across India.',
    images: ['holter3ch1.png', 'holter3ch2.png'],
    specifications: [
      { label: 'Model', value: 'DL3' },
      { label: 'Channels', value: '3 channel, 7-lead placement' },
      { label: 'Power', value: '3V AAA battery' },
      { label: 'Data transfer', value: 'USB — mounts as a flash drive, no card removal' },
      { label: 'Software', value: 'Windows-based analysis suite' },
      { label: 'Reporting', value: '24-hour reports, page-by-page review, event-wise summary' },
      { label: 'Analysis', value: 'Atrial fibrillation detection, HRV' },
    ],
    description: richText([
      paragraph(
        'Holter 3ch is a clinical-quality ambulatory ECG recorder for patients with known or ' +
          'suspected heart conditions. It records continuously over an extended period so that ' +
          'intermittent arrhythmias — the ones a short in-clinic ECG tends to miss — have a chance ' +
          'of being captured.',
      ),
      heading('DL3 recorder'),
      bullets([
        'Runs on a single 3V AAA battery',
        'Seven-lead placement for accurate three-channel capture',
        'Signal conditioning designed by biopotential specialists, for a low-noise trace',
        'Reads over USB and is detected as a flash drive, so no memory card handling',
        'Low power draw, with a switch-off control that guards against overwriting data',
      ]),
      heading('Analysis software'),
      paragraph(
        'The Windows software turns a full recording into something a clinician can work through ' +
          'quickly: twenty-four hour reports for the overall picture, page-by-page review for ' +
          'detailed examination, and event-wise grouping so findings are consolidated rather than ' +
          'scattered. Atrial fibrillation detection and heart rate variability analysis are included.',
      ),
      closing('Holter 3ch system'),
    ]),
  },
  {
    name: 'SpiroBT',
    slug: 'spirobt',
    partNumber: 'SPIROBT',
    categorySlug: 'pulmonary-function-testing',
    featured: true,
    shortDescription:
      'Spirometer for FVC, SVC and MVV testing, with Windows software, real-time graphs and PDF reporting.',
    metaTitle: 'SpiroBT Spirometer — FVC, SVC & MVV Lung Function Testing',
    metaDescription:
      'Spirometer for COPD and asthma diagnosis. FVC, SVC and MVV, Bluetooth and USB, IEC 60601-1 and ISO 26782 compliant. Quote from GR Enterprises, Mohali.',
    images: ['laptop_spiro.png'],
    specifications: [
      { label: 'Tests', value: 'FVC, SVC, MVV' },
      { label: 'Connectivity', value: 'Bluetooth and USB' },
      { label: 'Compliance', value: 'IEC 60601-1, ISO 26782' },
      { label: 'Software', value: 'Windows-based' },
      { label: 'Reporting', value: 'PDF export and direct printing' },
      { label: 'Comparison', value: 'Pre and post graphs on all tests' },
    ],
    description: richText([
      paragraph(
        'SpiroBT is a spirometer for measuring lung capacity in the diagnosis and monitoring of ' +
          'COPD, asthma and other respiratory conditions. It covers forced vital capacity, slow ' +
          'vital capacity and maximum voluntary ventilation, and plots results in real time so the ' +
          'quality of a manoeuvre is obvious while the patient is still at the mouthpiece.',
      ),
      heading('Built for everyday clinic use'),
      bullets([
        'Real-time graph display with full analysis',
        'Pre and post bronchodilator graphs on every test',
        'PDF export and direct printing for reporting',
        'Bluetooth and USB connectivity',
        'Minimal training needed to operate',
      ]),
      heading('Standards'),
      paragraph(
        'SpiroBT meets IEC 60601-1 for medical electrical equipment and ISO 26782 for spirometers ' +
          'intended to measure timed forced expiratory volumes — worth confirming on any tender ' +
          'documentation, where both are routinely specified.',
      ),
      closing('SpiroBT spirometer'),
    ]),
  },
  {
    name: 'SpiroBT Vmax CPET System',
    slug: 'spirobt-vmax-cpet-system',
    partNumber: 'SPIROBT-VMAX',
    categorySlug: 'pulmonary-function-testing',
    featured: true,
    shortDescription:
      'Indian-made cardiopulmonary exercise testing system with real-time VO2 max and ventilatory threshold measurement.',
    metaTitle: 'SpiroBT Vmax CPET System — Cardiopulmonary Exercise Testing',
    metaDescription:
      'The first Indian-made CPET system. Real-time VO2 max and ventilatory threshold, treadmill and cycle ergometer integration. Supplied across India.',
    images: ['spiro.jpeg'],
    specifications: [
      { label: 'Type', value: 'Cardiopulmonary exercise testing (CPET)' },
      { label: 'Origin', value: 'Made in India' },
      { label: 'Measurements', value: 'Real-time gas exchange, VO2 max, ventilatory threshold' },
      { label: 'Integration', value: 'Treadmills and cycle ergometers' },
      { label: 'Protocols', value: 'Customisable for clinical, research and teaching use' },
      { label: 'Reporting', value: 'Full reporting with export' },
    ],
    description: richText([
      paragraph(
        'SpiroBT Vmax is the first cardiopulmonary exercise testing system designed and built in ' +
          'India. CPET measures how the heart, lungs and muscles perform together under load, which ' +
          'makes it the reference test for unexplained breathlessness, pre-operative risk ' +
          'assessment and exercise physiology research.',
      ),
      heading('What it measures'),
      bullets([
        'Real-time cardiopulmonary data during exercise',
        'VO2 max and ventilatory threshold',
        'Customisable protocols for research and teaching',
        'Reports with export for further analysis',
      ]),
      heading('Practical considerations'),
      bullets([
        'Connects directly to treadmills and cycle ergometers',
        'Quick, repeatable calibration',
        'Compact and light, with low maintenance',
        'Interface designed for physiology teaching as well as clinical work',
      ]),
      paragraph(
        'Being manufactured in India matters for more than cost: service, spares and support are ' +
          'domestic, which shortens turnaround when a system needs attention.',
      ),
      closing('SpiroBT Vmax CPET system'),
    ]),
  },
  {
    name: 'NeuroBT Biofeedback System',
    slug: 'neurobt-biofeedback-system',
    partNumber: 'NEUROBT',
    categorySlug: 'eeg-neurofeedback',
    shortDescription:
      'EEG acquisition and neurofeedback platform for clinical therapy, cognitive training and neuroscience research.',
    metaTitle: 'NeuroBT EEG Biofeedback & Neurofeedback System',
    metaDescription:
      'High-resolution EEG acquisition with real-time visualisation and customisable neurofeedback protocols for ADHD support, neurotherapy and research.',
    images: ['neurobt-system.jpeg', 'neurobt-patient.jpeg', 'neurobt-software-screenshot.jpeg'],
    specifications: [
      { label: 'Acquisition', value: 'High-resolution EEG' },
      { label: 'Signal quality', value: 'Low noise' },
      { label: 'Data transfer', value: 'Wireless' },
      { label: 'Visualisation', value: 'Real-time' },
      { label: 'Protocols', value: 'Customisable neurofeedback' },
      { label: 'Software', value: 'Single integrated environment' },
    ],
    description: richText([
      paragraph(
        'NeuroBT is a neurotechnology platform for brain monitoring, neurofeedback training and ' +
          'cognitive performance work. High-resolution EEG acquisition, real-time visualisation, ' +
          'analytics and neurofeedback protocols sit in one integrated environment, so a session ' +
          'does not require moving data between separate tools.',
      ),
      heading('Applications'),
      bullets([
        'Neurofeedback therapy',
        'Cognitive training',
        'Stress management',
        'ADHD support programmes',
        'Peak performance training',
        'Clinical neuroscience research',
      ]),
      heading('Who it suits'),
      paragraph(
        'The system is aimed at clinicians, neuro-therapists and researchers who need both a ' +
          'dependable EEG signal and the means to act on it during a session. Detailed ' +
          'specifications are available on request — tell us the protocols you intend to run and ' +
          'we will confirm suitability before you commit.',
      ),
      closing('NeuroBT system'),
    ]),
  },
]
