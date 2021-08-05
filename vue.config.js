// 可选的配置文件

module.exports = {
    //baseUrl 从 Vue CLI 3.3 起已弃用，使用publicPath
    publicPath:process.env.NODE_ENV === 'production'
    ? './'
    : '/'
}