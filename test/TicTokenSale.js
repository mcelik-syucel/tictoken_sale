var TicTokenSale = artifacts.require("./TicTokenSale.sol");
var TicToken = artifacts.require("./TicToken.sol");

contract('TicTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var adminBalance;
    var initialBalance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 10000000000000; // in wei
    var tokensAvailable = 300000;
    var noOfTokens;
    var value;

    it('initializes the contract with the correct values', function() {
        return TicTokenSale.deployed().then(function(instance) {
          tokenSaleInstance = instance;
          return tokenSaleInstance.address;
        }).then(function(address) {
          assert.notEqual(address, 0x0, 'has contract address');
          return tokenSaleInstance.tokenContract();
        }).then(function(address) {
          assert.notEqual(address, 0x0, 'has token contract address');
          return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
          assert.equal(price, tokenPrice, 'token price is correct');
        });
      });

    it('facilitates token buying', function() {
      return TicToken.deployed().then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.balanceOf(admin);
      }).then(function(balance) {
        adminBalance = balance.toNumber();
        //console.log("initial admin balance:" + balance.toNumber() + "\n");
        return tokenInstance.balanceOf(buyer);
      }).then(function(balance) {
        initialBalance = balance.toNumber();
        //console.log('buyer balance:' + initialBalance);
        return TicTokenSale.deployed();
      }).then(function(instance) {
        tokenSaleInstance = instance;
        return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
      }).then(function(receipt) {
        noOfTokens = 10;
        value = noOfTokens * tokenPrice;
        return tokenSaleInstance.buyTokens(noOfTokens, { from: buyer, value: value});
      }).then(function (receipt) {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account the transfer is made to');
        assert.equal(receipt.logs[0].args._amount, noOfTokens, 'logs the transfer amount');
        return tokenSaleInstance.tokensSold();
      }).then(function(amount) {
        assert.equal(amount.toNumber(), noOfTokens, 'increments the number of tokens sold');
        return tokenInstance.balanceOf(buyer);
      }).then(function(balance) {
        assert.equal(balance.toNumber(), initialBalance + noOfTokens, 'buyer receives the tokens');
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      }).then(function(balance) {
        assert.equal(balance.toNumber(), tokensAvailable - noOfTokens, 'contract sent the tokens');
        return tokenSaleInstance.buyTokens(noOfTokens, { from : buyer, value : 1});
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'msg.value must be equal to correct value');
        return tokenSaleInstance.buyTokens(500000, { from : buyer, value : 500000 * tokenPrice});
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
      });
    });

    it('ends token sale', function() {
      return TicToken.deployed().then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.balanceOf(buyer);
      }).then(function(balance) {
        initialBalance = balance.toNumber();
        //console.log('buyer balance after purchase:' + initialBalance);
        return TicTokenSale.deployed();
      }).then(function(instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.endSale({ from : buyer});
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'must be admin');
        return tokenSaleInstance.endSale({ from : admin});
      }).then(function(receipt) {
        return tokenInstance.balanceOf(admin);
      }).then(function(balance) {
        assert.equal(balance.toNumber(), adminBalance - noOfTokens, 'returns remaining tokens to admin');
      });
    });
});