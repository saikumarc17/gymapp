import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface StatsData {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  totalClasses: number;
  recentPayments: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  membershipType: string;
  membershipStatus: string;
  joinDate: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalMembers: 0,
    activeMembers: 0,
    totalTrainers: 0,
    totalClasses: 0,
    recentPayments: 0,
  });
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [membersRes, trainersRes, classesRes, paymentsRes] = await Promise.all([
          api.get('/members'),
          api.get('/trainers'),
          api.get('/classes'),
          api.get('/payments')
        ]);

        const activeMembers = membersRes.data.filter(
          (member: Member) => member.membershipStatus === 'Active'
        );

        setStats({
          totalMembers: membersRes.data.length,
          activeMembers: activeMembers.length,
          totalTrainers: trainersRes.data.length,
          totalClasses: classesRes.data.length,
          recentPayments: paymentsRes.data.filter(
            (payment: any) => new Date(payment.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
        });

        setActiveMembers(activeMembers.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentTime = new Date();
  const hours = currentTime.getHours();
  let greeting = 'Good morning';
  
  if (hours >= 12 && hours < 18) {
    greeting = 'Good afternoon';
  } else if (hours >= 18) {
    greeting = 'Good evening';
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">{greeting}, {user?.name}</h1>
          <p className="text-text-light">Here's what's happening at your gym today</p>
        </div>
        <div className="flex gap-3">
          <Link to="/members/add" className="btn btn-primary">
            Add New Member
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Total Members</p>
            <p className="text-2xl font-bold text-secondary">{stats.totalMembers}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-accent/10 rounded-full p-3">
            <Award className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-text-light text-sm">Trainers</p>
            <p className="text-2xl font-bold text-secondary">{stats.totalTrainers}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-secondary/10 rounded-full p-3">
            <Calendar className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Active Classes</p>
            <p className="text-2xl font-bold text-secondary">{stats.totalClasses}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-green-100 rounded-full p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-text-light text-sm">Recent Payments</p>
            <p className="text-2xl font-bold text-secondary">{stats.recentPayments}</p>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Members */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-secondary">Active Members</h2>
            <Link to="/members" className="text-sm text-primary hover:text-primary-dark">View All</Link>
          </div>
          
          <div className="space-y-4">
            {activeMembers.length > 0 ? (
              activeMembers.map((member) => (
                <div key={member.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-text">{member.name}</p>
                      <p className="text-xs text-text-light">{member.membershipType} Membership</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              ))
            ) : (
              <p className="text-text-light text-center py-4">No active members found</p>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary mb-6">Quick Insights</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-text">Membership Growth</p>
                <p className="text-sm text-text-light">12% increase in new sign-ups this month</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-text">Peak Hours</p>
                <p className="text-sm text-text-light">Highest gym attendance between 5-7 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-text">Expiring Memberships</p>
                <p className="text-sm text-text-light">3 memberships are due to expire this week</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-md">
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text">Equipment Status</p>
                <p className="text-sm text-text-light">All equipment functioning properly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;