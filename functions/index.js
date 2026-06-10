const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp }      = require('firebase-admin/app');
const { getAuth }            = require('firebase-admin/auth');
const { getFirestore }       = require('firebase-admin/firestore');

initializeApp();

exports.hapusUserPermanen = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login diperlukan.');

  // Pastikan yang memanggil adalah owner
  const callerSnap = await getFirestore().collection('users').doc(request.auth.uid).get();
  if (!callerSnap.exists || callerSnap.data().role !== 'owner') {
    throw new HttpsError('permission-denied', 'Hanya owner yang bisa menghapus pengguna.');
  }

  const { uid } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'UID tidak boleh kosong.');
  if (uid === request.auth.uid) throw new HttpsError('invalid-argument', 'Tidak bisa menghapus akun sendiri.');

  // Hapus dari Firebase Authentication
  await getAuth().deleteUser(uid);
  // Hapus dokumen Firestore
  await getFirestore().collection('users').doc(uid).delete();

  return { success: true };
});
