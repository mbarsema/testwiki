var servers = {'localhost:11211': 1};
var serverOpts = {
	timeout: 100,
	retries: 1,
	failures: 2,
	idle: 100	
};
var fs = require('fs');
var Memcached = require('memcached');
var memcached = new Memcached(servers, serverOpts);

exports.init = function(){
	fs.exists( './resources/images/', function( exists ){
		if( ! exists ){
			fs.mkdir('./resources/images/', 0775, function( exception ){
				console.log( exception );
			});
		}
	});
}


exports.write = function( res, content, file ){
	var filename = './html/' + file + '.html';
	fs.exists( filename, function( exists ){
		if( exists ){
			var writeStream = fs.createWriteStream(filename);
			var streamError = false;
			
			writeStream.write( content );
			writeStream.end();
				
			writeStream.on('error', function(err){
				streamError = true;
			});
				
			writeStream.on('finish', function(){
				if(streamError){
					res.writeHead(500, {'Content-Type': 'application/json'});
					res.end('{"error": "Could not save file!"}');
					return;
				}
				var lifetime = 60 * 5; // cache for five minutes
				memcached.set('wiki:post:'+file, content, lifetime, function( err, result ){
					if( err ){
						console.log( err );
					}
				});
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end('{"success": "File saved correctly."}');
			});
		}else{
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<!doctype html><html><head><title>404 File Not Found!</title></head><body><h1>File Not Found</h1><p>Not Found!</p></body></html>');
		}
	});
};
