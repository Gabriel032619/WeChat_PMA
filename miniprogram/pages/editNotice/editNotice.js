// // const db = wx.cloud.database();

// // Page({
// //   data: {
// //     notices: [],
// //     updatedNotices: {},
// //   },

// //   onLoad() {
// //     this.fetchNotices();
// //   },

// //   fetchNotices() {
// //     db.collection('publicNotice')
// //       .orderBy('time', 'desc')
// //       .get()
// //       .then(res => {
// //         const notices = res.data.map(notice => {
// //           return {
// //             ...notice,
// //             isEditing: false,
// //             time: this.formatTime(notice.time)
// //           };
// //         });
// //         this.setData({
// //           notices: notices
// //         });
// //       })
// //       .catch(err => {
// //         console.error('获取公告失败', err);
// //       });
// //   },

// //   formatTime(date) {
// //     const d = new Date(date);
// //     const year = d.getFullYear();
// //     const month = (d.getMonth() + 1).toString().padStart(2, '0');
// //     const day = d.getDate().toString().padStart(2, '0');
// //     return `${year}-${month}-${day}`;
// //   },

// //   onNoticeInputChange(e) {
// //     const id = e.currentTarget.dataset.id;
// //     const value = e.detail.value;
// //     this.setData({
// //       [`updatedNotices.${id}`]: value
// //     });
// //   },

// //   editNotice(e) {
// //     const id = e.currentTarget.dataset.id;
// //     const updatedNotices = this.data.notices.map(notice => {
// //       if (notice._id === id) {
// //         notice.isEditing = true;
// //       }
// //       return notice;
// //     });
// //     this.setData({
// //       notices: updatedNotices
// //     });
// //   },

// //   saveNotice(e) {
// //     const id = e.currentTarget.dataset.id;
// //     const updatedContent = this.data.updatedNotices[id];

// //     if (!updatedContent.trim()) {
// //       wx.showToast({
// //         title: '公告内容不能为空',
// //         icon: 'none'
// //       });
// //       return;
// //     }

// //     db.collection('publicNotice').doc(id).update({
// //       data: {
// //         notice: updatedContent,
// //         time: new Date()
// //       }
// //     }).then(() => {
// //       wx.showToast({
// //         title: '更新公告成功',
// //         icon: 'success'
// //       });
// //       this.fetchNotices(); // 更新公告列表
// //     }).catch(err => {
// //       wx.showToast({
// //         title: '更新公告失败',
// //         icon: 'none'
// //       });
// //       console.error('更新公告失败', err);
// //     });
// //   },

// //   deleteNotice(e) {
// //     const noticeId = e.currentTarget.dataset.id;
// //     wx.showModal({
// //       title: '删除确认',
// //       content: '确定要删除这条公告吗？',
// //       success: (res) => {
// //         if (res.confirm) {
// //           db.collection('publicNotice').doc(noticeId).remove().then(() => {
// //             wx.showToast({
// //               title: '删除成功',
// //               icon: 'success'
// //             });
// //             this.fetchNotices(); // 重新获取公告列表
// //           }).catch(err => {
// //             wx.showToast({
// //               title: '删除失败',
// //               icon: 'none'
// //             });
// //             console.error('删除公告失败', err);
// //           });
// //         }
// //       }
// //     });
// //   },

// //   gotoAddNotice() {
// //     wx.navigateTo({
// //       url: '/pages/addNotice/addNotice',
// //     });
// //   }
// // });

// const db = wx.cloud.database();

// Page({
//   data: {
//     notices: [],
//     updatedNotices: {},
//   },

//   onLoad() {
//     this.fetchNotices();
//   },

//   onShow() {
//     this.fetchNotices();
//   },

//   fetchNotices() {
//     db.collection('publicNotice')
//       .orderBy('time', 'desc')
//       .get()
//       .then(res => {
//         const notices = res.data.map(notice => {
//           return {
//             ...notice,
//             isEditing: false,
//             time: this.formatTime(notice.time)
//           };
//         });
//         this.setData({
//           notices: notices
//         });
//       })
//       .catch(err => {
//         console.error('获取公告失败', err);
//       });
//   },

//   formatTime(date) {
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = (d.getMonth() + 1).toString().padStart(2, '0');
//     const day = d.getDate().toString().padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   },

//   onNoticeInputChange(e) {
//     const id = e.currentTarget.dataset.id;
//     const value = e.detail.value;
//     this.setData({
//       [`updatedNotices.${id}`]: value
//     });
//   },

//   editNotice(e) {
//     const id = e.currentTarget.dataset.id;
//     const updatedNotices = this.data.notices.map(notice => {
//       if (notice._id === id) {
//         notice.isEditing = true;
//       }
//       return notice;
//     });
//     this.setData({
//       notices: updatedNotices
//     });
//   },

//   saveNotice(e) {
//     const id = e.currentTarget.dataset.id;
//     const updatedContent = this.data.updatedNotices[id];

//     if (!updatedContent.trim()) {
//       wx.showToast({
//         title: '公告内容不能为空',
//         icon: 'none'
//       });
//       return;
//     }

//     db.collection('publicNotice').doc(id).update({
//       data: {
//         notice: updatedContent,
//         time: new Date()
//       }
//     }).then(() => {
//       wx.showToast({
//         title: '更新公告成功',
//         icon: 'success'
//       });
//       this.fetchNotices(); // 更新公告列表
//     }).catch(err => {
//       wx.showToast({
//         title: '更新公告失败',
//         icon: 'none'
//       });
//       console.error('更新公告失败', err);
//     });
//   },

//   deleteNotice(e) {
//     const noticeId = e.currentTarget.dataset.id;
//     wx.showModal({
//       title: '删除确认',
//       content: '确定要删除这条公告吗？',
//       success: (res) => {
//         if (res.confirm) {
//           db.collection('publicNotice').doc(noticeId).remove().then(() => {
//             wx.showToast({
//               title: '删除成功',
//               icon: 'success'
//             });
//             this.fetchNotices(); // 重新获取公告列表
//           }).catch(err => {
//             wx.showToast({
//               title: '删除失败',
//               icon: 'none'
//             });
//             console.error('删除公告失败', err);
//           });
//         }
//       }
//     });
//   },

//   gotoAddNotice() {
//     wx.navigateTo({
//       url: '/pages/addNotice/addNotice',
//     });
//   }
// });
const db = wx.cloud.database();

Page({
  data: {
    notices: [],
    updatedNotices: {},
  },

  onShow() {
    this.fetchNotices();
  },

  fetchNotices() {
    db.collection('publicNotice')
      .orderBy('time', 'desc')
      .get()
      .then(res => {
        const notices = res.data.map(notice => {
          return {
            ...notice,
            isEditing: false,
            time: this.formatTime(notice.time)
          };
        });
        this.setData({
          notices: notices
        });
      })
      .catch(err => {
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

  onNoticeInputChange(e) {
    const id = e.currentTarget.dataset.id;
    const value = e.detail.value;
    this.setData({
      [`updatedNotices.${id}`]: value
    });
  },

  editNotice(e) {
    const id = e.currentTarget.dataset.id;
    const updatedNotices = this.data.notices.map(notice => {
      if (notice._id === id) {
        notice.isEditing = true;
        // 设置默认值
        this.setData({
          [`updatedNotices.${id}`]: notice.notice
        });
      }
      return notice;
    });
    this.setData({
      notices: updatedNotices
    });
  },

  saveNotice(e) {
    const id = e.currentTarget.dataset.id;
    const updatedContent = this.data.updatedNotices[id];

    if (!updatedContent.trim()) {
      wx.showToast({
        title: '公告内容不能为空',
        icon: 'none'
      });
      return;
    }

    db.collection('publicNotice').doc(id).update({
      data: {
        notice: updatedContent,
        time: new Date()
      }
    }).then(() => {
      wx.showToast({
        title: '更新公告成功',
        icon: 'success'
      });
      this.fetchNotices(); // 更新公告列表
    }).catch(err => {
      wx.showToast({
        title: '更新公告失败',
        icon: 'none'
      });
      console.error('更新公告失败', err);
    });
  },

  deleteNotice(e) {
    const noticeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条公告吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('publicNotice').doc(noticeId).remove().then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.fetchNotices(); // 重新获取公告列表
          }).catch(err => {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
            console.error('删除公告失败', err);
          });
        }
      }
    });
  },

  gotoAddNotice() {
    wx.navigateTo({
      url: '/pages/addNotice/addNotice',
    });
  }
});
