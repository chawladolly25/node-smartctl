const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');



module.exports = getDisks = () => {
  const disk = shell.ls('/dev/');
  disks = [];
  let status;
  let size;
  let free;

  for ( i = 0; i < disk.length; i++ ){
    if ( disk[i].indexOf('sd') > -1){
      let {out} = shell.exec(`blockdev --getsize64 /dev/${disk[i]}`);
      size = parseInt(out) / 1000000000;      
      let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
      if (stdout.indexOf('Available') > -1){
        if (stdout.indexOf('Enabled') > -1){
          let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
          if (stdout.indexOf('PASSED') > -1 ) {
            status = 'OK';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status, "Size":size});
          }else if (stdout.indexOf('OK') > -1 ){
            status = 'OK';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status, "Size":size});
          }else{
            status = 'ERROR';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status, "Size":size});
          }
        }else{
          let {stdout, stderr, code} = shell.exec(`smartctl --smart=on /dev/${disk[i]}`);
          if(stdout.indexOf('SMART Enabled') > -1){
            getDisks();
          }else{
            console.log(stdout);
            status = 'UNSUPPORTED';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status, "Size":size});
          }
        }
      }else{
        console.log(stdout);
        status = 'UNSUPPORTED';
        disks.push({"Disk": `/dev/${disk[i]}`, "Status": status, "Size":size});
      } 
    }
  }
  console.log(disks);
  return disks;
}

getDisks();
module.exports = disks;

