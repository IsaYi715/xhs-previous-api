const axios = require('axios');
module.exports = async (req, res) => {
  // 全局跨域头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 预检OPTIONS直接放行
  if(req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { url } = req.body;
    const agentHeaders = {
      'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16 Mobile/15E148 Safari/604.1',
      'Referer':'https://www.xiaohongshu.com/',
      'Accept-Language':'zh-CN,zh;q=0.9'
    };
    // 跟随302跳转，10秒超时
    const linkRes = await axios.get(url, {
      headers: agentHeaders,
      maxRedirects: 5,
      timeout: 10000
    });
    const realUrl = linkRes.request.res.responseUrl;
    const noteRes = await axios.get(realUrl, { headers: agentHeaders, timeout:10000 });
    // 解析页面逻辑...
    res.status(200).json({ok:true, note:{}});
  } catch(e) {
    // 打印具体错误日志，方便排查
    console.error('fetch error:', e.message);
    res.status(500).json({ok:false, msg:'小红书访问被拦截/链接失效：' + e.message});
  }
}
