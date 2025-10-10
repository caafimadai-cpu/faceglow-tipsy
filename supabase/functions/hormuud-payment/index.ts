import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { communityId, userId, amount } = await req.json();

    console.log('Processing Hormuud payment:', { communityId, userId, amount });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Hormuud API key
    const hormuudApiKey = Deno.env.get('HORMUUD_API_KEY');
    
    if (!hormuudApiKey) {
      throw new Error('Hormuud API key not configured');
    }

    // Call Hormuud payment API
    // Note: Replace with actual Hormuud API endpoint and payload structure
    const hormuudResponse = await fetch('https://api.hormuud.com/payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hormuudApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'USD',
        description: 'Community membership',
        // Add other required Hormuud API parameters
      }),
    });

    if (!hormuudResponse.ok) {
      const errorData = await hormuudResponse.text();
      console.error('Hormuud API error:', errorData);
      throw new Error('Payment processing failed');
    }

    const paymentData = await hormuudResponse.json();
    console.log('Payment successful:', paymentData);

    // Create membership record
    const { error: membershipError } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        payment_status: 'completed',
        payment_reference: paymentData.reference || paymentData.transactionId,
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      throw membershipError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment successful and membership created',
        paymentReference: paymentData.reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Payment processing failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
