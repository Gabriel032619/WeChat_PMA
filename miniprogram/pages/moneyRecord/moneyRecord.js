const db = wx.cloud.database();

Page({
  data: {
    records: [],
    haveGetOpenId: false,
    openId: ''
  },

  fetchPaymentData() {
    wx.showLoading({
      title: '',
    });
    wx.cloud
      .callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getOpenId',
        },
      })
      .then((resp) => {
        this.setData({
          haveGetOpenId: true,
          openId: resp.result.userInfo.openId,
        });

        console.log('获取到的 openId:', resp.result.userInfo.openId);
        // console.log(this.data);
        db.collection('moneyRecord').where({
          openId: this.data.records.openId
        }).orderBy("payTime","desc").get().then(res => {
          console.log("查询结果为", res)
          const formattedRecords = res.data.map(record => ({
            ...record,
            payTime: this.formatTime(record.payTime) // 对时间进行格式化
          }));
          this.setData({
            records: formattedRecords
          });
          console.log('查询成功', formattedRecords)
        }).catch(console.error);

        wx.hideLoading();
      })
      .catch((e) => {
        this.setData({
          showUploadTip: true,
        });
        wx.hideLoading();
      });
  },

  formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    const second = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  onLoad(options) {
    this.fetchPaymentData();
  }
})
