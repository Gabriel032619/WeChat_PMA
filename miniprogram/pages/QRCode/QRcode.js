const db = wx.cloud.database();
import drawQrcode from '../../utils/weapp.qrcode.js';

Page({
  data: {
    qrcodeUrl: '',
    currentTime: '',
    restClass: 0,
    openId: ''
  },

  onLoad() {
    this.fetchOpenIdAndCheckRestClass();
    this.updateTime();
    setInterval(this.updateTime, 1000);
  },

  fetchOpenIdAndCheckRestClass() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId',
      },
    }).then(resp => {
      const openId = resp.result.userInfo.openId;
      this.setData({ openId });

      // 使用 openId 检查 restClass
      db.collection('User').where({
        openId: openId
      }).get().then(res => {
        if (res.data.length > 0) {
          const user = res.data[0];
          const restClass = user.restClass;
          console.log("剩余课程： ", restClass);
          this.setData({ restClass });

          if (restClass > 0) {
            console.log('begin generate qr code');
            this.generateQRCode(openId);
          }
        }
      });
    });
  },

  generateQRCode(openId) {
    const url = openId;
    console.log('Generated QR Code URL:', url); // 打印生成的二维码内容

    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'qrcode',
      text: url,
      callback: (e) => {
        console.log('QR Code draw callback:', e);
        wx.canvasToTempFilePath({
          canvasId: 'qrcode',
          success: (res) => {
            const tempFilePath = res.tempFilePath;
            this.setData({ qrcodeUrl: tempFilePath });
            console.log('QR Code generated at: ', tempFilePath);
          },
          fail: (err) => {
            console.log('failed to generate QR: ', err);
          }
        });
      }
    });
  },

  updateTime() {
    const date = new Date();
    const formattedTime = this.formatTime(date);
    this.setData({ currentTime: formattedTime });
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
});
