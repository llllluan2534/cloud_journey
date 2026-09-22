import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbgsxxsqfrhmtwywdxgb.supabase.co/'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ3N4eHNxZnJobXR3eXdkeGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTA0MjcsImV4cCI6MjA5NDI4NjQyN30.oZk6coiG2fTV6uV56MgHVAaEdLCrdckfOrPaw3KIdJc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
