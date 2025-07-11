import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xabjpewtqmddevpbmxnl.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYmpwZXd0cW1kZGV2cGJteG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzI0NTcsImV4cCI6MjA2NzgwODQ1N30.O694Ml-hEecjK8HmuXOhCgdfHFcoktI6ZfThHcVmyAE"

export const supabase = createClient(supabaseUrl, supabaseKey)