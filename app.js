const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');

module.exports = getDisks = () => {
  const disk = shell.ls('/dev/');
  let disks = [];
  let status;

  for ( i = 0; i < disk.length; i++ ){
    if ( disk[i].indexOf('sd') > -1 && disk[i].length < 4){
      
      let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
      if (stdout.indexOf('Available') > -1){
        if (stdout.indexOf('Enabled') > -1){
          let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
          if (stdout.indexOf('PASSED') > -1 || stdout.indexOf('OK') > -1 ){
            satus = 'OK';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status});
          }else{
            satus = 'ERROR';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status});
          }
        }else{
          let {stdout, stderr, code} = shell.exec(`smartctl --smart=on /dev/${disk[i]}`);
          if(stdout.indexOf('SMART Enabled') > -1){
            getDisks();
          }else{
            satus = 'UNSUPPORTED';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status});
          }
        }
      }else{
        satus = 'UNSUPPORTED';
        disks.push({"Disk": `/dev/${disk[i]}`, "Status": status});
      } 
    }
  }
  console.log(disks);
  return disks;
}

getDisks();


