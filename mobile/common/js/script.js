var moduleUI = (function(moduleUI, $, undefined){

	// 전역 객체
	moduleUI.globalObj = {
		blackBG : "<div class='blackBG'></div>"
	};
	
	// GNB 영역 열기
	moduleUI.gnbShow = function(){
		this.init = function(){
			this.gnb = ".gnb";
			this.container = ".container";
			this.openBtn = ".gnbOpen";
			this.closeBtn = ".gnbClose";
			this.speed =  400;
			this.scHeight = $(window).height();
			this.initEvent();
		};
		this.initEvent = function(){
			var that = this;
			$(this.openBtn).on("touchend", function(e){
				e.preventDefault();
				that.open();
			});
			$(this.closeBtn).on("touchend", function(e){
				e.preventDefault();
				that.close();
			});
			$("body").on("touchend", ".blackBG", function(){ that.close(); });
		};
		this.open = function(){
			var that = this;
			$("body").css({overflow:"hidden"});
			$(this.gnb).css({display:"block", minHeight:this.scHeight}).stop().animate({left:0},that.speed, function(){
				$(that.container).css({position:"fixed",left:0,top:0});
			});
			$(".wrapper").append( moduleUI.globalObj.blackBG );
		};
		this.close = function(){
			var that = this;
			$(this.gnb).stop().animate({left:-170},that.speed, function(){
				$(this).css({display:"none"});
				$("body").css({overflow:"auto"});
			});
			$(this.container).css({position:"relative",left:0,top:0});
			$(".blackBG").remove();
		};
		this.init();
	};
	
	// GNB 아코디언 메뉴
	moduleUI.gnbMenu = function(){
		this.init = function(){
			this.menu = ".nav > ul > li";
			this.speed = 400;
			this.initEvent();
		};
		this.initEvent = function(){
			var that = this;
			$(this.menu).on("touchend", function(){
				var tg = $(this);
				if(!tg.hasClass("on")){
					$(that.menu).removeClass("on").find("> ul").stop().slideUp( that.speed );
					tg.addClass("on").find("> ul").stop().slideDown( that.speed  );
				}else{
					tg.removeClass("on").find("> ul").stop().slideUp( that.speed );
				}
			});
			$(this.menu).find("> ul > li").on("touchend", function(e){ e.stopPropagation() });
		};
		this.init();
	};

	// 댓글쓰기 영역 열기
	moduleUI.commentShow = function(){
		this.init = function(){
			this.btnOpen = "#c_btn01";
			this.btnClose = ".closeInput";
			this.comment = ".commentInput";
			this.state = true;
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(this.btnOpen).on("touchend", function(e){
				e.preventDefault();that.commentOpen( true );
			});
			$(this.btnClose).on("touchend", function(e){
				e.preventDefault();that.commentOpen( false );
			});
		};
		this.commentOpen = function( info ){
			var that = this;
			if(this.state == info){
				$(this.comment).stop().slideDown(400, function(){
					$(that.btnOpen).css({display:"none"});
				});
			}else{
				$(this.comment).stop().slideUp(400,function(){
					$(that.btnOpen).css({display:"block"});
				});
			}
		}
		this.init();
	};

	// 아코디언 메뉴
	moduleUI.Accordion = function( info ){
		this.init = function( info ){
			this.acmenu = info.selecter;
			this.accontents =  info.contents;
			this.close = info.closeBtn;
			this.speed = 300;
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(this.acmenu).find("> ul > li").on("touchend", function(){ that.showContents( $(this) ); });
			$(this.close).on("touchend", function(e){ e.preventDefault();$(that.accontents).stop().slideUp(); });
			$(this.acmenu).find( this.accontents ).on("touchend", function(e){ e.stopPropagation(); });
		};
		this.showContents = function( item ){
			var tg = item;
			if( !tg.find( this.accontents ).is(":visible") ){
				$(this.acmenu).find( this.accontents ).stop().slideUp( this.speed );
				tg.find( this.accontents ).stop().slideDown( this.speed );
				$(this.acmenu).find("> ul > li").removeClass("on");
				tg.addClass("on");
			}else{
				tg.find( this.accontents ).stop().slideUp( this.speed );
				tg.removeClass("on");
			}
		}
		this.init( info );
	};

	// 위로 가기
	moduleUI.topScroll = function(){
		this.init = function(){
			this.scrollBtn = ".topScroll",
			this.speed = 400;
			this.initEvent();
		};
		this.initEvent = function(){
			var objThis = this;
			$(this.scrollBtn).on("click", function(){
				$("body").stop().animate({
					scrollTop : 0
				},objThis.speed);
			});
			$(window).scroll(function(){
				var sc = $(window).scrollTop();
				if(sc >= 100){
					$(objThis.scrollBtn).stop().fadeIn();
				}else{
					$(objThis.scrollBtn).stop().fadeOut();
				}
			});
		};
		this.init();
	};

	// 구글 지도 API
	// 함수호출시 파라미터 (지도보일 영역, 제목, X 좌표, Y좌표)
	moduleUI.googleMap = function( info ){
		/*
			http://openapi.map.naver.com/api/geocode.php?key=f32441ebcd3cc9de474f8081df1e54e3&encoding=euc-kr&coord=LatLng&query=서울특별시 강남구 강남대로 456
	            위의 링크에서 뒤에 주소를 적으면 x,y 값을 구할수 있습니다.
		*/
		//var iConArray = [];
		//iConArray[0] = "../../images/icon/icon_marker.png"
		this.Y_point = info.xPoint,// Y 좌표
		this.X_point = info.yPoint, // X 좌표
		this.zoomLevel = 15, // 지도의 확대 레벨 : 숫자가 클수록 확대정도가 큼
		this.markerTitle = "홈코트 위치",	// 현재 위치 마커에 마우스를 오버을때 나타나는 정보
		this.markerMaxWidth = 300,	// 마커를 클릭했을때 나타나는 말풍선의 최대 크기
		this.myLatlng = new google.maps.LatLng(this.Y_point, this.X_point);
		var mapOptions = {
			zoom: this.zoomLevel,
			center: this.myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var map = new google.maps.Map(document.getElementById( info.idName ), mapOptions);
		var marker = new google.maps.Marker({
			position: this.myLatlng,
			map: map,
			title: this.markerTitle,
			//icon: iConArray[0],
		});
		var infowindow = new google.maps.InfoWindow(
			{
				//content: this.contentString,
				content: info.title ,
				maxWidth: this.markerMaxWidth
			}
		);
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, marker);
		});
	};
	 
	return moduleUI;

})(window.moduleUI || {}, jQuery);

$(window).on("load", function(){
	var gnb = new moduleUI.gnbShow();
	var nav = new moduleUI.gnbMenu();
	var topBtn = new moduleUI.topScroll();
});
