import { MetadataRoute } from 'next';
import { SAMPLE_OUTFITS, SAMPLE_STYLE_GUIDES } from '@/lib/data/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://trenro.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/outfits`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/shop-the-look`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/budget-looks`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/trends`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/style-guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/find-my-look`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const outfitRoutes: MetadataRoute.Sitemap = SAMPLE_OUTFITS.map((outfit) => ({
    url: `${baseUrl}/outfits/${outfit.slug}`,
    lastModified: new Date(outfit.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = SAMPLE_STYLE_GUIDES.map((guide) => ({
    url: `${baseUrl}/style-guides/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...outfitRoutes, ...guideRoutes];
}
