function openUrl(url){
	if(url.match(/^https?:\/\//)){
		window.open(url);
	}else{
		window.location.href = url;
	}
}

function setCategoryHeight(){
	if($('.sitemapContainer').hasClass('tree')){
		$('.sitemapCategory').css('height', function(){
			return (this.children.length * 50 + 60) + "px";
		});
	}else{
		$('.sitemapCategory').css('height', '');
	}
}

$(function(){
	$('.sitemapItem').on('click', function(e){
		var url = this.getAttribute("data-url");
		if(url){
			openUrl(url);
		}
		e.preventDefault();
		e.stopPropagation();
	});

	$('.sitemapSection').on('click', function(){
		$('.sitemapContainer').toggleClass('tree');
		$('.sitemapContainer').toggleClass('circle');
		setCategoryHeight();
	});

	setCategoryHeight();
  });