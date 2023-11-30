const fs = require("fs");
const readline = require("readline");

// Create a stream to read the file
const fileStream = fs.createReadStream("output.txt");

// Use readline to read the file line by line
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

// Object to store the word relationships
const wordMap = {};

rl.on("line", (line) => {
  // Split the line into words
  const words = line.split(/\s+/);

  // Iterate over the words in the line
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];

    // If the word is not in the map, add it
    if (!wordMap[currentWord]) {
      wordMap[currentWord] = [];
    }

    // Add the following word to the map
    wordMap[currentWord].push(nextWord);
  }
}).on("close", () => {
  // Once reading is complete, write the JSON file
  fs.writeFile("words.json", JSON.stringify(wordMap, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("words.json has been saved.");
    }
  });
});
