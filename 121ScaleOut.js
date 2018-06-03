// This script places an order (stop or limit-based) and once filled, places a stop for 50% and an 
//  OCO limit+stop order for the other 50% at 1:1 risk/reward to eliminate risk from your trade early
//  https://github.com/cryptomius/Bitfinex-Auto-Stop-121-Scale-Out

// SETUP
const bitfinexAPIKey			= ''			// leave blank to use API_KEY from .env file
const bitfinexAPISecret		= ''			// leave blank to use API_SECRET from .env file
// END SETUP

// run using `node 121ScaleOut` 

////////////////////////////////////

var argv = parseArguments()

var tradingPair = argv.pair.toUpperCase()
var tradeAmount	= argv.amount
var entryPrice = argv.entry
var stopPrice = argv.stop
var entryDirection = argv.short ? 'short' : 'long'
var entryLimitOrder	= argv.limit
var margin = !argv.exchange
var targetMultiplier = argv.target
var hiddenExitOrders = argv.hideexit
var cancelOnStop = argv.cancelonstop

const bfxExchangeTakerFee = 0.002 // 0.2% 'taker' fee 

var roundToSignificantDigitsBFX = function(num) {
	// Bitfinex uses 5 significant digits
	// 	https://support.bitfinex.com/hc/en-us/articles/115000371105-How-is-precision-calculated-using-Significant-Digits
	var n = 5
  if(num == 0) { return 0 }
  var d = Math.ceil(Math.log10(num < 0 ? -num: num))
  var power = n - d
  var magnitude = Math.pow(10, power)
  var shifted = Math.round(num*magnitude)
  return shifted/magnitude
}

const BFX = require('bitfinex-api-node')
require('dotenv').config()
const { API_KEY, API_SECRET } = process.env
const { Order } = BFX.Models

const bfx = new BFX({
	apiKey: bitfinexAPIKey==''?API_KEY:bitfinexAPIKey,
	apiSecret: bitfinexAPISecret==''?API_SECRET:bitfinexAPISecret,

	ws: {
		autoReconnect: true,
		seqAudit: false,
		packetWDDelay: 10 * 1000,
		transform: true
	}
})

entryPrice 	= roundToSignificantDigitsBFX(entryPrice)
stopPrice 	= roundToSignificantDigitsBFX(stopPrice)
tradeAmount = roundToSignificantDigitsBFX(tradeAmount)

var entryOrderActive = false


const ws = bfx.ws(2)
const o = new Order({
	cid: Date.now(),
	symbol: 't' + tradingPair,
	price: entryPrice,
	amount: (entryDirection=='long')?tradeAmount:-tradeAmount,
	type: Order.type[(!margin?"EXCHANGE_":"") + (entryPrice==0?"MARKET":entryLimitOrder?"LIMIT":"STOP")]
})

ws.on('error', (err) => console.log(err))
ws.on('open', () => {
	if (!entryLimitOrder && cancelOnStop) {
		ws.subscribeTicker('t' + tradingPair)
		console.log('Monitoring ' + tradingPair + ' for breach of stop level...')
	}
	ws.auth()
})

ws.onTicker({ symbol: 't' + tradingPair }, (ticker) => {
	tickerObj = ticker.toJS()
	console.log(tradingPair + ' price: ' + tickerObj.lastPrice + ' (ask: ' + tickerObj.ask + ', bid: ' + tickerObj.bid + ') stop price: ' + stopPrice)
	if (cancelOnStop && entryOrderActive && entryLimitOrder == false) {
		if ((entryDirection=='long' && tickerObj.bid <= stopPrice) || (entryDirection=='short' && tickerObj.ask >= stopPrice) ){
			// kill the entry order as the stop has been hit prior to entry
			console.log('Your stop price of ' + stopPrice + ' was breached prior to entry. Cancelling entry order.')
			o.cancel().then(() => {
				console.log('Cancellation confirmed for order %d', o.cid)
				ws.close()
				process.exit()
			  }).catch((err) => {
				console.log('WARNING - error cancelling order: %j', err)
				ws.close()
				process.exit()
			  })
		}
	}
})

ws.once('auth', () => {
	// Enable automatic updates
	o.registerListeners(ws)

	o.on('update', () => {
		console.log(`Order updated: ${o.serialize()}`)
	})

	o.on('close', () => {
		console.log(`Order status: ${o.status}`)

		if (o.status != 'CANCELED') {
			entryOrderActive = false
			if (!entryLimitOrder) {
				ws.unsubscribeTicker('t' + tradingPair)
			}
			console.log('-- POSITION ENTERED --')
			if(!margin){ tradeAmount = tradeAmount - (tradeAmount * bfxExchangeTakerFee) }
			if(o.priceAvg == null && entryPrice==0){
				amount4 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount))
				console.log(' Average price of entry was NOT RETURNED by Bitfinex! 1:' + targetMultiplier + ' oco target cannot be calculated. :-(')
				console.log(" Placing a SINGLE stop order at " + stopPrice + "for " + amount4 + " (100%) to protect your position")

				console.log('Please send this to @cryptomius to help debug:')
				console.log(argv)
				console.log(o)

				const o4 = new Order({
					cid: Date.now(),
					symbol: 't' + tradingPair,
					price: stopPrice,
					amount: amount4,
					hidden: hiddenExitOrders,
					type: Order.type[(!margin?"EXCHANGE_":"") + "STOP"]
				}, ws)

				o4.submit().then(() => {
					console.log('Submitted 100% stop order. YOU MUST REDUCE THIS TO 50% AND CREATE AN oco LIMIT+STOP ORDER MANUALLY.')
					console.log('------------------------------------------')
					ws.close()
					process.exit()
				}).catch((err) => {
					console.error(err)
					ws.close()
					process.exit()
				})

			} else {
				amount1 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount)/2)
				const o2 = new Order({
					cid: Date.now(),
					symbol: 't' + tradingPair,
					price: stopPrice,
					amount: amount1,
					hidden: hiddenExitOrders,
					type: Order.type[(!margin?"EXCHANGE_":"") + "STOP"]
				}, ws)

				console.log(' Compiled stop order for ' + amount1 + ' at ' + stopPrice)

				o2.submit().then(() => {
					console.log(' Average price of entry = ' + o.priceAvg)
					entryPrice = o.priceAvg
					console.log('Submitted 50% stop order')
					price1 = roundToSignificantDigitsBFX(entryPrice-((stopPrice-entryPrice)*targetMultiplier))
					amount2 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount)/2)

					const o3 = new Order({
						cid: Date.now(),
						symbol: 't' + tradingPair,
						price: price1, // scale-out target price (1:1)
						amount: amount2,
						type: Order.type[(!margin?"EXCHANGE_":"") + "LIMIT"],
						oco: true,
						hidden: hiddenExitOrders,
						priceAuxLimit: stopPrice
					}, ws)

					console.log(' Compiled oco limit order for ' + amount2 + ' at ' + price1 + ' and stop at ' + stopPrice)

					o3.submit().then(() => {
						console.log('Submitted 50% 1:1 + stop (oco) limit order')
						console.log('------------------------------------------')
						console.log('Good luck! Making gains? Drop me a tip: https://tinyurl.com/bfx121')
						console.log('------------------------------------------')
						ws.close()
						process.exit()
					})
					

				}).catch((err) => {
					console.error(err)
					ws.close()
					process.exit()
				})
			}
		} else {
			console.log('Entry order cancelled.')
			ws.close()
			process.exit()
		}
	})

	o.submit().then(() => {
		entryOrderActive = true
		console.log(`submitted entry order ${o.id}`)
	}).catch((err) => {
		console.error(err)
		process.exit()
	})
})

if (margin == false && entryDirection == 'short') {
	console.log('You must use margin=true if you want to go short.')
	process.exit()
}else{
	ws.open()
}

function parseArguments() {
	return require('yargs')
	.usage('Usage: node $0')
	.example('node $0 -p BTCUSD -a 0.004 -e 10000 -s 9000', 'Place a long market stop entry order for 0.004 BTC @ 10000 USD with stop at 9000 USD and default 1:1 50% scale-out target.')
	// '-p <tradingPair>'
	.demand('pair')
	.alias('p', 'pair')
	.describe('p', 'Set trading pair eg. BTCUSD')
	// '-a <tradeAmount>'
	.demand('amount')
	.number('a')
	.alias('a', 'amount')
	.describe('a', 'Set amount to buy/sell')
	// '-e <entryPrice>'
	.number('e')
	.alias('e', 'entry')
	.describe('e', 'Set entry price (exclude for market price)')
	.default('e', 0)
	// '-s <stopPrice>'
	.demand('stop')
	.number('s')
	.alias('s', 'stop')
	.describe('s', 'Set stop price')
	// '-t <targetMultiplier>'
	.alias('t', 'target')
	.describe('t', 'Set target multiplier eg. 1.4 for 1:1.4 scale-out of 50%. Default 1:1.')
	.default('t', 1)
	// '-S' for 'short' (entry sell) entry direction. Default direction is 'long' (entry buy)
	.boolean('S')
	.alias('S', 'short')
	.describe('S', 'Enter short (entry sell) instead of long (entry buy) position')
	.default('S', false)
	// '-l' for limit-order entry
	.boolean('l')
	.alias('l', 'limit')
	.describe('l', 'Place limit-order instead of a market stop-order entry (ignored if entryPrice is 0)')
	.default('l', false)
	// '-x' for exchange trading
	.boolean('x')
	.alias('x', 'exchange')
	.describe('x', 'Trade on exchange instead of margin')
	.default('x', false)
	// '-h' for hidden exit orders
	.boolean('h')
	.alias('h', 'hideexit')
	.describe('h', 'Hide your target and stop orders from the orderbook')
	.default('h', false)
	// '-c' to cancel entry if stop level is breached
	.boolean('c')
	.alias('c', 'cancelonstop')
	.describe('c', "Cancel your entry order if the stop level is breached (ignored for limit entry orders) use '-c false' to disable")
	.default('c', true)
	.wrap(process.stdout.columns)
	.argv;
}
