import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateToken from './components/CreateToken';
import MintToken from './components/MintToken';
import TransferToken from './components/TransferToken';
import BurnToken from './components/BurnToken';
import DelegateToken from './components/DelegateToken';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/create">Create Token</Link></li>
          <li><Link to="/mint">Mint Token</Link></li>
          <li><Link to="/transfer">Transfer Token</Link></li>
          <li><Link to="/burn">Burn Token</Link></li>
          <li><Link to="/delegate">Delegate Token</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/create" element={<CreateToken />} />
        <Route path="/mint" element={<MintToken />} />
        <Route path="/transfer" element={<TransferToken />} />
        <Route path="/burn" element={<BurnToken />} />
        <Route path="/delegate" element={<DelegateToken />} />
      </Routes>
    </Router>
  );
};

export default App;
