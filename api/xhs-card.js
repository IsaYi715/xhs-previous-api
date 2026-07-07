const axios = require('axios');
const cheerio = require('cheerio');
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const {url} = req.body;
    const resp = await axios.get(url, {
      headers: {'User-Agent': MOBILE_UA},
      maxRedirects: 5
    })
    const $ = cheerio.load(resp.data);
    const rawScript = $('script').toArray().map(s => $(s).html()).find(t => t.includes('__INITIAL_STATE__'));
    const rawState = rawScript.match(/window\.__INITIAL_STATE__=(.+?);<\/script>/)?.[1] || rawScript.match(/window.__INITIAL_STATE__=(.+?);/)?.[1];
    const state = JSON.parse(rawState);
    let noteData = state.noteData?.data?.noteData || state.noteData?.normalNotePreloadData;
    const fixedImgs = noteData.imageList.map(img => {
      let link = img.url.replaceAll('\\u002F','/');
      if(link.startsWith('//')) link = 'https:' + link;
      return link
    })
    res.status(200).json({
      ok:true,
      note:{
        title: noteData.title,
        author: noteData.user.nickname,
        desc: noteData.desc,
        images: fixedImgs,
        imageCount: fixedImgs.length,
        likedCount: noteData.likedCount,
        commentCount: noteData.commentCount,
        collectedCount: noteData.collectedCount,
        comments: (noteData.commentList||[]).map(c=>({user:c.user.nickname,content:c.content,ipLocation:c.ip_location})),
        url
      }
    })
  } catch (err) {
    res.status(500).json({ok:false,msg:err.message})
  }
}
