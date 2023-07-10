import React, { useState, useRef } from 'react';
import { Stage, Layer, Image, Line } from 'react-konva';
import './App.css';

const COLORS = [
  '#000000', // Negro
  '#FF0000', // Rojo
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarillo
  '#800080', // Morado
  '#FFA500', // Naranja
  '#FFC0CB', // Rosa
  '#808080', // Gris
  '#A52A2A', // Marrón
  '#00FFFF', // Cian
  '#FF00FF', // Magenta
  '#FF00Fd'  // Magenta
];

const App = () => {
  const [images, setImages] = useState([]);
  const [lines, setLines] = useState([]);
  const [undoHistory, setUndoHistory] = useState([]);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [draggableImages, setDraggableImages] = useState(true);
  const isDrawing = useRef(false);
  const linePoints = useRef([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        setImages([...images, { img, draggable: draggableImages }]);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = e.evt;
    linePoints.current = [offsetX, offsetY];
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = e.evt;
    const newPoints = [...linePoints.current, offsetX, offsetY];
    setLines([...lines, { points: newPoints, color: brushColor, size: brushSize }]);
    linePoints.current = newPoints;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    setUndoHistory([]);
  };

  const handleTouchStart = (e) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = e.evt.targetTouches[0];
    linePoints.current = [offsetX, offsetY];
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = e.evt.targetTouches[0];
    const newPoints = [...linePoints.current, offsetX, offsetY];
    setLines([...lines, { points: newPoints, color: brushColor, size: brushSize }]);
    linePoints.current = newPoints;
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
    setUndoHistory([]);
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const updatedLines = [...lines];
    const lastLine = updatedLines.pop();
    setLines(updatedLines);
    setUndoHistory([...undoHistory, lastLine]);
  };

  const handleDelete = () => {
    setLines([]);
    setUndoHistory([]);
  };

  const handleRedo = () => {
    if (undoHistory.length === 0) return;
    const updatedUndoHistory = [...undoHistory];
    const lastLine = updatedUndoHistory.pop();
    setLines([...lines, lastLine]);
    setUndoHistory(updatedUndoHistory);
  };

  const handleBrushColorChange = (color) => {
    setBrushColor(color);
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(Number(e.target.value));
  };

  const handleToggleDraggable = () => {
    setDraggableImages(!draggableImages);
    setImages((prevImages) => {
      return prevImages.map((image) => {
        return { ...image, draggable: !draggableImages };
      });
    });
  };

  const renderColorPalette = () => {
    return COLORS.map((color) => (
      <div
        key={color}
        className={`color-option ${brushColor === color ? 'selected' : ''}`}
        style={{ background: color }}
        onClick={() => handleBrushColorChange(color)}
      ></div>
    ));
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver}>
      <h1>Arrastra y suelta imágenes aquí</h1>
      <div>
        <button onClick={handleUndo}>UNDO</button>
        <button onClick={handleDelete}>DELETE</button>
        <button onClick={handleRedo}>REDO</button>
        <button onClick={handleToggleDraggable}>
          {draggableImages ? 'Desactivar Arrastrar' : 'Activar Arrastrar'}
        </button>
      </div>
      <div>
        <div className="color-palette">{renderColorPalette()}</div>
        <label htmlFor="brush-size">Tamaño:</label>
        <input
          type="range"
          id="brush-size"
          min={1}
          max={9}
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {images.map((img, index) => (
            <Image
              key={`image-${index}`}
              image={img.img}
              draggable={img.draggable}
              onClick={() => handleImageClick(index)}
              onTap={() => handleImageClick(index)}
              width={200}
              height={200}
            />
          ))}
          {lines.map((line, index) => (
            <Line
              key={`line-${index}`}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
