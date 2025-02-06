const axios = require('axios');
const cheerio = require('cheerio');
const HttpsProxyAgent = require('https-proxy-agent');

// Proxy list (replace with actual credentials from Proxy-Cheap)
const proxies = [
  'http://user1:pass1@proxy1:port1',
  'http://user2:pass2@proxy2:port2',
  'http://user3:pass3@proxy3:port3',
];

// User-Agent list for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
  'Mozilla/5.0 (X11; Linux x86_64)...',
];

// Helper functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithProxy(url) {
  const proxy = getRandomItem(proxies);
  const userAgent = getRandomItem(userAgents);
  const agent = new HttpsProxyAgent(proxy);

  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: { 'User-Agent': userAgent },
    });
    return response.data;
  } catch (error) {
    console.error(`Request failed using proxy ${proxy}:`, error.message);
    return null;
  }
}

async function getLinks(url) {
  try {
    const html = await fetchWithProxy(url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const links = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href && href.includes('/job-offer/')) {
        links.push(href.trim());
      }
    });

    console.log('Scraped Links:', links);
    return links;
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

async function getDetails(url) {
  try {
    await delay(Math.random() * 3000 + 1000); // Simulate human-like delay
    const html = await fetchWithProxy(url);
    if (!html) return {};

    const $ = cheerio.load(html);
    return {
      title: $('h1').text().trim(),
      location: $('span.css-1o4wo1x').text().trim(),
      salary: $('span.css-1pavfqb').text().trim().replace(/\s+/g, ' '),
      techStack: $('ul.css-vdxqko div.MuiBox-root h4.MuiTypography-root')
        .map((i, el) => $(el).text().trim())
        .get()
        .join(', '),
    };
  } catch (error) {
    console.error('Error scraping job details:', error);
    return {};
  }
}

module.exports = { getLinks, getDetails };
