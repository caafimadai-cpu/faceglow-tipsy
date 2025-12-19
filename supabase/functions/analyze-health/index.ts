import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching health data for user:', user.id);

    // Fetch recent health logs
    const [vitaminLogs, gutLogs, bodyLogs] = await Promise.all([
      supabaseClient
        .from('vitamin_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false })
        .limit(30),
      supabaseClient
        .from('gut_health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(14),
      supabaseClient
        .from('body_health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(14),
    ]);

    const vitamins = vitaminLogs.data || [];
    const gutHealth = gutLogs.data || [];
    const bodyHealth = bodyLogs.data || [];

    console.log('Data fetched:', { vitamins: vitamins.length, gutHealth: gutHealth.length, bodyHealth: bodyHealth.length });

    if (vitamins.length === 0 && gutHealth.length === 0 && bodyHealth.length === 0) {
      return new Response(JSON.stringify({
        insights: [],
        summary: "No health data found yet. Start tracking your vitamins, gut health, and body metrics to get personalized AI insights!",
        recommendations: ["Log your first vitamin intake", "Track your gut health daily", "Record your sleep and energy levels"]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data summary for AI
    const dataSummary = {
      vitamins: vitamins.map(v => ({ name: v.vitamin_name, dosage: v.dosage, date: v.taken_at })),
      gutHealth: gutHealth.map(g => ({
        date: g.date,
        digestion: g.digestion_score,
        bloating: g.bloating_level,
        water: g.water_intake_liters,
        probiotic: g.probiotic_taken,
        fiber: g.fiber_intake
      })),
      bodyHealth: bodyHealth.map(b => ({
        date: b.date,
        energy: b.energy_level,
        sleep: b.sleep_hours,
        sleepQuality: b.sleep_quality,
        stress: b.stress_level,
        exercise: b.exercise_minutes,
        water: b.water_glasses
      }))
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'API configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling AI for health analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `You are a health analytics AI. Analyze this user's health tracking data and provide personalized insights.

DATA:
${JSON.stringify(dataSummary, null, 2)}

Analyze patterns and correlations in this data. Look for:
1. Vitamin intake consistency and gaps
2. Gut health trends (digestion scores, bloating patterns)
3. Sleep and energy correlations
4. Water intake effects on digestion
5. Exercise impact on energy and sleep quality
6. Stress level patterns

Respond with ONLY a JSON object (no markdown):
{
  "summary": "<2-3 sentence overall health summary>",
  "insights": [
    {
      "title": "<short insight title>",
      "description": "<detailed finding>",
      "type": "<positive|warning|neutral>",
      "icon": "<vitamin|gut|sleep|energy|water|exercise|stress>"
    }
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>",
    "<actionable recommendation 4>"
  ],
  "correlations": [
    "<correlation found, e.g., 'Higher water intake correlates with better digestion scores'>"
  ]
}

Provide 3-6 insights based on available data. Be specific and reference actual data patterns.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to analyze health data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content || '';

    console.log('AI analysis completed');

    let result;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || aiContent;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = {
        summary: "Analysis complete. Keep tracking your health data for more detailed insights.",
        insights: [],
        recommendations: ["Continue logging your daily health metrics for better analysis"],
        correlations: []
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-health function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
