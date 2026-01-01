const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "𝑳'𝒂𝒏𝒕𝒆𝒊𝒌𝒖", // Le nom officiel est maintenant L'anteiku
    aliases: ["join", "gongc", "botgc", "repaire"],
    version: "1.3",
    author: "AceGun (Stylisé par Gemini)",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "𝑹𝒆𝒋𝒐𝒊𝒏𝒅𝒓𝒆 𝒍𝒆 𝒄𝒂𝒇𝒆́ 𝒅𝒆𝒔 𝑮𝒐𝒖𝒍𝒆𝒔"
    },
    longDescription: {
      en: "Rejoins le groupe officiel de Master Charbel sur Messenger."
    },
    category: "chat box",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const targetGC = "1398432381728001";

    try {
      const threadInfo = await api.getThreadInfo(targetGC);
      const participants = threadInfo.participantIDs;

      if (participants.includes(senderID)) {
        const msgAlready = 
          `╭─────── ☕ ───────╮\n` +
          `   ⚠️  𝐀𝐂𝐂𝐄̀𝐒 𝐃𝐄́𝐉𝐀̀ 𝐕𝐀𝐋𝐈𝐃𝐄́  👁️\n` +
          `╰─────── ☕ ───────╯\n\n` +
          `« 𝑻𝒖 𝒇𝒂𝒊𝒔 𝒅𝒆́𝒋𝒂̀ 𝒑𝒂𝒓𝒕𝒊𝒆 𝒅𝒆 𝒏𝒐𝒕𝒓𝒆 𝒄𝒆𝒓𝒄𝒍𝒆. »\n\n` +
          `🆔 **𝐒𝐭𝐚𝐭𝐮𝐭** : 𝑴𝒆𝒎𝒃𝒓𝒆 𝒂𝒄𝒕𝒊𝒇\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `👁️ 𝑲𝒂𝒏𝒆𝒌𝒊 : Tu es déjà dans les archives de ce secteur.\n` +
          `╰━━━━━━━ 🩸 ━━━❖`;

        api.setMessageReaction("⚠️", messageID, () => {}, true);
        return api.sendMessage(msgAlready, threadID, messageID);
      } else {
        await api.addUserToGroup(senderID, targetGC);
        
        const msgSuccess = 
          `╭─────── ☕ ───────╮\n` +
          `   ✅  𝐈𝐍𝐕𝐈𝐓𝐀𝐓𝐈𝐎𝐍 𝐄𝐍𝐕𝐎𝐘𝐄́𝐄  👁️\n` +
          `╰─────── ☕ ───────╯\n\n` +
          `« 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 𝒅𝒂𝒏𝒔 𝒍'𝒐𝒎𝒃𝒓𝒆 𝒅𝒆 𝑻𝒐𝒌𝒚𝒐. »\n\n` +
          `📩 **𝐍𝐨𝐭𝐞** : Vérifie tes **Invitations** ou tes **Spams**.\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `🎭 𝑶𝒓𝒅𝒓𝒆 𝒆𝒙𝒆́𝒄𝒖𝒕𝒆́ 𝒑𝒂𝒓 𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍.\n` +
          `╰━━━━━━━ 👁️ ━━━❖`;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msgSuccess, threadID, messageID);
      }
    } catch (error) {
      const msgError = 
        `╭─────── ❌ ───────╮\n` +
        `   🛑  𝐄𝐑𝐑𝐄𝐔𝐑 𝐃𝐄 𝐒𝐂𝐀𝐍  🛑\n` +
        `╰─────── ❌ ───────╯\n\n` +
        `⚠️ 𝑰𝒎𝒑𝒐𝒔𝒔𝒊𝒃𝒍𝒆 𝒅𝒆 𝒕'𝒂𝒋𝒐𝒖𝒕𝒆𝒓 𝒑𝒐𝒖𝒓 𝒍'𝒊𝒏𝒔𝒕𝒂𝒏𝒕.\n` +
        `╰━━━━━━━ 💀 ━━━❖`;

      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(msgError, threadID, messageID);
    }
  }
};
