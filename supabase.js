import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Do NOT hardcode your Supabase credentials here in production
// Use environment variables instead (see Method 3 below)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ AUTH FUNCTIONS ============

// Sign Up
export async function signUp(email, password, username, fullName) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName
                }
            }
        })

        if (authError) throw authError

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        username: username,
                        full_name: fullName,
                        role: 'user'
                    }
                ])

            if (profileError) throw profileError
        }

        return { success: true, user: authData.user }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Sign In
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw error

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (profileError) throw profileError

        return {
            success: true,
            user: {
                ...data.user,
                ...profile
            }
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Sign Out
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (!user) return { success: false, error: 'No user logged in' }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) throw profileError

        return {
            success: true,
            user: {
                ...user,
                ...profile
            }
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Reset Password
export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        
        if (error) throw error
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}
