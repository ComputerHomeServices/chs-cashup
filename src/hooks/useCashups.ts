import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Cashup } from '../types';

export const useCashups = () => {
  const [cashups, setCashups] = useState<Cashup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cashups')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setCashups(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCashup = async (cashup: Omit<Cashup, 'id' | 'created_at'>) => {
    try {
      console.log('Inserting cashup:', cashup);
      const { data, error } = await supabase
        .from('cashups')
        .insert([cashup])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Insert successful:', data);
      setCashups(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Catch block error:', err);
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCashups();
  }, []);

  return { cashups, loading, error, fetchCashups, createCashup };
};
