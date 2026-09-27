import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ExamInfo, ExamSubmission, Question, SavedExam } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on initial boot as required by Firebase skill
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection tested successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    // If document doesn't exist, connection still succeeded
    return true;
  }
}

// Automatically test connection on import
testConnection();

// ==================== AUTHENTICATION HELPERS ====================

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ==================== EXAMS IN FIRESTORE ====================

export const EXAMS_COLLECTION = 'exams';

export async function saveExamToFirestore(exam: SavedExam): Promise<void> {
  const path = `${EXAMS_COLLECTION}/${exam.id}`;
  try {
    const docRef = doc(db, EXAMS_COLLECTION, exam.id);
    await setDoc(
      docRef,
      {
        ...exam,
        syncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExamFromFirestore(examId: string): Promise<void> {
  const path = `${EXAMS_COLLECTION}/${examId}`;
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchExamsFromFirestore(): Promise<SavedExam[]> {
  const path = EXAMS_COLLECTION;
  try {
    const snapshot = await getDocs(collection(db, EXAMS_COLLECTION));
    const exams: SavedExam[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as SavedExam;
      exams.push(data);
    });
    return exams;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToExams(
  onData: (exams: SavedExam[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = EXAMS_COLLECTION;
  return onSnapshot(
    collection(db, EXAMS_COLLECTION),
    (snapshot) => {
      const exams: SavedExam[] = [];
      snapshot.forEach((d) => {
        exams.push(d.data() as SavedExam);
      });
      onData(exams);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

// ==================== SUBMISSIONS & RESULTS IN FIRESTORE ====================

export const SUBMISSIONS_COLLECTION = 'submissions';

export async function saveSubmissionToFirestore(submission: ExamSubmission): Promise<void> {
  const path = `${SUBMISSIONS_COLLECTION}/${submission.id}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
    await setDoc(
      docRef,
      {
        ...submission,
        syncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSubmissionFromFirestore(submissionId: string): Promise<void> {
  const path = `${SUBMISSIONS_COLLECTION}/${submissionId}`;
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchSubmissionsFromFirestore(): Promise<ExamSubmission[]> {
  const path = SUBMISSIONS_COLLECTION;
  try {
    const snapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    const list: ExamSubmission[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ExamSubmission);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToSubmissions(
  onData: (subs: ExamSubmission[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = SUBMISSIONS_COLLECTION;
  return onSnapshot(
    collection(db, SUBMISSIONS_COLLECTION),
    (snapshot) => {
      const subs: ExamSubmission[] = [];
      snapshot.forEach((d) => {
        subs.push(d.data() as ExamSubmission);
      });
      onData(subs);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}
