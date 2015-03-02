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

exports.read = function( res, file ){
	var readLocal = function( file ){
		var filename = './html/' + file + '.html';
		fs.exists( filename, function( exists ){
			if( exists ){
				res.writeHead(200, {'Content-Type': 'text/html'});
				var readStream = fs.createReadStream(filename);
				var contentString = '';
				var streamError = false;
				readStream.on('open', function(){
					readStream.pipe(res);
				});
				readStream.on('data', function( chunk ){
					contentString += chunk;
				});
				
				readStream.on('error', function(err){
					streamError = true;
				});
				
				readStream.on('close', function(){
					if(streamError){
						res.writeHead(500, {'Content-Type': 'text/html'});
						res.end('<!doctype html><html><head><title>500 - Server Error!</title></head><body><h1>Error</h1><p>Server error!</p></body></html>');
						return;
					}
					var lifetime = 60 * 5; // cache for five minutes
					memcached.set('wiki:post:'+file, contentString, lifetime, function( err, result ){
						if( err ){
							console.log( err );
						}
					});
					res.end();
				});
			}else{
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.end('<!doctype html><html><head><title>404 File Not Found!</title></head><body><h1>File Not Found</h1><p>Not Found!</p></body></html>');
			}
		});
	}
	
	memcached.get('wiki:post:'+file, function( err, result ){
		if( err || result === false ){
			readLocal( file );
			return;
		}
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(result);
	});
};


exports.images = function( res, file, limit ){
	fs.readdir('./resources/images/' + file, function( err, files ){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(files));
	});
};