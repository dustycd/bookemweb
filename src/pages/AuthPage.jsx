import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const showToast = (msg) => setToastMessage(msg);

  const validateUsername = (username) => {
    return /^[a-zA-Z0-9]+$/.test(username);
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginEmail) newErrors.loginEmail = "Email is required";
    if (!loginPassword) newErrors.loginPassword = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!regName) newErrors.regName = "Name is required";
    if (!regUsername) {
      newErrors.regUsername = "Username is required";
    } else if (!validateUsername(regUsername)) {
      newErrors.regUsername = "Username can only contain letters and numbers";
    }
    if (!regEmail) newErrors.regEmail = "Email is required";
    if (!regPassword) newErrors.regPassword = "Password is required";
    if (regPassword.length < 6) newErrors.regPassword = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      showToast('Login successful!');
      navigate('/profile');
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    try {
      // First check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', regUsername)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        setErrors({ regUsername: "Username is already taken" });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            username: regUsername
          }
        }
      });

      if (error) throw error;

      showToast('Registration successful! Check your email.');
      setIsLogin(true);
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrors({ forgotEmail: "Email is required for reset" });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (error) throw error;

      showToast(`Password reset email sent to ${forgotEmail}`);
      setForgotEmail('');
      setShowForgot(false);
    } catch (error) {
      showToast(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Join our community today'}</p>
        </div>

        <div className="auth-toggle">
          <button
            onClick={() => { setIsLogin(true); setErrors({}); }}
            className={isLogin ? 'active' : ''}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrors({}); }}
            className={!isLogin ? 'active' : ''}
          >
            Register
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setErrors({ ...errors, regName: '' });
                  }}
                />
                {errors.regName && (
                  <div className="error-message">{errors.regName}</div>
                )}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username (letters and numbers only)"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value.trim());
                    setErrors({ ...errors, regUsername: '' });
                  }}
                />
                {errors.regUsername && (
                  <div className="error-message">{errors.regUsername}</div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={isLogin ? loginEmail : regEmail}
              onChange={(e) => {
                isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value);
                setErrors({ ...errors, [isLogin ? 'loginEmail' : 'regEmail']: '' });
              }}
            />
            {errors[isLogin ? 'loginEmail' : 'regEmail'] && (
              <div className="error-message">
                {errors[isLogin ? 'loginEmail' : 'regEmail']}
              </div>
            )}
          </div>

          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={isLogin ? loginPassword : regPassword}
              onChange={(e) => {
                isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value);
                setErrors({ ...errors, [isLogin ? 'loginPassword' : 'regPassword']: '' });
              }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors[isLogin ? 'loginPassword' : 'regPassword'] && (
              <div className="error-message">
                {errors[isLogin ? 'loginPassword' : 'regPassword']}
              </div>
            )}
          </div>

          {isLogin && (
            <div className="auth-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => setShowForgot(!showForgot)}
              >
                Forgot password?
              </button>
            </div>
          )}

          {showForgot && (
            <div className="reset-password-section">
              <h3>Reset Password</h3>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setErrors({ ...errors, forgotEmail: '' });
                  }}
                />
                {errors.forgotEmail && (
                  <div className="error-message">{errors.forgotEmail}</div>
                )}
              </div>
              <button
                type="button"
                className="submit-button"
                onClick={handleForgotPassword}
              >
                Send Reset Link
              </button>
            </div>
          )}

          <button type="submit" className="submit-button">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;