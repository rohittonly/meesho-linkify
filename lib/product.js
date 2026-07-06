export function extractSlug(url) {
  // Remove any query string or hash
  url = url.split("?")[0].split("#")[0];

  // Split the URL into parts
  const parts = url.split("/");

  // Return the last part
  return parts[parts.length - 1];
}