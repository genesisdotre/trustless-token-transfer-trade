pragma solidity ^0.5.0;

contract ReturnHalf {
    event Refunded(uint received, uint refunded);
    
    function() external payable { 
        uint refundValue = msg.value / 2;
        msg.sender.transfer(refundValue);
        emit Refunded(msg.value, refundValue);
    }
    
    function getBalance() view public returns(uint) {
        return address(this).balance;
    }
}