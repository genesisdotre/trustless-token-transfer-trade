pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./ERC20.sol";

contract TrustlessTokenTransferTrade {

    using SafeMath for uint256;

    event Trade(uint ETH, uint tokens, uint rate); // THINK: rate can be derived?
    event ExchangeRateUpdated(uint rate);
    ERC20 public token;
    uint public rate;
    uint public validTo;

    function transferOwnership(address payable newOwner) public onlyOwner { owner = newOwner; }
    modifier onlyOwner {require(msg.sender == address(owner), "Can only be called by the owner."); _;}
    address payable public owner;

    constructor(ERC20 _ERC20TokenAddress, uint _rate, uint _validTo) public {
        owner = msg.sender;
        token = _ERC20TokenAddress;
        updateRate(_rate, _validTo);
    }

    function updateRate(uint _rate, uint _validTo) public onlyOwner {
        require(_rate > 0, "Rate must be greater than zero");
        rate = _rate;
        validTo = _validTo;
        emit ExchangeRateUpdated(rate);
    }

    function kamikaze() public payable { // nice error messages: https://github.com/blocknative/assist/issues/164
        require(msg.value > 0, "Need to send ETH");
        require(isRateValid(), "Rate is no longer valid");
        uint tokensToSend = msg.value * rate;
        uint tokensOwned = token.balanceOf(address(this));

        if (tokensOwned >= tokensToSend) {
            token.transfer(msg.sender, tokensToSend); // sending tokens to sender
            owner.transfer(msg.value); // sending ETH to owner
            emit Trade(msg.value, tokensToSend, rate);
        } else { // contract does not have enough tokens, send everything and refund the remainng ETH
            tokensToSend = tokensOwned;
            uint tokensToSendETHValue = tokensToSend.div(rate);
            uint refundValue = msg.value - tokensToSendETHValue;

            msg.sender.transfer(refundValue);
            token.transfer(msg.sender, tokensToSend);
            owner.transfer(tokensToSendETHValue);
            emit Trade(tokensToSendETHValue, tokensToSend, rate);
        }
    }

    function() external payable {
        kamikaze(); // hold my beer, trust me, I know what I'm doing 🔥🔥🔥
    }

    function isRateValid() public view returns(bool) {
        return validTo > now;
    }

    function withdraw() public onlyOwner {
        token.transfer(owner, token.balanceOf(address(this)));
        selfdestruct(owner); // cleaning storage, getting gas refund
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

}