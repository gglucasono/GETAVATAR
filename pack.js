const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');

// System consts
const path = require('path');
const os = require("os");
const fs = require('fs');

// Function to create the Electron window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,  // Allows you to use Node.js in rendering
      contextIsolation: false // Important for interacting with the backend code
    }
  });

  // Load the UI HTML file
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Function to get user data and download images
ipcMain.handle('baixar-imagens', async (event, userId, botToken) => {
  try {
    const botToken = 'DISCORD-BOT-TOKEN-HERE'; 

    const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`
      }
    });

    const avatarHash = response.data.avatar;
    const bannerHash = response.data.banner;

    const avatarExtension = avatarHash?.startsWith('a_') ? 'gif' : 'png';
    const bannerExtension = bannerHash?.startsWith('a_') ? 'gif' : 'png';

    const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${avatarExtension}?size=2048`;
    const bannerUrl = bannerHash ? `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${bannerExtension}?size=2048` : null;

    const loadUser = os.userInfo().username;
    const pastaContent = path.join(`C:\\Users\\${loadUser}\\Pictures\\Discord PICS`);
    if (!fs.existsSync(pastaContent)) {
      fs.mkdirSync(pastaContent, { recursive: true });
    }

    const avatarCaminho = path.join(pastaContent, `Avatar de ${userId}.${avatarExtension}`);
    const bannerCaminho = bannerUrl ? path.join(pastaContent, `Banner de ${userId}.${bannerExtension}`) : null;

    const promessas = [baixarImagem(avatarUrl, avatarCaminho)];

    if (bannerUrl) {
      promessas.push(baixarImagem(bannerUrl, bannerCaminho));
    }

    await Promise.all(promessas);

    return { success: true, avatarUrl, bannerUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Function to download images
const baixarImagem = (url, caminhoLocal) => {
  return axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  }).then((response) => {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(caminhoLocal);
      response.data.pipe(fileStream);

      fileStream.on('finish', () => {
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(`Erro ao salvar o conteúdo em ${caminhoLocal}: ${err}`);
      });
    });
  });
};