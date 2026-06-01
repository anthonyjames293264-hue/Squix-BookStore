"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle, User, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  /* ── Profile ── */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  /* ── Password ── */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  /* ── Store ── */
  const [storeName, setStoreName] = useState("Squix Book Store");
  const [storeEmail, setStoreEmail] = useState("hello@Squixbookstore.com");

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    await supabase.from("profiles").update({ full_name: fullName, email }).eq("id", user.id);
    setLoading(false);
    setSaved("profile");
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setSaved("password");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  function handleStoreSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved("store");
  }

  const sections = [
    { key: "profile", label: "Admin Profile", icon: User },
    { key: "password", label: "Change Password", icon: Lock },
    { key: "store", label: "Store Info", icon: Globe },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-serif font-bold text-fg">Settings</h2>
        <p className="text-fg-3 mt-1">Manage your admin account and bookstore configuration.</p>
      </div>

      {/* Admin Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-amber-600" />
            Admin Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="gold" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile
              </Button>
              {saved === "profile" && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-green-600"
                >
                  <CheckCircle className="w-4 h-4" /> Saved!
                </motion.span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4 text-amber-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            {pwError && <p className="text-sm text-red-500">{pwError}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" variant="gold" disabled={loading || !newPassword}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
              {saved === "password" && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-green-600"
                >
                  <CheckCircle className="w-4 h-4" /> Password updated!
                </motion.span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4 text-amber-600" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStoreSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeEmail">Store Contact Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-fg-2">
              Note: To change site-wide content like the store name, update the relevant source files and redeploy.
            </p>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="gold">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              {saved === "store" && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-green-600"
                >
                  <CheckCircle className="w-4 h-4" /> Saved!
                </motion.span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
