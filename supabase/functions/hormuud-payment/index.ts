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
    const { communityId, userId, amount, phoneNumber } = await req.json();

    console.log('Processing Hormuud EVC payment:', { communityId, userId, amount, phoneNumber });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Hormuud API credentials
    const hormuudApiKey = Deno.env.get('HORMUUD_API_KEY');
    const hormuudMerchantId = Deno.env.get('HORMUUD_MERCHANT_ID');
    const hormuudMerchantUserId = Deno.env.get('HORMUUD_MERCHANT_USER_ID');
    
    if (!hormuudApiKey || !hormuudMerchantId || !hormuudMerchantUserId) {
      console.error('Hormuud credentials not fully configured');
      throw new Error('Payment gateway not properly configured. Please contact support.');
    }

    // Validate phone number
    if (!phoneNumber) {
      throw new Error('Phone number is required for payment');
    }

    // Generate unique transaction reference
    const transactionRef = `COMM_${Date.now()}_${userId.substring(0, 8)}`;
    
    // Hormuud EVC Plus API - Payment Request
    const hormuudPayload = {
      schemaVersion: '1.0',
      requestId: transactionRef,
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: hormuudMerchantId,
        apiUserId: parseInt(hormuudMerchantUserId), // Must be integer
        apiKey: hormuudApiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: phoneNumber
        },
        transactionInfo: {
          referenceId: transactionRef,
          invoiceId: communityId,
          amount: amount,
          currency: 'USD',
          description: 'Community Membership Fee'
        }
      }
    };

    console.log('Calling Hormuud API with transaction ref:', transactionRef);

    // Call Hormuud EVC Plus API
    const hormuudResponse = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hormuudPayload),
    });

    const responseText = await hormuudResponse.text();
    console.log('Hormuud API response status:', hormuudResponse.status);
    console.log('Hormuud API response:', responseText);

    let paymentData;
    try {
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Hormuud response:', responseText);
      throw new Error('Invalid response from payment gateway');
    }

    // Check payment status (2001 = success)
    if (paymentData.responseCode !== '2001') {
      console.error('Hormuud API error:', paymentData);
      throw new Error(paymentData.responseMsg || 'Payment processing failed');
    }

    console.log('Payment successful:', paymentData);

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
        message: 'Payment successful and membership created',
        paymentReference: transactionRef,
        transactionId: paymentData.params?.transactionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
