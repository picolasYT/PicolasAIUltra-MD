const {
    DisconnectReason,
    useMultiFileAuthState,
    MessageRetryMap,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys')

import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import fs from "fs"
import pino from 'pino'
import * as ws from 'ws'
const { CONNECTING } = ws
import { Boom } from '@hapi/boom'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn: star, args, usedPrefix, command, isOwner }) => {

    // 🔥 FIX COMPLETO → _conn NO EXISTE
    let parent = args[0] && args[0] == 'plz' ? global.conn : global.conn

    if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == global.conn.user.jid)) {
        return m.reply(
            `Este comando solo puede usarse en el bot principal\n\n*Bot:* wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`
        )
    }

    async function serbot() {

        let authFolderB = m.sender.split('@')[0]

        if (!fs.existsSync("./serbot/" + authFolderB)) {
            fs.mkdirSync("./serbot/" + authFolderB, { recursive: true })
        }

        // Si colocan creds en base64
        if (args[0]) {
            fs.writeFileSync(
                "./serbot/" + authFolderB + "/creds.json",
                JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')
            )
        }

        const { state, saveState, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`)
        const msgRetryCounterCache = new NodeCache()
        const msgRetryCounterMap = MessageRetryMap
        const { version } = await fetchLatestBaileysVersion()
        let phoneNumber = m.sender.split('@')[0]

        const methodCode = true // siempre usa code en bots multi-device
        const MethodMobile = false

        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            mobile: MethodMobile,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            msgRetryCounterCache,
            msgRetryCounterMap,
            version
        }

        let conn = makeWASocket(connectionOptions)

        // 🔥 Solicitar código de vinculación
        if (methodCode && !conn.authState.creds.registered) {

            let cleaned = phoneNumber.replace(/[^0-9]/g, '')

            setTimeout(async () => {

                let codeBot = await conn.requestPairingCode(cleaned)
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot

                let txt = `✨ *Vincula tu cuenta usando el código*\n\n`
                txt += `Sigue estos pasos:\n`
                txt += `• *Menú → Dispositivos vinculados*\n`
                txt += `• *Vincular nuevo dispositivo*\n`
                txt += `• *Usar número telefónico*\n\n`
                txt += `> Código válido solo para el número que lo solicitó\n`
                txt += `> Marca: ☆ {ℙ𝕚𝕔𝕠𝕝𝕒𝕤𝔸𝕀𝐮𝐥𝐭𝐫𝐚-𝐌𝐃} ☆`

                star.reply(m.chat, txt, m)
                star.reply(m.chat, codeBot, m)

            }, 3000)
        }

        // 🔥 Manejo de eventos
        conn.isInit = false
        let isInit = true

        async function connectionUpdate(update) {

            const { connection, lastDisconnect, isNewLogin } = update

            if (isNewLogin) conn.isInit = true

            const code = lastDisconnect?.error?.output?.statusCode

            if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {

                let i = global.conns.indexOf(conn)
                if (i >= 0) {
                    global.conns.splice(i, 1)
                }

                parent.sendMessage(m.chat, { text: "❌ Conexión del sub-bot perdida" })
            }

            if (connection === 'open') {
                conn.isInit = true
                global.conns.push(conn)

                await parent.reply(
                    m.chat,
                    `✅ *Sub Bot conectado exitosamente*\n\n` +
                    `Este sub bot se apagará si el bot principal se reinicia.\n\n` +
                    `Canal oficial:\n${global.canal}`,
                    m
                )

                if (!args[0]) {
                    await parent.reply(
                        conn.user.jid,
                        `Usa este comando para reconectar sin código:\n\n${usedPrefix}${command} ` +
                        Buffer.from(fs.readFileSync("./serbot/" + authFolderB + "/creds.json"), "utf-8").toString("base64"),
                        m
                    )
                }
            }
        }

        // Eventos
        conn.ev.on('connection.update', connectionUpdate)
        conn.ev.on('creds.update', saveCreds)
    }

    serbot()
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code', 'codebot']
handler.rowner = true

export default handler

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
