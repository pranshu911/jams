import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart3, Link2 } from "lucide-react";
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUp) {
      // Sign In logic
      const { email, password } = formData;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message); // Replace with toast if desired
      } else {
        navigate('/');
      }
    } else {
      // Sign Up logic
      const { name, email, password, confirmPassword } = formData;
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) {
        alert(error.message); // Replace with toast if desired
      } else {
        alert('Sign up successful! Please check your email to confirm your account. You can now log in at https://jams-nu.vercel.app/');
        setIsSignUp(false);
      }
    }
  };

  const benefits = [
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: "Real-Time CRUD",
      description: "Instant create/read/update/delete of applications via PostgreSQL"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Dynamic Data Insights",
      description: "Live charts that adapt as you update your pipeline"
    },
    {
      icon: <Link2 className="w-6 h-6 text-primary" />,
      title: "All-In-One Workflow",
      description: "Store, manage, and analyze every application end-to-end"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col lg:flex-row">
      {/* Left Panel - Hero Content */}
      <div className="w-full flex items-center justify-center p-6 pt-12 lg:pt-0 lg:p-16">
        <div className="max-w-lg w-full space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Welcome to{' '}
              <span className="text-primary">JAMS</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your Job Search, Organized
            </p>
            <p className="text-lg text-muted-foreground/80">
              Real-time tracking, analytics, and insights all in one place.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 rounded-xl bg-card/50 border border-border/30 hover:bg-card/70 transition-all duration-300 hover:shadow-elegant"
              >
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  {benefit.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="flex space-x-4 opacity-20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full flex items-center justify-center p-6 pb-12 lg:pb-0 lg:p-16">
        {/* Flip Card Container */}
        <div className="w-full max-w-md perspective-1000 flex items-center justify-center">
          <div className={`relative w-full h-[550px] transition-transform duration-700 preserve-3d ${isSignUp ? 'rotate-y-180' : ''}`}>
            {/* Sign In Card */}
            <Card className="absolute inset-0 w-full h-full gradient-card border-border/50 shadow-elegant backface-hidden">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to your JAMS account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="mb-2">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
                    >
                      Sign In
                    </Button>
                  </div>
                </form>
                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Don't have an account? Sign Up
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Sign Up Card */}
            <Card className="absolute inset-0 w-full h-full gradient-card border-border/50 shadow-elegant backface-hidden rotate-y-180">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Join JAMS</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create your account to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="md:grid md:grid-cols-2 md:gap-4 space-y-2 md:space-y-0">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="mb-2">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="mb-2">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
                    >
                      Sign Up
                    </Button>
                  </div>
                </form>
                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
