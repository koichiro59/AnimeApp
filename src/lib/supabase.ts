import { createClient } from '@supabase/supabase-js'

// サーバー・クライアント両方で使用できるシングルトン
// NEXT_PUBLIC_ プレフィックスにより CSR でも参照可能
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
