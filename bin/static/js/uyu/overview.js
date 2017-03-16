$(document).ready(function(){
    var myid = window.localStorage.getItem('myid');
    var get_data = {'userid': myid};
    $.ajax({
	    url: '/channel/v1/api/channel',
	    type: 'GET',
	    dataType: 'json',
	    data: get_data,
	    success: function(data) {
            var respcd = data.respcd;
            if(respcd != '0000'){
                var resperr = data.resperr;
                var respmsg = data.respmsg;
                var msg = resperr ? resperr : respmsg;
                toastr.warning(msg);
                return false;
			} else {
                console.log('channel data');
                console.log*(data.data);
            }
	    },
	    error: function(data) {
            toastr.warning('请求数据异常');
	    },
    });
});
