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
};
