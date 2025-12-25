module.exports = {
  config: {
    name: "combat",
    aliases: ["kagune", "attaquer", "fight"],
    version: "2.3",
    author: "Master Charbel (Style par Gemini)",
    countDown: 15,
    role: 0,
    category: "action",
    shortDescription: "Affronte une autre goule avec ton Kagune.",
    guide: { en: "{pn} @mention ou {pn} <UID> ou répondez à son message" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    
    // --- Système de détection de la cible ---
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    if (!targetID) {
      return api.sendMessage("👁️ 𝑲𝒂𝒏𝒆𝒌𝒊 : Désigne une proie. Mentionne-la, entre son UID ou réponds à son message.", threadID, messageID);
    }

    if (targetID === senderID) {
      return api.sendMessage("🎭 𝑲𝒂𝒏𝒆𝒌𝒊 : Te trancher toi-même ne calmera pas ta faim...", threadID, messageID);
    }

    try {
      const attackerData = await usersData.get(senderID);
      const victimData = await usersData.get(targetID);

      if (!victimData) {
        return api.sendMessage("❌ Cette proie n'existe pas dans mes registres.", threadID, messageID);
      }

      // --- Types de Kagune ---
      const kagunes = ["𝑼𝒌𝒂𝒌𝒖 (𝑨𝒊𝒍𝒆𝒔 𝒅𝒆 𝒇𝒆𝒖)", "𝑲𝒐𝒖𝒌𝒂𝒌𝒖 (𝑩𝒐𝒖𝒄𝒍𝒊𝒆𝒓 𝒕𝒓anchant)", "𝑹𝒊𝒏𝒌𝒂𝒌𝒖 (𝑻𝒆𝒏𝒕𝒂𝒄𝒖𝒍𝒆𝒔 𝒆́𝒄𝒂𝒊𝒍𝒍𝒆𝒖𝒙)", "𝑩𝒊𝒌𝒂𝒌𝒖 (𝑸𝒖𝒆𝒖𝒆 𝒑𝒖𝒊𝒔𝒔𝒂𝒏𝒕𝒆)"];
      const myKagune = kagunes[Math.floor(Math.random() * kagunes.length)];

      // --- Logique de Combat ---
      const damage = Math.floor(Math.random() * 40) + 10; 
      const victimMoney = victimData.money || 0;
      const stolenMoney = Math.floor(victimMoney * (damage / 100)); 

      await usersData.set(targetID, { money: victimMoney - stolenMoney });
      await usersData.set(senderID, { money: (attackerData.money || 0) + stolenMoney });

      const fightScenes = [
        `𝑳'𝒂𝒕𝒕𝒂𝒒𝒖𝒆 𝒆𝒔𝒕 𝒇𝒖𝒍𝒈𝒖𝒓𝒂𝒏𝒕𝒆 ! 𝑳𝒆𝒔 𝒕𝒆𝒏𝒕𝒂𝒄𝒖𝒍𝒆𝒔 𝒅𝒆 ${attackerData.name} 𝒕𝒓𝒂𝒗𝒆𝒓𝒔𝒆𝒏𝒕 𝒍'𝒆́𝒑𝒂𝒖𝒍𝒆 𝒅𝒆 ${victimData.name}.`,
        `${attackerData.name} 𝒄𝒓𝒂𝒒𝒖𝒆 𝒔𝒐𝒏 𝒅𝒐𝒊𝒈𝒕 𝒆𝒕 𝒅𝒆́𝒄𝒉𝒂𝒊̂𝒏𝒆 𝒔𝒐𝒏 ${myKagune}, 𝒍𝒂𝒊𝒔𝒔𝒂𝒏𝒕 ${victimData.name} 𝒂𝒖 𝒔𝒐𝒍.`,
        `𝑼𝒏 𝒄𝒉𝒐𝒄 𝒃𝒓𝒖𝒕𝒂𝒍 ! 𝑳𝒆𝒔 𝒎𝒖𝒓𝒔 𝒕𝒓𝒆𝒎𝒃𝒍𝒆𝒏𝒕 𝒔𝒐𝒖𝒔 𝒍𝒂 𝒑𝒖𝒊𝒔𝒔𝒂𝒏𝒄𝒆 𝒅𝒖 𝒄𝒐𝒎𝒃𝒂𝒕.`,
        `${victimData.name} 𝒕𝒆𝒏𝒕𝒆 𝒅𝒆 𝒃𝒍𝒐𝒒𝒖𝒆𝒓, 𝒎𝒂𝒊𝒔 𝒍𝒂 𝒇𝒖𝒓𝒊𝒆 𝒅𝒆 ${attackerData.name} 𝒆𝒔𝒕 𝒕𝒓𝒐𝒑 𝒈𝒓𝒂𝒏𝒅𝒆.`
      ];

      const msg = 
        `╭─────── 🩸 ───────╮\n` +
        `   ⚔️  𝑨𝑹𝑬̀𝑵𝑬 𝑫𝑬𝑺 𝑮𝑶𝑼𝑳𝑬𝑺  ⚔️\n` +
        `╰─────── 🩸 ───────╯\n\n` +
        `🎭 **𝑨𝒕𝒕𝒂𝒒𝒖𝒂𝒏𝒕** : ${attackerData.name}\n` +
        `🛡️ **𝑽𝒊𝒄𝒕𝒊𝒎𝒆** : ${victimData.name}\n\n` +
        `🔱 **𝑨𝒓𝒎𝒆** : ${myKagune}\n` +
        `💥 **𝑫𝒆́𝒈𝒂̂𝒕𝒔** : ${damage}%\n` +
        `💰 **𝑩𝒖𝒕𝒊𝒏** : ${stolenMoney.toLocaleString()} 𝒀𝒆𝒏𝒔 𝒅𝒆́𝒇𝒆́𝒓𝒆́𝒔\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📝 ${fightScenes[Math.floor(Math.random() * fightScenes.length)]}\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `« 𝑷𝒐𝒖𝒓 𝒔𝒖𝒓𝒗𝒊𝒗𝒓𝒆, 𝒊𝒍 𝒇𝒂𝒖𝒕 𝒅𝒆́𝒗𝒐𝒓𝒆𝒓 𝒍𝒆𝒔 𝒂𝒖𝒕𝒓𝒆𝒔. »\n\n` +
        `🩸 𝑪𝒐𝒎𝒃𝒂𝒕 𝒔𝒖𝒓𝒗𝒆𝒊𝒍𝒍𝒆́ 𝒑𝒂𝒓 𝑴𝒂𝒔𝒕𝒆𝒓 𝑪𝒉𝒂𝒓𝒃𝒆𝒍.\n` +
        `╰━━━━━━━ 💀 ━━━❖`;

      api.setMessageReaction("💀", messageID, () => {}, true);
      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ La cible a réussi à s'enfuir dans les égouts.", threadID);
    }
  }
};
