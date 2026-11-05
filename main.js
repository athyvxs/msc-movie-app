const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let watchlistWindow;

// Window 1: Movie Discovery
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile("renderer/index.html");
}

// Window 2: My Watchlist
function createWatchlistWindow() {
    if (watchlistWindow && !watchlistWindow.isDestroyed()) {
        watchlistWindow.focus();
        return;
    }

    watchlistWindow = new BrowserWindow({
        width: 850,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    watchlistWindow.loadFile("renderer/watchlist.html");

    watchlistWindow.on("closed", () => {
        watchlistWindow = null;
    });
}

// Start application
app.whenReady().then(() => {
    createMainWindow();

    ipcMain.on("open-watchlist", () => {
        createWatchlistWindow();
    });

    ipcMain.on("open-discovery", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.focus();
        } else {
            createMainWindow();
        }
    });
});

// Close app when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
