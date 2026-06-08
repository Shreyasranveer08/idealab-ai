const BaseIngestor = require('./BaseIngestor');

class RedditIngestor extends BaseIngestor {
  getSourceName() {
    return 'REDDIT';
  }

  preFilter(rawItem) {
    // Only keep posts with at least 10 upvotes
    return rawItem.ups >= 10;
  }

  async fetchLatest() {
    console.log("Fetching Reddit /r/SideProject, startups, SaaS...");
    try {
      // Use a standard browser user-agent to bypass Reddit bot blocking
      const res = await fetch('https://www.reddit.com/r/SideProject+startups+SaaS+Entrepreneur/new.json?limit=25', {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      const json = await res.json();
      
      const results = [];
      const posts = json.data.children;
      
      for (const child of posts) {
        const item = child.data;
        if (item && this.preFilter(item)) {
          results.push({
            name: item.title.substring(0, 100),
            description: (item.selftext || item.title).substring(0, 500),
            url: item.url || `https://reddit.com${item.permalink}`,
            externalId: `reddit_${item.id}`,
            category: 'Indie Hacker', 
            launchedAt: new Date(item.created_utc * 1000),
            rawPayload: item,
            engagementMetrics: JSON.stringify({ upvotes: item.ups, comments: item.num_comments })
          });
        }
      }
      return results;
    } catch (e) {
      console.error("RedditIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = RedditIngestor;
