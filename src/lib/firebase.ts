import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase apenas se não foi inicializado ainda
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Função para obter auth de forma lazy
export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') {
    // No servidor, retorna null para evitar erros durante o build
    return null
  }
  return getAuth(app)
}

export const auth = getFirebaseAuth()

export default app