const BaseIngestor = require('./BaseIngestor');

function cleanText(text) {
  if (!text) return text;
  let clean = text
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  clean = clean.replace(/<\/?[^>]+(>|$)/g, " ");
  return clean.replace(/\s+/g, ' ').trim();
}

class YCombinatorIngestor extends BaseIngestor {
  getSourceName() {
    return 'YCOMBINATOR';
  }

  async fetchLatest() {
    console.log("Fetching Y Combinator (Launch HN) startups...");
    try {
      // Use HN Algolia API to search for "Launch HN:" in titles, sorted by date
      const res = await fetch('https://hn.algolia.com/api/v1/search_by_date?query="Launch HN:"&tags=story&hitsPerPage=10');
      const json = await res.json();
      
      const results = [];
      const hits = json.hits || [];
      
      for (const item of hits) {
        if (!item.title || !item.title.includes("Launch HN:")) continue;
        
        let name = item.title.replace('Launch HN:', '').trim();
        let description = item.story_text || item.title;
        
        if (name.includes(' - ')) {
          const parts = name.split(' - ');
          name = parts[0];
          description = parts.slice(1).join(' - ') + (item.story_text ? " | " + item.story_text : "");
        }

        results.push({
          name: name.substring(0, 100),
          description: cleanText(description).substring(0, 500),
          url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
          externalId: `yc_${item.objectID}`,
          category: 'Y Combinator',
          launchedAt: new Date(item.created_at),
          rawPayload: item,
          engagementMetrics: JSON.stringify({ points: item.points || 0, comments: item.num_comments || 0 })
        });
      }
      return results;
    } catch (e) {
      console.error("YCombinatorIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = YCombinatorIngestor;
