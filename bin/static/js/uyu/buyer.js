$(document).ready(function(){
    $.validator.addMethod("PositiveNumber", function(value, element) {
        if(value <=0){
            return false;
        }
        else {
            return true;
        }
    }, "请正确填写您的次数");

    $("#training_times").bind('input propertychange', function () {
        var amount_per = 0;
        amount_per = $('#channel_training_amt_per').val();
        $('#training_amt').val(($(this).val() * amount_per).toFixed(2));
    });

    $("#a_training_times").bind('input propertychange', function () {
        var amount_per = $('#a_store_training_amt_per').val();
        $('#a_training_amt').val(($(this).val() * amount_per).toFixed(2));
    });

    $.validator.addMethod("isYuan", function(value, element) {
        var length = value.length;
        var yuan  = /^([0-9]{1,6})\.([0-9]{1,2})$/;
        return this.optional(element) || (length && yuan.test(value));
    }, "请正确填写您的价格");

    $('#trainBuyerList').DataTable({
        "autoWidth": false,     //通常被禁用作为优化
        "processing": true,
        "serverSide": true,
        "paging": true,         //制指定它才能显示表格底部的分页按钮
        "info": true,
        "ordering": false,
        "searching": false,
        "lengthChange": true,
        "deferRender": true,
        "iDisplayLength": 10,
        "sPaginationType": "full_numbers",
        "lengthMenu": [[10, 40, 100],[10, 40, 100]],
        "dom": 'l<"top"p>rt',
        // "bAutoWidth": true,
        "fnInitComplete": function(){
            var $trainBuyerList_length = $("#trainBuyerList_length");
            var $trainBuyerList_paginate = $("#trainBuyerList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $trainBuyerList_paginate.addClass('col-md-8');
            $trainBuyerList_length.addClass('col-md-4');
            $trainBuyerList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var get_data = {
	           'page': Math.ceil(data.start / data.length) + 1,
	           'maxnum': data.length
            };

            var se_userid = window.localStorage.getItem('myid');
            get_data.se_userid = se_userid;

            var op_type = $("#s_op_type").val();
            if(op_type!=-1){
                get_data.op_type = op_type;
            }

            var start_time = $("#start_time").val();
            var end_time = $("#end_time").val();

            if(start_time && end_time){
                get_data.start_time = start_time;
                get_data.end_time = end_time;
            }

            $.ajax({
	            url: '/channel/v1/api/training_op_list',
	            type: 'GET',
	            dataType: 'json',
	            data: get_data,
	            success: function(data) {
                    var respcd = data.respcd;
                    if(respcd != '0000'){
                        $processing = $("#trainBuyerList_processing");
                        $processing.css('display', 'none');
                        var resperr = data.resperr;
                        var respmsg = data.respmsg;
                        var msg = resperr ? resperr : respmsg;
                        toastr.warning(msg);
                        return false;
                    }
	                detail_data = data.data;
	                num = detail_data.num;
	                callback({
	                    recordsTotal: num,
	                    recordsFiltered: num,
	                    data: detail_data.info
	                });
	            },
	            error: function(data) {
	            }
            });
        },
		'columns': [
            { data: 'buyer' },
            { data: 'seller' },
            { data: 'category' },
            { data: 'op_type' },
            { data: 'orderno' },
            { data: 'training_times' },
            { data: 'training_amt' },
            { data: 'op_name' },
            { data: 'status' },
            { data: 'create_time' },
            { data: 'update_time' },
            { data: 'remark' }
		],
        'oLanguage': {
            'sProcessing': '<span style="color:red;">加载中....</span>',
            'sLengthMenu': '每页显示_MENU_条记录',
            "sInfo": '显示 _START_到_END_ 的 _TOTAL_条数据',
            'sInfoEmpty': '没有匹配的数据',
            'sZeroRecords': '没有找到匹配的数据',
            'oPaginate': {
                'sFirst': '首页',
                'sPrevious': '前一页',
                'sNext': '后一页',
                'sLast': '尾页'
            }
        }
    });

    $("#training_buyer").click(function(){
        $("#trainBuyerCreateForm").resetForm();
        var get_data = {};
        var se_userid = window.localStorage.getItem('myid');
        get_data.se_userid = se_userid;
        get_data.userid = se_userid;
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
                }
                else {
                    var ch_data = data.data.chn_data;
                    var training_amt_per = ch_data.training_amt_per;
                    training_amt_per = (training_amt_per / 100).toFixed(2);
                    var channel_id = ch_data.chnid;
                    $("#chnid").text(channel_id);
                    $("#channel_training_amt_per").val(training_amt_per);
                    $("#trainBuyerCreateModal").modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
                return false;
            }
        });
    });

    $("#trainBuyerSearch").click(function(){
        $('#trainBuyerList').DataTable().draw();
    });

    $("#trainBuyerCreateSubmit").click(function(){
        var post_url = '/channel/v1/api/channel_buy_order';
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        var training_times = $('#training_times').val();
        var training_amt = $('#training_amt').val() * 100;
        var channel_id = $("#chnid").text();
        var ch_training_amt_per = $("#channel_training_amt_per").val();

        post_data.busicd = "CHAN_BUY";
        post_data.channel_id = channel_id;
        post_data.training_times = training_times;
        post_data.training_amt = parseInt(training_amt.toFixed(2));
        post_data.ch_training_amt_per = parseInt((ch_training_amt_per * 100).toFixed(2));

        $.ajax({
            url: post_url,
            type: 'POST',
            data: post_data,
            dataType: 'json',
            success: function(data) {
                var respcd = data.respcd;
                if(respcd != '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                }
                else {
                    $('#trainBuyerCreateForm').resetForm();
                    $('#trainBuyerCreateModal').modal('hide');
                    toastr.success('新增成功');
                    $('#trainBuyerList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $("#training_allocate").click(function () {

        $("#trainAllocateCreateForm").resetForm();

        var get_data = {};
        var se_userid = window.localStorage.getItem('myid');
        get_data.se_userid = se_userid;

        $.ajax({
            url: '/channel/v1/api/chan_store_list',
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
                }
                else {
                    var c_store_name = $("#store_name");
                    for(var i=0; i<data.data.length; i++){
                        var store_id = data.data[i].id;
                        var store_name = data.data[i].store_name;
                        var training_amt_per = data.data[i].training_amt_per;
                        store_id = store_id+'|'+training_amt_per;
                        var option_str = $('<option value='+store_id+'>'+store_name+'</option>');
                        option_str.appendTo(c_store_name);
                        if(i==0){
                            var st_training_amt_per = (training_amt_per / 100).toFixed(2);
                            $("#a_store_training_amt_per").val(st_training_amt_per);
                        }
                    }
                    $("#trainAllocateCreateModal").modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
                return false;
            }
        });

    });

    $("#store_name").change(function () {
        var st_val = $("#store_name").val();
        var st_training_amt_per = st_val.split('|')[1];
        st_training_amt_per = (st_training_amt_per / 100).toFixed(2);
        $("#a_store_training_amt_per").val(st_training_amt_per);
        $("#a_training_times").val('');
        $("#a_training_amt").val('');
    })


    $("#trainAllocateCreateSubmit").click(function(){
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        var st_val = $("#store_name").val();
        var store_id = st_val.split('|')[0];
        var st_training_amt_per = st_val.split('|')[1];
        var training_times = $("#a_training_times").val();
        var training_amt = $("#a_training_amt").val();
        var remark = $("#remark").val();

        post_data.store_id = store_id;
        post_data.store_training_amt_per = st_training_amt_per;
        post_data.training_times = training_times;
        post_data.training_amt = training_amt * 100;
        post_data.remark = remark;
        post_data.busicd = "CHAN_ALLOT_TO_STORE";

        $.ajax({
            url: '/channel/v1/api/channel_allot_to_store_order',
            type: 'POST',
            dataType: 'json',
            data: post_data,
            success: function(data){
                var respcd = data.respcd;
                if(respcd != '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                }
                else {
                    toastr.success('分配成功');
                    $("#trainAllocateCreateModal").modal('hide');
                    $('#trainBuyerList').DataTable().draw();
                }
            },
            error: function(data){
            }
        });

    });
});
