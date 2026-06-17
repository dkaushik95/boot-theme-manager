const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const execPromise = util.promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true,
    title: "Boot Theme Manager"
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Helper to run pkexec commands, preserving display variables for Wayland/X11
async function runPkexec(command) {
  // pkexec strips environment variables for security.
  // We must explicitly pass DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR, and XAUTHORITY for GUI tools to work.
  const display = process.env.DISPLAY ? `DISPLAY=${process.env.DISPLAY}` : '';
  const waylandDisplay = process.env.WAYLAND_DISPLAY ? `WAYLAND_DISPLAY=${process.env.WAYLAND_DISPLAY}` : '';
  const xdgRuntimeDir = process.env.XDG_RUNTIME_DIR ? `XDG_RUNTIME_DIR=${process.env.XDG_RUNTIME_DIR}` : '';
  const xauthority = process.env.XAUTHORITY ? `XAUTHORITY=${process.env.XAUTHORITY}` : '';
  
  const envVars = [display, waylandDisplay, xdgRuntimeDir, xauthority].filter(Boolean).join(' ');
  const fullCommand = `pkexec env ${envVars} ${command}`;
  
  console.log(`Running: ${fullCommand}`);
  try {
    const { stdout, stderr } = await execPromise(fullCommand);
    console.log(`Success: stdout: ${stdout}, stderr: ${stderr}`);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// IPC Handlers
ipcMain.handle('get-plymouth-themes', async () => {
  try {
    const { stdout } = await execPromise('plymouth-set-default-theme --list');
    return stdout.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('get-current-plymouth-theme', async () => {
  try {
    const { stdout } = await execPromise('plymouth-set-default-theme');
    return stdout.trim();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('preview-plymouth-theme', async (event, theme) => {
  // To preview, we need to apply it temporarily, show splash, then kill it
  return await runPkexec(`sh -c "plymouth-set-default-theme ${theme} && plymouthd && plymouth --show-splash && sleep 8 && plymouth quit"`);
});

ipcMain.handle('apply-plymouth-theme', async (event, theme) => {
  return await runPkexec(`plymouth-set-default-theme -R ${theme}`);
});

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
    ]
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle('apply-limine-splash', async (event, filePath) => {
  // Limine needs it in /boot. We'll copy the file to /boot/limine-splash.png
  // and ensure limine.conf points to it (default behavior).
  return await runPkexec(`sh -c "cp '${filePath}' /boot/limine-splash.png && chmod 700 /boot/limine-splash.png"`);
});

ipcMain.handle('copy-limine-splash-to-tmp', async () => {
  const tmpPath = path.join(app.getPath('temp'), 'current-limine-splash.png');
  const res = await runPkexec(`sh -c "cp /boot/limine-splash.png '${tmpPath}' && chmod 644 '${tmpPath}'"`);
  if (res.success) {
      return tmpPath;
  }
  return null;
});
