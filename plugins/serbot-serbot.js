const { fetchLatestBaileysVersion, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys')
import qrcode from 'qrcode'
import fs from 'fs'
import pino from 'pino'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn: parentw, args, usedPrefix, command }) => {

  // 🔥 FIX: NUNCA usar conn sin declarar
  let main = await global.conn

  if (!((args[0] && args[0] == "plz") || main.user.jid == parentw.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal.\n\nwa.me/${main.user.jid.split('@')[0]}?text=${usedPrefix}serbot`)
  }

  async function serbot() {

    let serbotFolder = m.sender.split('@')[0]
    let folderSub = `./serbot/${serbotFolder}`

    if (!fs.existsSync(folderSub)) fs.mkdirSync(folderSub, { recursive: true })

    if (args[0]) {
      fs.writeFileSync(`${folderSub}/creds.json`, Buffer.from(args[0], 'base64').toString())
    }

    const { state, saveCreds } = await useMultiFileAuthState(folderSub)
    const { version } = await fetchLatestBaileysVersion()

    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false, // QR SOLO por WhatsApp
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: ["☆ {PicolasAIUltra-MD} ☆", "Chrome", "10.0"]
    }

    let conn = makeWASocket(connectionOptions)
    conn.isInit = false
    let isInit = true

    async function connectionUpdate(update) {

      const { connection, lastDisconnect, isNewLogin, qr } = update

      if (isNewLogin) conn.isInit = true

      // 📌 Mostrar QR en el chat
      if (qr) {

        let qrText = `*『 S U B - B O T  QR 』*\n\n`
        qrText += `📌 *Escanea este QR para convertirte en Sub Bot*\n\n`
        qrText += `1) Abrí WhatsApp\n`
        qrText += `2) Dispositivos vinculados\n`
        qrText += `3) Vincular dispositivo\n`
        qrText += `4) Escaneá este código\n\n`
        qrText += `⚠️ *Expira en 30 segundos*\n`
        qrText += `> Marca: ☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆`

        let qrImg = await qrcode.toBuffer(qr, { scale: 8 })
        let sent = await parentw.sendMessage(m.chat, { image: qrImg, caption: qrText }, { quoted: m })

        setTimeout(() => {
          try {
            parentw.sendMessage(m.chat, { delete: sent.key })
          } catch { }
        }, 30000)
      }

      // ❌ Error de desconexión
      const code = lastDisconnect?.error?.output?.statusCode

      if (code && code !== DisconnectReason.loggedOut && !conn?.ws?.socket) {
        let i = global.conns.indexOf(conn)
        if (i >= 0) global.conns.splice(i, 1)

        await parentw.sendMessage(m.chat, { text: "❌ Conexión del Sub Bot perdida." })
      }

      // 📌 Al conectarse
      if (connection === "open") {

        conn.isInit = true
        global.conns.push(conn)

        await parentw.sendMessage(
          m.chat,
          {
            text:
              `✅ *Sub Bot conectado exitosamente*\n\n` +
              `Este Sub-Bot se apagará si el Bot principal se reinicia.\n\n` +
              `📣 *Canal oficial*\n${global.canal}`
          },
          { quoted: m }
        )

        if (!args[0]) {
          await sleep(1500)
          await parentw.sendMessage(
            conn.user.jid,
            { text: `Para reconectar sin QR usa este comando:\n\n${usedPrefix}${command} ${Buffer.from(fs.readFileSync(folderSub + "/creds.json")).toString("base64")}` }
          )
        }
      }
    }

    // 📌 Timeout si nunca se escanea
    setTimeout(() => {
      if (!conn.user) {
        try { conn.ws.close() } catch { }
        conn.ev.removeAllListeners()
        fs.rmSync(folderSub, { recursive: true, force: true })
      }
    }, 30000)

    conn.ev.on("connection.update", connectionUpdate)
    conn.ev.on("creds.update", saveCreds)
  }

  serbot()
}

handler.help = ["serbot", "qrbot"]
handler.tags = ["serbot"]
handler.command = ['serbot', 'qrbot', 'jadibot', 'qr']

export default handler

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
