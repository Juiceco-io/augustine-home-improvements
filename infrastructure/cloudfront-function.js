// CloudFront Function: rewrite-index
// Rewrites directory-style URIs to point at index.html so that
// S3 (accessed via OAC / REST API, NOT the S3 website endpoint)
// serves the correct static Next.js page on direct load or refresh.
//
// Also handles 301 redirects for legacy flat-URL town pages from the
// previous site, redirecting them to the new nested URL structure:
//   /deck-installation-atglen-pa/  → /deck-installation/atglen-pa/
//
// Handles:
//   /about-us/       → /about-us/index.html
//   /about-us        → /about-us/index.html
//   /                → /index.html  (redundant but harmless)
//   /_next/static/…  → unchanged   (has a file extension)
//   /images/logo.png → unchanged   (has a file extension)

var SERVICE_SLUGS = [
  'deck-installation',
  'bathroom-remodeling',
  'kitchen-renovations',
  'basement-renovation',
  'home-additions',
  'home-renovations',
];

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // 301 redirects: legacy flat-URL town pages → nested URL structure
  // e.g. /deck-installation-atglen-pa/ → /deck-installation/atglen-pa/
  for (var i = 0; i < SERVICE_SLUGS.length; i++) {
    var service = SERVICE_SLUGS[i];
    var prefix = '/' + service + '-';
    if (uri.startsWith(prefix)) {
      var remainder = uri.slice(prefix.length).replace(/\/$/, '');
      // Only redirect if the remainder looks like a valid town slug (letters, digits, hyphens)
      if (remainder && /^[a-z0-9-]+$/.test(remainder)) {
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: '/' + service + '/' + remainder + '/' },
            'cache-control': { value: 'max-age=3600' },
          },
        };
      }
    }
  }

  // If the URI ends with '/', append 'index.html'
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  }
  // If the URI has no file extension, treat as a directory route and
  // rewrite to /path/index.html
  else if (!uri.includes('.', uri.lastIndexOf('/'))) {
    request.uri = uri + '/index.html';
  }

  return request;
}
