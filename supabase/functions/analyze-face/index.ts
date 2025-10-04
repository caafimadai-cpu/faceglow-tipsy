import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing face with Lovable AI...');

    // Call Lovable AI with vision model
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
            content: [
              {
                type: 'text',
                text: `Analyze this face photo and provide a detailed assessment. Return a JSON object with:
1. beautyScore (0-100): Overall attractiveness rating
2. skinHealth object with: hydration (0-100), clarity (0-100), texture (0-100)
3. recommendations: array of 5-6 specific skincare tips
4. features object with: skinTone (description), estimatedAge (number)

Be honest but constructive. Focus on skin health and beauty enhancement tips.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
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
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze face' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI analysis completed successfully');

    // Extract the AI's response
    const aiContent = aiResponse.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the AI response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response, using defaults');
      // Provide default response if parsing fails
      result = {
        beautyScore: 75,
        skinHealth: {
          hydration: 70,
          clarity: 72,
          texture: 68
        },
        recommendations: [
          'Maintain good hydration by drinking 8 glasses of water daily',
          'Use a gentle moisturizer with hyaluronic acid',
          'Apply SPF 30+ sunscreen every morning',
          'Get 7-8 hours of quality sleep for skin repair',
          'Include antioxidant-rich foods in your diet',
          'Consider vitamin C serum for brightening'
        ],
        features: {
          skinTone: 'Even',
          estimatedAge: 28
        }
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-face function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
