Page({
  gotoEditNotice() {
    wx.navigateTo({
      url: '/pages/editNotice/editNotice',
    });
  },

  gotoEditPicture() {
    wx.navigateTo({
      url: '/pages/editPicture/editPicture',
    });
  }
});
