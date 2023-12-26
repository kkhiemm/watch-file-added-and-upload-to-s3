const AWS = require("aws-sdk");
const chokidar = require("chokidar");

// TODO: env accessKeyId, secretAccessKey, Bucket, mysql db

const getS3 = () => {
  const res = new AWS.S3({
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
  });

  return res;
};

const uploadToS3 = (s3, file, contentType, cb) => {
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
  // let arr = file.split("..\\camera-transfer-server\\");
  let arr = file.split("..\\camera-footage-download-server-source-0.2.1\\downloads\\");
  uploadParams.Key = arr[arr.length - 1].replace("\\", "/").slice(3);

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    }
    if (data) {
      console.log("Upload Success", data.Location);
      cb(data.Location);
    }
  });
};

const addLinkToDb = async (imei, type, link) => {
  var mysql = require("mysql");
  var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "gpsgsm",
  });
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
  console.log("imei", imei, type, link);
  var sql = `INSERT INTO media_files (imei, type, location) VALUES ('${imei}', '${type}', '${link}');`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("inserted!");
  });

  con.end(function (err) {
    if (err) throw err;
    console.log("Closed!");
  });
};

const main = async () => {
  const s3 = getS3();

  // One-liner for current directory
  chokidar
    // .watch("../camera-transfer-server", { ignoreInitial: true })
    .watch("../camera-footage-download-server-source-0.2.1/downloads", { ignoreInitial: true })
    .on("all", (event, path) => {
      console.log(event, path);
      if ((event == "add" || event == "change") && (path.endsWith("jpeg") || path.endsWith("mp4"))) {
        const contentType = path.endsWith("mp4") ? "video/mp4" : "image/jpeg";
        let arr = path.split("/"); // linux
        // let arr = path.split("\\"); // windows
        const imei = arr[2];
        uploadToS3(s3, path, contentType, (link) =>
          addLinkToDb(imei, contentType, link)
        );
      }
    });
};

main();
