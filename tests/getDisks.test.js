const assert = require('assert');
const { exec } = require('child_process');
const getDisks = require('./app.js');

// Test case to check for command injection vulnerability
function testCommandInjection() {
  const maliciousInput = '&& echo hacked';
  exec(`node -e "require('./app.js').getDisks('${maliciousInput}')"`, (error, stdout, stderr) => {
    assert(!stdout.includes('hacked'), 'Command injection vulnerability detected!');
    console.log('Command injection test passed.');
  });
}

testCommandInjection();

// Additional test cases can be added here to further verify the function's behavior
