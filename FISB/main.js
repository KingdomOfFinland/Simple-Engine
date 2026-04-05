// --- UUDET NÄPPÄINKOMENNOT (DevTools & View Source) ---

// 1. Kuunnellaan komentoja itse selaimen UI-alueella
window.addEventListener('keydown', (e) => {
    handleGlobalKeys(e, getCurrentWebview());
});

function handleGlobalKeys(e, wv) {
    if (!wv) return;

    // F12 -> Avaa/Sulje Inspect Element
    if (e.key === 'F12') {
        if (wv.isDevToolsOpened()) wv.closeDevTools();
        else wv.openDevTools();
    }

    // Ctrl + Shift + I -> Sama kuin F12
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        wv.openDevTools();
    }

    // Ctrl + U -> View Source (Avaa uuden välilehden view-source: etuliitteellä)
    if (e.ctrlKey && e.key === 'u' || e.ctrlKey && e.key === 'U') {
        const currentUrl = wv.getURL();
        if (currentUrl.startsWith('view-source:')) return; // Estetään looppi
        createNewTab('view-source:' + currentUrl);
    }
}

// --- PÄIVITETTY createNewTab (Lisätty webview-kohtaiset kuuntelijat) ---

function createNewTab(url = "https://www.google.com") {
    tabCount++;
    const id = tabCount;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = `btn-wv-${id}`;
    tab.innerHTML = `<span class="tab-title" id="title-wv-${id}">Ladataan...</span><span class="close-btn" onclick="closeTab(event, ${id})">×</span>`;
    tab.onclick = () => switchTab(id);
    document.getElementById('tabs-container').appendChild(tab);

    const wv = document.createElement('webview');
    wv.id = `wv-${id}`;
    wv.src = url;
    wv.setAttribute('useragent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    
    // TÄRKEÄ: Sallitaan koodin haku view-sourcea varten
    wv.setAttribute('nodeintegration', ''); 

    // Päivitetään otsikko
    wv.addEventListener('page-title-updated', (e) => {
        const titleEl = document.getElementById(`title-wv-${id}`);
        if(titleEl) titleEl.innerText = e.title.substring(0, 18);
    });

    // Päivitetään URL-palkki
    wv.addEventListener('did-navigate', (e) => {
        if (activeTabId === id) document.getElementById('url-input').value = e.url;
        historyData.push({url: e.url});
        localStorage.setItem('fisb_history', JSON.stringify(historyData.slice(-30)));
    });

    // 🚀 LISÄTTY: Kuunnellaan näppäimiä myös webview'n SISÄLLÄ
    wv.addEventListener('keydown', (e) => {
        handleGlobalKeys(e, wv);
    });

    document.getElementById('content-area').appendChild(wv);
    switchTab(id);
}

// --- LOPUT FUNKTIOT (Samat kuin aiemmin) ---
function switchTab(id) {
    activeTabId = id;
    document.querySelectorAll('webview, .tab').forEach(el => el.classList.remove('active'));
    const currentWv = document.getElementById(`wv-${id}`);
    const currentBtn = document.getElementById(`btn-wv-${id}`);
    if (currentWv && currentBtn) {
        currentWv.classList.add('active');
        currentBtn.classList.add('active');
        try { document.getElementById('url-input').value = currentWv.getURL(); } catch(err) {}
    }
}

function closeTab(e, id) {
    e.stopPropagation();
    document.getElementById(`btn-wv-${id}`)?.remove();
    document.getElementById(`wv-${id}`)?.remove();
    const rem = document.querySelectorAll('.tab');
    if (rem.length > 0) {
        const lastId = rem[rem.length - 1].id.replace('btn-wv-', '');
        switchTab(parseInt(lastId));
    } else {
        createNewTab();
    }
}

function handleUrl(e) {
    if (e.key === 'Enter') {
        let val = e.target.value;
        if (!val.includes('.') && !val.startsWith('http')) {
            val = 'https://www.google.com/search?q=' + encodeURIComponent(val);
        } else if (!val.startsWith('http')) {
            val = 'https://' + val;
        }
        getCurrentWebview().src = val;
    }
}

function getCurrentWebview() { return document.getElementById(`wv-${activeTabId}`); }

// ... (toggleMenu, setTheme, setLanguage pysyvät samoina)
