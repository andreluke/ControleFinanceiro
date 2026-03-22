package com.financeappandroid.util

import android.util.Base64
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName

data class JWTPayload(
    @SerializedName("sub") val sub: String,
    @SerializedName("email") val email: String,
    @SerializedName("iat") val iat: Long,
    @SerializedName("exp") val exp: Long
)

object JwtUtils {
    private val gson = Gson()

    fun decode(token: String): JWTPayload? {
        return try {
            val parts = token.split(".")
            if (parts.size != 3) return null
            
            val payload = parts[1]
            val decoded = String(Base64.decode(payload, Base64.URL_SAFE))
            gson.fromJson(decoded, JWTPayload::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun isTokenExpiringSoon(token: String, minutesThreshold: Int = 5): Boolean {
        val payload = decode(token) ?: return true
        
        val now = System.currentTimeMillis() / 1000
        val timeUntilExpiry = payload.exp - now
        val thresholdSeconds = minutesThreshold * 60L
        
        return timeUntilExpiry <= thresholdSeconds
    }

    fun getExpiryDate(token: String): Long? {
        return decode(token)?.exp
    }

    fun isTokenExpired(token: String): Boolean {
        val payload = decode(token) ?: return true
        val now = System.currentTimeMillis() / 1000
        return payload.exp < now
    }
}