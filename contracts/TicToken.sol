pragma solidity ^0.5.12;

contract TicToken 
{
    string public name = "TicToken";
    string public symbol = "TTO";
    string public standard = "TicToken version 1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    
    // Constructor
    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    //Transfer function
    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);
        //Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        //Transfer Event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}