import React, { useState } from 'react';
import { WorkRequest, CompanyProfile } from '../types';
import { FileDown, AlertCircle } from 'lucide-react';
import { generateCerfaPDF } from '../services/pdfService';

interface RequestFormProps {
  profile: CompanyProfile | null;
  onRedirectToProfile: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ profile, onRedirectToProfile }) => {
  const [requestData, setRequestData] = useState<WorkRequest>({
    locationAddress: '',
    locationCity: '',
    workDescription: '',
    startDate: '',
    durationDays: 1,
    trafficType: 'section_courante',
    trafficRegulation: 'alternat',
    trafficDirection: 'bidirectionnel',
    additionalInfo: ''
  });

  if (!profile) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Profil manquant</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Vous devez remplir les informations de votre entreprise avant de faire une demande.
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onRedirectToProfile}
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-medium text-sm hover:bg-yellow-200 focus:outline-none"
              >
                Compléter mon profil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePDF = (e: React.FormEvent) => {
    e.preventDefault();
    generateCerfaPDF(profile, requestData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
       <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Nouvelle Demande</h2>
        <p className="text-gray-500 mt-1">Remplissez les détails du chantier pour générer le CERFA 14024*01 officiel.</p>
      </div>

      <form onSubmit={handleGeneratePDF}>
        
        {/* Section Localisation */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gray-50 p-2 rounded">📍 Localisation des travaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète du chantier</label>
                <input
                    type="text"
                    name="locationAddress"
                    required
                    value={requestData.locationAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ex: 10 Route Nationale"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                <input
                    type="text"
                    name="locationCity"
                    required
                    value={requestData.locationCity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de voirie concernée</label>
                <select
                    name="trafficType"
                    value={requestData.trafficType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                >
                    <option value="section_courante">Section courante</option>
                    <option value="bretelle">Bretelle de raccordement</option>
                    <option value="carrefour">Carrefour</option>
                    <option value="trottoir">Trottoir / Accotement</option>
                </select>
            </div>
        </div>

        {/* Section Nature */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gray-50 p-2 rounded">🔨 Nature et Calendrier</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description des travaux</label>
                <textarea
                    name="workDescription"
                    required
                    rows={3}
                    value={requestData.workDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ex: Réfection de toiture avec échafaudage sur voie publique..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                    type="date"
                    name="startDate"
                    required
                    value={requestData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                <input
                    type="number"
                    name="durationDays"
                    min="1"
                    required
                    value={requestData.durationDays}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                />
            </div>
        </div>

        {/* Section Réglementation */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-gray-50 p-2 rounded">⛔ Réglementation Souhaitée</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesure principale</label>
                <select
                    name="trafficRegulation"
                    value={requestData.trafficRegulation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                >
                    <option value="alternat">Alternat par feux ou piquets</option>
                    <option value="route_barree">Route barrée / Déviation</option>
                    <option value="restriction_chaussee">Restriction de chaussée</option>
                    <option value="stationnement_interdit">Stationnement interdit</option>
                    <option value="vitesse_limitee">Limitation de vitesse seule</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sens de circulation</label>
                <select
                    name="trafficDirection"
                    value={requestData.trafficDirection}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                >
                    <option value="bidirectionnel">Bidirectionnel maintenu</option>
                    <option value="sens_unique">Mise en sens unique / Alternat</option>
                </select>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Précisions supplémentaires (optionnel)</label>
                <input
                    type="text"
                    name="additionalInfo"
                    value={requestData.additionalInfo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ex: Empiètement sur 2m de large..."
                />
            </div>
        </div>

        <div className="flex items-center justify-end border-t pt-6">
             <button
                type="submit"
                className="flex items-center bg-brand-600 text-white px-8 py-3 rounded-lg hover:bg-brand-700 transition-colors shadow-lg font-bold text-lg"
            >
                <FileDown className="w-6 h-6 mr-2" />
                Générer le CERFA 14024*01
            </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;