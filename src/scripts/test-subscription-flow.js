#!/usr/bin/env node
/**
 * Abonelik akışı uçtan uca test scripti
 * iyzico sandbox ortamında Professional plan satın alma testi
 */
require("dotenv").config();

const BASE_URL = "http://localhost:3001/api/v1";

async function request(method, path, token, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function test() {
  console.log("=== ABONELIK AKIŞI UÇTAN UCA TEST ===\n");

  // 1. Login
  console.log("1. Login...");
  const loginRes = await request("POST", "/auth/login", null, {
    email: "owner@zenpilates.com",
    password: "password123",
  });
  if (loginRes.status !== 200) {
    console.error("   LOGIN HATASI:", JSON.stringify(loginRes.data));
    process.exit(1);
  }
  const token = loginRes.data.data.accessToken;
  console.log("   ✓ Login başarılı\n");

  // 2. Planları listele
  console.log("2. Planları listeleme...");
  const plansRes = await request("GET", "/plans", token);
  console.log("   Status:", plansRes.status);
  if (plansRes.status === 200) {
    const plans = plansRes.data.data;
    console.log("   ✓ Plan sayısı:", plans.length);
    plans.forEach((p) =>
      console.log(`     - ${p.name}: ₺${p.price}/${p.billing_interval}`),
    );
  } else {
    console.error("   HATA:", JSON.stringify(plansRes.data));
  }
  console.log();

  // 3. Mevcut aboneliği kontrol et
  console.log("3. Mevcut abonelik durumu...");
  const subRes = await request("GET", "/subscription", token);
  console.log("   Status:", subRes.status);
  if (subRes.status === 200) {
    const sub = subRes.data.data;
    console.log("   ✓ Status:", sub.status);
    console.log("   ✓ Plan:", sub.Plan?.name || "N/A");
    console.log("   ✓ Trial bitiş:", sub.trial_ends_at || "N/A");
  } else {
    console.error("   HATA:", JSON.stringify(subRes.data));
  }
  console.log();

  // 4. Professional plan ID'sini bul
  const plans = plansRes.status === 200 ? plansRes.data.data : [];
  const professionalPlan = plans.find((p) => p.slug === "professional");
  if (!professionalPlan) {
    console.error("   Professional plan bulunamadı");
    process.exit(1);
  }
  console.log("4. Professional Plan ID:", professionalPlan.id, "\n");

  // 5. Checkout başlat (iyzico sandbox test verileri)
  console.log("5. iyzico Checkout başlatılıyor...");
  const checkoutRes = await request("POST", "/subscription/checkout", token, {
    planId: professionalPlan.id,
    customer: {
      name: "John",
      surname: "Doe",
      email: "john.doe@test.com",
      gsmNumber: "+905350000000",
      identityNumber: "74300864791",
      address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
      city: "Istanbul",
      country: "Turkey",
    },
  });
  console.log("   Status:", checkoutRes.status);
  if (checkoutRes.status === 200) {
    const checkout = checkoutRes.data.data;
    console.log(
      "   ✓ Token:",
      checkout.token ? checkout.token.substring(0, 30) + "..." : "N/A",
    );
    console.log(
      "   ✓ Checkout form alındı:",
      checkout.checkoutFormContent ? "EVET" : "HAYIR",
    );
    if (checkout.checkoutFormContent) {
      // Form content'ini dosyaya yaz
      const fs = require("fs");
      const html = `<!DOCTYPE html>
<html>
<head><title>iyzico Checkout Test</title></head>
<body>
<h2>iyzico Sandbox Checkout - Professional Plan</h2>
<p>Test Kartı: 5528790000000008 / 12/30 / 123</p>
<div id="iyzipay-checkout-form" class="responsive">
${checkout.checkoutFormContent}
</div>
</body>
</html>`;
      fs.writeFileSync("/tmp/iyzico-checkout-test.html", html);
      console.log(
        "   ✓ Checkout formu /tmp/iyzico-checkout-test.html dosyasına yazıldı",
      );
      console.log(
        "   → Tarayıcıda açmak için: open /tmp/iyzico-checkout-test.html",
      );
    }
  } else {
    console.error("   HATA:", JSON.stringify(checkoutRes.data, null, 2));
  }
  console.log();

  console.log("=== TEST TAMAMLANDI ===");
  console.log("\nSonraki adımlar:");
  console.log("  1. /tmp/iyzico-checkout-test.html dosyasını tarayıcıda açın");
  console.log("  2. Test kartı bilgilerini girin:");
  console.log("     Kart No: 5528790000000008");
  console.log("     Son Kullanma: 12/30");
  console.log("     CVV: 123");
  console.log("  3. 3D Secure onayını verin");
  console.log("  4. Callback URL'ye yönlendirileceksiniz");
}

test().catch((e) => {
  console.error("Test hatası:", e.message);
  process.exit(1);
});
