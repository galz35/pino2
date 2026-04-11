async function testLogin() {
  try {
    const res = await fetch('http://localhost:3010/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin_test@lospinos.com', password: 'admin123' })
    });
    const status = res.status;
    const body = await res.text();
    console.log(`STATUS: ${status}`);
    console.log(`BODY: ${body}`);
  } catch (e) {
    console.error('FETCH ERROR:', e.message);
  }
}
testLogin();
