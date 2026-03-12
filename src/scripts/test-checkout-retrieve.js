#!/usr/bin/env node
/**
 * iyzico checkout retrieve test - token ile ödeme sonucunu sorgula
 */
require("dotenv").config();
const { retrieveCheckoutFormResult } = require("../utils/iyzico");

const token = process.argv[2];
if (!token) {
  console.log("Usage: node src/scripts/test-checkout-retrieve.js <token>");
  process.exit(1);
}

(async () => {
  console.log("Checkout form result sorgulanıyor...");
  console.log("Token:", token.substring(0, 30) + "...\n");

  try {
    const result = await retrieveCheckoutFormResult(token);
    console.log("Sonuç:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Hata:", err.message);
    if (err.errorCode) console.error("Error Code:", err.errorCode);
    if (err.rawResult)
      console.error("Raw:", JSON.stringify(err.rawResult, null, 2));
  }
  process.exit(0);
})();
