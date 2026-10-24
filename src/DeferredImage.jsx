import React, {useEffect, useRef, useState} from 'react';
const placeholder='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export default function DeferredImage(props){
 const ref=useRef(null);const [ready,setReady]=useState(false);
 useEffect(()=>{if(!('IntersectionObserver' in window)){setReady(true);return;}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect();}},{rootMargin:'600px 0px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const fallback='<img src="'+escape(props.src)+'" srcset="'+escape(props.srcSet)+'" sizes="'+escape(props.sizes)+'" width="'+props.width+'" height="'+props.height+'" alt="'+escape(props.alt)+'" loading="lazy">';
 return <><img {...props} ref={ref} src={ready?props.src:placeholder} srcSet={ready?props.srcSet:undefined}/><noscript dangerouslySetInnerHTML={{__html:fallback}}/></>;
}
