import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Brain, 
  MessageCircle, 
  FileText,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { formatDateTime } from '../lib/utils';

interface Assessment {
  id: string;
  userId: string;
  userName: string;
  type: string;
  score: number;
  interpretation: string;
  date: any;
  createdAt?: any;
}

interface AIChat {
  id: string;
  userId: string;
  userName: string;
  content: string;
  role: string;
  emotion?: string;
  timestamp: any;
  createdAt?: any;
}

interface JournalEntry {
  id: string;
  userId: string;
  userName: string;
  title: string;
  mood: string;
  createdAt: any;
}

interface Goal {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: string;
  progress: number;
  createdAt: any;
}

export default function Analytics() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [aiChats, setAIChats] = useState<AIChat[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assessments' | 'ai-chats' | 'journals' | 'goals'>('assessments');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      console.log('Loading analytics data from user subcollections...');
      
      // First, get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log('Found users:', usersSnapshot.size);
      
      const allAssessments: Assessment[] = [];
      const allAIChats: AIChat[] = [];
      const allJournals: JournalEntry[] = [];
      const allGoals: Goal[] = [];

      // Loop through each user and get their subcollections
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userName = userData.name || 'Unknown';

        // Load assessments for this user
        try {
          const assessmentsRef = collection(db, 'users', userId, 'assessments');
          const assessmentsSnapshot = await getDocs(assessmentsRef);
          assessmentsSnapshot.docs.forEach(doc => {
            allAssessments.push({
              id: doc.id,
              userId,
              userName,
              ...doc.data()
            } as Assessment);
          });
        } catch (error) {
          console.error(`Error loading assessments for user ${userId}:`, error);
        }

        // Load AI chats for this user
        try {
          const aiChatsRef = collection(db, 'users', userId, 'ai_chats');
          const aiChatsSnapshot = await getDocs(aiChatsRef);
          aiChatsSnapshot.docs.forEach(doc => {
            allAIChats.push({
              id: doc.id,
              userId,
              userName,
              ...doc.data()
            } as AIChat);
          });
        } catch (error) {
          console.error(`Error loading AI chats for user ${userId}:`, error);
        }

        // Load journal entries for this user
        try {
          const journalsRef = collection(db, 'users', userId, 'journal_entries');
          const journalsSnapshot = await getDocs(journalsRef);
          journalsSnapshot.docs.forEach(doc => {
            allJournals.push({
              id: doc.id,
              userId,
              userName,
              ...doc.data()
            } as JournalEntry);
          });
          
          // Also try 'journals' as alternative
          if (journalsSnapshot.empty) {
            const journalsRef2 = collection(db, 'users', userId, 'journals');
            const journalsSnapshot2 = await getDocs(journalsRef2);
            journalsSnapshot2.docs.forEach(doc => {
              allJournals.push({
                id: doc.id,
                userId,
                userName,
                ...doc.data()
              } as JournalEntry);
            });
          }
        } catch (error) {
          console.error(`Error loading journals for user ${userId}:`, error);
        }

        // Load goals for this user
        try {
          const goalsRef = collection(db, 'users', userId, 'goals');
          const goalsSnapshot = await getDocs(goalsRef);
          goalsSnapshot.docs.forEach(doc => {
            allGoals.push({
              id: doc.id,
              userId,
              userName,
              ...doc.data()
            } as Goal);
          });
        } catch (error) {
          console.error(`Error loading goals for user ${userId}:`, error);
        }
      }

      console.log('Assessments loaded:', allAssessments.length);
      console.log('AI Chats loaded:', allAIChats.length);
      console.log('Journals loaded:', allJournals.length);
      console.log('Goals loaded:', allGoals.length);

      setAssessments(allAssessments);
      setAIChats(allAIChats);
      setJournalEntries(allJournals);
      setGoals(allGoals);
      setLoading(false);
      console.log('Analytics data loading complete');
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const avgAssessmentScore = assessments.length > 0
    ? (assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length).toFixed(1)
    : 0;

  const avgGoalProgress = goals.length > 0
    ? (goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length).toFixed(1)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-sm sm:text-base text-gray-600">Comprehensive data from assessments, AI chats, journals, and goals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Assessments</span>
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Score: {avgAssessmentScore}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">AI Conversations</span>
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{aiChats.length}</p>
          <p className="text-xs text-gray-500 mt-1">Recent chats</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Journal Entries</span>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{journalEntries.length}</p>
          <p className="text-xs text-gray-500 mt-1">User reflections</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Goals</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{goals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Progress: {avgGoalProgress}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium transition ${
                activeTab === 'assessments'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Assessments
            </button>
            <button
              onClick={() => setActiveTab('ai-chats')}
              className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium transition ${
                activeTab === 'ai-chats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              AI Chats
            </button>
            <button
              onClick={() => setActiveTab('journals')}
              className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium transition ${
                activeTab === 'journals'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Journals
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium transition ${
                activeTab === 'goals'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Goals
            </button>
          </div>
        </div>

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{assessment.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {assessment.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{assessment.score || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{assessment.interpretation || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {assessment.date ? formatDateTime(assessment.date) : (assessment.createdAt ? formatDateTime(assessment.createdAt) : 'N/A')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Chats Tab */}
        {activeTab === 'ai-chats' && (
          <div className="p-6 space-y-4">
            {aiChats.map((chat) => (
              <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{chat.userName || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {chat.timestamp ? formatDateTime(chat.timestamp) : (chat.createdAt ? formatDateTime(chat.createdAt) : 'N/A')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${
                    chat.role === 'user' ? 'bg-blue-50' : 'bg-purple-50'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      chat.role === 'user' ? 'text-blue-600' : 'text-purple-600'
                    }`}>{chat.role === 'user' ? 'User:' : 'AI Assistant:'}</p>
                    <p className="text-sm text-gray-800">{chat.content}</p>
                    {chat.emotion && (
                      <p className="text-xs text-gray-500 mt-1">Emotion: {chat.emotion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Journals Tab */}
        {activeTab === 'journals' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mood</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {journalEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {entry.mood}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {entry.createdAt ? formatDateTime(entry.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {goals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{goal.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{goal.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {goal.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${goal.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">{goal.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {goal.createdAt ? formatDateTime(goal.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
