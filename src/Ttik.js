import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PartnerRegister from "./pages/partner/PartnerRegister";

function Ttik() {

  return (
    <div className="Ttik">
      <Routes>
        <Route path="/partner" element={ <PartnerRegister /> } />
      </Routes>
    </div>
  );
}

export default Ttik;
