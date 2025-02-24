const { exec } = require('child_process');

function testCommandInjection() {
  const maliciousInputs = [
    '&& ls',
    '; rm -rf /',
    '| cat /etc/passwd',
    '|| echo "Injection"'
  ];

  maliciousInputs.forEach(input => {
    exec(`node app.js ${input}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`Test passed for input: ${input}`);
      } else {
        console.error(`Test failed for input: ${input}`);
        console.error(`Output: ${stdout}`);
        console.error(`Error: ${stderr}`);
      }
    });
  });
}

testCommandInjection();