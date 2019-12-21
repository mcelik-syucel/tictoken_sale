pragma solidity ^0.5.11;

import "./TicToken.sol";
contract TicTokenSale {
    address admin;
    TicToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor (TicToken _tokenContract, uint256 _tokenPrice) public
    {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
        //tokensSold = 0;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _noOfTokens) public payable
    {
        require(msg.value == multiply(_noOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _noOfTokens);
        require(tokenContract.transfer(msg.sender, _noOfTokens));
        tokensSold += _noOfTokens;

        emit Sell(msg.sender, _noOfTokens);
    }

    function endSale() public
    {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this)))); // address(this)
        //selfdestruct(admin); // AVOID
    }
}