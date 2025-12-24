const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti", "annonce"],
    version: "1.7",
    author: "NTKhang (Stylisé par Gemini)",
    countDown: 5,
    role: 2, // Réservé aux administrateurs (Master Charbel)
    description: {
      en: "Diffuse un message de Master Charbel à tous les secteurs."
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
      missingMessage: "👁️ 𝑲𝒂𝒏𝒆𝒌𝒊 : L'ordre est vide. Que dois-je transmettre aux autres goules ?",
      notification: "╭─────── ☕ ───────╮\n   📢 𝐎𝐑𝐃𝐑𝐄 𝐃𝐄 𝐋'𝐀𝐍𝐓𝐄𝐈𝐊𝐔 👁️\n╰─────── ☕ ───────╯\n\n📜 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞 𝐌𝐚𝐬𝐭𝐞𝐫 𝐂𝐡𝐚𝐫𝐛𝐞𝐥 :\n━━━━━━━━━━━━━━━━━━",
      sendingNotification: "⏳ 𝑻𝒓𝒂𝒏𝒔𝒎𝒊𝒔𝒔𝒊𝒐𝒏 𝒅𝒆 𝒍'𝒐𝒓𝒅𝒓𝒆 𝒗𝒆𝒓𝒔 %1 𝒔𝒆𝒄𝒕𝒆𝒖𝒓𝒔...",
      sentNotification: "✅ 𝑳'𝒐𝒓𝒅𝒓𝒆 𝒂 𝒆́𝒕𝒆́ 𝒅𝒊𝒇𝒇𝒖𝒔𝒆́ 𝒂𝒗𝒆𝒄 𝒔𝒖𝒄𝒄𝒆̀𝒔.",
      errorSendingNotification: "❌ 𝑬́𝒄𝒉𝒆𝒄 𝒅𝒆 𝒍𝒂 𝒕𝒓𝒂𝒏𝒔𝒎𝒊𝒔𝒔𝒊𝒐𝒏 :\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0]) return message.reply(getLang("missingMessage"));

    // --- Design du message reçu par les groupes ---
    const formSend = {
      body: `${getLang("notification")}\n\n『 ${args.join(" ")} 』\n\n━━━━━━━━━━━━━━━━━━\n☕ 𝑷𝒐𝒖𝒓 𝒄𝒐𝒏𝒕𝒂𝒄𝒕𝒆𝒓 𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍, 𝒕𝒂𝒑𝒆𝒛 : -𝒄𝒂𝒍𝒍𝒂𝒅 + 𝒎𝒆𝒔𝒔𝒂𝒈𝒆\n╰━━━━━━━ 🩸 ━━━❖`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    
    // Message de confirmation au départ
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

    // --- Message final de résultat ---
    let resultMsg = "";
    if (sendSucces > 0)
        resultMsg += `✅ 𝑲𝒂𝒏𝒆𝒌𝒊 : 𝑻𝒓𝒂𝒏𝒔𝒎𝒊𝒔𝒔𝒊𝒐𝒏 𝒓𝒆́𝒖𝒔𝒔𝒊𝒆 𝒑𝒐𝒖𝒓 ${sendSucces} 𝒈𝒓𝒐𝒖𝒑𝒆𝒔.\n`;
    if (sendError.length > 0)
        resultMsg += `⚠️ 𝑬𝒓𝒓𝒆𝒖𝒓 𝒅𝒆 𝒄𝒐𝒏𝒏𝒆𝒙𝒊𝒐𝒏 𝒅𝒂𝒏𝒔 ${sendError.reduce((a, b) => a + b.threadIDs.length, 0)} 𝒔𝒆𝒄𝒕𝒆𝒖𝒓𝒔.`;
    
    message.reply(resultMsg);
  }
};
