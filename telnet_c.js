var express = require('express');
var fs = require('fs');
var parser = require('body-parser');
var telnet_client = require('telnet-client');

var app = express();
app.use(parser.urlencoded({ extended: false }));


function formCmd(model, cmd, port, vid) {                                     // cmd-constructor
   var globCmds = { des3200: {
                            'show mac': 'show fdb port ' + port,
                            'show errors': 'show error ports ' + port,
                            'show stats': 'show packet ports ' + port,
                            'cable test': 'cable_diag ports ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show fdb vlanid ' + vid,
                            'port disable': 'config ports ' + port + ' state disable',
                            'port enable': 'config ports ' + port + ' state enable' 
                            },
                    des3526: {
                            'show mac': 'show fdb port ' + port,
                            'show errors': 'show error ports ' + port,
                            'show stats': 'show packet ports ' + port,
                            'cable test': 'cable_diag ports ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show fdb vid ' + vid,
                            'port disable': 'config ports ' + port + ' state disable',
                            'port enable': 'config ports ' + port + ' state enable' 
                            },
                    des1210: {
                            'show mac': 'show fdb port ' + port,
                            'show errors': 'show error ports ' + port,
                            'show stats': 'show packet ports ' + port,
                            'cable test': 'cable diagnostic port ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show fdb vlanid ' + vid,
                            'port disable': 'config ports ' + port + ' state disable',
                            'port enable': 'config ports ' + port + ' state enable' 
                            },
                    dgs3100: {
                            'show mac': 'show fdb port ' + port,
                            'show errors': 'show error ports ' + port,
                            'show stats': 'show packet ports ' + port,
                            'cable test': 'show cable_status ports ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show fdb vlanid ' + vid,
                            'port disable': 'config ports ' + port + ' state disable',
                            'port enable': 'config ports ' + port + ' state enable' 
                            },
                    dgs3120: {
                            'show mac': 'show fdb port ' + port,
                            'show errors': 'show error ports ' + port,
                            'show stats': 'show packet ports ' + port,
                            'cable test': 'cable_diag ports ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show fdb vlanid ' + vid,
                            'port disable': 'config ports ' + port + ' state disable',
                            'port enable': 'config ports ' + port + ' state enable' 
                            },
                    mes3528: {
                            'show mac': 'show mac address-table port ' + port,
                            'show errors': 'show interfaces ' + port,                                //c
                            'show stats': 'show interfaces ' + port,
                            'cable test': 'cable-diagnostics ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show mac address-table vlan ' + vid,
                            'port disable': 'configure\ninterface port-channel ' + port + '\ninactive\nex\nex',
                            'port enable': 'configure\ninterface port-channel ' + port + '\nno inactive\nex\nex' 
                            },
                    xgs4728: {
                            'show mac': 'show mac address-table port ' + port,
                            'show errors': 'show interfaces ' + port,                                //c
                            'show stats': 'show interfaces ' + port,
                            'cable test': 'cable-diagnostics ' + port,
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show mac address-table vlan ' + vid,
                            'port disable': 'configure\ninterface port-channel ' + port + '\ninactive\nexit\nexit',
                            'port enable': 'configure\ninterface port-channel ' + port + '\nno inactive\nexit\nexit' 
                            }, 
                    ecs3510: {
                            'show mac': 'show mac-address-table interface ethernet 1/' + port,
                            'show errors': 'show interfaces counters ethernet 1/' + port,            //a
                            'show stats': 'show interfaces counters ethernet 1/' + port,             //a 
                            'cable test': { test: 'test cable-diagnostics interface ethernet 1/' + port, show: 'show cable-diagnostics interface ethernet 1/' + port },
                            'show vlans': 'show vlan',
                            'show mac-table of VID': 'show mac-address-table vlan ' + vid,           //a  
                            'port disable': 'configure\ninterface ethernet 1/' + port + '\nshutdown\nend',
                            'port enable': 'configure\ninterface ethernet 1/' + port + '\nno shutdown\nend' 
                            }
                 };  
   return globCmds[model][cmd];
}


//Server
//////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static('./appl/telnet_client/www'));



// telnet 
//////////////////////////////////////////////////////////////////////////////////////////////
app.post('/telnet', function (request, response) {
   var connection = new telnet_client();	
   var cmd = formCmd(request.body.model, request.body.cmd, request.body.port, request.body.vid); 	
   if ( request.body.model == 'mes3528' || request.body.model == 'xgs4728' ) {                                  // case 1 - ZyXel
      var params = {
                    "host": request.body.ip,
                    "port": 23,
                    "timeout":  4000
                   };
      connection.connect(params); 
      connection.send('admin\npassword\n' + cmd + '\n\nlogout\n')
          .then( function(res) {
            if ( request.body.cmd != 'port disable' && request.body.cmd != 'port enable' ) {
               var reg = new RegExp(cmd);
            } else {
               reg = new RegExp('interface port-channel');
            };
            var newRes = res.replace(/\r/g, '<br/>').replace(/7/g, '');
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
   } else
   if ( request.body.model != 'mes3528' && request.body.model != 'xgs4728' && request.body.model != 'ecs3510' ) {  // case 2 - D-Link
      var params = {
                    "host": request.body.ip,
                    "port": 23,
                    "timeout":  4000
                   };
      connection.connect(params);
      connection.send('admin\r\npassword\r\n' + cmd + '\r\na\r\nlogout\r\n')
          .then(function(res) {
            var reg = new RegExp(cmd);
            var newRes = res.replace(/\r/g, '<br/>');
            newRes = newRes.slice( newRes.search(reg), (newRes.search(/\#\s?a/)<0?newRes.length:newRes.search(/\#\s?a/)) );
            response.send(newRes); 
            console.log('response sent');
            connection.destroy();  
            console.log('destroying'); 
          });
      connection.on('error', function() { 
          response.send('host unreachable');
          console.log('host unreachable');
      });
   } else
   if ( request.body.model == 'ecs3510' ) {                                                                 // case 3 - EdgECorE
      var params = {
                    "host": request.body.ip,
                    "port": 23,
                    "timeout":  6000
                   };
      connection.connect(params); 
      if ( request.body.cmd != 'cable test' ) {
         connection.exec('admin\npassword\n' + cmd + '\na\n\nquit\n')
             .then( function(res) {
               if ( request.body.cmd != 'port disable' && request.body.cmd != 'port enable' ) {
                  var reg = new RegExp(cmd);
               } else {
                  reg = new RegExp('interface ethernet');
               };
               var newRes = res.replace(/\n/g, '<br/>');
               newRes = newRes.slice( newRes.search(reg), (newRes.search(/\#a/)<0?newRes.length:newRes.search(/\#a/)) );
               response.send(newRes); 
               console.log('response sent');
               connection.destroy();  
               console.log('destroying');
             });
      } else {
         connection.exec('admin\npassword\n' + cmd.test + '\n')
             .then( function(res) {
               setTimeout( function() {
                  connection.exec(cmd.show + '\n\n\nquit\n')
                     .then( function(res) {
                        var reg = new RegExp('TF: Test failed');
                        var newRes = res.replace(/\n/g, '<br/>');
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
      console.log(request.body); 
   } else {                                                                                               // case 4 - data missmatch
      response.send('unrecognized data');
   };
});
//////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////
 
app.listen(8000, function () {
  console.log('server started');
});
//////////////////////////////////////////////////////////////////////////////////////////////
