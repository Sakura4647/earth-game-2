import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants & Types ---

type GameStatus = 'START' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';

interface Point {
  x: number;
  y: number;
}

// Visual configuration for the SVG path
const PATH_CONFIG = {
  strokeWidth: 40, // The visual width of the path
  safeRadius: 22,  // Slightly larger than half stroke width to be forgiving
  playerRadius: 12,
  viewBoxW: 350,
  viewBoxH: 500,
  pathData: "M 175 450 C 75 450 50 350 50 300 C 50 200 200 250 250 150 C 275 100 200 50 175 50" 
  // S-curve: Starts bottom center, curves left, loops back right, ends top center
};

// --- Components ---

const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-wood-300 text-center fade-in">
      <div className="mb-6"><span className="text-5xl">⛰️</span></div>
      <h1 className="text-3xl md:text-4xl font-black text-wood-900 mb-8 tracking-widest">
        土之穩行｜指尖走線
      </h1>

      <div className="bg-wood-50 p-6 rounded-xl border border-wood-200 text-left mb-8">
        <p className="text-wood-700 mb-4 font-bold tracking-wider text-lg">
          脾主肌肉，氣血充盈則動作靈巧
        </p>
        <p className="text-base text-wood-600 mb-6 leading-relaxed font-medium tracking-wide">
          土行對應臟腑為脾與胃，與消化、肌肉動作的精巧有關。
        </p>
        <h2 className="text-xl font-bold text-wood-800 mb-3 border-b border-wood-300 pb-2 flex items-center gap-2 tracking-wider">
          <span>📜</span> 遊戲規則
        </h2>
        <ul className="space-y-3 text-wood-800 leading-relaxed text-base font-medium tracking-wide">
          <li className="flex items-start gap-2">
            <span className="font-bold text-nature-dark">①</span>
            <span>限時30秒，沿著發光路徑拖曳小圓點前進</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-nature-dark">②</span>
            <span>小圓點一旦出界或碰觸邊線，遊戲立即結束</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-nature-dark">③</span>
            <span>時間結束或出界後，依前進距離計分</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="w-full font-bold rounded-lg transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-nature-dark hover:bg-green-800 text-white shadow-green-200 px-8 py-3 text-2xl tracking-widest"
      >
        開始遊戲
      </button>
    </div>
  </div>
);

const ResultModal = ({ 
  percent, 
  onRestart, 
  onClose 
}: { 
  percent: number; 
  onRestart: () => void;
  onClose: () => void;
}) => {
  let score = 0;
  let msg = "";
  let subMsg = "";

  if (percent >= 70) {
    score = 3;
    msg = "脾胃強健，動作靈巧";
    subMsg = "手部控制非常精細，表現亮眼。";
  } else if (percent >= 35) {
    score = 2;
    msg = "脾胃不錯，節奏穩當";
    subMsg = "你的精細度不錯，再多一點耐心。";
  } else {
    score = 1;
    msg = "脾胃警告，需多調養";
    subMsg = "深呼吸，放慢一點，下一次會更精準。";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-900/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 text-center relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-wood-400 hover:text-wood-700 transition-colors p-2 rounded-full hover:bg-wood-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-7xl mb-4">⛰️</div>
        <div className="mb-4">
          <p className="text-wood-600 mb-1 font-bold tracking-wider text-lg">結果</p>
          <p className="text-3xl font-black text-wood-900 tracking-wide">
            完成 <span className="text-nature-dark">{Math.round(percent)}</span>% 路徑
          </p>
        </div>

        <div className="bg-wood-50 p-4 rounded-xl border-2 border-wood-200 mb-4">
          <h3 className="text-2xl font-bold text-nature-dark mb-2 tracking-wider">{msg}</h3>
          <p className="text-wood-700 text-base mb-3 font-medium tracking-wide">{subMsg}</p>
          <div className="flex justify-center items-center gap-1 text-wood-400 text-base font-bold bg-white py-2 rounded-lg border border-wood-100">
            <span>得分：</span>
            <span className="text-3xl text-wood-800">{score}</span>
            <span>分</span>
          </div>
        </div>

        <div className="text-left mb-6">
          <h4 className="text-base font-bold text-wood-500 mb-2 border-b border-wood-100 pb-1 tracking-wider">🏅 計分方式</h4>
          <div className="space-y-2 text-sm text-wood-700 tracking-wide">
            <div className="flex justify-between items-center whitespace-nowrap gap-2">
              <span className="font-bold text-nature-dark">完成 70～100% 路徑</span>
              <span className="font-bold">3分</span>
              <span className="text-right flex-1 text-wood-500 overflow-hidden text-ellipsis">脾胃強健，動作靈巧</span>
            </div>
            <div className="flex justify-between items-center whitespace-nowrap gap-2">
              <span className="font-bold text-nature-dark">完成 35～69% 路徑</span>
              <span className="font-bold">2分</span>
              <span className="text-right flex-1 text-wood-500 overflow-hidden text-ellipsis">脾胃不錯，節奏穩當</span>
            </div>
            <div className="flex justify-between items-center whitespace-nowrap gap-2">
              <span className="font-bold text-nature-dark">完成 0～34% 路徑</span>
              <span className="font-bold">1分</span>
              <span className="text-right flex-1 text-wood-500 overflow-hidden text-ellipsis">脾胃警告，需多調養</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full font-bold rounded-lg transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-nature-dark hover:bg-green-800 text-white shadow-green-200 px-6 py-2 text-lg tracking-widest"
        >
          再來一次
        </button>
      </div>
    </div>
  );
};

const RulesModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wood-900/60 backdrop-blur-sm fade-in">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-wood-400 hover:text-wood-700 transition-colors p-2 rounded-full hover:bg-wood-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="text-wood-700 mb-2 font-bold text-center tracking-wider text-lg">
        脾主肌肉，氣血充盈則動作靈巧
      </p>
      <p className="text-base text-wood-600 mb-6 leading-relaxed text-center font-medium tracking-wide">
        土行對應臟腑為脾與胃，與消化、肌肉動作的精巧有關。
      </p>
      <h3 className="text-2xl font-bold text-center text-wood-800 mb-4 border-b border-wood-100 pb-3 tracking-widest">
        📜 遊戲規則
      </h3>
      <ul className="space-y-4 text-wood-800 font-medium tracking-wide">
        <li className="flex gap-2 text-base">
          <span className="font-bold text-nature-dark">①</span>
          <span>限時30秒，沿著發光路徑拖曳小圓點前進</span>
        </li>
        <li className="flex gap-2 text-base">
          <span className="font-bold text-nature-dark">②</span>
          <span>小圓點一旦出界或碰觸邊線，遊戲立即結束</span>
        </li>
        <li className="flex gap-2 text-base">
          <span className="font-bold text-nature-dark">③</span>
          <span>時間結束或出界後，依前進距離計分</span>
        </li>
      </ul>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [timeLeft, setTimeLeft] = useState(30);
  const [showRules, setShowRules] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // Game State
  const [playerPos, setPlayerPos] = useState<Point>({ x: 0, y: 0 }); // Current SVG coordinates
  const [progress, setProgress] = useState(0); // 0 to 100
  const [pathPoints, setPathPoints] = useState<Point[]>([]);
  const [countdownVal, setCountdownVal] = useState(3);
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0); // Mutable ref for high-frequency updates
  const isDraggingRef = useRef(false);

  // Initialize Path Points for collision detection
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      const points: Point[] = [];
      const numPoints = 1000; // Resolution of collision detection
      for (let i = 0; i <= numPoints; i++) {
        const pt = pathRef.current.getPointAtLength((i / numPoints) * len);
        points.push({ x: pt.x, y: pt.y });
      }
      setPathPoints(points);
      
      // Set initial player pos to start
      const startPt = points[0];
      setPlayerPos(startPt);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (status === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const startCountdown = () => {
    setStatus('COUNTDOWN');
    setCountdownVal(3);
    setShowResult(false);
    
    // Reset Game State
    setTimeLeft(30);
    setProgress(0);
    progressRef.current = 0;
    isDraggingRef.current = false;
    
    if (pathPoints.length > 0) {
      setPlayerPos(pathPoints[0]);
    }

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownVal(count);
      } else {
        clearInterval(interval);
        setStatus('PLAYING');
      }
    }, 1000);
  };

  const handleGameOver = () => {
    setStatus('FINISHED');
    if (timerRef.current) clearInterval(timerRef.current);
    isDraggingRef.current = false;
    // Don't show result immediately, user might want to click the result button or it pops up automatically?
    // Per wood game logic: "Time's up -> Result Modal shown automatically if finished by logic"
    // But here we might crash. If crash, show result. If time up, show result.
    setShowResult(true);
  };

  const handleRestart = () => {
    setShowResult(false);
    startCountdown();
  };

  // Interaction Handlers
  const handleInteractionStart = (clientX: number, clientY: number) => {
    if (status !== 'PLAYING') return;
    
    // Check if touch is near the current player position (allow picking up)
    const svgPoint = getSVGPoint(clientX, clientY);
    if (!svgPoint) return;

    const dist = getDistance(svgPoint, playerPos);
    
    // Allow grabbing if within reasonable distance of current dot
    if (dist < 40) {
      isDraggingRef.current = true;
      updateGamePhysics(svgPoint);
    }
  };

  const handleInteractionMove = (clientX: number, clientY: number) => {
    if (status !== 'PLAYING' || !isDraggingRef.current) return;
    const svgPoint = getSVGPoint(clientX, clientY);
    if (svgPoint) {
      updateGamePhysics(svgPoint);
    }
  };

  const handleInteractionEnd = () => {
    isDraggingRef.current = false;
  };

  // Physics & Logic
  const getSVGPoint = (x: number, y: number): Point | null => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const getDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const updateGamePhysics = (cursorPos: Point) => {
    // 1. Find the closest point on the path relative to current progress
    // We search a window ahead to prevent skipping
    const totalPoints = pathPoints.length;
    const currentIdx = Math.floor((progressRef.current / 100) * totalPoints);
    const searchWindow = 100; // How far ahead we look
    
    let bestDist = Infinity;
    let bestIdx = currentIdx;

    // Search neighborhood
    const startSearch = Math.max(0, currentIdx - 20); // Allow slight backtracking
    const endSearch = Math.min(totalPoints - 1, currentIdx + searchWindow);

    for (let i = startSearch; i <= endSearch; i++) {
      const dist = getDistance(cursorPos, pathPoints[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    // 2. Collision Check
    if (bestDist > PATH_CONFIG.safeRadius) {
      // Out of bounds!
      handleGameOver();
      return;
    }

    // 3. Update Position & Progress
    // Snap visual player to the path (or keep strictly on cursor? 
    // Usually standard "wire loop" keeps the physical ring on the wire, 
    // but digital usually tracks finger exactly until fail.
    // Let's track finger exactly BUT verify safety against closest point.
    setPlayerPos(cursorPos);

    // Only advance progress
    const newProgress = (bestIdx / totalPoints) * 100;
    if (newProgress > progressRef.current) {
        progressRef.current = newProgress;
        setProgress(newProgress);
    }

    // 4. Check Win
    if (progressRef.current >= 99) {
      progressRef.current = 100;
      setProgress(100);
      handleGameOver();
    }
  };

  // DOM Event Wrappers
  const onTouchStart = (e: React.TouchEvent) => handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
  
  const onMouseDown = (e: React.MouseEvent) => handleInteractionStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
  const onMouseUp = () => handleInteractionEnd();


  return (
    <div className="relative min-h-screen">
      {status === 'START' && <StartScreen onStart={startCountdown} />}

      {/* Game Screen */}
      <div className={status === 'START' ? 'hidden' : 'block'}>
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur shadow-md border-b border-wood-200 h-16 px-4">
          <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center gap-2 w-1/3">
              <div className={`font-mono text-3xl font-bold flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-wood-900'}`}>
                <span>⏳</span>
                <span>{timeLeft}</span>s
              </div>
            </div>
            {/* Title (Desktop) */}
            <div className="hidden md:block w-1/3 text-center text-wood-700 font-bold opacity-50 text-xl tracking-widest">
              土之穩行
            </div>
            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 w-2/3 md:w-1/3">
              <button onClick={() => setShowRules(true)} className="font-bold rounded-lg transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 border-2 border-wood-600 text-wood-800 hover:bg-wood-100 px-3 py-1 text-base tracking-wide">
                規則
              </button>
              <button onClick={handleRestart} className="font-bold rounded-lg transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-wood-600 hover:bg-wood-700 text-white px-3 py-1 text-base tracking-wide">
                重來
              </button>
              <button 
                onClick={() => setShowResult(true)} 
                disabled={status !== 'FINISHED'}
                className={`font-bold rounded-lg transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-wood-600 hover:bg-wood-700 text-white px-3 py-1 text-base tracking-wide ${status !== 'FINISHED' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                結果
              </button>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="w-full max-w-6xl mx-auto p-4 pt-24 pb-12 flex justify-center items-center h-screen">
          <div className="relative border-4 border-wood-300 rounded-2xl bg-white shadow-inner p-4 touch-none select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${PATH_CONFIG.viewBoxW} ${PATH_CONFIG.viewBoxH}`}
              className="w-full max-h-[70vh] aspect-[350/500] cursor-crosshair"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={handleInteractionEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={handleInteractionEnd}
            >
              {/* Background Path (The "Track") */}
              <path
                d={PATH_CONFIG.pathData}
                fill="none"
                stroke="#ede0cc" // wood-200
                strokeWidth={PATH_CONFIG.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
               {/* Reference Center Line (Optional, for visual aid) */}
              <path
                d={PATH_CONFIG.pathData}
                fill="none"
                stroke="#e0ccad" // wood-300
                strokeWidth="2"
                strokeDasharray="5,5"
                strokeLinecap="round"
              />

              {/* Logical Path (Invisible, for calculations) */}
              <path
                ref={pathRef}
                d={PATH_CONFIG.pathData}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
              />

              {/* Start Point Indicator */}
              {pathPoints.length > 0 && (
                <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r="6" fill="#b08d55" opacity="0.5" />
              )}
              {/* End Point Indicator */}
              {pathPoints.length > 0 && (
                 <circle cx={pathPoints[pathPoints.length-1].x} cy={pathPoints[pathPoints.length-1].y} r="6" fill="#b08d55" opacity="0.5" />
              )}

              {/* Player Dot */}
              <circle
                cx={playerPos.x}
                cy={playerPos.y}
                r={PATH_CONFIG.playerRadius}
                fill="#8f7042" // wood-600
                className="player-pulse"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
            
            <div className="absolute top-4 right-4 bg-wood-100 px-3 py-1 rounded-full text-wood-700 font-mono text-sm border border-wood-200">
               {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {status === 'COUNTDOWN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wood-900/40 backdrop-blur-sm">
          <div className="text-9xl font-black text-white drop-shadow-lg animate-ping">
            {countdownVal}
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <ResultModal 
          percent={progressRef.current} // Use ref for most up to date, or state if synced
          onRestart={handleRestart}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}