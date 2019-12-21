var TicToken = artifacts.require("TicToken");
var TicTokenSale = artifacts.require("TicTokenSale");
module.exports = function(deployer) {
  deployer.deploy(TicToken, 1000000).then(function() {
    var tokenPrice = 10000000000000;
    return deployer.deploy(TicTokenSale, TicToken.address, tokenPrice);
  });
  
};