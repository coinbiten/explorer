const data = {
    supply: 50000000,
    csupply: 100000000,
    reserve: 400000000,
    networt_name: "Biten Coin",
    coinName: "Biten",
    symbol: "BTN",
    decimal: 18,
    networkid: 166,
    baseBlockReward: 2,//Proof of work value 2 Proof of Stake value 0
    http_provider: 'http://84.46.247.245:8085',
    ws_provider: 'ws://84.46.247.245:9091',
    dbname: "biten",
    //Coin Price Call From Livecoinwath API
    livecoinwatchapi: "https://api.livecoinwatch.com/coins/single",
    x_api_key: "394bac29-70e9-4034-967d-845c921f1f95",
    currency_code: "__BTN",
    test_network: {
        networt_name: "Test Biten Coin",
        coinName: "Test Biten",
        symbol: "TBTN",
        decimal: 18,
        networkid: 160,
        http_provider: 'http://localhost',
        ws_provider: 'ws://localhost'
    }
    //Test Network Optional For API
}

module.exports = data