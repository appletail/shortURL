import { useCallback, useState } from 'react'
import './App.css'
import axios from 'axios'
import {client_id, client_secret} from './clientConfig'


interface ErrResponse {
  response: {
    status: 401;
    data: {
      code: '1403' | '1500' | '2403' | '3403';
    };
  };
}

function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [shortUrlQR, setShortUrlQR] = useState('')
  const [isUrlMk, setIsUrlMk] = useState(false)
  const [orgUrl, setOrgUrl] = useState('')
  const [isError, setIsError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isCopy, setCopy] = useState(false)

  const errorCode = {
    '1403': '요청 URL에 오류가 있습니다. 파라미터 이름과 파라미터 값을 확인해 주십시오.',
    '1500': '서버 내부에 오류가 발생했습니다. "개발자 포럼"에 오류를 신고해 주십시오.',
    '2403': 'API를 사용할 권한이 없습니다. 네이버 개발자 센터의 Application > 내 애플리케이션 메뉴에서 애플리케이션의 API 설정 탭을 클릭한 다음 단축 URL이 선택돼 있는지 확인해 보십시오.',
    '3403': '단축할 원본 URL이 없는 페이지이거나 안전하지 않은 사이트입니다. 원본 URL 페이지의 상태를 점검해 주십시오.',
  }

  const mkShortURL = () => {
    setCopy(false)
    if (url) {
        axios({
          method: 'get',
          url: 'https://openapi.naver.com/v1/util/shorturl',
          params: { url },
          headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret
          }
        })
        .then((res) => {
          setShortUrl(res.data.result.url)
          setShortUrlQR(`${res.data.result.url}.qr`)
          setOrgUrl(res.data.result.orgUrl)
          setIsUrlMk(true)
          setIsError(false)
          setUrl('')
        })
        .catch((err: ErrResponse) => {
          if (err.response.status === 401) {
            setErrorMsg('client key가 없습니다.')
          } else setErrorMsg(errorCode[err.response.data.code])
            setIsError(true)
        });
    } else {
      setIsError(true)
      setErrorMsg('url을 입력해주세요.')
    }
  }

  const handleDownloadQR = useCallback((srcUrl: string) => {
    fetch(srcUrl, { method: 'GET' }).then((res) => res.blob()).then((blob) => {
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'qr.png';
       document.body.appendChild(a);
       a.click();
       setTimeout(() => {
        URL.revokeObjectURL(url);
       }, 60000);
       a.remove();
    }).catch((err) => {
       console.error('err', err);
    });
 }, []);

  const handleCopyClipBoard = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopy(true)
  }
  return (
    <>
      <h1>단축 URL 만들기</h1>
      <div className="card">
        <div>
          <div className='input-container'>
            <input className='url-input' type="text" 
            onChange={(e) => {setUrl(e.target.value)}}
            placeholder='단축하고 싶은 인터넷 주소(URL)를 입력해주세요.'
            value={url} onKeyUp={(e) => {
              if (e.key === 'Enter') mkShortURL()
            }}/>
            <button onClick={mkShortURL}>단축 URL 만들기</button>
          </div>
          <div style={{display: isError ? 'block' : 'none'}} className='result'>
            {errorMsg}
          </div>
          <div style={{display: isUrlMk ? 'block' : 'none'}} className='result'>
            <div className='short-url' onClick={handleCopyClipBoard}>
              {shortUrl}
              {isCopy && <div className='copy'>복사되었습니다.</div>}
            </div>
              <img src={shortUrlQR} alt="qr" className='qr' onClick={() => handleDownloadQR(shortUrlQR)}/>
            <div className='org-url'>
              원본 url : {orgUrl}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
