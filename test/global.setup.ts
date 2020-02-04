export default async () => {
  process.env.LOG_LEVEL = "debug";
  process.env.DEFAULT_SESSION_EXPIRATION = "3600";
  process.env.COOKIE_SECRET = "secret";
  process.env.CACHE_SERVER = "cache_server";
  process.env.COOKIE_NAME = "cookie_name";
  process.env.COOKIE_DOMAIN = "cookie_domain";
  process.env.COOKIE_SECURE_ONLY = "cookie_secure";
  process.env.PIWIK_URL = "piwik_url";
  process.env.PIWIK_SITE_ID = "piwik_site_id";
  process.env.SESSION_CREATE = "off";
  // This Request key is just a random 256 bit base64 encoded string
  process.env.OAUTH2_REQUEST_KEY = "uqq1imjrxynuNrPPSr32fsC5KQaHV42uu08MKgizyj0=";
  process.env.OAUTH2_AUTH_URI = "http://auth.url.com";
  process.env.OAUTH2_CLIENT_ID = "1234";
  process.env.OAUTH2_REDIRECT_URI = "http://return.url";
};
