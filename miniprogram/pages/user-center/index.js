const db = wx.cloud.database();

Page({
  data: {
    openId: '',
    showUploadTip: false,
    userName: '',
    restClass: 0,
    newName: '',
    showEditModal: false, // 控制编辑用户名的弹窗
    phoneNumber: '',
    isManager: false,
    showNotAdminModel: false,
    images: {}, // 用于存储图片 URL
    avatarUrl: '', // 用于存储用户头像 URL
    userInfo: {}
  },

  // 获取用户的 OpenID
  getOpenId() {
    wx.showLoading({
      title: '',
    });
    console.log("🚀 准备调用 quickstartFunctions");
    wx.cloud
      .callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getOpenId',
        },
      })
      .then((resp) => {
        console.log("🚀 resp", resp)
        const openId = resp.result.userInfo.openId;
        this.setData({
          haveGetOpenId: true,
          openId: openId,
        });

        console.log('获取到的 openId:', openId);

        db.collection('User').where({
          openId: openId
        }).get().then(res => {
          console.log("查询结果为", res)
          if (res.data.length > 0) {
            this.setData({
              userName: res.data[0].useName,
              restClass: res.data[0].restClass,
              isManager: res.data[0].isManager,
              phoneNumber: res.data[0].phoneNumber,
              avatarUrl: res.data[0].avatarUrl,
              userInfo: {
                avatarUrl: res.data[0].avatarUrl
              }
            });
            console.log('查询成功', res.data)
          } else {
            // 初始化新用户信息
            db.collection('User').add({
              data: {
                openId: openId,
                useName: '未注册',
                restClass: 0,
                isManager: false,
                register: false,
                phoneNumber: "0",
                avatarUrl: ""
              }
            }).then(addRes => {
              console.log('用户初始化成功', addRes)
              this.setData({
                userName: '未注册',
                restClass: 0
              });
            }).catch(addErr => {
              console.error('用户初始化失败', addErr)
            });
          }
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

  // 获取图片的临时 URL
  getImages() {
    const fileIDs = [
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/userCenter/money.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/userCenter/manager.png',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/userCenter/package.png',
      'cloud://tfh-7gykbqtx91f8451f.7466-tfh-7gykbqtx91f8451f-1328228749/images/userCenter/people.png',
      '	cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/userCenter/toDoList.png',
      'cloud://tfh-7gykbqtx91f8451f.7466-tfh-7gykbqtx91f8451f-1328228749/images/arrow.svg',
      'cloud://tfh1-4guvmcd459185fb4.7466-tfh1-4guvmcd459185fb4-1328228749/userCenter/pen.png'
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

  getAvatarUrl() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getOpenId' }
    }).then(resp => {
      const openId = resp.result.userInfo.openId;
      console.log("获取到的 openId:", openId);
  
      db.collection('User').where({
        openId: openId
      }).get().then(res => {
        if (res.data.length > 0) {
          const avatarUrl = res.data[0].avatarUrl || ''; // 获取头像 URL，若无则为空
          this.setData({
            avatarUrl: avatarUrl
          });
          console.log("用户头像:", avatarUrl);
        } else {
          console.log("未找到用户信息");
        }
      }).catch(err => {
        console.error("查询用户头像失败", err);
      });
    }).catch(err => {
      console.error("获取 openId 失败", err);
    })
  },

  onEditName() {
    this.setData({
      showEditModal: true,
      newName: this.data.userName
    });
  },

  onNameInput(e) {
    this.setData({
      newName: e.detail.value
    });
  },

  updateUserName() {
    const { openId, newName } = this.data;
    if (!newName.trim()) {
      wx.showToast({
        title: '名称不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    db.collection('User').where({
      openId: openId
    }).get().then(res => {
      if (res.data.length > 0) {
        const userId = res.data[0]._id;
        db.collection('User').doc(userId).update({
          data: {
            useName: newName
          }
        }).then(updateRes => {
          console.log('名称更新成功', updateRes)
          this.setData({
            userName: newName,
            newName: '',
            showEditModal: false
          });
          wx.showToast({
            title: '名称更新成功',
            icon: 'success',
            duration: 2000
          });
        }).catch(updateErr => {
          console.error('名称更新失败', updateErr)
          wx.showToast({
            title: '名称更新失败，请重试',
            icon: 'none',
            duration: 2000
          });
        });
      }
    }).catch(err => {
      console.error('获取用户数据失败', err)
    });
  },

  closeEditModal() {
    this.setData({
      showEditModal: false
    });
  },

  gotoMoneyPage() {
    wx.navigateTo({
      url: `/pages/moneyRecord/moneyRecord`,
    });
  },

  gotoClassPage() {
    wx.navigateTo({
      url: `/pages/classRecord/classRecord`,
    })
  },

  gotoDetailPage() {
    wx.navigateTo({
      url: `/pages/personDetail/personDetail`,
    })
  },

  gotoManagerPage() {
    if (this.data.isManager) {
      wx.navigateTo({
        url: `/pages/manager/manager?openId=${this.data.openId}`,
      });
    } else {
      this.setData({
        showNotAdminModal: true
      });
    }
  },

  closeNotAdminModal() {
    this.setData({
      showNotAdminModal: false
    });
  },

  onLoad() {
    console.log("Page loaded");
    this.getImages();
    this.getOpenId();
    this.getAvatarUrl();
  },

  handleGetPhoneNumber(e) {
    console.log("handleGetPhoneNumber called", e);
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      wx.cloud.callFunction({
        name: 'getPhoneNumber',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        },
        success: res => {
          console.log("getPhoneNumber success", res);
          const newPhoneNumber = res.result.phoneNumber;
          this.setData({
            phoneNumber: newPhoneNumber
          });
          // 更新数据库中的用户信息
          const { openId } = this.data;
          db.collection('User').where({
            openId: openId
          }).get().then(res => {
            if (res.data.length > 0) {
              const userId = res.data[0]._id;
              db.collection('User').doc(userId).update({
                data: {
                  phoneNumber: newPhoneNumber
                }
              }).then(updateRes => {
                console.log('用户信息更新成功', updateRes)
                wx.showToast({
                  title: '用户信息更新成功',
                  icon: 'success',
                  duration: 2000
                });
              }).catch(updateErr => {
                console.error('用户信息更新失败', updateErr)
                wx.showToast({
                  title: '用户信息更新失败，请重试',
                  icon: 'none',
                  duration: 2000
                });
              });
            }
          }).catch(err => {
            console.error('获取用户数据失败', err)
          });
        },
        fail: (phoneErr) => {
          console.error('获取手机号失败', phoneErr);
        }
      });
    } else {
      console.error('用户拒绝获取手机号', e.detail.errMsg);
    }
  },

  showAvatarModal() {
    wx.showModal({
      title: "更换头像",
      content: "确定要更换头像吗？",
      showCancel: true,
      confirmText: "确认",
      cancelText: "取消",
      success: res => {
        if (res.confirm) {
          this.chooseNewAvatar();
        }
      }
    });
  },

    // 选择并上传新头像
    chooseNewAvatar() {
      wx.chooseImage({
        count: 1,
        success: res => {
          const filePath = res.tempFilePaths[0];
          this.uploadAvatar(filePath);
        }
      });
    },

    uploadAvatar(filePath) {
      if (!this.data.openId) {
        wx.showToast({ title: '未获取到 openId', icon: 'none' });
        return;
      }
    
      // **获取文件扩展名**
      const fileExtension = filePath.match(/\.(\w+)$/)?.[1] || 'png'; // 默认 `.png`
      const cloudPath = `userHeadPic/${this.data.openId}.${fileExtension}`;
    
      wx.cloud.uploadFile({
        cloudPath: cloudPath, // 存储路径
        filePath: filePath, // 本地图片路径
        success: uploadRes => {
          const fileID = uploadRes.fileID;
          console.log("头像上传成功:", fileID);
    
          // 更新数据库
          db.collection('User').where({ openId: this.data.openId }).update({
            data: { avatarUrl: fileID }
          }).then(() => {
            this.setData({ avatarUrl: fileID });
            wx.showToast({ title: '头像更新成功', icon: 'success' });
          });
        },
        fail: err => {
          console.error("头像上传失败", err);
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      });
    },
  
    // // 上传头像到云存储
    // uploadAvatar(filePath) {
    //   if (!this.data.openId) {
    //     wx.showToast({ title: '未获取到 openId', icon: 'none' });
    //     return;
    //   }
  
    //   const cloudPath = `userHeadPic/${this.data.openId}.jpg`;
  
    //   wx.cloud.uploadFile({
    //     cloudPath: cloudPath, // 存储路径
    //     filePath: filePath, // 本地图片路径
    //     success: uploadRes => {
    //       const fileID = uploadRes.fileID;
    //       console.log("头像上传成功:", fileID);
  
    //       // 更新数据库
    //       db.collection('User').where({ openId: this.data.openId }).update({
    //         data: { avatarUrl: fileID }
    //       }).then(() => {
    //         this.setData({ avatarUrl: fileID });
    //         wx.showToast({ title: '头像更新成功', icon: 'success' });
    //       });
    //     },
    //     fail: err => {
    //       console.error("头像上传失败", err);
    //       wx.showToast({ title: '上传失败', icon: 'none' });
    //     }
    //   });
    // },

  // 获取用户头像和手机号
  handleGetUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (profileRes) => {
        const userInfo = profileRes.userInfo;
        const { openId } = this.data;

        this.setData({
          userInfo: userInfo,
          avatarUrl: userInfo.avatarUrl,
          userName: userInfo.nickName
        });

        wx.cloud.callFunction({
          name: 'getPhoneNumber',
          data: {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          },
          success: res => {
            const newPhoneNumber = res.result.phoneNumber;
            if (newPhoneNumber) {
              this.setData({
                phoneNumber: newPhoneNumber
              });

              // 更新数据库中的用户信息
              db.collection('User').where({
                openId: openId
              }).get().then(res => {
                if (res.data.length > 0) {
                  const userId = res.data[0]._id;
                  const updateData = {
                    useName: userInfo.nickName,
                    avatarUrl: userInfo.avatarUrl,
                    phoneNumber: newPhoneNumber
                  };
                  db.collection('User').doc(userId).update({
                    data: updateData
                  }).then(updateRes => {
                    console.log('用户信息更新成功', updateRes)
                    wx.showToast({
                      title: '用户信息更新成功',
                      icon: 'success',
                      duration: 2000
                    });
                  }).catch(updateErr => {
                    console.error('用户信息更新失败', updateErr)
                    wx.showToast({
                      title: '用户信息更新失败，请重试',
                      icon: 'none',
                      duration: 2000
                    });
                  });
                }
              }).catch(err => {
                console.error('获取用户数据失败', err)
              });
            }
          },
          fail: (phoneErr) => {
            console.error('获取手机号失败', phoneErr);
          }
        });
      },
      fail: (profileErr) => {
        console.error('获取用户信息失败', profileErr);
      }
    });
  }
});
