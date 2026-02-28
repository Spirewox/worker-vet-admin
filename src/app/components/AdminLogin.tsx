import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Shield, Lock } from 'lucide-react';
import { axiosPost } from '../lib/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      const result = await axiosPost('auth/admin/login',{email, password}, true)
      login(result.user);
      navigate('/admin');
    } catch (error) {
      if (error instanceof Error)
      setError(error.message);
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-blue-100 shadow-xl shadow-blue-50">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Portal</CardTitle>
          <CardDescription>
            Secure access for Workervet administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="admin@workervet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700">
              <Lock className="w-4 h-4 mr-2" /> Access Dashboard
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter className="flex justify-center border-t border-slate-50 pt-4">
          <Button variant="link" className="text-slate-400" onClick={() => navigate('/login')}>
            Return to Candidate Login
          </Button>
        </CardFooter> */}
      </Card>
    </div>
  );
};
