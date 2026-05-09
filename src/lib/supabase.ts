import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtnvkhqbroamuhuudxqg.supabase.co'
const supabaseAnonKey = 'sb_publishable_wafdZlN0g5ZALHEO3vbxzg_vkY-HQSi'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)