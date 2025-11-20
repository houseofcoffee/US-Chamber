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
    const data = await response.json();
    return data;
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
