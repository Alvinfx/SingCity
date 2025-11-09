import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqhdqnofdzfxtztsijgz.supabase.co';
const supabaseAnonKey = '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
