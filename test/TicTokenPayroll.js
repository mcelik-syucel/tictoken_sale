var TicTokenPayroll = artifacts.require("./TicTokenPayroll.sol");
var TicToken = artifacts.require("./TicToken.sol");

contract("TicTokenPayroll", function(accounts){
    var tokenPayrollInstance;
    var admin = accounts[0];
    var employee1 = accounts[2];
    var employee2 = accounts[3];
    var employee3 = accounts[1];
    var tokenInstance;
    var adminBalance;
    var employee1Balance;
    var employee2Balance;
    var allowedTokens = 100000;
    var adminEarned;
    var employee1Earned;
    var employee1Earned;
    var description = "TicTokenPayroll Test";

    it('initializes the contract with the correct values', function() {
        return TicTokenPayroll.deployed().then(function(instance) {
            tokenPayrollInstance = instance;
            return tokenPayrollInstance.addEmployee(employee2, 90000);
        }).then(function(receipt) {
            return tokenPayrollInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenPayrollInstance.admin();
        }).then(function(address) {
            assert.equal(address, admin, 'has the correct admin');
            return tokenPayrollInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenPayrollInstance.description();
        }).then(function(desc) {
            assert.equal(desc, description, 'has the correct desciption');
        });
    });

    it('allows for company and employee management', function() {
        return TicTokenPayroll.deployed().then(function(instance) {
            tokenPayrollInstance = instance;
            return tokenPayrollInstance.addEmployee(employee3, 3000, { from : employee1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('admin') >= 0, 'modifiers restrict access to certain functions');
            return tokenPayrollInstance.addEmployee(admin, 3000, { from : admin});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'admin cannot be an Employee');
            return tokenPayrollInstance.addEmployee(employee1, 3000, { from : admin});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'NewEmployee', 'should be the "NewEmployee" event');
            assert.equal(receipt.logs[0].args._id, 1, 'logs the Employee id');
            assert.equal(receipt.logs[0].args._accountAddress, employee1, 'logs the Employee account address');
            assert.equal(receipt.logs[0].args._salary, 3000, 'logs the correct Employee salary');
            assert.notEqual(receipt.logs[0].args._payDay, 0, 'logs the Employee payDay when hired');
            return tokenPayrollInstance.employeeList(employee1);
        }).then(function(employee) {
            assert.equal(employee.salary.toNumber(), 3000 , 'facilitates hiring of new Employees');
            return tokenPayrollInstance.addEmployee(employee1, 4000, { from : admin});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'existing Employee cannot be hired');
            tokenPayrollInstance.changeDescription('new description', { from : admin});
            return tokenPayrollInstance.description();
        }).then(function(desc) {
            assert.equal(desc, 'new description', 'allows admin to change the description');
            return tokenPayrollInstance.updateSalary(employee1, 6000, { from : admin});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'SalaryChange', 'should be the "SalaryChange" event');
            assert.equal(receipt.logs[0].args._accountAddress, employee1, 'logs the Employee account address');
            assert.equal(receipt.logs[0].args._newSalary, 6000, 'logs the correct Employee salary');
            return tokenPayrollInstance.employeeList(employee1);
        }).then(function(employee) {
            assert.equal(employee.salary.toNumber(), 6000, 'updates salary');
            return tokenPayrollInstance.removeEmployee(employee3, { from : admin});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'non-existing Employee cannot be fired');
            return tokenPayrollInstance.employeeIndex(0);
        }).then(function(employee) {
            //console.log(employee.payDay.toNumber());
            return tokenPayrollInstance.removeEmployee(employee1, { from : admin});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'FireEmployee', 'should be the "FireEmployee" event');
            assert.equal(receipt.logs[0].args._accountAddress, employee1, 'logs the Employee account address');
            return tokenPayrollInstance.employeeList(employee1);
        }).then(function(employee) {
            assert.equal(employee.salary.toNumber(), 0, 'succesfully removes employee');
        });
    });

    it('pays employees', function() {
        return TicToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return TicTokenPayroll.deployed()
        }).then(function(instance) {
            tokenPayrollInstance = instance;
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            adminBalance = balance.toNumber();
            //console.log('initial admin balance: ' + adminBalance);
            return tokenInstance.balanceOf(employee1);
        }).then(function(balance) {
            employee1Balance = balance.toNumber();
            //console.log('initial employee 1 balance: ' + employee1Balance);
            return tokenInstance.balanceOf(employee2);
        }).then(function(balance) {            
            employee2Balance = balance.toNumber();
            //console.log('initial employee 2 balance: ' + employee2Balance);
            return tokenPayrollInstance.addEmployee(employee1, 30000000, { from : admin});
        }).then(function(receipt) {
            return tokenPayrollInstance.employeeList(employee2);
        }).then(function(employee) {
            var timeCreated = employee.payDay.toNumber();
            //console.log("Employee 2 timestamp: " + timeCreated);
            return tokenPayrollInstance.getOwed({ from : employee2});
        }).then(function(salary) {
            var owed = salary.toNumber();
            //console.log("Owed: " + owed);
            assert.notEqual(owed, 0, 'calculates the amount owed to employees');
            return tokenPayrollInstance.payEmployees({ from : admin });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot pay Employees without enough allowance from the admin');
            return tokenInstance.approve(tokenPayrollInstance.address, allowedTokens, { from : admin});
        }).then(function(receipt) {
            return tokenPayrollInstance.payEmployees({ from : admin });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(employee1);
        }).then(function(balance) {
            employee1Earned = balance.toNumber() - employee1Balance;
            assert.notEqual(employee1Earned, 0, "pays the salary of employee 1");
            return tokenInstance.balanceOf(employee2);
        }).then(function(balance) {
            employee2Earned = balance.toNumber() - employee2Balance;
            assert.notEqual(employee2Earned, 0, "pays the salary of employee 2");
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            adminEarned = adminBalance - balance.toNumber();
            assert.equal(adminEarned, employee1Earned + employee2Earned, 'all tokens are accounted for');
            employee2Balance += employee2Earned;
            return tokenPayrollInstance.lastPay();
        }).then(function(lastPay) {
            assert.notEqual(lastPay, 0, 'updated lastPay');
            return tokenPayrollInstance.payEmployee(employee2);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'PayEmployee', 'second should be the "PayEmployee" event');
            assert.equal(employee2, receipt.logs[0].args._accountAddress, 'transfer made to employee');
            assert.notEqual(receipt.logs[0].args._salary, 0, 'full amount transferred');
            return tokenInstance.balanceOf(employee2);
        }).then(function(balance) {
            assert(balance.toNumber() > employee2Balance, 'transacts the amount');
            tokenPayrollInstance.destroy();
        });
    });

});
