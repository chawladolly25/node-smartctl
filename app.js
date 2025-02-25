const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');
const { execFileSync } = require('child_process');

// Regex to validate disk identifier (only allow names like 'sda', 'sdb', etc.)
const validDiskRegex = /^sd[a-z]+$/;

function getDisks() {
  const diskList = shell.ls('/dev/');
  let disks = [];

  for (let i = 0; i < diskList.length; i++) {
    const disk = diskList[i];

    // Input Validation: Only process disks matching the valid pattern
    if (!validDiskRegex.test(disk)) {
      continue;
    }

    let size;
    try {
      const blockOut = execFileSync('blockdev', ['--getsize64', `/dev/${disk}`], { encoding: 'utf8' });
      size = parseInt(blockOut, 10) / 1000000000;
    } catch (err) {
      debug(`Error getting size for /dev/${disk}: ${err}`);
      continue;
    }

    try {
      // Use execFileSync with argument array to safely execute smartctl
      const smartOutput = execFileSync('smartctl', ['-H', `/dev/${disk}`], { encoding: 'utf8' });

      let status;
      if (smartOutput.includes('Available')) {
        if (smartOutput.includes('Enabled')) {
          // Re-run to determine detailed health status
          const newSmartOutput = execFileSync('smartctl', ['-H', `/dev/${disk}`], { encoding: 'utf8' });
          if (newSmartOutput.includes('PASSED') || newSmartOutput.includes('OK')) {
            status = 'OK';
          } else {
            status = 'ERROR';
          }
          disks.push({ "Disk": `/dev/${disk}`, "Status": status, "Size": size });
        } else {
          // Attempt to enable SMART safely
          const smartOnOutput = execFileSync('smartctl', ['--smart=on', `/dev/${disk}`], { encoding: 'utf8' });
          if (smartOnOutput.includes('SMART Enabled')) {
            // After enabling, assume disk passes or you might re-check here
            status = 'OK';
            disks.push({ "Disk": `/dev/${disk}`, "Status": status, "Size": size });
          } else {
            console.log(smartOnOutput);
            status = 'UNSUPPORTED';
            disks.push({ "Disk": `/dev/${disk}`, "Status": status, "Size": size });
          }
        }
      } else {
        console.log(smartOutput);
        status = 'UNSUPPORTED';
        disks.push({ "Disk": `/dev/${disk}`, "Status": status, "Size": size });
      }
    } catch (err) {
      debug(`Error running smartctl for /dev/${disk}: ${err}`);
      disks.push({ "Disk": `/dev/${disk}`, "Status": 'ERROR', "Size": size });
    }
  }

  console.log(disks);
  return disks;
}

// Execute function on load
getDisks();

module.exports = { getDisks };
