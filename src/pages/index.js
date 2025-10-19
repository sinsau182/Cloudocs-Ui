import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock, Cloud } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EEF5FF] flex items-center justify-center">
              <Cloud className="w-5 h-5 text-[#0B6CFF]" />
            </div>
            <span className="font-bold text-[#0B2340]">ClouDocs</span>
          </div>
          <Button className="bg-[#0B6CFF] hover:bg-[#0B6CFF]/90 text-white" size="sm">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center bg-gradient-to-b from-white to-[#FBFDFF]">
        <div className="max-w-[880px] mx-auto px-6">
          <h1 className="text-[44px] leading-[1.1] font-extrabold text-[#0B1A2B]">
            Your files, safely stored in the cloud
          </h1>
          <p className="mt-4 text-[16px] text-[#6B7280] max-w-[720px] mx-auto">
            CloudBox keeps your files secure, accessible, and organized. Upload, share, and access
            your content from anywhere.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button className="bg-[#0B6CFF] hover:bg-[#0B6CFF]/90 text-white" size="lg">
              Start for Free
            </Button>
            <Button 
            onClick={() => { window.location.href = '/signin'; }}
            variant="outline" className="bg-transparent hover:bg-[#0B6CFF]/90 hover:text-white text-[#0B2340]" size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#F7FAFC] border-y border-[#EEF2F7] py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-lg bg-[#EEF5FF] flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-[#0B6CFF]" />
              </div>
              <h3 className="font-semibold text-[#0B2340]">Secure Storage</h3>
              <p className="mt-2 text-sm text-[#6B7280]">
                Your files are encrypted and protected with enterprise-grade security
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-lg bg-[#EEF5FF] flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-[#0B6CFF]" />
              </div>
              <h3 className="font-semibold text-[#0B2340]">Lightning Fast</h3>
              <p className="mt-2 text-sm text-[#6B7280]">
                Upload and access your files instantly from any device
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-lg bg-[#EEF5FF] flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-[#0B6CFF]" />
              </div>
              <h3 className="font-semibold text-[#0B2340]">Private & Safe</h3>
              <p className="mt-2 text-sm text-[#6B7280]">
                Your data is yours alone. We never access or sell your files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[#6B7280]">
        © 2025 ClouDocs. Your secure file storage solution.
      </footer>
    </div>
  );
}
