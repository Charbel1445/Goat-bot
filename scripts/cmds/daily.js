module.exports = {
  config: {
    name: "daily",
    aliases: ["recolte", "cafeine"],
    version: "2.0",
    author: "Master Charbel (Style par Gemini)",
    countDown: 10,
    role: 0,
    category: "économie",
    shortDescription: "Récupère ta dose de caféine quotidienne.",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, threadID, messageID } = event;
    const cooldownTime = 86400000; // 24 heures en millisecondes
    const reward = Math.floor(Math.random() * (1500 - 500 + 1)) + 500; // Entre 500 et 1500

    try {
      const userData = await usersData.get(senderID);
      const lastTime = userData.data.lastDaily || 0;
      const now = Date.now();

      if (now - lastTime < cooldownTime) {
        // --- Message de Cooldown (Attente) ---
        const timeLeft = cooldownTime - (now - lastTime);
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return api.sendMessage(
          `╭─────── ☕ ───────╮\n` +
          `   📢 𝐏𝐀𝐒 𝐒𝐈 𝐕𝐈𝐓𝐄... 👁️\n` +
          `╰─────── ☕ ───────╯\n\n` +
          `𝑻𝒆𝒔 𝒔𝒕𝒐𝒄𝒌𝒔 𝒅𝒆 𝒄𝒂𝒇𝒆́𝒊𝒏𝒆 𝒔𝒐𝒏𝒕 𝒆𝒏𝒄𝒐𝒓𝒆 𝒔𝒖𝒇𝒇𝒊𝒔𝒂𝒏𝒕𝒔.\n` +
          `𝑹𝒆𝒗𝒊𝒆𝒏𝒔 𝒅𝒂𝒏𝒔 [ ${hours}𝒉 ${minutes}𝒎 ] 𝒑𝒐𝒖𝒓 𝒖𝒏𝒆 𝒏𝒐𝒖𝒗𝒆𝒍𝒍𝒆 𝒓𝒂𝒔𝒕𝒊𝒐𝒏.\n\n` +
          `╰━━━━━━━ 🩸 ━━━❖`,
          threadID, messageID
        );
      }

      // --- Message de Succès (Récompense) ---
      const currentMoney = userData.money || 0;
      await usersData.set(senderID, {
        money: currentMoney + reward,
        data: { ...userData.data, lastDaily: now }
      });

      const msg = 
        `╭─────── ☕ ───────╮\n` +
        `   ☕ 𝐑𝐀𝐓𝐈𝐎𝐍 𝐃𝐄 𝐆𝐎𝐔𝐋𝐄 ☕\n` +
        `╰─────── ☕ ───────╯\n\n` +
        `« 𝑼𝒏𝒆 𝒈𝒐𝒖𝒍𝒆 𝒏𝒆 𝒑𝒆𝒖𝒕 𝒑𝒂𝒔 𝒔𝒖𝒓𝒗𝒊𝒗𝒓𝒆 𝒍'𝒆𝒔𝒕𝒐𝒎𝒂𝒄 𝒗𝒊𝒅𝒆. »\n\n` +
        `👤 𝐆𝐨𝐮𝐥𝐞 : ${userData.name}\n` +
        `📦 𝐁𝐮𝐭𝐢𝐧 : +${reward} 𝒀𝒆𝒏𝒔\n` +
        `☕ 𝐒𝐭𝐨𝐜𝐤 : 𝑪𝒂𝒇𝒆́𝒊𝒏𝒆 𝒓𝒆́𝒄𝒖𝒑𝒆́𝒓𝒆́𝒆\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍 𝒕'𝒂 𝒍𝒂𝒊𝒔𝒔𝒆́ 𝒖𝒏𝒆 𝒑𝒓𝒐𝒗𝒊𝒔𝒊𝒐𝒏 𝒂̀ 𝒍'𝑨𝒏𝒕𝒆𝒊𝒌𝒖.\n` +
        `╰━━━━━━━ 👁️ ━━━❖`;

      api.setMessageReaction("☕", messageID, () => {}, true);
      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Une erreur s'est produite dans la cuisine de l'Anteiku.", threadID);
    }
  }
};
