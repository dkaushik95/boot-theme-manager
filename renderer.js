let selectedLimineImage = null;

function switchTab(tab) {
    document.getElementById('section-plymouth').style.display = 'none';
    document.getElementById('section-limine').style.display = 'none';
    document.getElementById('tab-plymouth').classList.remove('active-tab');
    document.getElementById('tab-limine').classList.remove('active-tab');

    document.getElementById(`section-${tab}`).style.display = 'block';
    document.getElementById(`tab-${tab}`).classList.add('active-tab');

    if (tab === 'limine') {
        loadCurrentLimineSplash();
    }
}

function showLoading(text) {
    document.getElementById('loading-text').innerText = text;
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

async function loadPlymouthThemes() {
    const themes = await window.api.getPlymouthThemes();
    const currentTheme = await window.api.getCurrentPlymouthTheme();
    
    const select = document.getElementById('theme-select');
    select.innerHTML = '';
    
    if (themes.error) {
        select.innerHTML = `<option>Error loading themes</option>`;
        return;
    }

    themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.innerText = theme + (theme === currentTheme ? ' (Current)' : '');
        if (theme === currentTheme) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function previewPlymouth() {
    const theme = document.getElementById('theme-select').value;
    showLoading(`Previewing ${theme}...\nA window should appear shortly. It will close in 8 seconds.`);
    
    const res = await window.api.previewPlymouthTheme(theme);
    hideLoading();
    
    const status = document.getElementById('plymouth-status');
    status.style.display = 'block';
    if (!res.success) {
        status.innerHTML = `<strong>Error:</strong> ${res.error}`;
        status.style.borderColor = "var(--form-element-invalid-border-color)";
    } else {
        status.innerHTML = `<strong>Success:</strong> Preview finished.`;
        status.style.borderColor = "var(--form-element-valid-border-color)";
    }
}

async function applyPlymouth() {
    const theme = document.getElementById('theme-select').value;
    showLoading(`Applying ${theme}...\nRebuilding initramfs, this may take a minute or two.`);
    
    const res = await window.api.applyPlymouthTheme(theme);
    hideLoading();

    const status = document.getElementById('plymouth-status');
    status.style.display = 'block';
    if (!res.success) {
        status.innerHTML = `<strong>Error:</strong> <pre>${res.error || res.stderr}</pre>`;
        status.style.borderColor = "var(--form-element-invalid-border-color)";
    } else {
        status.innerHTML = `<strong>Success:</strong> Theme applied and initramfs rebuilt.`;
        status.style.borderColor = "var(--form-element-valid-border-color)";
        loadPlymouthThemes(); // Refresh current status
    }
}

async function loadCurrentLimineSplash() {
    const tmpPath = await window.api.copyLimineSplashToTmp();
    const img = document.getElementById('current-splash');
    if (tmpPath) {
        // Use a timestamp to prevent caching
        img.src = `file://${tmpPath}?t=${new Date().getTime()}`;
    } else {
        img.alt = "No current splash image found or permission denied.";
    }
}

async function selectNewSplash() {
    const filePath = await window.api.selectImage();
    if (filePath) {
        selectedLimineImage = filePath;
        document.getElementById('selected-file-path').innerText = `Selected: ${filePath}`;
        document.getElementById('apply-limine-btn').disabled = false;
        
        // Update preview locally
        document.getElementById('current-splash').src = `file://${filePath}`;
    }
}

async function applyLimine() {
    if (!selectedLimineImage) return;

    showLoading("Applying new Limine splash image...");
    const res = await window.api.applyLimineSplash(selectedLimineImage);
    hideLoading();

    const status = document.getElementById('limine-status');
    status.style.display = 'block';
    if (!res.success) {
        status.innerHTML = `<strong>Error:</strong> ${res.error || res.stderr}`;
        status.style.borderColor = "var(--form-element-invalid-border-color)";
    } else {
        status.innerHTML = `<strong>Success:</strong> Splash image updated in /boot!`;
        status.style.borderColor = "var(--form-element-valid-border-color)";
        selectedLimineImage = null;
        document.getElementById('apply-limine-btn').disabled = true;
        document.getElementById('selected-file-path').innerText = '';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlymouthThemes();
});