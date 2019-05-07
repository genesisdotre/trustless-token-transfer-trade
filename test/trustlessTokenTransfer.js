const { expectThrow, increaseTime, latestTime, toWei, fromWei } = require('./helpers')

const TrustlessTokenTransferTrade = artifacts.require('TrustlessTokenTransferTrade')
const ERC20 = artifacts.require('ERC20')
  
contract('TrustlessTokenTransferTrade', async function(accounts) {
    const creator = accounts[0]
    const guy1 = accounts[1];
    const guy2 = accounts[2];
    const guy3 = accounts[3];
    const day = 24 * 60 * 60;
    const ETH = 1e18;

    let rate;
    let temp;
    let creatorBalanceBefore;
    let creatorBalanceAfter;
    
    let now = Math.floor((+new Date()) / 1000);
    let tradeableToken;
    let tttt;
    
    beforeEach(async function() {
        now = await latestTime();
        tradeableToken = await ERC20.new({ from: creator } );    
    })

    it('Simple use case 1', async () => {
        rate = 1; // 1 ETH gets you 1 token
        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("1"), { from: creator }); 

        await tttt.sendTransaction({ value: toWei("0.5"), from: guy1 });
        let guy1TokenBalance = web3.utils.fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.5 * rate, "guy 1 should get the correct");

        await tttt.sendTransaction({ value: toWei("1"), from: guy2 });
        let guy2TokenBalance = web3.utils.fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy2TokenBalance, 0.5 * rate, "guy 2 should get the correct");

        let guy2ETHbalane = parseInt(fromWei(await web3.eth.getBalance(guy2)));
        assert.equal(guy2ETHbalane, 99.5, "guy 2 should have ETH refunded back");
    });


  
    it('Simple use case n', async () => {
        let rate = 20000; // 1 ETH gets you that much of the token

        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("100000"), { from: creator }); 

        let creatorETHBalanceBefore = parseInt(fromWei(await web3.eth.getBalance(creator)));

        await tttt.sendTransaction({ value: toWei("0.6"), from: guy1 });
        let guy1TokenBalance = web3.utils.fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.6 * rate, "guy 1 should get the correct");

        await tttt.sendTransaction({ value: toWei("4"), from: guy2 });
        let guy2TokenBalance = web3.utils.fromWei(await tradeableToken.balanceOf.call(guy2));
        assert.equal(guy2TokenBalance, 4 * rate, "guy 2 should get the correct");

        let guy3ETHbalanceBefore = parseInt(fromWei(await web3.eth.getBalance(guy3)));
        await tttt.sendTransaction({ value: toWei("1"), from: guy3 });
        let guy3TokenBalance = web3.utils.fromWei(await tradeableToken.balanceOf.call(guy3));
        assert.equal(guy3TokenBalance, 0.4 * rate, "guy 3 should get the correct");
        let guy3ETHbalanceAfter = parseInt(fromWei(await web3.eth.getBalance(guy3)));
        


        // console.log(balanceBefore);
        // console.log("string");
        // console.log(0.4*ETH)
        // console.log(12345)
        // console.log(balanceBefore + 0.4*ETH)


        assert.closeTo(guy3ETHbalanceBefore, guy3ETHbalanceAfter + 0.4, 0.01, "guy 3 shuold have the ETH refunded");

        let creatorETHBalanceAfter = parseInt(fromWei(await web3.eth.getBalance(creator)));
        assert.closeTo(creatorETHBalanceBefore + 5, creatorETHBalanceAfter, 0.01, "creator should have earned 5 ETH in the process");
    });

    // it('Simple use case 2', async () => {
    //     await tradeableToken.mint(creator, toWei("100000"), { from: creator }); 
    //     await tradeableToken.transfer(tttt.address, toWei("100000"), {from: creator });
    //     creatorBalanceBefore = await web3.eth.getBalance(creator);

    //     await tttt.sendTransaction({ value: toWei("0.6"), from: guy1 });
    //     let guy1BalanceToken = await tradeableToken.balanceOf.call(guy1);
    //     let guy1BalanceTokenFromWei = web3.utils.fromWei(guy1BalanceToken);
    //     assert.equal(guy1BalanceTokenFromWei, 0.6 * rate, "guy 1 should get the correct");

    //     await tttt.sendTransaction({ value: toWei("4"), from: guy2 });
    //     let guy2BalanceToken = await tradeableToken.balanceOf.call(guy2);
    //     let guy2BalanceTokenFromWei = web3.utils.fromWei(guy2BalanceToken);
    //     assert.equal(guy2BalanceTokenFromWei, 4 * rate, "guy 2 should get the correct");

    //     balanceBefore = await web3.eth.getBalance(guy3);
    //     await tttt.sendTransaction({ value: toWei("1"), from: guy3 });
    //     let guy3BalanceToken = await tradeableToken.balanceOf.call(guy3);
    //     let guy3BalanceTokenFromWei = web3.utils.fromWei(guy3BalanceToken);
    //     assert.equal(guy3BalanceTokenFromWei, 0.4 * rate, "guy 3 should get the correct");
    //     balanceAfter = await web3.eth.getBalance(guy3);
    //     creatorBalanceAfter = await web3.eth.getBalance(creator);

    //     assert.closeTo(balanceBefore + 0.4*ETH, balanceAfter, 0.01 * ETH, "guy 3 shuold have the ETH refunded");
    //     assert.closeTo(creatorBalanceBefore + 5*ETH, creatorBalanceAfter, 0.01 * ETH, "creator should have earned 5 ETH in the process");
    // });





  })