/* file system */
const fs = require("fs");
/* multer for upload file in server */
const multer = require("multer");

/* new code */

const multerStorageUser = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { type } = req.query;
    /* here i set logic for keep in mind this type off file name name.my.photo.[fileextention] i want to get [fileextention] here */
    let fileSplitIndex = file.originalname.lastIndexOf(".");
    let extension = file.originalname.substring(fileSplitIndex + 1);
    if (type == "users") {
      if (
        extension.toLowerCase() === "jpg" ||
        extension.toLowerCase() === "jpeg" ||
        extension.toLowerCase() === "png" ||
        extension.toLowerCase() === "gif" ||
        extension.toLowerCase() === "bmp" ||
        extension.toLowerCase() === "tiff"
      ) {
        const folderPath = `posts/${type}/${req.user.id}`;
        // Create the folder if it doesn't exist
        fs.mkdir(folderPath, (err) => {
          if (err) {
            if (err.code === "EEXIST") {
              cb(null, folderPath); // Continue with the operation, folder exists
            } else {
              console.log(
                `Error creating the folder "${folderPath}": ${err}`
              );
              const customError = new Error("Error creating folder");
              customError.status = 500; // Internal Server Error
              cb(customError); // Pass the error to the callback
            }
          } else {
            cb(null, folderPath); // Continue with the operation, folder created
          }
        });
      }else{
        return cb(new Error(`this file extension ${extension} is not supported`));
      }
    } else {
      // Return an error if the type is not "users"
      return cb(new Error("Invalid file type valide file types are [users]"));
    }
  },
  filename: (req, file, cb) => {
    try {
      const { type } = req.query;
      /* here i set logic for keep in mind this type off file name name.my.photo.[fileextention] i want to get [fileextention] here */
      let fileSplitIndex = file.originalname.lastIndexOf(".");
      let extension = file.originalname.substring(fileSplitIndex + 1);
      let filename;
      if (type == "users") {
        if (
          extension.toLowerCase() === "jpg" ||
          extension.toLowerCase() === "jpeg" ||
          extension.toLowerCase() === "png" ||
          extension.toLowerCase() === "gif" ||
          extension.toLowerCase() === "bmp" ||
          extension.toLowerCase() === "tiff"
        ) {
          filename = `${Date.now()}.jpg`;
          req.img = `/${type}/${
            req.user.id
          }/${filename}`;
          req.type = type;
        } else {
          return cb(
            new Error(`this file extension ${extension} is not supported`)
          );
        }
      } else {
        // Return an error if the type is not "users"
        return cb(new Error("Invalid file type valid file types are [users]"));
      }
      cb(null, filename);
    } catch (err) {
      console.log(err.message);
      console.log(err.stack);
      cb(err);
    }
  },
});
const uploadsUser = multer({
  storage: multerStorageUser,
});
module.exports = uploadsUser.fields([
  //   { name: "photo", maxCount: 100 },
  { name: "file", maxCount: 100 },
  //   { name: "video", maxCount: 100 },
]);
