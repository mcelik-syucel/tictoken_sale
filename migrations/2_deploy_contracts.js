const TicToken = artifacts.require("TicToken");

module.exports = function(deployer) {
  deployer.deploy(TicToken, 1000000);
};