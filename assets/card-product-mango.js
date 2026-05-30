// Video thumbnail loader — debug build
(function () {
  if (window.__mangoVideoInit) return;
  window.__mangoVideoInit = true;

  const cache = {};

  async function loadVideo(placeholder) {
    const handle = placeholder.dataset.videoHandle;
    const mediaId = parseInt(placeholder.dataset.videoMediaId);
    const poster  = placeholder.dataset.videoPoster;

    console.log('[MangoVideo] handle:', handle, '| mediaId:', mediaId);

    let product;
    try {
      if (!cache[handle]) {
        const res = await fetch('/products/' + handle + '.js');
        cache[handle] = await res.json();
      }
      product = cache[handle];
    } catch (e) {
      console.error('[MangoVideo] fetch failed:', e);
      return;
    }

    const media = (product.media || []).find((m) => m.id === mediaId);
    console.log('[MangoVideo] media object:', media);

    const sources = media && media.sources ? media.sources : [];
    console.log('[MangoVideo] sources:', sources);

    if (!sources.length) {
      console.warn('[MangoVideo] NO SOURCES — video cannot play.');
      return;
    }

    const video = document.createElement('video');
    video.autoplay   = true;
    video.muted      = true;
    video.loop       = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload    = 'auto';
    video.poster     = poster;
    video.style.cssText =
      'display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;background:transparent;z-index:2;';

    sources.forEach((s) => {
      const el = document.createElement('source');
      el.src  = s.url;
      el.type = s.mime_type;
      video.appendChild(el);
    });

    placeholder.innerHTML = '';
    placeholder.appendChild(video);
    video.load();
    video.play().catch((e) => console.warn('[MangoVideo] play() blocked:', e));
  }

  function init() {
    const els = document.querySelectorAll('.card__video-placeholder');
    console.log('[MangoVideo] found', els.length, 'placeholder(s)');
    els.forEach(loadVideo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
