package com.financeappandroid.domain.repository

import com.financeappandroid.domain.model.AuthResponse
import com.financeappandroid.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(email: String, password: String, rememberMe: Boolean): Result<AuthResponse>
    suspend fun register(name: String, email: String, password: String): Result<AuthResponse>
    suspend fun logout(): Result<Unit>
    suspend fun getCurrentUser(): Result<User>
    fun isLoggedIn(): Flow<Boolean>
    suspend fun refreshToken(): Result<String>
}