const BaseIngestor = require('./BaseIngestor');

class IndieHackersIngestor extends BaseIngestor {
  getSourceName() {
    return 'INDIE_HACKERS';
  }

  preFilter(rawItem) {
    return true; // Implement specific threshold when API is connected
  }

  async fetchLatest() {
    console.log("Fetching Indie Hackers (Mocked for MVP)...");
    // Note: Indie Hackers does not have an open public JSON API anymore.
    // In production, this would use a web scraper (Puppeteer/Cheerio) or an RSS feed.
    // We mock returning an empty array to satisfy the pipeline architecture without throwing errors.
    return [];
  }
}

module.exports = IndieHackersIngestor;
