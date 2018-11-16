const shell = require('shelljs');
const debug = require('debug')('SmartCTL');
const chalk = require('chalk');
const path = require('path');

const checkInstall = () => {
  const {stdout, stderr, code} = shell.exec('dpkg -l smartmontools');
  if(code === 1){
    console.log(`failed`);
    if(stderr.indexOf("dpkg-query: no packages found matching smartmontools") > -1){
      console.log(`Starting Install`);
      install();
    }else{
      console.log(stderr.indexOf("dpkg-query: no packages found matching smartmontools"));
    }
  }else{
    if(stdout.indexOf('ii') > -1){
      console.log(`Tools Installed`);
      getDisks();
    }
  }
}

const install = () => {
  console.log(`Installing SmartMonTools`);
  shell.exec('whoami', function(code, stdout, stderr) {
    if(stdout.indexOf('root') === -1 ){
      console.log(`Please run as root or install smartmontools`);
      process.exit(1);
    }else{
      const {stdout, stderr, code} = shell.exec(`apt install -y smartmontools`);
      if(code === 0){
        checkInstall();
      }else{
        console.log('Please Install SmartMonTools');
      }
    }
  });

}

module.exports = getDisks = () => {
  const disk = shell.ls('/dev/');
  let disks = [];

  for ( i = 0; i < disk.length; i++ ){
    if ( disk[i].indexOf('sd') > -1 ){
      const status;
      let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
      if (stdout.indexOf('Available') > -1){
        if (stdout.indexOf('Enabled') > -1){
          let {stdout, stderr, code} = shell.exec(`smartctl -H /dev/${disk[i]}`);
          if (stdout.indexOf('PASSED') > -1 || stdout.indexOf('OK') > -1 ){
            satus = 'OK';
            disks.push({"Disk": `/dev/${disk[i]}`, "Status": status});
          }
        }
      } 
    }
  }
  return disks;
}

checkInstall();


