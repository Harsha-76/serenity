import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import Sidebar from '../components/Sidebar';
import UserManagement from './UserManagement';
import CommunityModeration from './CommunityModeration';
import Analytics from './Analytics';

interface Stats {
  totalUsers: number;
  totalDiscussions: number;
  totalSupportGroups: number;
  activeUsers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: any;
  wellness_score: number;
  streak: number;
  emailVerified?: boolean;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDiscussions: 0,
    totalSupportGroups: 0,
    activeUsers: 0,
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Load discussions
      const discussionsSnapshot = await getDocs(collection(db, 'community_discussions'));
      
      // Load support groups
      const groupsSnapshot = await getDocs(collection(db, 'support_groups'));

      // Calculate stats
      setStats({
        totalUsers: users.length,
        totalDiscussions: discussionsSnapshot.size,
        totalSupportGroups: groupsSnapshot.size,
        activeUsers: users.filter(u => u.streak > 0).length,
      });

      // Get all users sorted by creation date
      const allUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const allUsersSnapshot = await getDocs(allUsersQuery);
      const allUsersData = allUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setAllUsers(allUsersData);
      setFilteredUsers(allUsersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  if (activeTab === 'users') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <UserManagement users={allUsers} onRefresh={loadDashboardData} />
        </div>
      </div>
    );
  }

  if (activeTab === 'community') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <CommunityModeration />
        </div>
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <Analytics />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto mt-16 lg:mt-0">
        {activeTab === 'dashboard' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Total Users */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Total</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Registered Users</p>
              </div>

              {/* Active Users */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Active</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.activeUsers}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Active Users</p>
              </div>

              {/* Discussions */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Community</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalDiscussions}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Discussions</p>
              </div>

              {/* Support Groups */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Support</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalSupportGroups}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Support Groups</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Recent Users</h2>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <Filter className="h-4 w-4" />
                    <span className="whitespace-nowrap">Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                          </div>
                          <div className="ml-2 sm:ml-3 md:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500">@{user.email.split('@')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {user.createdAt ? (
                          typeof user.createdAt === 'object' && 'toDate' in user.createdAt 
                            ? formatDate(user.createdAt.toDate())
                            : formatDate(user.createdAt)
                        ) : 'N/A'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] sm:text-xs leading-tight sm:leading-5 font-semibold rounded-full ${
                          user.wellness_score > 7 
                            ? 'bg-green-100 text-green-800' 
                            : user.wellness_score > 4 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {user.wellness_score > 7 ? 'Good' : user.wellness_score > 4 ? 'Moderate' : 'Needs Attention'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-1 sm:mr-2 md:mr-4 text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1 rounded hover:bg-purple-50">View</button>
                        <button className="text-red-600 hover:text-red-900 text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <UserManagement 
            users={allUsers} 
            onRefresh={loadDashboardData} 
          />
        )}
        {activeTab === 'community' && <CommunityModeration />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}
