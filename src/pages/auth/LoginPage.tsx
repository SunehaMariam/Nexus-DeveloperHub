// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

// ✅ Helper: password strength check
const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  if (strength === 0) return { label: "Too weak", color: "text-red-600" };
  if (strength === 1) return { label: "Weak", color: "text-red-500" };
  if (strength === 2) return { label: "Fair", color: "text-yellow-500" };
  if (strength === 3) return { label: "Strong", color: "text-green-500" };
  return { label: "Very Strong", color: "text-green-700" };
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ New state for multi-step login
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [otp, setOtp] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic input validation
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    // ✅ Mock step: ask for OTP instead of logging in directly
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (otp !== "123456") {
        throw new Error("Invalid OTP code (hint: use 123456)");
      }

      // Simulate backend login
      await login(email, password, role);

      // ✅ Redirect based on user role (Investor vs Entrepreneur dashboard)
      navigate(role === "entrepreneur" ? "/dashboard/entrepreneur" : "/dashboard/investor");
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  // Demo creds
  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Business Nexus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with investors and entrepreneurs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ✅ Step 1: Login */}
          {step === "login" && (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'entrepreneur'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('entrepreneur')}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>

                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'investor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('investor')}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                {/* ✅ Password strength meter */}
                {password && (
                  <p className={`text-sm mt-1 ${strength.color}`}>
                    Strength: {strength.label}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<LogIn size={18} />}
              >
                Continue
              </Button>
            </form>
          )}

          {/* ✅ Step 2: OTP */}
          {/* ✅ Step 2: OTP */}
{step === "otp" && (
  <form className="space-y-6" onSubmit={handleOtpSubmit}>
    <div className="text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary-600" />
      <h3 className="mt-2 text-lg font-semibold text-gray-900">
        Two-Step Verification
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Enter the <span className="font-medium text-primary-600">6-digit code</span> we sent to your email
      </p>
    </div>

    {/* ✅ OTP input boxes instead of single field */}
    <div className="flex justify-center gap-2">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            if (val && e.target.nextSibling instanceof HTMLInputElement) {
              e.target.nextSibling.focus();
            }
            const otpArr = otp.split("");
            otpArr[i] = val;
            setOtp(otpArr.join(""));
          }}
        />
      ))}
    </div>

    <Button
      type="submit"
      fullWidth
      isLoading={isLoading}
      leftIcon={<ShieldCheck size={18} />}
    >
      Verify & Sign In
    </Button>

    {/* Resend option */}
    <p className="text-sm text-center text-gray-500">
      Didn’t get the code?{" "}
      <button
        type="button"
        onClick={() => alert("Resent OTP: 123456")}
        className="text-primary-600 hover:underline"
      >
        Resend OTP
      </button>
    </p>
  </form>
)}


          {/* Demo accounts */}
          {step === "login" && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => fillDemoCredentials('entrepreneur')}
                  leftIcon={<Building2 size={16} />}
                >
                  Entrepreneur Demo
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fillDemoCredentials('investor')}
                  leftIcon={<CircleDollarSign size={16} />}
                >
                  Investor Demo
                </Button>
              </div>
            </div>
          )}

          {/* Signup link */}
          {step === "login" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 export default LoginPage;