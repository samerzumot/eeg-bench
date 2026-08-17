export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  indication: string;
  protocolType: "ilf_adhd" | "ilf_anxiety" | "ilf_dual" | "ilf_peak";
  protocolName: string;
  optimalResponseFrequencyHz: number; // e.g. 0.005 Hz, 0.012 Hz
  electrodeMontage: string;
  somaticInhibitBand: string;
  targetMetric: string;
  thresholdScore: number;
  sessionDurationMin: number;
  completedSessions: number;
  totalPrescribed: number;
  currentStreakDays: number;
  coherenceImprovementPercent: number;
  baselineScore: number;
  currentScore: number;
  prescribedDate: string;
  doctorNote: string;
  clinicalObjectives: string[];
}

export interface ClinicianProfile {
  name: string;
  title: string;
  credentials: string;
  clinic: string;
  locations: string[];
  photoUrl: string;
  email: string;
  methodology: string;
}

export const DR_UPASANA_GALA: ClinicianProfile = {
  name: "Dr. Upasana Gala",
  title: "Founder & Managing Director",
  credentials: "PhD, BCN, QEEG-D (Board Certified Neurotherapist)",
  clinic: "Evolve Brain Training",
  locations: ["Dubai Healthcare City", "Abu Dhabi"],
  photoUrl: "/evolve/dr-upasana-gala.png",
  email: "drgala@evolvebraintraining.com",
  methodology: "Infra-Low Frequency (ILF) Neurofeedback & Quantitative EEG (QEEG)",
};

export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: "EV-084",
    name: "Sarah Chen",
    age: 28,
    gender: "Female",
    email: "sarah.chen@example.com",
    indication: "ADHD (Prefrontal Executive Regulation & Attentional Drift)",
    protocolType: "ilf_adhd",
    protocolName: "Prefrontal-Temporal ILF (0.005 Hz) + High-Beta Inhibit",
    optimalResponseFrequencyHz: 0.005,
    electrodeMontage: "Bipolar AF7–TP9 / AF8–TP10 (Othmer 10-20 Standard)",
    somaticInhibitBand: "22–36 Hz (Somatic / Fidgeting Inhibit)",
    targetMetric: "Infra-Low Slow Wave Regulation (0.005 Hz)",
    thresholdScore: 68,
    sessionDurationMin: 15,
    completedSessions: 14,
    totalPrescribed: 30,
    currentStreakDays: 14,
    coherenceImprovementPercent: 28.4,
    baselineScore: 42,
    currentScore: 78,
    prescribedDate: "2026-08-01",
    doctorNote:
      "Sarah's Optimal Response Frequency (ORF) is locked at 0.005 Hz. The visual feedback provides continuous graded reflection of her slow cortical potential to foster effortless subcortical self-regulation. Recommended schedule: 1 session daily in the morning.",
    clinicalObjectives: [
      "Train continuous Infra-Low Frequency (0.005 Hz) Slow Cortical Potentials",
      "Suppress spontaneous mid-frontal theta mind-wandering oscillations",
      "Reinforce Central Executive Network (CEN) stability via continuous graded visual flow",
    ],
  },
  {
    id: "EV-102",
    name: "Omar Al-Falasi",
    age: 34,
    gender: "Male",
    email: "omar.falasi@example.com",
    indication: "Generalized Anxiety & Autonomic Hyperarousal",
    protocolType: "ilf_anxiety",
    protocolName: "Right Temporal-Parietal ILF (0.002 Hz) + Alpha Synchrony",
    optimalResponseFrequencyHz: 0.002,
    electrodeMontage: "Bipolar T4–P4 / TP10 Inter-hemispheric (Calming Lead)",
    somaticInhibitBand: "22–38 Hz (Temporalis EMG Jaw-Clench Inhibit)",
    targetMetric: "Parasympathetic Slow Wave Stability (0.002 Hz)",
    thresholdScore: 72,
    sessionDurationMin: 20,
    completedSessions: 18,
    totalPrescribed: 30,
    currentStreakDays: 9,
    coherenceImprovementPercent: 34.1,
    baselineScore: 36,
    currentScore: 82,
    prescribedDate: "2026-07-20",
    doctorNote:
      "Omar responds optimally at ultra-low 0.002 Hz with high-beta somatic muscle inhibits active at temporal electrodes (TP9/TP10). Visual aperture and luminance smoothly guide central autonomic nervous system down-regulation.",
    clinicalObjectives: [
      "Target right hemisphere soothing lead at 0.002 Hz Optimal Response Frequency",
      "Inhibit somatic high-frequency muscle tension (>22 Hz) with automatic sensor gating",
      "Promote Default Mode Network (DMN) calming and parasympathetic vagal recovery",
    ],
  },
  {
    id: "EV-115",
    name: "Maya Lin",
    age: 22,
    gender: "Female",
    email: "maya.lin@example.com",
    indication: "ADHD + Anxiety Mixed Dysregulation",
    protocolType: "ilf_dual",
    protocolName: "Bilateral Frontal-Temporal Dual ILF (0.012 Hz)",
    optimalResponseFrequencyHz: 0.012,
    electrodeMontage: "AF7–TP9 & AF8–TP10 Synchronized Bilateral",
    somaticInhibitBand: "24–36 Hz Muscle Tension Filter",
    targetMetric: "Dual Executive & Autonomic Balance (0.012 Hz)",
    thresholdScore: 65,
    sessionDurationMin: 15,
    completedSessions: 8,
    totalPrescribed: 24,
    currentStreakDays: 6,
    coherenceImprovementPercent: 21.7,
    baselineScore: 45,
    currentScore: 71,
    prescribedDate: "2026-08-08",
    doctorNote:
      "Maya's calming and focus regulatory networks are trained simultaneously at 0.012 Hz ORF. Continuous luminance and audio reflection provide zero-startle neuroregulation.",
    clinicalObjectives: [
      "Balance prefrontal attentional control with autonomic soothing",
      "Prevent hyper-vigilance fatigue using continuous sensory flow",
      "Stabilize cross-frequency coupling across infra-low and alpha rhythms",
    ],
  },
];

const PATIENTS_STORAGE_KEY = "evolve_neurofeedback_patients_ilf_v2";

export function loadPatients(): PatientProfile[] {
  if (typeof window === "undefined") return INITIAL_PATIENTS;
  try {
    const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load patients from localStorage:", e);
  }
  return INITIAL_PATIENTS;
}

export function savePatients(patients: PatientProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.warn("Failed to save patients to localStorage:", e);
  }
}

export function updatePatientDoctorNote(patientId: string, note: string): PatientProfile[] {
  const list = loadPatients();
  const updated = list.map((p) => (p.id === patientId ? { ...p, doctorNote: note } : p));
  savePatients(updated);
  return updated;
}

export function updatePatientProtocol(
  patientId: string,
  updates: Partial<
    Pick<
      PatientProfile,
      | "protocolType"
      | "protocolName"
      | "optimalResponseFrequencyHz"
      | "thresholdScore"
      | "sessionDurationMin"
      | "electrodeMontage"
    >
  >
): PatientProfile[] {
  const list = loadPatients();
  const updated = list.map((p) => (p.id === patientId ? { ...p, ...updates } : p));
  savePatients(updated);
  return updated;
}

export function recordPatientSessionCompletion(patientId: string, inZonePercent: number): PatientProfile[] {
  const list = loadPatients();
  const updated = list.map((p) => {
    if (p.id !== patientId) return p;
    const completedSessions = Math.min(p.totalPrescribed, p.completedSessions + 1);
    const currentStreakDays = p.currentStreakDays + 1;
    const currentScore = Math.min(99, Math.round(p.currentScore * 0.9 + inZonePercent * 0.1));
    return {
      ...p,
      completedSessions,
      currentStreakDays,
      currentScore,
    };
  });
  savePatients(updated);
  return updated;
}
