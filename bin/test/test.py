#coding: utf-8

import json
import hashlib
import unittest
from zbase.base import logger
from zbase.base.http_client import RequestsClient
from zbase.server.client import HttpClient

log = logger.install('stdout')

class TestUyuChannel(unittest.TestCase):

    def setUp(self):
        self.url = ''
        self.send = {}
        self.host = '127.0.0.1'
        self.port = 8085
        self.timeout = 2000
        self.server = [{'addr':(self.host, self.port), 'timeout':self.timeout},]
        self.client = HttpClient(self.server, client_class = RequestsClient)
        self.headers = {'cookie': 'sessionid=532a46c8-ed73-448c-b01a-b28229772dbf'}


    @unittest.skip("skipping")
    def test_login(self):
        self.url = '/channel/v1/api/login'
        self.send = {
            "mobile": "13802438730",
            "password": hashlib.md5("438730").hexdigest()
        }
        ret = self.client.post(self.url, self.send)
        log.info(ret)
        print '--headers--'
        print self.client.client.headers
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_vcode(self):
        self.url = '/channel/v1/api/sms_send'
        self.send = {"mobile": "13802438730"}
        ret = self.client.post(self.url, self.send)
        log.info(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_vcode_verify(self):
        self.url = '/channel/v1/api/passwd_change'
        self.send = {
            "mobile": "13802438730",
            "vcode":"0027",
            "password": hashlib.md5("438730").hexdigest()
        }
        ret = self.client.post(self.url, self.send)
        log.info(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_register(self):
         self.url = '/channel/v1/api/store_create'
         self.send = {
            "se_userid": 1560,

            "login_name": "13988888884",
            "phone_num": "13988888884",
            "channel_name": "门店8884",
            "email": "sky@xxx.com",
            "org_code": "xxxxxx1111111111",
            "license_id": "xxxxxx11111111111",
            "legal_person": "李四",
            "business": "大富豪",
            "front_business": "岁月",
            "account_name": "天天",
            "bank_name": "建设银行",
            "bank_account": "78878878787878787878",
            "contact_name": "天天",
            "contact_phone": "15882895994",
            "contact_email": "sky@xxxx.com",
            "address": "成都天府新区",

            "training_amt_per": 100,
            "divide_percent": 0.45,
            "is_prepayment": 0,
            "store_contacter": "张三",
            "store_mobile": "15882895994",
            "store_addr": "天府新区",
            "store_name": "SkyStore",
            "store_type": 0,
         }
         ret = self.client.post(self.url, self.send, headers=self.headers)
         log.info(ret)
         respcd = json.loads(ret).get('respcd')
         self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_change(self):
         self.url = '/channel/v1/api/store'
         self.send = {
            "se_userid": 1560,
            "userid": 51568,

            "login_name": "13988888884",
            "phone_num": "13988888884",
            "channel_name": "大中国四川成都牛逼大渠道",
            "email": "lanwenhong@xxx.com",
            "org_code": "xxxxxx1111111111",
            "license_id": "xxxxxx11111111111",
            "legal_person": "李四",
            "business": "大富豪",
            "front_business": "岁月",
            "account_name": "天天",
            "bank_name": "建设银行",
            "bank_account": "78878878787878787878",
            "contact_name": "天天",
            "contact_phone": "15882895994",
            "contact_email": "lanwenhong@xxxx.com",
            "address": "成都天府新区",

            "training_amt_per": 100,
            "divide_percent": 0.95,
            "is_prepayment": 0,
            "store_contacter": "王麻子",
            "store_mobile": "15882895994",
            "store_addr": "天府新区",
            "store_name": "SkyCook@",
            "store_type": 0,
         }
         ret = self.client.post(self.url, self.send, headers=self.headers)
         log.info(ret)
         respcd = json.loads(ret).get('respcd')
         self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_list(self):
        self.url = '/channel/v1/api/storeinfo_pagelist'
        self.send = {
            "se_userid": 1560,
            "page": 1,
            "maxnum": 10,
            # "channel_name": "",
            # "store_name": "",
            # "is_valid": 0
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_device_list(self):
        self.url = '/channel/v1/api/devinfo_pagelist'
        self.send = {
            "se_userid": 1560,
            "page": 1,
            "maxnum": 10,
            # "store_name": "",
            # "serial_number": "",
            # "status": 0
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')


    @unittest.skip("skipping")
    def test_store_set_state(self):
        self.url = '/channel/v1/api/store_set_state'
        self.send = {"se_userid": 1560, "userid": 51568, "state": 1}
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_query(self):
        self.url = '/channel/v1/api/store'
        self.send = {"userid": 51568, "se_userid": 1560}
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_bind_eyesight(self):
        self.url = '/channel/v1/api/store_eye'
        self.send = {
            # "userid": 1230,   #视光师傅
            # "userid": 1268,   #消费者
            "userid": 1197,   #门店
            "store_id": 81,
            "channel_id": 102,
            "se_userid": 1560
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_query_eyesight_info(self):
        self.url = '/channel/v1/api/store_eye'
        self.send = {
            "se_userid": 1560,
            # "phone_num": "13475481268"  # 视光师
            # "phone_num": "13802438718"  # 消费者
            "phone_num": "13000000003"  # 门店
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_channel_store_map(self):
        self.url = '/channel/v1/api/chan_store_list'
        self.send = {
            "se_userid": 1560,
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_name_list(self):
        self.url = '/channel/v1/api/store_name_list'
        self.send = {"se_userid": 1560}
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_chan_buy_order(self):
        self.url = "/channel/v1/api/channel_buy_order"
        self.send = {
            "se_userid": 1560,
            "busicd": "CHAN_BUY",
            "channel_id": 102,
            "rule_id": 1,
            "training_times": 500,
            "training_amt": 2000000,
            'ch_training_amt_per': 2243
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_chan_allot_to_store_order(self):
        self.url = "/channel/v1/api/channel_allot_to_store_order"
        self.send = {
            "se_userid": 1560,
            "busicd": "CHAN_ALLOT_TO_STORE",
            "store_id": 81,
            "training_times": 100,
            "training_amt": 100*100,
            "store_training_amt_per": 100,
            "remark": "给门店81分配100次",
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        respcd = json.loads(ret).get('respcd')



    @unittest.skip("skipping")
    def test_order_cancel(self):
        self.url = "/channel/v1/api/order_cancel"
        self.send = {
            "se_userid": 1560,
            "order_no": "2017041501586144"
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_create_device(self):
        self.url = "/channel/v1/api/create_device"
        self.send = {
            "se_userid": 1560,
            "device_name": "设备_0415",
            "hd_version": "hd_v1",
            "blooth_tag": "bt_v1",
            "scm_tag": "sm_v1",
            "status": 0,
            "store_id": 81
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_allocate_device(self):
        self.url = "/channel/v1/api/allocate_device"
        self.send = {
            "se_userid": 1560,
            "serial_number": 146,
            "channel_id": 102,
            "store_id": 80
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_edit_device(self):
        self.url = "/channel/v1/api/edit_device"
        self.send = {
            "se_userid": 1560,
            "device_name": "设备_0415",
            "hd_version": "hd_v1.1.5",
            "blooth_tag": "bt_v1.1.5",
            "scm_tag": "sm_v1.1.5",
            "status": 0,
            "serial_number": 146
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')



    @unittest.skip("skipping")
    def test_settle_list(self):
        self.url = "/channel/v1/api/settle_list"
        self.send = {
            "se_userid": 1560,
            "page": 1,
            "maxnum": 10,
            # "start_time": "",
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_train_op_list(self):
        self.url = "/channel/v1/api/training_op_list"
        self.send = {
            "se_userid": 1560,
            "page": 1,
            "maxnum": 10,
            # "op_type": 0,
            # "start_time": "",
            # "end_time": "",
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_train_use_list(self):
        self.url = "/channel/v1/api/training_use_list"
        self.send = {
            "se_userid": 1560,
            "page": 1,
            "maxnum": 10,
            # "store_name": "",
            # "consumer_id": "",
            # "eyesight": "",
            # "create_time": "",
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')



    @unittest.skip("skipping")
    def test_rules_list(self):
        self.url = "/channel/v1/api/rules_list"
        self.send = {
            "se_userid": 1560,
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_bind_eyesight_info_list(self):
        self.url = "/channel/v1/api/eyesight_info"
        self.send = {
            "se_userid": 1560,
            "channel_id": 102,
            "store_id": 81,
            "userid": 51564  # 无用单接口需要传
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_store_unbind_eyesight(self):
        self.url = "/channel/v1/api/eyesight_info"
        self.send = {
            "se_userid": 1560,
            "channel_id": 102,
            "store_id": 81,
            "userid": 1228 #需要解绑的视光师userid
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    #@unittest.skip("skipping")
    def test_register_eyesight(self):
        self.url = "/channel/v1/api/register_eye"
        self.send = {
            "se_userid": 1560,
            "mobile": "13928478195",
            "nick_name": "视光师8195",
            "username": "blue8915",
            "email": "blue8915@ccc.com"
        }
        ret = self.client.post(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')


    @unittest.skip("skipping")
    def test_remain_times(self):
        self.url = "/channel/v1/api/remain_times"
        self.send = {
            "se_userid": 1560,
        }
        ret = self.client.get(self.url, self.send, headers=self.headers)
        log.debug(ret)
        respcd = json.loads(ret).get('respcd')
        self.assertEqual(respcd, '0000')

suite = unittest.TestLoader().loadTestsFromTestCase(TestUyuChannel)
unittest.TextTestRunner(verbosity=2).run(suite)
