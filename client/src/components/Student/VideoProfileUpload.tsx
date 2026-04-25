import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { videoProfileAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

const VideoProfileUpload: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<any>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch video status
        const videoRes = await videoProfileAPI.getVideoStatus() as any;
        if (videoRes?.success) {
          setVideoStatus(videoRes.data);
        }
        
        // Fetch credentials
        const credRes = await videoProfileAPI.getMyCredentials() as any;
        if (credRes?.success) {
          setCredentials(credRes.data);
        }
      } catch (err) {
        console.warn('Failed to fetch video data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['.mp4', '.webm', '.mov', '.avi'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      setMessage({ type: 'error', text: 'Only video files (MP4, WebM, MOV, AVI) are allowed' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 50MB' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', file);
      
      const res = await videoProfileAPI.uploadIntroduction(formData) as any;
      if (res?.success) {
        setMessage({ type: 'success', text: 'Video uploaded successfully!' });
        setVideoStatus({
          hasVideo: true,
          videoUrl: res.data.videoUrl,
          uploadedAt: res.data.uploadedAt,
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to upload video' });
    } finally {
      setUploading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    
    try {
      const res = await videoProfileAPI.deleteIntroduction() as any;
      if (res?.success) {
        setMessage({ type: 'success', text: 'Video deleted' });
        setVideoStatus({ hasVideo: false, videoUrl: null, uploadedAt: null });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete video' });
    }
  };

  const handleGenerateCredential = async (type: string) => {
    try {
      const res = await videoProfileAPI.generateCredential(type) as any;
      if (res?.success) {
        setMessage({ type: 'success', text: 'Credential generated!' });
        setCredentials((prev) => [...prev, res.data]);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate credential' });
    }
  };

  const handleVerifyCredential = (credentialId: string) => {
    window.open(`/verify/${credentialId}`, '_blank');
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'student') return <div className="p-4 text-red-600">Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎥 Video Profile & Credentials</h1>
          <p className="mt-2 text-gray-600">Upload video intro and manage blockchain credentials</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Video Introduction Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Video Introduction</h2>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New Feature</span>
          </div>
          
          <p className="text-gray-600 mb-4">
            Upload a 30-60 second video introduction to stand out to recruiters. 
            Show your personality and communication skills!
          </p>

          {videoStatus?.hasVideo ? (
            <div className="space-y-4">
              <video 
                className="w-full rounded-lg" 
                controls 
                src={videoStatus.videoUrl}
              >
                Your browser does not support video playback.
              </video>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(videoStatus.uploadedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete Video
                </button>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Video?</h3>
                      <p className="text-gray-600 mb-4">Are you sure you want to delete your video introduction?</p>
                      <div className="flex space-x-4 justify-end">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500 transition"
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <span className="text-4xl">📹</span>
                  <p className="mt-2 text-gray-600">Click to upload video</p>
                  <p className="text-sm text-gray-400">MP4, WebM, MOV, AVI (max 50MB)</p>
                </>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.webm,.mov,.avi"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Blockchain Credentials Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">🔗 Blockchain Credentials</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Coming Soon</span>
          </div>
          
          <p className="text-gray-600 mb-4">
            Generate verifiable credentials that employers can trust. 
            These are cryptographically secured and can be verified on the blockchain.
          </p>

          {/* Generate Credential Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleGenerateCredential('degree')}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Generate Degree Credential
            </button>
            <button
              onClick={() => handleGenerateCredential('certificate')}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Generate Certificate
            </button>
            <button
              onClick={() => handleGenerateCredential('skill_badge')}
              className="flex-1 py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Generate Skill Badge
            </button>
          </div>

          {/* Credentials List */}
          {credentials.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Your Credentials</h3>
              {credentials.map((cred, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{cred.credentialType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-500">ID: {cred.credentialId}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        cred.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cred.status}
                      </span>
                      <button
                        onClick={() => handleVerifyCredential(cred.credentialId)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl">🔐</span>
              <p className="mt-2 text-gray-500">No credentials yet</p>
              <p className="text-sm text-gray-400">Generate your first credential above</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo implementation. 
              Full blockchain verification is coming soon with Ethereum/Hyperledger integration.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Tips for Video Introduction</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Keep it between 30-60 seconds</li>
            <li>Introduce yourself and your key strengths</li>
            <li>Mention your career goals and what you're looking for</li>
            <li>Ensure good lighting and clear audio</li>
            <li>Dress professionally and look at the camera</li>
            <li>Practice before recording to feel confident</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoProfileUpload;