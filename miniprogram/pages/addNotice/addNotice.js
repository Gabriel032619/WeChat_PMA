const db = wx.cloud.database();

Page({
  data: {
    notice: ''
  },

  onInputChange(e) {
    this.setData({
      notice: e.detail.value
    });
  },

  submitNotice() {
    const { notice } = this.data;
    if (!notice.trim()) {
      wx.showToast({
        title: '公告内容不能为空',
        icon: 'none'
      });
      return;
    }

    db.collection('publicNotice').add({
      data: {
        notice,
        time: new Date()
      }
    }).then(() => {
      wx.showToast({
        title: '新增公告成功',
        icon: 'success'
      });
      wx.navigateBack();
    }).catch(err => {
      wx.showToast({
        title: '新增公告失败',
        icon: 'none'
      });
      console.error('新增公告失败', err);
    });
  }
});
