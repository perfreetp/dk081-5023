export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/escrow/index',
    'pages/chat/index',
    'pages/profile/index',
    'pages/account-detail/index',
    'pages/order-detail/index',
    'pages/appeal/index',
    'pages/verify/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '游戏账号担保交易',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8FAFC'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#10B981',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/escrow/index',
        text: '担保'
      },
      {
        pagePath: 'pages/chat/index',
        text: '聊天'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
