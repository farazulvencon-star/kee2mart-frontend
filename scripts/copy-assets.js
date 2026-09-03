const fs = require("fs-extra");

async function copy() {
  if (!fs.existsSync(".next/standalone")) {
    console.log("No standalone output, skipping asset copy.");
    return;
  }
  try {
    await fs.copy("public", ".next/standalone/public");
    await fs.copy(".next/static", ".next/standalone/.next/static");
    console.log("Assets copied successfully");
  } catch (err) {
    console.error("Error copying assets:", err);
  }
}

copy();