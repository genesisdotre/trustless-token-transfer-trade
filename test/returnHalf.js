function toWei(eth) {
    return web3.utils.toWei(eth);
}

function fromWei(stringWithLoadsOfZeros) {
    return web3.utils.fromWei(stringWithLoadsOfZeros);
}

const ReturnHalf = artifacts.require('ReturnHalf')
  
contract('Why msg.sender.transfer works in Remix but does NOT work in Truffle ', async function(accounts) {
    const creator = accounts[0]
    const guy1 = accounts[1];

    it('Simple use case 1', async () => {
        let returnHalf = await ReturnHalf.new({ from: creator } );   

        let guy1ETHbalanceBefore = parseInt(fromWei(await web3.eth.getBalance(guy1)));

        let weiString = toWei("1", "ether");
        console.log("I will send: " + weiString);

        await returnHalf.sendTransaction({ value: weiString, from: guy1 });

        let guy1ETHbalanceAfter = parseInt(fromWei(await web3.eth.getBalance(guy1)));

        console.log("Before: " + guy1ETHbalanceBefore);
        console.log("After: " + guy1ETHbalanceAfter);

        assert.equal(guy1ETHbalanceBefore, guy1ETHbalanceAfter + 0.5, "sent 1ETH, half should be returned");
    });

})