$(document).ready(function(){


    var channel_is_prepayment = window.localStorage.getItem('is_prepayment');
    if(channel_is_prepayment == 1){
        $("#training_buyer").attr('disabled', true);
    }

    get_remain_times();

    $.validator.addMethod("CheckTrainingTimes", function(value, element, param) {
        var customMsg = '';
        var result = true;
        var remain_times = parseInt($("#remain_times").text());
        if(remain_times<=0){
           customMsg = '该渠道最大次数已不能分配:' + remain_times;
           result = false;
        } else {
            if(value <= 0){
                customMsg = "次数需大于0";
                result = false;
            }
            else {
                if(value > remain_times){
                    customMsg = "请输入介于1和"+remain_times+"的数";
                    result = false;
                }
                else{
                     result =true;
                }
            }
        }
        $.validator.messages.CheckTrainingTimes = customMsg;
        return result;
    });


    $.validator.addMethod("CheckMoney", function(value, element) {
        var length = value.length;
        var money = /^[0-9]+(.[0-9]{1,2})?$/;
        return this.optional(element) || (length && money.test(value) && parseFloat(value) > 0);
    }, "请正确填写您的总金额");

    /*
    $("#training_times").bind('input propertychange', function () {
        var amount_per = 0;
        amount_per = $('#channel_training_amt_per').val();
        $('#training_amt').val(($(this).val() * amount_per).toFixed(2));
    });
    */

    /*
    $("#a_training_times").bind('input propertychange', function () {
        var amount_per = $('#a_store_training_amt_per').val();
        $('#a_training_amt').val(($(this).val() * amount_per).toFixed(2));
    });
    */

    $.validator.addMethod("isYuan", function(value, element) {
        var length = value.length;
        var yuan  = /^([0-9]{1,6})\.([0-9]{1,2})$/;
        return this.optional(element) || (length && yuan.test(value) && parseFloat(value) > 0);
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
        'columnDefs': [
            {
                targets: 0,
                render: function(data, type, full){
                    var tmp = '';
                    var busicd = full.busicd;
                    var buyer = full.buyer;
                    var buyer_id = full.buyer_id;

                    if(busicd === 'ORG_ALLOT_TO_CHAN' || busicd === 'CHAN_BUY') {
                        tmp = '<span class="buyer-name" data-buyer_id='+buyer_id+'>'+buyer+'</span>';
                    } else {
                        tmp = '<span>'+buyer+'</span>';
                    }
                    return tmp;
                }
            },
            {
                targets: 12,
                data: '操作',
                render: function(data, type, full) {
                    var orderno = full.orderno;
                    var is_valid = full.is_valid;
                    var busicd = full.busicd;
                    var create_time = full.create_time;
                    create_time = Date.parse(create_time.replace(/-/g,"/"));
                    var now = new Date();
                    var compare_time = new Date(Year=now.getFullYear(), Months=now.getMonth(), Day=now.getDate(), Hours=0, Minutes=0, senconds=0);
                    if(busicd === "CHAN_ALLOT_TO_STORE" && is_valid === 0 && create_time >= compare_time){
                        var cancel = '<input type="button" class="btn btn-primary btn-sm order-cancel" data-busicd='+busicd+' data-orderno='+orderno+' value=' + '撤销' + '>';
                    } else {
                        var cancel = '<input type="button" class="btn btn-primary btn-sm order-cancel" data-busicd='+busicd+' disabled data-orderno='+orderno+' value=' + '撤销' + '>';
                    }

                    return cancel;
                }
            }
        ],
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
        $("label.error").remove();
        rules_select();
        get_channel_info();
    });

    $("#trainBuyerSearch").click(function(){
        $('#trainBuyerList').DataTable().draw();
    });

    $("#trainBuyerCreateSubmit").click(function(){
        var buyer_vt = $("#trainBuyerCreateForm").validate({
            rules: {
                training_times: {
                    required: true,
                    //range:[10, 100],
                    digits: true,
                    //CheckTrainingTimes: "#training_times"
                },
                remark: {
                    required: false,
                    maxlength: 256
                }
            },
            messages: {
                training_times: {
                    required: '请输入购买的训练次数',
                    //range: $.validator.format("请输入一个介于 {0} 和 {1} 之间的值")
                    digits: "只能输入整数"
                },
                remark: {
                    maxlength: $.validator.format("请输入一个长度最多是 {0} 的字符")
                }
            }
        });

        var ok = buyer_vt.form();
        if(!ok){
            return false;
        }

        var post_url = '/channel/v1/api/channel_buy_order';
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        var training_times = $('#training_times').val();
        var training_amt = $('#training_amt').val() * 100;
        var channel_id = $("#chnid").text();
        var ch_training_amt_per = $("#channel_training_amt_per").val();
		var remark = $("#b_remark").val();
		var rule_id = $(".c_rules").val();

        post_data.busicd = "CHAN_BUY";
		post_data.remark = remark;
        post_data.channel_id = channel_id;
        post_data.training_times = training_times;
        post_data.training_amt = parseInt(training_amt.toFixed(2));
        post_data.ch_training_amt_per = parseInt((ch_training_amt_per * 100).toFixed(2));
        post_data.rule_id = rule_id;

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
        $("label.error").remove();
        $("#store_name").html('');

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
    });

    $(document).on('click', '.order-cancel', function(){
        var orderno = $(this).data('orderno');
        var busicd = $(this).data('busicd');
        var se_userid = window.localStorage.getItem('myid');
        if(!orderno){
            toastr.warning('请确认订单号');
            return false;
        }
        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.order_no = orderno;
        post_data.busicd = busicd;

        $.confirm({
            title: '请确认取消',
            content: '撤销将把次数从对方扣回，确认是否撤销？',
            type: 'blue',
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'btn-red',
                    action: function() {
                        $.ajax({
                            url: '/channel/v1/api/order_cancel',
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
                                    toastr.success('撤销成功');
                                    $('#trainBuyerList').DataTable().draw();
                                }
                            },
                            error: function(data) {
                                toastr.warning('请求异常');
                            }
                        });
                    }
                },
                cancel: {
                    text: '取消',
                    action: function() {
                        console.log('clicked cancel');
                    }
                }
            }
        });
    });

    $(document).on('click', '.buyer-name', function(){
        $("#channel_info").resetForm();
        var buyer_id = $(this).data('buyer_id');
        var se_userid = window.localStorage.getItem('myid');
        var get_data = {};
        get_data.userid = buyer_id;
        get_data.se_userid = se_userid;
        $.ajax({
            url: '/channel/v1/api/channel',
            type: 'GET',
            data: get_data,
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
                    var chn_data = data.data.chn_data;
                    var profile = data.data.profile;
                    var u_data = data.data.u_data;
                    // console.dir(chn_data);
                    // console.dir(profile);
                    // console.dir(u_data);
                    $("#channel_name").text(chn_data.channel_name);
                    $("#contact_name").text(profile.contact_name);
                    $("#contact_phone").text(profile.contact_phone);
                    $("#v_remain_times").text(chn_data.remain_times);
                    $("#channelInfoModal").modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
        console.log('buyer_id: '+ buyer_id);
    });

    $("#trainAllocateCreateSubmit").click(function(){
        var remain_times = parseInt($("#remain_times").text());
        var allocate_vt = $("#trainAllocateCreateForm").validate({
            rules: {
                training_times: {
                    required: true,
                    //range:[1, remain_times],
                    digits: true,
                    CheckTrainingTimes: "#a_training_times"
                },
                remark: {
                    required: false,
                    maxlength: 256
                },
                a_training_amt: {
                    required: true,
                    CheckMoney: "#a_training_amt"
                }
            },
            messages: {
                training_times: {
                    required: '请输入分配的训练次数',
                    digits: "只能输入整数"
                },
                remark: {
                    maxlength: $.validator.format("请输入一个长度最多是 {0} 的字符")
                },
                a_training_amt: {
                    required: '请输入总金额'
                }
            }
        });

        var ok = allocate_vt.form();
        if(!ok){
            return false;
        }

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
        post_data.training_amt = parseInt(training_amt * 100);
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
                    get_remain_times();
                }
            },
            error: function(data){
            }
        });

    });

    $(".c_rules").change(function () {
        var total_amt = $(".c_rules option:selected").data('total_amt');
        var training_times = $(".c_rules option:selected").data('training_times');
        var description = $(".c_rules option:selected").data('description');
        $("#training_times").val(training_times).attr("readonly", "readonly");
        $("#training_amt").val(total_amt).attr("readonly", "readonly");
        $("#description").val(description).attr("readonly", "readonly");
    })
});


function get_remain_times(){
    var get_data = {};
    var se_userid = window.localStorage.getItem('myid');
    get_data.se_userid = se_userid;

    $.ajax({
        url: '/channel/v1/api/remain_times',
        type: 'GET',
        dataType: 'json',
        data: get_data,
        success: function(data){
            var respcd = data.respcd;
            if(respcd != '0000'){
                var resperr = data.resperr;
                var respmsg = data.respmsg;
                var msg = resperr ? resperr : respmsg;
                toastr.warning(msg);
            }
            else {
                var info = data.data;
                var remain_times = info.remain_times;
                $("#remain_times").text(remain_times);
            }
        },
        error: function(data){
            toastr.warning('获取剩余次数异常');
        }
    });
}


function rules_select() {

    $('.c_rules').html('');
    var get_data = {};
    var se_userid = window.localStorage.getItem('myid');
    get_data['se_userid'] = se_userid;

    $.ajax({
        url: '/channel/v1/api/chan_rule_info',
        type: 'GET',
        data: get_data,
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
                if(data.data.length==0){
                    return false;
                }  else {

                    var c_rules = $("#c_rules");
                    for(var i=0; i<data.data.length; i++){
                        var rule_id = data.data[i].rule_id;
                        var rule_name = data.data[i].name;
                        var rule_total_amt = data.data[i].total_amt;
                        var rule_training_times = data.data[i].training_times;
                        var rule_description = data.data[i].description;

                        var option_str = $('<option value='+rule_id+' data-total_amt='+rule_total_amt+' data-training_times='+rule_training_times+ ' data-description='+rule_description+'>'+rule_name+'</option>');
                        option_str.prependTo(c_rules);
                    }
                    $("#c_rules option:first").prop("selected", 'selected');
                    var total_amt = $(".c_rules option:selected").data('total_amt');
                    var training_times = $(".c_rules option:selected").data('training_times');
                    var description = $(".c_rules option:selected").data('description');
                    $("#training_times").val(training_times).attr("readonly", "readonly");
                    $("#training_amt").val(total_amt).attr("readonly", "readonly");
                    $("#description").val(description).attr("readonly", "readonly");
                }
            }
        },
        error: function(data) {
            toastr.warning('请求异常');
        }
    });

}


function get_channel_info() {
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
}
