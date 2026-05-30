// Ensure video thumbnails autoplay on product cards
(function () {
  if (window.__mangoVideoInit) return;
  window.__mangoVideoInit = true;

  const cache = {};

  async function ensureSources(container, video) {
    if (video.querySelector('source')) {
      video.play().catch(() => {});
      return;
    }

    // media_tag didn't include sources — fetch from product JSON as fallback
    const handle = container.dataset.videoHandle;
    const mediaId = parseInt(container.dataset.videoMediaId);
    if (!handle || !mediaId) return;

    if (!cache[handle]) {
      try {
        const res = await fetch('/products/' + handle + '.js');
        cache[handle] = await res.json();
      } catch (e) {
        cache[handle] = { media: [] };
      }
    }

    const media = (cache[handle].media || []).find((m) => m.id === mediaId);
    const sources = media && media.sources ? media.sources : [];
    if (!sources.length) return;

    sources.forEach((s) => {
      const el = document.createElement('source');
      el.src = s.url;
      el.type = s.mime_type;
      video.appendChild(el);
    });

    video.load();
    video.play().catch(() => {});
  }

  function init() {
    document.querySelectorAll('.card__video-media').forEach((container) => {
      const video = container.querySelector('video');
      if (video) ensureSources(container, video);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
