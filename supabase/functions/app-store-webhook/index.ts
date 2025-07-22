
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APP-STORE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    logStep("App Store webhook received", { notificationType: body.notification_type });

    // Expected App Store product ID
    const EXPECTED_PRODUCT_ID = "io.bid2bid.app.premium.subscription";

    // Handle different App Store notification types
    const notificationType = body.notification_type;
    const transactionInfo = body.data?.latest_receipt_info?.[0] || body.data?.transaction_info;
    
    if (!transactionInfo) {
      logStep("No transaction info found in webhook");
      return new Response(JSON.stringify({ error: "No transaction info" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const productId = transactionInfo.product_id;
    const originalTransactionId = transactionInfo.original_transaction_id;
    const expiresDate = transactionInfo.expires_date_ms;
    
    logStep("Processing transaction", { 
      productId, 
      originalTransactionId, 
      notificationType,
      expectedProductId: EXPECTED_PRODUCT_ID 
    });

    // Verify this is for our expected product
    if (productId !== EXPECTED_PRODUCT_ID) {
      logStep("Product ID mismatch", { received: productId, expected: EXPECTED_PRODUCT_ID });
      return new Response(JSON.stringify({ error: "Product ID mismatch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find user by original transaction ID or other identifier
    // You'll need to map App Store transaction IDs to your users
    // This is a placeholder - you'll need to implement user mapping
    
    let subscriptionStatus = false;
    let subscriptionEnd = null;

    switch (notificationType) {
      case "INITIAL_BUY":
      case "DID_RENEW":
        subscriptionStatus = true;
        subscriptionEnd = expiresDate ? new Date(parseInt(expiresDate)).toISOString() : null;
        logStep("Subscription activated/renewed", { expiresDate: subscriptionEnd });
        break;
      
      case "DID_FAIL_TO_RENEW":
      case "CANCEL":
      case "EXPIRED":
        subscriptionStatus = false;
        logStep("Subscription cancelled/expired");
        break;
      
      default:
        logStep("Unhandled notification type", { notificationType });
        break;
    }

    // Update subscription status in database
    // Note: You'll need to implement proper user identification
    // For now, this is a placeholder that would need the user's email or ID
    
    logStep("Webhook processed successfully", { 
      productId: EXPECTED_PRODUCT_ID,
      subscriptionStatus,
      notificationType 
    });

    return new Response(JSON.stringify({ 
      received: true, 
      productId: EXPECTED_PRODUCT_ID,
      processed: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in app-store-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
