module.exports = {
    increaseTime: (duration) => {
      const id = Date.now();
    
      return new Promise((resolve, reject) => {
        web3.currentProvider.send({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [duration],
          id: id,
        }, err1 => {
          if (err1) return reject(err1);
    
          web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1,
          }, (err2, res) => {
            return err2 ? reject(err2) : resolve(res);
          });
        });
      });
    },
   
    // THESE ARE NOT USED IN THIS TEST SUITE
    
    // mineBlock: () => {
    //   web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine"})
    // }, 
   
    // getBlockByNumber: () => {
    //   return web3.currentProvider.send({jsonrpc: "2.0", method: "eth_getBlockByNumber", params: ["latest", true]})
    // }, 
   
    // getTransactionReceipt: hash => {
    //   return web3.currentProvider.send({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [hash]})
    // },

    latestTime: async () => {
      const block = await web3.eth.getBlock('latest')
      return block.timestamp;
    },

    toWei: (eth) => {
      return web3.utils.toWei(eth);
    },

    fromWei: (stringWithLoadsOfZeros) => {
      return web3.utils.fromWei(stringWithLoadsOfZeros);
    },
   
    expectThrow: async promise => {
      try {
        await promise
      } catch (error) {
        const invalidJump = error.message.search('invalid JUMP') >= 0
        const invalidOpcode = error.message.search('invalid opcode') >= 0
        const outOfGas = error.message.search('out of gas') >= 0
        // TODO: Test if the error is a revert.
        return
      }
   
      assert.fail('Expected throw not received')
    },
   
}