/* Independent startup guard: a broken UI script must never leave silent buttons. */
(() => {
  const fail = message => {
    const output = document.querySelector('#status');
    if (output) { output.textContent = message; output.dataset.error = 'true'; }
  };
  window.addEventListener('error', () => fail('Copyfeed could not start. Download the latest extension, replace all files in the existing folder and reload it in Chrome.'));
  window.addEventListener('unhandledrejection', event => fail(event.reason?.message || 'Copyfeed lost its connection. Reload the extension and refresh Instagram.'));
  setTimeout(() => {
    if (document.documentElement.dataset.copyfeedPopupReady !== 'true') fail('Copyfeed did not finish loading. Replace all extension files with the latest download, then reload it in Chrome.');
  }, 2000);
})();
