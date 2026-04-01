// Expose runtime configuration defaults to frontend scripts.

(function initializeAppConfig(global) {
  const fallbackApiBaseUrl = "http://localhost:4000/api";
  const runtimeOverride =
    typeof global.__API_BASE_URL__ === "string" ? global.__API_BASE_URL__.trim() : "";
  const metaTag = global.document?.querySelector('meta[name="api-base-url"]');
  const metaValue = metaTag?.getAttribute("content")?.trim() || "";

  let computedApiBaseUrl = runtimeOverride || metaValue;
  if (!computedApiBaseUrl) {
    const protocol = String(global.location?.protocol || "").toLowerCase();
    const hostname = String(global.location?.hostname || "").toLowerCase();
    const port = String(global.location?.port || "");

    // To URL host.
    function toUrlHost(name) {
      if (!name) return "localhost";
      if (name.includes(":") && !name.startsWith("[") && !name.endsWith("]")) {
        return `[${name}]`;
      }
      return name;
    }

    if (protocol === "http:" || protocol === "https:") {
      const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
      if (isLocalHost && port !== "4000") {
        const hostForUrl = toUrlHost(hostname);
        computedApiBaseUrl = `${protocol}//${hostForUrl}:4000/api`;
      } else {
        computedApiBaseUrl = `${global.location.origin}/api`;
      }
    } else {
      computedApiBaseUrl = fallbackApiBaseUrl;
    }
  }

  computedApiBaseUrl = computedApiBaseUrl.replace(/\/+$/, "");

  global.APP_CONFIG = Object.freeze({
    API_BASE_URL: computedApiBaseUrl
  });
})(window);
