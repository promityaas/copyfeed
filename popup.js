/* Bind controls before contacting Chrome so a connection failure stays visible. */
(() => {
  const $ = selector => document.querySelector(selector);
  const supportedHosts = ['www.instagram.com', 'www.tiktok.com', 'www.youtube.com', 'www.facebook.com'];
  let activeTab = null;
  let running = false;
  let busy = false;
  let ready = false;

  function supported() {
    try { return !!CopyfeedAdapters.scope(activeTab?.url); }
    catch { return false; }
  }
  function status(text, error = false) {
    $('#status').textContent = text;
    $('#status').dataset.error = String(error);
  }
  function controls() {
    $('#start').disabled = busy || running || !ready || !supported();
    $('#open').disabled = busy || !ready || !supported();
    $('#stop').disabled = busy;
  }
  async function message(payload) {
    let timer;
    try {
      const response = await Promise.race([
        chrome.runtime.sendMessage(payload),
        new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Copyfeed did not respond. Click Reconnect, or reload the extension in Chrome.')), 12000); })
      ]);
      if (response?.error) throw Error(response.error);
      if (!response) throw Error('Copyfeed could not connect. Click Reconnect, then try again.');
      return response;
    } finally { clearTimeout(timer); }
  }
  async function action(label, fn) {
    if (busy) return;
    busy = true;
    status(label);
    controls();
    try { await fn(); }
    catch (error) { status(error.message || String(error), true); $('#reconnect').hidden = false; }
    finally { busy = false; controls(); }
  }
  function display(session) {
    if (!session || session.tabId !== activeTab?.id) return;
    running = !['finished', 'error'].includes(session.phase);
    $('#progress-box').hidden = !running;
    $('#progress').max = session.target || 100;
    $('#progress').value = session.count || 0;
    status(session.message || `${session.count || 0}/${session.target} collected`, session.phase === 'error');
    controls();
  }
  async function connect() {
    ready = false;
    [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (activeTab?.url) {
      const url = new URL(activeTab.url);
      const name = url.pathname.split('/').filter(Boolean)[0];
      const profile = name && !['p', 'reel', 'reels', 'direct', 'accounts', 'explore'].includes(name);
      $('#source-name').textContent = CopyfeedAdapters.scope(activeTab.url)?`${CopyfeedAdapters.scope(activeTab.url).platform} · ${CopyfeedAdapters.scope(activeTab.url).creator}`:url.hostname === 'www.instagram.com'
        ? profile ? `Instagram · @${name}` : 'Instagram · Browse reels'
        : supported() ? url.hostname : CopyfeedAdapters.explain(activeTab.url);
    }
    const state = await chrome.storage.local.get(['settings', 'posts']);
    for (const [id, key] of Object.entries(settingsKeys)) $('#' + id).checked = state.settings?.[key] !== false;
    $('#stored-count').textContent = String(state.posts?.length || 0);
    const health = await message({type: 'health'});
    if (health.version !== chrome.runtime.getManifest().version) throw Error('Mixed extension files detected. Update Copyfeed in Chrome, then refresh Instagram.');
    ready = true;
    $('#reconnect').hidden = true;
    status(supported() ? 'Connected. Choose how to sort, then click Sort profile.' : 'Open a supported social profile, then reopen Copyfeed.');
    display((await message({type: 'get-session'})).session);
  }

  $('#start').onclick = () => action('Starting collection…', async () => {
    if (!ready || !supported()) throw Error('Open a supported profile and reconnect Copyfeed before sorting.');
    const target = Number($('#target').value);
    if (!Number.isInteger(target) || target < 1 || target > 2000) throw Error('Choose a whole number between 1 and 2,000.');
    const result = await message({type: 'start-session', tabId: activeTab.id, target, sort: $('#sort').value, enrich: $('#enrich').checked});
    if (!result.session) throw Error('The source page did not acknowledge collection. Refresh the source page and retry.');
    display(result.session);
    window.close();
  });
  $('#open').onclick = () => action('Showing sorted reels…', async () => {
    if (!ready || !supported()) throw Error('Open a supported profile and reconnect Copyfeed first.');
    const result = await message({type: 'open-research', tabId: activeTab.id});
    if (!result.ok) throw Error('The research workspace did not open. Refresh the source page and retry.');
    window.close();
  });
  $('#stop').onclick = () => action('Stopping collection…', async () => {
    await message({type: 'stop-session'});
    running = false;
    $('#progress-box').hidden = true;
    status('Collection stopped. Saved posts are kept.');
  });
  $('#panel').onclick = () => action('Opening browser library…', async () => {
    await chrome.tabs.create({url: chrome.runtime.getURL('panel.html')});
    window.close();
  });
  $('#settings-toggle').onclick = () => { $('#settings').hidden = !$('#settings').hidden; };
  $('#reconnect').onclick = () => action('Reconnecting…', connect);
  for (const preset of document.querySelectorAll('[data-count]')) {
    preset.onclick = () => {
      $('#target').value = preset.dataset.count;
      for (const button of document.querySelectorAll('[data-count]')) button.classList.toggle('active', button === preset);
    };
  }
  $('#target').oninput = () => {
    for (const button of document.querySelectorAll('[data-count]')) button.classList.toggle('active', button.dataset.count === $('#target').value);
  };
  const settingsKeys = {'inline-download': 'inlineDownload', 'inline-transcribe': 'inlineTranscribe', player: 'player'};
  for (const [id, key] of Object.entries(settingsKeys)) {
    $('#' + id).onchange = () => action('Saving setting…', async () => {
      const {settings = {}} = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({settings: {...settings, [key]: $('#' + id).checked}});
      status('Setting saved. Open Instagram to see the change.');
    });
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.session) display(changes.session.newValue);
    if (changes.posts) $('#stored-count').textContent = String(changes.posts.newValue?.length || 0);
  });
  document.documentElement.dataset.copyfeedPopupReady = 'true';
  controls();
  void action('Connecting to Copyfeed…', connect);
})();
