package com.financeappandroid.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

sealed class MainScreen(val route: String) {
    object Home : MainScreen("home")
    object Transactions : MainScreen("transactions")
    object Recurring : MainScreen("recurring")
    object Goals : MainScreen("goals")
    object Budgets : MainScreen("budgets")
    object Categories : MainScreen("categories")
    object More : MainScreen("more")
    object AddTransaction : MainScreen("add-transaction")
}

@Composable
fun MainNavGraph(
    navController: NavHostController,
    onLogout: () -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = MainScreen.Home.route
    ) {
        composable(MainScreen.Home.route) {
            com.financeappandroid.ui.screens.main.HomeScreen(
                onNavigateToTransactions = {
                    navController.navigate(MainScreen.Transactions.route)
                }
            )
        }
        
        composable(MainScreen.Transactions.route) {
            com.financeappandroid.ui.screens.main.TransactionsScreen()
        }
        
        composable(MainScreen.Recurring.route) {
            com.financeappandroid.ui.screens.main.RecurringScreen()
        }
        
        composable(MainScreen.Goals.route) {
            com.financeappandroid.ui.screens.main.GoalsScreen()
        }
        
        composable(MainScreen.Budgets.route) {
            com.financeappandroid.ui.screens.main.BudgetsScreen()
        }
        
        composable(MainScreen.Categories.route) {
            com.financeappandroid.ui.screens.main.CategoriesScreen()
        }
        
        composable(MainScreen.More.route) {
            com.financeappandroid.ui.screens.main.MoreScreen(onLogout = onLogout)
        }
        
        composable(MainScreen.AddTransaction.route) {
            com.financeappandroid.ui.screens.main.AddTransactionScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}