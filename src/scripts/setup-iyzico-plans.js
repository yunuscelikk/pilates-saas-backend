#!/usr/bin/env node

/**
 * iyzico Plan Setup Script
 *
 * Bu script iyzico'da ürün ve ödeme planlarını oluşturur,
 * dönen referans kodlarını veritabanındaki Plan kayıtlarına yazar.
 *
 * Kullanım: node src/scripts/setup-iyzico-plans.js
 *
 * Gerekli env değişkenleri: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_URI
 */

require("dotenv").config();
const crypto = require("crypto");
const { Plan } = require("../models");
const {
  createProduct,
  createPricingPlan,
  listProducts,
} = require("../utils/iyzico");
const config = require("../config/app.config");

const TRIAL_DAYS = config.trialDays;
const MOCK_MODE = process.argv.includes("--mock");

async function setup() {
  if (MOCK_MODE) {
    console.log(
      "⚠️  MOCK MODU: iyzico API çağrılmadan sahte referans kodları oluşturulacak.\n",
    );
    console.log(
      "   (iyzico abonelik modülü aktif olduğunda --mock olmadan tekrar çalıştırın)\n",
    );
  }

  console.log("iyzico plan setup başlatılıyor...\n");

  let productRefCode;

  if (MOCK_MODE) {
    productRefCode = `mock-product-${crypto.randomUUID().slice(0, 8)}`;
    console.log(`Ürün oluşturuldu (mock): ${productRefCode}\n`);
  } else {
    // 1. iyzico'da ürün oluştur veya mevcut olanı bul
    console.log("Ürün kontrol ediliyor...");
    try {
      const product = await createProduct(
        "Pilates SaaS",
        "Pilates stüdyo yönetim platformu abonelik planları",
      );
      productRefCode = product.data?.referenceCode || product.referenceCode;
      console.log(`Yeni ürün oluşturuldu: ${productRefCode}\n`);
    } catch (err) {
      if (err.errorCode === "201001") {
        // Ürün zaten var, listeden bul
        console.log("Ürün zaten mevcut, referans kodu alınıyor...");
        const productList = await listProducts(1, 100);
        const items = productList.data?.items || productList.items || [];
        const existing = items.find((p) => p.name === "Pilates SaaS");
        if (!existing) {
          throw new Error("Mevcut ürün listede bulunamadı.");
        }
        productRefCode = existing.referenceCode;
        console.log(`Mevcut ürün bulundu: ${productRefCode}\n`);
      } else {
        throw err;
      }
    }
  }

  // 2. Veritabanındaki planları çek
  const plans = await Plan.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]],
  });

  if (plans.length === 0) {
    console.error("Veritabanında aktif plan bulunamadı. Önce seed çalıştırın.");
    process.exit(1);
  }

  // iyzico'daki mevcut pricing planları al (varsa eşleştirmek için)
  let existingPricingPlans = [];
  if (!MOCK_MODE) {
    const productList = await listProducts(1, 100);
    const productData = (
      productList.data?.items ||
      productList.items ||
      []
    ).find((p) => p.referenceCode === productRefCode);
    if (productData?.pricingPlans) {
      existingPricingPlans = productData.pricingPlans;
    }
  }

  // 3. Her plan için iyzico'da pricing plan oluştur veya mevcut olanı eşleştir
  for (const plan of plans) {
    console.log(`"${plan.name}" planı işleniyor (₺${plan.price})...`);

    let planRefCode;

    if (MOCK_MODE) {
      planRefCode = `mock-plan-${plan.slug}-${crypto.randomUUID().slice(0, 8)}`;
    } else {
      // Önce mevcut planlar arasında aynı isimde olanı ara
      const existing = existingPricingPlans.find((p) => p.name === plan.name);
      if (existing) {
        planRefCode = existing.referenceCode;
        console.log(`  → Mevcut plan bulundu: ${planRefCode}`);
      } else {
        const pricingPlan = await createPricingPlan(productRefCode, {
          name: plan.name,
          price: parseFloat(plan.price),
          interval: plan.billing_interval,
          trialDays: TRIAL_DAYS,
        });
        planRefCode =
          pricingPlan.data?.referenceCode || pricingPlan.referenceCode;
        console.log(`  → Yeni plan oluşturuldu: ${planRefCode}`);
      }
    }

    await plan.update({
      iyzico_product_reference_code: productRefCode,
      iyzico_pricing_plan_reference_code: planRefCode,
    });

    console.log(`  ✓ Veritabanına kaydedildi\n`);
  }

  console.log("Tüm planlar başarıyla oluşturuldu ve veritabanına kaydedildi.");
  process.exit(0);
}

setup().catch((err) => {
  console.error("Setup hatası:", err.message);
  if (err.errorCode) console.error("Error Code:", err.errorCode);
  if (err.errorGroup) console.error("Error Group:", err.errorGroup);
  if (err.rawResult)
    console.error("Full Response:", JSON.stringify(err.rawResult, null, 2));
  if (!err.errorCode && !err.rawResult) console.error("Stack:", err.stack);
  process.exit(1);
});
