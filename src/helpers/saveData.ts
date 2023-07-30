import fs from "fs";
import path from "path";

const saveData = async (data: any, file: string): Promise<void> => {
  const savePath = path.join(process.cwd(), "/src", "/data", file);

  return new Promise<void>((resolve, reject) => {
    fs.writeFile(savePath, JSON.stringify(data), (err) => {
      if (err) {
        return reject(err);
      }

      console.log("data saved successfully!");

      resolve();
    });
  });
};

export default saveData;
