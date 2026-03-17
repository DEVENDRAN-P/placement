import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Student, College, Recruiter } from '../types';
import axios from 'axios';

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
  }) => Promise<void>;
  logout: () => Promise<void>;
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
          console.log('User logged in:', firebaseUserData.email);
          setFirebaseUser(firebaseUserData);
          
          try {
            const idToken = await firebaseUserData.getIdToken();
            setToken(idToken);
            localStorage.setItem('token', idToken);
          } catch (tokenError) {
            console.warn('Could not get ID token:', tokenError);
          }

          // Try to fetch user document from Firestore
          let userData = null;
          let userRole = 'student';
          
          try {
            const userDocRef = doc(db, 'users', firebaseUserData.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              userData = userDocSnap.data();
              userRole = userData.role || 'student';
              console.log('✅ User data fetched from Firestore:', userData);
            } else {
              console.log('⚠️ User document not found in Firestore, defaulting to student');
            }
          } catch (error) {
            console.log('⚠️ Could not fetch user document:', error);
          }

          // Create normalized user object
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
      console.log('🔐 Attempting login for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful for:', email);
      
      try {
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        localStorage.setItem('token', idToken);
        console.log('✅ ID token obtained and stored');
      } catch (tokenError) {
        console.warn('⚠️ Could not set token:', tokenError);
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
  }) => {
    try {
      setIsLoading(true);
      console.log('🔐 Registering user:', userData.email, 'as', userData.role);

      // Create Firebase user
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const fbUser = result.user;
      console.log('✅ Firebase user created:', fbUser.uid);

      // Get ID token immediately
      try {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('token', idToken);
        console.log('✅ ID token obtained and stored');
      } catch (tokenError) {
        console.warn('⚠️ Could not get ID token immediately:', tokenError);
      }

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

      // Wait for auth state listener to process the new user
      await new Promise(resolve => setTimeout(resolve, 100));

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
    updateProfile: updateUserProfile,
    updateUserProfile: updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
