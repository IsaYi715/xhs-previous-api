const axios = require('axios');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const {urls} = req.body;
    const output = []
    for(const oneUrl of urls){
      const imgRes = await axios.get(oneUrl,{
        headers:{
          'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          'Referer':'https://www.xiaohongshu.com/'
        },
        responseType:'arraybuffer'
      })
      const base64 = Buffer.from(imgRes.data).toString('base64');
      const mime = imgRes.headers['content-type'];
      output.push({url:oneUrl,base64,mime})
    }
    res.status(200).json({ok:true,images:output})
  } catch (e) {
    res.status(500).json({ok:false,msg:e.message})
  }
}
