"use strict";

(function(global){

	var _webSocket = undefined;
	var _verification = undefined;
	var _url = null;
	var _listener = {};
	var _eventListener = {};
	var _isAlive = false;
	var _isDestroyed = true;

	var createConnection = function()
	{
		try
    {
      _webSocket = undefined;
      _webSocket = new WebSocket(_url);
      _isDestroyed = false;
      _webSocket.onmessage = function(message)
      {
        onmessage(message);
      };
      _webSocket.onopen = function()
      {
        onopen();
      };
      _webSocket.onclose = function(mesage)
      {
        onclose()
      };
      _webSocket.onerror = function ()
      {
        onerror();
      }
    }
    catch (error)
    {
      _webSocket = undefined;
      _isDestroyed = true;
      _listener["isAlive"] = false;
    }
	};

	var onopen = function()
	{
		_listener["isAlive"] = true;
		if(undefined !== _verification && "undefined" != typeof _verification && null != _verification)
    {
      sendMessage("SystemTokenVerify" , _verification);
    }
		if(_eventListener["onopen"])
		{
			for(var i = 0 ; i < _eventListener["onopen"].length ; ++i)
			{
				try
				{
					_eventListener["onopen"][i](copyData(data));
				}
				catch (error)
				{
					_eventListener["onopen"][i]();
				}
			}
		}
	};

	var onclose = function()
	{
		_listener["isAlive"] = false;
	};

	var onerror = function()
	{
		_listener["isAlive"] = false;
	};

	var onmessage = function(_message)
	{
		var message = JSON.parse(_message.data);
		var data = null;
		try
		{
			data = JSON.parse(message.content);
		}
		catch (error)
		{
			data = message.content;
		}
		if(_eventListener[message.messageType])
		{
			for(var i = 0 ; i < _eventListener[message.messageType].length ; ++i)
			{
				try
				{
					_eventListener[message.messageType][i](copyData(data));
				}
				catch (error)
				{
					_eventListener[message.messageType][i]();
				}
			}
		}
	};

	var sendMessage = function(_messageType , _content)
  {
    if(undefined !== _webSocket && "undefined" != typeof _webSocket && null != _webSocket)
    {
      _webSocket.send(JSON.stringify({
        messageType : _messageType ,
        content : JSON.stringify(_content)
      }))
    }
  };

	var copyData = function(_data)
	{
		var data = null;
		try
		{
			JSON.parse(_data);
			data = {};
			for(var key in _data)
			{
				Object.defineProperty(data , key , {
					enumerable : true ,
					configurable : true ,
					writable : true ,
					value : _data[key]
				})
			}
		}
		catch (error)
		{
			data = _data;
		}
		return data;
	};

	function MySocket()
	{
	  const self = this;
		Object.defineProperty(_listener , "isAlive" , {
			enumerable : true ,
			configurable : true ,
			get : function()
			{
				return _isAlive;
			} ,
			set : function(value)
			{
				if("boolean" != typeof value)
				{
					throw new Error("isAlive must be Boolean");
				}
				_isAlive = value;
				if(!value)
				{
					_webSocket = undefined;
					if(!_isDestroyed)
					{
						createConnection();
					}
				}
			}
		});
		Object.defineProperty(self , "verification" , {
		  enumerable : true ,
      configurable : true ,
      get : function()
      {
        return _verification;
      } ,
      set : function(value)
      {
        _verification = value;
        if(!_isDestroyed)
        {
          if(_listener["isAlive"])
          {
            sendMessage("SystemTokenVerify" , _verification);
          }
        }
      }
    })
	}

	MySocket.prototype.open = function(url)
	{
		_url = url;
		if(!_listener["isAlive"])
    {
      createConnection();
    }
	};

	MySocket.prototype.close = function()
	{
		undefined == _webSocket ? undefined : _webSocket.close();
		_isDestroyed = true;
	};

	MySocket.prototype.isOpen = function()
  {
    if(!_listener["isAlive"] || undefined === _webSocket || "undefined" == typeof _webSocket || _isDestroyed)
    {
      _isDestroyed = true;
      _listener["isAlive"] = false;
      if(_webSocket)
      {
        _webSocket.close();
      }
      _webSocket = undefined;
      return false;
    }
    else
    {
      return true;
    }
  };

	MySocket.prototype.send = function(messageType , content)
  {
    sendMessage(messageType , content);
  };

	MySocket.prototype.addEventListener = function(event , fn)
	{
		if(!(fn instanceof Function))
		{
			throw new Error("fn must be function");
		}
		if(!_eventListener["event"])
		{
			_eventListener.event = [];
			_eventListener.event.push(fn)
		}
		else
		{
			_eventListener.event.push(fn);
		}
	};

	MySocket.prototype.removeEventListener = function(event , fn)
	{
		if(!(fn instanceof Function))
		{
			throw new Error("fn must be function");
		}
		if(_eventListener["event"])
		{
			if(-1 != _eventListener.event.indexOf(fn))
			{
				_eventListener.event.splice(_eventListener.event.indexOf(fn) , 1);
			}
		}
	};

	global.MySocket = global.MySocket || MySocket;
})(window);
