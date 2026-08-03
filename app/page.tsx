"use client";

import { useMemo, useRef, useState } from "react";

type Control = { label: string; value: number; unit?: string };
type Module = { id: string; name: string; icon: string; color: string; enabled: boolean; mode?: string; options?: string[]; controls: Control[] };

const initialModules: Module[] = [
  { id: "tuner", name: "Tuner", icon: "⌁", color: "mint", enabled: true, controls: [] },
  { id: "compressor", name: "Compressor", icon: "◒", color: "yellow", enabled: true, controls: [{label:"Sustain",value:42},{label:"Attack",value:28},{label:"Level",value:68}] },
  { id: "drive", name: "Drive", icon: "ϟ", color: "orange", enabled: true, mode: "Overdrive", options:["Overdrive","Distortion","Fuzz","Boost"], controls: [{label:"Gain",value:36},{label:"Tone",value:58},{label:"Level",value:72}] },
  { id: "eq", name: "Equalizer", icon: "≋", color: "blue", enabled: true, controls: [{label:"Bass",value:52},{label:"Mid",value:61},{label:"Treble",value:64},{label:"Presence",value:55}] },
  { id: "mod", name: "Modulation", icon: "∿", color: "purple", enabled: false, mode: "Chorus", options:["Chorus","Phaser","Tremolo","Vibrato"], controls: [{label:"Rate",value:31},{label:"Depth",value:44},{label:"Mix",value:24}] },
  { id: "delay", name: "Delay", icon: "↝", color: "pink", enabled: true, mode: "Tape", options:["Analog","Digital","Tape"], controls: [{label:"Time",value:42,unit:"420 ms"},{label:"Feedback",value:33},{label:"Mix",value:27}] },
  { id: "reverb", name: "Reverb", icon: "◎", color: "cyan", enabled: true, mode: "Plate", options:["Room","Spring","Plate","Hall","Ambient"], controls: [{label:"Size",value:58},{label:"Decay",value:46},{label:"Mix",value:31}] },
  { id: "amp", name: "Amp Simulator", icon: "▦", color: "cream", enabled: true, mode: "British Crunch", options:["Clean Combo","British Crunch","American High Gain","Boutique Lead"], controls: [{label:"Gain",value:39},{label:"Bass",value:51},{label:"Mid",value:64},{label:"Treble",value:62},{label:"Master",value:70}] },
  { id: "cab", name: "Cabinet", icon: "▥", color: "brown", enabled: true, mode: "4×12 Vintage", options:["1×12 Open Back","2×12 Alnico","4×12 Vintage","4×12 Modern"], controls: [{label:"Mic position",value:44},{label:"Room",value:22}] },
];

const promptPresets = [
  { match: /ambient|worship/i, title:"Shimmering Ambient Clean", desc:"Wide, pristine clean tone · lush modulation · long atmospheric tails", changes:{drive:14,mod:48,delay:51,reverb:68} },
  { match: /liam|wonderwall|britpop/i, title:"90s British Rhythm", desc:"Mid-forward crunch · bright acoustic-like attack · compact room", changes:{drive:47,mod:8,delay:16,reverb:24} },
  { match: /mateus|asato/i, title:"Expressive Boutique Lead", desc:"Touch-sensitive drive · warm mids · spacious delay and plate", changes:{drive:32,mod:18,delay:38,reverb:37} },
  { match: /city pop|japanese/i, title:"City Lights Clean", desc:"Glossy clean combo · tight compression · sparkling chorus", changes:{drive:10,mod:54,delay:24,reverb:29} },
];

export default function Home() {
  const [modules, setModules] = useState(initialModules);
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState({title:"Studio Crunch",desc:"Touch-sensitive drive · focused mids · warm tape ambience"});
  const [audioOn, setAudioOn] = useState(false);
  const [saved, setSaved] = useState(false);
  const audio = useRef<{ctx:AudioContext; stream:MediaStream}|null>(null);
  const active = useMemo(()=>modules.filter(m=>m.enabled).length,[modules]);

  const toggle = (id:string) => setModules(ms=>ms.map(m=>m.id===id?{...m,enabled:!m.enabled}:m));
  const change = (id:string, index:number, value:number) => setModules(ms=>ms.map(m=>m.id===id?{...m,controls:m.controls.map((c,i)=>i===index?{...c,value}:c)}:m));
  const changeMode = (id:string,mode:string) => setModules(ms=>ms.map(m=>m.id===id?{...m,mode}:m));
  const generate = () => {
    const found = promptPresets.find(p=>p.match.test(prompt)) || {title:"Custom Prompt Tone",desc:"Balanced dynamics · musical drive · spacious studio ambience",changes:{drive:28,mod:22,delay:30,reverb:35}};
    setPreset({title:found.title,desc:found.desc});
    setModules(ms=>ms.map(m=>found.changes[m.id as keyof typeof found.changes]!==undefined?{...m,enabled:true,controls:m.controls.map((c,i)=>i===0?{...c,value:found.changes[m.id as keyof typeof found.changes]}:c)}:m));
  };
  const listen = async () => {
    if(audio.current){audio.current.stream.getTracks().forEach(t=>t.stop());audio.current.ctx.close();audio.current=null;setAudioOn(false);return;}
    try { const stream=await navigator.mediaDevices.getUserMedia({audio:true}); const ctx=new AudioContext(); const source=ctx.createMediaStreamSource(stream); const comp=ctx.createDynamicsCompressor(); const drive=ctx.createWaveShaper(); drive.curve=new Float32Array(Array.from({length:512},(_,i)=>Math.tanh(((i/511)*2-1)*2.5))); const delay=ctx.createDelay(1); delay.delayTime.value=.32; const wet=ctx.createGain(); wet.gain.value=.16; source.connect(comp).connect(drive).connect(ctx.destination); drive.connect(delay).connect(wet).connect(ctx.destination); audio.current={ctx,stream};setAudioOn(true); } catch { alert("Microphone access is needed to monitor your guitar input."); }
  };

  return <main>
    <header><div className="brand"><span className="brandmark">T</span><div><b>TONEFORGE</b><small>GUITAR TONE LAB</small></div></div><nav><button className="navactive">PEDALBOARD</button><button>PRESETS</button><button>ABOUT</button></nav><div className="header-actions"><button className="ghost" onClick={()=>{setModules(initialModules);setPreset({title:"Studio Crunch",desc:"Touch-sensitive drive · focused mids · warm tape ambience"});setPrompt("")}}>↶ Reset</button><button className="save" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),1600)}}>{saved?"✓ SAVED":"♡ SAVE TONE"}</button></div></header>

    <section className="hero"><div className="eyebrow"><i/> AI-ASSISTED TONE DESIGN</div><h1>Describe your <em>dream tone.</em></h1><p>Tell us the feeling, era, or style. We’ll shape an inspired preset you can make your own.</p><div className="promptbox"><span>✦</span><input aria-label="Tone prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()} placeholder='Try “clean ambient worship tone” or “90s Britpop rhythm”'/><button onClick={generate}>GENERATE TONE <b>→</b></button></div><div className="chips"><span>TRY A PROMPT</span>{["Mateus Asato","Wonderwall","Japanese city pop","90s Britpop"].map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}</button>)}</div><div className="notice">ⓘ Presets are broad, original interpretations based on tone characteristics — not exact reproductions of any artist or recording.</div></section>

    <section className="workspace"><div className="section-title"><div><span>YOUR SIGNAL CHAIN</span><h2>From strings to speakers.</h2></div><div className="status"><i className={audioOn?"live":""}/>{audioOn?"INPUT LIVE":"INPUT READY"}<small>{active} / {modules.length} MODULES ACTIVE</small></div></div>
      <div className="chain"><div className="endpoint"><div>♩</div><b>GUITAR</b><small>INPUT</small></div><span className="wire"/>
      {modules.map((m,i)=><div className="chain-item" key={m.id}><Pedal module={m} toggle={()=>toggle(m.id)} change={(j,v)=>change(m.id,j,v)} changeMode={v=>changeMode(m.id,v)}/>{i<modules.length-1&&<span className="wire"/>}</div>)}
      <div className="endpoint output"><div>◖</div><b>OUTPUT</b><small>MONITOR</small></div></div>
    </section>

    <section className="presetbar"><div><span className="spark">✦</span><small>NOW PLAYING</small><h3>{preset.title}</h3><p>{preset.desc}</p></div><button onClick={listen} className={audioOn?"listening":""}><span>{audioOn?"■":"▶"}</span>{audioOn?"STOP MONITORING":"LISTEN WITH INPUT"}<small>{audioOn?"LIVE MICROPHONE":"USES YOUR GUITAR / MIC"}</small></button></section>
    <footer><div className="brand mini"><span className="brandmark">T</span><div><b>TONEFORGE</b><small>SHAPE YOUR SOUND</small></div></div><p>Built for exploration. Every great tone starts with curiosity.</p><span>WEB AUDIO ENGINE · ZERO UPLOADS · YOUR SOUND STAYS LOCAL</span></footer>
  </main>;
}

function Pedal({module:m,toggle,change,changeMode}:{module:Module;toggle:()=>void;change:(i:number,v:number)=>void;changeMode:(v:string)=>void}){
 return <article className={`pedal ${m.color} ${m.enabled?"":"off"}`}><div className="pedal-top"><span className="pedal-icon">{m.icon}</span><button onClick={toggle} aria-label={`Toggle ${m.name}`}><i/>{m.enabled?"ON":"OFF"}</button></div><h3>{m.name}</h3>{m.options&&<select value={m.mode} onChange={e=>changeMode(e.target.value)}>{m.options.map(o=><option key={o}>{o}</option>)}</select>}<div className="controls">{m.controls.length?m.controls.map((c,i)=><label key={c.label}><span>{c.label}<b>{c.unit||c.value}</b></span><input type="range" min="0" max="100" value={c.value} onChange={e=>change(i,+e.target.value)}/></label>):<div className="tuner"><b>E</b><span>− 0 +</span><i/></div>}</div><button className="footswitch" onClick={toggle}><i/></button></article>
}
