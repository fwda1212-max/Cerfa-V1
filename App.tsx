import React, { useState, useEffect } from 'react';
import { ViewState, CompanyProfile } from './types';
import { getCompanyProfile, saveCompanyProfile } from './services/storageService';
import Layout from './components/Layout';
import CompanyForm from './components/CompanyForm';
import RequestForm from './components/RequestForm';
import { PlusCircle, Building, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const savedProfile = getCompanyProfile();
    setProfile(savedProfile);
    if (!savedProfile && currentView !== 'profile') {
        // If no profile, we can gently nudge users or just let them see dashboard empty state
    }
  }, []);

  const handleSaveProfile = (data: CompanyProfile) => {
    saveCompanyProfile(data);
    setProfile(data);
    // Optionally redirect to request after save if they came from empty state
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <CompanyForm initialData={profile} onSave={handleSaveProfile} />;
      case 'request':
        return <RequestForm profile={profile} onRedirectToProfile={() => setCurrentView('profile')} />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 mt-2">Bienvenue sur CerfaFlow, l'outil de gestion de vos arrêtés de circulation.</p>
            </header>

            {!profile ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                 <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Building className="w-8 h-8 text-blue-600" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Configurez votre entreprise</h3>
                 <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Pour commencer à générer des formulaires CERFA, veuillez d'abord renseigner les informations de votre société.
                 </p>
                 <button
                    onClick={() => setCurrentView('profile')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
                 >
                    Configurer mon profil
                 </button>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Votre Entreprise</h3>
                            <CheckCircle2 className="text-green-500 w-6 h-6" />
                        </div>
                        <p className="font-bold text-xl text-gray-900 mb-1">{profile.companyName}</p>
                        <p className="text-gray-500 text-sm mb-4">SIRET: {profile.siret}</p>
                        <button 
                            onClick={() => setCurrentView('profile')}
                            className="text-brand-600 text-sm font-medium hover:text-brand-800"
                        >
                            Modifier les informations →
                        </button>
                    </div>

                    {/* Action Card */}
                    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between transform transition hover:scale-[1.02] cursor-pointer"
                         onClick={() => setCurrentView('request')}>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Nouvelle Demande</h3>
                            <p className="text-blue-100 text-sm">Générer un formulaire CERFA 14024*01 pré-rempli pour un nouveau chantier.</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <PlusCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8">
                <h4 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Renseignez une seule fois les informations de votre entreprise dans l'onglet "Mon Entreprise".</li>
                    <li>Cliquez sur "Faire une demande" pour chaque nouveau chantier.</li>
                    <li>Remplissez les détails spécifiques (dates, adresse, type de circulation).</li>
                    <li>Téléchargez instantanément le PDF officiel prêt à être envoyé à la mairie.</li>
                </ol>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;