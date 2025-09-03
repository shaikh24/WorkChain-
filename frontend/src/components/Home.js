import React, {useEffect, useState} from 'react'; import API from '../services/api'; import { Link } from 'react-router-dom';
export default function Home(){ const [gigs,setGigs]=useState([]); useEffect(()=>{API.get('/gigs').then(r=>setGigs(r.data)).catch(()=>{});},[]); return (<div><h2>Gigs</h2>{gigs.map(g=> (<div key={g._id}><Link to={'/gig/'+g._id}>{g.title}</Link></div>))}</div>); }
