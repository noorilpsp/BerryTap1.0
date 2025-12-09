"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail.length === 0 && showPassword) {
      setShowPassword(false)
    }
  }

  const handleContinue = () => {
    if (!showPassword && email.length > 0) {
      setShowPassword(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showPassword) {
      console.log("[v0] Login attempt with:", { email, password, keepSignedIn })
    } else {
      handleContinue()
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="p-6 sm:p-12 sm:shadow-xl sm:border sm:border-border/40 sm:bg-card sm:rounded-3xl">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ECDC4" />
                    <stop offset="100%" stopColor="#44A8F0" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>

                {[...Array(12)].map((_, i) => {
                  const angle = (i * 15 - 30) * (Math.PI / 180)
                  const radius = 45
                  const x = Number((60 + Math.cos(angle) * radius).toFixed(2))
                  const y = Number((60 + Math.sin(angle) * radius).toFixed(2))
                  return <circle key={`blue-${i}`} cx={x} cy={y} r="2.5" fill="url(#gradient2)" opacity={0.8} />
                })}

                {[...Array(12)].map((_, i) => {
                  const angle = (i * 15 + 105) * (Math.PI / 180)
                  const radius = 45
                  const x = Number((60 + Math.cos(angle) * radius).toFixed(2))
                  const y = Number((60 + Math.sin(angle) * radius).toFixed(2))
                  return <circle key={`orange-${i}`} cx={x} cy={y} r="2.5" fill="url(#gradient1)" opacity={0.8} />
                })}

                {[...Array(12)].map((_, i) => {
                  const angle = (i * 15 + 195) * (Math.PI / 180)
                  const radius = 45
                  const x = Number((60 + Math.cos(angle) * radius).toFixed(2))
                  const y = Number((60 + Math.sin(angle) * radius).toFixed(2))
                  return <circle key={`purple-${i}`} cx={x} cy={y} r="2.5" fill="url(#gradient3)" opacity={0.8} />
                })}
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-foreground">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
              Sign in with BerryTap Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="space-y-0">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className={`w-full h-14 px-4 pr-14 pt-5 pb-1 text-base bg-background border border-border/50 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all text-foreground ${
                    showPassword ? "rounded-t-xl border-b-0" : "rounded-xl"
                  }`}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all pointer-events-none ${
                    emailFocused || email.length > 0
                      ? "top-2 text-xs text-muted-foreground"
                      : "top-1/2 -translate-y-1/2 text-base text-muted-foreground/60"
                  }`}
                >
                  Email or Phone Number
                </label>
                {!showPassword && (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={email.length === 0}
                    size="icon"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-border/30 hover:bg-border/50 text-foreground shadow-sm transition-all flex-shrink-0 ${
                      email.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                    <span className="sr-only">Continue</span>
                  </Button>
                )}
              </div>

              {showPassword && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    id="password"
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    autoFocus
                    className="w-full h-14 px-4 pr-14 pt-5 pb-1 text-base bg-background border border-border/50 border-t-border/30 rounded-b-xl focus:border-blue-500 focus:outline-none focus:ring-0 transition-all text-foreground"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all pointer-events-none ${
                      passwordFocused || password.length > 0
                        ? "top-2 text-xs text-muted-foreground"
                        : "top-1/2 -translate-y-1/2 text-base text-muted-foreground/60"
                    }`}
                  >
                    Password
                  </label>
                  <Button
                    type="submit"
                    disabled={password.length === 0}
                    size="icon"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-border/30 hover:bg-border/50 text-foreground shadow-sm transition-all flex-shrink-0 ${
                      password.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                    <span className="sr-only">Submit</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-2 pt-8">
              <Checkbox
                id="keep-signed-in"
                checked={keepSignedIn}
                onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
                className="border-border/60"
              />
              <label
                htmlFor="keep-signed-in"
                className="text-base font-light text-foreground cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>
          </form>

          <div className="flex flex-col items-center gap-2 pt-6 text-sm">
            <button type="button" className="text-blue-500 hover:text-blue-600 transition-colors font-normal">
              Forgot password? →
            </button>
            <button type="button" className="text-blue-500 hover:text-blue-600 transition-colors font-normal">
              Create Apple Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
