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
        var order_type = $('.c_busicd').val();
        if(order_type == 'ORG_ALLOT_TO_CHAN') {
            amount_per = $('.c_channel_name').val().split('|')[1];
            amount_per = (amount_per / 100).toFixed(2);
        }
        else {
            amount_per = $('.c_store_name').val().split('|')[1];
            amount_per = (amount_per / 100).toFixed(2);
        }
        $('#training_amt').val(($(this).val() * amount_per).toFixed(2));
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
        $("#trainBuyerCreateModal").modal();
    });

    $("#trainBuyerSearch").click(function(){
        $('#trainBuyerList').DataTable().draw();
    });

    $("#trainBuyerCreateSubmit").click(function(){
        var post_url = '';
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        var training_times = $('#training_times').val();
        var training_amt = $('#training_amt').val() * 100;

        post_data.training_times = training_times;
        post_data.training_amt = parseInt(training_amt.toFixed(2));

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
        $("#trainAllocateCreateModal").modal();
    })

});
