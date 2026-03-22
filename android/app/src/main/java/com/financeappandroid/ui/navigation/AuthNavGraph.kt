package com.financeappandroid.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.financeappandroid.ui.screens.auth.LoginScreen
import com.financeappandroid.ui.screens.auth.RegisterScreen

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Main : Screen("main")
}

@Composable
fun AuthNavGraph(
    navController: NavHostController = rememberNavController(),
    onAuthSuccess: () -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                },
                onLoginSuccess = onAuthSuccess
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onRegisterSuccess = onAuthSuccess
            )
        }
    }
}