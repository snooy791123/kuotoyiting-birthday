// Atlas side artwork faces LEFT. Positive relative heading points screen RIGHT.
export function facingFor(angle){
 if(Math.abs(angle)>2.35)return {view:2,row:0,mirror:false,name:'back'};
 if(Math.abs(angle)<.78)return {view:0,row:1,mirror:false,name:'front'};
 return {view:1,row:2,mirror:angle>0,name:angle>0?'right':'left'};
}
export function cameraDirection(x,z,yaw){return {x:x*Math.cos(yaw)+z*Math.sin(yaw),z:z*Math.cos(yaw)-x*Math.sin(yaw)};}
