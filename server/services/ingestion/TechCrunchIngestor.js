const BaseIngestor = require('./BaseIngestor');
const http = require('https');

class TechCrunchIngestor extends BaseIngestor {
  getSourceName() {
    return 'TECHCRUNCH';
  }

  async fetchLatest() {
    console.log("Fetching TechCrunch latest posts via RapidAPI...");

    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'techcrunch1.p.rapidapi.com',
        port: null,
        path: '/v2/posts?order=desc&status=publish&orderby=date&page=1&context=view&per_page=10',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Reading from .env
          'x-rapidapi-host': 'techcrunch1.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          try {
            const body = Buffer.concat(chunks);
            const data = JSON.parse(body.toString());
            
            const results = [];
            
            // TechCrunch RapidAPI usually returns an array of post objects
            if (Array.isArray(data)) {
              for (const post of data) {
                // Try to clean HTML from the excerpt for the description
                let cleanDesc = post.excerpt?.rendered || "";
                cleanDesc = cleanDesc.replace(/<[^>]*>?/gm, '').trim();

                // Clean title
                const cleanTitle = post.title?.rendered || "Unknown Startup";

                results.push({
                  name: cleanTitle.substring(0, 50), // Fallback name, AI will clean this up
                  description: cleanTitle + ". " + cleanDesc,
                  url: post.link || "https://techcrunch.com",
                  externalId: `tc_${post.id}`,
                  category: "Tech News", // Fallback, AI will categorize
                  launchedAt: new Date(post.date || Date.now()),
                  rawPayload: post,
                  engagementMetrics: JSON.stringify({ views: null }) // We don't have views from this API
                });
              }
            }
            
            resolve(results);
          } catch (e) {
            console.error("Error parsing TechCrunch response:", e);
            resolve([]); // Return empty on error so we don't crash the pipeline
          }
        });
      });

      req.on('error', function(e) {
        console.error("HTTP Request Error to TechCrunch:", e);
        resolve([]);
      });

      req.end();
    });
  }
}

module.exports = TechCrunchIngestor;
