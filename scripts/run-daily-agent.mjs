/**
 * KurdTech Autonomous Daily News Agent CLI
 * 
 * Usage:
 *   node scripts/run-daily-agent.mjs [count] [gemini_api_key]
 *   npm run agent:daily
 */

const count = parseInt(process.argv[2] || "3", 10);
const apiKey = process.argv[3] || process.env.GEMINI_API_KEY || "";

console.log("\n=======================================================");
console.log("🤖 KurdTech Autonomous Tech News Agent (ئەیجێنتی کوردتێک)");
console.log("=======================================================");
console.log(`📡 Connecting to global sources (The Verge, TechCrunch, Wired, 9to5Mac, Ars Technica)...`);
console.log(`🎯 Target stories count: ${count}`);
console.log(`🧠 AI Engine: ${apiKey ? "Google Gemini AI" : "Built-in Kurdish Tech Engine"}`);
console.log("-------------------------------------------------------\n");

async function run() {
  try {
    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}/api/agent`;

    console.log(`⏳ Triggering autonomous curation & Kurdish translation...`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "auto-curate-publish",
        count,
        apiKey: apiKey || undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    if (data.status === "success") {
      console.log(`\n✅ سەرکەوتوو بوو! (Success)`);
      console.log(`📰 ژمارەی هەواڵە بڵاوکراوەکان: ${data.count}`);
      console.log("-------------------------------------------------------");
      data.published.forEach((art, idx) => {
        console.log(`\n[${idx + 1}] ${art.title}`);
        console.log(`   📂 بەش: ${art.category} | 👤 نووسەر: ${art.author.name}`);
        console.log(`   🔗 لینکی بابەت: http://localhost:${port}/articles/${art.id}`);
      });
      console.log("\n=======================================================");
      console.log(`🎉 هەموو بابەتەکان ڕاستەوخۆ لە ماڵپەڕەکەدا بەردەستن!`);
      console.log("=======================================================\n");
    } else {
      console.error("❌ Agent error:", data.message);
    }
  } catch (err) {
    console.error("❌ Failed to run agent:", err.message);
    console.log("💡 دڵنیابەرەوە کە سێرڤەری ماڵپەڕەکە (npm run dev) کاردەکات.");
  }
}

run();
