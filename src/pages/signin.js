import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "@/store/slices/authSlice";
import { toast } from "sonner";

const AuthUI = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace("signin-", "").replace("signup-", "")]: value,
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      sessionStorage.setItem('token', result.token);
      toast.success('Successfully signed in!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      sessionStorage.setItem('token', result.token);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#0B6CFF] rounded-2xl flex items-center justify-center">
              <Cloud className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ClouDocs</h1>
          <p className="text-gray-500">Your secure file storage solution</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-[#0B6CFF] data-[state=active]:text-white text-black"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-[#0B6CFF] data-[state=active]:text-white text-black"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In UI */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#0B6CFF] text-white hover:bg-[#0B6CFF]/90"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up UI */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#0B6CFF] text-white hover:bg-[#0B6CFF]/90"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthUI;