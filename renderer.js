const { ipcRenderer } = require('electron');
const os = require('os')

document.getElementById('baixarBtn').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;

    if (!userId) {
        alert('Por favor, insira o ID do Usuário!');
        return;
    }

    document.getElementById('logContainer').innerHTML += 'Baixando imagens...<br>';

    const loadUser = os.userInfo().username;

    ipcRenderer.invoke('baixar-imagens', userId)
        .then(response => {
            if (response.success) {
                document.getElementById('logContainer').innerHTML += `Imagens baixadas com sucesso!<br>Avatar: ${response.avatarUrl}<br>Banner: ${response.bannerUrl || 'Não disponível'}<br>`;
                document.getElementById('logContainer').innerHTML += `Imagens disponíveis em "C:\\Users\\${loadUser}\\Pictures\\Discord PICS"<br>`;
            } else {
                document.getElementById('logContainer').innerText = `Erro: ${response.error}`;
            }
        });
});