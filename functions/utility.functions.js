const fs = require("fs");
// time zone getter
const geoip = require("geoip-lite");

// delete file function
const deleteFile = async (path) => {
  return new Promise((resolve) => {
    fs.unlink("./posts" + path, (err) => {
      if (err) {
        console.log(`No file exists with ${path} location`);
      }
      resolve(); // Resolve the promise after unlink completes
    });
  });
};

/* convert all to valid time */
function convertMillisecondsToLocalTime(milliseconds, clientTimeZone) {
  // Convert milliseconds from string to number
  milliseconds = Date.parse(milliseconds);

  const date = new Date(milliseconds);
  const options = {
    timeZone: clientTimeZone ? clientTimeZone : "Asia/Karachi",
  };
  return date.toLocaleString("en-US", options);
}

const convertAllToValidTime = (records, req, type) => {
  const clientIp = req.clientIp;
  const geo = geoip.lookup(clientIp);
  let clientTimeZone;
  if (geo) {
    clientTimeZone = geo.timezone;
  }
  let recordss = JSON.parse(JSON.stringify(records));
  let newRecords = [];
  for (let record of recordss) {
    if (type === "notifications") {
      if (record.createdAt) {
        record.createdAt = convertMillisecondsToLocalTime(
          record.createdAt,
          clientTimeZone
        );
      }
      if (record.updatedAt) {
        record.updatedAt = convertMillisecondsToLocalTime(
          record.updatedAt,
          clientTimeZone
        );
      }

      newRecords.push(record);
    } else {
      if (record.dateCreated) {
        record.orderCreated = convertMillisecondsToLocalTime(
          record.orderCreated,
          clientTimeZone
        );
      }
      if (record.dateModified) {
        record.orderModified = convertMillisecondsToLocalTime(
          record.orderModified,
          clientTimeZone
        );
      }
      newRecords.push(record);
    }
  }
  return newRecords;
};

module.exports = {
  deleteFile,
  convertAllToValidTime,
};
