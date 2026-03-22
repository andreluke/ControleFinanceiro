package com.financeappandroid.domain.model

data class User(
    val id: String,
    val name: String,
    val email: String,
    val createdAt: String? = null
)

data class AuthResponse(
    val token: String,
    val refreshToken: String? = null,
    val user: User
)

data class LoginRequest(
    val email: String,
    val password: String,
    val rememberMe: Boolean = false
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)