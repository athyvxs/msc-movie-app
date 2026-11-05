const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    openWatchlist: () => ipcRenderer.send("open-watchlist"),
    openDiscovery: () => ipcRenderer.send("open-discovery")
});
