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
        summary: "Weli xog caafimaad lama helin. Bilow inaad raadraacdo fitamiinkaaga, caafimaadka mindhicirka, iyo cabbirrada jirka si aad u hesho talooyinka AI-ga!",
        recommendations: ["Qor fitamiin ugu horeeya", "Raadraac caafimaadka mindhicirkaaga maalin walba", "Duub saacadaha hurdadaada iyo heerka tamartaada"]
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
            content: `Waxaad tahay khabiir falanqaynta caafimaadka AI. Falanqee xogta raadraacidda caafimaadka isticmaalaha oo bixi talooyinka shaqsiyeed.

MUHIIM: Dhammaan jawaabaha waa inay ku qornaadaan AF-SOOMAALI KELIYA.

XOGTA:
${JSON.stringify(dataSummary, null, 2)}

Falanqee qaababka iyo isku xirnaanshaha xogta. Raadi:
1. Joogitaanka iyo farqiga qaadashada fitamiinka
2. Isbaddelka caafimaadka mindhicirka (dhibcaha dheefshiidka, heerarka baruurta)
3. Isku xirnaanshaha hurdada iyo tamarta
4. Saamaynta cabidda biyaha ee dheefshiidka
5. Saamaynta jimicsiga ee hurdada iyo tamarta
6. Qaababka heerarka walbahaarka

Ka jawaab JSON object keliya (markdown la'aan):
{
  "summary": "<2-3 weedho oo ku saabsan guud ahaan caafimaadka - AF-SOOMAALI>",
  "insights": [
    {
      "title": "<cinwaan gaaban - AF-SOOMAALI>",
      "description": "<faahfaahin buuxda - AF-SOOMAALI>",
      "type": "<positive|warning|neutral>",
      "icon": "<vitamin|gut|sleep|energy|water|exercise|stress>"
    }
  ],
  "recommendations": [
    "<talo 1 - AF-SOOMAALI>",
    "<talo 2 - AF-SOOMAALI>",
    "<talo 3 - AF-SOOMAALI>",
    "<talo 4 - AF-SOOMAALI>"
  ],
  "correlations": [
    "<isku xirnaansho la helay, tusaale: 'Cabidda biyaha badan waxay la xiriirtaa dheefshiid wanaagsan' - AF-SOOMAALI>"
  ]
}

Bixi 3-6 aragtiyo ku salaysan xogta jirta. Noqo mid gaar ah oo tixraac qaababka xogta dhabta ah. DHAMMAAN QORAALKU WAA INUU AHAADAA AF-SOOMAALI.`
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
        summary: "Falanqaynta waa la dhammeeyay. Sii wad raadraacidda xogtaada caafimaadka si aad u hesho talooyinka faahfaahsan.",
        insights: [],
        recommendations: ["Sii wad qorista cabbiradaada caafimaadka maalinlaha ah si loo helo falanqayn wanaagsan"],
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
