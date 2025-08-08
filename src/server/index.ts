import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// GMGN token info proxy (Solana)
app.get('/api/gmgn/token/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    // gmgn принимает только sol, пока поддерживаем solana по умолчанию
    const url = `https://gmgn.ai/defi/quotation/v1/tokens/sol/${address}`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    });

    res.json(data);
  } catch (err: any) {
    console.error('GMGN token proxy error', err?.message);
    res.status(500).json({ error: 'GMGN token proxy failed' });
  }
});

// Trending proxy
app.get('/api/trending', async (req: Request, res: Response) => {
  try {
    const {
      chain = 'eth',
      timePeriod = '6h',
      criteria = 'swaps',
      direction = 'desc',
    } = req.query as Record<string, string>;

    const url = `https://gmgn.ai/defi/quotation/v1/rank/${chain}/swaps/${timePeriod}?&orderby=${criteria}&direction=${direction}&filters[]=not_honeypot&filters[]=verified&filters[]=renounced`;

    const { data } = await axios.get(url, { timeout: 10000 });
    res.json(data);
  } catch (err: any) {
    console.error('Trending proxy error', err?.message);
    res.status(500).json({ error: 'GMGN proxy failed' });
  }
});

// Rugcheck API integration
app.get('/api/rugcheck/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    // Call rugcheck.xyz API - using the correct endpoint
    const rugcheckUrl = `https://api.rugcheck.xyz/api/v1/check/${address}`;
    const { data } = await axios.get(rugcheckUrl, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    res.json(data);
  } catch (err: any) {
    console.error('Rugcheck API error', err?.message);
    // Return safe default if API fails
    res.json({
      status: 'unknown',
      score: 0,
      risk_factors: [],
      message: 'Unable to check security status'
    });
  }
});

// Basic token info (placeholder)
app.get('/api/token/:address/basic', async (req: Request, res: Response) => {
  const { address } = req.params;
  // TODO: replace with real logic per chain
  res.json({
    marketCap: 0,
    topHolders: 0,
    devHolding: 0,
    lpBurned: 0,
    address,
  });
});

app.listen(PORT, () => {
  console.log(`GMGN proxy server listening on port ${PORT}`);
}); 