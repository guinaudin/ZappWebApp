var parser = require('xml2json');
var log4js = require('log4js');
var fs = require('fs');
var net = require('net');
var http = require('http');

/*
###################################################

BEGIN : CONFIG

##################################################
*/

/* config log4js*/
var logFile = "node.log";
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

/* config des options pour les requests HTTP */
var options_xml_epg_get = {
host: "213.139.127.231",
path: '/ws/sti_mobile_03?type=1&id_chaine=1,2,3,4,5,6&date_debut=2013-05-29T10:00:00Z&date_fin=2013-06-03T20:00:00Z'
}

var options_couchdb_epg_put = {
host: "192.168.1.72",
path: '/epg_cache/InformationBouquet',
port: '5984',
method: 'PUT'
}

var options_couchdb_epg_delete = {
host: "192.168.1.72",
path: '/epg_cache/InformationBouquet?rev=',
port: '5984',
method: 'DELETE'
}

var options_couchdb_epg_get = {
host: "192.168.1.72",
path: '/epg_cache/InformationBouquet',
port: '5984',
method: 'GET'
}

var options_couchdb_pds_get = {
host: "192.168.1.72",
path: '/epg_cache/PDS',
port: '5984',
method: 'GET'
}

var options_couchdb_pds_put = {
host: "192.168.1.72",
path: '/epg_cache/PDS',
port: '5984',
method: 'PUT'
}

var options_couchdb_pds_delete = {
host: "192.168.1.72",
path: '/epg_cache/PDS?rev=',
port: '5984',
method: 'DELETE'
}

var options_xml_pds_get = {
host: "195.36.152.208",
path: '/pds/pds2.xml',
method: 'GET'
}


/*
###################################################

END : CONFIG

##################################################
*/

/*function initialisation() {
	logger.info("initilisation: debut du script de caching");
	var date_debut=new Date().toString("yyyy-MM-ddThh:mm:ssZ");
	var date_fin= date_debut.
	
	//recuperation des chaines de l'EPG
	
}

/*  Récupération du numéro de révision de la derniere version du PDS */
var req_couchdb_pds_get = http.request(options_couchdb_pds_get, function (res) {
	var data = '';
	res.on('data', function (chunk) {
		data += chunk;
	});
	res.on('end', function () {
		var json_rev = JSON.parse(data);
		var id_rev = json_rev._rev;
		logger.info("couchdb_pds_get: derniere version du PDS identifiée: " + id_rev);
		del_pds(id_rev);
	});
});
req_couchdb_pds_get.on('error', function (e) {
	logger.error("couchdb_pds_get: erreur : " + e.message);
});
req_couchdb_pds_get.end();

/* Suppression de la derniere version du PDS */
function del_pds (id_rev) {
	options_couchdb_pds_delete.path = '/epg_cache/PDS?rev=' +id_rev;
	var req_del = http.request(options_couchdb_pds_delete, function (res) {
		data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			logger.info("couchdb_pds_del: derniere version du PDS supprimée: " + id_rev);
			get_pds();
		});
	});
	req_del.on('error', function (e) {
		logger.error("couchdb_pds_del : erreur : " + e.message);
	});
	req_del.end();
}

/* Récupere le PDS en XML sur l'adresse indiqué */
function get_pds() {
	var req_get_pds = http.request(options_xml_pds_get, function (res) {
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			logger.info('xml_pds_get : PDS source récupéré');
			put_pds(data);
		});
	});
	req_get_pds.on('error', function(e) {
		logger.error("xml_pds_get: erreur: " + e.message);
	});
	req_get_pds.end();
}

/* Sauvegarde le PDS dans la base */
function put_pds(data) {
	var pds_json = parser.toJson(data,options_xml2json);
	var req_put_pds = http.request(options_couchdb_pds_put, function (res) {
		var data = ''
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			logger.info('couchdb_pds_put: BODY: ' + chunk);
		});
	});
	req_put_pds.on('error', function(e) {
		logger.error("couchdb_pds_put: erreur: " + e.message);
	});
	req_put_pds.write(JSON.stringify(pds_json));
	req_put_pds.end();
}

/*  Récupération du numéro de révision de la derniere version de l'EPG */
var req_couchdb_epg_get = http.request(options_couchdb_epg_get, function (res) {
	var data = '';
	res.on('data', function (chunk) {
		data += chunk;
	});
	res.on('end', function () {
		var json_rev = JSON.parse(data);
		var id_rev = json_rev._rev;
		logger.info("couchdb_epg_get: derniere version de l'EPG identifiée: " + id_rev);
		del_epg(id_rev)
	});
});
req_couchdb_epg_get.on('error', function (e) {
	logger.error("couchdb_epg_get: erreur: " + e.message);
});
req_couchdb_epg_get.end();

/* Suppression de la derniere version de l'EPG */
function del_epg (id_rev) {
	options_couchdb_epg_delete.path = '/epg_cache/InformationBouquet?rev=' +id_rev;
	var req_del = http.request(options_couchdb_epg_delete, function (res) {
		data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			logger.info("couchdb_epg_del: derniere version de l'EPG supprimée: " + id_rev);
			get_epg();
		});
	});
	req_del.on('error', function (e) {
		logger.error("couchdb_epg_del: erreur: " + e.message);
	});
	req_del.end();
}


/* Recuperation de l'EPG global */
function get_epg() {
	var request = http.request(options_xml_epg_get, function (res) {
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			logger.info('xml_epg_get : EPG source récupéré');
			put_epg(data);
		});
	});
	request.on('error', function (e) {
		logger.error("couchdb_epg_get: erreur: " + e.message);
	});
	request.end();
}

/* Sauvegarde du programme des chaines dans la base */
function put_epg(epg_global){
	var epg_json = parser.toJson(epg_global,options_xml2json);
	epg_chaine = epg_json.Reponse.Corps.InformationBouquet;
	var req = http.request(options_couchdb_epg_put, function(res) {
		var data = ''
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			logger.info('couchdb_epg_put: BODY: ' + chunk);
		});
	});
	req.on('error', function(e) {
		logger.error("couchdb_epg_put: erreur: " + e.message);
	});
	req.write(JSON.stringify(epg_chaine));
	req.end();
}
