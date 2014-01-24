/*
 * /////////////////////////////////////////
 *      BBox Lab API - 2013 - V0.0.2
 * /////////////////////////////////////////
 *
 * Site : Julien Guézennec <jguezenn@bouyguestelecom.fr>
 * API & Box : Clément Le Breton / Arthur Saint-Genis
 *
 * /////////////////////////////////////////
 */


// PDS > Custom
// Définir par défault
// Clear log (2)
// DHCP ????
// Griser : Dev ID + exec mod + Bstore

// UNDO...

// BBox Lab
// Remonter
// Ré-initialise configuration


(function(window) { // Admin default setup

    var APP = window.APP || {}; // Main global for our APP

    // ----------- API SERVER & URL ---------------------------------------------------------------------------------- //

    APP.db          = (('console' in window) && true); // Trace debug ?

    APP.name        = 'Admin';
    APP.appId       = null; // Will be filled later
    APP.channelName = null;
    APP.channelId   = null;

    APP.ip          =   '10.0.2.2';//document.location.hostname; // 127.0.0.1  // IP localhost (avec Node local) OU // '10.1.0.138' // IP box
    APP.port        = '8080';
    APP.basepath    = 'api.bbox.lan/V0/';

    APP.nodepath    = 'http://'+APP.ip+':'+APP.port+'/';
    APP.apiUrl      = APP.nodepath + APP.basepath; // API endpoint !!!

    APP.admin       = APP.apiUrl + 'Admin/'; // Admin API
    APP.configApi   = APP.admin + 'Config';
    APP.nodeLogUrl  = APP.admin + 'Logs'; // http://127.0.0.1:8080/api.bbox.lan/V0/Admin/Logs

    APP.isTV        = true;
    /*APP.isTV      = getUrlVars()['tv'];
    if (APP.isTV || APP.isTV === '0') $.remember({name:'isTv', value:APP.isTV});
    APP.isTV        = $.remember({name: 'isTv'});*/

    APP.docUrl      = 'http://www.bytel.tv/OpenLabApi/'; // DOCUMENTATION // http://openbbox.flex.bouyguesbox.fr/

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        apiReq = null;

    // ----------- JS Tools ---------------------------------------------------------------------------------- //

    var parseApiDefault = function(config) { // Inject current settings in default CMD
        if (APP.db) console.log('parseApiDefault(config)', config);

        var newConfig = $.extend(true, {}, config); // Clone default config
        $.each(newConfig, function(key, value) {
            if (typeof(value) === 'string')
                newConfig[key] =   value.replace(/#appName#/g,     APP.name)
                                        .replace(/#appId#/g,       APP.appId)
                                        .replace(/#channelName#/g, APP.channelName)
                                        .replace(/#channelId#/g,   APP.channelId);
            else newConfig[key] = parseApiDefault(value);
        });
        return newConfig;
    };

    // ----------- API AJAX DEFAULTS CALLBACKS ---------------------------------------------------------------------------------- //

    APP.apiError = function(XMLHttpRequest, textStatus, errorThrown) { // Default Error
        if (APP.db) console.log('APP.apiError()', XMLHttpRequest, textStatus, errorThrown);

        var message  = 'Erreur inconnue ? '+textStatus,
            respText = '';

        if (!XMLHttpRequest) return message;

        if (XMLHttpRequest.status) { // HTTP STATUS CODE ?
            switch(XMLHttpRequest.status) {
                case 404 : message = 'Error while saving : Not a valid URL'; break;
                case 400 : message = 'Error while saving : Check your parameters'; break;
                case 500 : message = 'Error while saving : Unknow problem with API'; break;
            }
            if (message) message += ' (#'+XMLHttpRequest.status+')';
        }
        if (XMLHttpRequest.responseText) { // RESPONSE ??
            respText = XMLHttpRequest.responseText;
            if (typeof(respText) === 'string' && respText.substr(0, 1) === '{') respText = $.parseJSON(respText);
        }
        if (!textStatus && XMLHttpRequest.statusText) {
            respText += XMLHttpRequest.statusText;
        }

        if (respText && typeof(respText) === 'string') message += ' '+respText;
        else if (respText && typeof(respText) === 'object') {
            if (respText.message) message += ' '+respText.message;
            if (respText.code)    message += ' (API #'+respText.code+')';
        }

        console.log('APP.apiError()', message);
    };

    APP.onSuccess = function(data, textStatus, jqXHR) { // Default Success
        if (APP.db) console.log('APP.onSuccess()', data);

        apiReq = null;
        var ok = false;
        switch(jqXHR.status) {
            case 204 : ok = true; break; // OK (with content)
            case 200 : ok = true; break; // OK (no content)
        }

        if (APP.db) console.log('APP.onSuccess()', ok);
    };

    // ----------- API ABSTRACT ---------------------------------------------------------------------------------- //

    /*
        // Exemple pour usage direct en console

        $.ajax({
            url        : 'http://127.0.0.1:8080/api.bbox.lan/V0/UserInterface/RemoteController/Key',
            method     : 'put',
            cache      : false,
            crossDomain: true,
            contentType: 'application/json',
            accept     : 'application/json',
            dataType   : 'json',
            processData: false,
            data       : '{"key":{"keyName":"P+","keyType":"keypressed"}}',
            success    : function(data, textStatus, jqXHR) { // Default Success
                console.log('apiSuccess', data);
            },
            error      : function(XMLHttpRequest, textStatus, errorThrown) { // Default Error
                console.log('apiError', XMLHttpRequest);
            }
        });
    */

    APP.defaultAjax = { // Default API params
        method     : 'get',
        values     : null,
        contentType: 'application/json',
        dataType   : 'json',
        success    : APP.onSuccess,
        error      : APP.apiError
    };

    APP.api = function(path, options) {
        if (APP.db) console.log('APP.api(path, options)', path, options);

        if (!path) {
            console.log('APP.api ERROR : Missing REST path parameter');
            return;
        }

        options = $.extend({}, APP.defaultAjax, options); // Merge custom with default

        if (options.values && typeof(options.values) == 'object')
            options.values = JSON.stringify(options.values);

        // if (apiReq) apiReq.abort()
        // $.support.cors = true; // Access-Control-Allow-Origin

        $.ajax({
            url        : APP.apiUrl + path, // 'http://127.0.0.1:8080/api.bbox.lan/V0/' + 'UserInterface/RemoteController/Key',
            method     : options.method,
            cache      : false,
            crossDomain: true,
            contentType: options.contentType,
            dataType   : options.dataType,
            //processData: false, // To check with Firefox ? set it to true ?
            data       : options.values,
            success    : options.success,
            error      : options.error
        });
    };

    /*
        // Exemple 1 : Command to clear the logs

        APP.api('Admin/LogsClear');

        // Exemple 2 : Command to send key

        APP.api('UserInterface/RemoteController/Key', {
            method: 'put',
            values: '{"key":{"keyName":"P+","keyType":"keypressed"}}'
        });

        // Exemple 3 : Command to send text

        APP.api('UserInterface/RemoteController/Text', {
            method: 'post',
            values: '{"text":"Some user text"}'
        });

        // Exemple 3 bis : values == string or object

        APP.api('UserInterface/RemoteController/Text', {
            method: 'post',
            values: {"text":"Some user text"}
        });
    */

    // ----------- API SHORTCUTS ---------------------------------------------------------------------------------- //

    APP.get = function(path, options) {
        options = $.extend({}, APP.defaultAjax, {method: 'get'}, options); // Merge custom with default
        APP.api(path, options);
    };
    APP.post = function(path, options) {
        options = $.extend({}, APP.defaultAjax, {method: 'post'}, options); // Merge custom with default
        APP.api(path, options);
    };
    APP.put = function(path, options) {
        options = $.extend({}, APP.defaultAjax, {method: 'put'}, options); // Merge custom with default
        APP.api(path, options);
    };
    APP.delete = function(path, options) {
        options = $.extend({}, APP.defaultAjax, {method: 'delete'}, options); // Merge custom with default
        APP.api(path, options);
    };

    /*
        // Exemple 1 :

        APP.put(                                            // API method
            'UserInterface/RemoteController/Key',           // API path
            {
                values: "{key:{'keyName':'HOME', keyType:'keypressed'}}", // API send data
                success: function(data){                                  // API receive data
                    console.log('Success : ', data);
                },
                error: function(error){                                   // API error message
                    console.log('Error : ', error);
                }
            }
        );

        // Exemple 2 :

        APP.post(                                      // API method
            'UserInterface/RemoteController/Text',     // API path
            {
                values: '{"text":"Some user text"}'    // API send data
            }
        );
    */

    // ----------- API COMMANDS ---------------------------------------------------------------------------------- //

    // Will stock all the API requests commands
    APP.apiCmdConfig = {

        /* ------------- APPLICATIONS --------------- */

        registerApplication: {
            url: 'Applications/Register',
            method: 'POST',
            contentType: 'application/json',
            accept: 'application/json',
            values: {appName:'#appName#'} // Return AppId
        },
        listApplication: {
            url: 'Applications',
            method: 'GET',
            contentType: 'application/json',
            accept: 'application/json' // Return AppId
        },
        stopApplication: {
            url: 'Applications/Run/#appId#',
            method: 'DELETE',
            contentType: 'application/json',
            accept: 'application/json'
        },
        openApplication: {
            url: 'Applications/#appName#',
            method: 'POST',
            contentType: 'application/json',
            accept: 'application/json'
        },

        /* ------------- NOTIFS --------------- */

        sendNotif: {
            url: 'Notification/#channelId#',
            method: 'POST',
            contentType: 'application/json',
            accept: 'application/json',
            values: {appID:'#appId#','event':'#CUSTOMVALUE#'}
        },
        unsubscribe: {
            url: 'Notification/#channelId#',
            method: 'DELETE',
            contentType: 'application/json',
            accept: 'application/json',
            values: {resources:[{resourceID:'#channelName#'}]}
        },
        getOpenedChannel: {
            url: 'Notification?appID=#appId#',
            method: 'GET',
            contentType: 'application/json',
            accept: 'application/json'
        },
        getAllOpenedChannel: {
            url: 'Notification',
            method: 'GET',
            contentType: 'application/json',
            accept: 'application/json'
        },
        openChannel: {
            url: 'Notification',
            method: 'POST',
            contentType: 'application/json',
            accept: 'application/json',
            values: {appID:'#appId#', resources:[{resourceID:'#channelName#'}]}
        },
        listenNotif: {
            url: 'Notification/#channelId#/',
            method: 'GET',
            contentType: 'application/json',
            accept: 'application/json',
            values: {appID:'#appId#', resources:[{resourceID:'#channelName#'}]}
        }
    };

    APP.cmd =  function(apiCmd, options) {
        if (APP.db) console.log('APP.cmd(apiCmd, success, error)', apiCmd);

        apiCmd = APP.apiCmdConfig[apiCmd]; // get default config
        apiCmd = parseApiDefault(apiCmd);  // inject AppName, APpId, etc... in default config

        options = $.extend({}, APP.defaultAjax, apiCmd, options); // Merge custom with default

        console.log('-------------------------------------------');
        console.log(options.url, options);

        APP.api(options.url, options);
    };

    /*
        // Exemple 1 :

        APP.cmd('listApplication', {
            success: function(data) {
                console.log('listApplication', data);
            }
        });

        // Exemple 2 : "parseApiDefault()" will use 4 globals vars :
        //>>> APP.name, APP.appId, APP.channelName, APP.channelId

        // Ex :
        APP.name = 'Google';
        APP.cmd('openApplication'); // Will open Google on the TV

        // Exemple 2 bis

        APP.cmd('openApplication', { // Will open Google on the TV
            url: 'Applications/Google',
        });

        // Exemple 3 : Unit testing All ;)

        // predefine some values...
        APP.name        = 'Admin';
        APP.appId       = 'MyTest885585';
        APP.channelName = 'RemoteInterface';
        APP.channelId   = 'MyTest885585-885585';

        // Execute all available API commands
        $.each(APP.apiCmdConfig, function(i, e) {
            APP.cmd(i, {
                success: function(data) {
                    console.log(i, data);
                }
            });
        });

    */

    // ----------- API REMOTE SHORTCUT ---------------------------------------------------------------------------------- //

    APP.remote = function(cmd, value, keyState) {

        if (APP.db) console.log('APP.remote(value, cmd)', value, cmd);

        keyState = keyState || 'keypressed'; // keydown (repeat) || keyup (stop keydown) ||  keypressed (down+up)

        switch(cmd) {

            case 'Text':
                APP.post('UserInterface/RemoteController/Text', {
                    values: '{"text":"'+value+'"}'
                });
                break;

            case 'Key':
                /*
                    Remote keys : 'TV/DEC', 'VOD', 'M@TV' , 'GUIDE', 'LIST', 'EXIT', 'AV', 'SLEEP', 'HOME', 'V+', 'MUTE', 'V-', 'P-', 'P+', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'OK', 'BACK', 'ZOOM', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'PLAY', 'STOP', 'FF', 'RW', 'REC', 'INFO'
                */
                keyState = keyState || 'keypressed'; // keydown (repeat) || keyup (stop keydown) ||  keypressed (down+up)

                APP.put('UserInterface/RemoteController/Key', {
                    values: '{"key":{"keyName": "'+value+'","keyType": "'+keyState+'"}}'
                });
                break;

            default:
                alert('APP.remote() : You must provide some parameters');
        }
    };

    /*
    // Exemples :

        // Emuler une touche de la télécommande
        $('.buttons').on('click', function(event) {
            // console.log('APP.remote()', $(this).data('cmd'));
            event.preventDefault();
            APP.remote('Key', $(this).data('cmd'));
        });

        // Envoyer un text dans un input text
        $('#sendText').on('click', function(event) {
            // console.log('APP.remote()', $userText.val());
            event.preventDefault();
            APP.remote('Text', $userText.val());
            $userText.val('');
        });

        // Envoyer des events keydown pendant 2 secondes
        APP.remote('Key', 'left', 'keydown');
        setTimeout(function() {
            APP.remote('Key', 'left', 'keyup'); // Stop keydown event
        }, 2000);
    */



    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //

    /*
                                                    TODO !!!
    */

    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //
    // ****************************************************************************************************************************** //


    // ----------- API APP FOR SOCKET ---------------------------------------------------------------------------------- //

    if (window.MozWebSocket) window.WebSocket = window.MozWebSocket;

    var separator        = '|',
        websockUrl       = 'ws://' + APP.ip + ':9090/',
        listMsg          = [],
        listClient       = {},
        clavierChannelId = null,
        socketOk         = false,
        clavierAppId     = null,
        socket           = null;

    APP.waitSocket = function() {
        if (socketOk) {
            socket.send('send|' + clavierChannelId + '|InputRequest');
        } else {
            setTimeout(waitSocket, 200);
        }
    };

    APP.initSocket = function() {

        socket = new WebSocket(websockUrl, 'open-stb');

        socket.onopen = function(evt) {
            console.log('Connection open ...');
            socket.send('init' + separator + 'ChatApp');
            socket.send('subscribe' + separator + 'ChatChannelServer');
            socket.send('subscribe' + separator + 'ChatChannel');
            socketOk = true;
        };

        socket.onmessage = function(evt) {
            console.log(evt.data);
            var packet_part = evt.data.split('|');
            var sender = packet_part[0];
            var body = packet_part[1];
            console.log('sender: ' + sender + ' body: ' + body);
            if (body.indexOf('/msg@') === 0) {
                var msg = body.slice(5);
                console.log('new msg from ' + listClient[sender] + ' ' + msg);
                listMsg.push(msg);
                $('res').html($('res').html() + listClient[sender] + ' : ' + msg + '<br/>');
                for (var key in listClient) {
                    socket.send('send' + separator + key + separator + listClient[sender] + ' : ' + msg);
                }
            }
            if (body.indexOf('/login@') === 0) {
                var login = body.slice(7);
                console.log('new user ' + sender + ' as ' + login);
                listClient[sender] = login;
            }
            //console.log( 'Received Message: ' + evt.data);
        };

        socket.onclose = function(evt) {
            console.log('Connection closed.');
        };

        var doClick = function() {
            if (!$('msg').val()) return;

            $('res').innerHTML = $('res').innerHTML + 'WebApp : ' + $('msg').value + '<br/>';
            socket.send('send' + separator + 'ChatChannel' + separator + 'WebApp : ' + $('msg').value);
            $('msg').value = '';
        };

        var callDoClick = function(event) {
            if (event.keyCode == 13) doClick();
        };

        $(document).on('keydown', callDoClick);
        $('button_send').on('onclick', doClick);

        $('#msg').one('focus', function() {
            $.ajax({
                url: 'http://' + APP.ip + ':8080/Application?appName=ClavierVirtuel',
                success: function(data) {
                    if (data.appIDs && data.appIDs.length > 0) {
                        clavierAppId = data.appIDs[0];
                    } else {
                        $('res').html('Le Clavier Virtuel n\'est pas démarré.');
                        return;
                    }

                    $.ajax({
                        url: 'http://' + APP.ip + ':8080/Notification?appId=' + clavierAppId,
                        success: function(data2) {
                            console.log('channel clavier ' + data2);
                            clavierChannelId = data2;
                            waitSocket();

                        }
                    });
                }
            });
        });

        $('#msg')
            .on('focus', function() {
                if (clavierChannelId) waitSocket();
            })
            .focus();
    };

    //$(window).onload(initSocket);

    window.APP = APP; // Global APP obj

})(window);
