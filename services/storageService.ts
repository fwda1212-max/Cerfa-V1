import { CompanyProfile } from '../types';

const PROFILE_KEY = 'cerfaflow_company_profile';

export const saveCompanyProfile = (profile: CompanyProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile", error);
  }
};

export const getCompanyProfile = (): CompanyProfile | null => {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load profile", error);
    return null;
  }
};

export const hasProfile = (): boolean => {
  return !!localStorage.getItem(PROFILE_KEY);
};