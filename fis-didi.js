var fis = module.exports = require('fis');
var preprocessor = require('./plugin/preprocessor/main.js');
fis.cli.name = 'fis-didi';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.version = require('./version.js');
fis.require.prefixes = ['didi', 'fis'];
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];
var releaseDir = '/static/release/';
var parser = {
	//.tmpl后缀的文件使用fis-parser-utc插件编译
	tmpl: 'utc',
	css: 'less',
	less: 'less'
};
var postprocessor = {
	js: 'jswrapper,require-async',
	html: "require-async",
	tpl: "require-async",
};
var postpackager = ['autoload'];
var spriter = 'csssprites';
var optimizer = {tpl: 'html-minifier'};
var server = {
	rewrite: true,
	libs: 'rewrite,smarty,webzhangnan/fis-didi-server',
	type: 'php',
	clean: {
		exclude: "fisdata**,smarty**,rewrite**,index.php**,WEB-INF**,combo**"
	}
}


var componentsRoadmap = [
	{
		//component_modules文件夹下的css类型文件，以之后的后缀为id
		reg: /^\/component_modules\/(.*)\.(styl|less|css)$/i,
		id: '$1.css',
		useSprite: true,
		isMod: true,
		release: '${releaseDir}/$&'
	}, 
	//component_modules下的下划线开头的文件夹或者文件都不模块化包裹
	{
		reg: /^\/component_modules(\/[^\/]+)*\/_[^\/]+(\/[^\/]+)*\.js$/,
		isMod: false,
		release: '${releaseDir}$0',
	}, 
	//component_modules下面的js文件（其他地方会自动处理入口js文件），以之后的后缀为id
	{
		reg: /^\/component_modules\/(.*\.js)$/i,
		id: '$1',
		isMod: true,
		release: '${releaseDir}/$&'
	},
	//component文件夹下的css类型文件，以之后的后缀为id
	{
		reg: /^\/components\/(.*)\.(styl|less|css)$/i,
		id: '$1.css',
		useSprite: true,
		isMod: true,
		release: '${releaseDir}/$&'
	}, 
	//component文件夹下的入口js文件以模块名称作为id
	{
		reg: /^\/components\/([^\/]+)\/\1\.js$/i,
		id: '$1',
		isMod: true,
		release: '${releaseDir}/$&'
	},
	//component下的下划线开头的文件夹或者文件都不模块化包裹
	{
		reg: /^\/components(\/[^\/]+)*\/_[^\/]+(\/[^\/]+)*\.js$/,
		isMod: false,
		release: '${releaseDir}$0',
	}, 
	//component_modules下面的其他js文件（入口js文件除外），以之后的后缀为id
	{
		reg: /^\/components\/(.*\.js)$/i,
		id: '$1',
		isMod: true,
		release: '${releaseDir}/$&'
	}
];


var roadmap = [{
		reg: 'rewrite.conf',
		release: '/server-conf/rewrite.conf'
	}, {
		reg: 'proxy.php',
		useCompile: false,
		release: '/proxy.php'
	},
	//测试数据
	{
		reg: /\/test\/([^\/]+)\/main\.php/,
		isMod: false,
		release: 'test/$1.php'
	},

	//将main.html作为所在文件夹的名称发不到page目录下
	{
		reg: /\/page\/([^\/]+)\/main\.html/,
		isMod: true,
		release: 'page/$1.html'
	},

	{
		//lib文件夹下的文件不做模块化处理
		reg: 'lib/**.js',
		release: '${releaseDir}$&',
		isMod: false,
	}, {
		// 下划线开头的文件，或者下划线开头的文件夹中的文件不作为mod处理，支持非模块化js，求同存异
		reg: /(\/[^\/]+)*\/_[^\/]+(\/[^\/]+)*\.js$/,
		release: '${releaseDir}$0',
		isMod: false
	},
	//其他js是模块化处理
	{
		reg: '**.js',
		release: '${releaseDir}$&',
		isMod: true
	},
	//其他css是模块化处理
	{
		reg: '**.css',
		release: '${releaseDir}$&',
		isMod: true
	},
	//模板文件不压缩且不发布
	{
		reg: '**tmpl',
		useOptimizer: false,
		release: false,
		isJsLike: true
	},
	
	{
		reg: /.+?(png|jpeg|jpg|gif)$/,
		release: '${releaseDir}$&',
	}

];

var smartyRoadmap = [
	//将main.tpl作为所在文件夹的名称发布到template目录下
	{
		reg: /\/template\/([^\/]+)\/main\.tpl/,
		isMod: true,
		release: 'template/$1.tpl'
	}
];


var roadmapPath = componentsRoadmap.concat(roadmap.concat(smartyRoadmap));


// fis.config.set('roadmap.path', roadmapPath);
fis.config.merge({
	releaseDir: releaseDir,
	roadmap: {
		path: roadmapPath
	},
	//各个流程的配置
	modules: {
		parser: parser,
		postprocessor: postprocessor,
		postpackager: postpackager,
		spriter: spriter,
		optimizer: optimizer
	},
	settings: {
		postprocessor: {
			jswrapper: {
				type: 'amd'
			}
		},
		postpackager: {
			autoload: {
				useInlineMap: true,
				// include: '/page/**',
				optDeps: false
			}
		}
	},
	server: server
});
fis.config.set('modules.preprocessor', {});
fis.config.set('modules.preprocessor.css', [preprocessor.CSS]);
fis.config.set('modules.preprocessor.js', [preprocessor.JS]);
fis.config.set('modules.preprocessor.html', [preprocessor.HTML]);





