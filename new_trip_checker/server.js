const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const API_URL = 'https://api.transport.nsw.gov.au/v2/gtfs/alerts/buses?format=json';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ1bk9fd0V0WVpvYkJwUFRmQUFRYlo5VzNoeWZ3NUg3UmtFYlE3a2dZZ0hnIiwiaWF0IjoxNzc2NTI1NzczfQ.eSOAGegdSdArcwvOYwa5R_Ml12S_HL6JTrSy8TxOosw';

console.log('*** THIS IS THE NEW SERVER FILE ***');
app.get('/api/alerts', async (req, res) => {
  console.log('API route was hit at', new Date().toLocaleString());

  const requestTime = new Date();

  try {
    console.log(`[${requestTime.toLocaleString()}] Fetching live TfNSW alerts...`);

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `apikey ${API_KEY}`
      }
    });

    if (!response.ok) {
      console.log(
        `[${new Date().toLocaleString()}] Upstream API error: ${response.status}`
      );

      return res.status(response.status).json({
        error: `Upstream API error: ${response.status}`
      });
    }

    const data = await response.json();

    const feedTimestamp = data.header?.timestamp
      ? new Date(Number(data.header.timestamp) * 1000).toLocaleString()
      : 'No feed timestamp';

    const alertCount = Array.isArray(data.entity) ? data.entity.length : 0;

    console.log(
      `[${new Date().toLocaleString()}] Success: ${alertCount} alerts returned | Feed timestamp: ${feedTimestamp}`
    );

    res.json(data);
  } catch (error) {
    console.error(
      `[${new Date().toLocaleString()}] Server fetch failed:`,
      error
    );
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.listen(3000, () => {
  console.log(`[${new Date().toLocaleString()}] Server running at http://localhost:3000`);
});