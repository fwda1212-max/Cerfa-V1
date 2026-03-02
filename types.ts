export interface CompanyProfile {
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface WorkRequest {
  locationAddress: string;
  locationCity: string;
  workDescription: string;
  startDate: string;
  durationDays: number;
  trafficType: 'section_courante' | 'bretelle' | 'carrefour' | 'trottoir';
  trafficRegulation: 'route_barree' | 'alternat' | 'restriction_chaussee' | 'stationnement_interdit' | 'vitesse_limitee';
  trafficDirection: 'bidirectionnel' | 'sens_unique';
  additionalInfo: string;
}

export type ViewState = 'dashboard' | 'profile' | 'request';