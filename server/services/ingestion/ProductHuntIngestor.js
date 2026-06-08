const BaseIngestor = require('./BaseIngestor');

class ProductHuntIngestor extends BaseIngestor {
  constructor() {
    super();
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.rapidApiHost = process.env.RAPIDAPI_HOST || 'product-hunt6.p.rapidapi.com';
  }

  getSourceName() {
    return 'PRODUCT_HUNT';
  }

  preFilter(rawItem) {
    // Keep products with at least 50 upvotes
    return (rawItem.votes_count || 0) >= 50;
  }

  async fetchSingleProduct(slug) {
    return new Promise((resolve, reject) => {
      const http = require('https');
      const options = {
        method: 'GET',
        hostname: this.rapidApiHost,
        path: `/single-product?slug=${slug}`,
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, function (res) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          if (res.statusCode !== 200) {
            console.error(`Failed to fetch ${slug}. Status: ${res.statusCode}`);
            return resolve(null);
          }
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', (e) => resolve(null));
      req.end();
    });
  }

  async fetchLatest() {
    if (!this.rapidApiKey) {
      console.warn("RapidAPI key not configured.");
      return [];
    }

    // Since we only have the single-product endpoint from the snippet,
    // we will fetch a few known slugs to demonstrate the pipeline with real data.
    const slugsToFetch = ['reditus', 'arc-search', 'midjourney'];
    const results = [];

    for (const slug of slugsToFetch) {
      console.log(`Fetching ${slug} via RapidAPI...`);
      const data = await this.fetchSingleProduct(slug);
      
      if (data) {
        // Map the RapidAPI response to our generic format
        // Structure depends on the exact API response, adjusting to common Product Hunt schema
        results.push({
          name: data.name || slug,
          description: data.tagline || data.description || "No description provided.",
          url: data.website_url || data.url || `https://producthunt.com/products/${slug}`,
          externalId: `ph_${data.id || slug}`,
          category: (data.topics && data.topics.length > 0) ? data.topics[0].name : 'Tech',
          launchedAt: data.created_at ? new Date(data.created_at) : new Date(),
          rawPayload: data,
          engagementMetrics: JSON.stringify({ upvotes: data.votes_count || 0, reviews: data.reviews_count || 0 })
        });
      }
      
      // Delay to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 2000));
    }

    return results;
  }
}

module.exports = ProductHuntIngestor;
