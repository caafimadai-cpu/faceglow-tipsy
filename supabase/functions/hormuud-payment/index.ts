import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const { communityId, userId, amount, phoneNumber } = await req.json();

    console.log('Processing payment:', { communityId, userId, amount, phoneNumber });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate phone number
    if (!phoneNumber) {
      throw new Error('Phone number is required for payment');
    }

    // Generate unique transaction reference
    const transactionRef = `RFX${Date.now()}`;
    
    let paymentSuccess = false;
    let paymentMessage = '';

    console.log('Processing live payment');
    
    // Get credentials from environment variables for security
    const merchantUid = Deno.env.get('HORMUUD_MERCHANT_ID');
    const apiUserId = Deno.env.get('HORMUUD_MERCHANT_USER_ID');
    const apiKey = Deno.env.get('HORMUUD_API_KEY');

    if (!merchantUid || !apiUserId || !apiKey) {
      throw new Error('Payment gateway credentials not configured');
    }
    
    const hormuudPayload = {
      schemaVersion: "1.0",
      requestId: transactionRef,
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid,
        apiUserId,
        apiKey,
        paymentMethod: "MWALLET_ACCOUNT",
        payerInfo: {
          accountNo: phoneNumber
        },
        transactionInfo: {
          referenceId: transactionRef,
          invoiceId: communityId,
          amount: "1",
          currency: "USD",
          description: "Community membership payment"
        }
      }
    };

    console.log('Sending Hormuud payload:', JSON.stringify(hormuudPayload, null, 2));

    try {
      const hormuudResponse = await fetch('https://api.waafipay.net/asm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hormuudPayload),
      });

      const paymentData = await hormuudResponse.json();
      console.log('Hormuud response:', paymentData);

      if (paymentData.responseCode === '2001') {
        paymentSuccess = true;
        paymentMessage = 'Payment processed successfully via Hormuud';
      } else {
        throw new Error(paymentData.responseMsg || 'Payment failed');
      }
    } catch (error) {
      console.error('Hormuud payment error:', error);
      throw error;
    }

    if (paymentSuccess) {
      // Create membership record
      const { error: membershipError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          payment_status: 'completed',
          payment_reference: transactionRef,
        });

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
        throw membershipError;
      }

      console.log('Membership created successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: paymentMessage,
          paymentReference: transactionRef,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Payment processing failed');

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Payment processing failed',
        details: 'Please check your payment details and try again'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
