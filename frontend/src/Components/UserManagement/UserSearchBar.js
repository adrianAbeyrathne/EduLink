import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Mail, Calendar, Shield, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom hook for debouncing
function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const UserSearchBar = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      setUsers([]);
      setShowResults(false);
      return;
    }

    // Cancel previous request if still running
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    fetchUsers(1); // Always start from page 1 for new search

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const fetchUsers = async (pageNum = 1) => {
    if (!debouncedQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?search=${encodeURIComponent(debouncedQuery)}&page=${pageNum}&limit=10`,
        { 
          signal: abortRef.current?.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setUsers(data.users || []);
        } else {
          setUsers(prev => [...prev, ...(data.users || [])]);
        }
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setHasMore(data.hasMore || false);
        setPage(pageNum);
        setShowResults(true);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
        toast.error('Search failed: ' + err.message);
        setUsers([]);
        setShowResults(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(page + 1);
    }
  };

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    // Clear search and hide results
    setQuery('');
    setUsers([]);
    setShowResults(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'tutor':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
      case 'inactive':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Inactive</span>;
      case 'suspended':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Suspended</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          placeholder="Search users by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-gray-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              No users found matching "{debouncedQuery}"
            </div>
          ) : (
            <>
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="text-sm text-gray-600">
                  Found {total} user{total !== 1 ? 's' : ''} matching "{debouncedQuery}"
                </div>
              </div>
              
              {users.map((user) => (
                <div
                  key={user._id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRoleIcon(user.role)}
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </h3>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Age: {user.age}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Joined: {formatDate(user.createdAt)}
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center">
                              <Activity className="w-3 h-3 mr-1" />
                              Last: {formatDate(user.lastLogin)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="p-3 text-center border-t border-gray-200">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : `Load more (${total - users.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default UserSearchBar;