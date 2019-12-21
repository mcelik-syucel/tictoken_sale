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
          return tokenSaleInstance.address
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

    /* it('facilitates token buying', function() {
        return TicToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return TicTokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function(receipt) {
            return tokenSaleInstance.buyTokens(noOfTokens, {from: buyer, value: noOfTokens * tokenPrice});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account the transfer is made to');
            assert.equal(receipt.logs[0].args._amount, noOfTokens, 'logs the transfer amount');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), noOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), noOfTokens, 'buyer receives the right amount of tokens.');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - noOfTokens);
            return tokenSaleInstance.buyTokens(noOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(800000 , { from: buyer, value: noOfTokens * tokenPrice });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than the contract has')
        });
    }); */
/*     it('facilitates token buying', function() {
        return TicTokenSale.deployed().then(function(instance) {
          // Grab token instance first
          tokenInstance = instance;
          return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
          initialBalance = balance;
          console.log('initialBalance111111:'+initialBalance);
          return TicTokenSale.deployed();
        }).then(function(instance) {
          // Then grab token sale instance
          tokenSaleInstance = instance;
          // Provision 75% of all tokens to the token sale
          return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin }) // tokensav..
        }).then(function(receipt) {
          noOfTokens = 10;
          var balanceins = tokenInstance.balanceOf(accounts[0]);
            return balanceins;
        }).then(function(balanceins){
            console.log('admin balance 111111 : '+balanceins.toNumber()); // admin balance : 750000
          return tokenSaleInstance.buyTokens(noOfTokens, { from: buyer, value: noOfTokens * tokenPrice })
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'triggers one event');
          assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
          assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
          assert.equal(receipt.logs[0].args._amount, noOfTokens, 'logs the number of tokens purchased');
          var balanceins = tokenInstance.balanceOf(tokenSaleInstance.address);
            return balanceins;
        }).then(function(balanceins){
            console.log('contract balance 111111 : '+balanceins.toNumber()); 
          return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
          assert.equal(amount.toNumber(), noOfTokens, 'increments the number of tokens sold');
          return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), noOfTokens);
          return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), tokensAvailable - noOfTokens);
          // Try to buy tokens different from the ether value
          return tokenSaleInstance.buyTokens(noOfTokens, { from: buyer, value: 1 }); // SORUN
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
          return tokenSaleInstance.buyTokens(800000, { from: buyer, value: noOfTokens * tokenPrice }); 
        }).then(function(){
          return tokenInstance.fdebugnof();
      }).then(function(balanceins){
          console.log('contract balance 222222 : '+balanceins); 
        // }).then(assert.fail).catch(function(error) {
        //   assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });
      }); */

    it('facilitates token buying', function() {
      return TicToken.deployed().then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.balanceOf(admin);
      }).then(function(balance) {
        adminBalance = balance.toNumber();
        console.log("initial admin balance:" + balance.toNumber() + "\n");
        return tokenInstance.balanceOf(buyer);
      }).then(function(balance) {
        initialBalance = balance.toNumber();
        console.log('buyer balance:' + initialBalance);
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
        console.log('buyer balance after purchase:' + initialBalance);
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
    /* it('ends token sale', function() {
        return TicToken.deployed().then(function(instance) {
          // Grab token instance first
          tokenInstance = instance;
          return TicTokenSale.deployed();
        }).then(function(instance) {
          // Then grab token sale instance
          tokenSaleInstance = instance;
          // Try to end sale from account other than the admin
          return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
          // End sale as admin
          balance = web3.eth.getBalance(tokenSaleInstance.address);
          return balance;
        }).then(function(balance) {
          console.log('111111A:'+balance);
          return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
          return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), initialBalance, 'returns all unsold dapp tokens to admin');
          console.log('2222222A:'+balance.toNumber());
          // Check that the contract has no balance
          balance = web3.eth.getBalance(tokenSaleInstance.address);
          return balance;
        }).then(function(balance) {
          assert.equal(balance, 0);
        });
      }); */
});
//3:20:00