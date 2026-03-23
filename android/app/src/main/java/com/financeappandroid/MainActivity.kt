package com.financeappandroid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material3.Icon
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.financeappandroid.ui.components.AppButton
import com.financeappandroid.ui.components.AppInput
import com.financeappandroid.ui.navigation.MainNavigation
import com.financeappandroid.ui.screens.auth.AuthEvent
import com.financeappandroid.ui.screens.auth.AuthViewModel
import com.financeappandroid.ui.theme.*
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Background)
            ) {
                FinanceAppContent()
            }
        }
    }
}

@Composable
fun FinanceAppContent() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable("login") {
            LoginScreenStyled(
                onNavigateToRegister = { navController.navigate("register") },
                onLoginSuccess = { navController.navigate("main") }
            )
        }
        
        composable("register") {
            RegisterScreenStyled(
                onNavigateToLogin = { navController.popBackStack() },
                onRegisterSuccess = { navController.navigate("main") }
            )
        }
        
        composable("main") {
            MainNavigation(
                onLogout = {
                    // Handle logout
                }
            )
        }
    }
}

@Composable
fun LoginScreenStyled(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit
) {
    val viewModel: AuthViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.events.collectLatest { event ->
            when (event) {
                is AuthEvent.LoginSuccess -> onLoginSuccess()
                else -> {}
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp)
            .padding(top = 80.dp, bottom = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Hero Section
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(Primary.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.AccountBalanceWallet,
                contentDescription = null,
                tint = Primary,
                modifier = Modifier.size(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "FinanceApp",
            style = MaterialTheme.typography.headlineMedium,
            color = Foreground
        )

        Text(
            text = "Controle suas finanças com facilidade",
            style = MaterialTheme.typography.bodyMedium,
            color = Secondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = MaterialTheme.shapes.large
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Bem-vindo de volta",
                    style = MaterialTheme.typography.titleLarge,
                    color = Foreground
                )

                Text(
                    text = "Entre na sua conta para continuar",
                    style = MaterialTheme.typography.bodySmall,
                    color = Secondary,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

                if (uiState.error != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Danger.copy(alpha = 0.15f), MaterialTheme.shapes.medium)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = null,
                            tint = Danger,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = uiState.error!!,
                            color = Danger,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                AppInput(
                    value = uiState.email,
                    onValueChange = viewModel::updateEmail,
                    label = "E-mail",
                    placeholder = "seu@email.com",
                    error = uiState.emailError,
                    keyboardType = KeyboardType.Email,
                    leadingIcon = Icons.Filled.Mail
                )

                Spacer(modifier = Modifier.height(16.dp))

                AppInput(
                    value = uiState.password,
                    onValueChange = viewModel::updatePassword,
                    label = "Senha",
                    placeholder = "••••••••",
                    error = uiState.passwordError,
                    isPassword = true,
                    keyboardType = KeyboardType.Password,
                    leadingIcon = Icons.Filled.Lock
                )

                Spacer(modifier = Modifier.height(24.dp))

                AppButton(
                    text = "Entrar",
                    onClick = viewModel::login,
                    isLoading = uiState.isLoading
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Não tem conta? ",
                        color = Secondary,
                        style = MaterialTheme.typography.bodySmall
                    )
                    TextButton(onClick = onNavigateToRegister) {
                        Text(
                            text = "Criar conta",
                            color = Primary,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Ao continuar, você concorda com nossos Termos de Serviço",
            style = MaterialTheme.typography.bodySmall,
            color = Muted,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun RegisterScreenStyled(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    val viewModel: AuthViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsState()
    var confirmPassword by remember { mutableStateOf("") }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(confirmPassword, uiState.password) {
        confirmPasswordError = if (confirmPassword.isNotEmpty() && confirmPassword != uiState.password) {
            "Senhas não conferem"
        } else null
    }

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
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp)
            .padding(top = 80.dp, bottom = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Hero Section
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(Success.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.PersonAdd,
                contentDescription = null,
                tint = Success,
                modifier = Modifier.size(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Criar Conta",
            style = MaterialTheme.typography.headlineMedium,
            color = Foreground
        )

        Text(
            text = "Junte-se a milhares de usuários",
            style = MaterialTheme.typography.bodyMedium,
            color = Secondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Card),
            shape = MaterialTheme.shapes.large
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Novo usuário",
                    style = MaterialTheme.typography.titleLarge,
                    color = Foreground
                )

                Text(
                    text = "Preencha seus dados para começar",
                    style = MaterialTheme.typography.bodySmall,
                    color = Secondary,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

                if (uiState.error != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Danger.copy(alpha = 0.15f), MaterialTheme.shapes.medium)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = null,
                            tint = Danger,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = uiState.error!!,
                            color = Danger,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                AppInput(
                    value = uiState.name,
                    onValueChange = viewModel::updateName,
                    label = "Nome completo",
                    placeholder = "Seu nome",
                    error = uiState.nameError,
                    leadingIcon = Icons.Filled.Person
                )

                Spacer(modifier = Modifier.height(16.dp))

                AppInput(
                    value = uiState.email,
                    onValueChange = viewModel::updateEmail,
                    label = "E-mail",
                    placeholder = "seu@email.com",
                    error = uiState.emailError,
                    keyboardType = KeyboardType.Email,
                    leadingIcon = Icons.Filled.Mail
                )

                Spacer(modifier = Modifier.height(16.dp))

                AppInput(
                    value = uiState.password,
                    onValueChange = viewModel::updatePassword,
                    label = "Senha",
                    placeholder = "••••••••",
                    error = uiState.passwordError,
                    isPassword = true,
                    keyboardType = KeyboardType.Password,
                    leadingIcon = Icons.Filled.Lock
                )

                Spacer(modifier = Modifier.height(16.dp))

                AppInput(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = "Confirmar senha",
                    placeholder = "••••••••",
                    isPassword = true,
                    keyboardType = KeyboardType.Password,
                    error = confirmPasswordError,
                    leadingIcon = Icons.Filled.Lock
                )

                Spacer(modifier = Modifier.height(24.dp))

                AppButton(
                    text = "Criar Conta",
                    onClick = {
                        if (confirmPassword == uiState.password) {
                            viewModel.register()
                        }
                    },
                    isLoading = uiState.isLoading,
                    enabled = confirmPassword.isNotEmpty() && confirmPassword == uiState.password
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Já tem conta? ",
                        color = Secondary,
                        style = MaterialTheme.typography.bodySmall
                    )
                    TextButton(onClick = onNavigateToLogin) {
                        Text(
                            text = "Entrar",
                            color = Primary,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Ao continuar, você concorda com nossos Termos de Serviço",
            style = MaterialTheme.typography.bodySmall,
            color = Muted,
            textAlign = TextAlign.Center
        )
    }
}