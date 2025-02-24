const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');
const validator = require('validator');

module.exports = getDisks = () => {
  const disk = shell.ls('/dev/');
  const disks = [];
  let status;
  let size;

  for (let i = 0; i < disk.length; i++) {
    if (disk[i].indexOf('sd') > -1) {
      const diskPath = `/dev/${disk[i]}`;
      if (!validator.isAlphanumeric(disk[i])) {
        console.log(`Invalid disk identifier: ${disk[i]}`);
        continue;
      }

      let { stdout: sizeOut } = shell.exec(`blockdev --getsize64 ${diskPath}`);
      size = parseInt(sizeOut) / 1000000000;

      let { stdout, stderr, code } = shell.exec(`smartctl -H ${diskPath}`);
      if (stdout.indexOf('Available') > -1) {
        if (stdout.indexOf('Enabled') > -1) {
          if (stdout.indexOf('PASSED') > -1 || stdout.indexOf('OK') > -1) {
            status = 'OK';
          } else {
            status = 'ERROR';
          }
          disks.push({ "Disk": diskPath, "Status": status, "Size": size });
        } else {
          let { stdout: enableOut } = shell.exec(`smartctl --smart=on ${diskPath}`);
          if (enableOut.indexOf('SMART Enabled') > -1) {
            getDisks();
          } else {
            console.log(enableOut);
            status = 'UNSUPPORTED';
            disks.push({ "Disk": diskPath, "Status": status, "Size": size });
          }
        }
      } else {
        console.log(stdout);
        status = 'UNSUPPORTED';
        disks.push({ "Disk": diskPath, "Status": status, "Size": size });
      }
    }
  }
  console.log(disks);
  return disks;
}

getDisks();
module.exports = disks;
