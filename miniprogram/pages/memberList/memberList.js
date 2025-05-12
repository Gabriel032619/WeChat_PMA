// const db = wx.cloud.database();

// Page({
//   data: {
//     members: [],
//     searchQuery: '',
//     noResults: false // 用于控制显示“未搜索到消息”的提示
//   },

//   onShow() {
//     this.fetchMembers();
//   },

//   fetchMembers() {
//     db.collection('User').where({
//       isStudent: true
//     }).orderBy('idenNum', 'asc').get().then(res => {
//       const members = res.data.map(member => {
//         member.inDate = this.formatTime(member.inDate);
//         return member;
//       });
//       this.setData({
//         members: members,
//         noResults: members.length === 0
//       });
//       console.log('会员数据', members);
//     }).catch(err => {
//       console.error('获取会员数据失败', err);
//     });
//   },

//   onSearchInput(e) {
//     this.setData({
//       searchQuery: e.detail.value
//     });
//   },

//   onSearch() {
//     const query = this.data.searchQuery.trim();
//     if (query === '') {
//       this.fetchMembers();
//       return;
//     }

//     db.collection('User').where({
//       isStudent: true,
//       $or: [
//         {
//           name: db.RegExp({
//             regexp: query,
//             options: 'i'
//           })
//         },
//         {
//           idenNum: db.RegExp({
//             regexp: query,
//             options: 'i'
//           })
//         }
//       ]
//     }).orderBy('idenNum', 'asc').get().then(res => {
//       const members = res.data.map(member => {
//         member.inDate = this.formatTime(member.inDate);
//         return member;
//       });
//       this.setData({
//         members: members,
//         noResults: members.length === 0
//       });
//       console.log('搜索结果', members);
//     }).catch(err => {
//       console.error('搜索会员数据失败', err);
//     });
//   },

//   formatTime(date) {
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = (d.getMonth() + 1).toString().padStart(2, '0');
//     const day = d.getDate().toString().padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   },

//   gotoAddMember() {
//     wx.navigateTo({
//       url: '/pages/addMember/addMember',
//     });
//   },

//   onLongPress(e) {
//     const memberId = e.currentTarget.dataset.id;
//     wx.showModal({
//       title: '删除确认',
//       content: '您确定要删除该会员吗？',
//       success: (res) => {
//         if (res.confirm) {
//           wx.showModal({
//             title: '再次确认',
//             content: '再次确认是否删除该会员？',
//             success: (res) => {
//               if (res.confirm) {
//                 this.deleteMember(memberId);
//               }
//             }
//           });
//         }
//       }
//     });
//   },

//   deleteMember(memberId) {
//     db.collection('User').doc(memberId).get().then(res => {
//       const memberInfo = res.data; // 获取会员信息以便记录日志
//       db.collection('User').doc(memberId).remove().then(() => {
//         wx.showToast({
//           title: '会员删除成功',
//           icon: 'success'
//         });
//         this.addLogRecord('deleteMember', memberId, memberInfo, 'success');
//         this.fetchMembers(); // 重新获取会员列表
//       }).catch(err => {
//         wx.showToast({
//           title: '会员删除失败',
//           icon: 'none'
//         });
//         this.addLogRecord('deleteMember', memberId, memberInfo, 'fail', err);
//         console.error('删除会员失败', err);
//       });
//     }).catch(err => {
//       wx.showToast({
//         title: '获取会员信息失败',
//         icon: 'none'
//       });
//       console.error('获取会员信息失败', err);
//     });
//   },

//   addLogRecord(action, memberId, data, status, error) {
//     const currentTime = new Date();
//     db.collection('log').add({
//       data: {
//         action: action,
//         memberId: memberId,
//         data: data,
//         status: status,
//         error: error || null,
//         timestamp: currentTime
//       }
//     }).then(() => {
//       console.log('日志记录添加成功，action:', action, 'memberId:', memberId, 'data:', data, 'status:', status);
//     }).catch(err => {
//       console.error('日志记录添加失败：', err);
//     });
//   }
// });


const db = wx.cloud.database();

Page({
  data: {
    members: [],
    searchQuery: '',
    noResults: false // 用于控制显示“未搜索到消息”的提示
  },

  onShow() {
    this.fetchMembers();
  },

  fetchMembers() {
    this.loadMembers({});
  },

  loadMembers(query, offset = 0, accumulatedData = []) {
    db.collection('User').where({
      isStudent: true,
      ...query
    }).orderBy('idenNum', 'asc')
    .skip(offset)
    .limit(20)
    .get().then(res => {
      const newData = accumulatedData.concat(res.data);
      const formattedData = newData.map(member => {
        member.inDate = this.formatTime(member.inDate);
        return member;
      });
      this.setData({
        members: formattedData,
        noResults: formattedData.length === 0
      });
      if (res.data.length === 20) {
        this.loadMembers(query, offset + 20, newData); // 如果还有数据，继续加载
      }
      console.log('加载的会员数据', formattedData);
    }).catch(err => {
      console.error('获取会员数据失败', err);
    });
  },

  onSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  onSearch() {
    const query = this.data.searchQuery.trim();
    if (query === '') {
      this.fetchMembers();
      return;
    }

    const searchQuery = {
      $or: [
        {
          name: db.RegExp({
            regexp: query,
            options: 'i'
          })
        },
        {
          idenNum: db.RegExp({
            regexp: query,
            options: 'i'
          })
        }
      ]
    };

    this.setData({
      members: [] // 开始新的搜索前清空当前数据
    });
    this.loadMembers(searchQuery);
  },

  formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  gotoAddMember() {
    wx.navigateTo({
      url: '/pages/addMember/addMember',
    });
  },

  onLongPress(e) {
    const memberId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认',
      content: '您确定要删除该会员吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '再次确认是否删除该会员？',
            success: (res) => {
              if (res.confirm) {
                this.deleteMember(memberId);
              }
            }
          });
        }
      }
    });
  },

  deleteMember(memberId) {
    db.collection('User').doc(memberId).get().then(res => {
      const memberInfo = res.data; // 获取会员信息以便记录日志
      db.collection('User').doc(memberId).remove().then(() => {
        wx.showToast({
          title: '会员删除成功',
          icon: 'success'
        });
        this.addLogRecord('deleteMember', memberId, memberInfo, 'success');
        this.fetchMembers(); // 重新获取会员列表
      }).catch(err => {
        wx.showToast({
          title: '会员删除失败',
          icon: 'none'
        });
        this.addLogRecord('deleteMember', memberId, memberInfo, 'fail', err);
        console.error('删除会员失败', err);
      });
    }).catch(err => {
      wx.showToast({
        title: '获取会员信息失败',
        icon: 'none'
      });
      console.error('获取会员信息失败', err);
    });
  },

  addLogRecord(action, memberId, data, status, error) {
    const currentTime = new Date();
    db.collection('log').add({
      data: {
        action: action,
        memberId: memberId,
        data: data,
        status: status,
        error: error || null,
        timestamp: currentTime
      }
    }).then(() => {
      console.log('日志记录添加成功，action:', action, 'memberId:', memberId, 'data:', data, 'status:', status);
    }).catch(err => {
      console.error('日志记录添加失败：', err);
    });
  }
});
