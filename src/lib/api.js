const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchStartups(q = '') {
  try {
    const url = q ? `${API_BASE}/startups?q=${encodeURIComponent(q)}` : `${API_BASE}/startups`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch startups');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchStartups):", error);
    return [];
  }
}

export async function fetchDailyBrief() {
  try {
    const res = await fetch(`${API_BASE}/brief/today`);
    if (!res.ok) throw new Error('Failed to fetch daily brief');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchDailyBrief):", error);
    return null;
  }
}

export async function fetchTopStartups(days = 7) {
  try {
    const res = await fetch(`${API_BASE}/startups/top?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch top startups');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchTopStartups):", error);
    return [];
  }
}

export async function fetchStartupDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/startups/${id}`);
    if (!res.ok) throw new Error('Failed to fetch startup details');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchStartupDetail):", error);
    return null;
  }
}

export async function triggerIngestion() {
  try {
    const res = await fetch(`${API_BASE}/ingest`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger ingestion');
    return await res.json();
  } catch (error) {
    console.error("API Error (triggerIngestion):", error);
    return null;
  }
}

export async function fetchNiches() {
  try {
    const res = await fetch(`${API_BASE}/niches`);
    if (!res.ok) throw new Error('Failed to fetch niches');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchNiches):", error);
    return [];
  }
}

export async function fetchNicheReports(category = null) {
  try {
    const url = category ? `${API_BASE}/reports/niche?category=${encodeURIComponent(category)}` : `${API_BASE}/reports/niche`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchNicheReports):", error);
    return [];
  }
}

export async function generateNicheReport(category) {
  try {
    const res = await fetch(`${API_BASE}/reports/niche`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return await res.json();
  } catch (error) {
    console.error("API Error (generateNicheReport):", error);
    return null;
  }
}

export async function validateIdea(idea) {
  try {
    const res = await fetch(`${API_BASE}/lab/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });
    if (!res.ok) throw new Error('Failed to validate idea');
    return await res.json();
  } catch (error) {
    console.error("API Error (validateIdea):", error);
    return null;
  }
}

export async function fetchMatrixData() {
  try {
    const res = await fetch(`${API_BASE}/lab/matrix`);
    if (!res.ok) throw new Error('Failed to fetch matrix data');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchMatrixData):", error);
    return [];
  }
}

export async function fetchIdeasByIds(ids) {
  if (!ids || ids.length === 0) return [];
  try {
    const res = await fetch(`${API_BASE}/lab/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Failed to fetch ideas');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchIdeasByIds):", error);
    return [];
  }
}

export async function fetchBriefs() {
  try {
    const res = await fetch(`${API_BASE}/briefs`);
    if (!res.ok) throw new Error('Failed to fetch briefs');
    return await res.json();
  } catch (error) {
    console.error("API Error (fetchBriefs):", error);
    return [];
  }
}

export async function generatePitchDeck(ideaId) {
  try {
    const res = await fetch(`${API_BASE}/lab/pitch-deck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId })
    });
    if (!res.ok) throw new Error('Failed to generate pitch deck');
    return await res.json();
  } catch (error) {
    console.error("API Error (generatePitchDeck):", error);
    return null;
  }
}

export async function generateSwot(startupId) {
  try {
    const res = await fetch(`${API_BASE}/startup/${startupId}/swot`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate SWOT');
    return await res.json();
  } catch (error) {
    console.error("API Error (generateSwot):", error);
    return null;
  }
}
