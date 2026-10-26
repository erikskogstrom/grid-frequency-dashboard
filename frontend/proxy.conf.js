// Under Aspire, WithReference(api) provides the API address as API_HTTPS / API_HTTP.
// Without Aspire (plain `ng serve`) we fall back to the http port in launchSettings.json.
const target = process.env.API_HTTPS || process.env.API_HTTP || 'http://localhost:5121';

console.log(`[proxy] /api and /hubs -> ${target}`);

module.exports = {
  '/api': {
    target,
    secure: false, // the Aspire API endpoint uses the local dev certificate
  },
  '/hubs': {
    target,
    secure: false,
    ws: true,
  },
};
