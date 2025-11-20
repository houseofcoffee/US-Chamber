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
  phoneNumber: string;
  email: string;
  businessWebsite: string;
  businessName: string;
  businessAddress: string;
  specialties: Specialty[];
}

export type MemberFormData = Omit<Member, 'id'>;
