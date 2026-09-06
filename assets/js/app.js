(function () {
  'use strict';

  const startDate = new Date('2026-08-30T00:00:00+08:00');
  const targetDate = new Date('2027-06-07T09:00:00+08:00');
  const desktopBackgroundApi = 'https://api.yppp.net/pc.php';
  const mobileBackgroundApi = 'https://api.yppp.net/pe.php';
  const quoteApi = 'https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json';
  const quoteElement = document.getElementById('quote');
  const backdrop = document.getElementById('backdrop');
  const shell = document.getElementById('siteShell');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const fullscreenControls = document.getElementById('fullscreenControls');
  const fullscreenWallpaper = document.getElementById('fullscreenWallpaper');
  const fullscreenExit = document.getElementById('fullscreenExit');
  const refreshBackground = document.getElementById('refreshBackground');
  const imageStatus = document.getElementById('imageStatus');
  let hideExitTimer;

  const quotes = [
    '把今天的努力，写成明天的答案。',
    '慢一点也没关系，重要的是一直在向前。',
    '所有看似不起波澜的日复一日，都在为最后的闪耀蓄力。',
    '你只管努力，时间会把答案交给你。',
    '愿你合笔时，有剑入鞘的笃定。',
    '此刻打盹，你将做梦；此刻学习，你将圆梦。',
    '目标在远方，脚步在当下。',
    '每一次专注，都是在靠近理想的自己。'
  ];

  function pad(value, length) {
    return String(value).padStart(length, '0');
  }

  function updateCountdown() {
    const remaining = Math.max(0, targetDate.getTime() - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('days').textContent = pad(days, 3);
    document.getElementById('hours').textContent = pad(hours, 2);
    document.getElementById('minutes').textContent = pad(minutes, 2);
    document.getElementById('seconds').textContent = pad(seconds, 2);
    document.getElementById('totalSeconds').textContent = totalSeconds.toLocaleString('zh-CN');

    const totalDuration = targetDate.getTime() - startDate.getTime();
    const elapsed = Date.now() - startDate.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressTrack = document.querySelector('.progress-track');
    progressFill.style.width = `${progress.toFixed(2)}%`;
    progressPercent.textContent = `${progress.toFixed(1)}%`;
    progressTrack.setAttribute('aria-valuenow', progress.toFixed(1));

    if (remaining <= 0) {
      document.getElementById('pageTitle').textContent = '高考加油，落笔生花';
      document.querySelector('.total-seconds span:last-child').textContent = 'TIME TO SHINE';
    }
  }

  function chooseLocalQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = `“${quotes[index]}”`;
  }

  async function loadQuote() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(quoteApi, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Quote API returned ${response.status}`);
      const data = await response.json();
      const hitokoto = typeof data.hitokoto === 'string' ? data.hitokoto.trim() : '';
      if (!hitokoto || hitokoto.length > 120) throw new Error('Invalid quote payload');
      quoteElement.textContent = `“${hitokoto}”`;
    } catch (error) {
      // Keep the local quote visible when the remote service is unavailable.
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function showImageStatus(message) {
    imageStatus.textContent = message;
    imageStatus.classList.add('is-visible');
    window.clearTimeout(showImageStatus.timer);
    showImageStatus.timer = window.setTimeout(() => imageStatus.classList.remove('is-visible'), 1800);
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 700px)').matches;
  }

  function getBackgroundApi() {
    // Fullscreen always uses the wide desktop artwork, including on phones.
    if (document.fullscreenElement) return desktopBackgroundApi;
    return isMobileViewport() ? mobileBackgroundApi : desktopBackgroundApi;
  }

  function loadBackground(announce = false) {
    backdrop.classList.add('is-loading');
    backdrop.classList.remove('is-fallback');
    const backgroundApi = getBackgroundApi();
    const separator = backgroundApi.includes('?') ? '&' : '?';
    backdrop.dataset.source = backgroundApi;
    backdrop.src = `${backgroundApi}${separator}t=${Date.now()}`;
    if (announce) showImageStatus('正在刷新背景');
  }

  function refreshImage() {
    loadBackground(true);
  }

  function showExitButton() {
    if (!document.fullscreenElement) return;
    fullscreenControls.classList.add('is-visible');
    window.clearTimeout(hideExitTimer);
    hideExitTimer = window.setTimeout(() => fullscreenControls.classList.remove('is-visible'), 2500);
  }

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      syncFullscreenState();
      // fullscreenchange is the source of truth; this call also reduces the
      // delay on browsers that resolve requestFullscreen before firing it.
      await lockLandscapeOnPhone();
    } catch (error) {
      showImageStatus('当前浏览器不支持全屏');
    }
  }

  async function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
    unlockScreenOrientation();
  }

  function isPhoneViewport() {
    return window.matchMedia('(max-width: 700px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }

  async function lockLandscapeOnPhone() {
    if (!isPhoneViewport() || !screen.orientation || typeof screen.orientation.lock !== 'function') return;
    // Different mobile browsers accept different orientation tokens. Try the
    // standards-based primary value first, then the generic fallback.
    for (const orientation of ['landscape-primary', 'landscape']) {
      try {
        await screen.orientation.lock(orientation);
        return;
      } catch (error) {
        // Some browsers only allow orientation lock from an installed PWA.
      }
    }
  }

  function unlockScreenOrientation() {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
    }
  }

  function syncFullscreenState() {
    const active = Boolean(document.fullscreenElement);
    shell.classList.toggle('is-fullscreen', active);
    if (backdrop.dataset.source !== getBackgroundApi()) loadBackground();
    fullscreenButton.setAttribute('aria-label', active ? '已进入全屏' : '进入全屏');
    fullscreenControls.classList.toggle('is-visible', false);
    if (active) {
      // This also covers fullscreen entered via browser/UI gestures rather
      // than the page button.
      lockLandscapeOnPhone();
      showExitButton();
    } else {
      window.clearTimeout(hideExitTimer);
      unlockScreenOrientation();
    }
  }

  backdrop.addEventListener('load', () => {
    backdrop.classList.remove('is-loading', 'is-fallback');
  });

  backdrop.addEventListener('error', () => {
    backdrop.classList.remove('is-loading');
    backdrop.classList.add('is-fallback');
    showImageStatus('背景加载失败，已使用蓝色背景');
  });

  refreshBackground.addEventListener('click', refreshImage);
  fullscreenWallpaper.addEventListener('click', refreshImage);
  fullscreenButton.addEventListener('click', enterFullscreen);
  fullscreenExit.addEventListener('click', exitFullscreen);
  document.addEventListener('fullscreenchange', syncFullscreenState);
  window.addEventListener('orientationchange', () => {
    if (document.fullscreenElement) lockLandscapeOnPhone();
    else if (backdrop.dataset.source !== getBackgroundApi()) loadBackground();
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!document.fullscreenElement && backdrop.dataset.source !== getBackgroundApi()) loadBackground();
  }, { passive: true });
  ['mousemove', 'pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
    document.addEventListener(eventName, showExitButton, { passive: eventName !== 'keydown' });
  });

  chooseLocalQuote();
  loadQuote();
  loadBackground();
  window.setInterval(loadQuote, 10 * 60 * 1000);
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();
