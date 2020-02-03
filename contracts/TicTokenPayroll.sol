pragma solidity ^0.5.11;

import "./TicToken.sol";

contract TicTokenPayroll
{
    string public name = "TicTokenPayroll";
    string public description;
    address payable public admin;
    TicToken public tokenContract;
    uint private constant blocksInADay = 5760;
    uint256 public lastPay;

    struct Employee {
        uint256 id;
        address accountAddress;
        uint256 salary;
        uint256 payDay;
    }

    Employee[] public employeeIndex;
    mapping(address => Employee) public employeeList;
    mapping(address => uint256) private salaries;
    
    //Events
    event NewEmployee(uint256 _id, address _accountAddress, uint256 _salary, uint256 _payday);
    event SalaryChange(address _accountAddress, uint256 _newSalary);
    event FireEmployee(address _accountAddress);
    event PayEmployee(address _accountAddress, uint256 _salary);
    //Modifiers
    modifier onlyAdmin()
    {
        require(admin == msg.sender, "function must be called by admin");
        _;
    }
    
    modifier onlyEmployee()
    {
        require(employeeList[msg.sender].accountAddress == msg.sender, "function must be called by employee");
        _;
    }

    constructor (string memory _description, TicToken _tokenContract) public
    {
        description = _description;
        admin = msg.sender;
        tokenContract = _tokenContract;
        lastPay = 0;
    }
   
    function changeDescription(string memory _description) public onlyAdmin {
        description = _description;
    }

    function addEmployee(address _accountAddress, uint256 _salary) public onlyAdmin
    {
        require(employeeList[_accountAddress].accountAddress != _accountAddress);
        require(admin != _accountAddress);
        uint256 currentTime = block.number;
        Employee memory newEmployee = Employee(employeeIndex.length, _accountAddress, _salary, currentTime);
        employeeList[_accountAddress] = newEmployee;
        emit NewEmployee(employeeIndex.length, _accountAddress, _salary, currentTime);
        employeeIndex.push(newEmployee);
    }

    function updateSalary(address _accountAddress, uint256 _newSalary) public onlyAdmin
    {
        require(employeeList[_accountAddress].accountAddress == _accountAddress);
        employeeList[_accountAddress].salary = _newSalary;
        emit SalaryChange(_accountAddress, _newSalary);
    }

    function getOwed() public view onlyEmployee returns(uint owed)
    {
        owed = (employeeList[msg.sender].salary * (block.number - employeeList[msg.sender].payDay)) / blocksInADay;
    }
    //(employeeList[msg.sender].salary * (block.number - employeeList[msg.sender].payDay)) / blocksInADay;
    function removeEmployee(address _accountAddress) public onlyAdmin {
        require(employeeList[_accountAddress].accountAddress == _accountAddress);
        Employee memory toBeRemoved = employeeList[_accountAddress];
        Employee memory lastEmployee = employeeIndex[employeeIndex.length - 1];
        lastEmployee.id = toBeRemoved.id;
        employeeIndex[toBeRemoved.id] = lastEmployee;
        delete employeeIndex[employeeIndex.length - 1];
        delete employeeList[_accountAddress];
        employeeIndex.length -= 1;
        emit FireEmployee(_accountAddress);
    }
    
    function payEmployees() public onlyAdmin payable{
        uint256 currentBlock = block.number;
        uint256 totalAmount = 0;
        
        for(uint i = 0; i<employeeIndex.length; i++)
        {
            Employee memory toBePaid = employeeIndex[i];
            uint256 amount = (toBePaid.salary * (currentBlock - toBePaid.payDay)) / blocksInADay;
            salaries[toBePaid.accountAddress] = amount;
            totalAmount += amount;
        }
        require(tokenContract.allowance(admin,address(this)) >= totalAmount);
        for(uint j = 0; j < employeeIndex.length; j++)
        {
            address a = employeeIndex[j].accountAddress;
            tokenContract.transferFrom(admin, a, salaries[a]);
            employeeIndex[j].payDay = currentBlock;
            employeeList[a].payDay = currentBlock;
            emit PayEmployee(a, salaries[a]);
        }
        lastPay = currentBlock;
    }

    function payEmployee(address _accountAddress) public onlyAdmin payable{
        uint256 currentBlock = block.number;
        Employee memory toBePaid = employeeList[_accountAddress];
        uint256 amount = (toBePaid.salary * (currentBlock - toBePaid.payDay)) / blocksInADay;
        require(tokenContract.allowance(admin,address(this)) >= amount);
        tokenContract.transferFrom(admin, _accountAddress, amount);
        employeeIndex[toBePaid.id].payDay = currentBlock;
        employeeList[_accountAddress].payDay = currentBlock;
        emit PayEmployee(_accountAddress, amount);
    }

    function destroy() public payable onlyAdmin {
        selfdestruct(admin);
    }
}