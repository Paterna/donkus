/*
 * API error handler.
 *
 * 0 -> Success
 * 1 -> UserCtrl error
 * 2-5 -> AccessCtrl error
 * 6 -> Auth error
 * 1X -> Licode Room error
 * 2X -> Licode User error
 * 5X -> SIP Session error
 *
 */
module.exports = function (err, options) {
	
	var res = this.res;
	var e = "";

	if (err instanceof Error )
		e = err.name + ':' + err.message;
	if (err && err.code && err.message)
		e = err.message;

	var code = (err && err.code !== undefined) ? err.code : 1;
	res.json({
		code: code,
		message: e
	});
}