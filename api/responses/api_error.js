module.exports = function (err, options) {
	var res = this.res;
	var e = "";

	if (err instanceof Error )
		e = err.name + ':' + err.message;
	if (err && err.code && err.message)
		e = err.message;

	var code = err.code || 1;
	res.json({
		code: code,
		message: e
	})
}