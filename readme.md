I am 


https://0x.org/otc

https://medium.com/@pintail/uniswap-a-good-deal-for-liquidity-providers-104c0b6816f2



Some issues: https://github.com/ethereum/web3.js/issues/2077#issuecomment-490027735

More issues: https://github.com/trufflesuite/truffle/issues/1994

Extra caution with the way how you interpret numbers.

JavaScript is losing precision:

`parseInt("1000000000000000000001") === parseInt("1000000000000000000000")`

That's why using BigNumber

That's why sometimes passing numbers as strings.

`toWei`, `fromWei`, `parseInt`, `parseFloat` I made a silly error when writing tests.

The Solidity contract was working fine at all time. It was the JavaScript test that was failing.



```
$ truffle version
Truffle v5.0.14 (core: 5.0.14)
Solidity v0.5.0 (solc-js)
Node v10.15.3
Web3.js v1.0.0-beta.37
```
