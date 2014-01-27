var restify = require('restify');
var easyxml = require('easyxml');
var parser = require('xml2json');
var log4js = require('log4js');
var fs = require('fs');
var net = require('net');
var http = require('http');
//var Sync = require('sync');
/*
###################################################

BEGIN : CONFIG

##################################################
*/


// also define in constants.h in Qt UI
var namedSocket = "/tmp/test.sock";
var serverPort = 8080;
var logFile = "node.log";
var client = null;



/* config log4js*/
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(logFile), 'main');
var logger = log4js.getLogger('main');


/* config xml2json */
var options_xml2json = {
    object: true,
    reversible: false,
    coerce: true,
    sanitize: true,
    trim: true,
    arrayNotation: false
};

/* config easyxml */
easyxml.configure({
  singularizeChildren: true,
  underscoreAttributes: true,
  rootElement: 'response',
  dateFormat: 'ISO',
  indent: 2,
  manifest: true
});

/* config restify */
var server = restify.createServer({
  formatters: {
    'text/xml': function formatFoo(req, res, body) {
	  var xml = easyxml.render(body);
      return xml;
    }
  }
});

/* config request couchdb */
var options_couchdb_get_epg = {
    host: "192.168.1.72",
    path: '/epg_cache/InformationBouquet',
    port: '5984',
    method: 'GET'
}

var options_couchdb_get_pds = {
    host: "192.168.1.72",
    path: '/epg_cache/PDS',
    port: '5984',
    method: 'GET'
}


server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());

/*
###################################################

END : CONFIG

##################################################
*/



/*
###################################################################

BEGIN : URL SERVED

##################################################################
*/

//url to send key to Qt UI
server.get('/EPGInterface/EPGController', couchdb_get_epg);
server.get('/EPGInterface/PDSController', couchdb_get_pds);

//url to display log file in a browser
server.get('/node.log',show_log);

/*
##################################################################

END : URL SERVED

##################################################################
*/

function show_log(req,res,next){
  res.setHeader('content-type', 'text/plain');
  var logFile = fs.readFileSync('node.log');
  logger.debug('Access to log from :'+req.connection.remoteAddress);
  res.send(logFile.toString());
}

function couchdb_get_epg(req_epg, res_epg, next_epg) {
	var req_get = http.request(options_couchdb_get_epg, function (res_get) {
		var data = '';
		res_get.on('data', function (chunk) {
			data += chunk;
		});
		res_get.on('end', function () {
			logger.debug('couch_get_epg : EPG source récupéré');
			var json_epg = JSON.parse(data);
			building_send_epg(req_epg, res_epg, next_epg, json_epg);
		});
	});
	req_get.on('error', function (e) {
		logger.error("erreur " + e.message);
	});
	req_get.end();
}
  
  function building_send_epg(req_epg, res_epg, next_epg, epg_json) {
	try {
		var body = '';
		var info_send = ''
		var requestBodyIsJson = req_epg.is('application/json');
		var requestBodyIsXml = req_epg.is('text/xml');
		var responseBodyIsJson = req_epg.accepts('application/json');
		var responseBodyIsXml = req_epg.accepts('text/xml');
		for(var i=0;i<epg_json.ListeChaines.Chaine.length;i++) {
		if(epg_json.ListeChaines.Chaine[i].id == req_epg.query.chaine) {  
			body = epg_json.ListeChaines.Chaine[i];
		}
	}
	if(req_epg.query.start) {
		var startTime = new Date(req_epg.query.start);
		for(var i=0;i<body.ListeProgrammes.Programme.length;i++) {
			if(startTime > new Date(body.ListeProgrammes.Programme[i].debut) && startTime<new Date(body.ListeProgrammes.Programme[i].fin)) {
				info_send = body.ListeProgrammes.Programme[i];
			}
		}
	} else {
		info_send = JSON.parse('{"id":"' + body.id + '","nom":"' + body.nom + '","logo":"' + body.logo + '"}');
	}
	if(!responseBodyIsXml || (responseBodyIsJson && responseBodyIsXml)){
		logger.debug("response body will be json");
		res_epg.setHeader('content-type', 'application/json');
	}else{
		logger.debug("response body will be xml");
	}
	logger.debug(info_send);
	res_epg.send(200,info_send);
	logger.debug("sended");
	return next_epg();
	}
	catch(err) {
		logger.error("error on remote API :"+err);
		var obj = build_error(501,err.toString());
		res_epg.send(500,obj);
		return next_epg();
	}
}

function couchdb_get_pds(req_pds, res_pds, next_pds) {
	var req_get = http.request(options_couchdb_get_pds, function (res_get) {
		var data = '';
		res_get.on('data', function (chunk) {
			data += chunk;
		});
		res_get.on('end', function () {
			logger.debug('couch_get_pds : PDS source récupéré');
			var json_pds = JSON.parse(data);
			building_send_pds(req_pds, res_pds, next_pds, json_pds);
		});
	});
	req_get.on('error', function (e) {
		logger.error("erreur " + e.message);
	});
	req_get.end();
}

  function building_send_pds(req_pds, res_pds, next_pds, pds_json) {
	try {
		var body = '';
		var programme = ''
		var requestBodyIsJson = req_pds.is('application/json');
		var requestBodyIsXml = req_pds.is('text/xml');
		var responseBodyIsJson = req_pds.accepts('application/json');
		var responseBodyIsXml = req_pds.accepts('text/xml');

		if(req_pds.query.chaine) {
			var info_send = pds_json.Plan.channels.channel;
		}
		if(!responseBodyIsXml || (responseBodyIsJson && responseBodyIsXml)){
			logger.debug("response body will be json");
			res_pds.setHeader('content-type', 'application/json');
		}else{
			logger.debug("response body will be xml");
		}
		logger.debug(info_send);
		res_pds.send(200,info_send);
		logger.debug("sended");
		return next_pds();
	}
	catch(err) {
		logger.error("error on remote API :"+err);
		var obj = build_error(501,err.toString());
		res_pds.send(500,obj);
		return next_pds();
	}
}

function build_error(code,message){
 var obj = new Object();
 obj.error = new Object();
 obj.error.errorCode = code;
 obj.error.errorMessage = message.toString();
 return obj;
}

server.listen(serverPort, function() {
  logger.info('%s listening at %s', server.name, server.url);
});


