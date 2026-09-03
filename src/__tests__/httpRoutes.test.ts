import http from "node:http";
import assert from "node:assert";

console.log("\n🧪 Running LifeSync OS HTTP Routes Verification...\n");

function fetchUrl(path: string): Promise<{ status: number; location?: string; htmlSnippet: string }> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode || 0,
          location: res.headers.location,
          htmlSnippet: data.slice(0, 500),
        });
      });
    });
    req.on("error", reject);
  });
}

async function run() {
  const routes = [
    { path: "/", expectedTitle: "LifeSync" },
    { path: "/study", expectedTitle: "Study Studio" },
    { path: "/fit", expectedTitle: "Fitness Hub" },
    { path: "/health", expectedTitle: "Health Analytics" },
    { path: "/habits", expectedTitle: "Routines & Habits" },
    { path: "/fuel", expectedTitle: "Hydration & Fuel" },
    { path: "/goals", expectedTitle: "Milestones" },
  ];

  for (const r of routes) {
    const res = await fetchUrl(r.path);
    assert.strictEqual(res.status, 200, `Route ${r.path} must return 200 OK`);
    assert(
      res.htmlSnippet.includes("LifeSync") || res.htmlSnippet.includes("<!DOCTYPE html>"),
      `Route ${r.path} must return valid HTML page`
    );
    console.log(`  ✓ Route ${r.path} -> HTTP ${res.status} OK`);
  }

  const legacyAliases = [
    { from: "/fitness", to: "/fit" },
    { from: "/routines", to: "/habits" },
    { from: "/nutrition", to: "/fuel" },
    { from: "/dashboard", to: "/" },
  ];

  for (const a of legacyAliases) {
    const res = await fetchUrl(a.from);
    assert.strictEqual(res.status, 308, `Alias ${a.from} must return 308 Permanent Redirect`);
    assert.strictEqual(res.location, a.to, `Alias ${a.from} must redirect to ${a.to}`);
    console.log(`  ✓ Alias ${a.from} -> HTTP ${res.status} Redirect to ${res.location}`);
  }

  console.log("\n✅ All HTTP route and redirect assertions passed successfully!\n");
}

run().catch((err) => {
  console.error("HTTP verification error:", err);
  process.exit(1);
});
