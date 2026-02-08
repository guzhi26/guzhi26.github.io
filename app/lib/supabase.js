import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 注意：此处使用 publishable key，可安全在客户端使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // 启用自动刷新 token
        autoRefreshToken: true,
        // 持久化 session 到 localStorage
        persistSession: true,
        // 检测 URL 中的 session（用于邮箱验证回调）
        detectSessionInUrl: true
    }
});
