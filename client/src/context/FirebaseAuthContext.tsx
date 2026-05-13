import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Student, College, Recruiter } from '../types';
import axios from 'axios';

const apiBaseUrl = () =>
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  profileData: Student | College | Recruiter | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'college' | 'recruiter';
    collegeCode?: string;
    companyDetails?: any;
    codingProfiles?: {
      leetcode?: { username: string };
      codechef?: { username: string };
      codeforces?: { username: string };
    };
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (profileData: any) => void;
  updateUserProfile: (profileData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<Student | College | Recruiter | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Create user object from Firebase user
  const createUserFromFirebase = useCallback((fbUser: FirebaseUser, role: string = 'student'): User => {
    const nameParts = fbUser.displayName?.split(' ') || ['', ''];
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      role: role as any,
      profile: {
        firstName: nameParts[0] || '',
        lastName: nameParts[1] || '',
        phone: '',
        avatar: fbUser.photoURL || '',
      },
      isVerified: fbUser.emailVerified,
      lastLogin: new Date().toISOString(),
    };
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      try {
        if (firebaseUserData) {
          let jwtToken: string | null = null;

          let userData: any = null;
          let userRole: 'student' | 'college' | 'recruiter' = 'student';
          try {
            const userDocRef = doc(db, 'users', firebaseUserData.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              userData = userDocSnap.data();
              const r = userData.role;
              if (r === 'college' || r === 'recruiter' || r === 'student') {
                userRole = r;
              }
            }
          } catch {
            /* Firestore optional */
          }

           try {
             const response = await axios.post(`${apiBaseUrl()}/auth/firebase-login`, {
               email: firebaseUserData.email,
               firstName:
                 (firebaseUserData.displayName && firebaseUserData.displayName.split(' ')[0]) ||
                 userData?.firstName ||
                 'User',
               lastName:
                 (firebaseUserData.displayName && firebaseUserData.displayName.split(' ').slice(1).join(' ')) ||
                 userData?.lastName ||
                 firebaseUserData.email?.split('@')[0] ||
                 'User',
               photoURL: firebaseUserData.photoURL,
               role: userRole,
             });

            if (response.data.success) {
              const { token } = response.data.data;
              localStorage.setItem('token', token);
              setToken(token);
              jwtToken = token;
            }
          } catch (backendSyncError: any) {
            console.warn('Backend sync failed:', backendSyncError?.message || backendSyncError);
          }

          if (!jwtToken) {
            localStorage.removeItem('token');
            setToken(null);
            try {
              await signOut(auth);
            } catch {
              /* ignore */
            }
            setFirebaseUser(null);
            setUser(null);
            setProfileData(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          setFirebaseUser(firebaseUserData);

          const normalizedUser = createUserFromFirebase(firebaseUserData, userRole);
          setUser(normalizedUser);
          setIsAuthenticated(true);

          // Try to fetch role-specific profile
          if (userData?.role) {
            try {
              const roleCollections: { [key: string]: string } = {
                student: 'students',
                college: 'colleges',
                recruiter: 'recruiters',
              };
              const collectionName = roleCollections[userData.role];
              const profileDocRef = doc(db, collectionName, firebaseUserData.uid);
              const profileSnap = await getDoc(profileDocRef);
              if (profileSnap.exists()) {
                setProfileData(profileSnap.data() as any);
              }
            } catch (error) {
              console.log('Could not fetch profile data:', error);
            }
          }
        } else {
          console.log('User logged out');
          setFirebaseUser(null);
          setUser(null);
          setProfileData(null);
          setToken(null);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [createUserFromFirebase]);

   const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;

      let userRole: 'student' | 'college' | 'recruiter' = 'student';
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const d = snap.data();
          if (d.role === 'college' || d.role === 'recruiter' || d.role === 'student') {
            userRole = d.role;
          }
        }
      } catch {
        /* optional */
      }

       const nameParts = fbUser.displayName?.split(' ') || ['User', ''];
       const firstName = nameParts[0] || 'User';
       const lastName = nameParts[1] || fbUser.email?.split('@')[0] || 'Profile';

       try {
         const response = await axios.post(`${apiBaseUrl()}/auth/firebase-login`, {
           email: fbUser.email,
           firstName: (fbUser.displayName && fbUser.displayName.split(' ')[0]) || firstName,
           lastName: (fbUser.displayName && fbUser.displayName.split(' ').slice(1).join(' ')) || 
                     (fbUser.email?.split('@')[0]) || lastName,
           photoURL: fbUser.photoURL,
           role: userRole,
         });

        if (response.data.success) {
          const { token, user: backendUser, profileData } = response.data.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(backendUser));

          setToken(token);
          setFirebaseUser(fbUser);

          const normalizedUser = createUserFromFirebase(fbUser, backendUser.role);
          setUser(normalizedUser);
          setProfileData(profileData);
          setIsAuthenticated(true);
        } else {
          throw new Error(response.data.message || 'Backend sync failed');
        }
      } catch (backendError: any) {
        await signOut(auth);
        const msg =
          backendError.response?.data?.message ||
          backendError.message ||
          'Could not sign in. Check that the API and database are running.';
        throw new Error(msg);
      }
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = 'Login failed';

      // Map Firebase error codes to user-friendly messages
      if (errorCode === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (errorCode === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('❌ Login error:', errorMessage, error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

   const register = async (userData: {
     email: string;
     password: string;
     firstName: string;
     lastName: string;
     role: 'student' | 'college' | 'recruiter';
     collegeCode?: string;
     companyDetails?: any;
     codingProfiles?: {
       leetcode?: { username: string };
       codechef?: { username: string };
       codeforces?: { username: string };
     };
   }) => {
    try {
      setIsLoading(true);
      console.log('🔐 Registering user:', userData.email, 'as', userData.role);

      // Create Firebase user
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const fbUser = result.user;
      console.log('✅ Firebase user created:', fbUser.uid);

      // Update Firebase user profile
      try {
        await updateFirebaseProfile(fbUser, {
          displayName: `${userData.firstName} ${userData.lastName}`,
        });
        console.log('✅ Firebase profile updated');
      } catch (error) {
        console.warn('⚠️ Could not update profile:', error);
      }

      // Create user document in Firestore
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, {
          uid: fbUser.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          createdAt: new Date().toISOString(),
        });
        console.log('✅ User document created in Firestore');
      } catch (firestoreError: any) {
        console.error('❌ Could not create user document:', firestoreError);
        // Check if it's a permission error
        if (firestoreError.code === 'permission-denied') {
          throw new Error('Database permission denied. Please check Firestore security rules.');
        }
        throw new Error('Failed to create user profile. Please try again.');
      }

      // Create role-specific profile
      try {
        const roleCollections: { [key: string]: string } = {
          student: 'students',
          college: 'colleges',
          recruiter: 'recruiters',
        };

        const collectionName = roleCollections[userData.role];
        const profileDocRef = doc(db, collectionName, fbUser.uid);

        const baseProfile = {
          uid: fbUser.uid,
          email: userData.email,
          createdAt: new Date().toISOString(),
        };

        let profileData: any = baseProfile;

        if (userData.role === 'student') {
          profileData = {
            ...baseProfile,
            firstName: userData.firstName,
            lastName: userData.lastName,
            academicInfo: {
              department: 'Computer Science',
              year: 1,
              semester: 1,
              cgpa: 0,
            },
            skills: [],
            projects: [],
            codingProfiles: {},
          };
        } else if (userData.role === 'college') {
          profileData = {
            ...baseProfile,
            name: `${userData.firstName} ${userData.lastName}`,
            code: userData.collegeCode || '',
          };
        } else if (userData.role === 'recruiter') {
          profileData = {
            ...baseProfile,
            company: userData.companyDetails || { name: '', industry: 'IT' },
            hrName: `${userData.firstName} ${userData.lastName}`,
          };
        }

        await setDoc(profileDocRef, profileData);
        console.log('✅ Role profile created:', userData.role);
      } catch (profileError: any) {
        console.error('❌ Could not create profile:', profileError);
        if (profileError.code === 'permission-denied') {
          throw new Error('No permission to create profile. Please check Firestore security rules.');
        }
        // Don't fail registration if profile creation fails for other reasons
      }

      // Sync with backend MongoDB to create user record and get JWT token
      try {
        const backendPayload: any = {
          email: fbUser.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          photoURL: fbUser.photoURL,
          role: userData.role,
        };
        
        // Add coding profiles if provided (for students)
        if (userData.codingProfiles) {
          backendPayload.codingProfiles = userData.codingProfiles;
        }

        const response = await axios.post(
          `${apiBaseUrl()}/auth/firebase-login`,
          backendPayload
        );

        if (response.data.success) {
          const { token, user: backendUser, profileData } = response.data.data;
          
          // Store backend JWT token (not Firebase token)
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(backendUser));
          
          setToken(token);
          setProfileData(profileData);
          
          console.log('✅ Backend sync successful for new registration');
        } else {
          throw new Error(response.data.message || 'Backend sync failed');
        }
      } catch (backendError: any) {
        console.error('❌ Backend sync failed during registration:', backendError.message);
        // Throw error to alert user about sync failure
        throw new Error(`Registration completed in Firebase but failed to sync with backend: ${backendError.message}`);
      }

      console.log('✅ Registration successful for:', userData.email);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      console.error('❌ Registration error:', errorMessage, error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out');
      await signOut(auth);
      setUser(null);
      setProfileData(null);
      setToken(null);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = (profileData: any) => {
    setProfileData(profileData);
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Sending password reset email for:', email);

      // Send reset email via backend API
      const response = await axios.post(
        `${apiBaseUrl()}/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        console.log('✅ Password reset email sent');
      } else {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      console.error('❌ Forgot password error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Resetting password with token');

      // Reset password via backend API
      const response = await axios.post(
        `${apiBaseUrl()}/auth/reset-password/${token}`,
        { password: newPassword }
      );

      if (response.data.success) {
        console.log('✅ Password reset successful');
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      console.error('❌ Reset password error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = (profileData: any) => {
    setProfileData(profileData);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    profileData,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile: updateUserProfile,
    updateUserProfile: updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
