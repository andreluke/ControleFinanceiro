package com.financeappandroid.data.repository

import com.financeappandroid.data.preferences.TokenPreferences
import com.financeappandroid.data.remote.AuthService
import com.financeappandroid.data.remote.dto.LoginRequestDto
import com.financeappandroid.data.remote.dto.RegisterRequestDto
import com.financeappandroid.domain.model.AuthResponse
import com.financeappandroid.domain.model.User
import com.financeappandroid.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authService: AuthService,
    private val tokenPreferences: TokenPreferences
) : AuthRepository {

    private val _isLoggedIn = MutableStateFlow(tokenPreferences.hasToken())
    override fun isLoggedIn(): Flow<Boolean> = _isLoggedIn.asStateFlow()

    private fun mapUser(dto: com.financeappandroid.data.remote.dto.UserDto) = User(
        id = dto.id,
        name = dto.name,
        email = dto.email,
        createdAt = dto.createdAt
    )

    override suspend fun login(email: String, password: String, rememberMe: Boolean): Result<AuthResponse> {
        return try {
            val response = authService.login(LoginRequestDto(email, password, rememberMe))
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenPreferences.saveToken(body.token, rememberMe)
                body.refreshToken?.let { tokenPreferences.saveRefreshToken(it) }
                _isLoggedIn.value = true
                Result.success(AuthResponse(
                    token = body.token,
                    refreshToken = body.refreshToken,
                    user = mapUser(body.user)
                ))
            } else {
                Result.failure(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(name: String, email: String, password: String): Result<AuthResponse> {
        return try {
            val response = authService.register(RegisterRequestDto(name, email, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenPreferences.saveToken(body.token, false)
                body.refreshToken?.let { tokenPreferences.saveRefreshToken(it) }
                _isLoggedIn.value = true
                Result.success(AuthResponse(
                    token = body.token,
                    refreshToken = body.refreshToken,
                    user = mapUser(body.user)
                ))
            } else {
                Result.failure(Exception("Register failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun logout(): Result<Unit> {
        return try {
            authService.logout()
            tokenPreferences.clearToken()
            _isLoggedIn.value = false
            Result.success(Unit)
        } catch (e: Exception) {
            // Still clear token even if API call fails
            tokenPreferences.clearToken()
            _isLoggedIn.value = false
            Result.success(Unit)
        }
    }

    override suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = authService.getMe()
            if (response.isSuccessful) {
                val body = response.body()!!
                Result.success(mapUser(body.user))
            } else {
                Result.failure(Exception("Failed to get user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun refreshToken(): Result<String> {
        return try {
            val response = authService.refreshToken()
            if (response.isSuccessful) {
                val newToken = response.body()?.token
                if (newToken != null) {
                    tokenPreferences.saveToken(newToken, tokenPreferences.getRememberMe())
                    Result.success(newToken)
                } else {
                    Result.failure(Exception("No token in response"))
                }
            } else {
                tokenPreferences.clearToken()
                _isLoggedIn.value = false
                Result.failure(Exception("Token refresh failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}