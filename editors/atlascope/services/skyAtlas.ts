interface SkyAtlasArticle {
  id: string;
  title: string;
  url: string;
  scope: string;
}

export async function fetchSkyAtlasArticles(scope: string): Promise<SkyAtlasArticle[]> {
  try {
    const response = await fetch(`https://sky-atlas.powerhouse.io/api/scopes/${scope}/articles`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Sky Atlas articles:', error);
    return [];
  }
} 