// pages/blog/blog.js
let keyword = "";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    modelShow: false,
    blogList: [],
    commentNum: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList();
  },
  getCommentNum() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList: [],
    });
    this._loadBlogList(0);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    let blogObj = event.target.dataset.blog;
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      //imageUrl:''
    };
  },
  // 发布功能
  onPublish() {
    // 判断用户是否授权
    wx.getSetting({
      success: (res) => {
        console.log(res);
        if (res.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            complete: (res) => {
              this.toBlogging({
                detail: res.userInfo,
              });
            },
          });
        } else {
          wx.showToast({
            title: "请先登录账号",
            icon: "none",
            mask: true,
          });
          this.setData({
            modalShow: true,
          });
        }
      },
    });
  },
  _loadBlogList(start = 0) {
    wx.showLoading({
      title: "拼命加载中",
    });
    let db = wx.cloud.database();
    wx.cloud
      .callFunction({
        name: "blog",
        data: {
          keyword,
          start,
          count: 10,
          $url: "list",
        },
      })
      .then((res) => {
        console.log("object");
        console.log(res.result);
        res.result.forEach((ele, idx) => {
          db.collection("blog-comment")
            .where({
              blogId: ele._id,
            })
            .count()
            .then((res) => {
              // res.result[idx].commentNum = res.total;
              // ele.content.commentNum = res.total;
              // console.log(ele);
              let { commentNum } = this.data;

              commentNum.push(res.total);
              this.setData({
                commentNum,
              });
              console.log("f", ele.content, commentNum);
            });
        });

        this.setData({
          blogList: this.data.blogList.concat(res.result),
        });
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },
  toBlogging(event) {
    const detail = event.detail;
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    });
  },
  onLoginFail() {
    wx.showModal({
      title: "授权用户才能发布博客",
      content: "",
    });
  },
  goComment(event) {
    wx.navigateTo({
      url: "../blog-comment/blog-comment?blogId=" + event.target.dataset.blogid,
    });
  },

  onSearch(event) {
    this.setData({
      blogList: [],
    });
    keyword = event.detail.keyword;
    this._loadBlogList(0);
  },
});
