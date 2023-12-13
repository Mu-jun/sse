const sseDataElement = document.getElementById('sse-data');
const urlParams = new URLSearchParams(window.location.search);
const seq = urlParams.get('seq');
const eventSource = new EventSource('http://192.168.2.96:4000/subscribe/?seq=' + seq);

// 이벤트 핸들러 등록
eventSource.addEventListener('notification', (e) => {
  const data = e.data;
  sseDataElement.innerText = new Date().toISOString();
  sseDataElement.innerText += data;
  sseDataElement.innerText += '\n';
});

// 에러 핸들러 등록
eventSource.onerror = (error) => {
  console.error('EventSource error:', error);
  console.error('EventSource :', this);
};