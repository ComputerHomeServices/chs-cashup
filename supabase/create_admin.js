import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'sales@chssa.co.za',
    password: 'Superchannel1$',
    options: {
      data: {
        role: 'admin'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists.');
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('User created successfully:', data.user?.email);
  }
}

createAdmin();
