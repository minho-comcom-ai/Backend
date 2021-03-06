const csv = require('csv-parser');
const request = require('request');

const addToQna = (qna, property) => {
  property.split(/,(?![^()]*\))\s*/).forEach(data => {
    const removeBlankData = data.replace(" ", "");
    const idx = qna.findIndex(el => el.name === removeBlankData);
    if(idx !== -1) {
      qna[idx].count++;
    }
    else {
      qna.push({
        name: removeBlankData,
        count: 1
      })
    }
  })
}

exports.qna = async (req, res) => {
  const results = [];
  const qna = {
    school: [],
    grade: [],
    major: [],
    info: [],
    language: [],
    field: [],
    company: []
  }

  try {
    request('https://docs.google.com/spreadsheets/d/e/2PACX-1vTvCjUGpkCK66ipteSR0DJnNzwuVBDV5Pgyq0q9cYFScbDFOLi_lVYylhg-PTfo8LMEMQNh8n5xpNG0/pub?gid=210713919&single=true&output=csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      results.forEach(data => {
        const { 
          '학교': schoolName, 
          '학년': grade, 
          '전공': major, 
          '학교 외에 학습 관련 정보를 얻는 곳(중복선택 가능)': info, 
          '사용 언어(중복선택 가능)': language, 
          '향후 진출하고 싶은 분야(중복선택 가능)': field, 
          '향후 입사하고 싶은 기업(중복선택 가능)': company
        } = data;

        addToQna(qna.school, schoolName);
        addToQna(qna.grade, grade);
        addToQna(qna.major, major);
        addToQna(qna.info, info);
        addToQna(qna.language, language);
        addToQna(qna.field, field);
        addToQna(qna.company, company);
      })
      res.status(200).send({
        qna
      })
    })
  }
  catch (error) {
    res.status(500).send({
      msg: '서버 오류가 발생했습니다.',
      msgId: 500
    })
  }
}