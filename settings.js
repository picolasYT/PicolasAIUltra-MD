import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'

// *──────────────────────────────*
// OWNERS — DUEÑOS DEL BOT
// *──────────────────────────────*

global.owner = [
  ['5492994587598', 'Picolas', true],       // TU NÚMERO
  ['51951013256', 'Kulo', true]           // segundo owner
]

// *──────────────────────────────*
// CONFIGURACIONES BÁSICAS
// *──────────────────────────────*

global.mods = []
global.prems = []
global.packname = ``

// Información interna del bot
global.author = '{\n "bot": {\n   "name": "PicolasAIUltra-MD",\n     "author": "Picolas",\n   "status_bot": "active"\n }\n}'

// Mensajes base
global.wait = '🐢 *Aguarde un momento... ฅ^•ﻌ•^ฅ*'
global.botname = '☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆'

// MARCA PRINCIPAL
global.textbot = `> [ ✰ ] Powered By PicolasAIUltra-MD`

global.listo = '*Aquí tiene ฅ^•ﻌ•^ฅ*'

// Nombre del canal
global.namechannel = '【 ☆ PicolasAIUltra-MD – Canal Oficial ☆ 】'

// *──────────────────────────────*
// IMÁGENES PARA BOTONES / CATÁLOGOS
// *──────────────────────────────*

global.catalogo = fs.readFileSync('./storage/img/catalogo.png')
global.miniurl = fs.readFileSync('./storage/img/miniurl.png')

// *──────────────────────────────*
// GRUPOS Y CANALES OFICIALES
// *──────────────────────────────*

global.group = 'https://chat.whatsapp.com/CIG79cVl9IwKJPl5ERFtgu?mode=wwt'   // Grupo principal
global.group2 = 'https://chat.whatsapp.com/CIG79cVl9IwKJPl5ERFtgu?mode=wwt'  // Secundario (opcional)
global.group3 = 'https://chat.whatsapp.com/CIG79cVl9IwKJPl5ERFtgu?mode=wwt'  // Soporte

global.canal = 'https://whatsapp.com/channel/0029VbBY6fkAzNbo3NqVBN33'       // Canal oficial Picolas

// *──────────────────────────────*
// ESTILO DE MENSAJES
// *──────────────────────────────*

global.estilo = { 
  key: {  
    fromMe: false,
    participant: `0@s.whatsapp.net`
  }, 
  message: { 
    orderMessage: { 
      itemCount : -999999, 
      status: 1, 
      surface : 1, 
      message: global.botname,
      orderTitle: 'PicolasAIUltra-MD',
      thumbnail: global.catalogo,
      sellerJid: '0@s.whatsapp.net'
    }
  }
}

// *──────────────────────────────*
// LIBRERÍAS GLOBALES
// *──────────────────────────────*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios

// *──────────────────────────────*
// OTROS AJUSTES
// *──────────────────────────────*

global.multiplier = 69 
global.maxwarn = '2'

// *──────────────────────────────*
// AUTO-RECARGA DEL ARCHIVO
// *──────────────────────────────*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
