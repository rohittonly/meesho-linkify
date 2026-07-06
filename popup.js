import { extractSlug } from "./lib/product.js";

const status = document.getElementById("status");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy");

let productUrl = "";

async function generateAffiliateLink() {
  try {
    status.textContent = "🔄 Generating affiliate link...";
    output.value = "";

    const slug = extractSlug(productUrl);

    // ----------------------------------------
    // STEP 1 : GET PRODUCT DETAILS
    // ----------------------------------------

    const productResponse = await fetch(
      `https://www.meesho.com/api/v1/product/${slug}`,
      {
        method: "POST"
      }
    );

    const productJson = await productResponse.json();

    const p = productJson.result.product;

    // ----------------------------------------
    // STEP 2 : CREATE AFFILIATE LINK
    // ----------------------------------------

    const affiliateResponse = await fetch(
      "https://affiliate.meesho.com/api/affiliate/api/collection-links/create-collection",
      {
        method: "POST",

        credentials: "include",

        headers: {
          "accept": "application/json, text/plain, */*",
          "app-client-id": "web",
          "content-type": "application/json"
        },

        body: JSON.stringify({
          collection: {
            name: "FACEBOOK_" + crypto.randomUUID(),
            platform: "FACEBOOK",
            media_link: ""
          },

          product_details_list: [
            {
              id: p.id,
              name: p.name,
              image: p.images[0],
              catalog_id: p.catalog_id,
              commission_percentage: 0.5,
              isAffiliateProduct: false,
              reelz_dealz_product: false,
              pdp_link: productUrl
            }
          ]
        })
      }
    );

    const affiliateJson = await affiliateResponse.json();

    const affiliateLink =
      affiliateJson.product_details_list[0].shortened_affiliate_link;

    output.value = affiliateLink;

    status.textContent = "✅ Affiliate link ready";

  } catch (err) {
    console.error(err);

    status.textContent = "❌ Failed to generate link";

    output.value = err.message;
  }
}

// ----------------------------------------
// Detect current tab
// ----------------------------------------

chrome.tabs.query(
  {
    active: true,
    currentWindow: true
  },
  (tabs) => {

    const currentTab = tabs[0];

    if (!currentTab || !currentTab.url) {
      status.textContent = "Couldn't detect current tab";
      return;
    }

    productUrl = currentTab.url;

    if (!productUrl.includes("meesho.com")) {
      status.textContent = "❌ Not a Meesho product page";
      return;
    }

    // Automatically generate the link
    generateAffiliateLink();
  }
);

// ----------------------------------------
// Copy Button
// ----------------------------------------

copyBtn.addEventListener("click", async () => {

  if (!output.value) return;

  await navigator.clipboard.writeText(output.value);

  copyBtn.textContent = "✅ Copied";

  setTimeout(() => {
    copyBtn.textContent = "📋 Copy Affiliate Link";
  }, 1500);

});