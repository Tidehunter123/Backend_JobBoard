import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Ensure it's defined

export const supabase = createClient(supabaseUrl, supabaseRoleKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
