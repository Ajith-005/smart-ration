(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/issue-ration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardNumber: 'RC002',
        products: [{ productName: 'Rice', quantity: 15, unit: 'kg' }]
      })
    });

    const body = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', body);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
