App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 10000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function() {
        console.log("App initialized...");
        return App.initWeb3();
    },

    initWeb3: function() {
        if(typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("TicTokenSale.json", function(ticTokenSale) {
            App.contracts.TicTokenSale = TruffleContract(ticTokenSale);
            App.contracts.TicTokenSale.setProvider(App.web3Provider);
            App.contracts.TicTokenSale.deployed().then(function(ticTokenSale) {
              console.log("TicToken Sale Address:", ticTokenSale.address);
            });
        }).done(function() {
                $.getJSON("TicToken.json", function(ticToken) {
                    App.contracts.TicToken = TruffleContract(ticToken);
                    App.contracts.TicToken.setProvider(App.web3Provider);
                    App.contracts.TicToken.deployed().then(function(ticToken) {
                      console.log("TicToken Address:", ticToken.address);
                    });
                    App.listenForEvents();
                    
                    return App.render();
                });
            });
    },

    listenForEvents: function() {
        App.contracts.TicTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            });
        });
    },

    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                console.log("Account Address:" + account);
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        });
        //Load token sale contract
        App.contracts.TicTokenSale.deployed().then(function(instance) {
            ticTokenSaleInstance = instance;
            return ticTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            console.log("Token Price:" + tokenPrice.toNumber() + " wei");
            App.tokenPrice = tokenPrice.toNumber();
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
            return ticTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progPercent = (App.tokensSold / App.tokensAvailable) * 100;
            $('#progress').css('width', progPercent + '%');

            //Load token contract
            App.contracts.TicToken.deployed().then(function(instance) {
                ticTokenInstance = instance;
                return ticTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                console.log("Balance:" + balance);
                $('.tic-balance').html(balance.toNumber());

                console.log('loaded...');
                App.loading = false;
                content.show();
                loader.hide();
                
            });
        });
    },

    buyTokens: function() {
        $('content').hide();
        $('loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.TicTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log("Tokens bought...");
            $('form').trigger('reset');
            //Wait for Sell event
        })
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    });
});