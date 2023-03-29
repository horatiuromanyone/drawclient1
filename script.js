const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const socket = new WebSocket('wss://draw-test-1.herokuapp.com/'); // Connect to server

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let eraserMode = false;

// Send drawing data to server
function sendDrawData(data) {
  socket.send(JSON.stringify(data));
}

// Receive data from server and update canvas
function updateCanvas(data) {

  if (data.type === 'canvasState') {
    console.log("Received canvasState from " + data.sender);

    const image = new Image();
    image.src = data.imageData;
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
    };
  } else if (data.type === 'drawData') {
    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.currentX, data.currentY);
    ctx.stroke();
  }
  // if the data type is requestCanvasState, provide the data, but not if we are the one who requested it
  else if (data.type === 'requestCanvasState' && data.sender !== socket.id) {
    console.log("someone requested canvas state");

    const canvasStateMessage = {
      type: 'canvasState',
      imageData: canvas.toDataURL(),
    };
    socket.send(JSON.stringify(canvasStateMessage));
  }
}

// Handle incoming messages from server
socket.addEventListener('message', (event) => {
  //console.log("MESSAGE FROM SERVER DAWG ", event);

  const data = JSON.parse(event.data);
  updateCanvas(data);
});

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const drawData = {
    type: 'drawData',
    lineWidth: eraserMode ? 20 : 10,
    strokeStyle: eraserMode ? 'white' : colorPicker.value,
    lastX: lastX,
    lastY: lastY,
    currentX: e.offsetX,
    currentY: e.offsetY,
  };
  sendDrawData(drawData);
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseout', () => (isDrawing = false));

const eraseButton = document.getElementById('erase-button');
eraseButton.addEventListener('click', () => {
  eraserMode = !eraserMode;
  eraseButton.innerText = eraserMode ? 'Draw' : 'Erase';
});

const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('change', (e) => {
  ctx.strokeStyle = e.target.value;
});

// Request current canvas state from server
socket.addEventListener('open', () => {
  const canvasStateMessage = {
    type: 'requestCanvasState',
  };
  socket.send(JSON.stringify(canvasStateMessage));
});

// disable scrolling on iphones, so you can draw on the canvas
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
}
, false);
