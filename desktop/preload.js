const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('autoloc', {
  isDesktop: true,
  // Génère un PDF de la facture et l'ouvre dans le lecteur PDF par défaut
  printInvoicePdf: (payload) => ipcRenderer.invoke('print-invoice-pdf', payload),
});
