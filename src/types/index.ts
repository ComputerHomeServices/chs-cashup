export type Shift = 'Morning' | 'Afternoon' | 'Night' | 'Full' | 'Regular';
export type CashupStatus = 'pending' | 'verified' | 'flagged' | 'processed';

export interface Cashup {
  id: string;
  created_at: string;
  user_id: string;
  store_name: string;
  date: string;
  shift: Shift;
  
  notes_200: number;
  notes_100: number;
  notes_50: number;
  notes_20: number;
  notes_10: number;
  coins_5: number;
  coins_2: number;
  coins_1: number;
  coins_050: number;
  coins_020: number;
  coins_010: number;
  
  cash_total: number;
  card_total: number;
  eft_total: number;
  total_expected: number;
  total_actual: number;
  variance: number;
  
  notes?: string;
  auditor_name?: string;
  status: CashupStatus;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
}
