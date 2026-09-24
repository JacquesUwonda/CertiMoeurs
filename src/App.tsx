import React, { useState } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InstructorPortal } from './components/agent/InstructorPortal';
import { AuthModal } from './components/auth/AuthModal';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { NewApplicationWizard } from './components/citizen/NewApplicationWizard';
import { Footer } from './components/common/Footer';
import { Header } from './components/common/Header';
import { GuichetPortal } from './components/guichet/GuichetPortal';
import { LandingPage } from './components/public/LandingPage';
import { TrackingView } from './components/tracking/TrackingView';
import { ValidatorPortal } from './components/validator/ValidatorPortal';
import { PublicVerificationPortal } from './components/verifier/PublicVerificationPortal';
import { useCertiStore } from './services/store';
import { DemandeCertificat } from './types';

export function App() {
  const { currentRole, setRole, isAuthenticated, currentUser } = useCertiStore();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAssistedKiosk, setIsAssistedKiosk] = useState(false);
  const [trackingDemande, setTrackingDemande] = useState<DemandeCertificat | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingStartWizard, setPendingStartWizard] = useState(false);

  // Auto-redirect based on authentication state
  React.useEffect(() => {
    if (isAuthenticated && currentRole) {
      if (currentRole === 'guichet') setCurrentTab('guichet');
      else if (currentRole === 'agent_instructeur') setCurrentTab('instructor');
      else if (currentRole === 'responsable_valideur') setCurrentTab('validator');
      else if (currentRole === 'administrateur') setCurrentTab('admin');
      else if (currentRole === 'organisme_verificateur') setCurrentTab('verify');
      else if (currentTab === 'landing' || currentTab === 'citizen') setCurrentTab('citizen');
    } else {
      if (currentTab !== 'verify' && currentTab !== 'tracking') {
        setCurrentTab('landing');
      }
    }
  }, [isAuthenticated, currentRole]);

  const handleStartNewApplication = (assisted = false) => {
    if (!assisted) {
      // Vérifier si le citoyen est authentifié
      if (!isAuthenticated || currentUser?.role !== 'citoyen') {
        setAuthModalReason('Pour initier une demande officielle de certificat de bonne vie et mœurs, vous devez vous connecter ou créer votre compte citoyen en base de données.');
        setPendingStartWizard(true);
        setAuthModalOpen(true);
        return;
      }
    }
    setIsAssistedKiosk(assisted);
    setCurrentTab('new-demande');
  };

  const handleAuthSuccess = () => {
    if (pendingStartWizard) {
      setPendingStartWizard(false);
      setIsAssistedKiosk(false);
      setCurrentTab('new-demande');
    }
  };

  const handleWizardSuccess = (createdDemande: DemandeCertificat) => {
    setTrackingDemande(createdDemande);
    setCurrentTab('tracking');
  };

  const handleViewDemandeFromPortal = (demande: DemandeCertificat) => {
    setTrackingDemande(demande);
    setCurrentTab('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Bar Header with Role Switcher */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setRole={(newRole) => {
          setRole(newRole);
          if (newRole === 'guichet') setCurrentTab('guichet');
          else if (newRole === 'agent_instructeur') setCurrentTab('instructor');
          else if (newRole === 'responsable_valideur') setCurrentTab('validator');
          else if (newRole === 'administrateur') setCurrentTab('admin');
          else if (newRole === 'organisme_verificateur') setCurrentTab('verify');
          else setCurrentTab('citizen');
        }}
        onOpenAssistedKiosk={() => handleStartNewApplication(true)}
        onLoginRequest={() => {
          setAuthModalMode('login');
          setAuthModalReason(undefined);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'new-demande' && (
          <div className="space-y-4">
            <NewApplicationWizard
              isAssistedKiosk={isAssistedKiosk}
              onSuccess={handleWizardSuccess}
              onCancel={() => {
                if (currentRole === 'guichet') setCurrentTab('guichet');
                else setCurrentTab('citizen');
              }}
            />
          </div>
        )}

        {currentTab === 'landing' && (
          <LandingPage
            onStartNewApplication={() => handleStartNewApplication(false)}
            onOpenAssistedKiosk={() => handleStartNewApplication(true)}
            onViewDemande={handleViewDemandeFromPortal}
            onLoginRequest={() => {
              setAuthModalMode('login');
              setAuthModalReason(undefined);
              setAuthModalOpen(true);
            }}
            onRegisterRequest={() => {
              setAuthModalMode('register');
              setAuthModalReason(undefined);
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentTab === 'citizen' && (
          <CitizenPortal
            onStartNewApplication={() => handleStartNewApplication(false)}
            onViewDemande={handleViewDemandeFromPortal}
          />
        )}

        {currentTab === 'guichet' && (
          <GuichetPortal
            onStartAssistedApplication={() => handleStartNewApplication(true)}
            onViewDemande={handleViewDemandeFromPortal}
          />
        )}

        {currentTab === 'tracking' && (
          <TrackingView
            initialDemande={trackingDemande}
            onBack={() => {
              setTrackingDemande(undefined);
              if (currentRole === 'guichet') setCurrentTab('guichet');
              else setCurrentTab('citizen');
            }}
          />
        )}

        {currentTab === 'instructor' && (
          <InstructorPortal />
        )}

        {currentTab === 'validator' && (
          <ValidatorPortal />
        )}

        {currentTab === 'verify' && (
          <PublicVerificationPortal />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Modal d'Authentification / Création de compte pour citoyen ou agent */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingStartWizard(false);
        }}
        onSuccess={handleAuthSuccess}
        reason={authModalReason}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;
