let tabCount = 0;
let activeTabId = null;

function createTab(url = 'https://www.google.com') {
    tabCount++;
    const id = tabCount;

    // 1. Luo välilehtipainike
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = `tab-${id}`;
    tab.setAttribute('data-id', id);
    tab.innerHTML = `
        <span class="tab-title">Ladataan...</span>
        <span class="close-btn" onclick="closeTab(event, ${id})">×</span>
    `;
    tab.onclick = () => activateTab(id);
    document.getElementById('tabs-container').appendChild(tab);

    // 2. Luo varsinainen selainnäkymä (webview)
    const webview = document.createElement('webview');
    webview.id = `webview-${id}`;
    webview.src = url;
    webview.className = 'tab-content';
    // Nämä on tärkeitä main.js:n asetusten kanssa:
    webview.setAttribute('nodeintegration', '');
    webview.setAttribute('webviewtag', '');
    
    document.getElementById('webview-container').appendChild(webview);

    // 3. TAPAHTUMAT: Otsikon päivitys ja URL-palkki
    webview.addEventListener('page-title-updated', (e) => {
        tab.querySelector('.tab-title').innerText = e.title.substring(0, 15) + (e.title.length > 15 ? '...' : '');
    });

    webview.addEventListener('did-start-loading', () => {
        tab.querySelector('.tab-title').innerText = 'Ladataan...';
    });

    // Aktivoidaan uusi välilehti heti
    activateTab(id);
}

function activateTab(id) {
    activeTabId = id;

    // Poista vanhat aktiivisuudet
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('webview').forEach(wv => wv.style.display = 'none');

    // Aseta uusi aktiiviseksi
    const currentTab = document.getElementById(`tab-${id}`);
    const currentWv = document.getElementById(`webview-${id}`);

    if (currentTab && currentWv) {
        currentTab.classList.add('active');
        currentWv.style.display = 'flex';
        // Päivitä osoitepalkki vastaamaan tätä välilehteä
        document.getElementById('url-input').value = currentWv.getURL();
    }
}

function closeTab(e, id) {
    e.stopPropagation(); // 🛑 STOPPAA DUPLIKAATION (ei klikkaa alla olevaa tabia)
    
    const tab = document.getElementById(`tab-${id}`);
    const wv = document.getElementById(`webview-${id}`);

    tab.remove();
    wv.remove();

    // Jos suljettiin aktiivinen välilehti, hypätään viimeisimpään jäljellä olevaan
    if (activeTabId === id) {
        const remaining = document.querySelectorAll('.tab');
        if (remaining.length > 0) {
            const lastId = remaining[remaining.length - 1].getAttribute('data-id');
            activateTab(parseInt(lastId));
        }
    }
}
