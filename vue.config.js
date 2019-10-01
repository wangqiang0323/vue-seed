module.exports = {
	devServer: {
		hotOnly: false,
		proxy: {
			'/': {
				target: 'http://yapi.demo.qunar.com/mock/1016',
				ws: false,
        changeOrigin: true
			}
		}
	}
}