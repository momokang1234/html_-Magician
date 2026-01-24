
export const extractH1Content = (html: string, defaultName: string): string => {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (match && match[1]) {
    // Remove HTML tags inside H1 if any
    const clean = match[1].replace(/<[^>]*>?/gm, '').trim();
    return clean || defaultName;
  }
  return defaultName;
};

export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[\\\/:*?"<>|]/g, '_') // Replace illegal characters
    .replace(/\s+/g, '_')           // Replace spaces with underscore
    .substring(0, 255);             // Max length
};
