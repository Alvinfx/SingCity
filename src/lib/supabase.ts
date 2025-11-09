import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Spotify API proxy through Supabase Edge Function
export async function spotifyRequest(endpoint: string, method: string = 'GET', requestBody?: any) {
  try {
    console.log('Making Spotify request:', { endpoint, method, requestBody })
    
    const response = await fetch(`${supabaseUrl}/functions/v1/spotify-api`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint, method, body: requestBody })
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API error response:', errorText)
      throw new Error(`Spotify API request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to call Spotify API:', error)
    throw error
  }
}
