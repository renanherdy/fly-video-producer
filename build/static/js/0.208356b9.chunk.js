(this["webpackJsonpfly-video-producer"]=this["webpackJsonpfly-video-producer"]||[]).push([[0],{181:function(e,t,r){"use strict";r.r(t),r.d(t,"createSwipeBackGesture",(function(){return a}));var n=r(28),a=function(e,t,r,a,i){var o=e.ownerDocument.defaultView;return Object(n.createGesture)({el:e,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:function(e){return e.startX<=50&&t()},onStart:r,onMove:function(e){var t=e.deltaX/o.innerWidth;a(t)},onEnd:function(e){var t=e.deltaX,r=o.innerWidth,n=t/r,a=e.velocityX,c=r/2,u=a>=0&&(a>.2||e.deltaX>c),s=(u?1-n:n)*r,d=0;if(s>5){var f=s/Math.abs(a);d=Math.min(f,540)}i(u,n<=0?.01:n,d)}})}}}]);
//# sourceMappingURL=0.208356b9.chunk.js.map