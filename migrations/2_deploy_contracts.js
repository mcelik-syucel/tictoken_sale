var TicToken = artifacts.require("TicToken");
var TicTokenSale = artifacts.require("TicTokenSale");
var TicTokenPayroll = artifacts.require("TicTokenPayroll");
module.exports = function(deployer) {
  deployer.deploy(TicToken, 1000000).then(function() {
    var tokenPrice = 10000000000000;
    var description = "TicTokenPayroll Test";
    deployer.deploy(TicTokenPayroll, description, TicToken.address);
    return deployer.deploy(TicTokenSale, TicToken.address, tokenPrice);
  });
  
};
// .then(function() {
//   var description = "TicTokenPayroll Test";
//   return deployer.deploy(TicTokenPayroll, description, TicToken.address);
// });