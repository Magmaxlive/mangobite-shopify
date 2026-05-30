// Load and autoplay video thumbnails on product cards
(function () {
  if (window.__mangoVideoInit) return;
  window.__mangoVideoInit = true;

  const cache = {};

  async function getVideoSources(handle, mediaId) {
    if (!cache[handle]) {
      const res = await fetch('/products/' + handle + '.js');
      cache[handle] = await res.json();
    }
    const media = cache[handle].media.find((m) => m.id === mediaId);
    return media && media.sources ? media.sources : [];
  }

  async function loadVideo(placeholder) {
    const handle = placeholder.dataset.videoHandle;
    const mediaId = parseInt(placeholder.dataset.videoMediaId);
    const poster = placeholder.dataset.videoPoster;

    const sources = await getVideoSources(handle, mediaId);
    if (!sources.length) return;

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.poster = poster;
    video.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;';

    sources.forEach((source) => {
      const el = document.createElement('source');
      el.src = source.url;
      el.type = source.mime_type;
      video.appendChild(el);
    });

    placeholder.innerHTML = '';
    placeholder.appendChild(video);
    video.play().catch(() => {});
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        loadVideo(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  function init() {
    document.querySelectorAll('.card__video-placeholder').forEach((el) => {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
