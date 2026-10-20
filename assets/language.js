/* Shared language state, loaded before first paint on both pages. */
(function () {
  'use strict';
  var root = document.documentElement;
  function normalize(value) {
    if (value === 'zh' || value === 'zh-Hans') return 'zh-Hans';
    return value === 'en' || value === 'ja' ? value : null;
  }
  function save(lang) { try { localStorage.setItem('mp-lang', lang); } catch (e) {} }
  function updateUrl(lang) {
    var url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
  var url = new URL(location.href), saved = null, theme = null;
  try { saved = localStorage.getItem('mp-lang'); theme = localStorage.getItem('mp-theme'); } catch (e) {}
  var explicit = normalize(url.searchParams.get('lang'));
  root.lang = explicit || normalize(saved) || 'zh-Hans';
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  save(root.lang);
  if (url.searchParams.has('lang')) updateUrl(root.lang);
  window.MP_LANGUAGE = { normalize: normalize, save: save, updateUrl: updateUrl };
  // Keep explicit language links consistent between the gallery and examples page.
  window.MP_LOCALIZE_PAGE = function (title, description) {
    var lang = root.lang, config = window.MP_SITE_CONFIG;
    var fields = { description: description, 'og:title': title, 'og:description': description,
      'og:locale': lang === 'zh-Hans' ? 'zh_CN' : lang === 'ja' ? 'ja_JP' : 'en_US' };
    Object.keys(fields).forEach(function (key) {
      var n = document.querySelector('meta[name="' + key + '"], meta[property="' + key + '"]');
      if (n) n.content = fields[key];
    });
    var alternates = ['zh_CN', 'en_US', 'ja_JP'].filter(function (locale) { return locale !== fields['og:locale']; });
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(function (n, i) { n.content = alternates[i]; });
    document.querySelectorAll('a[href]').forEach(function (a) {
      var u = new URL(a.getAttribute('href'), location.href);
      if (u.origin === location.origin && /\/(?:index\.html|found\.html)?$/.test(u.pathname) && !u.hash) {
        u.searchParams.set('lang', lang); a.href = u.href;
      }
      if (config && a.hasAttribute('data-repo-path')) a.href = config.repo + a.getAttribute('data-repo-path');
    });
  };
})();
