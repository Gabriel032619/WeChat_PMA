


App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      if (!this.cloudInited) {  // 避免重复初始化
        wx.cloud.init({
          env: '', // 自动匹配当前云环境
          traceUser: true,
        });
        this.cloudInited = true;  // 记录初始化状态，防止多次调用
      }
    }
    this.globalData = {};
  }
});
