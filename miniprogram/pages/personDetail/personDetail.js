// pages/personDetail/personDetail.js
const db = wx.cloud.database();

Page({
  data: {
    openId: '',
    userName: '',
    userPhoneNumber: '',
    userEmail: '',
    newName: '',
    newPhoneNumber: '',
    newEmail: ''
  },

  onLoad() {
    this.getOpenId();
  },

  getOpenId() {
    wx.showLoading({
      title: 'Loading...',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId',
      },
    }).then((resp) => {
      const openId = resp.result.userInfo.openId;
      this.setData({
        openId: openId,
      });

      console.log('获取到的 openId:', openId);

      db.collection('User').where({
        openId: openId
      }).get().then(res => {
        if (res.data.length > 0) {
          this.setData({
            userName: res.data[0].useName,
            userPhoneNumber: res.data[0].phoneNumber || '',
            userEmail: res.data[0].email || ''
          });
        } else {
          // 初始化新用户信息
          db.collection('User').add({
            data: {
              openId: openId,
              useName: '未注册',
              phoneNumber: '',
              email: '',
              register: false
            }
          }).then(addRes => {
            console.log('用户初始化成功', addRes);
            this.setData({
              userName: '未注册',
              userPhoneNumber: '',
              userEmail: ''
            });
          }).catch(addErr => {
            console.error('用户初始化失败', addErr);
          });
        }
        wx.hideLoading();
      }).catch(console.error);
    }).catch((e) => {
      console.error('Failed to fetch openId:', e);
      wx.hideLoading();
    });
  },

  onNameInput(e) {
    this.setData({
      newName: e.detail.value
    });
  },

  onPhoneNumberInput(e) {
    this.setData({
      newPhoneNumber: e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      newEmail: e.detail.value
    });
  },

  getPhoneData(newPhone) {
    db.collection('User').where({
      phoneNumber: newPhone,
      // phoneNumber: "13703710079",
      // idenNum: ""
      openId: db.command.or([
        db.command.eq(''),    // 查找 openId 字段为空字符串的记录
        db.command.exists(false)  // 查找不存在 openId 字段的记录
      ])
    }).get().then(res => {
      console.log('根据手机号查询：', res.data);
      if (res.data.length > 0) {
        const existingUser = res.data[0];
        if (!existingUser.openId) {
          // 合并数据到当前用户记录
          this.mergeUserData(this.data.openId, existingUser);
        } else {
          wx.showToast({
            title: '手机号已被其他用户使用',
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        wx.showToast({
          title: '未找到匹配的手机号',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      console.error('获取用户数据失败', err);
    });
  },


  updateUserInfo() {
    const { openId, newName, newPhoneNumber, newEmail, userName, userEmail, userPhoneNumber } = this.data;

    console.log('当前手机号:', userPhoneNumber, '新手机号:', newPhoneNumber);

    // 检查手机号是否更改
    if (newPhoneNumber === userPhoneNumber || newPhoneNumber==='') {
      console.log('未更改手机号');
      // 直接更新其他信息，同时传递当前的手机号
      this.directUpdateUserInfo(newName, newEmail, userPhoneNumber);
    } else {
      console.log('更改手机号,新手机号：', newPhoneNumber);
      // 如果手机号改变，先检查新的手机号
      this.getPhoneData(newPhoneNumber);
    }
  },


  directUpdateUserInfo(newName, newEmail, phoneNumber) {
    const { openId } = this.data;
    db.collection('User').doc(openId).update({
      data: {
        useName: newName || this.data.userName,  // 新的或原有的名字
        email: newEmail || this.data.userEmail,  // 新的或原有的邮箱
        phoneNumber: phoneNumber  // 明确包含当前的手机号
      }
    }).then(res => {
      this.setData({
        userName: newName || this.data.userName,
        userEmail: newEmail || this.data.userEmail,
        userPhoneNumber: phoneNumber  // 确保本地数据也更新
      });
      wx.showToast({
        title: '信息更新成功',
        icon: 'success',
        duration: 2000
      });
      console.log('用户信息更新成功', res);
    }).catch(err => {
      console.error('用户信息更新失败', err);
      wx.showToast({
        title: '更新失败，请重试',
        icon: 'none',
        duration: 2000
      });
    });
},


  deleteUnregisteredRecords(openId) {
    db.collection('User').where({
        // openId: openId,
        register: false  // 查找标记为未注册的记录
    }).get().then(res => {
        res.data.forEach(user => {
            db.collection('User').doc(user._id).remove().then(() => {
                console.log('已删除未注册的记录:', user._id);
            }).catch(err => {
                console.error('删除未注册记录失败:', err);
            });
        });
    }).catch(err => {
        console.error('查询未注册记录失败:', err);
    });
},


  mergeUserData(openId, existingData) {
    console.log('正在覆盖数据到 openId:', openId);
    console.log('覆盖的数据:', existingData);
    db.collection('User').doc(openId).set({
      data: {
        useName: existingData.useName,  // 使用搜索到的名字
        phoneNumber: existingData.phoneNumber,  // 使用搜索到的手机号
        email: existingData.email,  // 使用搜索到的邮箱
        openId: openId,
        idenNum: existingData.idenNum,
        inDate: existingData.inDate,
        isManager: existingData.isManager,
        isStudent: existingData.isStudent,
        name: existingData.name,
        restClass: existingData.restClass,
        avatarUrl: existingData.avatarUrl,
        register: existingData.register,
        // 不更新 openId，它会保持不变
      }
    }).then(updateRes => {
      
      console.log('用户信息覆盖成功', updateRes);
      // 更新页面数据
      this.setData({
        userName: existingData.useName,
        userPhoneNumber: existingData.phoneNumber,
        userEmail: existingData.email,
      });
      wx.showToast({
        title: '用户信息已覆盖',
        icon: 'success',
        duration: 2000
      });
      this.deleteUnregisteredRecords(openId);
    }).catch(updateErr => {
      console.error('覆盖用户信息失败', updateErr);
      wx.showToast({
        title: '信息覆盖失败，请重试',
        icon: 'none',
        duration: 2000
      });
    });
},
});
