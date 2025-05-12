Page({
  data: {
    openId: '',
    images: {}
  },

  onShow() {
    this.getImages();
  },

  gotoManagerScanPage() {
    wx.navigateTo({
      url: '/pages/managerScan/managerScan'
    });
  },

  gotoCourseManagementPage() {
    wx.navigateTo({
      url: '/pages/courseManagement/courseManagement'
    });
  },

  gotoMemberListPage() {
    wx.navigateTo({
      url: '/pages/memberList/memberList'
    });
  },

  gotoContentEditPage() {
    wx.navigateTo({
      url: '/pages/contentEdit/contentEdit'
    });
  },

  getImages() {
    const fileIDs = [
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/manager/VIPList.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/manager/editApp.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/manager/editStudentClass.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/manager/scan.png'
    ];

    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: res => {
        const images = res.fileList.reduce((acc, file) => {
          const fileName = file.fileID.split('/').pop().split('.').shift();
          acc[fileName] = file.tempFileURL;
          console.log("Ok set filename")
          return acc;
        }, {});
        this.setData({ images });
        console.log("Manager.png", images.manager)
      },
      fail: console.error
    });
  },
});
