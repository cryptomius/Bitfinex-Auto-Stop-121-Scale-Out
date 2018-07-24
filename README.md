# Bitfinex Auto-Stop with 1:1 Scale-out (Node JS)

When entering a trade it is often desirable to scale out 50% when you have reached a 1:1 reward vs risk threshold. This makes the trade risk-free from this point on. 

This Node JS script allows you to enter a position based on stop, market, or limit entry order, then automatically places a stop order and a 'one-cancels-other' limit+stop order to protect your position from loss, scaling out 50% at 1:1. It also monitors the ticker to ensure your stop isn't hit prior to entry.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/)

The easiest way to get started is to install `bitfinex-auto-stop-121-scale-out` globally. Open a terminal/command prompt and run the command below.
**Note:** You may need to use `sudo` (for macOS, *nix etc), or run your command shell as Administrator (for Windows) to do this.
```
npm install -g bitfinex-auto-stop-121-scale-out
```

This will add the `bitfinex-auto-stop-121-scale-out` command to your system path, allowing it to be run from any folder.

## Configuration

Create a file called `.env` in the folder from where you want to run `bitfinex-auto-stop-121-scale-out`, and add your [Bitfinex API key](https://support.bitfinex.com/hc/en-us/articles/115002349625-API-Key-Setup-Login) in the following format. Replace `BITFINEX_API_KEY` with your API key and `BITFINEX_API_SECRET` with your API secret.
<pre>
API_KEY='<b>BITFINEX_API_KEY</b>'
API_SECRET='<b>BITFINEX_API_SECRET</b>'
</pre>

Your Bitfinex key will need 'Orders' and 'Margin Trading' Read and Write permissions.

## Usage

Execute `121ScaleOut` for help on using the command line interface.

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
