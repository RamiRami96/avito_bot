const fs = require("fs");
const path = require("path");

const saveData = async (data) => {
  const savePath = path.join(__dirname, "..", "cards.json");

  return new Promise((resolve, reject) => {
    fs.writeFile(savePath, JSON.stringify(data), (err) => {
      if (err) {
        return reject(err);
      }

      console.log("File was saved successfully");

      resolve();
    });
  });
};

module.exports = saveData;
