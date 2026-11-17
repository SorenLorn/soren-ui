import { useEffect } from 'react';

const setMetaContent = (name, content) => {
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

/** 页面级 SEO：document.title + meta description */
export default function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMetaContent('description', description);
  }, [title, description]);
}
