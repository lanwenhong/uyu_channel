$(document).ready(function(){
    var myid = window.localStorage.getItem('myid');
    var get_data = {'userid': myid, 'se_userid': myid};
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
                channel_data = data.data.chn_data;
                profile_data = data.data.profile;
                $('.panel-title').text(channel_data.channel_name);
                $('#channel_id').text(channel_data.chnid);
                $('#channel_name').text(channel_data.channel_name);
                $('#contact_name').text(profile_data.contact_name);
                $('#contact_phone').text(profile_data.contact_phone);
            }
	    },
	    error: function(data) {
            toastr.warning('请求数据异常');
	    },
    });
});
