import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  MessageSquare, 
  Users, 
  Trash2, 
  Eye,
  AlertCircle,
  Heart,
  Calendar,
  Hash
} from 'lucide-react';
import { formatDateTime } from '../lib/utils';

interface Discussion {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: any;
  messageCount?: number;
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  memberCount: number;
  createdAt: any;
  isAnonymous: boolean;
}

export default function CommunityModeration() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions');
  const [selectedItem, setSelectedItem] = useState<Discussion | SupportGroup | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      // Load discussions
      const discussionsQuery = query(
        collection(db, 'community_discussions'),
        orderBy('createdAt', 'desc')
      );
      const discussionsSnapshot = await getDocs(discussionsQuery);
      const discussionsData = discussionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Discussion[];

      // Load support groups
      const groupsSnapshot = await getDocs(collection(db, 'support_groups'));
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportGroup[];

      setDiscussions(discussionsData);
      setSupportGroups(groupsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading community data:', error);
      setLoading(false);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      try {
        await deleteDoc(doc(db, 'community_discussions', id));
        setDiscussions(discussions.filter(d => d.id !== id));
        alert('Discussion deleted successfully');
      } catch (error) {
        console.error('Error deleting discussion:', error);
        alert('Failed to delete discussion');
      }
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this support group?')) {
      try {
        await deleteDoc(doc(db, 'support_groups', id));
        setSupportGroups(supportGroups.filter(g => g.id !== id));
        alert('Support group deleted successfully');
      } catch (error) {
        console.error('Error deleting support group:', error);
        alert('Failed to delete support group');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Community Moderation</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor and manage community discussions and support groups</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Discussions</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{discussions.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Support Groups</span>
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{supportGroups.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Members</span>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {supportGroups.reduce((sum, g) => sum + (g.memberCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'discussions'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Discussions ({discussions.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'groups'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Support Groups ({supportGroups.length})
            </button>
          </div>
        </div>

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div className="p-6">
            {discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <div key={discussion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{discussion.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            {discussion.category}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {discussion.createdAt ? formatDateTime(discussion.createdAt) : 'N/A'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {discussion.messageCount || 0} messages
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedItem(discussion)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No discussions found</p>
              </div>
            )}
          </div>
        )}

        {/* Support Groups Tab */}
        {activeTab === 'groups' && (
          <div className="p-6">
            {supportGroups.length > 0 ? (
              <div className="space-y-4">
                {supportGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                          {group.isAnonymous && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            {group.category}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.memberCount || 0} members
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {group.createdAt ? formatDateTime(group.createdAt) : 'N/A'}
                          </span>
                        </div>
                        {group.tags && group.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {group.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedItem(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No support groups found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {'title' in selectedItem ? 'Discussion Details' : 'Group Details'}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
