import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    const { data: memes, error } = await supabaseAdmin
      .from('memes')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (error) {
      console.error('Error fetching memes:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch memes' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      memes: memes || []
    })
  } catch (error) {
    console.error('Memes API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { title, template_url, category = 'general' } = await request.json()

    if (!title || !template_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and template URL are required' 
      }, { status: 400 })
    }

    const { data: meme, error } = await supabaseAdmin
      .from('memes')
      .insert([{
        title,
        template_url,
        category,
        usage_count: 0,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating meme:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create meme' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      meme
    })
  } catch (error) {
    console.error('Memes API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}