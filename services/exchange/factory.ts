import { GeminiService } from './gemini';
import { BinanceService } from './binance';
import { CoinbaseService } from './coinbase';
import { KrakenService } from './kraken';
import { BitgetService } from './bitget';
import { IExchangeService } from './base';

const services: Record<string, IExchangeService> = {
  gemini: new GeminiService(),
  binance: new BinanceService(),
  coinbase: new CoinbaseService(),
  kraken: new KrakenService(),
  bitget: new BitgetService(),
};

export function getExchangeService(exchangeName: string): IExchangeService {
  const service = services[exchangeName.toLowerCase()];
  if (!service) {
    throw new Error(`Exchange service not found for: ${exchangeName}`);
  }
  return service;
}