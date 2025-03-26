import { useEffect, useRef, useState } from 'react';
import zkimg from '/zkimg.jpg';

type Truck = {
  name: string;
  xPosition: number;
  y: number;
  position: number;
  isFaulty: boolean;
};

const TruckSimulation = ({
  start,
  faulty,
  count,
  setfaulty,
  setCount,
  setSwap,
  swap,
}: {
  setSwap: (val: boolean) => void;
  swap: boolean;
  start: boolean;
  faulty: boolean;
  count: number;
  setfaulty: (val: boolean) => void;
  setCount: (val: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reqId, setReqId] = useState<number | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([
    { name: 'A', xPosition: 0, y: 325, position: 0, isFaulty: false },
    { name: 'B', xPosition: 1, y: 325, position: 1, isFaulty: false },
    { name: 'C', xPosition: 2, y: 325, position: 2, isFaulty: false },
    { name: 'D', xPosition: 3, y: 325, position: 3, isFaulty: false },
    { name: 'E', xPosition: 4, y: 325, position: 4, isFaulty: false },
    { name: 'F', xPosition: 5, y: 325, position: 5, isFaulty: false },
  ]);

  let offset = 0;

  const getTwoRandomIndices = () => {
    let first = Math.floor(Math.random() * 6); // Random number between 0 and 5
    let second;
    do {
      second = Math.floor(Math.random() * 6);
    } while (second === first); // Ensure second index is different

    return [first, second];
  };
  /** Function to shuffle non-faulty trucks while keeping their positions unchanged */
  useEffect(() => {
    const codeToChar = (code: number): string => String.fromCharCode(code);
    if (!swap) return;
    const shuffle = () => {
      setTrucks(prevTrucks => {
        const nonFaultyTrucks = prevTrucks.filter((truck, index) => !truck.isFaulty);
        const shuffledNames = nonFaultyTrucks.map(t => t.name).sort(() => Math.random() - 0.5);
        console.log(shuffledNames);
        let shuffledIndex = 0;
        let size = shuffledNames.length;
        const truck = JSON.parse(sessionStorage.getItem('neighbours')!);
        console.log(truck);

        console.log(truck);
        sessionStorage.setItem('neighbours', JSON.stringify(truck));
        return prevTrucks.map((truck, index) => {
          if (truck.isFaulty) {
            return truck;
          }
          return {
            ...truck,
            name: shuffledNames[shuffledIndex++], // Assign new shuffled name
          };
        });
      });
      setSwap(false);
    };
    shuffle();
  }, [swap]);
  useEffect(() => {
    if (!start) {
      setTrucks([
        { name: 'A', xPosition: 0, y: 325, position: 0, isFaulty: false },
        { name: 'B', xPosition: 1, y: 325, position: 1, isFaulty: false },
        { name: 'C', xPosition: 2, y: 325, position: 2, isFaulty: false },
        { name: 'D', xPosition: 3, y: 325, position: 3, isFaulty: false },
        { name: 'E', xPosition: 4, y: 325, position: 4, isFaulty: false },
        { name: 'F', xPosition: 5, y: 325, position: 5, isFaulty: false },
      ]);
      setCount(0);
      if (reqId) {
        cancelAnimationFrame(reqId);
        setReqId(null);
      }
    }
  }, [start]);

  useEffect(() => {
    if (!start) return;

    const intervalId = setInterval(() => {
      setTrucks(prevTrucks =>
        prevTrucks.map(truck => ({
          ...truck,
          position: truck.position + 1,
        })),
      );
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [start]);

  /** Introduces a fault in a random truck */
useEffect(() => {
  if (!faulty || count === 2) return;

  const vehicleName = count === 0 ? 'D' : 'E';

  setTrucks(prevTrucks =>
    prevTrucks.map(truck =>
      truck.name === vehicleName ? { ...truck, isFaulty: true } : truck
    )
  );
  setfaulty(false);
  setCount(count+1);
}, [faulty, count, setTrucks]); // Added count and setTrucks as dependencies


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!start) {
      if (reqId) {
        cancelAnimationFrame(reqId);
        setReqId(null);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const xUnit = (canvas.width - 100) / 8;

    const background = new Image();
    background.src = zkimg;
    const animate = () => {
      if (!start) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Road
      ctx.fillStyle = '#888';
      ctx.fillRect(0, 350, canvas.width, 50);
      ctx.fillStyle = 'white';
      const lineWidth = 50;
      const lineSpacing = 100;
      const totalLines = Math.ceil(canvas.width / lineSpacing) + 1;

      for (let i = 0; i < totalLines; i++) {
        let x = (i * lineSpacing - offset) % canvas.width;
        if (x < -lineWidth) x += canvas.width;
        ctx.fillRect(x, 375, lineWidth, 5);
      }

      ctx.fillStyle = 'rgba(255, 200, 200, 0.3)';
      ctx.fillRect(canvas.width - 200, 50, 180, 180);
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.fillText('Faulty Trucks', canvas.width - 180, 75);

      let faultyTruckCount = 0;
      let legitTruckCount = 0;
      trucks.forEach((truck, index) => {
        const isFaultyTruck = truck.isFaulty;

        if (isFaultyTruck) {
          const cornerX = canvas.width - 170;
          const cornerY = 100 + faultyTruckCount * 60;

          ctx.fillStyle = 'red';
          ctx.fillRect(cornerX, cornerY, 50, 30);
          ctx.fillStyle = 'yellow';
          ctx.fillRect(cornerX + 35, cornerY + 5, 20, 25);

          ctx.fillStyle = 'black';
          ctx.fillRect(cornerX + 40, cornerY + 10, 10, 10);
          ctx.beginPath();
          ctx.arc(cornerX + 10, cornerY + 30, 6.5, 0, Math.PI * 2);
          ctx.arc(cornerX + 40, cornerY + 30, 6.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'black';
          ctx.font = '14px Arial';
          ctx.fillText(`Truck ${truck.name}`, cornerX + 60, cornerY + 15);
          faultyTruckCount++;
        } else {
          const numTrucks = trucks.length;
          const truckWidth = 50;
          const xUnit = (canvas.width - 100) / (numTrucks + 1);
          const startX = (canvas.width - (numTrucks * truckWidth + (numTrucks - 1) * xUnit)) / 2;

          const x = startX + legitTruckCount * (truckWidth + xUnit);

          ctx.fillStyle = 'blue';
          ctx.fillRect(x, truck.y, 50, 30);
          ctx.fillStyle = 'yellow';
          ctx.fillRect(x + 35, truck.y + 5, 20, 25);
          ctx.fillStyle = 'black';
          ctx.fillRect(x + 40, truck.y + 10, 10, 10);
          ctx.beginPath();
          ctx.arc(x + 10, truck.y + 30, 6.5, 0, Math.PI * 2);
          ctx.arc(x + 40, truck.y + 30, 6.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'black';
          ctx.font = '14px Arial';
          ctx.fillText(`Truck ${truck.name}`, x - 10, truck.y - 20);
          ctx.fillText(`Position: ${truck.position}`, x - 10, truck.y - 10);

          legitTruckCount++;
        }
      });

      offset = (offset + 2) % lineSpacing;
      if (start) {
        const newReqId = requestAnimationFrame(animate);
        setReqId(newReqId);
      }
    };

    animate();
  }, [trucks, start]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={400}
      style={{ border: '1px solid black', background: 'white' }}
    />
  );
};

export default TruckSimulation;
