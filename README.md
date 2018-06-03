# Bitfinex Auto-Stop with 1:1 Scale-out (Node JS)

When entering a trade it is often desirable to scale out 50% when you have reached a 1:1 reward vs risk threshold. This makes the trade risk-free from this point on. 

This Node JS script allows you to enter a position based on stop, market, or limit entry order, then automatically places a stop order and a 'one-cancels-other' limit+stop order to protect your position from loss, scaling out 50% at 1:1. It also monitors the ticker to ensure your stop isn't hit prior to entry.

You will need to download and install the following:

* nodeJS: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

To install and use the script:

1. Download the [Bitfinex-Auto-Stop-121-Scale-Out library](https://github.com/cryptomius/Bitfinex-Auto-Stop-121-Scale-Out/archive/master.zip) and unzip it somewhere on your computer (or clone the repository if you know how).
2. Open your Terminal/Command Prompt app, `cd` to the directory you placed it and then execute `npm install` to install the nodeJS dependencies
3. Open the ‘[121ScaleOut.js](https://raw.githubusercontent.com/cryptomius/Bitfinex-Auto-Stop-121-Scale-Out/master/121ScaleOut.js)’ file with a text editor (I use Sublime Text)
4. Enter in your Bitfinex API key and secret in the `SETUP` section. Advanced users can create a `.env` file to place thier `API_KEY` and `API_SECRET` in (optional).
5. Execute `node 121ScaleOut.js` for help on using the command line interface.

IMPORTANT: Your computer must be left running and connected to the internet for the stop to be placed by this script.

[More Crypto Tools by @cryptomius](https://github.com/cryptomius/Cryptomius-Crypto-Tools-Overview)

---
*Like this? Feel free to send me a tip! :-)*

**BTC**: 1GdpCvpiK6e5N5u89Dq21jJcqfzJ48zAy2  
**ETH & ERC20**: 0x13098ad7ac788e0bcd3ed38f04003c0df90ebbc9  
**ETC**: 0xb0b4efe2ad6d0ddc0d8bd030525e32580e85f0cd  
**LTC**: LdEu42hZUUSxxZboXGdes1snQfwrR7VWt3  
**DASH**: XnU3c743iqpros4YQgfsn9Nxq6T9bguH8e  
**ZEC**: t1gLKiEZP9RyKtHthvYi2Vo97fvJXL7YcMd  
**BCH**: 1H9dSN6nsoGDCG4GvPgCWRjP765kqJSXYN
