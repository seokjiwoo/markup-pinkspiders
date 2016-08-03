var packageUI = (function(packageUI, $, undefined){

	// 공통 오브젝트
	var global = {
		blockBG : "<div class='blackBG'></div>",
		sct : null
	};

	// GNB
	packageUI.gnb = function( info ){
		this.init = function(){
			this.gnbMenu = ".gnbWrap",
			this.menuList = ".menuList",
			this.speed = 600;
			this.initEvent();
		};
		this.initEvent = function(){
			var that = this;
			$(this.gnbMenu).hover(function(){
				$(that.menuList).stop().slideDown(that.speed);
			}, function(){
				$(that.menuList).stop().slideUp(this.speed);
			});
		};
		this.init()
	};

	// 푸터부분 페밀리사이트
	packageUI.familySite = function( info ){
		this.init = function(){
			this.selectMenu = ".familySite",
			this.selectList = ".siteList",
			this.state = true;
			this.initEvent();
		};
		this.initEvent = function(){
			var that = this;
			$(this.selectMenu).on("click", function(e){
				e.preventDefault();
				that.selectSite( $(this) );
			});
			$(this.selectList).find("> ul > li").on("click", function(e){
				e.stopPropagation();
			});
		};
		this.selectSite = function( item ){
			if(this.state == true){
				$(item).addClass("on");
				$(this.selectList).css({display:"block"});
				this.state = false;
			}else{
				$(item).removeClass("on");
				$(this.selectList).css({display:"none"});
				this.state = true;
			}
		}
		this.init();
	};

	// 메인 페이스북 영역 열기
	packageUI.facebookOpen = function(){
		this.init = function(){
			this.sideMenu = ".sideMenu",
			this.faceBtn = ".faceBtn",
			this.faceClose = ".faceClose",
			this.faceContents = ".faceContent",
			this.speed = 300;
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(window).scroll(function(){
				that.scrollSideMenu();
			});
			$(this.faceBtn).on("click", function(e){
				e.preventDefault();
				that.facebookShow();
			});
			$(this.faceClose).on("click", function(e){
				e.preventDefault()
				that.facebookHide();
			});
		}
		this.facebookShow = function(){
			$(this.faceContents).css({ top : 0, display:"block" }).stop().animate({right:0},this.speed);
			$("body").append( global.blockBG );
			$(".blackBG").stop().fadeIn(700);
		}
		this.facebookHide = function(){
			$(this.faceContents).stop().animate({right:-577},this.speed, function(){ $(this).css({display:"none"}); });
			$(".blackBG").stop().fadeOut(700, function(){ $(this).remove(); });
		}
		this.scrollSideMenu = function(){
			global.sct = $(window).scrollTop();
			$(this.sideMenu).stop().animate({ top : global.sct + 133 },this.speed);
		};
		this.init();
	};

	// 메인 뉴스 이미지 전환효과
	packageUI.newsShow = function(){
		this.init = function(){
			this.newsList = ".news .list",
			this.thumbImg = ".news .thumb",
			this.menuItem = null;
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(this.newsList).find("ul > li").on("mouseenter", function(){ that.imgShow( $(this), true ); });
			$(this.newsList).find("ul > li").on("mouseleave", function(){ that.imgShow( $(this), false ); });
		}
		this.imgShow = function( item, state ){
			var dataName = item.find("> a").attr("data-name");
			if(state == true){
				$(this.thumbImg).find("> a").removeClass("on");
				$(this.thumbImg).find( "#" + dataName ).addClass("on");
				$(this.thumbImg).find("> a > img").css({ width:250 });
				$(this.thumbImg).find("#" + dataName+ "> img").css({ width:280 });
			}else{
				$(this.thumbImg).find("#" + dataName + "> img").css({ width:250 });
			}
		}
		this.init();
	};
	
	// 아코디언 메뉴
	packageUI.Accordion = function( info ){
		this.init = function( info ){
			this.acmenu = info.selecter;
			this.accontents =  info.contents;
			this.state = info.state;
			this.speed = 300;
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(this.acmenu).find("> ul > li").on("click", function(){ that.showContents( $(this) ); });
			$(this.acmenu).find( this.accontents ).on("click", function(e){ e.stopPropagation(); });
			/*if( this.state == true ){
				$(this.acmenu).find("> ul > li:first").off("click");
			}*/
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

	// 역대 선수 페이지 외부 html 파일 불러오기
	packageUI.pageLoad = function(){
		this.init = function(){
			this.menu = ".yearTab ul li";
			this.pageCon = "#result";
			this.selectItem = null;
			this.initEvent();
			this.startData();
			this.activeIndex(0);
		}
		this.initEvent = function(){
			var that = this;
			$(this.menu).on("click", function(e){
				e.preventDefault();
				that.loadData( $(this).find("> a").attr("href"), $(this) );
			});
		}
		this.startData = function(){
			$(this.pageCon).load("history_player_txt.jsp #history0" + 1, function(){ $(".loading").hide(); });
		};
		this.loadData = function( pageId, item ){
			var that = this;
			$(".loading").show();
			$.ajax({
				url : "history_player_txt.jsp",
				dataType : "",
				success : function( data ){
					$(that.pageCon).children().remove();
					$(that.pageCon).html( $(data).find( pageId ).html() );
				}
			});
			this.activeMenu( item );
		};
		this.activeMenu = function( item ){
			if( this.selectItem || $(this.menu).eq(0).hasClass("on") ){
				$(this.menu).removeClass("on");
			}
			this.selectItem = item;
			this.selectItem.addClass("on");
		};
		this.activeIndex = function( menuIndex ){
			$(this.menu).eq( menuIndex ).addClass("on");
		};
		this.init();
	};

	// 로그인 팝업열기
	packageUI.loginPopShow = function(){
		this.init = function(){
			this.loginBtn = ".loginBtn";
			this.closePop= ".loginPopup .closeBtn";
			this.loginPop= ".loginPopup";
			this.initEvent();
		}
		this.initEvent = function(){
			var that = this;
			$(this.loginBtn).on("click", function(e){ e.preventDefault(); that.showPop(); });
			$(this.closePop).on("click", function(e){ e.preventDefault(); that.hidePop(); });
		}
		this.showPop = function(){
			$(this.loginPop).stop().fadeIn(700);
			$("body").append("<div class='blackBG'></div>");
			$(".blackBG").stop().fadeIn(700);
		}
		this.hidePop = function(){
			$(this.loginPop).stop().fadeOut(700);
			$(".blackBG").stop().fadeOut(700, function(){
				$(this).remove();
			});
		}
		this.init();
	};

	// 선수리스트 클릭시 활성화
	packageUI.playerSlide = function(){
		this.init = function(){
			this.menu = ".playerList2 ul li";
			this.initEvent();
		};
		this.initEvent = function(){
			var that = this;
			$(this.menu).on("click", function(){
				that.activeClass( $(this) );
			});
		};
		this.activeClass = function( item ){
			var index = item.index();
			$(this.menu).removeClass("on");
			$(this.menu).eq( index ).addClass("on");
		};
		this.init();
	};

	// 페이스북 API 영역 특정 해상도에 따른 높이값설정
	packageUI.facebookResize = function(){
		this.init = function(){
			this.w = null;
			this.faceBook = $(".faceContent .scrollArea");
			this.fcontent = ".fb-page"
			this.initEvent();
		}
		this.initEvent = function(){
			this.winResize();
		}
		this.winResize = function(){
			w = $(window).width();
			if(w <= 1366){
				$(this.faceBook).css({height:635});
				$(this.fcontent).attr("data-height",635);
			}else if(w > 1366 && w < 1680){
				$(this.faceBook).css({height:795});
				$(this.fcontent).attr("data-height",795);
			}else if(w > 1680 && w < 1920){
				$(this.faceBook).css({height:850});
				$(this.fcontent).attr("data-height",850);
			}else if(w > 1920){
				$(this.faceBook).css({height:1200});
				$(this.fcontent).attr("data-height",1200);
			}
		}
		this.init();
	};

	// 구글 지도 API
	// 함수호출시 파라미터 (지도보일 영역, 제목, X 좌표, Y좌표)
	packageUI.googleMap = function( info ){
		/*
			http://openapi.map.naver.com/api/geocode.php?key=f32441ebcd3cc9de474f8081df1e54e3&encoding=euc-kr&coord=LatLng&query=서울특별시 강남구 강남대로 456
	            위의 링크에서 뒤에 주소를 적으면 x,y 값을 구할수 있습니다.
		*/
		var iConArray = [];
		iConArray[0] = "../../images/icon/icon_marker.png"
		this.Y_point = info.xPoint,// Y 좌표
		this.X_point = info.yPoint, // X 좌표
		this.zoomLevel = 16, // 지도의 확대 레벨 : 숫자가 클수록 확대정도가 큼
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
			icon: iConArray[0],
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
	 
	return packageUI;

})(window.packageUI || {}, jQuery);

$(window).on("load", function(){
	var gnbMenu = new packageUI.gnb();	
	var familySite = new packageUI.familySite();
	var loginpop = new packageUI.loginPopShow();
});
