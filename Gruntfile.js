module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options: {
				laxcomma: true,
				camelcase: true,
				curly: true,
				eqeqeq: true,
				freeze: true,
				indent: 2,
				newcap: true,
				maxdepth: 3,
				maxstatements: 15,
				maxlen: 80,
				eqnull: true,
				funcscope: true,
				node: true
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					captureFile: 'results.txt', // Optionally capture the reporter output to a file 
					quiet: false, // Optionally suppress output to standard out (defaults to false) 
					clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false) 
				},
				src: ['test/**/*.js']

			}
		},
		express: {
			localtest: {
				options: {
					port: 5000
					,args: ['../config.json']
					,script: './src/index.js'
					,delay: 3
					,debug: true
				}
			}

		}

	});

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.registerTask("default", ['jshint','mochaTest']);
};