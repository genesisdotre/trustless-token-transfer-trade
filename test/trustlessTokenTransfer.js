const { expectThrow, increaseTime, latestTime, toWei } = require('./helpers')

const TrustlessTokenTransferTrade = artifacts.require('TrustlessTokenTransferTrade')
const ERC20 = artifacts.require('ERC20')
  
contract('TrustlessTokenTransferTrade', async function(accounts) {
    const creator = accounts[0]
    const guy1 = accounts[1];
    const guy2 = accounts[2];
    const guy3 = accounts[3];

    const ETH = 10**18;
    const decimalplaces = 10**18;
    const day = 24 * 60 * 60;
    
    let rate = 20000;
    let now = Math.floor((+new Date()) / 1000);
    let tradeableToken;
    let trustless;
    
    beforeEach(async function() {
        now = await latestTime();
        tradeableToken = await ERC20.new({ from: creator } );
        await tradeableToken.mint(creator, toWei("10"), { from: creator }); 
        trustless = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
    })
  
    it('Simple use case 1', async () => {
        await tradeableToken.transfer(trustless.address, toWei("8"), {from: creator });
        await trustless.sendTransaction({ value: 0.6 * ETH, from: guy1 });

        let guy1BalanceToken = await tradeableToken.balanceOf.call(guy1);

        console.log(guy1BalanceToken.toString());

        let guy1BalanceTokenFromWei = web3.utils.fromWei(guy1BalanceToken);

        console.log(guy1BalanceTokenFromWei);

        assert.equal(guy1BalanceTokenFromWei, 0.5 * rate, "guy 1 should get the correct");

        // await trustless.sendTransaction({ value: toWei("4"), from: guy2 });
        // let guy2BalanceToken = await tradeableToken.balanceOf(guy1, { from: anyone });
        // let guy2BalanceTokenFromWei = web3.utils.fromWei(guy1BalanceToken);
        // assert.equal(guy1BalanceTokenFromWei, 0.5 * rate, "guy 1 should get the correct");


        assert.equal(1, 1, "one equals 1")

    });





  })