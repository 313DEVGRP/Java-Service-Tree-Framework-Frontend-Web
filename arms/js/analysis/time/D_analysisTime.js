'use strict';

var D = (function () {
  var Zero = function (d) {
    if (typeof d !== 'string' && typeof d !== 'number')
      throw new Error('zero : string/number 형태의 값만 유효합니다.');
    if (typeof d === 'string') d = Number(d);
    return d > 9 ? d : '0' + d;
  };

  var convertStrDateToObjDate = function (strdate) {
    var d, t, time;
    if (!strdate || typeof strdate !== 'string') return new Date(strdate);

    d = strdate.split(' ')[0] ? strdate.split(' ')[0].split(/\D/) : {};
    t = strdate.split(' ')[1] ? strdate.split(' ')[1].split(':') : {};
    time = new Date(
      d[0] || '',
      d[1] - 1,
      d[2] || '',
      t[0] || '',
      t[1] || '',
      t[2] || ''
    );

    return time;
  };

  var DateTime = function (date, format) {
    var time, transformDate;

    if (!date) return '';
    if (date instanceof Date) date = date.getTime(); // new Date()로 넣을 경우 time을 추출해서 작동함
    if (!format) format = 'yyyy.MM.dd';

    transformDate = function (d, f) {
      if (!d.valueOf()) return '';

      return f.replace(/(yyyy|yy|MM|dd)/gi, function ($1) {
        switch ($1) {
          case 'yyyy':
            return d.getFullYear();
          case 'yy':
            return Zero(d.getFullYear() % 100);
          case 'MM':
            return Zero(d.getMonth() + 1);
          case 'dd':
            return Zero(d.getDate());
          default:
            return $1;
        }
      });
    };

    if (typeof date === 'string') {
      time = convertStrDateToObjDate(date);
    } else if (typeof date === 'number') {
      time = new Date(date);
    } else {
      time = new Date(0);
      time.setFullYear(date.year + 1900);
      time.setMonth(date.month); // java는 month가 1부터 시작
      time.setDate(date.date);
    }

    return transformDate(time, format);
  };

  return {
    date: DateTime,
  };
})();
