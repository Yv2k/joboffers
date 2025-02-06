const express = require('express');
const cors = require('cors');
const { getLinks, getDetails } = require('./scripts/getLinks');
const { baseURL } = require('./config');

const app = express();
const port = 3000;

app.use(cors());

// Flag to ensure only one fetch per server run
let hasFetched = false;
let fetchedJobDetails = null;

app.get('/fetch-job', async (req, res) => {
  if (hasFetched) {
    return res.status(403).json({
      error: 'Fetching has already been performed for this server session. Restart the server to fetch again.'
    });
  }

  try {
    console.log('🔍 Fetching job links from:', baseURL);
    
    // Step 1: Get links, but stop at the first valid job link
    let jobUrl = null;
    const links = await getLinks(baseURL);

    for (const link of links) {
      const fullUrl = link.href.startsWith('http') ? link.href : `${baseURL}${link.href}`;
      
      if (fullUrl.includes('/job-offer/')) {
        jobUrl = fullUrl;
        console.log('✅ Found job offer link:', jobUrl);
        break; // Stop immediately after finding one valid job link
      }
    }

    if (!jobUrl) {
      console.log('❌ No job offer links found.');
      return res.status(404).json({ error: 'No job links found' });
    }

    // Step 2: Introduce a random delay (1-3s) before fetching job details
    const delayMs = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    console.log(`⏳ Waiting ${delayMs}ms before fetching job details...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Step 3: Fetch job details
    fetchedJobDetails = await getDetails(jobUrl);
    hasFetched = true; // Lock fetching for this session

    res.json(fetchedJobDetails);
  } catch (error) {
    console.error('⚠️ Fetching error:', error);
    res.status(500).json({ error: 'Failed to fetch job details', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
