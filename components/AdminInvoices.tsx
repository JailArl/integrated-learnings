import React, { useEffect, useState } from 'react';
import { Section, Card, Button } from './Components';
import { getMatchesForInvoicing } from '../services/platformApi';

interface Match {
  id: string;
  request_id: string;
  tutor_id: string;
  invoice_generated: boolean;
  invoice_url: string | null;
  created_at: string;
  request: {
    student_name: string;
    diagnostic_test_booked: boolean;
    parent: {
      full_name: string;
    };
  };
  tutor: {
    full_name: string;
    hourly_rate: number;
  };
}

export const AdminInvoices: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedInvoiceUrl, setGeneratedInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    const result = await getMatchesForInvoicing();

    if (result.success && result.data) {
      setMatches(result.data);
    } else {
      setError(result.error || 'Failed to fetch matches');
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async (match: Match) => {
    setGeneratingInvoice(match.id);
    setError(null);
    setSuccessMessage(null);
    setGeneratedInvoiceUrl(null);

    // Invoice generation is not yet implemented
    setError('Invoice generation feature is currently unavailable.');
    setGeneratingInvoice(null);
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">Loading matches...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Invoice Generation</h2>
        <p className="text-slate-600">Generate invoices for approved matches</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold mb-2">{successMessage}</p>
          {generatedInvoiceUrl && (
            <a
              href={generatedInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 underline hover:text-green-900"
            >
              📄 Download Invoice
            </a>
          )}
        </div>
      )}

      {matches.length === 0 ? (
        <Card title="No Pending Invoices">
          <p>All matched cases have invoices generated.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <Card key={match.id} title={`Match #${match.id.slice(0, 8)}`}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Parent Name</p>
                    <p className="font-semibold">
                      {match.request?.parent?.full_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Student Name</p>
                    <p className="font-semibold">
                      {match.request?.student_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tutor Name</p>
                    <p className="font-semibold">{match.tutor?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tutor Hourly Rate</p>
                    <p className="font-semibold">${match.tutor?.hourly_rate || 0}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Diagnostic Test</p>
                    <p className="font-semibold">
                      {match.request?.diagnostic_test_booked ? '✓ Booked ($50)' : '✗ Not Booked'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Match Date</p>
                    <p className="font-semibold">
                      {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Button
                    variant="primary"
                    onClick={() => handleGenerateInvoice(match)}
                    disabled={generatingInvoice === match.id}
                    className="text-sm"
                  >
                    {generatingInvoice === match.id ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};
