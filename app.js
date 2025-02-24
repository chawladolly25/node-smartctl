const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');
const shellEscape = require('shell-escape');

// Function to retrieve and assess the status of disk drives
// Implements input sanitization using shell-escape to prevent command injection
module.exports = getDisks = () => {
  const disk = shell.ls('/dev/');
  let disks = [];
  let status;
  let size;

  for (let i = 0; i < disk.length; i++) {
    // Check if the disk name contains 'sd', indicating a standard disk
    if (disk[i].indexOf('sd') > -1) {
      const diskPath = shellEscape([`/dev/${disk[i]}`]);
      let { out } = shell.exec(`blockdev --getsize64 ${diskPath}`);
      size = parseInt(out) / 1000000000;
      let { stdout, stderr, code } = shell.exec(`smartctl -H ${diskPath}`);

      // Check if SMART is available and enabled
      if (stdout.indexOf('Available') > -1) {
        if (stdout.indexOf('Enabled') > -1) {
          let { stdout, stderr, code } = shell.exec(`smartctl -H ${diskPath}`);
          // Determine disk status based on SMART health check
          if (stdout.indexOf('PASSED') > -1) {
            status = 'OK';
          } else if (stdout.indexOf('OK') > -1) {
            status = 'OK';
          } else {
            status = 'ERROR';
          }
          disks.push({ "Disk": diskPath, "Status": status, "Size": size });
        } else {
          // Attempt to enable SMART if not already enabled
          let { stdout, stderr, code } = shell.exec(`smartctl --smart=on ${diskPath}`);
          if (stdout.indexOf('SMART Enabled') > -1) {
            getDisks();
          } else {
            console.log(stdout);
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

// Immediately invoke the function to get disk information
getDisks();
module.exports = disks;
