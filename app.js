'use strict';

/**
 * Ama LionsClub App - 0.8.0
 */
angular.module('app', [
	'ngResource',
	'ngAnimate',
	'ngRoute',
	'ui.bootstrap'])
.config(['$interpolateProvider','$sceDelegateProvider', '$routeProvider', '$httpProvider', function ($interpolateProvider, $sceDelegateProvider, $routeProvider, $httpProvider) {
    //$interpolateProvider.startSymbol('[[');
    //$interpolateProvider.endSymbol(']]');
    $sceDelegateProvider.resourceUrlWhitelist([
    	'self',
    	'https://www.google.com/calendar/**',
    	'http://amalc-photo-blog.tumblr.com/api/read/json/',
    	'http://*.media.tumblr.com/*.jpg'
    ]);
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])
.factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
})
.directive('googlemapIframe', function ($compile) {
    return {
        restrict: 'EA',
        link: function(scope, elem, attrs) {
            if (elem.prop('tagName') !== 'IFRAME') { return; }
            elem.ready(function () {
                var ifrBody = elem.contents().find('body');
                ifrBody.css('background-color', 'none');   
                $compile(ifrBody)(scope);
            });
        }
    };
})
.directive('photoStreamDirective', function ($compile) {
    return {
        restrict: 'A',
        template: '<div class="masonry-item" ng-repeat="photo in photos" data-masonry-item="" ng-class="photo.class" style="background-image:url({{photo.imgsrc}})"></div>',
    };
})
.directive('masonryItem', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.imagesLoaded(function () {
            	element.show();				
				element.parent().masonry({ 
	        		itemSelector: '.masonry-item',
	        		columnWidth: 99,
	        		gutter: 6,
	        		transitionDuration: '.5s',
	        		hiddenStyle: {opacity: .01, transform: 'scale(0.2)'}
        		});
            });
        }
    };        
})
.directive('bannerHtml', function ($compile) {
    return {
	    restrict: 'A',
		scope:true,
        template: '<textarea rows="3" cols="60" style="color:black">{{bannertxt}}</textarea>'
    };
})
.factory("Photos", ['$route','$resource', '$window', function($route, $resource, $window) {
    var Photos = $resource('//amalionsclub.tumblr.com/api/read/json',{num:30, callback:'JSON_CALLBACK'}, {
    	get:{method:'JSONP',isArray:false,cache:true}
    });
    return Photos;
}])
.controller('menuCtrl', ['$scope'],function ($scope){
	$scope.collapse = true;
})
.controller('textCtrl', ['$scope', '$http', '$route', '$location', '$filter', '$window', '$sce' , '_' , 'Photos' ,function ($scope, $http, $route, $location, $filter, $window, $sce, _, Photos) {
	//$scope.tabs = {abount:0,board:0,activity:0,schedule:0,applicants:0,link:0};
	$scope.email = 'amalc@giga.ocn.ne.jp';
	$scope.bannertxt = '<a href=\"http://amalionsclub.jp\/" target=\"_blank\"><img src=\"https://gs1.wac.edgecastcdn.net/8019B6/data.tumblr.com/41622ab28781574c640cdd8345fab54f/tumblr_n972kdvBh91tg7fito1_250.png\"></a>';
	var w = angular.element($window);
    var wh = w.width();
	$scope.init = function (scope, element, attrs) {
	    angular.forEach(angular.element('ul.nav.navbar-nav>li>a'), function(value, key){
		    var a = angular.element(value);
		    a.parent().removeClass('active');
		    if(a.attr('href') == '/activity') a.attr('href', '/tagged/活動');
		    if(a.attr('href') == $location.absUrl().split($location.host())[1]) a.parent().addClass('active');
		});
	};
	$scope.init();
	$scope.calendarurl = "https://www.google.com/calendar/embed?showTitle=0&amp;showPrint=0&amp;showCalendars=0&amp;showTz=0&amp;mode=AGENDA&amp;wkst=1&amp;src=4k5n4l7ktspmi8h4n3litqok4k%40group.calendar.google.com&amp;color=%23853104&amp;src=7kk3l67jv7hhqii8ttqg26vu4k%40group.calendar.google.com&amp;color=%2385310&amp;src=ja.japanese%23holiday%40group.v.calendar.google.com&amp;color=%232F6309&amp;ctz=Asia%2FTokyo";
	$scope.photos = [];
	var sizes = [{t:'photo-url-100',c:'tile-one'},{t:'photo-url-250', c:'tile-two'}, {t:'photo-url-500',c:'tile-three'}];
	//$http({method: 'GET', url: menulistload.jsonurl/*+'?dev='+ Pdev +'&kwd=' + PKwd + '&form=json&ofst=' + Pofst + '&hits=20'+ '&callback=JSON_CALLBACK'*/})
	$scope.photoinit = function(){		
		Photos.get({},
			function(json){
				var arr =  _.shuffle(json.posts);
				var obj;
				var count = {m:0,l:0};
				console.log(wh);
				for(var i = 0, len = arr.length;i < len; i++){
					console.log
					if(wh > 1200) {
						obj = sizes[parseInt(Math.random()*3)];
						if(obj.c == 'tile-three') {
							count.l++;
							if(count.l > 1) {
								obj = sizes[parseInt(Math.random()*2)];
							}
						}
						if(obj.c == 'tile-two') {
							count.m++;
							if(count.m > 3) {
								obj = sizes[0];
							}
						}
					} else if(wh > 992) {
						obj = sizes[parseInt(Math.random()*2)];
						if(obj.c == 'tile-two') {
							count.m++;
							if(count.m > 3) {
								obj = sizes[0];
							}
						}
					} else {
						obj = sizes[0];
					}
					$scope.photos.push({imgsrc: arr[i][obj.t], class: obj.c});
				}
			},
			function(json){
				$scope.data = {result: "通信エラー"};
		});
	};
	//$scope.photoinit();
}]);
