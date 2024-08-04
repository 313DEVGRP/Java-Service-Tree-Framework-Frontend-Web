# drawdb 세팅

## 1. reference/drawdb/source 경로로 이동

## 2. npm install

## 3-1. 개발 환경 -  npm run dev

http://localhost:5173/reference/drawdb/ 확인

## 3-2. 작업 후 빌드 - npm run build 실행

/reference/drawdb/ 하위에 build 결과 파일이 생성된다.

## 3-2-1. 빌드 후 index.html 파일에 아래 코드 추가
```javascript
<script>
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.history && window.history.pushState) {
                window.history.pushState(null, '', '/reference/drawdb/editor' + window.location.search);
                window.dispatchEvent(new Event('popstate'));
            }
        }, 1000);
    });
</script>
```
