$(document).ready(function(){
    search_source();

    $('#deviceList').DataTable({
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
        "fnInitComplete": function(){
            var $deviceList_length = $("#deviceList_length");
            var $deviceList_paginate = $("#deviceList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $deviceList_paginate.addClass('col-md-8');
            $deviceList_length.addClass('col-md-4');
            $deviceList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var get_data = {
	           'page': Math.ceil(data.start / data.length) + 1,
	           'maxnum': data.length
            };

            var serial_number = $("#s_device_serial_nu").val();
            if(serial_number){
                get_data.serial_number = serial_number;
            }

            var store_name = $('#s_store_name').val();
            if(store_name){
                get_data.store_name = store_name;
            }

            var status = $('#s_status').val();
            if(status!=-1){
                get_data.status = status;
            }

            var se_userid = window.localStorage.getItem('myid');
            get_data.se_userid = se_userid;
            get_data.userid = se_userid;

            $.ajax({
	            url: '/channel/v1/api/devinfo_pagelist',
	            type: 'GET',
	            dataType: 'json',
	            data: get_data,
	            success: function(data) {
                    var respcd = data.respcd;
                    if(respcd != '0000'){
                        $processing = $("#deviceList_processing");
                        $processing.css('display', 'none');
                        var resperr = data.resperr;
                        var respmsg = data.respmsg;
                        var msg = resperr ? resperr : respmsg;
                        toastr.warning(msg);
                        return false;
                    }
	                var detail_data = data.data;
	                var num = detail_data.num;

	                callback({
	                    recordsTotal: num,
	                    recordsFiltered: num,
	                    data: detail_data.info
	                });
	            },
	            error: function(data) {
	                toastr.warning('请求数据异常');
	            }

            });
        },
        'columnDefs': [
            {
                targets: 9,
                data: '操作',
                render: function(data, type, full) {
                    var device_name = full.device_name;
                    var serial_number = full.serial_number;
                    var hd_version = full.hd_version;
                    var blooth_tag = full.blooth_tag;
                    var scm_tag = full.scm_tag;
                    var is_valid = full.is_valid;
                    var store_id = full.store_id;
                    var allocate = '<input type="button" class="btn btn-primary btn-sm device-allocate" data-serial_number='+serial_number+' data-device_name='+device_name+ ' data-store_id='+ store_id +' value=' + '分配' + '>';
                    var edit = '<input type="button" class="btn btn-primary btn-sm device-edit" data-serial_number='+serial_number+' data-device_name='+device_name+ ' data-hd_version='+ hd_version +' data-blooth_tag='+ blooth_tag +' data-scm_tag='+scm_tag+' data-is_valid='+ is_valid +' value=' + '修改' + '>';
                    return allocate + edit;
                }
            }
        ],
		'columns': [
				{ data: 'id' },
				{ data: 'device_name' },
				{ data: 'serial_number' },
				{ data: 'hd_version' },
				{ data: 'blooth_tag' },
				{ data: 'scm_tag' },
				{ data: 'status' },
				{ data: 'store_name' },
				{ data: 'create_time' }
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

    $("#deviceCreate").click(function(){
        $("#deviceCreateForm").resetForm();
        do_first_select('#store_name', '');
        $("label.error").remove();
        $("#deviceCreateModal").modal();
    });

    $("#deviceSearch").click(function(){
        $('#deviceList').DataTable().draw();
    });

    $("#deviceCreateSubmit").click(function(){
        var device_vt = $('#deviceCreateForm').validate({
            rules: {
                device_name: {
                    required: true,
                    maxlength: 256
                },
                hd_version: {
                    required: true,
                    maxlength: 128
                },
                blooth_tag: {
                    required: true,
                    maxlength: 128
                }
            },
            messages: {
                device_name: {
                    required: '请输入设备名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                hd_version: {
                    required: '请输入硬件版本',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                blooth_tag: {
                    required: '请输入蓝牙版本',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                }
            }
        });

        var ok = device_vt.form();
        if(!ok){
            return false;
        }

        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.device_name = $('#device_name').val();
        post_data.hd_version = $('#hd_version').val();
        post_data.blooth_tag = $('#blooth_tag').val();
        post_data.scm_tag = $('#scm_tag').val();
        post_data.status = $('#status').val();
        var store_id = $('#store_name').val();
		if(store_id){
            post_data.store_id = store_id;
		}
        $.ajax({
            url: '/channel/v1/api/create_device',
            type: 'POST',
            dataType: 'json',
            data: post_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd != '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                }
                else {
                    toastr.success('新建设备成功');
                    $("#deviceCreateModal").modal('hide');
                    $('#deviceList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $('#channel_name').change(function () {
        var get_data = {};
        var channel_id = $('#channel_name').val();
        var se_userid = window.localStorage.getItem('myid');
        get_data['se_userid'] = se_userid;
        get_data['channel_id'] = channel_id;
        $.ajax({
            url: '/channel_op/v1/api/chan_store_list',
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
                    var c_store_name = $('#store_name');
                    c_store_name.html('');
                    for(var i=0; i<data.data.length; i++){
                        var store_id = data.data[i].id;
                        var store_name = data.data[i].store_name;
                        var option_str = $('<option value='+store_id+'>'+store_name+'</option>');
                        option_str.appendTo(c_store_name);
                    }
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $(document).on('click', '.device-allocate', function(){
        $('#a_store_name').html('');
        var device_name = $(this).data('device_name');
        var serial_number = $(this).data('serial_number');
        var store_id = $(this).data('store_id');
        $('#deviceAllocateForm').resetForm();
        $('#a_device_name').val(device_name);
        $('#a_serial_number').val(serial_number);
        do_first_select('#a_store_name', store_id);
        $('#deviceAllocate').modal();
    });

    $('#a_channel_name').change(function () {
        var get_data = {};
        var channel_id = $('#a_channel_name').val();
        var se_userid = window.localStorage.getItem('myid');
        get_data['se_userid'] = se_userid;
        get_data['channel_id'] = channel_id;
        $.ajax({
            url: '/channel_op/v1/api/chan_store_list',
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
                    var c_store_name = $('#a_store_name');
                    c_store_name.html('');
                    for(var i=0; i<data.data.length; i++){
                        var store_id = data.data[i].id;
                        var store_name = data.data[i].store_name;
                        var option_str = $('<option value='+store_id+'>'+store_name+'</option>');
                        option_str.appendTo(c_store_name);
                    }
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $('#deviceAllocateSubmit').click(function () {
        var serial_number = $('#a_serial_number').val();
        var store_id = $('#a_store_name').val();
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.serial_number = serial_number;
        if(store_id){
            post_data.store_id = store_id;
        }

        $.ajax({
            url: '/channel/v1/api/allocate_device',
            type: 'POST',
            dataType: 'json',
            data: post_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd != '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                }
                else {
                    toastr.success('设备分配成功');
                    $("#deviceAllocate").modal('hide');
                    $('#deviceList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $(document).on('click', '.device-edit', function () {
        $("label.error").remove();
        $('#deviceEditForm').resetForm();
        var device_name = $(this).data('device_name');
        var serial_number = $(this).data('serial_number');
        var hd_version = $(this).data('hd_version');
        var blooth_tag = $(this).data('blooth_tag');
        var scm_tag = $(this).data('scm_tag');
        var is_valid = $(this).data('is_valid');

        $('#e_serial_number').text(serial_number);
        $('#e_device_name').val(device_name);
        $('#e_hd_version').val(hd_version);
        $('#e_blooth_tag').val(blooth_tag);
        $('#e_scm_tag').val(scm_tag);
        $('#e_status').val(is_valid);
        $('#deviceEditModal').modal();
    });

    $('#deviceEditSubmit').click(function () {
        var device_edit_vt = $('#deviceEditForm').validate({
            rules: {
                e_device_name: {
                    required: true,
                    maxlength: 256
                },
                e_hd_version: {
                    required: true,
                    maxlength: 128
                },
                e_blooth_tag: {
                    required: true,
                    maxlength: 128
                }
            },
            messages: {
                e_device_name: {
                    required: '请输入设备名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                e_hd_version: {
                    required: '请输入硬件版本',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                e_blooth_tag: {
                    required: '请输入蓝牙版本',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                }
            }
        });

        var ok = device_edit_vt.form();
        if(!ok){
            return false;
        }

        var device_name = $('#e_device_name').val();
        var hd_version = $('#e_hd_version').val();
        var blooth_tag = $('#e_blooth_tag').val();
        var scm_tag = $('#e_scm_tag').val();
        var status = $('#e_status').val();
        var serial_number = $('#e_serial_number').text();
        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data['se_userid'] = se_userid;
        post_data['serial_number'] = serial_number;
        post_data['status'] = status;
        post_data['scm_tag'] = scm_tag;
        post_data['blooth_tag'] = blooth_tag;
        post_data['hd_version'] = hd_version;
        post_data['device_name'] = device_name;


        $.ajax({
            url: '/channel/v1/api/edit_device',
            type: 'POST',
            dataType: 'json',
            data: post_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd != '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                }
                else {
                    toastr.success('修改设备成功');
                    $("#deviceEditModal").modal('hide');
                    $('#deviceList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    })

});


function do_first_select(store_name_tag_id, record_store_id) {
    $(store_name_tag_id).html('');
    var get_data = {};
    var se_userid = window.localStorage.getItem('myid');
    get_data['se_userid'] = se_userid;
    $.ajax({
        url: '/channel/v1/api/chan_store_list',
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
                var c_store_name = $(store_name_tag_id);
                var first_str = $('<option value="">'+'无'+'</option>');
                first_str.appendTo(c_store_name);
                for(var i=0; i<data.data.length; i++){
                    var store_id = data.data[i].id;
                    var store_name = data.data[i].store_name;
                    var option_str = $('<option value='+store_id+'>'+store_name+'</option>');
                    option_str.appendTo(c_store_name);
                }
                if(record_store_id){
                    $(store_name_tag_id).val(record_store_id);
                }
            }
        },
        error: function(data) {
            toastr.warning('请求异常');
        }
    });
}

function search_source() {
    var get_data = {};
    var se_userid = window.localStorage.getItem('myid');
    get_data['se_userid'] = se_userid;
    get_data['userid'] = se_userid;
    $.ajax({
        url: '/channel/v1/api/store_name_list',
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
                $('#s_store_name').typeahead({source: data.data});
            }
        },
        error: function(data) {
            toastr.warning('请求异常');
        }
    });
}
