Business = {};

Business.resizeBox = function($boxes, $container){
	var skewingX,skewingY;
	var zindex = 2000;
	for(var i=0; i<$boxes.length; i++){
		$($boxes[i]).attr('draggable', 'true').addClass('resize-box').css('z-index', zindex);
		zindex++;
		$($boxes[i]).append('<div class="resize-index" contenteditable="true" >'+$($boxes[i]).data('index')+'</div>');
	}

	// 选中
	$container.on('click', '.resize-box',function(e){
		var $box = $(e.target);
		if(!$box.hasClass('resize-box')){
			return false;
		}
		_removeBorder();
		$box.css('z-index', zindex).addClass('resize-active').siblings().removeClass('resize-active');
		_createBorder(e.target);
		zindex++;
		e.stopPropagation();
		e.preventDefault();

	});
	$(document).click(function(e) {
		if($(".resize-box").hasClass('resize-active')){
		    $('.resize-active').removeClass('resize-active');
		    _removeBorder();
		}
	});

	// 编辑序号
	$container.on('click', '.resize-index',function(e){
		$(e.target).parent().removeClass('resize-active');
	});
	
	$container.on('blur', '.resize-index', function(e) {
		e.preventDefault();
		var $index = $(e.target)
		var index = $index.html();
		if(/^\d{1,2}$/.test(index)){
			$index.parent().attr('data-index', index);
		}else{
			$index.html($index.parent().data('index'));
		}
	});

	$container.on('keydown', '.resize-index', function(e) {
		if(e.which === 13){
			$(e.target).trigger('blur');
			$(e.target).parent().trigger('click');
			e.preventDefault();
		}
	});
	

	// 缩放
	$container.on('mousedown', '.resizable', _resizeDown);
	
	// 拖动
	$container.on('dragstart', '.resize-box', function(e){
		skewingX = e.pageX - $(this).offset().left;
		skewingY = e.pageY - $(this).offset().top;
		var obj = {
			'skewingX':skewingX,
			'skewingY':skewingY
		}
		var $box = $(e.target);
		if(_isIE()){
			$box.addClass('box-hidden');
		}else{
			$box.css('opacity',0);
		}
		$box.css('z-index', zindex);
		zindex++;
		e.originalEvent.dataTransfer.setData('text',JSON.stringify(obj));
		$box.addClass('resize-active').addClass('dragging').siblings().removeClass('resize-active');
		_removeBorder();
		
	});
	$container.on('drag', '.resize-box', function(e) {
		var $box = $(e.target);
		$box.removeClass('box-hidden');
		$box.css('opacity',0.5);
		if(e.pageX == 0){
			return;
		}
		var left = e.pageX - $container.offset().left - skewingX;
		var top = e.pageY - $container.offset().top - skewingY;
		if(top < 0){
			top = 0;
		}
		if(top > $container.height() - $box.height()){
			top = $container.height() - $box.height();
		}

		if(left < 0){
			left = 0;
		}
		if(left > $container.width() - $box.width()){
			left = $container.width() - $box.width();
		}

		$box.css({
			top: top,
			left: left
		});
	});
	$container.on('dragend', '.resize-box', function(e) {
		$('.dragging').css('opacity', 1).removeClass('dragging');
		_createBorder(e.target);
		e.preventDefault();
	});
	$container.on('dragover',function(e){
		e.preventDefault();
	})
	$container.on('drop', function(e){
		var obj = e.originalEvent.dataTransfer.getData('text');
		obj = JSON.parse(obj);
		// var posX = e.pageX - $(this).offset().left - obj.skewingX;
		// var posY = e.pageY - $(this).offset().top - obj.skewingY;

		$('.dragging').css({
			// 'top': posY,
			// 'left': posX,
			'opacity': 1
		}).removeClass('dragging');

		e.preventDefault();
	})


	function _createBorder(box){
		var $box = $(box);
		var widthLen = $box.width() - 10;
		var heightLen = $box.height() - 10;
		var borderWidth = 10;
		$box.addClass('resize-box');
		$box.attr('draggable','true');
		$box.append('<div class="resizable top-left-point" style="width:'+borderWidth+'px;height:'+borderWidth+'px"></div>')  	//左上角
			.append('<div class="resizable top-border" style="width:'+widthLen+'px;height:'+borderWidth+'px"></div>')			//上边框
			.append('<div class="resizable top-right-point" style="width:'+borderWidth+'px;height:'+borderWidth+'px"></div>')		//右上角
			.append('<div class="resizable right-border" style="width:'+borderWidth+'px;height:'+heightLen+'px"></div>')		//右边框
			.append('<div class="resizable bottom-right-point" style="width:'+borderWidth+'px;height:'+borderWidth+'px"></div>')		//右下角
			.append('<div class="resizable bottom-border" style="width:'+widthLen+'px;height:'+borderWidth+'px"></div>')			//下边框
			.append('<div class="resizable bottom-left-point" style="width:'+borderWidth+'px;height:'+borderWidth+'px"></div>')		//左下角
			.append('<div class="resizable left-border" style="width:'+borderWidth+'px;height:'+heightLen+'px"></div>')		//左边框
	}

	function _resizeDown(e){
		e.preventDefault();
		e.stopPropagation();
		var $box = $(e.target).offsetParent();
		var target = e.target;
		var orBoxLeft = $box.offset().left,
			orBoxTop = $box.offset().top;
			orBoxRight = orBoxLeft + $box.width(),
			orBoxBottom = orBoxTop + $box.height();
		$(document).on('mousemove',function(e){
			var mouseX = e.clientX,
				mouseY = e.clientY,
				containerX = $container.offset().left,
				containerY = $container.offset().top,
				containerW = $container.width(),
				containerH = $container.height(),
				boxX = $box.offset().left,
				boxY = $box.offset().top,
				boxW = $box.width(),
				boxH = $box.height();
			if(mouseX > containerX && mouseY > containerY && mouseX < containerX + containerW && mouseY < containerY + containerH){
				var className = target.className.split(' ')[1];
				switch(className){
					case 'top-left-point': if(mouseY > orBoxBottom - 20){
												mouseY = orBoxBottom - 20;
											}
											if(mouseX > orBoxRight - 20){
												mouseX = orBoxRight - 20;
											}
											$box.css({
												left: function(i,v){
													v = parseInt(v.slice(0,-2));
													return v-(boxX - mouseX)+'px';
												},
												top: function(i,v){
													v = parseInt(v.slice(0,-2));
													return v-(boxY - mouseY)+'px';
												},
												height: function(i,v){
													v = parseInt(v.slice(0,-2));
													v = v + (boxY - mouseY);
													return v + 'px';
												},
												width: function(i,v){
													v = parseInt(v.slice(0,-2));
													v = v + (boxX - mouseX);
													return v+'px';
												}
											});
										break;
					case 'top-border': 	if(mouseY > orBoxBottom - 20 ){
											mouseY = orBoxBottom - 20;
										}
										$box.css({
											top: function(i,v){
												v = parseInt(v.slice(0,-2));
												return v - (boxY - mouseY)+'px';
											},
											height: function(i,v){
												v = parseInt(v.slice(0,-2));
												v = v + (boxY - mouseY);
												return v +'px';
											}
										});
										break;
					case 'top-right-point': if(mouseY > orBoxBottom - 20 ){
												mouseY = orBoxBottom - 20;
											}
											if(mouseX < orBoxLeft + 20){
												mouseX = orBoxLeft + 20;
											}
											$box.css({
												top: function(i,v){
													v = parseInt(v.slice(0,-2));
													return v-(boxY - mouseY)+'px';
												},
												height: function(i,v){
													v = parseInt(v.slice(0,-2));
													v = v+(boxY - mouseY);
													
													return v +'px';
												},
												width: function(i,v){
													v = parseInt(v.slice(0,-2));
													v = v-(boxX + boxW - mouseX);
													
													return v+'px';
												}
											});break;
					case 'right-border': if(mouseX < orBoxLeft + 20){
											mouseX = orBoxLeft + 20;
										} 
										$box.css({
											width: function(i,v){
												v = parseInt(v.slice(0,-2));
												v = v-(boxX + boxW - mouseX);
												return v+'px';
											}
										});break;
					case 'bottom-right-point': if(mouseX < orBoxLeft + 20){
													mouseX = orBoxLeft + 20;
												}
												if(mouseY < orBoxTop + 20 ){
													mouseY = orBoxTop + 20;
												}
												$box.css({
												height: function(i,v){
													v = parseInt(v.slice(0,-2));
													v=v-(boxY + boxH - mouseY);
													return v+'px';
												},
												width: function(i,v){
													v = parseInt(v.slice(0,-2));
													v = v-(boxX + boxW - mouseX);
													return v+'px';
												}
											});break;
					case 'bottom-border': if(mouseY < orBoxTop + 20 ){
											mouseY = orBoxTop + 20;
										}
										$box.css({
											height: function(i,v){
												v = parseInt(v.slice(0,-2));
												v=v-(boxY + boxH - mouseY);
												return v+'px';
											}
										});break;
					case 'bottom-left-point': if(mouseX > orBoxRight - 20){
												mouseX = orBoxRight - 20;
											}
											if(mouseY < orBoxTop + 20 ){
												mouseY = orBoxTop + 20;
											}
											$box.css({
												left: function(i,v){
													v = parseInt(v.slice(0,-2));
													return v-(boxX - mouseX)+'px';
												},
												height: function(i,v){
													v = parseInt(v.slice(0,-2));
													v=v-(boxY + boxH - mouseY);
													return v+'px';
												},
												width: function(i,v){
													v = parseInt(v.slice(0,-2));
													v=v+(boxX - mouseX);
													return v+'px';
												}
											});break;
					case 'left-border': if(mouseX > orBoxRight - 20){
											mouseX = orBoxRight - 20;
										}
										$box.css({
											left: function(i,v){
												v = parseInt(v.slice(0,-2));
												return v-(boxX - mouseX)+'px';
											},
											width: function(i,v){
												v = parseInt(v.slice(0,-2));
												v=v+(boxX - mouseX);
												return v+'px';
											}
										});break;
				}
				$('.top-border').width($box.width()-10);
				$('.bottom-border').width($box.width()-10);
				$('.left-border').height($box.height()-10);
				$('.right-border').height($box.height()-10);
			}
		});
		$(document).on('mouseup', function(e){
			$(document).off('mousemove');
		})
	}

	function _removeBorder(box){
		$('.resizable').remove();
	}

	function _isIE(){
		if (!!window.ActiveXObject || "ActiveXObject" in window)  
		    return true;  
		else  
		    return false;
	}

	return {
		add: function(opt){
			var opt = opt || {};
			var top = opt.top || $container.height()/2-25;
			var left = opt.left || $container.width()/2-25;
			var width = opt.width || 50;
			var height = opt.height || 50;
			var index = $(".resize-box").length+1;
			var $box = $('<div data-index="'+index+'"><div class="resize-index" contenteditable="true">'+index+'</div></div>');
			$box.css({
				'z-index': zindex,
				top: top+'px',
				left: left+'px',
				width: width+'px',
				height: height+'px',
			}).addClass('resize-box').data('index', $('.resize-box').length+1).addClass('resize-active');
			_createBorder($box[0]);
			$container.append($box);
			$box.siblings().removeClass('resize-active');
			zindex++;
		},
		del: function(){
			$('.resize-active').remove();
		},
		getData: function(){
			var data = [];
			var obj = {};
			for(var i = 0; i < $('.resize-box').length; i++){
				obj.index = $('.resize-box:eq('+i+')').data('index');
				obj.top = $('.resize-box:eq('+i+')').css('top').slice(0, -2);
				obj.left = $('.resize-box:eq('+i+')').css('left').slice(0, -2);
				obj.width = $('.resize-box:eq('+i+')').width();
				obj.height = $('.resize-box:eq('+i+')').height();
				data.push(obj);
			}
			return data;
		}
	}

}

window.Business = Business;