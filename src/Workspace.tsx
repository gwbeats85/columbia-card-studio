import { useState } from 'react';
import App from './App';
import Posts from './Posts';
import './workspace.css';
export default function Workspace(){
  const [mode,setMode]=useState<'cards'|'posts'>('posts');
  const [incoming,setIncoming]=useState<{url:string;name:string;id:number}>();
  return <><nav style={{display:mode==='cards'?'flex':'none'}} className="workspace-switch" aria-label="Studio workspace"><button aria-pressed={mode==='posts'} onClick={()=>setMode('posts')}>Posts</button><button aria-pressed={mode==='cards'} onClick={()=>setMode('cards')}>3D cards</button></nav><div style={{display:mode==='cards'?'block':'none'}}><App onSendToPosts={(url,name)=>{setIncoming({url,name,id:Date.now()});setMode('posts');}}/></div><div style={{display:mode==='posts'?'block':'none'}}><Posts incoming={incoming} onOpenCards={()=>setMode('cards')}/></div></>;
}
