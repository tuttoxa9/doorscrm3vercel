"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase-config"

interface UserData {
  email: string
  displayName?: string
  role: string
}

interface AuthState {
  user: User | null
  userData: UserData | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setState({
              user,
              userData: userDoc.data() as UserData,
              loading: false,
            })
          } else {
            setState({ user, userData: null, loading: false })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setState({ user, userData: null, loading: false })
        }
      } else {
        setState({ user: null, userData: null, loading: false })
      }
    })

    return () => unsubscribe()
  }, [])

  return state
}
