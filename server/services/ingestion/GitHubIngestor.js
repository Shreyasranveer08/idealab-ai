const BaseIngestor = require('./BaseIngestor');

class GitHubIngestor extends BaseIngestor {
  getSourceName() {
    return 'GITHUB';
  }

  preFilter(rawItem) {
    // Only keep repos with at least 100 stars
    return rawItem.stargazers_count >= 100;
  }

  async fetchLatest() {
    console.log("Fetching GitHub Trending (Recent)...");
    try {
      // Find repos created in the last 7 days with >100 stars
      const date = new Date();
      date.setDate(date.getDate() - 7);
      const dateStr = date.toISOString().split('T')[0];
      
      const res = await fetch(`https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc`, {
        headers: { 'User-Agent': 'BuildWatchAI/1.0' }
      });
      const json = await res.json();
      
      const results = [];
      const items = json.items || [];
      
      for (const item of items) {
        if (item && this.preFilter(item)) {
          results.push({
            name: item.name,
            description: (item.description || '').substring(0, 500),
            url: item.html_url,
            externalId: `github_${item.id}`,
            category: 'Developer Tools', 
            launchedAt: new Date(item.created_at),
            rawPayload: item,
            engagementMetrics: JSON.stringify({ 
              stars: item.stargazers_count, 
              forks: item.forks_count,
              language: item.language
            })
          });
        }
      }
      return results;
    } catch (e) {
      console.error("GitHubIngestor error:", e.message);
      return [];
    }
  }
}

module.exports = GitHubIngestor;
