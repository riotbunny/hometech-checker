const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(/address: '',/, 'streetAddress: \'\',\n    zipCode: \'\',');

code = code.replace(
  'if (!formData.address.trim()) {',
  'if (!formData.streetAddress.trim() || !formData.zipCode.trim() || formData.zipCode.trim().length < 5) {'
);
code = code.replace(
  'setErrorMessage(\'Please enter your service address to check coverage slots.\');',
  'setErrorMessage(\'Please enter both your street address and a valid 5-digit zip code to check coverage slots.\');'
);

const beforePayload = \    const urlParams = new URLSearchParams(window.location.search);

    const p50Payload = {\;

const afterPayload = \    const urlParams = new URLSearchParams(window.location.search);

    const combinedAddress = \\\\, \, \ \\\\;

    const p50Payload = {\;

code = code.replace(beforePayload, afterPayload);

code = code.replace(/address: formData\.address,/g, 'address: combinedAddress,');
code = code.replace(/zip: location\.zip,/g, 'zip: formData.zipCode.trim() || location.zip,');

fs.writeFileSync('src/App.jsx', code);
