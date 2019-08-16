"use strict";

(function(global)
{
	var _dataId = 1;
	var _innerFrame = new Frame();
	var _el = undefined;
	var _app = undefined;
	var _debug = true;

	function Frame()
	{
		this.dataObj = {
			"true" : {
				id : ++_dataId ,
				data : "true" ,
				nodeBound : []
			} ,
			"false" : {
				id : ++_dataId ,
				data : "false" ,
				nodeBound : []
			}
		};
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
		this.dataObj[key] = this.dataObj[key] ||
			{
				id : _dataId++ ,
				data : undefined ,
				nodeBound : []
			};
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

	Frame.prototype.notify = function(key)
	{
		if(!this.dataObj[key])
		{
			throw new Error(key + " id not defined");
			return;
		}
		for(var i = 0 ; i < this.dataObj[key].nodeBound.length ; ++i)
		{
			if(attributeOptions[this.dataObj[key].nodeBound[i].attribute])
			{
				attributeOptions[this.dataObj[key].nodeBound[i].attribute](this.dataObj[key].nodeBound[i].node , this.dataObj[key].data);
			}
			else
			{
				nodeOptions.setAttribute(this.dataObj[key].nodeBound[i].node , this.dataObj[key].nodeBound[i].attribute , this.dataObj[key].data);
			}
		}
	};

	var dataDefine = function(data , key , value)
	{
		_innerFrame.subscript(key);
		_innerFrame.publish(key , value);
		Object.defineProperty(data , key , {
			enumerable : true ,
			configurable : true ,
			set : function(value)
			{
				coutLog(key + "调用set");
				_innerFrame.publish(key , value);
				_innerFrame.notify(key);
			} ,
			get : function()
			{
				coutLog(key + "调用get");
				return _innerFrame.get(key);
			}
		})
	};

	var coutError = function(msg)
	{
		if(_debug)
		{
			console.error(msg);
		}
	};

	var coutWarn = function(msg)
	{
		if(_debug)
		{
			console.warn(msg);
		}
	};

	var coutLog = function(msg)
	{
		if(_debug)
		{
			console.log(msg);
		}
	};

	var isNull = function(obj)
	{
		return null === obj || "null" == typeof obj;
	};

	var isUndefined = function(obj)
	{
		return undefined === obj || "undefined" === typeof obj;
	};

	var isObject = function(obj)
	{
		return 	null !== obj && "object" === typeof obj;
	};

	var isBaseType = function(obj)
	{
		return "string" === typeof obj ||
				"number" === typeof obj ||
				"boolean" === typeof obj;
	};

	var isElement = function(obj)
	{
		return isObject(obj) && obj instanceof HTMLElement;
	};

	var getDOM = function(el)
	{
		var selectedDom = document.querySelector(el);
		if(!isElement(selectedDom))
		{
			coutWarn("the parameter of el must be string of id or className," +
				"be sure that the el string you provide contains char '#' or '.'" +
				"System default create an empty div element for you;");
			return document.createElement("div");
		}
		return selectedDom;
	};

	var appendChild = function(node , child)
	{
		node.appendChild(child);
	};

	var insertBefore = function(newObj , target)
	{
		var parent = target.parentElement;
		parent.insertBefore(newObj , target);
	};

	var insertAfter = function(newObj , target)
	{
		var parent = target.parentElement;
		if(parent.lastChild === target)
		{
			parent.appendChild(newObj);
		}
		else
		{
			parent.insertBefore(newObj , target.nextSibling);
		}
	};

	var removeChild = function(node , child)
	{
		node.removeChild(child);
	};

	var hasChildren = function(node)
	{
		if(0 == node.children.length)
		{
			return false;
		}
		return true;
	};

	var getChildren = function(obj)
	{
		return obj.children;
	};

	var getParent = function(obj)
	{
		return obj.parentElement;
	};

	var getNextNode = function(obj)
	{
		return obj.nextSibling;
	};

	var getPreviousNode = function(obj)
	{
		return obj.previousSibling;
	};

	var getAttributes = function(obj)
	{
		return obj.attributes;
	};

	var getAttribute = function(obj , key)
	{
		return obj.getAttribute(key);
	};

	var setAttribute = function(obj , key , value)
	{
		obj.setAttribute(key , value);
	};

	var removeAttribute = function(obj , key)
	{
		obj.removeAttribute(key);
	};

	var setText = function(obj , value)
	{
		obj.textContent = value;
		// obj.innerText = value;
	};

	var getText = function(obj)
	{
		return obj.textContent;
	}

	var tagName = function(obj)
	{
		return obj.tagName;
	};

	var nodeOptions = {
		appendChild : appendChild ,
		insertBefore : insertBefore ,
		insertAfter : insertAfter ,
		removeChild : removeChild ,
		getChildren : getChildren ,
		getParent : getParent ,
		getNextNode : getNextNode ,
		getPreviousNode : getPreviousNode ,
		hasChildren : hasChildren ,
		getAttributes : getAttributes ,
		getAttribute : getAttribute ,
		setAttribute : setAttribute ,
		removeAttribute : removeAttribute ,
		setText : setText ,
		getText : getText ,
		tagName : tagName
	};

	var attributeOptions = {
		textContent : setText ,
	}

	var elementInit = function(obj)
	{
		var children = nodeOptions.getChildren(obj);
		for(var i = 0 ; i < children.length ; ++i)
		{
			elementInit(children[i]);
		}
		var attributes = nodeOptions.getAttributes(obj);
		for(var j = 0 ; j < attributes.length ; ++j)
		{
			if(-1 != attributes[j].nodeName.indexOf(":"))
			{
				if(!_innerFrame.dataObj[attributes[j].nodeValue])
				{
					throw new Error(attributes[j].nodeValue + " is not defined");
				}
				var key = "";
				var value = _innerFrame.dataObj[attributes[j].nodeValue].data;
				key = attributes[j].nodeName.split(":")[1];
				_innerFrame.dataObj[attributes[j].nodeValue].nodeBound.push({
					node : obj ,
					attribute : key
				});
				nodeOptions.removeAttribute(obj , attributes[j].nodeName);
				if(attributeOptions[key])
				{
					attributeOptions[key](obj , value);
				}
				else
				{
					nodeOptions.setAttribute(obj , key , value);
				}
				j = -1;
				continue;
			}
			if(0 == attributes[j].nodeName.indexOf("fk"))
			{
				if(!_innerFrame.dataObj[attributes[j].nodeValue])
				{
					throw new Error(attributes[j].nodeValue + " is not defined");
				}
				var key = "";
				var value = _innerFrame.dataObj[attributes[j].nodeValue].data;
				if("text" == attributes[j].nodeName.split("-")[1])
				{
					key = "textContent";
					_innerFrame.dataObj[attributes[j].nodeValue].nodeBound.push({
						node : obj ,
						attribute : key
					});
					nodeOptions.removeAttribute(obj , attributes[j].nodeName);
					if(attributeOptions[key])
					{
						attributeOptions[key](obj , value);
					}
					else
					{
						nodeOptions.setAttribute(obj , key , value);
					}
					j = -1;
					continue;
				}
				if("for" == attributes[j].nodeName.split("-")[1])
				{

					j = -1;
					continue;
				}
			}
		}
	};

	var initData = function(parameters)
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

	var initLifeCycle = function(parameters)
	{
		if(!parameters["el"])
		{
			throw new Error("el property must be provide to frame in obj");
		}
		_el = parameters["el"];
		_app = getDOM(_el);
		elementInit(_app);
	};

	function MyFrame(parameters)
	{
		initData.call(this , parameters);
		initLifeCycle(parameters);
	}

	global.MyFrame = MyFrame;
})(window);