import React, { useEffect, useRef, useState } from "react";
import "./App.css"
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from "react-toastify";
import { IoMdUndo } from "react-icons/io";
import { IoMdRedo } from "react-icons/io";

function Sign() {
  const swrite = useRef(null)
  const [drawing, setdrawing] = useState(false)
  const [color, setcolor] = useState('#000')
  const [bcolor, setbcolor] = useState('#fff')
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const drawingout = () => {
    setdrawing(false)
  }
  const update = (color,bcolor) => {
    const canvas = swrite.current
    const context = canvas.getContext('2d')
    context.strokeStyle = color;
    context.lineWidth = 2
    context.fillStyle = bcolor
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  useEffect(() => {
    update(color,bcolor)
  }, [color, bcolor])

  useEffect(() => {
    const canvas = swrite.current;
    const context = canvas.getContext('2d');

    const handleStartDrawing = (event) => {
      const isTouchEvent = event.type.startsWith('touch');
      let touchPosition;
      if (isTouchEvent) {
        touchPosition = event.touches[0];
      } else {
        touchPosition = event.nativeEvent;
      }
    
      if (touchPosition) {
        const { offsetX, offsetY } = touchPosition;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setdrawing(true);
        setUndoStack((prev)=>[...prev , canvas.toDataURL()])
      }
    };

    const handleDraw = (event) => {
      if (!drawing) return;
      const isTouchEvent = event.type.startsWith('touch');
      let touchPosition;
      if (isTouchEvent) {
        touchPosition = event.touches[0];
      } else {
        touchPosition = event.nativeEvent;
      }
    
      if (touchPosition) {
        const { offsetX, offsetY } = touchPosition;
        context.lineTo(offsetX, offsetY);
        context.stroke();
        setUndoStack((prev)=>[...prev, canvas.toDataURL()])
      }
    };

    const handleDrawingOut = (event) => {
      const isTouchEvent = event.type.startsWith('touch');
      let touchPosition;
      if (isTouchEvent) {
        touchPosition = event.touches[0];
      } else {
        touchPosition = event.nativeEvent;
      }
    
      if (touchPosition) {
        context.closePath();
        setdrawing(false);
      }
    };

    canvas.addEventListener('touchstart', handleStartDrawing);
    canvas.addEventListener('touchmove', handleDraw);
    canvas.addEventListener('touchend', handleDrawingOut);
    canvas.addEventListener('mousemove', handleDraw);
    canvas.addEventListener('mousedown', handleStartDrawing);
    canvas.addEventListener('mouseup', handleDrawingOut);

    // Clean up event listeners in the useEffect cleanup function
    return () => {
      canvas.removeEventListener('touchstart', handleStartDrawing);
      canvas.removeEventListener('touchmove', handleDraw);
      canvas.removeEventListener('touchend', handleDrawingOut);
      canvas.removeEventListener('mousemove', handleDraw);
      canvas.removeEventListener('mousedown', handleStartDrawing);
      canvas.removeEventListener('mouseup', handleDrawingOut);
    };
  }, [drawing]);

  const startDrawing = (event) => {
    const canvas = swrite.current;
    const context = canvas.getContext('2d');
    const { offsetX, offsetY } = event.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setdrawing(true);
    setUndoStack((prev)=>[...prev , canvas.toDataURL()])
  };

  const draw = (event) => {
    if (!drawing) return;
    const canvas = swrite.current;
    const context = canvas.getContext('2d');
    const { offsetX, offsetY } = event.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
    setUndoStack((prev)=>[...prev, canvas.toDataURL()])
  };
  const clear = () => {
    const canvas = swrite.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = bcolor;
    context.fillRect(0, 0, canvas.width, canvas.height)
    setdrawing(false)
  }
  const download = () => {
    const canvas = swrite.current;
    const dataurl = canvas.toDataURL();
    localStorage.setItem('signature', dataurl)
    const link = document.createElement('a');
    link.href = dataurl;
    link.download = 'my signature';
    link.click()
  }

  const retrievesaved = () => {
    const saved = localStorage.getItem('signature');
    if (saved) {
      const img = new Image();
      img.src = saved;
      img.onload = () => {
        const canvas = swrite.current;
        const context = canvas.getContext('2d');
        update();
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
    }
    else {
      toast.error('something went wrong')
    }
  }

  const undo = () => {
    if (undoStack.length === 0) return;
    setRedoStack((prevState) => [...prevState, swrite.current.toDataURL()]);
    setUndoStack((prevState) => prevState.slice(0, -1));
    const canvas = swrite.current;
    const context = canvas.getContext('2d');
    const lastState = undoStack[undoStack.length - 1];
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setUndoStack((prevState) => [...prevState, redoStack[redoStack.length - 1]]);
    setRedoStack((prevState) => prevState.slice(0, -1));
    const canvas = swrite.current;
    const context = canvas.getContext('2d');
    const lastState = redoStack[redoStack.length - 1];
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  
  return (
    <>
      <ToastContainer />
      <div className="sign">
        <div className="bu1">
          <div className="color">
            <label>Text color picker</label>
            <br />
            <input onChange={(e) => { setcolor(e.target.value) }} type="color" />
          </div>
          <br />
          <div className="ba">
            <label>Text Background picker</label>
            <br />
            <input onChange={(e) => { setbcolor(e.target.value) }} type="color" />
          </div>
          <br />
          <div className="fo">
            <label>Font size</label>
            <br />
            <input style={{width:"auto"}} type="number" placeholder="px" />
          </div>
        </div>
        <button className="un" onClick={undo}><IoMdUndo /></button>
        <button className="un" onClick={redo}><IoMdRedo /></button>
        <div className="sign-in">
          <canvas
            ref={swrite}
            width={1084}
            height={412}
            color={color}
            style={{ strokeStyle: color, fillStyle: bcolor }}
            onMouseUp={drawingout}
            onMouseOut={drawingout}
            onMouseDown={startDrawing}
            onMouseMove={draw}
          />
        </div>
        <div className="bu2">
          <button onClick={clear} style={{ backgroundColor: "red" }}>Clear</button>
          <button onClick={download} style={{ backgroundColor: "green", color: "white" }}>Save & download</button>
          <button onClick={retrievesaved} style={{ backgroundColor: "yellow" }}>Retrieve saved signature</button>
        </div>
      </div>
    </>
  )
}
export { Sign }