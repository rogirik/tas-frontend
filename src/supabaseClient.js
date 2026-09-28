import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvdzxgnncdltchkcgazq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZHp4Z25uY2RsdGNoa2NnYXpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk2MjUyNiwiZXhwIjoyMTAyNTM4NTI2fQ.rV1YAWwDP4mHkxp3c_g8Eyn2Vg4VAFdCkhy05cAXqQc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)