package com.financeappandroid.data.remote.dto

import com.google.gson.annotations.SerializedName

// Auth DTOs
data class LoginRequestDto(
    val email: String,
    val password: String,
    @SerializedName("remember_me") val rememberMe: Boolean = false
)

data class RegisterRequestDto(
    val name: String,
    val email: String,
    val password: String
)

data class AuthResponseDto(
    val token: String,
    @SerializedName("refresh_token") val refreshToken: String? = null,
    val user: UserDto
)

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    @SerializedName("created_at") val createdAt: String? = null
)

data class MessageResponseDto(
    val message: String
)

data class RefreshTokenResponseDto(
    val token: String
)

// Generic error response
data class ErrorResponse(
    val message: String
)