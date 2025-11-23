const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const YT_API = "http://65.109.80.126:20409/aryan/yx";

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// Téléchargement fichier
const downloadFile = async (url, ext) => {
const filePath = path.join(TMP_DIR, ${uuidv4()}.${ext});
const response = await axios.get(url, { responseType: 'arraybuffer' });
fs.writeFileSync(filePath, Buffer.from(response.data));
return filePath;
};

// Reset conversation
const resetConversation = async (api, event, message) => {
api.setMessageReaction("♻️", event.messageID, () => {}, true);
try {
await axios.delete(${CLEAR_ENDPOINT}/${event.senderID});
return message.reply(✅ Conversation reset for UID: ${event.senderID});
} catch (error) {
return message.reply("❌ Reset failed. Try again.");
}
};

// YouTube handler
const handleYouTube = async (api, event, message, args) => {
const option = args[0];
if (!["-v", "-a"].includes(option)) {
return message.reply("❌ Usage: youtube [-v|-a] <search or URL>");
}

const query = args.slice(1).join(" ");
if (!query) return message.reply("❌ Provide a search query or URL.");

const sendFile = async (url, type) => {
try {
const { data } = await axios.get(${YT_API}?url=${encodeURIComponent(url)}&type=${type});
const downloadUrl = data.download_url;

if (!data.status || !downloadUrl) throw new Error();  

  const filePath = path.join(TMP_DIR, `yt_${Date.now()}.${type}`);  
  const writer = fs.createWriteStream(filePath);  
  const stream = await axios({ url: downloadUrl, responseType: "stream" });  

  stream.data.pipe(writer);  

  await new Promise((resolve, reject) => {  
    writer.on("finish", resolve);  
    writer.on("error", reject);  
  });  

  await message.reply({ attachment: fs.createReadStream(filePath) });  
  fs.unlinkSync(filePath);  

} catch {  
  message.reply(`❌ Failed to download ${type}.`);  
}

};

if (query.startsWith("http"))
return await sendFile(query, option === "-v" ? "mp4" : "mp3");

try {
const results = (await ytSearch(query)).videos.slice(0, 6);
if (results.length === 0) return message.reply("❌ No results found.");

let list = "";  
results.forEach((v, i) => list += `${i + 1}. 🎬 ${v.title} (${v.timestamp})\n`);  

const thumbs = await Promise.all(  
  results.map(v =>  
    axios.get(v.thumbnail, { responseType: "stream" }).then(res => res.data)  
  )  
);  

api.sendMessage(  
  {  
    body: list + "\nReply with number (1-6) to download.",  
    attachment: thumbs  
  },  
  event.threadID,  
  (err, info) => {  
    global.GoatBot.onReply.set(info.messageID, {  
      commandName: "ai",  
      messageID: info.messageID,  
      author: event.senderID,  
      results,  
      type: option  
    });  
  },  
  event.messageID  
);

} catch {
message.reply("❌ Failed to search YouTube.");
}
};

// AI handler
const handleAIRequest = async (api, event, userInput, message) => {
const args = userInput.split(" ");
const first = args[0]?.toLowerCase();

if (["youtube", "yt", "ytb"].includes(first)) {
return await handleYouTube(api, event, message, args.slice(1));
}

const userId = event.senderID;
let imageUrl = null;

api.setMessageReaction("⏳", event.messageID, () => {}, true);

const urlMatch = userInput.match(/(https?://[^\s]+)/)?.[0];
if (urlMatch && validUrl.isWebUri(urlMatch)) {
imageUrl = urlMatch;
userInput = userInput.replace(urlMatch, "").trim();
}

if (!userInput && !imageUrl) {
api.setMessageReaction("❌", event.messageID, () => {}, true);
return message.reply("💬 Provide a message or image.");
}

try {
const response = await axios.post(API_ENDPOINT, {
uid: userId,
message: userInput,
image_url: imageUrl
});

let { reply: textReply, image_url: genImageUrl } = response.data;  
let finalReply = textReply || "AI Response:";  

finalReply = finalReply  
  .replace(/🎀\s*𝗦𝗵𝗶𝘇𝘂/gi, "🎀 𝗠𝗮𝘀𝘁𝗲𝗿 𝗕𝗼𝘁")  
  .replace(/Shizu/gi, "Master Bot")  
  .replace(/Aryan Chauhan/gi, "Master Charbel");  

const attachments = [];  

if (genImageUrl) {  
  attachments.push(fs.createReadStream(await downloadFile(genImageUrl, "jpg")));  
}  

const sentMessage = await message.reply({  
  body: finalReply,  
  attachment: attachments.length ? attachments : undefined  
});  

global.GoatBot.onReply.set(sentMessage.messageID, {  
  commandName: "ai",  
  author: userId  
});  

api.setMessageReaction("✅", event.messageID, () => {}, true);

} catch (error) {
api.setMessageReaction("❌", event.messageID, () => {}, true);
message.reply("⚠️ AI Error:\n" + error.message);
}
};

module.exports = {
config: {
name: "ai",
version: "3.0.0",
author: "Christus",
role: 0,
category: "ai",
longDescription: {
en: "AI + YouTube: Chat, Images, Music, Video, Downloader"
},
guide: {
en: .ai [message]   .ai youtube -v [query/url]   .ai youtube -a [query/url]   .ai clear
}
},

onStart: async ({ api, event, args, message }) => {
const userInput = args.join(" ").trim();
if (!userInput) return message.reply("❗ Please enter a message.");

if (["clear", "reset"].includes(userInput.toLowerCase())) {  
  return await resetConversation(api, event, message);  
}  

return await handleAIRequest(api, event, userInput, message);

},

onReply: async ({ api, event, Reply, message }) => {
if (event.senderID !== Reply.author) return;

const userInput = event.body?.trim();  
if (!userInput) return;  

if (["clear", "reset"].includes(userInput.toLowerCase())) {  
  return await resetConversation(api, event, message);  
}  

if (Reply.results && Reply.type) {  
  const idx = parseInt(userInput);  
  if (isNaN(idx) || idx < 1 || idx > Reply.results.length)  
    return message.reply("❌ Invalid selection (1-6).");  

  const selected = Reply.results[idx - 1];  
  const type = Reply.type === "-v" ? "mp4" : "mp3";  

  try {  
    const { data } = await axios.get(  
      `${YT_API}?url=${encodeURIComponent(selected.url)}&type=${type}`  
    );  
    const filePath = await downloadFile(data.download_url, type);  

    await message.reply({ attachment: fs.createReadStream(filePath) });  
    fs.unlinkSync(filePath);  
  } catch {  
    message.reply(`❌ Failed to download ${type}.`);  
  }  
} else {  
  return await handleAIRequest(api, event, userInput, message);  
}

},

onChat: async ({ api, event, message }) => {
const body = event.body?.trim();
if (!body?.toLowerCase().startsWith("ai ")) return;

const userInput = body.slice(3).trim();  
if (!userInput) return;  

return await handleAIRequest(api, event, userInput, message);

}
};
