// const db = wx.cloud.database();

// Page({
//   data: {
//     student: {},
//     restClass: 0
//   },

//   onLoad(options) {
//     const student = JSON.parse(decodeURIComponent(options.student));
//     this.setData({
//       student,
//       restClass: student.restClass
//     });
//   },

//   onRestClassInput(e) {
//     this.setData({
//       restClass: e.detail.value
//     });
//   },

//   confirmSaveChanges() {
//     const { student, restClass } = this.data;
//     if (student.restClass != restClass){
//       wx.showModal({
//       title: '确认更改',
//       content: `是否确认将 ${student.useName} 的剩余课程从 ${student.restClass} 更改到 ${restClass}?`,
//       success: (res) => {
//         if (res.confirm) {
//           this.saveChanges();
//         }
//       }
//     })
//     };
//   },

//   saveChanges() {
//     const { student, restClass } = this.data;
//     db.collection('User').doc(student._id).update({
//       data: {
//         restClass: parseInt(restClass, 10)
//       }
//     }).then(() => {
//       wx.showToast({
//         title: '更新成功',
//         icon: 'success',
//         duration: 2000
//       });
//       this.setData({
//         student: { ...student, restClass }
//       });
//     }).catch(err => {
//       console.error('更新失败', err);
//       wx.showToast({
//         title: '更新失败',
//         icon: 'none',
//         duration: 2000
//       });
//     });
//   }
// });

const db = wx.cloud.database();

Page({
  data: {
    student: {},
    restClass: 0
  },

  onLoad(options) {
    const student = JSON.parse(decodeURIComponent(options.student));
    this.setData({
      student,
      restClass: student.restClass
    });
  },

  onRestClassInput(e) {
    this.setData({
      restClass: e.detail.value
    });
  },

  confirmSaveChanges() {
    const { student, restClass } = this.data;
    if (student.restClass != restClass){
      wx.showModal({
      title: '确认更改',
      content: `是否确认将 ${student.useName} 的剩余课程从 ${student.restClass} 更改到 ${restClass}?`,
      success: (res) => {
        if (res.confirm) {
          this.saveChanges();
        }
      }
    })
    };
  },

  saveChanges() {
    const { student, restClass } = this.data;
    const oldRestClass = student.restClass;
    db.collection('User').doc(student._id).update({
      data: {
        restClass: parseInt(restClass, 10)
      }
    }).then(() => {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 2000
      });
      this.setData({
        student: { ...student, restClass }
      });
      this.addLogRecord('updateRestClass', student._id, { oldRestClass, newRestClass: restClass }, 'success');
    }).catch(err => {
      console.error('更新失败', err);
      wx.showToast({
        title: '更新失败',
        icon: 'none',
        duration: 2000
      });
      this.addLogRecord('updateRestClass', student._id, { oldRestClass, newRestClass: restClass }, 'fail', err);
    });
  },

  addLogRecord(action, studentId, data, status, error) {
    const currentTime = new Date();
    db.collection('log').add({
      data: {
        action: action,
        studentId: studentId,
        data: data,
        status: status,
        error: error || null,
        timestamp: currentTime
      }
    }).then(() => {
      console.log('日志记录添加成功，action:', action, 'studentId:', studentId, 'data:', data, 'status:', status);
    }).catch(err => {
      console.error('日志记录添加失败：', err);
    });
  }
});
