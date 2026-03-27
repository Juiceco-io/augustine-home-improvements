/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.augustinehomeimprovements.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin/', '/api/'] },
    ],
    additionalSitemaps: [],
  },
  exclude: ['/admin/*', '/api/*'],
  changefreq: 'monthly',
  priority: 0.7,
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/deck-installation/'),
    await config.transform(config, '/kitchen-renovations/'),
    await config.transform(config, '/bathroom-remodeling/'),
    await config.transform(config, '/basement-renovation/'),
    await config.transform(config, '/home-additions/'),
    await config.transform(config, '/home-renovations/'),
    await config.transform(config, '/gallery/'),
    await config.transform(config, '/reviews/'),
    await config.transform(config, '/about-us/'),
    await config.transform(config, '/contact-us/'),
  ],
}
