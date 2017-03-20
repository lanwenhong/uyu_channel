# -*- coding: utf-8 -*-
from handler import ping
from handler import login
from handler import index
from handler import overview
from handler import channel
from handler import store
from handler import device
from handler import train
from handler import settle
from handler import eyesight
urls = (
    ('/ping', ping.Ping),
    #页面
    ('^/channel/v1/page/login.html$', login.Login),
    ('^/channel/v1/page/index.html$', index.Index),
    ('^/channel/v1/page/overview.html$', overview.OverView),
    ('^/channel/v1/page/channel.html$', channel.ChannelManage),
    ('^/channel/v1/page/store.html$', store.StoreManage),
    ('^/channel/v1/page/device.html$', device.DeviceManage),
    ('^/channel/v1/page/train/buyer.html$', train.TrainBuyerManage),
    ('^/channel/v1/page/train/use.html$', train.TrainUseManage),
    ('^/channel/v1/page/settle.html$', settle.SettleManage),
    #api
    ('^/channel/v1/api/login$', login.LoginHandler),
    ('^/channel/v1/api/sms_send$', login.SmsHandler),
    ('^/channel/v1/api/passwd_change$', login.ChangePassHandler),

    #渠道API
    ('^/channel/v1/api/channel_create$', channel.CreateChanHandler),
    ('^/channel/v1/api/channel$', channel.ChanHandler),
    ('^/channel/v1/api/channel_set_state', channel.ChanStateSetHandler),
    ('^/channel/v1/api/chninfo_pagelist$', channel.ChannelInfoHandler),
    ('^/channel/v1/api/chan_name_list$', channel.ChanNameList),
    ('^/channel/v1/api/chan_store_list$', channel.ChanStoreMap),


    #门店API
    ('^/channel/v1/api/store_set_state', store.StoreStateSetHandler),
    ('^/channel/v1/api/store_create$', store.CreateStoreHandler),
    ('^/channel/v1/api/store$', store.StoreHandler),
    ('^/channel/v1/api/storeinfo_pagelist$', store.StoreInfoHandler),
    ('^/channel/v1/api/store_eye$', store.StoreEyeHandler),
    ('^/channel/v1/api/store_name_list$', store.StoreNameListHandler),
    ('^/channel/v1/api/chan_store_total$', overview.OverViewInfoHandler),


    ('^/channel/v1/api/devinfo_pagelist$', device.DeviceInfoHandler),
    ('^/channel/v1/api/training_op_list$', train.TrainBuyInfoHandler),
    ('^/channel/v1/api/training_use_list$', train.TrainUseInfoHandler),

    #视光师
    ('^/channel/v1/api/eyesight_info$', eyesight.EyeSightInfoHandler),

    #训练订单
    # ('^/channel/v1/api/org_allot_to_chan_order$', train.OrgAllotToChanOrderHandler),
    # ('^/channel/v1/api/org_allot_to_store_order$', train.OrgAllotToStoreOrderHandler),
    ('^/channel/v1/api/order_cancel$', train.OrderCancelHandler),

    ('^/channel/v1/api/channel_buy_order$', train.ChanBuyTrainingsOrderHandler),

    #设备
    ('^/channel/v1/api/create_device$', device.DeviceCreateHandler),
    ('^/channel/v1/api/allocate_device$', device.DeviceAllocateHandler),
)
