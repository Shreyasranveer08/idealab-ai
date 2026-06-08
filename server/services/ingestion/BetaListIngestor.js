const BaseIngestor = require('./BaseIngestor');
const Parser = require('rss-parser');

class BetaListIngestor extends BaseIngestor {
  constructor() {
    super();
    this.parser = new Parser();
  }

  getSourceName() {
    return 'BETALIST';
  }

  async fetchLatest() {
    console.log("Fetching BetaList RSS feed...");
    try {
      const feed = await this.parser.parseURL('https://betalist.com/feed');
      const results = [];
      
      // Get the top 15 newest items
      const items = feed.items.slice(0, 15);
      
      for (const item of items) {
        results.push({
          name: item.title ? item.title.trim() : 'Unknown BetaList Startup',
          description: (item.contentSnippet || item.content || '').substring(0, 500).trim(),
          url: item.link,
          externalId: `betalist_${item.guid || item.link}`,
          category: 'Early Access',
          launchedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          rawPayload: item,
          engagementMetrics: JSON.stringify({ comments: 0, upvotes: 0 }) // BetaList RSS doesn't expose upvotes
        });
      }
      return results;
    } catch (e) {
      console.error("BetaListIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = BetaListIngestor;
