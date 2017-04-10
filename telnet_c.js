var express = require('express');
var fs = require('fs');
var parser = require('body-parser');
var telnet_client = require('telnet-client');
var app = express();
app.use(parser.urlencoded({ extended: false }));
/**
 * cmd-constructor
 * @param {String} model
 * @param {String} cmd
 * @param {String} [port]
 * @param {String} [vid]
 * @param {String} [mac]
 * @returns {String}
 */
function formCmd(model, cmd, port, vid, mac) {
    var globCmds = {
        des3200: {
            'show mac': 'show fdb port ' + port,
            'show errors': 'show error ports ' + port,
            'show stats': 'show packet ports ' + port,
            'cable test': 'cable_diag ports ' + port,
            'show log': 'show log',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show fdb vlanid ' + vid,
            'find mac': 'show fdb mac_address ' + mac,
            'port disable': 'config ports ' + port + ' state disable',
            'port enable': 'config ports ' + port + ' state enable',
            'save changes': 'save',
            'mac-flush': 'clear fdb all'
            },
        des3526: {
            'show mac': 'show fdb port ' + port,
            'show errors': 'show error ports ' + port,
            'show stats': 'show packet ports ' + port,
            'cable test': 'cable_diag ports ' + port,
            'show log': 'show log',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show fdb vid ' + vid,
            'find mac': 'show fdb mac_address ' + mac,
            'port disable': 'config ports ' + port + ' state disable',
            'port enable': 'config ports ' + port + ' state enable',
            'save changes': 'save',
            'mac-flush': 'clear fdb all'
            },
        des1210: {
            'show mac': 'show fdb port ' + port,
            'show errors': 'show error ports ' + port,
            'show stats': 'show packet ports ' + port,
            'cable test': 'cable diagnostic port ' + port,
            'show log': 'show log',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show fdb vlanid ' + vid,
            'find mac': 'show fdb mac_address ' + mac,
            'port disable': 'config ports ' + port + ' state disable',
            'port enable': 'config ports ' + port + ' state enable',
            'save changes': 'save',
            'mac-flush': 'clear fdb all'
            },
        dgs3100: {
            'show mac': 'show fdb port ' + port,
            'show errors': 'show error ports ' + port,
            'show stats': 'show packet ports ' + port,
            'cable test': 'show cable_status ports ' + port,
            'show log': 'show log',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show fdb vlanid ' + vid,
            'find mac': 'show fdb mac_address ' + mac,
            'port disable': 'config ports ' + port + ' state disable',
            'port enable': 'config ports ' + port + ' state enable',
            'save changes': 'save\r\ny',
            'mac-flush': 'clear fdb all'
            },
        dgs3120: {
            'show mac': 'show fdb port ' + port,
            'show errors': 'show error ports ' + port,
            'show stats': 'show packet ports ' + port,
            'cable test': 'cable_diag ports ' + port,
            'show log': 'show log',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show fdb vlanid ' + vid,
            'find mac': 'show fdb mac_address ' + mac,
            'port disable': 'config ports ' + port + ' state disable',
            'port enable': 'config ports ' + port + ' state enable',
            'save changes': 'save',
            'mac-flush': 'clear fdb all'
            },
        mes3528: {
            'show mac': 'show mac address-table port ' + port,
            'show errors': 'show interfaces ' + port,
            'show stats': 'show interfaces ' + port,
            'cable test': 'cable-diagnostics ' + port,
            'show log': 'show loggin',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show mac address-table vlan ' + vid,
            'find mac': 'show mac address-table mac ' + mac,
            'port disable': 'configure\ninterface port-channel ' + port + '\ninactive\nexit\nexit',
            'port enable': 'configure\ninterface port-channel ' + port + '\nno inactive\nexit\nexit',
            'save changes': 'write memory',
            'mac-flush': 'mac-flush'
            },
        mes3500: {
            'show mac': 'show mac address-table port ' + port,
            'show errors': 'show interfaces ' + port,
            'show stats': 'show interfaces ' + port,
            'cable test': 'cable-diagnostics ' + port,
            'show log': 'show loggin',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show mac address-table vlan ' + vid,
            'find mac': 'show mac address-table mac ' + mac,
            'port disable': 'configure\ninterface port-channel ' + port + '\ninactive\nexit\nexit',
            'port enable': 'configure\ninterface port-channel ' + port + '\nno inactive\nexit\nexit',
            'save changes': 'write memory',
            'mac-flush': 'mac-flush'
            },
        xgs4728: {
            'show mac': 'show mac address-table port ' + port,
            'show errors': 'show interfaces ' + port,
            'show stats': 'show interfaces ' + port,
            'cable test': 'cable-diagnostics ' + port,
            'show log': 'show loggin',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show mac address-table vlan ' + vid,
            'find mac': 'show mac address-table mac ' + mac,
            'port disable': 'configure\ninterface port-channel ' + port + '\ninactive\nexit\nexit',
            'port enable': 'configure\ninterface port-channel ' + port + '\nno inactive\nexit\nexit',
            'save changes': 'write memory',
            'mac-flush': 'mac-flush'
            },
        ecs3510: {
            'show mac': 'show mac-address-table interface ethernet 1/' + port,
            'show errors': 'show interfaces counters ethernet 1/' + port,
            'show stats': 'show interfaces counters ethernet 1/' + port,
            'cable test': { test: 'test cable-diagnostics interface ethernet 1/' + port, show: 'show cable-diagnostics interface ethernet 1/' + port },
            'show log': 'show log ram',
            'show vlans': 'show vlan',
            'show mac-table of VID': 'show mac-address-table vlan ' + vid,
            'find mac': 'show mac-address-table address ' + mac.replace(/:/g, '-'),
            'port disable': 'configure\ninterface ethernet 1/' + port + '\nshutdown\nend',
            'port enable': 'configure\ninterface ethernet 1/' + port + '\nno shutdown\nend',
            'save changes': 'copy running-config startup-config',
            'mac-flush': 'clear mac-address-table dynamic all'
            }
        };
    /**check if model and cmd is supported*/
    if ( globCmds.hasOwnProperty(model) && globCmds[model].hasOwnProperty(cmd) ) {
        return globCmds[model][cmd];
    } else return 'unsupported';
}

/**
 * model-translator for intagration with billing's monitoring system, translate full name from billing to simple name
 * @param {String} fullModel
 * @returns {String}
 */
function modelTranslator(fullModel) {
    var globModel = {
        'DES-3200-10': 'des3200',
        'DES-3200-18': 'des3200',
        'DES-3200-26': 'des3200',
        'DES-3200-28': 'des3200',
        'DES-3200-28F': 'des3200',
        'DES-3026': 'des3200',
        'DES-3016': 'des3200',
        'DES-3010G': 'des3200',
        'DES-3028': 'des3200',
        'DES-3028P': 'des3200',
        'DES-1228': 'des3200',
        'DES-1210-28': 'des1210',
        'DES-3526': 'des3526',
        'DES-3528': 'des3526',
        'DGS-3100-24TG': 'dgs3100',
        'DGS-3120-24SC': 'dgs3120',
        'DGS-3420-26SC': 'dgs3120',
        'MES-3528': 'mes3528',
        'MES-3500-24': 'mes3500',
        'ES-3124': 'mes3528',
        'ES-2108': 'mes3528',
        'ES-2108G': 'mes3528',
        'ES-2024A': 'mes3528',
        'GS-3012F': 'xgs4728',
        'XGS-4728F': 'xgs4728',
        'ES-3510MA': 'ecs3510',
        'ECS3510-28T': 'ecs3510',
        'ECS4510-28F': 'ecs3510',
        'DGS-3000-10TC': 'des3200',
        'D-Link DES-3200-10': 'des3200',
        'D-Link DES-3200-18': 'des3200',
        'D-Link DES-3200-26': 'des3200',
        'D-Link DES-3200-28': 'des3200',
        'D-Link DES-3200-28F': 'des3200',
        'D-Link DES-3028P': 'des3200',
        'D-Link DES-3028G': 'des3200',
        'D-Link DES-3028': 'des3200',
        'D-Link DES-3026': 'des3200',
        'D-Link DES-3016': 'des3200',
        'D-Link DES-3010G': 'des3200',
        'D-Link DES-1228': 'des3200',
        'D-Link DES-1210-28': 'des1210',
        'D-Link DES-3526': 'des3526',
        'D-Link DES-3528': 'des3526',
        'D-Link DGS-3100-24TG': 'dgs3100',
        'D-Link DGS-3120-24SC': 'dgs3120',
        'D-Link DGS-3420-26SC': 'dgs3120',
        'ZyXEL MES-3528': 'mes3528',
        'ZyXEL MES-3500-24': 'mes3500',
        'ZyXEL GS-3012F': 'mes3528',
        'ZyXEL ES-3124': 'mes3528',
        'ZyXEL ES-2108-G': 'mes3528',
        'ZyXEL ES-2108': 'mes3528',
        'ZyXEL ES-2024A': 'mes3528',
        'ZyXEL XGS-4728F': 'xgs4728',
        'Edge-corE ECS3510-28T': 'ecs3510',
        'Edge-corE ES3510MA': 'ecs3510',
        'Edge-corE ES4626-SFP': 'ecs3510'
        };
    if ( globModel.hasOwnProperty(fullModel) ) {
        return globModel[fullModel];
    } else return fullModel;
}
/**FullView*/
app.use(express.static(__dirname + '/www'));
/**QuickView, for billing monitoring system*/
app.get(/^\/([\d.]+)\/([\w\-%]+)/, function (req, res) {
    res.send(fs.readFileSync(__dirname + '/template/quickview.html').toString().replace(/#ip#/g, '' + req.params[0] + '').replace('#model#', '' + modelTranslator(req.params[1]) + ''));
});
/**Telnet*/
app.post('/telnet', function (request, response) {
    var connection = new telnet_client();
    console.log(new Date + 2, request.body);
    var cmd = formCmd(request.body.model, request.body.cmd, request.body.port, request.body.vid, request.body.mac);
    /**Check if model or cmd is supported*/
    if ( cmd === 'unsupported' ) {
        response.send('unsupported data');
        return;
    }
    var params = {
        "host": request.body.ip,
        "port": 23,
        "timeout":  11500,
        "execTimeout": 12000
        };
    switch (request.body.model) {
        /**Case 1 - ZyXEL*/
        case 'mes3528':
        case 'mes3500':
        case 'xgs4728':
            if ( request.body.cmd === 'cable test' && request.body.model === 'mes3500' ) {
                params.sendTimeout = 4000;
                connection.connect(params);
                connection.send('admin\npassword\n' + cmd + '\n\n')
                    .then(function(res) {
                        var reg = new RegExp(cmd.replace(/\s/g, '&nbsp;'));
                        var newRes = res.replace(/7/g, '').replace(/[\r\n]/g, '<br>').replace(/\s/g, '&nbsp;');
                        newRes = newRes.slice(newRes.search(reg));
                        response.send(newRes);
                        console.log('response sent');
                        connection.destroy();
                        console.log('destroying');
                    });
                connection.on('error', function() {
                    response.send('host unreachable');
                    console.log('host unreachable');
                });
                connection.on('timeout', function() {
                    response.send('response timeout');
                    console.log('response timeout');
                });
                return;
            }
            connection.connect(params);
            connection.exec('admin\npassword\n' + cmd + '\n\n')
                .then (function(res1) {
                    connection.exec('\n\n')
                        .then(function(res2) {
                            var res = res1 + res2;
                            if ( request.body.cmd !== 'port disable' && request.body.cmd !== 'port enable' ) {
                                var reg = new RegExp(cmd.replace(/\s/g, '&nbsp;'));
                            } else {
                                reg = new RegExp('interface&nbsp;port-channel');
                            };
                            var newRes = res.replace(/7/g, '').replace(/[\r\n]/g, '<br>').replace(/\s/g, '&nbsp;');
                            newRes = newRes.slice(newRes.search(reg));
                            response.send(newRes);
                            console.log('response sent');
                            connection.destroy();
                            console.log('destroying');
                        });
                });
            connection.on('error', function() {
                response.send('host unreachable');
                console.log('host unreachable');
            });
            connection.on('timeout', function() {
                response.send('response timeout');
                console.log('response timeout');
            });
            break;
        /**Case 2 - D-Link*/
        case 'des3200':
        case 'des3526':
        case 'des1210':
        case 'dgs3100':
        case 'dgs3120':
            if ( request.body.cmd === 'show log' || request.body.model === 'dgs3100' ) {
                params.sendTimeout = 5000;
            } else {
                params.sendTimeout = 1000;
            };
            connection.connect(params);
            connection.send('admin\r\npassword\r\n' + cmd + '\r\na\r\n')
                .then(function(res) {
                    if ( cmd === 'save\r\ny' ) {
                        var reg = new RegExp('save');
                    } else {
                        reg = new RegExp(cmd.replace(/\s/g, '&nbsp;'));
                    };
                    var newRes = res.replace(/\n/g, '<br>').replace(/\[[^<]*/g, '').replace(/\s/g, '&nbsp;');
                    newRes = newRes.slice( newRes.search(reg), (newRes.search(/#(&nbsp;)?a/)<0?newRes.length:newRes.search(/#(&nbsp;)?a/)) );
                    response.send(newRes);
                    console.log('response sent');
                    connection.destroy();
                    console.log('destroying');
                });
            connection.on('error', function() {
                response.send('host unreachable');
                console.log('host unreachable');
            });
            connection.on('timeout', function() {
                response.send('response timeout');
                console.log('response timeout');
            });
            break;
        /**Case 3 - EdgECorE*/
        case 'ecs3510':
            connection.connect(params);
            if ( request.body.cmd !== 'cable test' ) {
                connection.exec('admin\npassword\n' + cmd + '\na\n\n')
                    .then( function(res) {
                        if ( request.body.cmd !== 'port disable' && request.body.cmd !== 'port enable' ) {
                            var reg = new RegExp(cmd.replace(/\s/g, '&nbsp;'));
                        } else {
                            reg = new RegExp('interface&nbsp;ethernet');
                        }
                        var newRes = res.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
                        newRes = newRes.slice( newRes.search(reg), (newRes.search(/#a/)<0?newRes.length:newRes.search(/#a/)) );
                        if ( request.body.cmd === 'save changes' ) {
                            response.send('Success');
                            console.log('response sent');
                            connection.destroy();
                            console.log('destroying');
                            return;
                        };
                        response.send(newRes);
                        console.log('response sent');
                        connection.destroy();
                        console.log('destroying');
                    });
            } else {
                connection.exec('admin\npasswprd\n' + cmd.test + '\n')
                    .then(function(res) {
                        setTimeout(function() {
                            connection.exec(cmd.show + '\n\n\n')
                                .then( function(res) {
                                    var reg = new RegExp('Port');
                                    var newRes = res.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
                                    newRes = newRes.slice( newRes.search(reg) );
                                    response.send(newRes);
                                    console.log('response sent');
                                    connection.destroy();
                                    console.log('destroying');
                                });
                        }, 6000 );
                    });
            };
            connection.on('error', function() {
                response.send('host unreachable');
                console.log('host unreachable');
            });
            connection.on('timeout', function() {
                response.send('response timeout');
                console.log('response timeout');
            });
            break;
    }
});
app.listen(8000, function () {
    console.log('server started');
});