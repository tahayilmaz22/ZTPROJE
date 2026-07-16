import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerForm from './pages/Customers/CustomerForm';
import AccountList from './pages/Accounts/AccountList';
import AccountForm from './pages/Accounts/AccountForm';
import WorkplaceList from './pages/Workplaces/WorkplaceList';
import WorkplaceForm from './pages/Workplaces/WorkplaceForm';
import TerminalList from './pages/Terminals/TerminalList';
import TerminalForm from './pages/Terminals/TerminalForm';
import LogList from './pages/Logs/LogList';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/customers/:customerId/accounts" element={<AccountList />} />
            <Route path="/customers/:customerId/accounts/new" element={<AccountForm />} />
            <Route path="/customers/:customerId/accounts/:id/edit" element={<AccountForm />} />
            <Route path="/customers/:customerId/workplaces" element={<WorkplaceList />} />
            <Route path="/customers/:customerId/workplaces/new" element={<WorkplaceForm />} />
            <Route path="/customers/:customerId/workplaces/:id/edit" element={<WorkplaceForm />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/workplaces" element={<WorkplaceList />} />
            <Route path="/terminals" element={<TerminalList />} />
            <Route path="/workplaces/:workplaceId/terminals" element={<TerminalList />} />
            <Route path="/workplaces/:workplaceId/terminals/new" element={<TerminalForm />} />
            <Route path="/workplaces/:workplaceId/terminals/:id/edit" element={<TerminalForm />} />
            <Route path="/logs" element={<LogList />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
