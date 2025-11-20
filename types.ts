export enum Specialty {
  Agriculture = 'Agriculture',
  Consulting = 'Consulting',
  ECommerce = 'E-Commerce',
  FinancialServices = 'Financial Services',
  Healthcare = 'Healthcare',
  Landscaping = 'Landscaping',
  Marketing = 'Marketing',
  Media = 'Media',
  Retail = 'Retail',
  Technology = 'Technology',
}

export interface Member {
  id: string;
  photoUrl: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  businessName: string;
  address: string;
  specialties: Specialty[];
}

export type MemberFormData = Omit<Member, 'id'>;
