$(function() {
   var counter = 0;
      $('form').submit(function (){                            // listen event on submit
         counter++;
         $('#result').html('Loading...'); 
         var datOb = {};
         datOb.ip = $('#ip').val();                            // start gathering data
         datOb.model = $('#model').val();
         datOb.cmd = $('#cmd').val();
         datOb.port = $('#selport').val();
         datOb.vid = $('#invid').val();
         datOb.mac = $('#mac').val().replace(/\-/g, ':');
         if ( counter === 1 ) {
            $.post('/telnet', datOb, function (res) {          // send data 
               counter = 0;
               $('#result').html(res);                         // print results 
            });
         };    
         return false;                                         // stop form submission
      });
   var val = $('#cmd').val();   
   switch (val) {                                             // on page reload                            
      case 'show vlans':
      case 'show log':
      case 'save changes':  
      case 'mac-flush':                               
         $('#port').hide();
         break;
      case 'show mac-table of VID':
         $('#port').hide();
         $('#vid').show();
         $('#invid').attr( 'required', '' );
         break;
      case 'find mac':
         $('#port').hide();
         $('#macdiv').show();
         $('#mac').attr( 'required', '' );
         break;
   };

   $('#cmd').change(function() {                              // listen event change on dropdown
      val = $('#cmd').val();
      switch (val) {
         case 'show mac':
         case 'show errors':
         case 'show stats':  
         case 'cable test':
         case 'port disable':
         case 'port enable':     
            $('#port').show();
            $('#vid').hide();
            $('#invid').removeAttr( 'required' );
            $('#macdiv').hide();
            $('#mac').removeAttr( 'required' );
            break;
         case 'show vlans':
         case 'show log':
         case 'save changes':
         case 'mac-flush':
            $('#port').hide();
            $('#vid').hide(); 
            $('#invid').removeAttr( 'required' );
            $('#macdiv').hide();
            $('#mac').removeAttr( 'required' );  
            break;
         case 'show mac-table of VID':
            $('#port').hide();
            $('#macdiv').hide();
            $('#mac').removeAttr( 'required' );
            $('#vid').show();
            $('#invid').attr( 'required', '' ).focus();
            break;
         case 'find mac':
            $('#port').hide();
            $('#vid').hide();
            $('#invid').removeAttr( 'required' );
            $('#macdiv').show();
            $('#mac').attr( 'required', '' ).focus();
            break;
      }; 
   });
}); 
