import { Currency, ETHER, Token, CurrencyAmount } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'
import { supportedChainId } from './supportedChainId'
import { ChainId, WETH9 } from '../constants/goerliConstants'

export function wrappedCurrencyInternal(currency: Currency, chainId: ChainId): Token {
  if (currency.isToken) {
    invariant(currency.chainId === chainId, 'CHAIN_ID')
    return currency
  }
  if (currency.isEther) return WETH9[chainId]
  throw new Error('CURRENCY')
}

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency ? wrappedCurrencyInternal(currency, chainId) : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount<Currency> | undefined,
  chainId: ChainId | undefined
): CurrencyAmount<Token> | undefined {
  return currencyAmount && chainId
    ? CurrencyAmount.fromFractionalAmount(
        wrappedCurrencyInternal(currencyAmount.currency, chainId),
        currencyAmount.numerator,
        currencyAmount.denominator
      )
    : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.isEther) return token
  const formattedChainId = supportedChainId(token.chainId)
  if (formattedChainId && token.equals(WETH9[formattedChainId])) return ETHER
  return token
}
