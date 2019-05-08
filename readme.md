# Trustless Token Transfer Trade

I've just deployed this code...

Trying with a small amount (on testnet) first is a good idea.

### Design goals

* Simplicity
* Transparency
* Check the code - it's that simple!

### Why selling?

A little bit too much:

* Participated in the ICO
* Airdrop
* Bounty: https://github.com/kleros/openiico-contract/graphs/contributors
* Pilot: https://blog.kleros.io/submit-tokens-for-a-share-of-1-million-pnk/
* Hackathon: https://github.com/kleros/hackathon/issues/1

You don’t keep all your eggs in a single basket.

It would irresponsible not to diversify.

I believe in the project and I wil still hodl significant portion of PNK.

While trading some of it, I don't want to crash the market as the daily volume is low - see <a href="https://coinmarketcap.com/currencies/kleros/">CoinMarketCap</a>.

On the upside - the inverse is also true. A few BTC coming in can increase the price. I'


### Desired side effects

1. Do you like my code? Do you like my style? You may want to hire me for side projects.

2. You may want to engage in the Kleros community, become a juror, build future of justice.


### 0x and Uniswap
* https://0x.org/otc - need to figure it out

* https://medium.com/@pintail/uniswap-a-good-deal-for-liquidity-providers-104c0b6816f2 - not much profits


### Be careful with numbers

Some issues: https://github.com/ethereum/web3.js/issues/2077#issuecomment-490027735

More issues: https://github.com/trufflesuite/truffle/issues/1994

Extra caution with the way how you interpret numbers.

JavaScript is losing precision:

`parseInt("1000000000000000000001") === parseInt("1000000000000000000000")`

That's why using BigNumber

That's why sometimes passing numbers as strings.

`toWei`, `fromWei`, `parseInt`, `parseFloat` I made a silly error when writing tests.

The Solidity contract was working fine at all time. It was the JavaScript test that was failing.


### Developed with versions


```
$ truffle version
Truffle v5.0.14 (core: 5.0.14)
Solidity v0.5.0 (solc-js)
Node v10.15.3
Web3.js v1.0.0-beta.37
```
