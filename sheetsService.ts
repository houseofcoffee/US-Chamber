const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzeaKmya-twSvdeOauZsZSbsJSump5WXfCr4jwDcITk_0QJCm1LOHdKxo0w7nqIkKSn2Q/exec';

export interface Member {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  specialties: string[];
  photoUrl: string;
}

export async function fetchMembers(): Promise<Member[]> {
  try {
    const response = await fetch(SHEETS_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    const rawData = await response.json();
    
    // SAFETY LAYER: 
    // This converts "undefined" data into empty strings so the app doesn't crash.
    const cleanData = rawData.map((item: any) => ({
      id: item.id,
      name: item.name || '',
      businessName: item.businessName || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      website: item.website || '',
      // If specialties is broken/missing, make it an empty list []
      specialties: Array.isArray(item.specialties) ? item.specialties : [], 
      // If photoUrl is missing, make it an empty string "" to fix the startsWith error
      photoUrl: item.photoUrl || '' 
    }));

    return cleanData;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export async function addMember(member: Omit<Member, 'id'>): Promise<{ success: boolean; id?: string }> {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      body: JSON.stringify(member),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add member');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding member:', error);
    return { success: false };
  }
}
