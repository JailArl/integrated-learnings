import React, { useEffect, useState } from 'react';
import { Section, Card, Button } from './Components';
import {
  getAllRequests,
  getBidsForRequest,
  approveBid,
  markTestComplete,
} from '../services/platformApi';

interface Request {
  id: string;
  student_name: string;
  student_level: string;
  subjects: string[];
  status: string;
  diagnostic_test_booked: boolean;
  diagnostic_test_completed: boolean;
  created_at: string;
  parent: {
    full_name: string;
    email: string;
  };
}

interface Bid {
  id: string;
  tutor_id: string;
  message: string;
  created_at: string;
  tutor: {
    id: string;
    full_name: string;
    qualification: string;
    experience_years: number;
    verification_status: string;
    questionnaire_answers: any;
  };
  certificates: Array<{
    id: string;
    file_url: string;
    file_name: string;
  }>;
}

export const AdminMatching: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [bids, setBids] = useState<{ [key: string]: Bid[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    const result = await getAllRequests();

    if (result.success && result.data) {
      setRequests(result.data);
    } else {
      setError(result.error || 'Failed to fetch requests');
    }
    setLoading(false);
  };

  const fetchBidsForRequest = async (requestId: string) => {
    if (bids[requestId]) {
      setExpandedRequest(expandedRequest === requestId ? null : requestId);
      return;
    }

    const result = await getBidsForRequest(requestId);
    if (result.success && result.data) {
      setBids((prev) => ({ ...prev, [requestId]: result.data || [] }));
      setExpandedRequest(requestId);
    } else {
      setError(result.error || 'Failed to fetch bids');
    }
  };

  const handleApproveBid = async (requestId: string, tutorId: string) => {
    if (!confirm('Are you sure you want to approve this match?')) return;

    const result = await approveBid(requestId, tutorId);
    if (result.success) {
      setSuccessMessage('Match approved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRequests();
    } else {
      setError(result.error || 'Failed to approve bid');
    }
  };

  const handleMarkTestComplete = async (requestId: string) => {
    if (!confirm('Mark diagnostic test as complete?')) return;

    const result = await markTestComplete(requestId);
    if (result.success) {
      setSuccessMessage('Test marked as complete!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRequests();
    } else {
      setError(result.error || 'Failed to mark test complete');
    }
  };

  const openQuestionnaireModal = (answers: any) => {
    setSelectedQuestionnaire(answers);
    setShowQuestionnaireModal(true);
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">Loading requests...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Bid Review & Matching</h2>
        <p className="text-slate-600">Review tutor bids and approve matches</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <Card title="No Requests">
          <p>No parent requests found.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} title={`Request #${request.id.slice(0, 8)}`}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Parent</p>
                    <p className="font-semibold">{request.parent?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Student</p>
                    <p className="font-semibold">{request.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Level</p>
                    <p className="font-semibold">{request.student_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Subjects</p>
                    <p className="font-semibold">{request.subjects?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="font-semibold capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          request.status === 'matched'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'test_booked'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Diagnostic Test</p>
                    <p className="font-semibold">
                      {request.diagnostic_test_booked ? '✓ Booked' : '✗ Not Booked'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t">
                  {request.status === 'test_booked' && !request.diagnostic_test_completed && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkTestComplete(request.id)}
                      className="text-sm"
                    >
                      Mark Test Complete
                    </Button>
                  )}
                  {request.status !== 'matched' && (
                    <Button
                      variant="primary"
                      onClick={() => fetchBidsForRequest(request.id)}
                      className="text-sm"
                    >
                      {expandedRequest === request.id ? 'Hide Bids' : 'View Bids'}
                    </Button>
                  )}
                </div>

                {expandedRequest === request.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-bold text-lg mb-3">Tutor Bids</h4>
                    {bids[request.id]?.length === 0 ? (
                      <p className="text-slate-500">No bids yet for this request.</p>
                    ) : (
                      <div className="space-y-4">
                        {bids[request.id]?.map((bid) => (
                          <div
                            key={bid.id}
                            className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-sm text-slate-500">Tutor Name</p>
                                <p className="font-semibold">{bid.tutor.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Qualification</p>
                                <p className="font-semibold">{bid.tutor.qualification || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Experience</p>
                                <p className="font-semibold">
                                  {bid.tutor.experience_years || 0} years
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Verification Status</p>
                                <p className="font-semibold capitalize">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      bid.tutor.verification_status === 'verified'
                                        ? 'bg-green-100 text-green-800'
                                        : bid.tutor.verification_status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {bid.tutor.verification_status}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-slate-500 mb-1">Bid Message</p>
                              <p className="text-slate-700 bg-white p-2 rounded border">
                                {bid.message || 'No message provided'}
                              </p>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {bid.tutor.questionnaire_answers && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    openQuestionnaireModal(bid.tutor.questionnaire_answers)
                                  }
                                  className="text-sm"
                                >
                                  View Questionnaire
                                </Button>
                              )}
                              {bid.certificates && bid.certificates.length > 0 && (
                                <div className="flex gap-2">
                                  {bid.certificates.map((cert) => (
                                    <a
                                      key={cert.id}
                                      href={cert.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm px-4 py-2 rounded-lg border-2 border-secondary text-secondary hover:bg-blue-50 transition inline-block"
                                    >
                                      📄 {cert.file_name || 'Certificate'}
                                    </a>
                                  ))}
                                </div>
                              )}
                              <Button
                                variant="primary"
                                onClick={() => handleApproveBid(request.id, bid.tutor.id)}
                                className="text-sm"
                              >
                                Approve Match
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Questionnaire Modal */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-primary mb-4">Questionnaire Answers</h3>
            <div className="space-y-4">
              {selectedQuestionnaire && typeof selectedQuestionnaire === 'object' ? (
                Object.entries(selectedQuestionnaire).map(([key, value]) => (
                  <div key={key} className="border-b pb-3">
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-slate-600">{String(value)}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No questionnaire data available.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowQuestionnaireModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};
