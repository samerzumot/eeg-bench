"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  PatientProfile,
  INITIAL_PATIENTS,
  loadPatients,
  updatePatientDoctorNote,
  updatePatientProtocol,
  recordPatientSessionCompletion,
} from "@/lib/evolve/patientStore";
import { museBle, BleConnectionStatus } from "@/lib/evolve/museBleService";
import { EvolveNavbar } from "@/components/evolve/EvolveNavbar";
import { EvolveAuthModal } from "@/components/evolve/EvolveAuthModal";
import { DoctorDemoModal } from "@/components/evolve/DoctorDemoModal";
import { MuseModal } from "@/components/evolve/MuseModal";
import { PatientDashboard } from "@/components/evolve/PatientDashboard";
import { NeurofeedbackEngine } from "@/components/evolve/NeurofeedbackEngine";
import { ClinicianView } from "@/components/evolve/ClinicianView";
import { EvolveFooter } from "@/components/evolve/EvolveFooter";

function EvolvePortalContent() {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [patients, setPatients] = useState<PatientProfile[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>("EV-084");
  const [currentRole, setCurrentRole] = useState<"patient" | "clinician">("patient");
  const [currentTab, setCurrentTab] = useState<"patient" | "session" | "clinician">("patient");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isMuseModalOpen, setIsMuseModalOpen] = useState<boolean>(false);
  const [bleStatus, setBleStatus] = useState<BleConnectionStatus>("disconnected");

  // Load patients and subscribe to BLE
  useEffect(() => {
    const loaded = loadPatients();
    setPatients(loaded);

    const unsubBle = museBle.subscribe((status) => {
      setBleStatus(status);
    });

    return () => {
      unsubBle();
    };
  }, []);

  // Parse deep link query parameters
  useEffect(() => {
    if (!searchParams) return;

    const patientParam = searchParams.get("patient");
    const roleParam = searchParams.get("role") || searchParams.get("doctor");
    const tabParam = searchParams.get("tab") || searchParams.get("session");
    const demoParam = searchParams.get("demo");

    if (patientParam) {
      const match = patients.find(
        (p) =>
          p.id.toLowerCase() === patientParam.toLowerCase() ||
          p.name.toLowerCase().includes(patientParam.toLowerCase())
      );
      if (match) {
        setActivePatientId(match.id);
        setCurrentRole("patient");
        setCurrentTab("patient");
      }
    }

    if (roleParam === "clinician" || roleParam === "gala" || roleParam === "doctor") {
      setCurrentRole("clinician");
      setCurrentTab("clinician");
    }

    if (tabParam === "session" || tabParam === "start") {
      setCurrentTab("session");
    } else if (tabParam === "clinician") {
      setCurrentRole("clinician");
      setCurrentTab("clinician");
    }

    if (demoParam === "true" || demoParam === "1") {
      setIsDemoOpen(true);
    }
  }, [searchParams, patients]);

  const activePatient =
    patients.find((p) => p.id === activePatientId) || patients[0];

  const handleUpdateDoctorNote = (patientId: string, note: string) => {
    const updated = updatePatientDoctorNote(patientId, note);
    setPatients(updated);
  };

  const handleUpdateProtocol = (
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
  ) => {
    const updated = updatePatientProtocol(patientId, updates);
    setPatients(updated);
  };

  const handleFinishSession = (inZonePercent: number) => {
    const updated = recordPatientSessionCompletion(activePatient.id, inZonePercent);
    setPatients(updated);
    setCurrentTab("patient");
  };

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col font-sans">
      {/* Navigation Header */}
      <EvolveNavbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          startTransition(() => {
            setCurrentTab(tab);
            if (tab === "clinician") {
              setCurrentRole("clinician");
            } else if (tab === "patient") {
              setCurrentRole("patient");
            }
          });
        }}
        currentRole={currentRole}
        activePatient={activePatient}
        bleStatus={bleStatus}
        onConnectBle={() => setIsMuseModalOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 mx-auto max-w-6xl px-6 py-8 w-full">
        {currentTab === "patient" && (
          <PatientDashboard
            patient={activePatient}
            patients={patients}
            onSelectPatient={(id) => {
              setActivePatientId(id);
              setCurrentRole("patient");
            }}
            onStartSession={() => setCurrentTab("session")}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenDemo={() => setIsDemoOpen(true)}
            onOpenMuseModal={() => setIsMuseModalOpen(true)}
            isMuseConnected={bleStatus === "connected"}
          />
        )}

        {currentTab === "session" && (
          <NeurofeedbackEngine
            patient={activePatient}
            onFinishSession={handleFinishSession}
            onBackToDashboard={() => setCurrentTab("patient")}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {currentTab === "clinician" && (
          <ClinicianView
            patients={patients}
            selectedPatientId={activePatientId}
            onSelectPatient={(id) => setActivePatientId(id)}
            onUpdateNote={handleUpdateDoctorNote}
            onUpdateProtocol={handleUpdateProtocol}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}
      </main>

      {/* Auth / Profile Switcher Modal */}
      <EvolveAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        patients={patients}
        activePatientId={activePatientId}
        onSelectPatient={(id) => {
          setActivePatientId(id);
        }}
        onSelectRole={(role) => {
          setCurrentRole(role);
          setCurrentTab(role === "clinician" ? "clinician" : "patient");
        }}
        currentRole={currentRole}
      />

      {/* Muse Headband Pairing Modal */}
      <MuseModal
        isOpen={isMuseModalOpen}
        onClose={() => setIsMuseModalOpen(false)}
        onConnected={() => setIsMuseModalOpen(false)}
      />

      {/* Doctor Demo Tour Modal */}
      <DoctorDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onLaunchLiveSession={() => {
          setCurrentTab("session");
        }}
      />

      {/* Dedicated Evolve Clinic Footer */}
      <EvolveFooter />
    </div>
  );
}

export default function EvolvePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 bg-white">
          <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span>Loading Evolve Neurofeedback Portal...</span>
          </div>
        </div>
      }
    >
      <EvolvePortalContent />
    </Suspense>
  );
}
