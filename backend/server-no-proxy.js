// Force Node.js to ignore Windows proxy settings and use direct connection
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';
process.env.NO_PROXY = '*';

// Also set DNS resolution to IPv4 only (Windows IPv6 issues)
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

console.log('🔧 Network Configuration:');
console.log('   HTTP_PROXY:', process.env.HTTP_PROXY || 'none');
console.log('   HTTPS_PROXY:', process.env.HTTPS_PROXY || 'none');
console.log('   DNS Order: IPv4 first');
console.log('   DNS Servers:', dns.getServers());

// Now start the actual server
require('./src/index.ts');
