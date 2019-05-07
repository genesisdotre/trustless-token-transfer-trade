pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./ERC20.sol";

contract TrustlessTokenTransfer {

    using SafeMath for uint256;

    event ExchangeRateUpdated(uint rate);
    ERC20 public token;
    uint public rate;
    uint public validTo;

    // Monday 6th May 2019 (initial deployment)
    // https://coinmarketcap.com/currencies/kleros/
    // 1 PNK = 0.00005242 ETH
    // The inverse. 1 ETH = 19076 PNK
    // I'm generous, I'm offering slightly better deal
    // Your 1ETH = 20000 PNK
    // Always check your rate, trying with small amount first is also a good idea

    function transferOwnership(address payable newOwner) public onlyOwner { owner = newOwner; }
    modifier onlyOwner {require(msg.sender == address(owner), "Can only be called by the owner."); _;}
    address payable public owner;

    constructor(ERC20 _ERC20TokenAddress, uint _rate, uint _validTo) public {
        owner = msg.sender;
        token = _ERC20TokenAddress;
        updateRate(_rate, _validTo);
    }

    function updateRate(uint _rate, uint _validTo) public {
        rate = _rate;
        validTo = _validTo;
        emit ExchangeRateUpdated(rate);
    }

    function() external payable {
        require(msg.value > 0, "Need to send ETH");
        uint tokensToSend = msg.value * rate;
        uint tokensOwned = token.balanceOf(address(this));

        if (tokensOwned >= tokensToSend) {
            token.transfer(msg.sender, tokensToSend); // sending tokens to sender
            owner.transfer(msg.value); // sending ETH to owner
        } else { // not have enough tokens, send everything and refund the remainng ETH
            tokensToSend = tokensOwned;
            uint tokensToSendETHValue = tokensToSend / rate;
            uint refundValue = msg.value - tokensToSendETHValue;
            msg.sender.transfer(refundValue);
            token.transfer(msg.sender, tokensToSend);
            owner.transfer(tokensToSendETHValue);
        }
    }

    // TODO: Maybe SelfDestruct? What if I want to reuse it?
    function withdraw(address recipient, uint amount) public onlyOwner {
        token.transfer(recipient, amount);
    }

}