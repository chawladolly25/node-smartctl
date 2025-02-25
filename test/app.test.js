const assert = require('assert');
const sinon = require('sinon');
const shell = require('shelljs');

// Ensure that getDisks is exported in app.js for testing purposes
const app = require('../app');
const getDisks = app.getDisks;

// If getDisks is executed automatically on module load, consider gating the execution
// (e.g., wrap in an if (require.main === module) { ... } block) so tests can import without side effects.

describe('getDisks Function Tests', function() {
  let shellExecStub;
  let consoleLogStub;

  beforeEach(function() {
    // Stub shell.exec to monitor command execution and simulate safe command output
    shellExecStub = sinon.stub(shell, 'exec').callsFake((cmd, options, callback) => {
      if (typeof callback === 'function') {
        return callback({ code: 0, stdout: 'safe output', stderr: '' });
      } else {
        return { code: 0, stdout: 'safe output', stderr: '' };
      }
    });
    // Stub console.log to capture log outputs
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(function() {
    shellExecStub.restore();
    consoleLogStub.restore();
  });

  it('SubStep A: should not allow command injection via shell commands', async function() {
    try {
      let disks = await getDisks();
      // Combine all command strings executed
      const executedCommands = shellExecStub.getCalls().map(call => call.args[0]).join(' ');
      // Check that expected malicious characters are not in the executed command strings
      assert(!executedCommands.includes(';') && !executedCommands.includes('&&'),
             'Potential injection characters found in executed commands');
      // Also verify that the function returns an array
      assert(Array.isArray(disks), 'Returned value should be an array !');
    } catch (err) {
      assert.fail('getDisks threw an error: ' + err.message);
    }
  });

  it('SubStep B: should correctly retrieve and categorize disk information', async function() {
    let disks = await getDisks();
    // If there are disks, verify that each object has the expected properties
    if (disks.length > 0) {
      disks.forEach((disk) => {
        assert.ok(disk.hasOwnProperty('diskName'), 'Disk should have a diskName property');
        assert.ok(disk.hasOwnProperty('size'), 'Disk should have a size property');
        assert.ok(disk.hasOwnProperty('health'), 'Disk should have a health property');
        assert.ok(['OK', 'ERROR', 'UNSUPPORTED'].includes(disk.health), 'Disk health is invalid');
      });
    }
  });

  it('SubStep C: should not log unexpected commands', async function() {
    await getDisks();
    const logs = consoleLogStub.getCalls().map(call => call.args.join(' '));
    logs.forEach(log => {
      // Ensure that logs do not include characters or patterns that might indicate a command injection
      assert(!log.includes(';') && !log.includes('&&'), 'Log contains potential injection command');
    });
  });
});
