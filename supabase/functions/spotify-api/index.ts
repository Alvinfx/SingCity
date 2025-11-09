const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Spotify token error:', response.status, errorText)
    throw new Error(`Failed to get Spotify token: ${response.status} - ${errorText}`)
  }

  const data: SpotifyTokenResponse = await response.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000)
  
  return data.access_token
}

Deno.serve({ 
  onListen: () => console.log('Spotify API function started')
}, async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

    console.log('Spotify credentials check:', { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length,
      clientSecretLength: clientSecret?.length
    })

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Spotify credentials not configured', details: { hasClientId: !!clientId, hasClientSecret: !!clientSecret } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    console.log('Request body received:', requestBody)
    
    const { endpoint, method = 'GET', body } = requestBody

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const spotifyUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `https://api.spotify.com/v1${endpoint}`

    console.log('Calling Spotify API:', spotifyUrl)

    const token = await getSpotifyToken(clientId, clientSecret)
    console.log('Got Spotify token:', { hasToken: !!token, tokenLength: token?.length })

    const spotifyResponse = await fetch(spotifyUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await spotifyResponse.json()

    if (!spotifyResponse.ok) {
      console.error('Spotify API error:', spotifyResponse.status, data)
      return new Response(
        JSON.stringify({ error: 'Spotify API error', details: data }),
        { status: spotifyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
