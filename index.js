const AWS = require("aws-sdk");
const chokidar = require("chokidar");

var s3;

const getS3 = () => {
  AWS.config.update({ region: "ap-southeast-2" });
  AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: "default",
  });
  const res = new AWS.S3({ apiVersion: "2006-03-01" });
  return res;
};

const upload = (file) => {
  var uploadParams = { Bucket: "mqmint", Key: "", Body: "" };

  // Configure the file stream and obtain the upload parameters
  var fs = require("fs");
  var fileStream = fs.createReadStream(file);
  fileStream.on("error", function (err) {
    console.log("File Error", err);
  });
  uploadParams.Body = fileStream;
  // var path = require("path");
  let arr = file.split(
    "..\\watch-file-created-and-upload-to-s3_file-to-test\\"
  );
  console.log(arr[arr.length - 1]);
  uploadParams.Key = arr[arr.length - 1].replace("\\", "/");
  // console.log(uploadParams);

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

s3 = getS3();

// One-liner for current directory
chokidar
  .watch("../watch-file-created-and-upload-to-s3_file-to-test")
  .on("all", (event, path) => {
    console.log(event, path);
    if (event == "add" && path.endsWith("txt")) {
      upload(path);
    }
  });
