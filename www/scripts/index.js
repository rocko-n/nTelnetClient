$(function() {
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
            console.log('done'); 
            $('#result').html(res);                         // print results  
         });
      };    
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
});       
