import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvdzxgnncdltchkcgazq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZHp4Z25uY2RsdGNoa2NnYXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjI1MjYsImV4cCI6MjEwMjUzODUyNn0.EvspPDQ6NVRepWuCYiNyt5kNugTU3PiBb1N0mgHO-nE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)