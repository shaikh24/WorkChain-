import React, {useEffect, useState} from 'react'; import { useParams } from 'react-router-dom'; import API from '../services/api';
export default function Gig(){ const { id } = useParams(); const [g, setG] = useState(null);
  useEffect(()=>{ API.get('/gigs').then(r=>{ setG(r.data.find(x=>x._id===id)); }).catch(()=>{}); },[id]);
  const startPiFlow = async ()=>{
    // This demonstrates the recommended flow using Pi SDK and server approve/complete
    // 1) Frontend creates a Pi payment via SDK (client creates payment)
    // 2) SDK calls onReadyForServerApproval(paymentId) -> call server to approve
    // 3) SDK calls onReadyForServerCompletion(paymentId, txid) -> call server to complete
    if(!window.PI) { alert('Pi SDK not loaded.'); return; }
    const amount = 10; // example
    // create Pi payment using SDK - SDK method names may differ; consult Pi docs
    const payment = await window.PI.createPayment({ amount, memo: 'Escrow deposit' }, {
      onReadyForServerApproval: async (paymentId) => {
        // tell server to approve the payment
        await API.post('/payments/' + paymentId + '/approve');
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        // tell server to complete the payment with txid
        await API.post('/payments/' + paymentId + '/complete', { txid });
        alert('Payment completed: ' + txid);
      },
      onCancel: (paymentId) => { alert('Payment cancelled'); },
      onError: (err) => { alert('Payment error'); }
    });
    console.log('payment initiated', payment);
  };
  return (<div><h2>{g?.title || 'Loading'}</h2><button onClick={startPiFlow}>Pay with Pi</button></div>); }
