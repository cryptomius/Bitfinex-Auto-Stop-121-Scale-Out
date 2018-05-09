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
		packetWDDelay: 10 * 1000
	}
})

entryPrice 	= roundToSignificantDigitsBFX(entryPrice)
stopPrice 	= roundToSignificantDigitsBFX(stopPrice)
tradeAmount = roundToSignificantDigitsBFX(tradeAmount)

const ws = bfx.ws()

ws.on('error', (err) => console.log(err))
ws.on('open', ws.auth.bind(ws))

ws.once('auth', () => {
	const o = new Order({
		cid: Date.now(),
		symbol: 't' + tradingPair,
		price: entryPrice,
		amount: (entryDirection=='long')?tradeAmount:-tradeAmount,
		type: Order.type[(!margin?"EXCHANGE_":"") + (entryPrice==0?"MARKET":entryLimitOrder?"LIMIT":"STOP")]
	}, ws)

	// Enable automatic updates
	o.registerListeners()

	o.on('update', () => {
		console.log(`Order updated: ${o.serialize()}`)
	})

	o.on('close', () => {
		console.log(`Order status: ${o.status}`)

		if (o.status != 'CANCELED') {
			console.log('-- POSITION ENTERED --')
			if(!margin){ tradeAmount = tradeAmount - (tradeAmount * bfxExchangeTakerFee) }
			amount1 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount)/2)
			const o2 = new Order({
				cid: Date.now(),
				symbol: 't' + tradingPair,
				price: stopPrice,
				amount: amount1,
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
				}).catch((err) => {
					console.error(err)
					ws.close()
					process.exit()
				})

			}).catch((err) => {
				console.error(err)
				ws.close()
				process.exit()
			})
		} else {
			ws.close()
			process.exit()
		}
	})

	o.submit().then(() => {
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
	.wrap(process.stdout.columns)
	.argv;
}
