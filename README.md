# Bitfinex Auto-Stop with 1:1 Scale-out (Node JS)

When entering a trade it is often desirable to scale out 50% when you have reached a 1:1 reward vs risk threshold. This makes the trade risk-free from this point on. 

This Node JS script executes a long/short order when a trigger price is reached, then automatically places a stop order and a 'one-cancels-other' limit+stop order to protect your position from loss and scale-out 50% at 1:1.

To use it:

1. Download nodeJS: [https://nodejs.org/en/download/](https://nodejs.org/en/download/) and install it
2. Download [Bitfinex’s nodeJS library](https://github.com/bitfinexcom/bitfinex-api-node/) and place it somewhere on your computer.
3. Open your Terminal app, `cd` to the directory you placed it and then execute `npm i bitfinex-api-node` to install the nodeJS library
4. Execute `npm install crc-32` (required library)
5. Execute `npm install --save bignumber.js` (required library)
6. Copy the ‘[121ScaleOut.js](https://raw.githubusercontent.com/cryptomius/Bitfinex-Auto-Stop-121-Scale-Out/master/121ScaleOut.js)’ file into the same directory, then open it with a text editor (I use Sublime Text)
7. Enter in your Bitfinex API keys, trading pair, entry price, stop price, direction (long/short), etc. 
6. Execute `node 121ScaleOut` and you’re in action.

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
