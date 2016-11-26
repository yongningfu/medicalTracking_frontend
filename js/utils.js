

var utils = {
	
		/**
	 * 把一个数组进行分组 每一组为n
	 * */
	splitArrayToGroup: function (array, n) {
	    if (n == undefined || n <= 0) return [];
	    var start = 0;
	    var end  = n;
	    var group = [];
	    while (true) {
	
	        //标记结束
	        if (end >= array.length) {
	            end = array.length;
	            //防止空数组
	            if (end > start) {
	                group.push(array.slice(start, end));
	            }
	            break;
	        } else {
	            group.push(array.slice(start, end));
	            start = end;
	            end = end + n;
	        }
	    }
	    return group;
	},
	
	
	/**
	 * 封装promise操作函数
	 * bmapPoints 为需要转换的点数组
	 * convertor  为百度提供的转化接口
	 * @return promise
	 * */
	
	translatePromiseLib: function (bmapPoints, convertor) {
	    var promise = new Promise(function(resolve, reject) {
	        convertor.translate(bmapPoints, 1, 5, function(data) {
	            if (data.status === 0) {
	                resolve(data);
	            } else {
	                reject(data.status);
	            }
	        });
	    });
	    return promise;
	},
	
	
	/**
	 * 得到数据后 渲染函数
	 * @param points 为具体的需要转化的bmap点  array类型
	 * @bm  BMap.Map 具体的Map对象
	 * @callback 渲染完后的操作
	 * todo 后面可以改写成热插播的模式--就是分离集体的操作
	 * */
	
	
	renderBaiduMap: function (points, bm, callback) {
		
		var that = this;
	
	    if (points.length !== 0) {
	
	        var convertor = new BMap.Convertor();
	
	        //每10个一组  生成promise数组
	        var groupArray = that.splitArrayToGroup(points, 10);
	        var promiseArray = [];
	        groupArray.forEach(function(element) {
	            promiseArray.push(that.translatePromiseLib(element, convertor));
	        });
	
	        //promise管理流程
	        Promise.all(promiseArray).then(function(data) {
	
	
	            //描绘线
	            var allTransPointArray = [];
	            data.forEach(function(element) {
	                allTransPointArray = allTransPointArray.concat(element.points);
	            });
	
	            //console.log(allTransPointArray);
	
	            var curve = new BMapLib.CurveLine(allTransPointArray, {strokeColor:"red", strokeWeight:3, strokeOpacity:0.5});
	            bm.addOverlay(curve); //添加到地图中
	            bm.setCenter(allTransPointArray[allTransPointArray.length - 1])
	            callback();
	
	        }, function (err) {
	            console.log("get data err, number", err);
	        });
	
	    } else {
	        alert("没有定位数据");
	    }
	
	},
	
	/**
	 * position图标位置数组
	 * */
	addIconMarkerOverlay: function(bm, point, imageurl, imageSize, text, position, clickcallback) {
		
		var marker = null;
		if (imageurl != null) {
			//图标
			if (imageSize == null) imageSize = [20, 20];
			var myIcon = new BMap.Icon(imageurl, new BMap.Size(imageSize[0],imageSize[1]));
			marker = new BMap.Marker(point,{icon:myIcon});  
		}
		
		if (marker == null) marker = new BMap.Marker(point);
		if (clickcallback != null) marker.addEventListener('click', clickcallback);
		
		if (text != null) {
			if (position == null) position = [10, -10];
			var label = new BMap.Label(text, {offset:new BMap.Size(position[0],position[1])});
			marker.setLabel(label);
		}
		
		bm.addOverlay(marker);
		
	}
	
}

