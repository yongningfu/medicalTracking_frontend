
myApp.onPageInit('login', function (page) {

  var pageContainer = $$(page.container);
  pageContainer.find('.list-button').on('click', function () {
  	
    var username = pageContainer.find('input[name="name"]').val();
    var password = pageContainer.find('input[name="password"]').val();
    
    /**
     * 登录使用web接口  获取accessToken保存下来
     * */
    
    myApp.showIndicator();
    
    $$.ajax({
	 		url: hosturl + "/login/dologin",
	 		type: "POST",
	 		data: {name: username, password: password},
	 		success: function(data) {
	 			
	 			myApp.hideIndicator();
	    	var jsonDataObj = JSON.parse(data);
	    	if (jsonDataObj.errno <= 0) {
	    		localStorage.isLogin = true;
	    		localStorage.accessToken = jsonDataObj.data.accessToken;
	    		
	    		mainView.router.loadPage("index.html");
	    	} else {
	    		myApp.alert("error");
	    	}
	 		},
	 		error: function() {
	 			myApp.hideIndicator();	
	 			myApp.alert('网络有问题');
	 		}
		 	
		 });
  });
});  


myApp.onPageInit('registerone', function(page) {
	
	/**
	 * reftful api 接口
	 * */
	var pageContainer = $$(page.container);
	pageContainer.find("#register").on('click', function(event) {
		
		 myApp.showIndicator();
		 var formData = myApp.formToJSON('#register_form');
		 $$.ajax({
		 		url: hosturl + "/api/user",
		 		type: "POST",
		 		data: formData,
		 		success: function(data) {
		 			
		 			myApp.hideIndicator();	
	  	 		var jsonDataObj = JSON.parse(data);
	  	 		if (jsonDataObj.errno <= 0) {
	  	 			
	  	 			myApp.alert("注册成功");
	  	 			mainView.router.loadPage("login.html");
	  	 		} else {
	  	 		    	 		  
	  	 			if (typeof (jsonDataObj.errmsg) === "object") {
	  	 				
	  	 					var errorMessage = JSON.stringify(jsonDataObj.errmsg);
								myApp.alert("注册失败: 原因: " + errorMessage);
	  	 			} else {
	  	 				myApp.alert("注册失败: 原因: " + jsonDataObj.errmsg);
	  	 			}
	  	 			
	  	 		}
		 		},
		 		error: function() {
		 			myApp.hideIndicator();	
		 			myApp.alert('网络有问题');
		 		}
		 	
		 });		
	});


});

myApp.onPageInit('forgetpasswordone', function(page) {
	
	$$('#forgetToGetVerifyButton').on('click', function(e) {
		
		var target = $$(e.target);
		utils.verifyButtonStateChange(target, 60);
		
	});
	
	$$('#forgetPhoneToGetVerify').keydown(utils.onlyNumber);
	
});



   