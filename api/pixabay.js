// Vercel 서버리스 함수: 환경변수 PIXABAY_KEY 로 Pixabay 를 대신 호출합니다.
// (키가 브라우저 코드에 노출되지 않아요)
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_KEY;
  if (!key) {
    return res.status(500).json({ error: '서버에 PIXABAY_KEY 환경변수가 없어요.' });
  }

  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력해 주세요.' });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key,
    q,
    page,
    per_page: 10,
    image_type: 'photo',
    safesearch: 'true',
  });

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(r.status).json({ error: 'Pixabay 오류 ' + r.status });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({
      totalHits: data.totalHits,
      hits: data.hits.map(h => ({
        id: h.id,
        tags: h.tags,
        user: h.user,
        previewURL: h.previewURL,
        webformatURL: h.webformatURL,
        pageURL: h.pageURL,
      })),
    });
  } catch (e) {
    return res.status(502).json({ error: 'Pixabay 에 연결하지 못했어요.' });
  }
};
