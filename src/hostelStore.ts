import { useSyncExternalStore } from "react";
export type Room={id:string;block:string;floor:number;number:string;capacity:number;occupied:number;price:number};
export type Tenant={id:string;name:string;email:string;roomId?:string;status:"active"|"pending"|"paid"};
export const DEFAULT_INFO={name:"Unity Hall",address:"North Campus, Accra",phone:"+233 30 000 0000",email:"info@unityhall.edu.gh",about:"A secure, simple student residence managed through one connected platform."};
let state={info:DEFAULT_INFO,blocks:["Block A","Block B"],rooms:[
{id:"A101",block:"Block A",floor:1,number:"101",capacity:4,occupied:2,price:3900},
{id:"A102",block:"Block A",floor:1,number:"102",capacity:4,occupied:4,price:3900},
{id:"A201",block:"Block A",floor:2,number:"201",capacity:3,occupied:1,price:4800},
{id:"B101",block:"Block B",floor:1,number:"101",capacity:2,occupied:0,price:6000}] as Room[],tenants:[
{id:"T001",name:"Kwame Mensah",email:"kwame@example.com",roomId:"A101",status:"active"},
{id:"T002",name:"Ama Owusu",email:"ama@example.com",roomId:"A101",status:"paid"},
{id:"T003",name:"Kojo Asare",email:"kojo@example.com",status:"pending"}] as Tenant[]};
const listeners=new Set<()=>void>(); const subscribe=(f:()=>void)=>{listeners.add(f);return()=>listeners.delete(f)}; const emit=()=>listeners.forEach(f=>f());
export const useHostel=()=>useSyncExternalStore(subscribe,()=>state); export const avail=(r:Room)=>Math.max(0,r.capacity-r.occupied);
export const setTenants=(f:(x:Tenant[])=>Tenant[])=>{state={...state,tenants:f(state.tenants)};emit()};
