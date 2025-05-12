const db = wx.cloud.database();

Page({
  data: {
    showCustomerServicePopup: false,
    showClassRecordPopup: false,
    openId: '',
    notices: [],
    images: {},
    showImg: {}
  },

  // 获取图片的临时 URL
  getImages() {
    const fileIDs = [
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/mainPage/calculate.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/mainPage/joinVIP.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/mainPage/report.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/mainPage/server.png'
      // 'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/mainPage/Manager.png'
    ];

    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: res => {
        console.log("AAAAAAAAA:",res);
        const images = res.fileList.reduce((acc, file) => {
          const fileName = file.fileID.split('/').pop().split('.').shift();
          acc[fileName] = file.tempFileURL;
          console.log("Ok set filename");
          return acc;
        }, {});
        this.setData({ images });
        console.log("Manager.png", images.manager);
      },
      fail: console.error
    });
  },

  // 获取数据库中的图片地址，并生成临时 URL
  getShowImages() {
    db.collection('homepage_pictures').get({
      success: res => {
        const fileIDs = res.data.map(item => item.address);
        wx.cloud.getTempFileURL({
          fileList: fileIDs,
          success: tempRes => {
            const showImg = tempRes.fileList.reduce((acc, file) => {
              const fileName = file.fileID.split('/').pop().split('.').shift();
              acc[fileName] = file.tempFileURL;
              console.log("Ok set filename");
              return acc;
            }, {});
            this.setData({ showImg });
          },
          fail: console.error
        });
      },
      fail: console.error
    });
  },

  // onLoad() {
  //   this.getOpenIdAndInitializeUser();
  //   this.fetchNotices(); // 获取公告
  //   this.getImages();
  //   this.getShowImages();
  // },

  onShow() {
    this.getOpenIdAndInitializeUser();
    this.fetchNotices(); // 获取公告
    this.getImages();
    this.getShowImages();
  },

  getOpenIdAndInitializeUser() {
    wx.showLoading({
      title: '加载中...',
    });
    wx.cloud
      .callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getOpenId',
        },
      })
      .then((resp) => {
        const openId = resp.result.userInfo.openId;
        this.setData({
          openId: openId,
        });

        console.log('获取到的 openId:', openId);

        // 查询数据库中是否有该用户数据
        db.collection('User').where({
          openId: openId
        }).get().then(res => {
          if (res.data.length > 0) {
            console.log('用户数据已存在:', res.data);
          } else {
            // 初始化新用户数据
            db.collection('User').add({
              data: {
                openId: openId,
                email: '',
                idenNum: '',
                inDate: new Date(),
                isManager: false,
                isStudent: false,
                name: '未知姓名',
                phoneNum: '',
                restClass: 0,
                useName: '未知昵称', 
                register: false
              }
            }).then(addRes => {
              console.log('用户初始化成功', addRes);
            }).catch(addErr => {
              console.error('用户初始化失败', addErr);
            });
          }
        }).catch(err => {
          console.error('查询用户数据失败', err);
        });

        wx.hideLoading();
      })
      .catch((e) => {
        console.error('获取 openId 失败', e);
        wx.hideLoading();
      });
  },

  fetchNotices() {
    db.collection('publicNotice').orderBy('time', 'desc').get().then(res => {
      const notices = res.data.map(notice => {
        return {
          ...notice,
          time: this.formatTime(notice.time)
        };
      });
      this.setData({
        notices: notices
      });
    }).catch(err => {
      console.error('获取公告失败', err);
    });
  },

  formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  showCustomerServicePopup: function() {
    this.setData({
      showCustomerServicePopup: true
    });
  },

  hideCustomerServicePopup: function() {
    this.setData({
      showCustomerServicePopup: false
    });
  },

  showClassRecordPopup: function() {
    this.setData({
      showClassRecordPopup: true
    });
  },

  hideClassRecordPopup: function() {
    this.setData({
      showClassRecordPopup: false
    });
  },

  gotoClassPage() {
    wx.navigateTo({
      url: `/pages/classRecord/classRecord`,
    });
  },

  gotoScan() {
    const { openId } = this.data;
    wx.navigateTo({
      url: `/pages/scan/scan?openId=${openId}`,
    });
  }
});
