import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Gig from './components/Gig';
export default function App(){ return (<BrowserRouter><div className='container'><Routes><Route path='/' element={<Home/>} /><Route path='/gig/:id' element={<Gig/>} /></Routes></div></BrowserRouter>); }
