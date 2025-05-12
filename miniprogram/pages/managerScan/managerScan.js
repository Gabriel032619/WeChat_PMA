const db = wx.cloud.database();

Page({
  data: {
    studentInfo: null,
    warning: false,
    insufficientCourses: false,
    images: []
  },

  startScan: function () {
    wx.scanCode({
      success: (res) => {
        console.log('扫描结果：', res.result);
        // 直接从数据库查询数据
        db.collection('User').where({
          openId: res.result
        }).get({
          success: (res) => {
            if (res.data.length > 0) {
              let studentInfo = res.data[0];
              console.log('查询到的学生信息：', studentInfo);
              // 更新剩余课程数量
              if (studentInfo.restClass > 0) {
                const oldRestClass = studentInfo.restClass;
                db.collection('User').doc(studentInfo._id).update({
                  data: {
                    restClass: oldRestClass - 1
                  },
                  success: () => {
                    studentInfo.restClass -= 1;
                    console.log('更新后的学生信息：', studentInfo);
                    this.updateStudentInfo(studentInfo);
                    this.addClassTimeRecord(studentInfo.openId);
                    this.addLogRecord('update', studentInfo.openId, {
                      oldRestClass: oldRestClass,
                      newRestClass: studentInfo.restClass
                    });
                  },
                  fail: (err) => {
                    console.error('更新失败：', err);
                    wx.showToast({
                      title: '更新失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              } else {
                this.updateStudentInfo(studentInfo);
                this.addClassTimeRecord(studentInfo.openId);
                this.addLogRecord('check', studentInfo.openId, {
                  restClass: studentInfo.restClass
                });
              }
            } else {
              wx.showToast({
                title: '无效的二维码',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: (err) => {
            console.error('查询失败：', err);
            wx.showToast({
              title: '查询失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: (err) => {
        if (err.errMsg === "scanCode:fail cancel") {
          console.warn('用户取消了扫码');
        } else {
          console.error('扫描失败：', err);
          wx.showToast({
            title: '扫描失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  updateStudentInfo: function (studentInfo) {
    this.setData({
      studentInfo: studentInfo,
      warning: studentInfo.restClass === 0,
      insufficientCourses: studentInfo.restClass > 0 && studentInfo.restClass < 3
    });
  },

  addClassTimeRecord: function (openId) {
    const currentTime = new Date();
    db.collection('classTime').add({
      data: {
        openId: openId,
        classTime: currentTime
      },
      success: () => {
        console.log('classTime 记录添加成功，openId:', openId, 'classTime:', currentTime);
        this.addLogRecord('classTime', openId, {
          classTime: currentTime
        });
      },
      fail: (err) => {
        console.error('classTime 记录添加失败：', err);
      }
    });
  },

  addLogRecord: function (action, openId, details) {
    const currentTime = new Date();
    db.collection('log').add({
      data: {
        action: action,
        openId: openId,
        details: details,
        timestamp: currentTime
      },
      success: () => {
        console.log('日志记录添加成功，action:', action, 'openId:', openId, 'details:', details);
      },
      fail: (err) => {
        console.error('日志记录添加失败：', err);
      }
    });
  },
  getImages() {
    const fileIDs = [
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/checkTag/check.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/checkTag/warning.png'
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

  onLoad() {
    this.getImages();
  }
});
