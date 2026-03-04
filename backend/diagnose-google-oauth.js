const https = require('https');
const dns = require('dns');
const { promisify } = require('util');

const lookup = promisify(dns.lookup);
const resolve4 = promisify(dns.resolve4);

console.log('🔍 Google OAuth Network Diagnostics\n');
console.log('═'.repeat(70));

async function testDNS() {
  console.log('\n1️⃣ DNS Resolution Test');
  console.log('-'.repeat(70));
  
  try {
    console.log('Testing: www.googleapis.com');
    const address = await lookup('www.googleapis.com');
    console.log('✅ DNS Lookup Success:', address);
  } catch (error) {
    console.log('❌ DNS Lookup FAILED:', error.code);
    console.log('   Error:', error.message);
    return false;
  }
  
  try {
    console.log('\nResolving A records...');
    const addresses = await resolve4('www.googleapis.com');
    console.log('✅ A Records:', addresses.join(', '));
  } catch (error) {
    console.log('❌ A Record Resolution FAILED:', error.code);
  }
  
  return true;
}

async function testHTTPS() {
  console.log('\n2️⃣ HTTPS Connection Test');
  console.log('-'.repeat(70));
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/oauth2/v4/token',
      method: 'GET',
      timeout: 10000
    };
    
    console.log('Testing: https://www.googleapis.com/oauth2/v4/token');
    
    const req = https.request(options, (res) => {
      console.log('✅ HTTPS Connection Success');
      console.log('   Status Code:', res.statusCode);
      console.log('   Headers:', JSON.stringify(res.headers, null, 2));
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ HTTPS Connection FAILED:', error.code);
      console.log('   Error:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ HTTPS Connection TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testOAuthEndpoint() {
  console.log('\n3️⃣ OAuth Token Endpoint Test');
  console.log('-'.repeat(70));
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      grant_type: 'authorization_code',
      code: 'test_code',
      client_id: process.env.GOOGLE_CLIENT_ID || 'test',
      client_secret: 'test',
      redirect_uri: 'http://localhost:5000/callback'
    });
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      },
      timeout: 10000
    };
    
    console.log('Testing: https://oauth2.googleapis.com/token');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('✅ OAuth Endpoint Reachable');
        console.log('   Status:', res.statusCode);
        console.log('   Response:', data.substring(0, 200));
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ OAuth Endpoint FAILED:', error.code);
      console.log('   Error:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ OAuth Endpoint TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function checkSystemDNS() {
  console.log('\n4️⃣ System DNS Configuration');
  console.log('-'.repeat(70));
  
  const dnsServers = dns.getServers();
  console.log('Current DNS Servers:', dnsServers.join(', '));
  
  if (dnsServers.length === 0) {
    console.log('⚠️  No DNS servers configured!');
  } else {
    console.log('✅ DNS servers are configured');
  }
}

async function suggestFixes(dnsOk, httpsOk, oauthOk) {
  console.log('\n5️⃣ Diagnosis & Recommendations');
  console.log('═'.repeat(70));
  
  if (dnsOk && httpsOk && oauthOk) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('   Your network can reach Google OAuth services.');
    console.log('   The issue may be with:');
    console.log('   - Google Console configuration');
    console.log('   - OAuth credentials in .env file');
    console.log('   - Callback URL mismatch');
  } else {
    console.log('❌ NETWORK CONNECTIVITY ISSUES DETECTED\n');
    
    if (!dnsOk) {
      console.log('🔧 DNS Resolution Failed:');
      console.log('   1. Check internet connection');
      console.log('   2. Try changing DNS servers:');
      console.log('      - Open Network Settings');
      console.log('      - Change DNS to: 8.8.8.8, 8.8.4.4 (Google)');
      console.log('      - Or: 1.1.1.1, 1.0.0.1 (Cloudflare)');
      console.log('   3. Flush DNS cache:');
      console.log('      PowerShell: ipconfig /flushdns');
      console.log('   4. Check hosts file:');
      console.log('      C:\\Windows\\System32\\drivers\\etc\\hosts');
    }
    
    if (!httpsOk) {
      console.log('\n🔧 HTTPS Connection Failed:');
      console.log('   1. Check firewall settings');
      console.log('   2. Check proxy settings');
      console.log('   3. Disable VPN temporarily');
      console.log('   4. Check antivirus/security software');
    }
    
    if (!oauthOk) {
      console.log('\n🔧 OAuth Endpoint Failed:');
      console.log('   1. All of the above DNS/HTTPS fixes');
      console.log('   2. Verify internet connection is stable');
    }
  }
  
  console.log('\n6️⃣ Quick Tests You Can Run:');
  console.log('-'.repeat(70));
  console.log('PowerShell commands:');
  console.log('  ping www.googleapis.com');
  console.log('  nslookup www.googleapis.com');
  console.log('  Test-NetConnection www.googleapis.com -Port 443');
  console.log('  curl https://www.googleapis.com');
}

async function runDiagnostics() {
  try {
    await checkSystemDNS();
    const dnsOk = await testDNS();
    const httpsOk = dnsOk ? await testHTTPS() : false;
    const oauthOk = httpsOk ? await testOAuthEndpoint() : false;
    await suggestFixes(dnsOk, httpsOk, oauthOk);
    
    console.log('\n═'.repeat(70));
    console.log('Diagnostics Complete!');
    console.log('═'.repeat(70));
  } catch (error) {
    console.error('\n❌ Diagnostic Error:', error.message);
  }
}

runDiagnostics();
