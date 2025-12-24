module.exports = {
  config: {
    name: "profil",
    aliases: ["rank", "goule", "me"],
    version: "2.1",
    author: "Master Charbel (Style par Gemini)",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: "Affiche ton identité de Goule.",
    guide: { en: "{pn} | {pn} @mention" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    
    // Déterminer l'ID de la cible (soit mentionné, soit l'auteur du message)
    const targetID = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : (args.length > 0 ? args[0] : senderID);

    try {
      const userData = await usersData.get(targetID);
      const name = userData.name;
      const money = userData.money || 0;
      
      // --- Système de Rang de Goule ---
      let rank, color;
      if (money < 5000) { rank = "𝐂 (𝑵𝒐𝒗𝒊𝒄𝒆)"; color = "⚪"; }
      else if (money < 20000) { rank = "𝐁 (𝑯𝒂𝒃𝒊𝒕𝒖𝒆́)"; color = "🔵"; }
      else if (money < 50000) { rank = "𝐀 (𝑫𝒂𝒏𝒈𝒆𝒓𝒆𝒖𝒙)"; color = "🟡"; }
      else if (money < 150000) { rank = "𝐒 (𝑮𝒐𝒖𝒍𝒆 𝒅'𝒆́𝒍𝒊𝒕𝒆)"; color = "🟠"; }
      else if (money < 500000) { rank = "𝐒𝐒 (𝑴𝒆𝒏𝒂𝒄𝒆 𝑴𝒂𝒋𝒆𝒖𝒓𝒆)"; color = "🔴"; }
      else { rank = "𝐒𝐒𝐒 (𝑬𝒙𝒕𝒆𝒙𝒎𝒊𝒏𝒂𝒕𝒆𝒖𝒓)"; color = "⚫"; }

      const msg = 
        `╭─────── ☕ ───────╮\n` +
        `   👁️  𝐃𝐎𝐒𝐒𝐈𝐄𝐑 𝐆𝐎𝐔𝐋𝐄  👁️\n` +
        `╰─────── ☕ ───────╯\n\n` +
        `👤 𝐍𝐨𝐦 : ${name}\n` +
        `🆔 𝐈𝐃 : ${targetID}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝐑𝐚𝐧𝐠 : ${color} ${rank}\n` +
        `💰 𝐁𝐮𝐭𝐢𝐧 : ${money.toLocaleString()} 𝒀𝒆𝒏𝒔\n` +
        `☕ 𝐒𝐭𝐚𝒕𝒖𝒕 : 𝑨𝒄𝒕𝒊𝒇 𝒂̀ 𝒍'𝑨𝒏𝒕𝒆𝒊𝒌𝒖\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `« 𝑱𝒆 𝒏𝒆 𝒔𝒖𝒊𝒔 𝒑𝒂𝒔 𝒄𝒆𝒍𝒖𝒊 𝒒𝒖𝒊 𝒂 𝒕𝒐𝒓𝒕. 𝑪𝒆 𝒒𝒖𝒊 𝒂 𝒕𝒐𝒓𝒕... 𝒄'𝒆𝒔𝒕 𝒄𝒆 𝒎𝒐𝒏𝒅𝒆 ! »\n\n` +
        `📜 𝑫𝒐𝒔𝒔𝒊𝒆𝒓 𝒂𝒑𝒑𝒓𝒐𝒖𝒗𝒆́ 𝒑𝒂𝒓 𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍.\n` +
        `╰━━━━━━━ 🩸 ━━━❖`;

      // Envoi de l'image de profil en pièce jointe si possible
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      api.setMessageReaction("👁️", messageID, () => {}, true);
      
      return api.sendMessage({
        body: msg,
        mentions: [{ tag: name, id: targetID }]
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Impossible de lire les fichiers du CCG sur ce sujet.", threadID);
    }
  }
};
