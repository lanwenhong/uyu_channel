# -*- coding: utf-8 -*-
import traceback
from zbase.web import core
from zbase.web import template
from zbase.web.validator import with_validator_self, Field, T_REG, T_INT, T_STR
from zbase.base.dbpool import with_database
from uyubase.base.response import success, error, UAURET
from uyubase.uyu.define import UYU_USER_ROLE_SUPER, UYU_USER_STATE_OK, UYU_SYS_ROLE_CHAN
from uyubase.base.usession import uyu_check_session, uyu_check_session_for_page
from uyubase.uyu.define import UYU_SYS_ROLE_CHAN, UYU_OP_OK, UYU_OP_ERR, UYU_CHAN_MAP, UYU_DEVICE_MAP
from uyubase.base.uyu_user import UUser

import logging, datetime, time
import tools
from runtime import g_rt
from config import cookie_conf
log = logging.getLogger()

class DeviceManage(core.Handler):
    @uyu_check_session_for_page(g_rt.redis_pool, cookie_conf, UYU_SYS_ROLE_CHAN)
    def GET(self):
        self.write(template.render('device.html'))


class DeviceInfoHandler(core.Handler):

    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('store_name', T_STR, True),
        Field('serial_number', T_STR, True),
        Field('status', T_INT, True),
    ]

    def _get_handler_errfunc(self, msg):
        return error(UAURET.PARAMERR, respmsg=msg)

    @uyu_check_session(g_rt.redis_pool, cookie_conf, UYU_SYS_ROLE_CHAN)
    @with_validator_self
    def _get_handler(self, *args):
        if not self.user.sauth:
            return error(UAURET.SESSIONERR)
        try:
            data = {}
            params = self.validator.data
            curr_page = params.get('page')
            max_page_num = params.get('maxnum')
            store_name = params.get('store_name')
            serial_number = params.get('serial_number')
            status = params.get('status', None)

            self.user.load_user()
            self.user.load_profile()
            self.user.load_channel()
            self.user.channel_id = self.user.cdata['id']

            start, end = tools.gen_ret_range(curr_page, max_page_num)
            info_data = self._query_handler(store_name, serial_number, status)

            data['info'] = self._trans_record(info_data[start:end])
            data['num'] = len(info_data)
            return success(data)
        except Exception as e:
            log.warn(e)
            log.warn(traceback.format_exc())
            return error(UAURET.DATAERR)

    @with_database('uyu_core')
    def _query_handler(self, store_name=None, serial_number=None, status=None):
        where = {'channel_id': self.user.channel_id}

        keep_fields = [
            'id', 'device_name', 'hd_version', 'blooth_tag',
            'scm_tag', 'status', 'channel_id', 'store_id',
            'training_nums', 'ctime'
        ]

        other = ' order by ctime desc'

        if store_name:
            store_list = tools.store_name_to_id(store_name)
            if store_list:
                where.update({'store_id': ('in', store_list)})
            else:
                return []

        if serial_number:
            where.update({'id': serial_number})

        if status in (0, 1):
            where.update({'status': status})

        ret = self.db.select(table='device', fields=keep_fields, where=where, other=other)

        return ret

    @with_database('uyu_core')
    def _trans_record(self, data):
        if not data:
            return []

        for item in data:
            channel_ret = self.db.select_one(table='channel', fields='channel_name', where={'id': item['channel_id']})
            store_ret = self.db.select_one(table='stores', fields='store_name', where={'id': item['store_id']})
            item['channel_name'] = channel_ret.get('channel_name', '') if channel_ret else ''
            item['store_name'] = store_ret.get('store_name', '') if store_ret else ''
            item['create_time'] = item['ctime'].strftime('%Y-%m-%d %H:%M:%S')
            item['serial_number'] = item['id']
            item['is_valid'] = item['status']
            item['status'] = UYU_DEVICE_MAP.get(item['status'], '')

        return data


    def GET(self):
        try:
            data = self._get_handler()
            return data
        except Exception as e:
            log.warn(e)
            log.warn(traceback.format_exc())
            return error(UAURET.SERVERERR)


class DeviceCreateHandler(core.Handler):
    _post_handler_fields = [
        Field("se_userid", T_INT, False),
        Field('device_name',  T_STR, False),
        Field('hd_version',  T_STR, False),
        Field('blooth_tag',  T_STR, False),
        Field('scm_tag',  T_STR, True),
        Field('status',  T_INT, True),
        Field('store_id', T_INT, True),
    ]

    @uyu_check_session(g_rt.redis_pool, cookie_conf, UYU_SYS_ROLE_CHAN)
    @with_validator_self
    def _post_handler(self):
        if not self.user.sauth:
            return error(UAURET.SESSIONERR)
        uop = UUser()
        params = self.validator.data
        device_name = params.get('device_name', None)
        hd_version = params.get('hd_version', None)
        blooth_tag = params.get('blooth_tag', None)
        scm_tag = params.get('scm_tag', None)
        status = params.get('status', None)
        store_id = params.get('store_id', None)
        uop.call('load_info_by_userid', self.user.userid)
        channel_id = uop.cdata['chnid']
        op = uop.udata['phone_num']
        ret = uop.call("create_device", device_name, hd_version, blooth_tag, scm_tag, status, channel_id, store_id, None, op)
        log.debug('create_device params: %s ret: %s', params, ret)
        if ret == UYU_OP_ERR:
            return error(UAURET.REQERR)
        return success({})

    def POST(self, *args):
        ret = self._post_handler()
        self.write(ret)


class DeviceAllocateHandler(core.Handler):

    _post_handler_fields = [
        Field("se_userid", T_INT, False),
        Field('serial_number', T_INT, False),
        Field('store_id', T_INT, True),
    ]

    @uyu_check_session(g_rt.redis_pool, cookie_conf, UYU_SYS_ROLE_CHAN)
    @with_validator_self
    def _post_handler(self):
        if not self.user.sauth:
            return error(UAURET.SESSIONERR)
        params = self.validator.data
        serial_number = params.get('serial_number')
        store_id = params.get('store_id', None)

        uop = UUser()
        uop.call('load_info_by_userid', self.user.userid)
        channel_id = uop.cdata['chnid']
        ret = uop.call("allocate_device", channel_id, store_id, serial_number)
        log.debug('allocate_device params: %s ret: %s', params, ret)
        if ret == UYU_OP_ERR:
            return error(UAURET.REQERR)
        return success({})

    def POST(self, *args):
        ret = self._post_handler()
        self.write(ret)


class DeviceEditHandler(core.Handler):

    _post_handler_fields = [
        Field("se_userid", T_INT, False),
        Field('device_name',  T_STR, False),
        Field('hd_version',  T_STR, False),
        Field('blooth_tag',  T_STR, False),
        Field('scm_tag',  T_STR, True),
        Field('status',  T_INT, False, match=r'^([0-1]{1})$'),
        Field('serial_number', T_INT, False),
    ]


    @uyu_check_session(g_rt.redis_pool, cookie_conf, UYU_SYS_ROLE_CHAN)
    @with_validator_self
    def _post_handler(self):
        if not self.user.sauth:
            return error(UAURET.SESSIONERR)
        try:
            params = self.validator.data
            serial_number = params.get('serial_number')
            device_name = params.get('device_name', None)
            hd_version = params.get('hd_version', None)
            blooth_tag = params.get('blooth_tag', None)
            scm_tag = params.get('scm_tag', None)
            status = params.get('status', None)

            uop = UUser()
            ret = uop.call("edit_device", serial_number, device_name, hd_version, blooth_tag, status, scm_tag)
            log.debug('edit_device params: %s ret: %s', params, ret)
            if ret == UYU_OP_ERR:
                return error(UAURET.REQERR)
            return success({})

        except Exception as e:
            log.warn(e)
            log.warn(traceback.format_exc())
            return error(UAURET.SERVERERR)

    def POST(self, *args):
        ret = self._post_handler()
        self.write(ret)
