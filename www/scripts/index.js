$(function() {
    /**
     * Counter for clicks
     * @type {Number}
     */
    var counter = 0;
    $('form').submit(function () {
        counter++;
        if ( counter !==1 ) {
            return false;
        };
        $('#result').html('Loading...');
        /**
         * Sending data
         * @type {Object}
         */
        var datOb = {};
        /**Start gathering data*/
        datOb.ip = $('#ip').val();
        datOb.model = $('#model').val();
        datOb.cmd = $('#cmd').val();
        datOb.port = $('#selport').val();
        datOb.vid = $('#invid').val();
        datOb.mac = $('#mac').val().replace(/\-/g, ':');
        $.post('/telnet', datOb, function (res) {
            counter = 0;
            $('#result').html(res);
        });
        return false;
    });
    var val = $('#cmd').val();
    /**On page reload*/
    switch (val) {
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
    /**Listen event change on dropdown*/
    $('#cmd').change(function() {
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