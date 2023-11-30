const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const { OpenAI } = require("openai");
const fs = require("fs-extra");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OAI_TOKEN,
});

const CACHE_FILE = path.join(__dirname, "sentenceVectors.json");

// Load cache or initialize it
let sentenceCache = {};
if (fs.existsSync(CACHE_FILE)) {
  sentenceCache = fs.readJsonSync(CACHE_FILE);
}

async function getOrComputeSentenceVector(sentence) {
  if (sentenceCache[sentence]) {
    return sentenceCache[sentence];
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: [sentence],
    });

    const vector = response["data"][0]["embedding"];
    sentenceCache[sentence] = vector;
    fs.writeJsonSync(CACHE_FILE, sentenceCache);

    return vector;
  } catch (error) {
    console.error("Error in getting sentence vector:", error);
    return null;
  }
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, index) => sum + a * vecB[index], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function compareSentences(sentence1, sentence2) {
  const vector1 = await getOrComputeSentenceVector(sentence1);
  const vector2 = await getOrComputeSentenceVector(sentence2);

  if (vector1 && vector2) {
    return cosineSimilarity(vector1, vector2);
  }
  return 0;
}

// Example usage
async function runComparison(sentence) {
  similarity = await compareSentences(sentence, "How to get sulfur?");
  if (similarity > 0.9) {
    return "Sulfur spawns anywhere beneath y=64";
  }
  similarity = await compareSentences(sentence, "How to get oil?");
  if (similarity > 0.9) {
    return "Oil ore spawns anywhere beneath y=64";
  }
  similarity = await compareSentences(sentence, "How to get lithium?");
  if (similarity > 0.9) {
    return "Litium spawns anywhere beneath y=64";
  }
  similarity = await compareSentences(sentence, "How to get red phosphorus?");
  if (similarity > 0.9) {
    return "Red phosphorus spawns anywhere beneath y=64 that isn't exposed to air";
  }
  similarity = await compareSentences(sentence, "How to get phosphorus?");
  if (similarity > 0.9) {
    return "Red phosphorus spawns anywhere beneath y=64 that isn't exposed to air";
  }
  similarity = await compareSentences(sentence, "How to get ephedera?");
  if (similarity > 0.9) {
    return "You get ephedera by breaking ephedra plants found in savanna biomes";
  }
  similarity = await compareSentences(sentence, "How to get methylamine?");
  if (similarity > 0.9) {
    return "Methylamine is found in meth labs inside of savanna biomes";
  }

  return "";
}

const schedule = require("node-schedule");

const words = JSON.parse(fs.readFileSync("words.json", "utf8"));

const token = process.env.TOKEN; // Replace with your bot token
const channelId = "922916334134759510"; // Replace with your channel ID
const channelId1 = "1177367543963467797"; // Replace with your channel ID

client.once("ready", () => {
  console.log("Connected as " + client.user.tag);
  // fetchMessages();

  // setInterval(() => {
  //   const channel = client.channels.cache.get("1177367543963467797"); // Replace with your channel ID
  //   if (!channel) return;

  //   let message = "";
  //   let currentWord = getRandomWord();

  //   const iterations = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
  //   console.log("Sending message with length");
  //   console.log(iterations);
  //   for (let i = 0; i < iterations; i++) {
  //     message += currentWord + " ";
  //     if (words[currentWord] && words[currentWord].length > 0) {
  //       currentWord =
  //         words[currentWord][
  //           Math.floor(Math.random() * words[currentWord].length)
  //         ];
  //     } else {
  //       currentWord = getRandomWord();
  //     }
  //   }

  //   channel.send(message.trim());
  // }, 10 * 60 * 60 * 1000);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id != "1174379049515233291") return;
  msg.channel.messages
    .fetch(msg.id)
    .then(async (message) => {
      console.log(message.content);
      var sentence = message.content.replace(/<@\d+>(\s?)+/g, "").toLowerCase();
      if (sentence != "") {
        var reply = await runComparison(sentence);
        if (reply != "") {
          message.reply(reply);
        }
      }
    })
    .catch(console.error);
});

client.on("threadCreate", (thread) => {
  if (thread.parentId != "1172249485762646226") return;
  thread.send(
    "Please make sure you're post includes each of the following:\n- Game Version\n- Mod Version\n\n*Please note, we do not support versions before and including 1.19.2, and any issues will not be resolved for those versions.*"
  );
});

client.login(token);
