const colorsData = document.querySelectorAll('.color');
const lightColors = [
    "rgb(255, 215, 0)",
    "rgb(255, 255, 0)",
    "rgb(214, 255, 23)",
    "rgb(245, 245, 220)",
    "rgb(255, 255, 255)"
];
const canvasContainer = document.getElementById('drawer');
const canvas = document.getElementById("drawZone");
const canvasStates = [];
const ctx = canvas.getContext("2d");
let color = "rgb(0, 0, 0)";

// Initialize
document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
    rangeLabel.textContent = `${rangeInput.value}px`;
    rangeDisplay.style.width = `${rangeInput.value}px`;
    rangeDisplay.style.backgroundColor = color;

    rangeInput.addEventListener("input", updateRangeDisplay);

    colorsData.forEach(item => {
        item.addEventListener("click", () => {
            let style = getComputedStyle(item);
            color = style.backgroundColor;
            updateRangeDisplay();
        });
    });

    canvas.addEventListener("mousedown", startDrawing);
    undoBtn.addEventListener('click', undo);
    reset.addEventListener("click", resetCanvas);

    saveCanvasState();
    resizeCanvas();
}

// Canvas drawing
function startDrawing(e) {
    e.preventDefault();
    saveCanvasState();
    const mousePos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(mousePos.x, mousePos.y);

    canvas.addEventListener("mousemove", throttledMouseMove);
    canvas.addEventListener("mouseup", stopDrawing);
}

function mouseMove(e) {
    const mousePos = getMousePos(e);

    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = rangeInput.value;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, rangeInput.value / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(mousePos.x, mousePos.y);
}

function stopDrawing() {
    canvas.removeEventListener("mousemove", throttledMouseMove);
    canvas.removeEventListener("mouseup", stopDrawing);
}

// Canvas states
function saveCanvasState() {
    canvasStates.push(canvas.toDataURL());
    if (canvasStates.length > 20) {
        canvasStates.shift();
    }
}

function undo() {
    if (canvasStates.length > 0) {
        const previousState = canvasStates.pop();
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Utils
function isLightColor(color) {
    return lightColors.includes(color);
}

function updateRangeDisplay() {
    rangeLabel.textContent = `${rangeInput.value}px`;
    rangeDisplay.style.width = `${rangeInput.value}px`;
    rangeDisplay.style.backgroundColor = color;

    if (isLightColor(color)) {
        rangeDisplay.style.border = "1px solid #cccccc";
    } else {
        rangeDisplay.style.border = "none";
    }
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

const throttledMouseMove = throttle(mouseMove, 10);

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function resizeCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}

// Display < 1024px
document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth < 1024) {
        document.querySelector("main").style.display = "none";
        errorText.style.display = "flex";
    }
});