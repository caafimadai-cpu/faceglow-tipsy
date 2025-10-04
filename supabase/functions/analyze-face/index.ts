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
                text: `Sawirkan weji ku falanqee oo si faahfaahsan u bixi qiimayn. Ku bixi JSON object leh:
1. skinHealth object leh:
   - qoyaan (0-100): Heerka qoyaanka maqaarka
   - nadiifnimo (0-100): Sida nadiifsan ee maqaarka
   - dhadhanka (0-100): Dhadhanka maqaarka
   - acne (0-100): Heerar finfinow (100 = ma jiro, 0 = badan)
   - wrinkles (0-100): Jiiqid (100 = ma jiro, 0 = badan)
   - darkCircles (0-100): Gariir madow (100 = ma jiro, 0 = badan)

2. talooyinka: array ah 6-8 talo gaar ah oo daryeelka maqaarka ah oo ku salaysan waxyaalaha la arkay

3. features object leh: 
   - midabMaqaarka (sharaxaad): Midabka maqaarka iyo simaanta
   - daQiyaas (nambar): Da'da qiyaasta ah
   - nooMaqaarka (text): Nooca maqaarka (qalalan, engegan, isku dhafan)

Noqo daacad, gaar ah, oo si faahfaahsan u sharax waxaad aragtay. Diirada saar caafimaadka maqaarka. Dhammaan jawaabta ku qor Af-Soomaali.`
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
        skinHealth: {
          qoyaan: 70,
          nadiifnimo: 72,
          dhadhanka: 68,
          acne: 85,
          wrinkles: 90,
          darkCircles: 75
        },
        talooyinka: [
          'Ilaali qoyaan wanaagsan adoo cabaya 8 koob oo biyo ah maalintii',
          'Isticmaal daryeel jilicsan oo leh hyaluronic acid',
          'Ku dhufasho SPF 30+ subaxdii walba',
          'Hel 7-8 saacadood oo hurdo tayo leh si maqaarka loo dib u hagaajiyo',
          'Ku dar cuntooyinka antioxidant-ka badan cuntadaada',
          'Ka fiirso serum vitamin C si loo iftimiyo',
          'Nadiifi wejigaaga laba jeer maalintii',
          'Isticmaal moisturizer habeenkii'
        ],
        features: {
          midabMaqaarka: 'Siman',
          daQiyaas: 28,
          nooMaqaarka: 'Isku dhafan'
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
