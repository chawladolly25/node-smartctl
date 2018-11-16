const shell = require('shelljs');
const debug = require('debug')('DiskManager');
const chalk = require('chalk');
const path = require('path');

const {stdout, stderr, code} = shell.exec('dpkg -l smartmontools');

