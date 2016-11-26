/**
 * local store 里面存储的变量记录
 * 
 *  isLogin === "false" or "true"   //记录是否登录
 *  accessToken                     //记录用户的唯一accessToken
 *  intervalID = ""                 //存储 自动发送定位的id
 * */



var myApp = new Framework7({
	swipeBackPage:true,
	animatePages:true,
	animateNavBackIcon: true,
	template7Pages: true,
    precompileTemplates: true,
	init: false 
});

var $$ = Dom7;
//var hosturl = "http://localhost:8360";
var hosturl = "http://119.29.183.198:8360";

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

myApp.onPageInit('home', function (page) {
   	
   	//注意 localStoragec取出来的是 字符串 所以不能用 !localStorage.isLogin  
   	if (localStorage.isLogin === "false") {
		mainView.router.loadPage("login.html");
		return;
	}
   	
   	showMyCurrentPosition();
// 	console.log("aaaa");
   	
	$$('#floatbutton').on('click', function (e) {
    var target = this;
    var buttons = [
        {
            text: '重新定位当前的位置',
            onClick: function() {detectionNetWork(showMyCurrentPosition)}
        },
        {
            text: '选择自动定位时间',
            onClick: selectAutoSendPositionInterval.bind(target)
        },
        {
        	text: '显示路径',
        	onClick: selectShowPathByTime.bind(target)
        }
    ];
    	myApp.actions(target, buttons);
	});
	
	
	$$('#lougout').click(function () {
		
		localStorage.isLogin = false;
		localStorage.accessToken = null;
		mainView.router.loadPage("login.html");
	});
	
	$$("#delete").click(function() {
		deleteAllMyPath();
	})
	
});

myApp.init();


//showMyCurrentPosition();



function showMyCurrentPosition() {

	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(p) {
			var latitude = p.coords.latitude //纬度
			var longitude = p.coords.longitude;
			
			//需要转化为百度坐标
			var convertor = new BMap.Convertor();
			var currentPoint = new BMap.Point(longitude, latitude);
			convertor.translate([currentPoint], 1, 5, function(data) {

				if(data.status === 0) {
//					console.log(data);
					// 百度地图API功能
					var map = new BMap.Map("allmap"); // 创建Map实例
					map.centerAndZoom(data.points[0], 100); // 初始化地图,设置中心点坐标和地图级别
					var controlOpts = {anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_SMALL};
					map.addControl(new BMap.NavigationControl(controlOpts));
					
					
					var myIcon = new BMap.Icon("img/base/fox.gif", new BMap.Size(300,157));
					var marker2 = new BMap.Marker(data.points[0],{icon:myIcon});  // 创建标注
					map.addOverlay(marker2);              // 将标注添加到地图中
					
					

					map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
					//map.setCurrentCity("广州");          // 设置地图显示的城市 此项是必须设置的
					map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
				} else {
					myApp.alert("定位出错");
				}

			})

		}, function(e) { //错误信息
			var aa = e.code + "\n" + e.message;
			myApp.alert(aa);
		});
	} else {
		myApp.alert("error");
	}

}




//把转化好的发送给服务器
function sendPositionToServer() {

	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(p) {
			var latitude = p.coords.latitude //纬度
			var longitude = p.coords.longitude;
			var currentPoint = new BMap.Point(longitude, latitude);
			var convertor = new BMap.Convertor();
			
			utils.translatePromiseLib([currentPoint], convertor).then(function(data) {
				
				/**
				 * restful api
				 * */
				
				if (data.status == 0) {
				
					$$.post(hosturl + "/api/position", {
						accessToken: localStorage.accessToken,
						latitude: data.points[0].lat,
						longitude: data.points[0].lng
					}, function(data) {
					});
				}
				
			}).catch(function() {
				
			});


		}, function(e) { //错误信息
			var aa = e.code + "\n" + e.message;
			myApp.alert(aa);
		});
	} else {
		myApp.alert("error");
	}

}


/**
 * action列表里面 buttom onClick无法传递参数
 * 所以使用这个函数需要 绑定this  this表示打开的目标对象
 * */

function selectAutoSendPositionInterval() {
	
	myApp.closeModal();
	var target = this;
    var buttons = [
        {
            text: '暂停定位',
            onClick: function() {
            	stopSendPosition();
            }
        },
        {
            text: '5 s',
            onClick: function() {
            	autoSendPosition(5 *  1000);
            }
        },
//      {
//          text: '10 s',
//          onClick: function() {
//          	autoSendPosition(5 * 1000);
//          }
//      },
//      {
//      	text: '2 days',
//      	onClick: function() {
//          	autoSendPosition(2 * 24 * 12 * 3600 * 1000);
//          }
//      	
//      },
//      { 
//      	text: '1 weeks', 
//      	onClick: function() {
//          	autoSendPosition(7 * 24 * 12 * 3600 * 1000);
//          }
//      },
        {
        	text: 'cancel'
        }
        
    ];
    myApp.actions(target, buttons);
}




/**
 * action列表里面 buttom onClick无法传递参数
 * 所以使用这个函数需要 绑定this  this表示打开的目标对象
 * */

function selectShowPathByTime() {
	
	myApp.closeModal();
	var target = this;
    var buttons = [
        {
            text: '1小时内',
            onClick: function() {
            	showRouteByParams({'limitTime': '1h'});
            }
        },
        {
            text: '3小时内',
            onClick: function() {
            	showRouteByParams({'limitTime': '3h'});
            }
        },
        {
            text: '12小时内',
            onClick: function() {
            	showRouteByParams({'limitTime': '12h'});
            }
        },
        {
        	text: '1天内',
        	onClick: function() {
            	showRouteByParams({'limitTime': '1d'});
            }
        	
        },
        { 
        	text: '一个星期内', 
        	onClick: function() {
            	showRouteByParams({'limitTime': '1w'});
            }
        },
        
        { 
        	text: '全部', 
        	onClick: function() {
            	showRouteByParams({});
            }
        },
        
        {
        	text: 'cancel'
        }
        
    ];
    myApp.actions(target, buttons);
}


/**
 * 暂停定位
 * */

function stopSendPosition() {
	window.clearInterval(parseInt(localStorage.intervalID));
	$$('#floatbutton').removeClass('backgroundRed');
}


/**
 * 检测网络---其他需要网络才能执行的函数 直接把当成这个的回调参数即可  非常方便的一种实践
 * */

function detectionNetWork(callback) {
	
		$$.ajax({
		url: hosturl + "/api/position",
	    type: "GET",
	    data: {accessToken: "####"},
	    success: function(serverData, textStatus ) {            
            if (callback != null) {
            	callback();
            }
	    },
	    error: function(xhr, textStatus, errorThrown){    	
	    	// We have received response and can hide activity indicator	
			myApp.alert('网络有问题');

	    }
	});
}






/**
 * 自动发送定位
 * 由于可能存在重复设置 所以需要设置一个自动发送定位的全局变量 用来记录自动定位的id
 * 重新设置的时候 需要清除
 * */

function autoSendPosition(interval) {
	
	//先清除用来的intervalId
	stopSendPosition();
//	window.clearInterval(parseInt(localStorage.intervalID));

	detectionNetWork(function() {
		var intervalID = window.setInterval(function() {
			sendPositionToServer();
			
			//提示正在定位
			$$('#floatbutton').toggleClass('backgroundRed');
		}, interval);
		localStorage.intervalID = intervalID;
		}
	);
	
}

/**
 * 显示走过的轨迹 旧版
 * */

function showRoute() {
	
	myApp.showIndicator();
	
	$$.ajax({
		url: hosturl + "/api/position",
	    type: "GET",
	    data: {accessToken: localStorage.accessToken},
	    success: function(serverData, textStatus ) {
	    	
	   
			serverData = JSON.parse(serverData);
			if (serverData.errno > 0) {
				myApp.alert('请重新登录');
				myApp.hideIndicator();
				return;
			}
			
			
			if (serverData.data.length == 0) {
				myApp.alert('您还没定位数据');
				myApp.hideIndicator();
				return;
			}
			
			
            var bm = new BMap.Map("allmap");
            var points = serverData.data.map(function(element) {
                return new BMap.Point(element.longitude, element.latitude);
            });
	
			
            //选中间点为显示
            var centerPosition = points[parseInt((points.length - 1) / 2)];
            //console.log(centerPosition);
            bm.centerAndZoom(new BMap.Point(centerPosition.lng, centerPosition.lat), 16);
            var controlOpts = {anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_SMALL};
			bm.addControl(new BMap.NavigationControl(controlOpts));
            /**
             * 渲染地图---数据都是转化好的 直接渲染即可
             * */
            
    	    var curve = new BMapLib.CurveLine(points, {strokeColor:"red", strokeWeight:3, strokeOpacity:0.5});
        	bm.addOverlay(curve); //添加到地图中
        	bm.setCenter(points[points.length - 1])
            
            
//          utils.renderBaiduMap(points, bm, function() {
//          	myApp.hideIndicator();
//          });
//          
            //如果上面发生错误 2s自动关闭
            setTimeout(function() {
            	myApp.hideIndicator();
            	console.log('here');
            }, 2000);
            
            
	    },
	    error: function(xhr, textStatus, errorThrown){    	
	    	// We have received response and can hide activity indicator
	    	myApp.hideIndicator();		
			myApp.alert('网络有问题');

	    }
	});

}



/**
 * 显示走过的轨迹 v2 根据参数
 * 目前的参数为 {limitTime: "1h", "3h", "12h", "1d", "1w"}
 * */

function showRouteByParams(params) {
	
	myApp.showIndicator();
	
	//添加权限
	if (params == null) params = {}
	params.accessToken = localStorage.accessToken
	
	$$.ajax({
		url: hosturl + "/api/position",
	    type: "GET",
	    data: params,
	    success: function(serverData, textStatus ) {
	    	
	    	//console.log(serverData);
			serverData = JSON.parse(serverData);
			if (serverData.errno > 0) {
				myApp.alert('请重新登录');
				myApp.hideIndicator();
				return;
			}
			
			if (serverData.data.length == 0) {
				myApp.alert('您还没定位数据');
				myApp.hideIndicator();
				return;
			}
			
			
            var bm = new BMap.Map("allmap");
            var points = serverData.data.map(function(element) {
                return new BMap.Point(element.longitude, element.latitude);
            });
	
			
            //选中间点为显示
            var centerPosition = points[parseInt((points.length - 1) / 2)];
            //console.log(centerPosition);
            bm.centerAndZoom(new BMap.Point(centerPosition.lng, centerPosition.lat), 16);
            var controlOpts = {anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_SMALL};
			bm.addControl(new BMap.NavigationControl(controlOpts));
            /**
             * 渲染地图---数据都是转化好的 直接渲染即可
             * */
            
//  	    var curve = new BMapLib.CurveLine(points, {strokeColor:"red", strokeWeight:3, strokeOpacity:0.5});
//      	bm.addOverlay(curve); //添加到地图中
        	
        	//添加点
        	
        	// i is position of data
        	function clickCallback(i) {
				
				//这些需要闭包一下 因为回调无参 而我们需要外部数据 所以闭包
				return function () {
					var tempDate = new Date(serverData.data[i].create_time);
					var year = tempDate.getFullYear();
					var month = tempDate.getMonth() + 1;
					var day = tempDate.getDate();
					var hours = tempDate.getHours();
					var minutes = tempDate.getMinutes();
					var seconds = tempDate.getSeconds();					
					myApp.alert(year + "年" + month + "月"  + day + "日" + "-" + hours + "时" + minutes + "分" + seconds + "秒");
				}

            }
        	
        	
//      	utils.addIconMarkerOverlay(bm, points[0], "img/base/icon_st.png", null , "start", null, clickCallback(0));
        	
        	//改为飞机
			var vectorFCArrow = new BMap.Marker(points[0], {
			  // 初始化方向向上的闭合箭头
			  icon: new BMap.Symbol(BMap_Symbol_SHAPE_PLANE, {
			    scale: 2,
			    strokeWeight: 1,
			    rotation: 0,//顺时针旋转30度
			    fillColor: 'gold',
			    fillOpacity: 0.8
			  })
			});
			var label = new BMap.Label("起点", {offset:new BMap.Size(10, -10)});
			vectorFCArrow.setLabel(label);
			vectorFCArrow.addEventListener('click',  clickCallback(0));
			bm.addOverlay(vectorFCArrow);
        	
        	
        	
            
            var count = 1;
                        
            
            for (var i = 0; i < points.length - 1; i++) {
            	if (i % 10 == 0) {
//          		utils.addIconMarkerOverlay(bm, points[i], null, null , "" + (i + 1));
         			var vectorStar = new BMap.Marker(points[i], {
					  // 指定Marker的icon属性为Symbol
					  
					  icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
					    scale: 1.5,//图标缩放大小
					    fillColor: "red",//填充颜色
					    fillOpacity: 0.8//填充透明度
					  })
					});
					
					var label = new BMap.Label("" + (++count), {offset:new BMap.Size(10, -10)});
					vectorStar.setLabel(label);
										
					vectorStar.addEventListener('click',  clickCallback(i));
					
					bm.addOverlay(vectorStar);
            		
            		
            	} else {
//          		utils.addIconMarkerOverlay(bm, points[i], "img/base/small.gif", [20, 20]);
            		
				   	var vectorMarker = new BMap.Marker(points[i], {
					  // 指定Marker的icon属性为Symbol
					 
					  icon: new BMap.Symbol(BMap_Symbol_SHAPE_STAR, {
					    scale: 0.5,//图标缩放大小
					    fillColor: "yellow",//填充颜色
					    fillOpacity: 0.8//填充透明度
					  })
					});
					
					bm.addOverlay(vectorMarker);

            	}
            }
			
//			if (points.length > 0) utils.addIconMarkerOverlay(bm, points[points.length - 1], "img/base/icon_en.png", null, "end", null, clickCallback(points.length - 1));
			
			//改为飞机
			if (points.length > 1) {
				var vectorBWArrow = new BMap.Marker(points[points.length - 1], {
				  // 初始化方向向上的闭合箭头
				  icon: new BMap.Symbol(BMap_Symbol_SHAPE_PLANE, {
				    scale: 2,
				    strokeWeight: 1,
				    rotation: 0,//顺时针旋转30度
				    fillColor: 'orange',
				    fillOpacity: 0.8
				  })
				});
				
				var label = new BMap.Label("终点", {offset:new BMap.Size(10, -10)});
				vectorBWArrow.setLabel(label);
				vectorBWArrow.addEventListener('click',  clickCallback(points.length - 1));
				bm.addOverlay(vectorBWArrow);
			}
        	
            
        	bm.setCenter(points[points.length - 1]);        	
        	bm.setZoom(16);
            
            
//          utils.renderBaiduMap(points, bm, function() {
//          	myApp.hideIndicator();
//          });
//          
            //如果上面发生错误 2s自动关闭
            setTimeout(function() {
            	myApp.hideIndicator();
            	
            }, 2000);
            
            
	    },
	    error: function(xhr, textStatus, errorThrown){    	
	    	// We have received response and can hide activity indicator
	    	myApp.hideIndicator();		
			myApp.alert('网络有问题');

	    }
	});

}




/**
 * 删除我的路径
 * */

function deleteAllMyPath() {
	
	myApp.showIndicator();
	
	$$.ajax({
		url: hosturl + "/api/position",
	    type: "DELETE",
	    data: {accessToken: localStorage.accessToken},
	    success: function(serverData, textStatus ) {
	    	
			myApp.hideIndicator();
			myApp.alert("已经删除完成");
            
            
	    },
	    error: function(xhr, textStatus, errorThrown){    	
	    	// We have received response and can hide activity indicator
	    	myApp.hideIndicator();		
			myApp.alert('网络有问题');

	    }
	});

}

