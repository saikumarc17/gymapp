import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DollarSign, Search, Filter, ArrowDown, ArrowUp } from 'lucide-react';
import api from '../services/api';

interface Payment {
  id: number;
  memberId: number;
  amount: number;
  date: string;
  type: string;
  status: string;
  method: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
}

interface SortConfig {
  key: keyof Payment | null;
  direction: 'asc' | 'desc';
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, statusFilter]);

  const fetchPaymentsData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, membersRes] = await Promise.all([
        api.get('/payments'),
        api.get('/members')
      ]);
      
      setPayments(paymentsRes.data);
      setMembers(membersRes.data);
      setFilteredPayments(sortItems(paymentsRes.data, sortConfig));
    } catch (error) {
      console.error('Error fetching payments data:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...payments];
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(payment => payment.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => {
        const member = members.find(m => m.id === payment.memberId);
        return (
          member?.name.toLowerCase().includes(term) ||
          member?.email.toLowerCase().includes(term) ||
          payment.amount.toString().includes(term) ||
          payment.method.toLowerCase().includes(term)
        );
      });
    }
    
    setFilteredPayments(sortItems(result, sortConfig));
  };

  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const getMemberEmail = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.email : 'Unknown Email';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const sortItems = (items: Payment[], { key, direction }: SortConfig) => {
    if (!key) return items;
    
    return [...items].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const requestSort = (key: keyof Payment) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    setFilteredPayments(sortItems(filteredPayments, newConfig));
  };

  const getSortIcon = (key: keyof Payment) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1" /> 
      : <ArrowDown size={14} className="ml-1" />;
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Payments</h1>
        <p className="text-text-light">Track membership payments and subscriptions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-light" />
          </div>
          <input
            type="text"
            placeholder="Search payments by member name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        
        <div className="sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-text-light" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="bg-green-100 rounded-full p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-text-light text-sm">Total Amount</p>
            <p className="text-xl font-bold text-secondary">{formatCurrency(getTotalAmount())}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Total Payments</p>
            <p className="text-xl font-bold text-secondary">{filteredPayments.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-secondary/10 rounded-full p-3">
            <DollarSign className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Avg. Payment</p>
            <p className="text-xl font-bold text-secondary">
              {filteredPayments.length > 0 
                ? formatCurrency(getTotalAmount() / filteredPayments.length) 
                : '$0.00'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('memberId')}
                >
                  <div className="flex items-center">
                    Member
                    {getSortIcon('memberId')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('method')}
                >
                  <div className="flex items-center">
                    Method
                    {getSortIcon('method')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-light">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-light">No payments found</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text">{getMemberName(payment.memberId)}</div>
                      <div className="text-sm text-text-light">{getMemberEmail(payment.memberId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-text">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        payment.status === 'Paid' 
                          ? 'badge-success' 
                          : payment.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-error'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;