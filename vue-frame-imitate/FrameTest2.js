"use strict";

(function(global)
{
	var dataId = 1;
	var innerFrame = new Frame();
	var debug = true;

	function Frame()
	{
		this.dataObj = {};
	}

	Frame.prototype.publish = function(key , value)
	{
		if(!this.dataObj[key])
		{
			throw new Error(key + " is not defined");
			return;
		}
		this.dataObj[key].data = value;
		coutLog(this.dataObj);
	};

	Frame.prototype.subscript = function(key)
	{
		this.dataObj[key] = this.dataObj[key] || {id : dataId++};
	};

	Frame.prototype.notify = function(key)
	{

	};

	Frame.prototype.get = function(key)
	{
		if(!this.dataObj[key])
		{
			throw new Error(key + " id not defined");
			return;
		}
		return this.dataObj[key].data;
	};

	var coutError = function(msg)
	{
		if(debug)
		{
			console.error(msg);
		}
	};

	var coutWarn = function(msg)
	{
		if(debug)
		{
			console.warn(msg);
		}
	};

	var coutLog = function(msg)
	{
		if(debug)
		{
			console.log(msg);
		}
	};

	var dataDefine = function(data , key , value)
	{
		innerFrame.subscript(key);
		innerFrame.publish(key , value);
		Object.defineProperty(data , key , {
			enumerable : true ,
			configurable : true ,
			set : function(value)
			{
				coutLog(key + "调用set");
				innerFrame.publish(key , value);
			} ,
			get : function()
			{
				coutLog(key + "调用get");
				return innerFrame.get(key);
			}
		})
	};

	var _initData = function(parameters)
	{
		if(!parameters["data"])
		{
			return;
		}
		for(var key in parameters["data"])
		{
			dataDefine(this , key , parameters["data"][key]);
		}
	};

	var _initLifeCircle = function(parameters)
	{

	};

	function MyFrame(parameters)
	{
		_initData.call(this , parameters);
	}

	global.MyFrame = MyFrame;
})(window);