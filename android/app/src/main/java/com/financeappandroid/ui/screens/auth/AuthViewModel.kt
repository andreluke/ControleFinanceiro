package com.financeappandroid.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financeappandroid.domain.model.User
import com.financeappandroid.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    
    // Form fields
    val email: String = "",
    val password: String = "",
    val name: String = "",
    val rememberMe: Boolean = false,
    
    // Validation
    val emailError: String? = null,
    val passwordError: String? = null,
    val nameError: String? = null
)

sealed class AuthEvent {
    object LoginSuccess : AuthEvent()
    object RegisterSuccess : AuthEvent()
    object LogoutSuccess : AuthEvent()
    data class Error(val message: String) : AuthEvent()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<AuthEvent>()
    val events: SharedFlow<AuthEvent> = _events.asSharedFlow()

    init {
        checkLoginStatus()
    }

    private fun checkLoginStatus() {
        viewModelScope.launch {
            authRepository.isLoggedIn().collect { isLoggedIn ->
                _uiState.value = _uiState.value.copy(isLoggedIn = isLoggedIn)
                if (isLoggedIn) {
                    loadCurrentUser()
                }
            }
        }
    }

    private suspend fun loadCurrentUser() {
        val result = authRepository.getCurrentUser()
        result.onSuccess { user ->
            _uiState.value = _uiState.value.copy(user = user)
        }
    }

    fun updateEmail(email: String) {
        _uiState.value = _uiState.value.copy(
            email = email,
            emailError = null,
            error = null
        )
    }

    fun updatePassword(password: String) {
        _uiState.value = _uiState.value.copy(
            password = password,
            passwordError = null,
            error = null
        )
    }

    fun updateName(name: String) {
        _uiState.value = _uiState.value.copy(
            name = name,
            nameError = null,
            error = null
        )
    }

    fun updateRememberMe(rememberMe: Boolean) {
        _uiState.value = _uiState.value.copy(rememberMe = rememberMe)
    }

    fun login() {
        val state = _uiState.value
        
        // Validate
        var hasError = false
        var newState = state
        
        if (!isValidEmail(state.email)) {
            newState = newState.copy(emailError = "Email inválido")
            hasError = true
        }
        
        if (state.password.length < 6) {
            newState = newState.copy(passwordError = "Senha deve ter pelo menos 6 caracteres")
            hasError = true
        }
        
        if (hasError) {
            _uiState.value = newState
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val result = authRepository.login(state.email, state.password, state.rememberMe)
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    user = response.user
                )
                _events.emit(AuthEvent.LoginSuccess)
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Erro ao fazer login"
                )
                _events.emit(AuthEvent.Error(e.message ?: "Erro ao fazer login"))
            }
        }
    }

    fun register() {
        val state = _uiState.value
        
        // Validate
        var hasError = false
        var newState = state
        
        if (state.name.isBlank()) {
            newState = newState.copy(nameError = "Nome é obrigatório")
            hasError = true
        }
        
        if (!isValidEmail(state.email)) {
            newState = newState.copy(emailError = "Email inválido")
            hasError = true
        }
        
        if (state.password.length < 6) {
            newState = newState.copy(passwordError = "Senha deve ter pelo menos 6 caracteres")
            hasError = true
        }
        
        if (hasError) {
            _uiState.value = newState
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val result = authRepository.register(state.name, state.email, state.password)
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    user = response.user
                )
                _events.emit(AuthEvent.RegisterSuccess)
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Erro ao criar conta"
                )
                _events.emit(AuthEvent.Error(e.message ?: "Erro ao criar conta"))
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            authRepository.logout()
            
            _uiState.value = AuthUiState()
            _events.emit(AuthEvent.LogoutSuccess)
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}