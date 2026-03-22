package com.financeappandroid.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.ui.components.AppButton
import com.financeappandroid.ui.components.AppInput
import com.financeappandroid.ui.theme.*
import kotlinx.coroutines.flow.collectLatest

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.events.collectLatest { event ->
            when (event) {
                is AuthEvent.RegisterSuccess -> onRegisterSuccess()
                else -> {}
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(60.dp))

        Text(
            text = "Criar Conta",
            style = MaterialTheme.typography.headlineLarge,
            color = Foreground
        )

        Text(
            text = "Comece a controlar suas finanças",
            style = MaterialTheme.typography.bodyMedium,
            color = Secondary,
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp)
        )

        if (uiState.error != null) {
            Text(
                text = uiState.error!!,
                color = Danger,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Danger.copy(alpha = 0.1f), MaterialTheme.shapes.small)
                    .padding(12.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        AppInput(
            value = uiState.name,
            onValueChange = viewModel::updateName,
            label = "Nome",
            placeholder = "Seu nome",
            error = uiState.nameError
        )

        Spacer(modifier = Modifier.height(16.dp))

        AppInput(
            value = uiState.email,
            onValueChange = viewModel::updateEmail,
            label = "E-mail",
            placeholder = "seu@email.com",
            error = uiState.emailError,
            keyboardType = KeyboardType.Email
        )

        Spacer(modifier = Modifier.height(16.dp))

        AppInput(
            value = uiState.password,
            onValueChange = viewModel::updatePassword,
            label = "Senha",
            placeholder = "••••••••",
            error = uiState.passwordError,
            isPassword = true,
            keyboardType = KeyboardType.Password
        )

        Spacer(modifier = Modifier.height(24.dp))

        AppButton(
            text = "Criar Conta",
            onClick = viewModel::register,
            isLoading = uiState.isLoading
        )

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Já tem conta? ",
                color = Secondary
            )
            TextButton(onClick = onNavigateToLogin) {
                Text(
                    text = "Entrar",
                    color = Primary
                )
            }
        }
    }
}