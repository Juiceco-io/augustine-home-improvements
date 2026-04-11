// CloudFront Function: rewrite-index
// Rewrites directory-style URIs to point at index.html so that
// S3 (accessed via OAC / REST API, NOT the S3 website endpoint)
// serves the correct static Next.js page on direct load or refresh.
//
// Handles:
//   /about-us/       → /about-us/index.html
//   /about-us        → /about-us/index.html
//   /                → /index.html  (redundant but harmless)
//   /_next/static/…  → unchanged   (has a file extension)
//   /images/logo.png → unchanged   (has a file extension)

function handler(event) {
  var request = event.request;
  var uri = request.uri;

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
