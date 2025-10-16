module.exports = {
  siteUrl: 'https://gcrpro.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.8,
  sitemapSize: 5000,

  // Add all your main routes manually
  additionalPaths: async (config) => {
    const now = new Date().toISOString();

    return [
      { loc: '/', lastmod: now },
      { loc: '/sign-in', lastmod: now },
      { loc: '/assignments', lastmod: now },
      { loc: '/courses', lastmod: now },
      { loc: '/get-started', lastmod: now },
      { loc: '/send-email', lastmod: now },
      { loc: '/settings', lastmod: now },
      { loc: '/solver', lastmod: now },
      { loc: '/manifest.webmanifest', lastmod: now },
    ];
  },
};
