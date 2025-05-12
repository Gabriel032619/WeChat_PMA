
const db = wx.cloud.database();

Page({
  data: {
    name: '',
    idenNum: '',
    useName: '',
    phoneNumber: ''
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  onSubmit() {
    const { name, idenNum, useName, phoneNumber } = this.data;

    if (!phoneNumber) {
      wx.showToast({
        title: '手机号为必填项',
        icon: 'none'
      });
      return;
    }

    this.checkUserExistence(phoneNumber, idenNum).then(exists => {
      if (exists) {
        wx.showToast({
          title: '手机号或识别码已存在',
          icon: 'none'
        });
      } else {
        this.addUser(name, idenNum, useName, phoneNumber);
      }
    }).catch(err => {
      wx.showToast({
        title: '检查用户存在性失败',
        icon: 'none'
      });
      console.error('检查用户存在性失败', err);
    });
  },

  checkUserExistence(phoneNumber, idenNum) {
    return db.collection('User').where(
      db.command.or([
        { phoneNumber },
        { idenNum }
      ])
    ).get().then(res => {
      return res.data.length > 0;
    }).catch(err => {
      console.error('检查用户存在性失败', err);
      throw err;
    });
  },

  addUser(name, idenNum, useName, phoneNumber) {
    db.collection('User').add({
      data: {
        name,
        idenNum,
        useName,
        phoneNumber,
        isStudent: true,
        inDate: new Date()
      }
    }).then(res => {
      wx.showToast({
        title: '会员添加成功',
        icon: 'success'
      });
      this.addLogRecord('addUser', phoneNumber, { name, idenNum, useName, phoneNumber, isStudent: true, inDate: new Date() }, 'success');
      wx.navigateBack();
    }).catch(err => {
      wx.showToast({
        title: '会员添加失败',
        icon: 'none'
      });
      this.addLogRecord('addUser', phoneNumber, { name, idenNum, useName, phoneNumber, isStudent: true, inDate: new Date() }, 'fail', err);
      console.error('添加会员失败', err);
    });
  },

  addLogRecord(action, phoneNumber, data, status, error) {
    const currentTime = new Date();
    db.collection('log').add({
      data: {
        action: action,
        phoneNumber: phoneNumber,
        data: data,
        status: status,
        error: error || null,
        timestamp: currentTime
      }
    }).then(() => {
      console.log('日志记录添加成功，action:', action, 'phoneNumber:', phoneNumber, 'data:', data, 'status:', status);
    }).catch(err => {
      console.error('日志记录添加失败：', err);
    });
  }
});
