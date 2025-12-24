const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti", "annonce"],
    version: "1.7",
    author: "NTKhang (Adapté par Gemini)",
    countDown: 5,
    role: 2, // Réservé à Master Charbel / Admin
    description: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Diffuse un ordre de l'Anteiku à tous les groupes"
    },
    category: "owner",
    guide: {
      en: "{pn} <votre message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "👁️ L'ordre est vide. Que dois-je transmettre aux autres goules ?",
      notification: "╭─────── ☕ ───────╮\n   📢 𝐎𝐑𝐃𝐑𝐄 𝐃𝐄 𝐋'𝐀𝐍𝐓𝐄𝐈𝐊𝐔 👁️\n╰─────── ☕ ───────╯\n\n📜 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞 𝐌𝐚𝐬𝐭𝐞𝐫 𝐂𝐡𝐚𝐫𝐛𝐞𝐥 :\n━━━━━━━━━━━━━━━━━━",
      sendingNotification: "⏳ Transmission de l'ordre en cours vers %1 secteurs (groupes)...",
      sentNotification: "✅ L'ordre a été diffusé avec succès dans les secteurs.",
      errorSendingNotification: "❌ Échec de la transmission dans certains secteurs :\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0]) return message.reply(getLang("missingMessage"));

    // Design thématique du message diffusé
    const formSend = {
      body: `${getLang("notification")}\n\n『 ${args.join(" ")} 』\n\n━━━━━━━━━━━━━━━━━━\n☕ 𝑷𝒐𝒖𝒓 𝒓𝒆́𝒑𝒐𝒏𝒅𝒓𝒆 𝒂̀ 𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍, 𝒖𝒕𝒊𝒍𝒊𝒔𝒆𝒛 𝒍𝒂 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒆 𝒄𝒂𝒍𝒍𝒂𝒅.`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSucces = 0;
    const sendError = [];
    const wattingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        wattingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      }
      catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of wattingSend) {
      try {
        await sended.pending;
        sendSucces++;
      }
      catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({
            threadIDs: [sended.threadID],
            errorDescription
          });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    let msg = "";
    if (sendSucces > 0)
      msg += `✅ Transmission réussie pour ${sendSucces} groupes.\n`;
    if (sendError.length > 0)
      msg += `⚠️ Erreur pour ${sendError.reduce((a, b) => a + b.threadIDs.length, 0)} groupes.`;
    
    message.reply(msg);
  }
};
