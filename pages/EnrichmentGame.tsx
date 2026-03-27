import React, { useEffect } from 'react';

const EnrichmentGame: React.FC = () => {
  // The game now handles its own access-code auth directly
  useEffect(() => {
    window.location.href = '/games/life-choices.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading game...</p>
      </div>
    </div>
  );
};

export default EnrichmentGame;

const EnrichmentGame: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [viewerLabel, setViewerLabel] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Check student auth first
      const { user, role } = await getCurrentUser();
      if (user && role === 'student') {
        setAuthorized(true);
        setViewerLabel(user.user_metadata?.full_name || user.email || 'Student');
        setLoading(false);
        return;
      }

      // Fallback: allow admin access
      if (isAdminAuthenticated()) {
        setAuthorized(true);
        setIsAdmin(true);
        setViewerLabel('Admin');
        setLoading(false);
        return;
      }

      setLoading(false);
    };
    checkAccess();
  }, []);

  // Build a blob URL from the raw HTML — no public file to leak
  const gameSrc = useMemo(() => {
    if (!authorized) return '';
    const blob = new Blob([gameHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [authorized]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (gameSrc) URL.revokeObjectURL(gameSrc);
    };
  }, [gameSrc]);

  const handleLogout = async () => {
    if (isAdmin) {
      window.location.href = '/admin';
    } else {
      await signOut();
      window.location.href = '/enrichment/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Exclusive Content</h1>
          <p className="text-gray-600 mb-6">
            This game is available only to enrolled enrichment students. Please log in with your student account to play.
          </p>
          <Link
            to="/enrichment/login"
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Student Login
          </Link>
          <Link
            to="/enrichment"
            className="block mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Learn about the Enrichment Program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Game header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? '/admin' : '/enrichment'}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAdmin ? 'Admin Dashboard' : 'Back'}
          </Link>
          <span className="text-sm font-semibold text-gray-700">
            Life Choices — Financial Literacy Game
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              <Shield className="w-3 h-3" />
              Admin Preview
            </span>
          )}
          <span className="text-xs text-gray-500">
            {isAdmin ? 'Viewing as:' : 'Playing as:'} <strong>{viewerLabel}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isAdmin ? 'Back to Admin' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Game iframe — loaded from blob URL, not a public file */}
      <iframe
        src={gameSrc}
        title="Life Choices — Financial Literacy Game"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 48px)' }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

export default EnrichmentGame;
