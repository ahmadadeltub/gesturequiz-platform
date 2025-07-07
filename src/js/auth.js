import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase-init.js";

// Sign up function
export async function signUp(email, password, userData = {}) {
    try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ User signed up:', user.uid);
        
        // Wait for authentication state to be properly set
        await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (authUser) => {
                if (authUser && authUser.uid === user.uid) {
                    console.log('✅ Authentication state confirmed');
                    unsubscribe();
                    resolve();
                }
            });
        });
        
        // Create user document in Firestore
        const userDoc = {
            email: user.email,
            uid: user.uid,
            createdAt: serverTimestamp(),
            ...userData
        };
        
        await setDoc(doc(db, 'users', user.uid), userDoc);
        console.log('✅ User document created in Firestore');
        
        return { success: true, user: user, userData: userDoc };
        
    } catch (error) {
        console.error('❌ Sign up error:', error);
        throw error;
    }
}

// Sign in function
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ User signed in:', user.uid);
        return { success: true, user: user };
    } catch (error) {
        console.error('❌ Sign in error:', error);
        throw error;
    }
}

// Sign out function
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('✅ User signed out');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error);
        throw error;
    }
}

// Auth state observer
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Example usage for signup form
export function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = signupForm['signup-email'].value;
            const password = signupForm['signup-password'].value;
            const name = signupForm['signup-name']?.value || '';
            
            try {
                const result = await signUp(email, password, { name: name });
                
                // Clear form
                signupForm.reset();
                
                // Show success message
                console.log('Registration successful!');
                
                // Close modal or redirect
                if (typeof closeSignupModal === 'function') {
                    closeSignupModal();
                }
                
            } catch (error) {
                // Handle specific error cases
                let errorMessage = 'An error occurred during registration.';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'An account with this email already exists.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password should be at least 6 characters.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                } else if (error.message.includes('Permission denied')) {
                    errorMessage = 'Database permission error. Please try again.';
                }
                
                // Display error to user
                const errorElement = signupForm.querySelector('.error');
                if (errorElement) {
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                }
                
                console.error('Registration error:', errorMessage);
            }
        });
    }
}

// Example usage for login form
export function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;
            
            try {
                const result = await signIn(email, password);
                
                // Clear form
                loginForm.reset();
                
                // Show success message
                console.log('Login successful!');
                
                // Close modal or redirect
                if (typeof closeLoginModal === 'function') {
                    closeLoginModal();
                }
                
            } catch (error) {
                // Handle specific error cases
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                }
                
                // Display error to user
                const errorElement = loginForm.querySelector('.error');
                if (errorElement) {
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                }
                
                console.error('Login error:', errorMessage);
            }
        });
    }
}

// Initialize forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSignupForm();
    initializeLoginForm();
});
