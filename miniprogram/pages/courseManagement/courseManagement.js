const db = wx.cloud.database();

Page({
  data: {
    students: [],
    searchQuery: '',
    noResults: false // 用于控制显示“未搜索到消息”的提示
  },

  onLoad() {
    this.fetchStudents();
  },

  onShow() {
    this.fetchStudents();
  },

  fetchStudents() {
    this.loadData({});
  },

  loadData(query, offset = 0, accumulatedData = []) {
    db.collection('User').where({
      isStudent: true,
      ...query
    }).orderBy('idenNum', 'asc')
    .skip(offset)
    .limit(20)
    .get().then(res => {
      const newData = accumulatedData.concat(res.data);
      this.setData({
        students: newData,
        noResults: newData.length === 0
      });
      if (res.data.length === 20) {
        this.loadData(query, offset + 20, newData); // 如果还有数据，继续加载
      }
      console.log('加载的学生数据', newData);
    }).catch(err => {
      console.error('获取学生数据失败', err);
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
      this.fetchStudents();
      return;
    }

    // 构建搜索条件
    const searchQuery = {
      $or: [
        {
          useName: db.RegExp({
            regexp: query,
            options: 'i'
          })
        },
        {
          phoneNumber: db.RegExp({
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
      students: [] // 开始新的搜索前清空当前数据
    });
    this.loadData(searchQuery);
  },

  gotoPersonDetailPage(e) {
    const student = e.currentTarget.dataset.student;
    wx.navigateTo({
      url: `/pages/editPersonDetail/editPersonDetail?student=${encodeURIComponent(JSON.stringify(student))}`,
    });
  }
});
