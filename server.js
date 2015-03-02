var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var done = false;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/resources", express.static(__dirname + '/resources'));

app.use(multer({ dest: './resources/images/latest_plane_crash',
 	rename: function (fieldname, filename) {
    		return Date.now() + '.latest_plane_crash';
  	},
	onFileUploadStart: function (file) {
  		console.log(file.originalname + ' is starting ...')
	},
	onFileUploadComplete: function (file) {
  		console.log(file.fieldname + ' uploaded to  ' + file.path)
  		done=true;
	}
}));

app.get('/latest_plane_crash', function( req, res ){
	var fib = require('./libs/fib');
	fib(34);
	var reader = require('./libs/reader');
	reader.read( res, 'latest_plane_crash' );
});

app.get('/latest_plane_crash/images', function( req, res ){
	var fib = require('./libs/fib');
	fib( 34 );
	var reader = require('./libs/reader');
	reader.images( res, 'latest_plane_crash', 10 );
});

app.get('/edit/latest_plane_crash', function( req, res ){
	var fib = require('./libs/fib');
	fib(34);
	var reader = require('./libs/reader');
	reader.read( res, 'editor' );
});

app.post('/edit/latest_plane_crash', function( req, res ){
	var fib = require('./libs/fib');
	fib( 34 );

	if( typeof( req.body.content ) !== 'undefined' ){
		var writer = require('./libs/writer');
		writer.write( res, req.body.content, 'latest_plane_crash' );
		return;
	}
	var reader = require('./libs/writer');
	reader.read( res, 'editor' );
});

app.post('/upload/image', function( req, res ){
	if(done){
    	res.writeHead(200, {'Content-Type': 'application/json'});
    	res.end('{"success": "Image uploaded successfully."}');
  	}
});

app.listen(1388);
