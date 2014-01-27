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

 (function(window) { // Admin default setup

	var APP = window.APP || {}; // Main global for our APP

	// ----------- API DATA CONFIG ---------------------------------------------------------------------------------- //

	// INPUT FORMULAIRE : [type] i : Information // a : Action // s : Sélection // v : Valeur // h : Hidden
	APP.config = {

		SYSTEM: [
			{type: 'i', title: 'Network status', id: 'netstat'},
			{type: 'i', title: 'Model', id: 'model'},
			{type: 'i', title: 'Serial number', id: 'serial'},
			{type: 'i', title: 'Version software', id: 'versionSoft'},
			{type: 'i', title: 'Version API', id: 'versionApi'},
			/*{type: 'a', title: 'Configuration tests', id: 'Status'},*/
			{type: 'a', title: 'Hardware reboot', id: 'Reboot'},
			{type: 'v', title: 'IP adresse ', id: 'ip'},
			{type: 'v', title: 'Netmask', id: 'mask'},
			{type: 's', title: 'DHCP', id: 'dhcp', values: [
                {id:1, title: 'Oui'},
                {id:2, title: 'Non'}
            ]},
			{type: 'a', title: 'Reset DHCP', id: 'Reset', temp:true},
			{type: 'i', title: 'Date and Time', id: 'datetime'},
			{type: 'v', title: 'Date', id: 'date', format:'date', required:true},
			{type: 'v', title: 'Time', id: 'time', format:'time', required:true}
		],

		SOFTWARE: [
			{type: 's', title: 'SW upgrade Mode', id: 'upgradeMode',temp:true, values: [
				{id:1, title: 'Manual', tip: 'Via un fichier en local'},
				{id:2, title: 'Automatic', tip:'Via un fichier de MAJ récupéré sur le portail B-STORE'}
			]},
			{type: 'a', title: 'SW upgrade', id: 'UpgradeNow'}
		],

		TV: [
			{type: 'l', title: 'PDS list', id: 'pdsList'},
			{type: 's', title: 'PDS Mode', id: 'pds', values: [
				{id:1, title: 'Manual', tip: 'Via un fichier en local sur la carte SD de la STB'},
				{id:2, title: 'TNT', tip: 'Via un fichier en local sur la carte SD de la STB'}
			] },
			{type: 'a', title: 'PDS Re-scan', id: 'PdsScan', temp:true}
		],

	/*	USERS: [
			{type: 'l', title: 'Personal profils', id: 'profilsId', temp:true},
			{type: 'h', title: 'Service ID', id: 'serviceId', temp:true},
			{type: 's', title: 'Personal profil mode', id: 'profilsMode', temp:true, values: [
				{id:1, title: 'Automatic', tip:'La liste est constuite via l\'API d\'INVITIES (en paramètre : l\'ID développeur INVITIES'},
				{id:2, title: 'Manual', tip: 'La liste est constuite à partir d\'un fichier de configuration présent sur la carte SD de la STB'}
			]},
			{type: 'v', title: 'ID developer INVITIES', id: 'invitieKeyAp, temp:truei', temp:true}
		], */

		APPS: [
			{type: 'l', title: 'Applications list', id: 'applicationsList'},
			{type: 'v', title: 'Developper ID', id: 'developperId', temp:true},
			{type: 's', title: 'Execution mode', id: 'executionMode', temp:true, values: [
				{id:1, title: 'Automatic', tip:'La liste est constuite via l\'API du B-STORE (en paramètre : l\'ID développeur B-STORE)'},
				{id:2, title: 'Manual', tip: 'La liste est constuite à partir d\'un fichier de configuration présent sur la carte SD de la STB'}
			]},
			{type: 'v', title: 'ID developer B-STORE', id: 'bstoreKeyApi', temp:true}
		],

		DEBUG: [
			/*{type: 's', title: 'QT log Level', id: 'qtLogLevel', values: [
				{id:1, title: 'debug'},
				{id:2, title: 'info'},
				{id:3, title: 'warning'},
				{id:4, title: 'error'},
				{id:5, title: 'fatal'}
			]},
			{type: 'a', title: 'QT log view', id: 'QtLogView'},
			{type: 'a', title: 'QT Reboot', id: 'QtReboot'},
			{type: 'a', title: 'QT clear log', id: 'QtClearLog'},
			{type: 'i', title: 'Qt log URL', id: 'qtLogUrl'},*/

			{type: 's', title: 'NodeJS log Level', id: 'nodeLogLevel', values: [
				{id:1, title: 'Debug'},
				{id:2, title: 'Info'},
				{id:3, title: 'Warning'},
				{id:4, title: 'Error'},
				{id:5, title: 'Fatal'}
			]},
			{type: 'a', title: 'NodeJS log view', id: 'NodeLogView'},
			{type: 'a', title: 'NodeJS Reboot', id: 'NodeReboot'},
			{type: 'a', title: 'NodeJS clear log', id: 'NodeClearLog'}/*,
			{type: 'i', title: 'NodeJS log URL', id: 'nodeLogUrl'}*/
		]
	};

	// Adding to list /////////////////////////////////////////////////////////

	APP.addChanel = [
		{type: 'h', title: '', id: 'id'},
		{type: 'v', title: 'Name', id: 'name', required:true},
		{type: 'v', title: 'Image', id: 'img'},
		{type: 'v', title: 'Stream URL', id: 'url', required:true},
		{type: 'v', title: 'Infos', id: 'infos'}
	];

	APP.addUser = [
		{type: 'h', title: '', id: 'id'},
		{type: 'v', title: 'Nickname', id: 'nickname', required:true},
		{type: 'v', title: 'Avatar', id: 'avatar'},
		{type: 'v', title: 'oAuth', id: 'oauth'}
	];

    APP.addApp = [
		{type: 'h', title: '', id: 'id'},
		{type: 'v', title: 'Name', id: 'name', required:true},
		{type: 'v', title: 'Image', id: 'img'},
		{type: 'v', title: 'URL', id: 'url', required:'url'},
		{type: 'v', title: 'Infos', id: 'infos'}
	];

    APP.upgrade = [
        {type: 'h', title: '', id: 'id'},
        {type: 'f', title: 'Fichier', id: 'update_file', required:'file'},
    ];

	// Sample default value // For demo purpose (emulate a fake box)

	APP.defaultValues = {
        netstat: 1, // Statut réseau : "Connecté", "Déconnecté"
        model: "XXXXX", // Modèle
        serial: "000001", // Numero de serie
        versionSoft: "00001", // Version software
        versionApi: "0.0.1", // Version API
        //reboot : "#", // Hardware reboot
        ip: "192.168.1.80", // Adresse IP
        dhcp: 2, // DHCP {statique: "Statique", auto: "Auto"}
        //reset: "#", // Reset DHCP
        datetime: "2013-06-29 17:03", // Date and Time
        date: "2013-06-29",
        time: "17:03",
        upgradeMode: 1, // SW upgrade Mode {auto: "Automatic", manuel:"Manual"}
        //upgradeNow: "#", // SW upgrade
        pds: 2, // PDS Mode {manual: "Manual", tnt: "TNT", hls: "HLS"}
        pdsList: [{
			id: 2,
			name: 'FR2',
			img: 'philippe-861132131466.jpg',
			url: 'http://stream.television.fr/fr2.m3u'
		}],
        //pdsScan: "#", // PDS Re-scan
        serviceId: 85, // Service ID is the "Profil Foyer" root
        profilsId: [{ // Profils personnels
			id: 20,
			nickname: 'Anna Laure',
			avatar: 'analaure-861132131465.jpg',
			oauth: [
				{name:'facebook', nickname:'toto', cookie:'', token:''},
				{name:'twitter', nickname:'toto', cookie:'', token:''}
			]
		},{ // Profils personnels
            id: 21,
            nickname: 'Philippe',
            avatar: 'philippe-861132131466.jpg',
            oauth: [
                {name:'facebook', nickname:'toto', cookie:'', token:''},
                {name:'twitter', nickname:'toto', cookie:'', token:''}
            ]
        }],
        profilsMode: 1, // Profils personnels mode {auto: "Automatic", manuel: "Manual"}
        invitieKeyApi: "a1a1a1a1a1a1a1a1a1", // ID développeur INVITIES
        developperId: "a1a1a1a1a1a1a1a1a1", // Développeur ID
        applicationsList: [{ // Liste applications {actif: "",title: "",icone: "",url: "", infos: ""}
			id: 10,
			title: 'Disco potatoes',
			img: 'analaure-861132131465.jpg',
			url: 'http://localhost/monsite/disco_potatoes/',
			infos: 'Bla blah blah blah blah blah blah blah bla'
		}],
        executionMode: 1, // Mode d\"éxécution {auto: "Automatic", manuel: "Manual"}
        bstoreKeyApi: "a1a1a1a1a1a1a1a1a1", // ID développeur B-STORE
        qtLogLevel: 1, // QT log Level {debug: "1", info: "2", warning: "3", error:"4", fatal:"5"}
        //qtLogView: "#", // QT log view
        //qtReboot:"#", // QT Reboot
        //qtClearLog: "#", // QT clear log
        qtLogUrl: "logs-qt.html", // Qt log URL
        nodeLogLevel: 1//, // Node log Level {debug: "1", info: "2", warning: "3", error:"4", fatal:"5"}
        //nodeLogView: "#", // Node log view
        //nodeReboot:"#", // Node Reboot
        //nodeClearLog: "#", // Node clear log
        //nodeLogUrl: "logs-node.html" // Node log URL
    };

    /*
        // https://github.com/iatek/jquery-socialist/blob/master/examples/index.html
        $('#content').socialist({
            networks: [
                {name:'linkedin',id:'buddy-media'},
                {name:'facebook',id:'in1dotcom'},
                {name:'pinterest',id:'potterybarn'},
                {name:'twitter',id:'in1dotcom'},
                {name:'googleplus',id:'105588557807820541973/posts'},
                {name:'rss',id:' http://feeds.feedburner.com/good/lbvp'},
                {name:'rss',id:'http://www.makebetterwebsites.com/feed/'},
                {name:'craigslist',id:'boo',areaName:'southcoast'},
                {name:'rss',id:'http://www.houzz.com/getGalleries/featured/out-rss'}
               ],
            isotope:false,
            random:false,
            fields:['source','heading','text','date','image','followers','likes']
        });
    */

	window.APP = APP;

})(window);