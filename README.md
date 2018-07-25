# Bitfinex Auto-Stop with 1:1 Scale-out (Node JS)

When entering a trade it is often desirable to be risk-free as soon as possible. One way to do this is to scale out 50% of your position when your profit matches your risk (including fees). This scale-out price is called your 1:1. 

This Node JS script allows you to enter a position based on stop, market, limit, or stop-limit entry order, then automatically places a stop order AND a 'one-cancels-other' limit+stop order to protect your position from loss, scaling out 50% at 1:1. 

The script also monitors the ticker prior to entry to ensure the reason for taking the trade is not invalidated (ie your stop price or fibonacci reference level is breached prior to entry).

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/)

1. Open a terminal/command prompt and run the command below.

<pre>
npm install -g bitfinex-auto-stop-121-scale-out
</pre>

**Note:** You may need to use `sudo` (for MacOS, *nix etc), or run your command shell as Administrator (for Windows) to do this. For example:

<pre>
<b>sudo</b> npm install -g bitfinex-auto-stop-121-scale-out
</pre>


## Configuration

1. Log in to [Bitfinex](https://www.bitfinex.com/) and create a [Bitfinex API key](https://support.bitfinex.com/hc/en-us/articles/115002349625-API-Key-Setup-Login) with 'Orders' and 'Margin Trading' Read and Write permissions.

2. Using [Sublime Text](https://www.sublimetext.com/) or another text editor, create a text file named `.env` in your user home directory (where you will run the script from), and add your Bitfinex API key and secret in the following format. Replace `BITFINEX_API_KEY` with your API key and `BITFINEX_API_SECRET` with your API secret.
<pre>
API_KEY='<b>BITFINEX_API_KEY</b>'
API_SECRET='<b>BITFINEX_API_SECRET</b>'
</pre>


## Usage

Open your Terminal/Console, paste `121ScaleOut`, and hit the Return key to display instructions on how to use the script.

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
