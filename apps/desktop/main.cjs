const { app, BrowserWindow, shell } = require("electron");

const APP_URL = "https://verxl.com/chat?app=1";
const ALLOWED_ORIGIN = "https://verxl.com";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: "#070a0f",
    title: "Verxl",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadURL(APP_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (new URL(url).origin === ALLOWED_ORIGIN) return { action: "allow" };
    } catch {}
    void shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    try {
      if (new URL(url).origin === ALLOWED_ORIGIN) return;
    } catch {}
    event.preventDefault();
    void shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
