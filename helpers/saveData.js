const fs = require("fs");
const path = require("path");

const saveData = async (data, dataPath) => {
  const savePath = path.join(__dirname, "..", dataPath);

  return new Promise((resolve, reject) => {
    fs.writeFile(savePath, JSON.stringify(data), (err) => {
      if (err) {
        return reject(err);
      }

      console.log("data saved successfully!");

      resolve();
    });
  });
};

module.exports = saveData;
