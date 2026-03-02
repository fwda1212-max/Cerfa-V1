import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types';
import { Save } from 'lucide-react';

interface CompanyFormProps {
  initialData: CompanyProfile | null;
  onSave: (data: CompanyProfile) => void;
}

interface InputFieldProps {
  label: string;
  name: keyof CompanyProfile;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

// Composant extrait pour éviter la perte de focus lors du re-rendu du parent
const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text", placeholder, required = true }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
    />
  </div>
);

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<CompanyProfile>({
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    contactName: '',
    phone: '',
    email: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Profil Entreprise</h2>
        <p className="text-gray-500 mt-1">Ces informations seront pré-remplies automatiquement sur vos demandes de CERFA 14024*01.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="md:col-span-2">
             <InputField 
                label="Raison Sociale / Nom de l'entreprise" 
                name="companyName" 
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ex: BTP Rénovations" 
             />
          </div>
          <InputField 
            label="Numéro SIRET" 
            name="siret" 
            value={formData.siret}
            onChange={handleChange}
            placeholder="14 chiffres" 
          />
          <InputField 
            label="Nom du contact" 
            name="contactName" 
            value={formData.contactName}
            onChange={handleChange}
            placeholder="M. Dupont Jean" 
          />
          
          <div className="md:col-span-2">
            <InputField 
                label="Adresse Postale" 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                placeholder="123 rue de la Paix" 
            />
          </div>
          
          <InputField 
            label="Code Postal" 
            name="postalCode" 
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="75000" 
          />
          <InputField 
            label="Ville" 
            name="city" 
            value={formData.city}
            onChange={handleChange}
            placeholder="Paris" 
          />
          
          <InputField 
            label="Téléphone" 
            name="phone" 
            type="tel" 
            value={formData.phone}
            onChange={handleChange}
            placeholder="01 23 45 67 89" 
          />
          <InputField 
            label="Email de contact" 
            name="email" 
            type="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@btp-renov.com" 
          />
        </div>

        <div className="mt-8 flex items-center justify-end">
          {isSaved && <span className="text-green-600 mr-4 text-sm font-medium animate-pulse">Informations sauvegardées !</span>}
          <button
            type="submit"
            className="flex items-center bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            Enregistrer le profil
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;