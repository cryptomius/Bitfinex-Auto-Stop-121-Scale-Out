// This script places an order and once filled, places a stop for 50% and 
//  an OCO limit+stop order for the other 50% at 1:1
// v2 Shannon Murdoch @cryptomius 26 April 2018

// SETUP
const bitfinexAPIKey			= ''
const bitfinexAPISecret		= ''

var tradingPair					= 'BTCUSD'
var tradeAmount					= 0.004			// amount to buy/sell
var entryPrice					= 10000			// entry price
var stopPrice						= 9990			// stop price
var entryDirection			= 'long'		// 'long' (entry buy) or 'short' (entry sell)
var margin							= true			// true for MARGIN, false for EXCHANGE
// END SETUP

// run using `node 121ScaleOut` 

////////////////////////////////////
var roundToSignificantDigitsBFX = function(num) {
	// Bitfinex uses 5 significant digits
	// 	https://support.bitfinex.com/hc/en-us/articles/115000371105-How-is-precision-calculated-using-Significant-Digits
	var n = 5; 
  if(num == 0) { return 0; }
  var d = Math.ceil(Math.log10(num < 0 ? -num: num));
  var power = n - d;
  var magnitude = Math.pow(10, power);
  var shifted = Math.round(num*magnitude);
  return shifted/magnitude;
}

const BFX = require('bitfinex-api-node')

const { Order } = BFX.Models

const bfx = new BFX({
	apiKey: bitfinexAPIKey,
	apiSecret: bitfinexAPISecret,

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
		type: Order.type[(!margin?"EXCHANGE_":"") + "STOP"]
	}, ws)

	// Enable automatic updates
	o.registerListeners()

	o.on('update', () => {
		console.log(`order updated: ${o.serialize()}`)
	})

	o.on('close', () => {
		console.log(`order status: ${o.status}`)

		if (o.status != 'CANCELED') {
			console.log('Position entered')
			amount1 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount)/2)
			const o2 = new Order({
				cid: Date.now(),
				symbol: 't' + tradingPair,
				price: stopPrice,
				amount: amount1,
				type: Order.type[(!margin?"EXCHANGE_":"") + "STOP"]
			}, ws)

			console.log('compiled stop order for ' + amount1 + ' at ' + stopPrice)

			o2.submit().then(() => {
				console.log('average price of entry = ' + o.priceAvg)
				entryPrice = o.priceAvg
				console.log('submitted 50% stop order')
				price1 = roundToSignificantDigitsBFX(entryPrice-(stopPrice-entryPrice))
				amount2 = roundToSignificantDigitsBFX(((entryDirection=='long')?-tradeAmount:tradeAmount)/2)

				const o3 = new Order({
					cid: Date.now(),
					symbol: 't' + tradingPair,
					price: price1, // 1:1 price
					amount: amount2,
					type: Order.type[(!margin?"EXCHANGE_":"") + "LIMIT"],
					oco: true,
					priceAuxLimit: stopPrice
				}, ws)

				console.log('compiled oco limit order for ' + amount2 + ' at ' + price1 + ' and stop at ' + stopPrice)

				o3.submit().then(() => {
					console.log('submitted 50% 1:1 + stop (oco) limit order')
				}).catch((err) => {
					console.error(err)
					ws.close()
					process.exitCode = 1
				})

			}).catch((err) => {
				console.error(err)
				ws.close()
				process.exitCode = 1
			})
		} else {
			ws.close()
			process.exitCode = 1
		}
	})

	o.submit().then(() => {
		console.log(`submitted entry order ${o.id}`)
	}).catch((err) => {
		console.error(err)
		
	})
})

ws.open()