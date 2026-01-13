import { useEffect } from 'react';

function setMetaTag({ name, property, content }) {
  if (!content) return;
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    existing.setAttribute('content', content);
    return;
  }
  const meta = document.createElement('meta');
  if (name) meta.setAttribute('name', name);
  if (property) meta.setAttribute('property', property);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

function setLinkTag({ rel, href }) {
  if (!href) return;
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    existing.setAttribute('href', href);
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  document.head.appendChild(link);
}

export default function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website'
}) {
  const fullTitle = title ? `${title} | Breslov Academy` : 'Breslov Academy - Torah Learning Platform';
  const fullDescription = description || 'World-class Torah courses from expert Breslov instructors';

  useEffect(() => {
    document.title = fullTitle;
    setMetaTag({ name: 'description', content: fullDescription });

    setMetaTag({ property: 'og:title', content: fullTitle });
    setMetaTag({ property: 'og:description', content: fullDescription });
    setMetaTag({ property: 'og:type', content: type });
    if (url) setMetaTag({ property: 'og:url', content: url });
    if (image) setMetaTag({ property: 'og:image', content: image });
    if (url) setLinkTag({ rel: 'canonical', href: url });

    setMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
    setMetaTag({ name: 'twitter:title', content: fullTitle });
    setMetaTag({ name: 'twitter:description', content: fullDescription });
    if (image) setMetaTag({ name: 'twitter:image', content: image });
  }, [fullTitle, fullDescription, image, url, type]);

  return null;
}
