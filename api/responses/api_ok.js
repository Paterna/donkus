module.exports = function (data, options) {
	var res = this.res;
	res.json({
		code: 0,
		data: data
	})
}