import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { googleLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse.credential);
      const { token, user } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Reload the page to update auth state
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Google login failed:', error);
      alert(error.response?.data?.message || 'Google login failed. Please try again.');
    }
  };

  const onError = () => {
    console.log('Login Failed');
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            className="w-full flex justify-center items-center px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
            Continue with Google
          </button>
        )}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
