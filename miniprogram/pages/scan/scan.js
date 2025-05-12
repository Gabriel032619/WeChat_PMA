const db = wx.cloud.database();

Page({
  data: {
    openId: '',
    message: '',
    restClass: 0,
    showSuccess: false,
    showWarning: false,
    images: {}
  },

    // 获取图片的临时 URL
    getImages() {
      const fileIDs = [
        'cloud://tfh-7gykbqtx91f8451f.7466-tfh-7gykbqtx91f8451f-1328228749/images/checkTag/check.png',
        'cloud://tfh-7gykbqtx91f8451f.7466-tfh-7gykbqtx91f8451f-1328228749/images/checkTag/warning.png'
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

  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  onLoad(query) {
    this.getImages();
    const { openId } = query;

    if (openId) {
      this.setData({ openId });
      console.log(`QR code scanned! OpenID: ${openId}`);
      this.handleQRCodeScan(openId);
    } else {
      console.log('No OpenID found in QR code.');
    }
  },

  handleQRCodeScan(openId) {
    // 查询用户的剩余课程数
    db.collection('User').where({
      openId: openId
    }).get().then(res => {
      if (res.data.length > 0) {
        const user = res.data[0];
        let restClass = user.restClass;

        if (restClass > 0) {
          // 减少剩余课程数
          restClass -= 1;

          // 更新数据库中的剩余课程数
          db.collection('User').doc(user._id).update({
            data: {
              restClass: restClass
            }
          }).then(updateRes => {
            console.log('Update success: ', updateRes);

            // 将本次扫码时间和 openId 存入 classTime 集合中
            db.collection('classTime').add({
              data: {
                openId: openId,
                classTime: new Date()
              }
            }).then(addRes => {
              console.log('Add class time success: ', addRes);

              // 显示更新后的剩余课程数
              this.setData({
                restClass: restClass,
                message: `剩余课程数: ${restClass}`,
                showSuccess: true,
                showWarning: false
              });
              wx.showToast({
                title: `剩余课程数: ${restClass}`,
                icon: 'success',
                duration: 2000
              });
            }).catch(addErr => {
              console.error('Add class time failed: ', addErr);
              this.setData({
                message: '记录扫码时间失败，请重试',
                showSuccess: false,
                showWarning: true
              });
              wx.showToast({
                title: '记录扫码时间失败，请重试',
                icon: 'none',
                duration: 2000
              });
            });

          }).catch(updateErr => {
            console.error('Update failed: ', updateErr);
            this.setData({
              message: '更新课程数失败，请重试',
              showSuccess: false,
              showWarning: true
            });
            wx.showToast({
              title: '更新课程数失败，请重试',
              icon: 'none',
              duration: 2000
            });
          });
        } else {
          // 显示无可用课程
          this.setData({
            message: '剩余课程不足',
            showSuccess: false,
            showWarning: true
          });
          wx.showToast({
            title: '无可用课程',
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        // 用户不存在
        this.setData({
          message: '用户不存在',
          showSuccess: false,
          showWarning: true
        });
        wx.showToast({
          title: '用户不存在',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      console.error('Failed to fetch user data: ', err);
      this.setData({
        message: '查询失败，请重试',
        showSuccess: false,
        showWarning: true
      });
      wx.showToast({
        title: '查询失败，请重试',
        icon: 'none',
        duration: 2000
      });
    });
  }
});
