// const db = wx.cloud.database();

// Page({
//   data: {
//     imageList: []
//   },

//   onLoad() {
//     this.getImages();
//   },

//   // 获取数据库中的图片列表
//   getImages() {
//     db.collection('homepage_pictures').get({
//       success: res => {
//         const fileIDs = res.data.map(item => item.address);
//         wx.cloud.getTempFileURL({
//           fileList: fileIDs,
//           success: tempRes => {
//             const images = tempRes.fileList.map(file => ({
//               fileID: file.fileID,
//               tempFileURL: file.tempFileURL
//             }));
//             this.setData({ imageList: images });
//           },
//           fail: console.error
//         });
//       },
//       fail: console.error
//     });
//   },

//   // 长按删除图片
//   deleteImage(e) {
//     const fileID = e.currentTarget.dataset.fileid;
//     wx.showModal({
//       title: '确认删除',
//       content: '确定要删除该图片吗？',
//       success: res => {
//         if (res.confirm) {
//           wx.cloud.deleteFile({
//             fileList: [fileID],
//             success: delRes => {
//               db.collection('homepage_pictures').where({ address: fileID }).remove({
//                 success: dbRes => {
//                   wx.showToast({
//                     title: '删除成功',
//                     icon: 'success'
//                   });
//                   this.getImages(); // 重新获取图片列表
//                 },
//                 fail: console.error
//               });
//             },
//             fail: console.error
//           });
//         }
//       }
//     });
//   },

//   // 上传本地图片
//   uploadImage() {
//     wx.chooseImage({
//       count: 1,
//       success: res => {
//         const filePath = res.tempFilePaths[0];
//         const cloudPath = 'homepage_picture/' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
//         wx.cloud.uploadFile({
//           cloudPath,
//           filePath,
//           success: uploadRes => {
//             wx.showToast({
//               title: '上传成功',
//               icon: 'success'
//             });
//             db.collection('homepage_pictures').add({
//               data: {
//                 address: uploadRes.fileID
//               },
//               success: dbRes => {
//                 this.getImages(); // 重新获取图片列表
//               },
//               fail: console.error
//             });
//           },
//           fail: console.error
//         });
//       },
//       fail: console.error
//     });
//   }
// });


const db = wx.cloud.database();

Page({
  data: {
    imageList: []
  },

  onLoad() {
    this.getImages();
  },

  // 获取数据库中的图片列表
  getImages() {
    db.collection('homepage_pictures').get({
      success: res => {
        const fileIDs = res.data.map(item => item.address);
        wx.cloud.getTempFileURL({
          fileList: fileIDs,
          success: tempRes => {
            const images = tempRes.fileList.map(file => ({
              fileID: file.fileID,
              tempFileURL: file.tempFileURL
            }));
            this.setData({ imageList: images });
          },
          fail: console.error
        });
      },
      fail: console.error
    });
  },

  // 长按删除图片
  deleteImage(e) {
    const fileID = e.currentTarget.dataset.fileid;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该图片吗？',
      success: res => {
        if (res.confirm) {
          // 首先删除云存储中的文件
          wx.cloud.deleteFile({
            fileList: [fileID],
            success: delRes => {
              console.log('云存储文件删除成功', delRes);
              // 删除数据库中的记录
              db.collection('homepage_pictures').where({ address: fileID }).remove({
                success: dbRes => {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  this.getImages(); // 重新获取图片列表
                },
                fail: console.error
              });
            },
            fail: console.error
          });
        }
      }
    });
  },

  // 上传本地图片
  uploadImage() {
    wx.chooseImage({
      count: 1,
      success: res => {
        const filePath = res.tempFilePaths[0];
        const cloudPath = 'homepage_picture/' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: uploadRes => {
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
            db.collection('homepage_pictures').add({
              data: {
                address: uploadRes.fileID
              },
              success: dbRes => {
                this.getImages(); // 重新获取图片列表
              },
              fail: console.error
            });
          },
          fail: console.error
        });
      },
      fail: console.error
    });
  }
});
