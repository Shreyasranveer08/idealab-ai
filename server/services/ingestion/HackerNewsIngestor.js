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

class HackerNewsIngestor extends BaseIngestor {
  getSourceName() {
    return 'HACKER_NEWS';
  }

  preFilter(rawItem) {
    // Only keep Show HN posts with at least 50 points
    return rawItem.score >= 50 && rawItem.title && rawItem.title.startsWith('Show HN:');
  }

  async fetchLatest() {
    console.log("Fetching Hacker News (Show HN)...");
    try {
      const showRes = await fetch('https://hacker-news.firebaseio.com/v0/showstories.json');
      const storyIds = await showRes.json();
      
      const results = [];
      // Just check the top 30 latest Show HNs to avoid rate limits/slow fetches
      const toCheck = storyIds.slice(0, 30);
      
      for (const id of toCheck) {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const item = await itemRes.json();
        
        if (item && this.preFilter(item)) {
          // Parse out the name from "Show HN: Name - Description"
          let name = item.title.replace('Show HN:', '').trim();
          let description = item.text || item.title;
          
          if (name.includes(' - ')) {
            const parts = name.split(' - ');
            name = parts[0];
            description = parts.slice(1).join(' - ') + (item.text ? " | " + item.text : "");
          }

          results.push({
            name: name,
            description: cleanText(description).substring(0, 500),
            url: item.url || `https://news.ycombinator.com/item?id=${id}`,
            externalId: `hn_${id}`,
            category: 'Tech/DevTools', // HN defaults largely to DevTools
            launchedAt: new Date(item.time * 1000),
            rawPayload: item,
            engagementMetrics: JSON.stringify({ points: item.score, comments: item.descendants })
          });
        }
      }
      return results;
    } catch (e) {
      console.error("HackerNewsIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = HackerNewsIngestor;
