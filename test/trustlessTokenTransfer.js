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

        await expectThrow( tttt.sendTransaction({ value: toWei("0.5"), from: guy1 }) ); // rate no longer valid

        let newRate = 2;

        await tttt.updateRate(newRate, await latestTime() + 3600, { from: creator });

        await tttt.sendTransaction({ value: toWei("0.2"), from: guy1 });

        let guy1TokenBalance = fromWei(await tradeableToken.balanceOf.call(guy1));
        assert.equal(guy1TokenBalance, 0.2 * newRate, "guy 1 should get the correct amount");


        let trustlessTokenBalance = fromWei(await tradeableToken.balanceOf.call(tttt.address));
        assert.equal(trustlessTokenBalance, 0.6, "balance of the contract should be OK");

    });


    it('Only owner can change the rate', async () => {
        let rate = 1;
        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, rate, now + day, { from: creator } );

        await expectThrow( tttt.updateRate(666, now, { from: guy1 }) ); // cannot update, only creator can

        let newRate = 2;
        tttt.updateRate(newRate, now + 1500, { from: creator });

        let retrievedRate = await tttt.rate.call();
        let retrievedValidTo = await tttt.validTo.call();

        assert.equal(retrievedRate, 2, "Rate should be updated");
        assert.equal(retrievedValidTo, now + 1500, "ValidTo should be updated");
    });

    it('Should allow withdrawing tokens', async () => {
        tttt = await TrustlessTokenTransferTrade.new(tradeableToken.address, 1000, now + day, { from: creator } );
        await tradeableToken.mint(tttt.address, toWei("1000000"), { from: creator }); 

        let creatorETHBalanceBefore = fromWei(await web3.eth.getBalance(creator));
        await tttt.sendTransaction({ value: toWei("1"), from: guy1 }); 

        // I mint 1m tokens
        // 1 ETH = 1k 
        // guy1 sends 1ETH, so will receive 1k tokens
        // The owner should receive 1 ETH from that transaction
        // The owner should receive 999k tokens when refunded

        let guy1TokenBalance = await tradeableToken.balanceOf.call(guy1);
        assert.equal(toWei("1000"), guy1TokenBalance, "guy 1 should receive tokens");

        await expectThrow( tttt.withdraw( { from: guy1 }) );  // cannot withdraw, only owner can
        await expectThrow( tttt.sendTransaction( { from: guy1 }) );  // cannot send empty transaction, needs to have value

        await tttt.withdraw( { from: creator });

        let creatorTokenBalance = fromWei(await tradeableToken.balanceOf.call(creator));
        assert.equal(999000, creatorTokenBalance, "creator should receive withdrawn tokens");

        let creatorETHBalanceAfter = fromWei(await web3.eth.getBalance(creator));
        assert.closeTo(parseFloat(creatorETHBalanceBefore) + 1, parseFloat(creatorETHBalanceAfter), 0.01 * ETH, "creator should get 1 ETH more than initially");

    });


  })