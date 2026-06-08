const BaseIngestor = require('./BaseIngestor');

class DevToIngestor extends BaseIngestor {
  getSourceName() {
    return 'DEV_TO';
  }

  preFilter(rawItem) {
    // Keep articles with 'showdev' tag and at least 5 positive reactions
    const tags = rawItem.tag_list || [];
    return tags.includes('showdev') && rawItem.public_reactions_count >= 5;
  }

  async fetchLatest() {
    console.log("Fetching Dev.to #showdev...");
    try {
      // Fetch latest articles with the 'showdev' tag
      const res = await fetch('https://dev.to/api/articles?tag=showdev&top=1');
      const articles = await res.json();
      
      const results = [];
      
      for (const item of articles) {
        if (item && this.preFilter(item)) {
          results.push({
            name: item.title,
            description: item.description || "A new developer project shared on Dev.to",
            url: item.url,
            externalId: `devto_${item.id}`,
            category: 'Developer Tools',
            launchedAt: new Date(item.published_timestamp),
            rawPayload: item,
            engagementMetrics: JSON.stringify({ reactions: item.public_reactions_count, comments: item.comments_count })
          });
        }
      }
      return results;
    } catch (e) {
      console.error("DevToIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = DevToIngestor;
