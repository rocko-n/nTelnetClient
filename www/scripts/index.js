$(function() {



  var teststring = 'something show bla-bla-bla # a';
  newstr = teststring.slice(teststring.search(/show/), teststring.search(/\#\s?a/));
  console.log(newstr); 
  console.log(teststring.search(/\#\s?a/));
  var counter = 0;
    $('form').submit(function (){                         // listen event on submit
      counter++;
      $('#result').html('Loading...'); 
      var datOb = {};
      datOb.ip = $('#ip').val();                          // start gathering data
      datOb.model = $('#model').val();
      datOb.cmd = $('#cmd').val();
      datOb.port = $('#selport').val();
      datOb.vid = $('#invid').val();
      console.log(datOb);
      if ( counter == 1 ) {
         $.post('/telnet', datOb, function (res) {          // send data
            counter = 0;
            console.log(res); 
            $('#result').html(res);                         // print results 
        
         });
      }    
      return false;                                      // stop form submission
    });

    var val = $('#cmd').val();
    if ( val == 'show vlans' ) {                                 
         $('#port').hide();
    } else if ( val == 'show mac-table of VID' ) {
         $('#port').hide();
         $('#vid').show();
         $('#invid').attr( "required", '' );
    };

    $( "#cmd" ).change(function() {                      // listen event change on dropdown
      val = $('#cmd').val();
      if ( val != 'show vlans' && val != 'show mac-table of VID' ) {
         $('#port').show();
         $('#vid').hide();
         $('#invid').removeAttr( "required" );
      } else if ( val == 'show vlans'  ) {
         $('#port').hide();
         $('#vid').hide(); 
         $('#invid').removeAttr( "required" );
      } else if ( val == 'show mac-table of VID' ) {
         $('#port').hide();
         $('#vid').show();
         $('#invid').attr( "required", '' ).focus();
      };
    });


  /*var startTime = new Date;
  var answers=[];
  var counter = 1;
  $.post('/questions', {id: counter}, function (data) {
      $('#test_q').html(data); 
      $('#number').html(' '+counter);
      $('#'+ counter +'q').addClass('current_question');
  });

  $('#next').click(function () { 
    if (counter != 30) {
         answers[counter] = []; 
       $('input').each(function() {
         answers[counter].push($(this).is(':checked'));
       });
       console.log(answers[counter]);
       counter++;
       
    };
  });

  setTimeout(function() {
    alert('time is up'); 
  }, 20*60*1000);
  setInterval(function(){
    var timer = new Date - startTime; 
    console.log(timer)
  }, 2000);                 */
});       


  /* var serverTime;           // current server time (needed fo duration)
   var lastEvent;            // last Event time, for cheking if something new has happend
   var counter = 0;          // counter for clicks of buttons (not button edit, send, req-res one per click)
   var counterEdit = 0;      // counter for clicks of buttons edit, send
   var sortBy = {                // sort method
                  id: 'addrup' 
                };
   var infoText;             // info message

// function for converting time from Date to xxdxxhxxmxxs
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 function timer(time) {                                   
         time = (time/1000).toFixed();
         var resTime; 
         if (time < 60) {
             resTime = time + 's'; 
         } else
         if ((time>=60)&&(time<3600)) {
             resTime = (time/60).toFixed() + 'm' + time % 60 + 's';
         } else 
         if ((time>=3600)&&(time<86400)) {
             resTime = (time/3600).toFixed() + 'h' + ((time % 3600)/60).toFixed() + 'm' + (time % 3600) % 60 + 's';
         } else {
             resTime = (time/86400).toFixed() + 'd' + ((time % 86400)/3600).toFixed() + 'h' + (((time % 86400)%3600)/60).toFixed() + 'm' + ((time % 86400) % 3600) % 60 + 's';
         };
         return resTime; 
 }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   


// function for recieving status-data from server   
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 function recieveStatus() {    
         var prom = $.post('/status', sortBy, function (data) {
                    counterEdit = 0;
                    serverTime = new Date(data.now);
                    $('#totalsOk').html(data.ok); 
                    $('#totalsDown').html(data.down);
                    $('#totalsWarning').html(data.warning);
                    $('#currentstats').html(data.html)    
                    console.log('updated');        
                    });   
           
         return prom;               
 }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// function for recieving lastEvent time from server and if something new has happend - recieve new status-data
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
 function ifSomethingHappend() {
         var prom = $.post('/chek', 'give_me_lastEvent', function (data) {
                    serverTime = new Date(data.now);
                    if (data.lastEv != lastEvent) {
                        lastEvent = data.lastEv;
                        recieveStatus().then(function() {
                              $("td.duration").each(function() {
                                  var time = serverTime - new Date($(this).attr("data-start"));
                                  $(this).text(timer(time));
                              });
                        });
                    } else {
                        $("td.duration").each(function() {
                            var time = serverTime - new Date($(this).attr("data-start"));
                            $(this).text(timer(time));
                        });
                        console.log('nothing new has happend');
                    };     
               });
         return prom;           
 }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// change info
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
        $('tbody#currentstats').on("click", ".edit", function() { 
             counterEdit++;
             if ( counterEdit == 1 ) {
                 infoText = $(this).siblings('text').html();
                 $(this).siblings('text').remove();
                 $(this).closest('td').prepend( '<input type="text" size="20" maxlength="40">' );
                 $(this).siblings('input').val(infoText).focus(); 
                 $(this).html('send');
                 console.log(infoText);
             };
             if ( (counterEdit > 1) && ($(this).html() == 'send') && (infoText != $(this).siblings('input').val().trim()) ) {
                 var this_ = $(this);
                 infoText = $(this).siblings('input').val().trim();
                 var unit = $(this).attr("data-unit");
                 var sendData = {
                                 info: infoText,
                                 unit: unit 
                                };
                 $.post('/add_info', sendData, function (data) {
                    this_.siblings('input').remove();
                    this_.closest('td').prepend('<text>' + infoText + '</text>');
                    this_.html('edit');
                    lastEvent = data;
                    counterEdit = 0; 
                 });  
             } else
             if ( (counterEdit > 1) && ($(this).html() == 'send') && (infoText == $(this).siblings('input').val().trim()) ) {
                 $(this).siblings('input').remove();
                 $(this).closest('td').prepend('<text>' + infoText + '</text>');
                 $(this).html('edit');
                 counterEdit = 0; 
             } else
             if ( (counterEdit > 1) && ($(this).html() != 'send') ) {
                 alert('Wrong field');
             };
        }); 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// sorting data on click                         
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $('#adsort').on("click", function() {
            counter++; 
            if (counter == 1) {
               if (sortBy.id == 'addrup') {
                   sortBy.id = 'addrdown';
               } else {
                   sortBy.id = 'addrup';
               };
               recieveStatus().then(function() {
                              $("td.duration").each(function() {
                                  var time = serverTime - new Date($(this).attr("data-start"));
                                  $(this).text(timer(time));
                              });
               });
            };
            counter = 0;
        });
        $('#evsort').on("click", function() {
            counter++; 
            if (counter == 1) {
               if (sortBy.id == 'evup') {
                   sortBy.id = 'evdown';
               } else {
                   sortBy.id = 'evup';
               }
               recieveStatus().then(function() {
                              $("td.duration").each(function() {
                                  var time = serverTime - new Date($(this).attr("data-start"));
                                  $(this).text(timer(time));
                              });
               });
            };
            counter = 0;
        });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
        
        
// force update button - recieve fresh news about status
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
	$('#force').on("click", function() {
            counter++;
            if (counter == 1) {
               $('#force').html('UPDATING');
               $.post('/force_update', sortBy, function (data) {
                 counterEdit = 0;
                 serverTime = new Date(data.now);
                 $('#totalsOk').html(data.ok); 
                 $('#totalsDown').html(data.down);
                 $('#currentstats').html(data.html);
                 $('#force').html('FORCE_UPDATE');
                 counter = 0;
               }).then(function() {
                              $("td.duration").each(function() {
                                  var time = serverTime - new Date($(this).attr("data-start"));
                                  $(this).text(timer(time));
                              });
               });
            };
	});    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//function-calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
   ifSomethingHappend();
   setInterval(ifSomethingHappend, 60000);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
});




function fontSize() {
  var width = 1200; 
  var fontSize = 62.5; 
  var bodyWidth = document.documentElement.clientWidth;
  var multiplier = bodyWidth / width; 
  fontSize = Math.floor(fontSize * multiplier);
  document.body.style.fontSize = fontSize+'%';
}
window.onload = fontSize; 
window.onresize = fontSize; */
