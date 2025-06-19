'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Script from 'next/script';

export default function PaymentPage() {
  const [session, setSession]   = useState(null);
  const [ready, setReady]       = useState(false);
  const initDone                = useRef(false);

  // 1. Start session
  useEffect(() => {
    (async () => {
      const r = await axios.post('http://localhost:3000/payment/initiateSession');
      setSession(r.data.data.Data);                 // { SessionId, CountryCode }
    })();
  }, []);

  // 2. Init the embedded widget once
  useEffect(() => {
    if (!ready || !session || !window.myfatoorah || initDone.current) return;

    window.myfatoorah.init({
      sessionId:    session.SessionId,
      countryCode:  session.CountryCode,
      currencyCode: 'KWD',
      amount:       100,
      containerId:  'embedded-payment',
      paymentOptions: ['Card'],
      callback: async (resp) => {
        if (!resp.isSuccess) {
          alert('Card data rejected'); return;
        }

        // 3. Ask backend to execute payment
        const ex = await axios.post('http://localhost:3000/payment/execute-payment', {
          sessionId:    session.SessionId,
          invoiceValue: 100
        });

        const url = ex.data?.Data?.PaymentURL;
        if (url) {
          // 4. Redirect user to OTP / 3‑DS page
          window.location.href = url;
        } else {
          alert('Could not obtain Payment URL');
        }
      }
    });

    initDone.current = true;
  }, [ready, session]);

  return (
    <>
      <Script
        src="https://demo.myfatoorah.com/payment/v1/session.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <h2 className="text-xl mb-4">MyFatoorah Payment (Embedded ➜ OTP)</h2>
      <div id="embedded-payment" style={{ minHeight: 300 }} />
    </>
  );
}
