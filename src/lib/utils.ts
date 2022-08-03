import fs from "fs";

export const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    console.log(err);
    return err;
  });
};
