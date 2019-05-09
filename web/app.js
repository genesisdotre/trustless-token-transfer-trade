(async function main() {

    ABI = [{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_rate","type":"uint256"},{"name":"_validTo","type":"uint256"}],"name":"updateRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isRateValid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"validTo","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_ERC20TokenAddress","type":"address"},{"name":"_rate","type":"uint256"},{"name":"_validTo","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ETH","type":"uint256"},{"indexed":false,"name":"tokens","type":"uint256"},{"indexed":false,"name":"rate","type":"uint256"}],"name":"Trade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"rate","type":"uint256"}],"name":"ExchangeRateUpdated","type":"event"}];
    address = "0xd3a4e90defae77874ef95119e3e59c70a741c63d";
    contract = new web3.eth.Contract(ABI, address);

    let validTo = await contract.methods.validTo().call(); $("#validTo").val(validTo);
    
    let rate = await contract.methods.rate().call(); $("#rate").val(rate);

    let network = await web3.eth.net.getId();
    

    function testNetworkTestnetRopsten() {
        if (network !== 3) {
            gotofail();
        }
        
        let networkLongPolling = setInterval(async function(){
            network = await web3.eth.net.getId();
        
            if (network !== 3) {
                clearInterval(networkLongPolling);
                gotofail();
            }
        }, 1000);
    }

    testNetworkTestnetRopsten();

    function gotofail() {
        console.log("WRONG NETWORK");
    }


    $("#send").on("click", function() {
        console.log("ETH: " + $("#eth").val() );
    })

})();