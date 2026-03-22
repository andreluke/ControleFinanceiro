package com.financeappandroid.data.preferences

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_REMEMBER_ME = "remember_me"
    }

    fun saveToken(token: String, rememberMe: Boolean = false) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putBoolean(KEY_REMEMBER_ME, rememberMe)
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveRefreshToken(refreshToken: String) {
        prefs.edit()
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    fun getRememberMe(): Boolean = prefs.getBoolean(KEY_REMEMBER_ME, false)

    fun clearToken() {
        prefs.edit().clear().apply()
    }

    fun hasToken(): Boolean = !getToken().isNullOrEmpty()
}