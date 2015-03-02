function createRichText( mySelector, myWidth, myHeight ){
	tinymce.init({
		selector: mySelector,
		width: myWidth,
		height: myHeight,
		theme: 'modern',
		plugins: [
        	"advlist autolink lists link image charmap print preview hr anchor pagebreak",
        	"searchreplace wordcount visualblocks code fullscreen",
        	"insertdatetime save table",
        	"paste textcolor"
    	],
    	save_enablewhendirty: true,
    	save_onsavecallback: function(){
    		saveContent();
    	},
    	file_browser_callback: function(field_name, url, type, win) {
            if(type=='image'){
            	$('#image').click();
        	}
        },
        toolbar: "save insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
	});
}

function uploadImage( imageElem ){
	$("#imageUpload").submit();
	imageElem.value = '';
}

function getContent(){
	$.get( "/latest_plane_crash", function( data ) {
		var contentElem = document.getElementById("content");
		var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im
		var content = pattern.exec(data)[0];
		originalContent = data;
		contentElem.value = content;
	});
}

function getImages(){
	$.get('/latest_plane_crash/images', function( data ){
		var imageElem = document.getElementById("images");
		imageElem.innerHTML = '';
		for( var i in data ){
			if( ! data.hasOwnProperty(i)) continue;
			var img = document.createElement('img');
			img.className = 'imgFile';
			img.setAttribute("src", "../resources/images/latest_plane_crash/" + data[i]);
			img.setAttribute("alt", "Plane crash");
			
			var location = document.createElement('div');
			location.className = 'imgLocation';
			location.appendChild( document.createTextNode( "../resources/images/latest_plane_crash/" + data[i] ) );
			
			var imageContainer = document.createElement("div");
			imageContainer.className = 'imgContainer';
			imageContainer.appendChild( img );
			imageContainer.appendChild( location );
			
			imageElem.appendChild( imageContainer );	
		}
	});
}

function saveContent( ){
	var editor = tinyMCE.get('content');
	var content = editor.getContent();
	editor.setProgressState(1); // Show progress
    		
    var openPattern = /<body[^>]*>/im
  	openBodyTag = openPattern.exec( originalContent, '')[0];
  	content = openBodyTag + content + '</body>';
  			
	var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im
	var newContent = originalContent.replace(pattern, content);
	$.post( "/edit/latest_plane_crash", {"content": newContent} ).done( function( data ){
		tinyMCE.get('content').setProgressState(0);
		originalContent = data;
	});
	return false;
}
