const bp = require('bedrock-protocol');
const fs = require('fs');
const readline = require('readline');

const proxies = fs.existsSync('proxy.txt')
  ? fs.readFileSync('proxy.txt', 'utf-8').trim().split('\n')
  : [];

function randName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 8; i++) name += chars[Math.floor(Math.random() * chars.length)];
  return name;
}

function randomChat(client) {
  const msgs = ['hi', 'halo', 'lag?', 'anjir', 'hahaha', 'test', 'wkwk'];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  client.queue('text', { type: 'chat', needs_translation: false, message: msg });
}

function createBot(ip, port, proxy) {
  const username = randName();

  const options = {
    host: ip,
    port: port,
    username,
    // authType bisa 'offline' (non-xbox) atau 'microsoft' (login akun asli)
    offline: true
  };

  if (proxy) {
    // proxy belum langsung support di bedrock-protocol,
    // biasanya harus lewat proxy eksternal (SOCKS5/HTTP tunneling) di layer RakNet
    console.log(`⚠️ Proxy ${proxy} di-skip (butuh wrapper khusus)`);
  }

  const client = bp.createClient(options);

  client.on('join', () => {
    console.log(`[+] ${username} berhasil join!`);
    // Chat random tiap 15-25 detik
    setInterval(() => {
      if (Math.random() < 0.5) randomChat(client);
    }, Math.random() * 10000 + 15000);
  });

  client.on('text', (packet) => {
    console.log(`💬 ${packet.source_name || 'Server'}: ${packet.message}`);
  });

  client.on('disconnect', (packet) => {
    console.log(`[-] ${username} disconnect: ${packet.message}`);
  });

  client.on('error', (err) => {
    console.log(`⚠️ Error ${username}:`, err.message);
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Server IP: ', ip => {
  rl.question('Port: ', port => {
    rl.question('Jumlah Bot: ', count => {
      for (let i = 0; i < parseInt(count); i++) {
        setTimeout(() => {
          const proxy = proxies.length ? proxies[i % proxies.length] : null;
          createBot(ip, parseInt(port), proxy);
        }, i * (Math.random() * 2000 + 1000));
      }
      rl.close();
    });
  });
});
