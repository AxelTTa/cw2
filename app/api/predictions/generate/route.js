import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'

// Prediction generation logic
const generatePredictionFromTemplate = (template, matchContext) => {
  // Replace placeholders in question template
  let question = template.question_template
    .replace('{time_window}', '60')
    .replace('{event_type}', 'action')

  // Context-aware question generation
  if (template.template_name === 'Next Team Action') {
    const homeTeam = matchContext.home_team_name || 'Home Team'
    const awayTeam = matchContext.away_team_name || 'Away Team'
    question = `Which team will have the next significant action?`
    return {
      question,
      options: [homeTeam, awayTeam],
      context_data: { home_team: homeTeam, away_team: awayTeam }
    }
  }

  if (template.template_name === 'Ball Possession') {
    const homeTeam = matchContext.home_team_name || 'Home Team'
    const awayTeam = matchContext.away_team_name || 'Away Team'
    question = `Which team will have more possession in the next 60 seconds?`
    return {
      question,
      options: [homeTeam, awayTeam, 'Equal'],
      context_data: { home_team: homeTeam, away_team: awayTeam }
    }
  }

  return {
    question,
    options: template.options,
    context_data: {}
  }
}

const shouldGeneratePrediction = (template, matchContext, recentGenerations) => {
  // Check frequency limits
  const templateUsageToday = recentGenerations.filter(gen => 
    gen.template_id === template.id &&
    new Date(gen.generation_time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  if (templateUsageToday >= template.frequency_limit) {
    return false
  }

  // Check context requirements
  if (template.context_requirements) {
    const reqs = template.context_requirements

    // Minimum minute check
    if (reqs.min_minute && matchContext.minute < reqs.min_minute) {
      return false
    }

    // Maximum uses per half
    if (reqs.max_per_half && templateUsageToday >= reqs.max_per_half) {
      return false
    }
  }

  return true
}

export async function POST(request) {
  try {
    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 })
    }


    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        home_team_info:teams!matches_home_team_fkey(name),
        away_team_info:teams!matches_away_team_fkey(name)
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      return NextResponse.json({
        success: false,
        error: 'Match not found'
      }, { status: 404 })
    }

    // Check if match is live
    if (!['1H', '2H', 'HT', 'ET'].includes(match.status)) {
      return NextResponse.json({
        success: false,
        error: 'Match is not live'
      }, { status: 400 })
    }

    // Check for recent active predictions (don't spam)
    const { data: activePredictions, error: activeError } = await supabase
      .from('prediction_markets')
      .select('id')
      .eq('match_id', matchId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    if (activeError) {
      console.error('Error checking active predictions:', activeError)
    }

    if (activePredictions && activePredictions.length >= 3) {
      return NextResponse.json({
        success: false,
        error: 'Too many active predictions for this match. Wait for some to expire.'
      }, { status: 400 })
    }

    // Get available prediction templates
    const { data: templates, error: templatesError } = await supabase
      .from('prediction_templates')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })

    if (templatesError || !templates || templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No prediction templates available'
      }, { status: 404 })
    }

    // Get recent generation history
    const { data: recentGenerations, error: historyError } = await supabase
      .from('prediction_generation_log')
      .select('*')
      .eq('match_id', matchId)
      .gte('generation_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (historyError) {
      console.error('Error fetching generation history:', historyError)
    }

    // Build match context
    const matchContext = {
      home_team_name: match.home_team_info?.name || match.home_team,
      away_team_name: match.away_team_info?.name || match.away_team,
      minute: match.minute || 45, // Default to mid-match
      status: match.status
    }

    // Filter templates based on context and frequency
    const availableTemplates = templates.filter(template => 
      shouldGeneratePrediction(template, matchContext, recentGenerations || [])
    )

    if (availableTemplates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No suitable prediction templates available at this time'
      }, { status: 400 })
    }

    // Select template (weighted by priority)
    const selectedTemplate = availableTemplates[0] // Highest priority available

    // Generate the prediction
    const generatedPrediction = generatePredictionFromTemplate(selectedTemplate, matchContext)

    // Log the generation attempt
    const { data: logEntry, error: logError } = await supabase
      .from('prediction_generation_log')
      .insert({
        match_id: matchId,
        template_id: selectedTemplate.id,
        generated_question: generatedPrediction.question,
        options_generated: generatedPrediction.options,
        context_used: generatedPrediction.context_data
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging generation:', logError)
    }

    // Create the prediction market
    const { data: marketData, error: marketError } = await supabase.rpc('create_micro_prediction', {
      p_match_id: matchId,
      p_question: generatedPrediction.question,
      p_options: JSON.stringify(generatedPrediction.options),
      p_time_window: 90, // 90 seconds
      p_stake_amount: 0.25, // 0.25 CHZ
      p_context_data: JSON.stringify(generatedPrediction.context_data)
    })

    if (marketError) {
      console.error('Error creating prediction market:', marketError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create prediction market: ' + marketError.message
      }, { status: 500 })
    }

    // Update the log entry to mark market as created
    if (logEntry) {
      await supabase
        .from('prediction_generation_log')
        .update({ 
          market_created: true, 
          market_id: marketData 
        })
        .eq('id', logEntry.id)
    }

    return NextResponse.json({
      success: true,
      marketId: marketData,
      question: generatedPrediction.question,
      options: generatedPrediction.options,
      message: 'Prediction generated successfully'
    })

  } catch (error) {
    console.error('API error generating prediction:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}