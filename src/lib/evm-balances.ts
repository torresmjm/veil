export interface Eip1193ReadProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export interface TokenDefinition {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

export interface AssetBalance {
  symbol: string;
  name: string;
  decimals: number;
  amount: string;
  kind: 'native' | 'token';
}

export interface WalletBalanceResult {
  chainId: number;
  nativeSymbol: string;
  assets: AssetBalance[];
  failedTokens: string[];
}

const TOKEN_LISTS: Record<number, TokenDefinition[]> = {
  1: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  ],
  42161: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    { symbol: 'LINK', name: 'Chainlink', address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', decimals: 18 },
  ],
  8453: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', decimals: 18 },
  ],
};

const NATIVE_ASSETS: Record<number, { symbol: string; name: string }> = {
  1: { symbol: 'ETH', name: 'Ether' },
  10: { symbol: 'ETH', name: 'Ether' },
  137: { symbol: 'POL', name: 'POL' },
  8453: { symbol: 'ETH', name: 'Ether' },
  42161: { symbol: 'ETH', name: 'Ether' },
  43114: { symbol: 'AVAX', name: 'Avalanche' },
  11155111: { symbol: 'ETH', name: 'Sepolia Ether' },
};

function formatUnits(raw: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals);
  const whole = raw / scale;
  const fraction = (raw % scale).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function parseQuantity(value: unknown): bigint {
  if (typeof value !== 'string' || !/^0x[0-9a-f]+$/i.test(value)) {
    throw new Error('Invalid balance response');
  }
  return BigInt(value);
}

function balanceOfCallData(address: string): string {
  const normalized = address.toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{40}$/.test(normalized)) throw new Error('Invalid wallet address');
  return `0x70a08231${normalized.padStart(64, '0')}`;
}

export async function readEvmBalances(
  provider: Eip1193ReadProvider,
  address: string,
  chainIdHex: string,
): Promise<WalletBalanceResult> {
  const chainId = Number.parseInt(chainIdHex, 16);
  if (!Number.isInteger(chainId) || chainId <= 0) throw new Error('Unsupported wallet network');
  const native = NATIVE_ASSETS[chainId] ?? { symbol: 'Native', name: 'Native asset' };
  const nativeBalance = provider.request({ method: 'eth_getBalance', params: [address, 'latest'] });
  const tokenDefinitions = TOKEN_LISTS[chainId] ?? [];
  const tokenBalances = tokenDefinitions.map(async token => {
    const result = await provider.request({
      method: 'eth_call',
      params: [{ to: token.address, data: balanceOfCallData(address) }, 'latest'],
    });
    return { token, raw: parseQuantity(result) };
  });
  const [nativeResult, ...tokenResults] = await Promise.allSettled([nativeBalance, ...tokenBalances]);
  if (nativeResult.status === 'rejected') throw nativeResult.reason;

  const assets: AssetBalance[] = [{
    symbol: native.symbol,
    name: native.name,
    decimals: 18,
    amount: formatUnits(parseQuantity(nativeResult.value), 18),
    kind: 'native',
  }];
  const failedTokens: string[] = [];
  tokenResults.forEach((result, index) => {
    const token = tokenDefinitions[index];
    if (result.status === 'fulfilled') {
      assets.push({ symbol: token.symbol, name: token.name, decimals: token.decimals, amount: formatUnits(result.value.raw, token.decimals), kind: 'token' });
    } else {
      failedTokens.push(token.symbol);
    }
  });

  return { chainId, nativeSymbol: native.symbol, assets, failedTokens };
}
