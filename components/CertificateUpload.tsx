import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Certificate {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

interface CertificateUploadProps {
  tutorId: string;
  onUploadComplete?: () => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({ tutorId, onUploadComplete }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing certificates
  useEffect(() => {
    loadCertificates();
  }, [tutorId]);

  const loadCertificates = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('tutor_certificates')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (err: any) {
      console.error('Error loading certificates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !supabase) return;

    setUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`${file.name} is not a supported format. Please upload PDF or image files`);
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${tutorId}-cert-${Date.now()}.${fileExt}`;
        const filePath = `certificates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tutor-uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('tutor-uploads')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('tutor_certificates')
          .insert([
            {
              tutor_id: tutorId,
              file_name: file.name,
              file_url: urlData.publicUrl,
              file_type: file.type,
              verification_status: 'pending',
            },
          ]);

        if (dbError) throw dbError;
      }

      // Reload certificates
      await loadCertificates();
      if (onUploadComplete) onUploadComplete();
      
      // Reset file input
      e.target.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteCertificate = async (certId: string, fileUrl: string) => {
    if (!supabase || !confirm('Are you sure you want to delete this certificate?')) return;

    try {
      // Delete from storage
      const filePath = fileUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('tutor-uploads')
          .remove([`certificates/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('tutor_certificates')
        .delete()
        .eq('id', certId);

      if (error) throw error;

      // Reload certificates
      await loadCertificates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading certificates...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <div className="space-y-2">
          <label className="cursor-pointer">
            <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block font-semibold transition">
              {uploading ? 'Uploading...' : 'Upload Certificates'}
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600">
            Upload qualifications, degrees, certifications (PDF or images, max 10MB each)
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Certificates List */}
      {certificates.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Uploaded Certificates ({certificates.length})</h3>
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="text-green-600" size={24} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cert.file_name}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(cert.uploaded_at).toLocaleDateString()}
                  </p>
                  {cert.admin_notes && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      Admin: {cert.admin_notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(cert.verification_status)}
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View
                </a>
                {cert.verification_status === 'pending' && (
                  <button
                    onClick={() => deleteCertificate(cert.id, cert.file_url)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {certificates.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No certificates uploaded yet. Upload your qualifications to get verified!
        </p>
      )}
    </div>
  );
};
