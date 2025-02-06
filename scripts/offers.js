const axios = require('axios');
const cheerio = require('cheerio');

// A list of user-agent strings to rotate through
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 15_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
  // Add more modern user-agents
];

// Proxy list (Use a paid service for best results)
const proxies = [
  'http://username:password@proxy1.example.com:8080',
  'http://username:password@proxy2.example.com:8080',
];

// Helper functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithProtection(url) {
  try {
    const randomUserAgent = userAgents[getRandomInt(0, userAgents.length - 1)];
    const randomProxy = proxies.length > 0 ? proxies[getRandomInt(0, proxies.length - 1)] : null;

    const headers = {
      'User-Agent': randomUserAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': url,
      'Origin': url.split('/').slice(0, 3).join('/'),
      'DNT': '1', // Do Not Track
    };

    console.log(`🌍 Fetching: ${url} with User-Agent: ${randomUserAgent}`);
    
    const response = await axios.get(url, {
      headers,
      proxy: randomProxy ? { 
        host: new URL(randomProxy).hostname,
        port: new URL(randomProxy).port,
        auth: {
          username: new URL(randomProxy).username,
          password: new URL(randomProxy).password
        }
      } : false, 
    });

    return response.data;
  } catch (error) {
    console.error('🚨 Fetch error:', error.message);
    throw error;
  }
}

async function getLinks(url) {
  try {
    const html = await fetchWithProtection(url);
    const $ = cheerio.load(html);
    const links = [];

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href) {
        links.push({ href: href.trim(), text });
      }
    });

    await delay(getRandomInt(2000, 5000)); // Simulate human delay
    return links;
  } catch (error) {
    console.error('Error getting links:', error);
    throw error;
  }
}

async function getDetails(url) {
  try {
    const html = await fetchWithProtection(url);
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const location = $('span.css-1o4wo1x').text().trim();
    let salary = $('span.css-1pavfqb').text().trim().replace(/\s+/g, ' ');

    const techStack = [];
    $('ul.css-vdxqko div.MuiBox-root').each((_, element) => {
      const techTitle = $(element).find('h4.MuiTypography-root').text().trim();
      const techLevel = $(element).find('span.MuiTypography-root.MuiTypography-subtitle4').text().trim();
      if (techTitle && techLevel) {
        techStack.push(`${techTitle} (${techLevel})`);
      }
    });

    await delay(getRandomInt(2000, 5000)); // More random delay
    return { title, location, salary, techStack: techStack.join(', ') };
  } catch (error) {
    console.error('Error getting job details:', error);
    throw error;
  }
}

module.exports = { getLinks, getDetails };
