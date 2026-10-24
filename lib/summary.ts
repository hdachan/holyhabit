// 검색 결과 한 줄 요약(posts.summary) 기준. 글쓰기 화면·내용 도우미·저장(app/actions.ts)이 같이 쓴다.
// 구글·네이버 검색 결과의 회색 설명문으로 나간다. 비우면 본문 앞부분이 자동으로 쓰인다.

// 검색 결과에서 잘리지 않고 보이는 길이 (모바일 기준 한글 약 80자)
export const SUMMARY_VISIBLE = 80;
// 너무 짧으면 검색엔진이 무시하고 본문에서 아무 문장이나 가져간다
export const SUMMARY_MIN = 30;
// 저장할 수 있는 최대 길이
export const SUMMARY_MAX = 160;
