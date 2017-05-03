# -*- coding: utf-8 -*-
from zbase.base.dbpool import get_connection_exception


def gen_ret_range(page, maxnum):
    start = maxnum * page - maxnum
    end = start + maxnum
    return start, end


def gen_offset(page, maxnum):
     limit = maxnum
     offset = (page -1) * maxnum
     return offset, limit


def channel_name_to_id(name):
    data = []
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select(table='channel', fields='id', where={'channel_name': name});
        if not ret:
            return data
        for item in ret:
            data.append(item['id'])

        return data

def store_name_to_id(name):
    data = []
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select(table='stores', fields='id', where={'store_name': name});
        if not ret:
            return data
        for item in ret:
            data.append(item['id'])

        return data

def mobile_to_id(phone_num):
    data = []
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select(table='auth_user', fields='id', where={'phone_num': phone_num});
        if not ret:
            return data
        for item in ret:
            data.append(item['id'])

        return data


def nickname_to_id(name):
    data = []
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select(table='auth_user', fields='id', where={'nick_name': name})
        if not ret:
            return data
        for item in ret:
            data.append(item['id'])

        return data


def channel_id_to_name(channel_id):
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select_one(table='channel', fields='channel_name', where={'id': channel_id})
        return ret


def store_id_to_name(store_id):
    with get_connection_exception('uyu_core') as conn:
        ret = conn.select_one(table='stores', fields='store_name', where={'id': store_id})
        return ret
