// Atlas side artwork faces LEFT. Positive relative heading points screen RIGHT.
export function facingFor(angle){
 if(Math.abs(angle)>2.35)return {view:2,row:0,mirror:false,name:'back'};
 if(Math.abs(angle)<.78)return {view:0,row:1,mirror:false,name:'front'};
 return {view:1,row:2,mirror:angle>0,name:angle>0?'right':'left'};
}
export function cameraDirection(x,z,yaw){return {x:x*Math.cos(yaw)+z*Math.sin(yaw),z:z*Math.cos(yaw)-x*Math.sin(yaw)};}

export const damp=(value,target,rate,dt)=>target+(value-target)*Math.exp(-rate*dt);
export const wrappedAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function advanceVelocity(v,x,z,dt){
 const rate=(x||z)?10:15;
 v.x=damp(v.x,x,rate,dt);v.y=damp(v.y,z,rate,dt);
 if(Math.hypot(v.x,v.y)<.015&&!x&&!z){v.x=0;v.y=0;}
 return v;
}
export function arrivalSpeed(distance){return Math.min(3,Math.max(0,(distance-2.15)*2.5));}
export function stableFacing(angle,previous){
 const f=facingFor(angle),a=Math.abs(angle);
 if(previous?.name==='back'&&a>2.23)return previous;
 if(previous?.name==='front'&&a<.90)return previous;
 return f;
}
