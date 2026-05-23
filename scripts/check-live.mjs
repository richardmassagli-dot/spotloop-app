import { chromium } from "playwright";

const url = process.argv[2] || "https://spotloop.vercel.app";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(3000);

const snapshot = await page.evaluate(() => {
  const root = document.getElementById("root");
  const frame = document.querySelector(".app-frame");
  return {
    rootChildCount: root?.childElementCount ?? 0,
    rootHTML: root?.innerHTML?.slice(0, 800) ?? "",
    rootRect: root?.getBoundingClientRect?.(),
    frameRect: frame?.getBoundingClientRect?.(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    title: document.title,
    text: document.body?.innerText?.slice(0, 500) ?? "",
  };
});

console.log(JSON.stringify({ url, errors, snapshot }, null, 2));
await browser.close();
