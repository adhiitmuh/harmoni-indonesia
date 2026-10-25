const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp }      = require('firebase-admin/app');
const { getAuth }            = require('firebase-admin/auth');
const { getFirestore }       = require('firebase-admin/firestore');

initializeApp();

async function pastikanOwner(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login diperlukan.');
  const callerSnap = await getFirestore().collection('users').doc(request.auth.uid).get();
  if (!callerSnap.exists || callerSnap.data().role !== 'owner') {
    throw new HttpsError('permission-denied', 'Hanya owner yang bisa melakukan ini.');
  }
}

exports.hapusUser = onCall({ region: 'asia-southeast1' }, async (request) => {
  await pastikanOwner(request);

  const { uid } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'UID tidak boleh kosong.');
  if (uid === request.auth.uid) throw new HttpsError('invalid-argument', 'Tidak bisa menghapus akun sendiri.');

  // Hapus dari Firebase Authentication.
  // Dokumen hasil migrasi lama bisa punya ID yang tidak ada di Auth — lewati saja.
  try {
    await getAuth().deleteUser(uid);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', `Gagal menghapus akun Auth: ${e.message}`);
    }
  }

  // Hapus dokumen Firestore
  await getFirestore().collection('users').doc(uid).delete();

  return { success: true };
});

exports.gantiPasswordUser = onCall({ region: 'asia-southeast1' }, async (request) => {
  await pastikanOwner(request);

  const { uid, password } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'UID tidak boleh kosong.');
  if (uid === request.auth.uid) throw new HttpsError('invalid-argument', 'Untuk akun sendiri, gunakan reset password via email.');
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpsError('invalid-argument', 'Password minimal 6 karakter.');
  }

  try {
    await getAuth().updateUser(uid, { password });
    // Keluarkan sesi lama di perangkat lain agar password lama tidak bisa dipakai lagi
    await getAuth().revokeRefreshTokens(uid);
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'Akun login user ini tidak ditemukan. Hapus lalu buat ulang akunnya.');
    }
    throw new HttpsError('internal', `Gagal mengganti password: ${e.message}`);
  }

  return { success: true };
});
