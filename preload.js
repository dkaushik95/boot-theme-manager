const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getPlymouthThemes: () => ipcRenderer.invoke('get-plymouth-themes'),
    getCurrentPlymouthTheme: () => ipcRenderer.invoke('get-current-plymouth-theme'),
    previewPlymouthTheme: (theme) => ipcRenderer.invoke('preview-plymouth-theme', theme),
    applyPlymouthTheme: (theme) => ipcRenderer.invoke('apply-plymouth-theme', theme),
    selectImage: () => ipcRenderer.invoke('select-image'),
    applyLimineSplash: (filePath) => ipcRenderer.invoke('apply-limine-splash', filePath),
    copyLimineSplashToTmp: () => ipcRenderer.invoke('copy-limine-splash-to-tmp')
});
