const { expectThrow, increaseTime, latestTime, toWei, fromWei } = require('./helpers')

const TrustlessTokenTransferTrade = artifacts.require('TrustlessTokenTransferTrade')
const ERC20 = artifacts.require('ERC20')
  
contract('TrustlessTokenTransferTrade', async function(accounts) {
    const creator = accounts[0]
    const guy1 = accounts[1];
    const guy2 = accounts[2];
    const guy3 = accounts[3];
    const day = 24 * 60 * 60;

    let now;
    let tradeableToken;
    let tttt;
    
    beforeEach(async function() {
        now = await latestTime();
        tradeableToken = await ERC20.new({ from: creator } );    
    })

    it('Simple use case 1', async () => {
        let rate = 1; // 1 ETH gets you that much of the token
        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("1"), { from: creator }); 

        await tttt.sendTransaction({ value: toWei("0.5"), from: guy1 });
        let guy1TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.5 * rate, "guy 1 should get the correct");

        await tttt.sendTransaction({ value: toWei("1"), from: guy2 });
        let guy2TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy2TokenBalance, 0.5 * rate, "guy 2 should get the correct");

        let guy2ETHbalance = parseFloat(fromWei(await web3.eth.getBalance(guy2)));
        assert.closeTo(guy2ETHbalance, 99.5, 0.05, "guy 2 should have ETH refunded back");
    });

    it('Simple use case 2', async () => {
        let rate = 20000; 

        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("100000"), { from: creator }); 

        let creatorETHBalanceBefore = parseFloat(fromWei(await web3.eth.getBalance(creator)));

        await tttt.sendTransaction({ value: toWei("0.6"), from: guy1 });
        let guy1TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.6 * rate, "guy 1 should get the correct");

        await tttt.sendTransaction({ value: toWei("4"), from: guy2 });
        let guy2TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy2));
        assert.equal(guy2TokenBalance, 4 * rate, "guy 2 should get the correct");

        let guy3ETHbalanceBefore = parseFloat(fromWei(await web3.eth.getBalance(guy3)));
        await tttt.sendTransaction({ value: toWei("1"), from: guy3 });
        let guy3TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy3));
        assert.equal(guy3TokenBalance, 0.4 * rate, "guy 3 should get the correct");
        let guy3ETHbalanceAfter = parseFloat(fromWei(await web3.eth.getBalance(guy3)));
        
        assert.closeTo(guy3ETHbalanceBefore, guy3ETHbalanceAfter + 0.4, 0.05, "guy 3 shuold have the ETH refunded");

        let creatorETHBalanceAfter = parseFloat(fromWei(await web3.eth.getBalance(creator)));
        assert.closeTo(creatorETHBalanceBefore + 5, creatorETHBalanceAfter, 0.05, "creator should have earned 5 ETH in the process");
    });

    it('Should disallow tradinng after expiry date', async () => {
        let rate = 1;
        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("1"), { from: creator }); 

        await increaseTime(day);

        await tttt.updateRate(toWei(rate.toString()), await latestTime() + 3600, { from: creator });

        await tttt.sendTransaction({ value: toWei("0.5"), from: guy1 });

        let guy1TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.5 * rate, "guy 1 should get the correct");
    });

  })