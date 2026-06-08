class BaseIngestor {
  /**
   * Returns a unique identifier for the source (e.g. 'PRODUCT_HUNT')
   */
  getSourceName() {
    throw new Error("Method 'getSourceName()' must be implemented.");
  }

  /**
   * Fetches the latest startups from the source.
   * @returns {Promise<Array<{name: string, description: string, url: string, externalId: string, category: string, launchedAt: Date, engagementMetrics: string}>>}
   */
  async fetchLatest() {
    throw new Error("Method 'fetchLatest()' must be implemented.");
  }

  /**
   * Pre-filter logic to decide if a raw item meets the minimum engagement threshold.
   * Return true to keep, false to discard.
   */
  preFilter(rawItem) {
    return true; // Default allows all
  }
}

module.exports = BaseIngestor;
