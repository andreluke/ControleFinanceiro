package com.financeappandroid.data.remote

import com.financeappandroid.data.preferences.TokenPreferences
import com.financeappandroid.util.JwtUtils
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    private val tokenPreferences: TokenPreferences,
    private val authService: AuthService
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenPreferences.getToken()
        
        if (token.isNullOrEmpty()) {
            return chain.proceed(chain.request())
        }

        // Check if token is about to expire, try to refresh proactively
        if (JwtUtils.isTokenExpiringSoon(token, 5)) {
            try {
                val newToken = runBlocking { refreshTokenSync() }
                if (newToken != null) {
                    val newRequest = chain.request().newBuilder()
                        .header("Authorization", "Bearer $newToken")
                        .build()
                    return chain.proceed(newRequest)
                }
            } catch (e: Exception) {
                // Continue with current token if refresh fails
            }
        }

        // Add token to request
        val request = chain.request().newBuilder()
            .header("Authorization", "Bearer $token")
            .build()

        val response = chain.proceed(request)

        // If 401, try to refresh token and retry
        if (response.code == 401) {
            response.close()
            try {
                val newToken = runBlocking { refreshTokenSync() }
                if (newToken != null) {
                    val retryRequest = chain.request().newBuilder()
                        .header("Authorization", "Bearer $newToken")
                        .build()
                    return chain.proceed(retryRequest)
                }
            } catch (e: Exception) {
                // Token refresh failed, clear tokens
                tokenPreferences.clearToken()
            }
        }

        return response
    }

    private suspend fun refreshTokenSync(): String? {
        return try {
            val response = authService.refreshToken()
            if (response.isSuccessful) {
                val newToken = response.body()?.token
                if (newToken != null) {
                    tokenPreferences.saveToken(newToken, tokenPreferences.getRememberMe())
                    newToken
                } else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
}