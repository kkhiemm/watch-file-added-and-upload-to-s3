const AWS = require("aws-sdk");
const chokidar = require("chokidar");

// TODO: env accessKeyId, secretAccessKey, Bucket

const getS3 = () => {
  const res = new AWS.S3({
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
  });

  return res;
};

const uploadToS3 = (s3, file, contentType) => {
  var uploadParams = {
    Bucket: "Bucket",
    Key: "",
    ACL: "public-read",
    ContentType: contentType,
    Body: "",
  };

  // Configure the file stream and obtain the upload parameters
  var fs = require("fs");
  var fileStream = fs.createReadStream(file);
  fileStream.on("error", function (err) {
    console.log("File Error", err);
  });
  uploadParams.Body = fileStream;

  // TODO: optimize
  // var path = require("path");
  let arr = file.split("..\\camera-transfer-server\\");
  uploadParams.Key = arr[arr.length - 1].replace("\\", "/").slice(3);

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    }
    if (data) {
      console.log("Upload Success", data.Location);
    }
  });
};

const main = async () => {
  const s3 = getS3();

  // One-liner for current directory
  chokidar.watch("../camera-transfer-server").on("all", (event, path) => {
    console.log(event, path);
    if (event == "add" && (path.endsWith("jpeg") || path.endsWith("mp4"))) {
      const contentType = path.endsWith("mp4") ? "video/mp4" : "image/jpeg";
      uploadToS3(s3, path, contentType);
    }
  });
};

main();
