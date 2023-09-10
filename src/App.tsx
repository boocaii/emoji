import { useState, useRef, useEffect } from "react";

import data, { Emoji } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"

import "./App.css";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const offsetFactor = isSafari ? 0.02 : 0.125;
// const GradientColorPairs = [["rgb(191, 241, 196)", "rgb(146, 228, 149)"]];

const PureColors = [
  "#9b9faa",
  "#c3b8f2",
  "#9fc2e6",
  "#e59fb8",
  "#eaca93",
  "#c1eba8",
  "#ceb0ab",
  "#dfad8a",
  "#c2bacf",
  "#b6c6dc",
  "#c4dee0",
  "#de9ee1",
  "#a1e7eb",
  "#a8ecad",
  "#c6c2bb",
  "#d7c5a6",
  "#d3dbce",
  "#868686",
];

function App() {
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState<Emoji | null>(null);
  const [colorIdx, setColorIdx] = useState(0);

  const handleDownload = () => {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    // let ctx = canvas!.getContext('2d');
    // Convert our canvas to a data URL
    let canvasUrl = canvas!.toDataURL('image/png');
    // Create an anchor, and set the href value to our data URL
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "emoji-avatar.png";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();
  }

  return (
    <div id="app">
      <div className="flex justify-center w-full">
        <div className="">
          <EmojiAvatar
            size={160}
            // @ts-ignore
            emoji={emoji ? emoji.native : "👻"}
            color={PureColors[colorIdx]}
          />
        </div>
        <div style={{position: 'absolute', right: '1rem'}}>
          <Button onClick={handleDownload}>Download</Button>
        </div>
      </div>


      <Tabs defaultValue="emoji" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emoji">Emoji</TabsTrigger>
          <TabsTrigger value="color">Color</TabsTrigger>
        </TabsList>
        <TabsContent value="emoji" style={{ height: "200px" }}>
          <Picker
            data={data}
            onEmojiSelect={(val: any) => {
              setEmoji(val);
            }}
            previewPosition="none"
            skinTonePosition="none"
            theme="light"
            emojiSize={32}
            // perLine={9}
            emojiButtonSize={40}
            maxFrequentRows={2}
            dynamicWidth={true}
          />
        </TabsContent>
        <TabsContent value="color">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 80px))",
              gap: "10px",
              justifyContent: "center",
              paddingTop: "10px",
            }}
          >
            {PureColors.map((color, i) => (
              <div
                className="color-item"
                style={{ backgroundColor: color }}
                onClick={() => setColorIdx(i)}
              ></div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmojiAvatar(props: { size: number; emoji: string; color: string }) {
  const size = props.size,
    fontSize = props.size * 0.7,
    emoji = props.emoji,
    color = props.color;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;

    // Get the DPR and size of the canvas
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0,0,size, size);

    // draw layer 1: backgroud
    const gradient = ctx.createLinearGradient(size / 2, 0, size / 2, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    // ctx.lineWidth = 1;
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // draw layer 2: emoji
    const emojiLayer = newEmojiLayer();
    if (!emojiLayer) return;
    ctx.drawImage(emojiLayer, 0, 0, size, size, 0, 0, size, size);
  };

  const newEmojiLayer = () => {
    const l = document.createElement("canvas");
    l.width = size;
    l.height = size;
    const ctx = l.getContext("2d");
    if (!ctx) return;

    ctx.font = `${fontSize}px serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const x = size / 2,
      y = size / 2 + fontSize * offsetFactor;
    ctx.fillStyle = "white";
    ctx.fillText(emoji, x, y);

    return l;
  };

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) draw(ctx);
  }, [size, emoji, color]);

  return <canvas id="canvas" ref={canvasRef} width={size} height={size} style={{
    width: `${size}px`,
    height: `${size}px`,
  }} />;
}

export default App;
