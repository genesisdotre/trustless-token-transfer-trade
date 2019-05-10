var bncAssistConfig = {
    dappId: "ef72f8d0-ca72-4571-98b1-b96e8c046c69",
    networkId: 3, // Ropsten
    web3: web3
};
var assistInstance = assist.init(bncAssistConfig);        
assistInstance.onboard()
    .then(async function(success) {
        console.log("EVERYTHING OK, no action needed");
        // User has been successfully onboarded and is ready to transact
        // This means we can be sure of the follwing user properties:
        //  - They are using a compatible browser
        //  - They have a web3-enabled wallet installed
        //  - The wallet is connected to the config-specified networkId
        //  - The wallet is unlocked and contains at least `minimumBalance` in wei
        //  - They have connected their wallet to the dapp, congruent with EIP1102

        ABI = [{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_rate","type":"uint256"},{"name":"_validTo","type":"uint256"}],"name":"updateRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isRateValid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"validTo","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kamikaze","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_ERC20TokenAddress","type":"address"},{"name":"_rate","type":"uint256"},{"name":"_validTo","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ETH","type":"uint256"},{"indexed":false,"name":"tokens","type":"uint256"},{"indexed":false,"name":"rate","type":"uint256"}],"name":"Trade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"rate","type":"uint256"}],"name":"ExchangeRateUpdated","type":"event"}]
        address = "0x765eb7a0cb7ecb9cc555e8ad77d13396d1052c3c";
        contractRaw = new web3.eth.Contract(ABI, address);
        contract = assistInstance.Contract(contractRaw)
        account = (await web3.eth.getAccounts())[0];
    
        validTo = await contract.methods.validTo().call(); 
        $("#validTo").val(new Date(validTo * 1000).toUTCString());

        rate = await contract.methods.rate().call(); 
        $("#rate").val(rate); 
        $("#rateLabel").text(`Current rate 1 ETH = ${rate} ERC:`)
        $("#eth").trigger("input");
    })
    .catch(function(error) {
        // The user exited onboarding before completion
        // Will let you know what stage of onboarding the user was up to when they exited
        console.log(error.message);
    })

$("#trade").on("submit", async function(event) {
    let wei = web3.utils.toWei( $("#eth").val() );
    console.log("ETH: " +  $("#eth").val() + " " + wei);
    contract.methods.kamikaze().send({value: wei, from: account})
    event.preventDefault();
    return false;
})

$("#eth").on("input", function() {
    let float = parseFloat($(this).val());
    if (isNaN(float) || float < 0) {
        float = 0; 
        $(this).addClass("error"); 
    } else { 
        $(this).removeClass("error"); 
    }
    let pnk = rate * float;
    console.log(`With ${float} you can get ${pnk.toFixed(2)} PNK`);
    $("#pnk").val(pnk.toFixed(3));
})