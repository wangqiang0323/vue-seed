module.exports = {
	css: {
		loaderOptions: {
			sass: {
				data: "@import '@/assets/styles';"
			}
		}
	},
	devServer: {
		hotOnly: false,
		proxy: {
			'/': {
				target: 'http://yapi.demo.qunar.com/mock/1016',
				ws: false,
				changeOrigin: true
			}
		}
	},
	// configureWebpack: config => {
	// 	config.plugins.forEach((item, i) => {
	// 		if (item.tsconfig) {
	// 			config.plugins.splice(i, 1);
	// 		}
	// 	})
	// }
}